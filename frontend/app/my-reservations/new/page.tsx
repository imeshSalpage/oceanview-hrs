"use client";

import Link from "next/link";
import { useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">New Reservation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Secure your preferred room type in a few steps.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/my-reservations">Back to list</Link>
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Guest details</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
