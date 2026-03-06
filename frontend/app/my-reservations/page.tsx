"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, PlusCircle } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { ReservationResponse } from "@/lib/types";

const statusColor: Record<string, "default" | "success" | "warning" | "danger"> = {
  BOOKED: "default",
  CHECKED_IN: "success",
  CHECKED_OUT: "success",
  CANCELLED: "danger",
};

export default function MyReservationsPage() {
  const guard = useRoleGuard(["CUSTOMER"], "/login");
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ReservationResponse[]>("/api/my/reservations");
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  const cancelReservation = async (reservationNo: string) => {
    try {
      await api.patch<void>(`/api/my/reservations/${reservationNo}/cancel`);
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel reservation");
    }
  };

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* ── Page hero ── */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-14 pb-10 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-56 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />My Reservations</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Your Stays</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Track upcoming stays, update details, and view your bill.
        </p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">All Reservations</h2>
          <Button asChild>
            <Link href="/my-reservations/new"><PlusCircle className="mr-1.5 h-4 w-4" />New reservation</Link>
          </Button>
        </div>

        <div className="card-ocean rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-sky-100/60">
            <h3 className="text-base font-semibold text-slate-900">Your bookings</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-sm text-slate-500">Loading reservations...</p>
            ) : error ? (
              <p className="text-sm text-rose-500">{error}</p>
            ) : reservations.length === 0 ? (
              <p className="text-sm text-slate-500">No reservations yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reservation</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.reservationNo}>
                      <TableCell className="font-medium">{reservation.reservationNo}</TableCell>
                      <TableCell>
                        {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                      </TableCell>
                      <TableCell>{reservation.roomType}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor[reservation.status] || "default"}>
                          {reservation.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/my-reservations/${reservation.reservationNo}`}>View</Link>
                        </Button>
                        {reservation.status === "BOOKED" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelReservation(reservation.reservationNo)}
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
