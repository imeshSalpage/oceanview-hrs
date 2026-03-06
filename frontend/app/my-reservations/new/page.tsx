"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";
import type { ReservationResponse, RoomType } from "@/lib/types";

const roomTypes: RoomType[] = ["SINGLE", "DOUBLE", "DELUXE", "SUITE"];

export default function NewReservationPage() {
  const guard = useRoleGuard(["CUSTOMER"], "/login");
  const [guestName, setGuestName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("SINGLE");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const reservation = await api.post<ReservationResponse>("/api/my/reservations", {
        guestName,
        address,
        contactNo,
        roomType,
        checkInDate,
        checkOutDate,
      });
      window.location.href = `/my-reservations/${reservation.reservationNo}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* ── Page hero ── */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-14 pb-10 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-56 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5"><PlusCircle className="h-3.5 w-3.5" />New Reservation</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Book Your Stay</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">Secure your preferred room type in a few steps.</p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Guest Details</h2>
          <Button asChild variant="outline">
            <Link href="/my-reservations">Back to list</Link>
          </Button>
        </div>

        <div className="card-ocean max-w-2xl rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-sky-100/60">
            <h3 className="text-base font-semibold text-slate-900">Fill in your details</h3>
          </div>
          <div className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Guest name</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Ariya Silva"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNo">Contact number</Label>
                  <Input
                    id="contactNo"
                    value={contactNo}
                    onChange={(event) => setContactNo(event.target.value)}
                    placeholder="+94 77 123 4567"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Colombo 07, Sri Lanka"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="roomType">Room type</Label>
                  <select
                    id="roomType"
                    value={roomType}
                    onChange={(event) => setRoomType(event.target.value as RoomType)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={checkInDate}
                    onChange={(event) => setCheckInDate(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={checkOutDate}
                    onChange={(event) => setCheckOutDate(event.target.value)}
                    required
                  />
                </div>
              </div>
              {error ? <p className="text-sm text-rose-500">{error}</p> : null}
              <Button disabled={loading}>{loading ? "Saving..." : "Confirm reservation"}</Button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
