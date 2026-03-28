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
import { extractIdNumberFromImage } from "@/lib/id-extractor";
import type {
  AuthResponse,
  ReservationResponse,
  RoomAvailabilityResponse,
  RoomTypeDetails,
} from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}

const contactNoPattern = /^\+?[0-9]{7,15}$/;
const fallbackRoomImageUrl = "https://placehold.co/1400x900/e2e8f0/475569?text=Ocean+View+Suite";

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
      if (!form.checkInDate || !form.checkOutDate || !form.guestName || !form.contactNo || !form.address) {
        throw new Error("Complete all required booking fields.");
      }

      if (dateValidationError) {
        throw new Error(dateValidationError);
      }

      if (occupancyError) {
        throw new Error(occupancyError);
      }

      if (!contactNoPattern.test(form.contactNo)) {
        throw new Error("Enter a valid contact number.");
      }

      if (!form.acceptPolicy) {
        throw new Error("Please accept the booking and cancellation policy.");
      }

      await ensureCustomerLogin();

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

  const scanIdCard = () => {
    const scanInput = window.prompt("Scan/paste ID data. Use format: ID_NUMBER|FULL_NAME");
    if (!scanInput) {
      return;
    }
    applyScannedIdData(scanInput);
  };

  const uploadIdImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsExtractingId(true);
    try {
      const extractedId = await extractIdNumberFromImage(file);
      if (!extractedId) {
        setBookingError("No ID number detected in uploaded image.");
        return;
      }

      setForm((previous) => ({ ...previous, idNumber: extractedId }));
      setBookingError(null);
    } catch {
      setBookingError("Failed to extract ID number from image");
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

            <section className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
              <div className="sticky top-24 h-fit lg:order-2">
                <div className="ocean-surface rounded-3xl p-6 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Complete your booking</h2>
                    <p className="text-sm text-slate-600">Real-time availability and instant confirmation.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2 rounded-2xl border border-sky-100 bg-white/80 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Check-in">
                          <input
                            className="ocean-input"
                            placeholder="yyyy-mm-dd"
                            value={form.checkInDate}
                            readOnly
                            onClick={openCalendarModal}
                          />
                        </Field>
                        <Field label="Check-out">
                          <input
                            className="ocean-input"
                            placeholder="yyyy-mm-dd"
                            value={form.checkOutDate}
                            readOnly
                            onClick={openCalendarModal}
                          />
                        </Field>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500">Pick start date, then end date from the calendar.</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-5 whitespace-nowrap shrink-0"
                          onClick={openCalendarModal}
                        >
                          <CalendarDays className="mr-1.5 h-4 w-4" />
                          Open calendar
                        </Button>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleDateRangeSelect(undefined);
                            setCalendarDraftRange(undefined);
                          }}
                        >
                          Clear dates
                        </Button>
                      </div>
                    </div>
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
                            {value}
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
                            {value}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Guest name">
                      <input
                        className="ocean-input"
                        placeholder="Full name"
                        value={form.guestName}
                        onChange={(event) =>
                          setForm((previous) => ({ ...previous, guestName: event.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Contact number">
                      <input
                        className="ocean-input"
                        placeholder="+94771234567"
                        value={form.contactNo}
                        onChange={(event) =>
                          setForm((previous) => ({ ...previous, contactNo: event.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Arrival time">
                      <input
                        type="time"
                        className="ocean-input"
                        value={form.arrivalTime}
                        onChange={(event) =>
                          setForm((previous) => ({ ...previous, arrivalTime: event.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Promo code (optional)">
                      <input
                        className="ocean-input"
                        placeholder="SUMMER26"
                        value={form.promoCode}
                        onChange={(event) =>
                          setForm((previous) => ({ ...previous, promoCode: event.target.value.toUpperCase() }))
                        }
                      />
                    </Field>
                    <Field label="Address" >
                      <input
                        className="ocean-input md:col-span-2"
                        placeholder="Your address"
                        value={form.address}
                        onChange={(event) =>
                          setForm((previous) => ({ ...previous, address: event.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Special requests" >
                      <input
                        className="ocean-input"
                        placeholder="High floor, quiet corner, baby cot..."
                        value={form.specialRequest}
                        onChange={(event) =>
                          setForm((previous) => ({ ...previous, specialRequest: event.target.value }))
                        }
                      />
                    </Field>
                    <Field label="ID Number (optional)">
                      <input
                        className="ocean-input"
                        placeholder="NIC / Passport number"
                        value={form.idNumber}
                        onChange={(event) =>
                          setForm((previous) => ({ ...previous, idNumber: event.target.value }))
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Button type="button" variant="outline" className="w-full" onClick={scanIdCard}>
                      Scan / Paste ID Data
                    </Button>
                    <label className="space-y-2 text-sm text-slate-600">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Upload ID Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="ocean-input"
                        onChange={uploadIdImage}
                        disabled={isExtractingId}
                      />
                      <span className="block text-xs text-slate-500">
                        {isExtractingId ? "Extracting ID..." : "Upload image to auto-extract ID number."}
                      </span>
                    </label>
                  </div>

                  {availability ? (
                    <div
                      className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                        availability.available
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-600 border-rose-200"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {availability.available ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {availability.available
                          ? `${availability.availableRooms} room(s) available for selected dates.`
                          : "No availability for those dates. Please choose another range."}
                      </span>
                    </div>
              ) : null}

                  {!getToken() ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 space-y-3">
                      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <KeyRound className="h-4 w-4" />
                        Create a customer account to complete booking
                      </p>
                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          className="ocean-input"
                          placeholder="Username"
                          value={account.username}
                          onChange={(event) =>
                            setAccount((previous) => ({ ...previous, username: event.target.value }))
                          }
                        />
                        <input
                          className="ocean-input"
                          type="email"
                          placeholder="Email"
                          value={account.email}
                          onChange={(event) =>
                            setAccount((previous) => ({ ...previous, email: event.target.value }))
                          }
                        />
                        <input
                          className="ocean-input"
                          type="password"
                          placeholder="Password"
                          value={account.password}
                          onChange={(event) =>
                            setAccount((previous) => ({ ...previous, password: event.target.value }))
                          }
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-sky-700 underline underline-offset-2">
                          Log in
                        </Link>
                      </p>
                    </div>
                  ) : null}

                  <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white/60 px-3 py-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={form.acceptPolicy}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, acceptPolicy: event.target.checked }))
                      }
                    />
                    <span>
                      I agree to cancellation policy and booking terms. Free cancellation available up to 48 hours
                      before check-in.
                    </span>
                  </label>

                  {dateValidationError ? (
                    <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 border border-amber-200">
                      {dateValidationError}
                    </p>
                  ) : null}

                  {occupancyError ? (
                    <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 border border-amber-200">
                      {occupancyError}
                    </p>
                  ) : null}

                  {bookingError ? (
                    <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">
                      {bookingError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => checkAvailability(true)} disabled={isChecking}>
                      {isChecking ? "Checking..." : "Check availability"}
                    </Button>
                    <Button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="shadow-md shadow-cyan-200/50"
                    >
                      {isBooking ? "Booking..." : "Complete booking"}
                    </Button>
                  </div>
                </div>
              </div>

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
                      <p className="inline-flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        No prepayment required right now
                      </p>
                    </div>
                  </div>

                  <div className="card-ocean rounded-2xl p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Booking policy</p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Free cancellation until 48 hours before check-in.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Valid photo ID required at check-in.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Check-in 3:00 PM, check-out 11:00 AM.
                      </li>
                    </ul>
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
