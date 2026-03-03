"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { ReservationResponse } from "@/lib/types";

interface PageProps {
  params: { reservationNo: string };
}

const statusColor: Record<string, "default" | "success" | "warning" | "danger"> = {
  BOOKED: "default",
  CHECKED_IN: "success",
  CHECKED_OUT: "success",
  CANCELLED: "danger",
};

export default function ReservationDetailPage({ params }: PageProps) {
  const guard = useRoleGuard(["CUSTOMER"], "/login");
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ReservationResponse>(`/api/my/reservations/${params.reservationNo}`)
      .then(setReservation)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load reservation"));
  }, [params.reservationNo]);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Reservation Details</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Reservation #{params.reservationNo}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/my-reservations">Back to list</Link>
          </Button>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        {reservation ? (
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{reservation.guestName}</span>
                <Badge variant={statusColor[reservation.status] || "default"}>
                  {reservation.status.replace("_", " ")}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-400">Room Type</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{reservation.roomType}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Contact</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{reservation.contactNo}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Check-in</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatDate(reservation.checkInDate)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Check-out</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatDate(reservation.checkOutDate)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase text-slate-400">Address</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {reservation.address || "Not provided"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Button asChild>
                  <Link href={`/my-reservations/${reservation.reservationNo}/bill`}>View Bill</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-slate-500">Loading reservation details...</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
