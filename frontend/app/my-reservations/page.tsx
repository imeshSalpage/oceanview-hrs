"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">My Reservations</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track upcoming stays, update details, and view your bill.
            </p>
          </div>
          <Button asChild>
            <Link href="/my-reservations/new">New reservation</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your bookings</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
