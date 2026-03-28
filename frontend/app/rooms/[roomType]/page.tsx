"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import {
  BedDouble,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  KeyRound,
  Ruler,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { extractIdDataFromImage } from "@/lib/id-extractor";
import { cn } from "@/lib/utils";
import type {
  AuthResponse,
  ReservationResponse,
  RoomAvailabilityResponse,
  RoomTypeDetails,
} from "@/lib/types";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 transition-all duration-200">
      <label className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500/90">
        <span>
          {label}
          {required && <span className="ml-1 text-rose-500 font-black animate-pulse">*</span>}
        </span>
        {error && <span className="text-[10px] lowercase text-rose-500 font-medium">! {error}</span>}
      </label>
      <div className={cn(
        "relative rounded-2xl transition-all duration-300",
        error ? "ring-2 ring-rose-100/50" : "focus-within:ring-4 focus-within:ring-sky-100/30"
      )}>
        {children}
      </div>
    </div>
  );
}

const contactNoPattern = /^\+?[0-9]{7,15}$/;
const fallbackRoomImageUrl = "https://placehold.co/1400x900/e2e8f0/475569?text=Ocean+View+Suite";

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string, subtitle?: string }) {
  return (
    <div className="mb-6 space-y-1">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100/50">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-slate-500 ml-10 leading-relaxed font-medium">{subtitle}</p>}
    </div>
  );
}

function parseIsoDate(value: string) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(start: string, end: string) {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  if (!startDate || !endDate) {
    return 0;
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor(diffMs / dayMs);
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function RoomDetailPage() {
  const params = useParams();
  const roomType = String(params.roomType ?? "").toUpperCase();

  const [room, setRoom] = useState<RoomTypeDetails | null>(null);
  const [availability, setAvailability] = useState<RoomAvailabilityResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isExtractingId, setIsExtractingId] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarDraftRange, setCalendarDraftRange] = useState<DateRange | undefined>(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [form, setForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    guestName: "",
    contactNo: "",
    address: "",
    idNumber: "",
    adults: 1,
    children: 0,
    arrivalTime: "15:00",
    specialRequest: "",
    promoCode: "",
    acceptPolicy: false,
  });

  const [account, setAccount] = useState({ username: "", email: "", password: "" });

  const todayDate = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const selectedDateRange = useMemo<DateRange | undefined>(() => {
    const checkIn = parseIsoDate(form.checkInDate);
    if (!checkIn) {
      return undefined;
    }

    const checkOut = parseIsoDate(form.checkOutDate);
    return {
      from: checkIn,
      to: checkOut ?? undefined,
    };
  }, [form.checkInDate, form.checkOutDate]);

  const nights = useMemo(
    () => Math.max(daysBetween(form.checkInDate, form.checkOutDate), 0),
    [form.checkInDate, form.checkOutDate]
  );

  const guestCount = form.adults + form.children;

  const dateValidationError = useMemo(() => {
    if (!form.checkInDate || !form.checkOutDate) {
      return null;
    }

    if (form.checkInDate < getTodayIso()) {
      return "Check-in date cannot be in the past.";
    }

    if (form.checkOutDate <= form.checkInDate) {
      return "Check-out date must be after check-in date.";
    }

    return null;
  }, [form.checkInDate, form.checkOutDate]);

  const occupancyError = useMemo(() => {
    if (!room) {
      return null;
    }

    if (guestCount < 1) {
      return "At least one guest is required.";
    }

    if (guestCount > room.maxGuests) {
      return `This room supports up to ${room.maxGuests} guests.`;
    }

    return null;
  }, [guestCount, room]);

  const pricing = useMemo(() => {
    if (!room || nights <= 0) {
      return {
        base: 0,
        serviceFee: 0,
        taxes: 0,
        total: 0,
      };
    }

    const base = room.ratePerNight * nights;
    const serviceFee = Math.round(base * 0.08);
    const taxes = Math.round(base * 0.12);
    const total = base + serviceFee + taxes;

    return { base, serviceFee, taxes, total };
  }, [room, nights]);

  useEffect(() => {
    if (!roomType) return;
    let active = true;
    api
      .get<RoomTypeDetails>(`/api/rooms/${roomType}`)
      .then((data) => {
        if (!active) return;
        setRoom(data);
        setSelectedImageIndex(0);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load room details");
      });
    return () => {
      active = false;
    };
  }, [roomType]);

  const checkAvailability = async (showInlineError = true) => {
    if (!form.checkInDate || !form.checkOutDate) {
      if (showInlineError) {
        setBookingError("Select check-in and check-out dates.");
      }
      return null;
    }

    if (dateValidationError) {
      if (showInlineError) {
        setBookingError(dateValidationError);
      }
      return null;
    }

    setIsChecking(true);
    if (showInlineError) {
      setBookingError(null);
    }

    try {
      const data = await api.get<RoomAvailabilityResponse>(
        `/api/rooms/${roomType}/availability?checkIn=${form.checkInDate}&checkOut=${form.checkOutDate}`
      );
      setAvailability(data);
      return data;
    } catch (err) {
      if (showInlineError) {
        setBookingError(err instanceof Error ? err.message : "Failed to check availability");
      }
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    let active = true;
    const shouldCheck = !!form.checkInDate && !!form.checkOutDate && !dateValidationError;

    if (!shouldCheck) {
      setAvailability(null);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsChecking(true);
      try {
        const result = await api.get<RoomAvailabilityResponse>(
          `/api/rooms/${roomType}/availability?checkIn=${form.checkInDate}&checkOut=${form.checkOutDate}`
        );
        if (active) {
          setAvailability(result);
        }
      } catch {
        if (active) {
          setAvailability(null);
        }
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [form.checkInDate, form.checkOutDate, dateValidationError, roomType]);

  const ensureCustomerLogin = async () => {
    const token = getToken();
    if (token) return;
    if (!account.username || !account.email || !account.password) {
      throw new Error("Create a customer account to continue.");
    }
    const response = await api.post<AuthResponse>("/api/auth/register", account);
    setToken(response.token);
  };

  const handleBooking = async () => {
    setIsBooking(true);
    setBookingError(null);

    try {
      if (!form.checkInDate) {
        throw new Error("Check-in date is required.");
      }
      if (!form.checkOutDate) {
        throw new Error("Check-out date is required.");
      }
      if (!form.guestName || !form.guestName.trim()) {
        throw new Error("Guest name is required.");
      }
      if (!form.contactNo || !form.contactNo.trim()) {
        throw new Error("Contact number is required.");
      }
      if (!form.address || !form.address.trim()) {
        throw new Error("Address is required.");
      }
      if (!form.arrivalTime) {
        throw new Error("Approximate arrival time is required.");
      }

      if (dateValidationError) {
        throw new Error(dateValidationError);
      }

      if (occupancyError) {
        throw new Error(occupancyError);
      }

      if (!contactNoPattern.test(form.contactNo)) {
        throw new Error("Enter a valid contact number (7-15 digits, optional +).");
      }

      if (!form.acceptPolicy) {
        throw new Error("Please accept the booking and cancellation policy.");
      }

      await ensureCustomerLogin();

      if (!form.idNumber || !form.idNumber.trim()) {
        throw new Error("ID Number is required.");
      }

      const latest = await checkAvailability(true);
      if (!latest?.available) {
        throw new Error("No availability for selected dates.");
      }

      const reservation = await api.post<ReservationResponse>("/api/my/reservations", {
        guestName: form.guestName,
        address: form.address,
        contactNo: form.contactNo,
        roomType,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
      });

      window.location.href = `/my-reservations/${reservation.reservationNo}`;
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to create reservation");
    } finally {
      setIsBooking(false);
    }
  };

  const applyScannedIdData = (rawValue: string) => {
    const normalized = rawValue.trim();
    if (!normalized) {
      return;
    }

    const parts = normalized.split(/[|,]/).map((part) => part.trim()).filter(Boolean);

    if (parts.length >= 2) {
      setForm((previous) => ({
        ...previous,
        idNumber: parts[0],
        guestName: parts.slice(1).join(" "),
      }));
      setBookingError(null);
      return;
    }

    setForm((previous) => ({ ...previous, idNumber: normalized }));
    setBookingError(null);
  };

  const uploadIdImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Clear input so same file can be uploaded again
    event.target.value = "";

    setIsExtractingId(true);
    setBookingError(null);
    
    try {
      const data = await extractIdDataFromImage(file);
      
      if (!data.idNumber && !data.fullName && !data.address) {
        setBookingError("No readable information found in the ID image. Please try another photo.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        idNumber: data.idNumber || prev.idNumber,
        guestName: data.fullName || prev.guestName,
        address: data.address || prev.address,
      }));
      
      if (!data.idNumber) {
        setBookingError("ID number not detected, but name/address were updated.");
      }
    } catch (err) {
      console.error("ID extraction failed:", err);
      setBookingError("Extraction failed. Please enter details manually.");
    } finally {
      setIsExtractingId(false);
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    const fromDate = range?.from;
    if (!fromDate) {
      setForm((previous) => ({
        ...previous,
        checkInDate: "",
        checkOutDate: "",
      }));
      setAvailability(null);
      return;
    }

    setForm((previous) => ({
      ...previous,
      checkInDate: toIsoDate(fromDate),
      checkOutDate: range.to ? toIsoDate(range.to) : "",
    }));
  };

  const openCalendarModal = () => {
    setCalendarDraftRange(selectedDateRange);
    setIsCalendarModalOpen(true);
  };

  const applyCalendarSelection = () => {
    if (!calendarDraftRange?.from || !calendarDraftRange?.to) {
      setBookingError("Please select both check-in and check-out dates.");
      return;
    }

    setBookingError(null);
    handleDateRangeSelect(calendarDraftRange);
    setIsCalendarModalOpen(false);
  };

  const mainImage = room?.imageUrls[selectedImageIndex] ?? room?.imageUrls[0];

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <Button asChild variant="ghost" size="sm" className="text-sky-700 hover:text-sky-900">
          <Link href="/rooms" className="inline-flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to rooms
          </Link>
        </Button>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : null}

        {room ? (
          <div className="space-y-10">
            <header className="space-y-2">
              <span className="ocean-pill">{room.roomType}</span>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">{room.name}</h1>
              <p className="text-slate-600">{room.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Free cancellation up to 48 hours
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                  <Clock3 className="h-3.5 w-3.5" />
                  Check-in from 3:00 PM
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Instant confirmation
                </span>
              </div>
            </header>

            <section className="space-y-3">
              <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white/70 shadow-sm">
                <img
                  src={mainImage}
                  alt={room.name}
                  className="h-[420px] w-full object-cover transition-transform duration-500 hover:scale-105 lg:h-[500px]"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src !== fallbackRoomImageUrl) {
                      target.src = fallbackRoomImageUrl;
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {room.imageUrls.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    className={`overflow-hidden rounded-2xl border transition ${
                      selectedImageIndex === index
                        ? "border-sky-400 ring-2 ring-sky-200"
                        : "border-slate-200 hover:border-sky-300"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={url}
                      alt={`${room.name} preview ${index + 1}`}
                      className="h-24 w-full object-cover"
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (target.src !== fallbackRoomImageUrl) {
                          target.src = fallbackRoomImageUrl;
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-6 lg:order-1">
                <div className="card-ocean rounded-2xl p-6 space-y-5">
                  <h2 className="text-lg font-bold text-slate-900">Room highlights</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { Icon: BedDouble, label: "Bed type", value: room.bedType },
                      { Icon: Ruler, label: "Room size", value: `${room.sizeSqm} sqm` },
                      { Icon: Users, label: "Max guests", value: `Up to ${room.maxGuests}` },
                      { Icon: Building2, label: "Inventory", value: `${room.totalRooms} rooms` },
                    ].map((spec) => (
                      <div key={spec.label} className="rounded-xl bg-sky-50 p-3 border border-sky-100">
                        <spec.Icon className="h-5 w-5 text-sky-700" />
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{spec.label}</p>
                        <p className="text-sm font-medium text-slate-900">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="card-ocean rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Amenities</h3>
                    <ul className="space-y-2">
                      {room.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check className="h-4 w-4 text-emerald-600" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card-ocean rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Facilities</h3>
                    <ul className="space-y-2">
                      {room.facilities.map((facility) => (
                        <li key={facility} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check className="h-4 w-4 text-sky-700" />
                          {facility}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="card-ocean rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">Booking summary</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 border border-sky-100">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Live quote
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 space-y-2 text-sm text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>{formatCurrency(room.ratePerNight)} x {nights || 0} night(s)</span>
                        <span className="font-medium text-slate-900">{formatCurrency(pricing.base)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Service fee (8%)</span>
                        <span>{formatCurrency(pricing.serviceFee)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Taxes (12%)</span>
                        <span>{formatCurrency(pricing.taxes)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-base font-bold text-slate-900">
                        <span>Total</span>
                        <span>{formatCurrency(pricing.total)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-600">
                      <p className="font-semibold uppercase tracking-wide text-slate-500">Your stay</p>
                      <p>
                        {form.checkInDate || "--"} to {form.checkOutDate || "--"}
                      </p>
                      <p>
                        {guestCount} guest(s), arrival around {form.arrivalTime || "--"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky top-24 h-fit lg:order-2">
                <div className="ocean-surface rounded-[40px] p-8 space-y-8 relative overflow-hidden ring-1 ring-sky-100/40">
                  <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
                    <Sparkles className="h-24 w-24 text-sky-400" />
                  </div>
                  
                  <div className="relative space-y-1.5 border-b border-sky-100/50 pb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reserve Room</h2>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">Secure your stay at Ocean View in few clicks.</p>
                  </div>

                  <div className="space-y-8">
                    {/* Date Picker Group */}
                    <div className="rounded-[32px] bg-white/80 p-6 border border-sky-50 shadow-sm transition-all hover:shadow-md hover:border-sky-100 group">
                      <SectionTitle 
                        icon={CalendarDays} 
                        title="Dates" 
                        subtitle="Pick start date, then end date from the calendar." 
                      />
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Check-in" required>
                          <input
                            className="ocean-input cursor-pointer hover:bg-sky-50/20"
                            placeholder="Select date"
                            value={form.checkInDate}
                            readOnly
                            onClick={openCalendarModal}
                          />
                        </Field>
                        <Field label="Check-out" required>
                          <input
                            className="ocean-input cursor-pointer hover:bg-sky-50/20"
                            placeholder="Select date"
                            value={form.checkOutDate}
                            readOnly
                            onClick={openCalendarModal}
                          />
                        </Field>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-6 rounded-2xl bg-white border-sky-200 hover:bg-sky-50 text-sky-700 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
                          onClick={openCalendarModal}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          View Calendar
                        </Button>
                        
                        {(form.checkInDate || form.checkOutDate) && (
                          <button
                            type="button"
                            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                            onClick={() => {
                              handleDateRangeSelect(undefined);
                              setCalendarDraftRange(undefined);
                            }}
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Guests Group */}
                    <div className="rounded-[32px] bg-white/80 p-6 border border-sky-50 shadow-sm transition-all hover:shadow-md hover:border-sky-100">
                      <SectionTitle 
                        icon={Users} 
                        title="Occupancy" 
                        subtitle={`Max ${room.maxGuests} guests allowed.`}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Adults">
                          <select
                            className="ocean-input"
                            value={form.adults}
                            onChange={(event) =>
                              setForm((previous) => ({ ...previous, adults: Number(event.target.value) }))
                            }
                          >
                            {Array.from({ length: Math.max(room.maxGuests, 1) }, (_, index) => index + 1).map((value) => (
                              <option key={value} value={value}>
                                {value} Person{value > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Children">
                          <select
                            className="ocean-input"
                            value={form.children}
                            onChange={(event) =>
                              setForm((previous) => ({ ...previous, children: Number(event.target.value) }))
                            }
                          >
                            {Array.from({ length: Math.max(room.maxGuests, 1) }, (_, index) => index).map((value) => (
                              <option key={value} value={value}>
                                {value} Child{value !== 1 ? 'ren' : ''}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </div>

                    {/* Guest Details Group */}
                    <div className="rounded-[32px] bg-white/80 p-6 border border-sky-50 shadow-sm transition-all hover:shadow-md hover:border-sky-100">
                      <SectionTitle 
                        icon={UserCog} 
                        title="Guest Info" 
                        subtitle="Complete guest details for check-in." 
                      />
                      <div className="grid gap-5">
                        <Field label="Full Name" required>
                          <input
                            className="ocean-input"
                            placeholder="John Doe"
                            value={form.guestName}
                            onChange={(event) =>
                              setForm((previous) => ({ ...previous, guestName: event.target.value }))
                            }
                          />
                        </Field>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Arrival" required>
                            <input
                              type="time"
                              className="ocean-input"
                              value={form.arrivalTime}
                              onChange={(event) =>
                                setForm((previous) => ({ ...previous, arrivalTime: event.target.value }))
                              }
                            />
                          </Field>
                          <Field label="Contact" required>
                            <input
                              className="ocean-input"
                              placeholder="+94"
                              value={form.contactNo}
                              onChange={(event) =>
                                setForm((previous) => ({ ...previous, contactNo: event.target.value }))
                              }
                            />
                          </Field>
                        </div>

                        <Field label="Permanent Address" required>
                          <input
                            className="ocean-input"
                            placeholder="Your home address"
                            value={form.address}
                            onChange={(event) =>
                              setForm((previous) => ({ ...previous, address: event.target.value }))
                            }
                          />
                        </Field>
                        
                        <Field label="ID Number" required>
                          <div className="relative group">
                            <input
                              className="ocean-input pr-12"
                              placeholder="NIC / Passport"
                              value={form.idNumber}
                              onChange={(event) =>
                                setForm((previous) => ({ ...previous, idNumber: event.target.value }))
                              }
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-40 group-focus-within:opacity-100 transition-opacity">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            </div>
                          </div>
                        </Field>

                        <div className="flex flex-col gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or scan</span>
                            <div className="h-px flex-1 bg-slate-100" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="rounded-2xl border-dashed border-sky-300 bg-sky-50/30 text-sky-700 font-bold text-[11px] hover:bg-sky-50" 
                              onClick={() => {
                                const scanInput = window.prompt("Scan/paste ID data. Use format: ID_NUMBER|FULL_NAME");
                                if (scanInput) {
                                  const normalized = scanInput.trim();
                                  const parts = normalized.split(/[|,]/).map((part) => part.trim()).filter(Boolean);
                                  if (parts.length >= 2) {
                                    setForm((previous) => ({
                                      ...previous,
                                      idNumber: parts[0],
                                      guestName: parts.slice(1).join(" "),
                                    }));
                                  } else {
                                    setForm((previous) => ({ ...previous, idNumber: normalized }));
                                  }
                                  setBookingError(null);
                                }
                              }}
                            >
                              Scan Text
                            </Button>
                            <label className="relative cursor-pointer">
                              <div className="flex h-9 items-center justify-center rounded-2xl border border-dashed border-sky-300 bg-emerald-50/30 px-3 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                                {isExtractingId ? "Detecting..." : "Upload ID"}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={uploadIdImage}
                                disabled={isExtractingId}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Creation Section */}
                    {!getToken() ? (
                      <div className="rounded-[32px] bg-sky-600 p-8 shadow-xl shadow-sky-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 transition-transform group-hover:scale-110">
                          <KeyRound className="h-20 w-20 text-white" />
                        </div>
                        
                        <div className="relative space-y-6">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white tracking-tight">Create Account</h3>
                            <p className="text-sky-100/90 text-[11px] font-medium leading-relaxed">Required to track your reservation and earn rewards.</p>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-200/90 ml-1">Username</label>
                              <input
                                className="w-full h-11 rounded-2xl bg-white/10 border border-white/20 px-4 text-sm font-medium text-white placeholder:text-sky-200/50 focus:bg-white/20 focus:outline-none transition-all"
                                placeholder="Choose a handle"
                                value={account.username}
                                onChange={(event) =>
                                  setAccount((previous) => ({ ...previous, username: event.target.value }))
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-200/90 ml-1">Email Address</label>
                              <input
                                className="w-full h-11 rounded-2xl bg-white/10 border border-white/20 px-4 text-sm font-medium text-white placeholder:text-sky-200/50 focus:bg-white/20 focus:outline-none transition-all"
                                type="email"
                                placeholder="name@example.com"
                                value={account.email}
                                onChange={(event) =>
                                  setAccount((previous) => ({ ...previous, email: event.target.value }))
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-200/90 ml-1">Password</label>
                              <input
                                className="w-full h-11 rounded-2xl bg-white/10 border border-white/20 px-4 text-sm font-medium text-white placeholder:text-sky-200/50 focus:bg-white/20 focus:outline-none transition-all"
                                type="password"
                                placeholder="••••••••"
                                value={account.password}
                                onChange={(event) =>
                                  setAccount((previous) => ({ ...previous, password: event.target.value }))
                                }
                              />
                            </div>
                          </div>

                          <div className="pt-2">
                             <p className="text-[11px] text-sky-100/70 font-medium text-center">
                              Joined already? {" "}
                              <Link href="/login" className="text-white font-bold underline underline-offset-4 decoration-sky-300">
                                Sign in here
                              </Link>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Preferences & Policy */}
                    <div className="rounded-[32px] bg-slate-50/50 p-6 space-y-6 border border-slate-100">
                      <div className="space-y-5">
                        <Field label="Special Requests" >
                          <textarea
                            className="ocean-input min-h-[100px] py-3 resize-none"
                            placeholder="Dietary needs? Quiet floor? Bed preference? Tell us here..."
                            value={form.specialRequest}
                            onChange={(event) =>
                              setForm((previous) => ({ ...previous, specialRequest: event.target.value }))
                            }
                          />
                        </Field>

                        <label className="flex items-start gap-4 cursor-pointer group select-none">
                          <div className="relative mt-1">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={form.acceptPolicy}
                              onChange={(event) =>
                                setForm((previous) => ({ ...previous, acceptPolicy: event.target.checked }))
                              }
                            />
                            <div className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white transition-all peer-checked:border-sky-600 peer-checked:bg-sky-600 group-hover:border-sky-400" />
                            <Check className="absolute left-1 top-1 h-3 w-3 text-white transition-opacity opacity-0 peer-checked:opacity-100" />
                          </div>
                          <span className="text-xs font-medium leading-relaxed text-slate-600">
                            I verify that details are correct and I accept the resort's{" "}
                            <span className="text-sky-700 font-bold hover:underline">booking and cancellation policy.</span>
                          </span>
                        </label>
                      </div>

                      {/* Status / Errors */}
                      <div className="space-y-3">
                        {availability && (
                          <div
                            className={`animate-in fade-in slide-in-from-top-2 rounded-2xl px-5 py-4 border transition-all duration-300 ${
                              availability.available
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-100/50"
                                : "bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-100/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${availability.available ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                {availability.available ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                              </div>
                              <span className="text-[13px] font-bold tracking-tight">
                                {availability.available
                                  ? `${availability.availableRooms} Instant rooms available.`
                                  : "Fully booked for these dates."}
                              </span>
                            </div>
                          </div>
                        )}

                        {(dateValidationError || occupancyError || bookingError) && (
                          <div className="animate-in fade-in slide-in-from-top-1 flex gap-3 rounded-2xl bg-rose-50 p-4 border border-rose-100">
                             <div className="p-1.5 rounded-lg h-fit bg-rose-100/50 text-rose-600">
                               <X className="h-4 w-4" />
                             </div>
                             <p className="text-[13px] font-bold text-rose-800 leading-tight py-1">
                               {dateValidationError || occupancyError || bookingError}
                             </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        <Button 
                          onClick={handleBooking} 
                          disabled={isBooking}
                          size="lg"
                          className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-base shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-slate-800 active:translate-y-0 disabled:opacity-50"
                        >
                          {isBooking ? (
                            <div className="flex items-center gap-2">
                               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                               <span>Confirming...</span>
                            </div>
                          ) : (
                            "Confirm Reservation"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </div>
        ) : null}
      </main>

      {isCalendarModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="booking-calendar w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Select your stay dates</h3>
                <p className="text-xs text-slate-500">Choose check-in first, then check-out.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCalendarModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <DayPicker
              mode="range"
              selected={calendarDraftRange}
              onSelect={setCalendarDraftRange}
              disabled={{ before: todayDate }}
              showOutsideDays
              className="booking-daypicker"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCalendarDraftRange(undefined)}>
                Clear selection
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCalendarModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={applyCalendarSelection}>
                  Apply dates
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
}
