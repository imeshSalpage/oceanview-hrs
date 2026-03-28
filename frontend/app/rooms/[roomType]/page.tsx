"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BedDouble, Building2, CheckCircle2, ChevronLeft, KeyRound, Ruler, Users, XCircle } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { extractIdNumberFromImage } from "@/lib/id-extractor";
import type { AuthResponse, RoomAvailabilityResponse, RoomTypeDetails } from "@/lib/types";

/* ── tiny helper label/field wrapper ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
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
  const [form, setForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    guestName: "",
    contactNo: "",
    address: "",
    idNumber: "",
  });
  const [account, setAccount] = useState({ username: "", email: "", password: "" });

  useEffect(() => {
    if (!roomType) return;
    let active = true;
    api
      .get<RoomTypeDetails>(`/api/rooms/${roomType}`)
      .then((data) => { if (active) setRoom(data); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Failed to load room details"); });
    return () => { active = false; };
  }, [roomType]);

  const checkAvailability = async () => {
    if (!form.checkInDate || !form.checkOutDate) {
      setBookingError("Select check-in and check-out dates");
      return null;
    }
    setIsChecking(true);
    setBookingError(null);
    try {
      const data = await api.get<RoomAvailabilityResponse>(
        `/api/rooms/${roomType}/availability?checkIn=${form.checkInDate}&checkOut=${form.checkOutDate}`
      );
      setAvailability(data);
      return data;
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to check availability");
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  const ensureCustomerLogin = async () => {
    const token = getToken();
    if (token) return;
    if (!account.username || !account.email || !account.password) {
      throw new Error("Create a customer account to continue");
    }
    const response = await api.post<AuthResponse>("/api/auth/register", account);
    setToken(response.token);
  };

  const handleBooking = async () => {
    setIsBooking(true);
    setBookingError(null);
    try {
      if (!form.checkInDate || !form.checkOutDate || !form.guestName || !form.contactNo) {
        throw new Error("Fill in check-in, check-out, guest name, and contact number");
      }
      await ensureCustomerLogin();
      if (!availability?.available) {
        const latest = await checkAvailability();
        if (!latest?.available) throw new Error("No availability for selected dates");
      }
      await api.post("/api/my/reservations", {
        guestName: form.guestName,
        address: form.address,
        contactNo: form.contactNo,
        roomType,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
      });
      window.location.href = "/my-reservations";
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
        setBookingError("No ID number detected in uploaded image");
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

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-10">
        <Button asChild variant="ghost" size="sm" className="text-sky-700 hover:text-sky-900">
          <Link href="/rooms" className="inline-flex items-center gap-1"><ChevronLeft className="h-4 w-4" />Back to rooms</Link>
        </Button>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : null}

        {room ? (
          <div className="space-y-10">
            {/* ── Header ── */}
            <header className="space-y-2">
              <span className="ocean-pill">{room.roomType}</span>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">{room.name}</h1>
              <p className="text-slate-600">{room.description}</p>
            </header>

            {/* ── Gallery ── */}
            <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {room.imageUrls.map((url, index) => (
                <div
                  key={url}
                  className={`overflow-hidden rounded-2xl ${index === 0 ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""}`}
                >
                  <img
                    src={url}
                    alt={`${room.name} — view ${index + 1}`}
                    className={`w-full object-cover transition-transform duration-500 hover:scale-105 ${index === 0 ? "h-80 lg:h-full" : "h-44"}`}
                  />
                </div>
              ))}
            </section>

            {/* ── Details + Amenities ── */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Highlights */}
              <div className="card-ocean rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Suite highlights</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: BedDouble, label: "Bed type", value: room.bedType },
                    { Icon: Ruler, label: "Room size", value: `${room.sizeSqm} m²` },
                    { Icon: Users, label: "Max guests", value: `Up to ${room.maxGuests}` },
                    { Icon: Building2, label: "Rooms available", value: String(room.totalRooms) },
                  ].map((spec) => (
                    <div key={spec.label} className="rounded-xl bg-sky-50 p-3 border border-sky-100">
                      <spec.Icon className="h-5 w-5 text-sky-700" />
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{spec.label}</p>
                      <p className="text-sm font-medium text-slate-900">{spec.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl font-bold text-sky-700">{formatCurrency(room.ratePerNight)}</span>
                  <span className="text-sm text-slate-500">/ night</span>
                </div>
              </div>

              {/* Amenities & Facilities */}
              <div className="card-ocean rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Amenities</h3>
                  <ul className="mt-3 space-y-1.5">
                    {room.amenities.map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Facilities</h3>
                  <ul className="mt-3 space-y-1.5">
                    {room.facilities.map((facility) => (
                      <li key={facility} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Booking card ── */}
            <div className="ocean-surface rounded-3xl p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Book this room</h2>
                <p className="mt-1 text-sm text-slate-600">Check availability and confirm your reservation in minutes.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Check-in">
                  <input
                    type="date"
                    className="ocean-input"
                    value={form.checkInDate}
                    onChange={(e) => setForm((p) => ({ ...p, checkInDate: e.target.value }))}
                  />
                </Field>
                <Field label="Check-out">
                  <input
                    type="date"
                    className="ocean-input"
                    value={form.checkOutDate}
                    onChange={(e) => setForm((p) => ({ ...p, checkOutDate: e.target.value }))}
                  />
                </Field>
                <Field label="ID Number (not saved yet)">
                  <input
                    className="ocean-input"
                    placeholder="NIC / Passport number"
                    value={form.idNumber}
                    onChange={(e) => setForm((p) => ({ ...p, idNumber: e.target.value }))}
                  />
                </Field>
                <Field label="Scan ID">
                  <Button type="button" variant="outline" className="w-full" onClick={scanIdCard}>
                    Scan / Paste ID Data
                  </Button>
                </Field>
                <Field label="Upload ID Image">
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="ocean-input"
                      onChange={uploadIdImage}
                      disabled={isExtractingId}
                    />
                    <p className="text-xs text-slate-500">{isExtractingId ? "Extracting ID..." : "Uploads image and extracts ID number automatically."}</p>
                    {form.idNumber ? (
                      <p className="text-xs font-semibold text-slate-700">Extracted ID: {form.idNumber}</p>
                    ) : (
                      <p className="text-xs text-slate-400">No ID extracted yet.</p>
                    )}
                  </div>
                </Field>
                <Field label="Guest name">
                  <input
                    className="ocean-input"
                    placeholder="Full name"
                    value={form.guestName}
                    onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))}
                  />
                </Field>
                <Field label="Contact number">
                  <input
                    className="ocean-input"
                    placeholder="+94 77 …"
                    value={form.contactNo}
                    onChange={(e) => setForm((p) => ({ ...p, contactNo: e.target.value }))}
                  />
                </Field>
                <Field label="Address">
                  <input
                    className="ocean-input md:col-span-2"
                    placeholder="Your address"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  />
                </Field>
              </div>

              {/* Availability result */}
              {availability ? (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                  availability.available
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-600 border-rose-200"
                }`}>
                  <span className="inline-flex items-center gap-1.5">
                    {availability.available ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {availability.available
                      ? `${availability.availableRooms} rooms available for your selected dates.`
                      : "No availability for those dates. Please try a different range."}
                  </span>
                </div>
              ) : null}

              {/* Inline account creation */}
              {!getToken() ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 space-y-3">
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900"><KeyRound className="h-4 w-4" />Create a customer account to book</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      className="ocean-input"
                      placeholder="Username"
                      value={account.username}
                      onChange={(e) => setAccount((p) => ({ ...p, username: e.target.value }))}
                    />
                    <input
                      className="ocean-input"
                      type="email"
                      placeholder="Email"
                      value={account.email}
                      onChange={(e) => setAccount((p) => ({ ...p, email: e.target.value }))}
                    />
                    <input
                      className="ocean-input"
                      type="password"
                      placeholder="Password"
                      value={account.password}
                      onChange={(e) => setAccount((p) => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-sky-700 underline underline-offset-2">Log in</Link>
                  </p>
                </div>
              ) : null}

              {bookingError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{bookingError}</p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={checkAvailability} disabled={isChecking}>
                  {isChecking ? "Checking…" : "Check availability"}
                </Button>
                <Button onClick={handleBooking} disabled={isBooking} className="shadow-md shadow-cyan-200/50">
                  {isBooking ? "Booking…" : "Book now"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
