"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* ── Page hero ── */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-14 pb-10 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-56 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Reservation Details</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Stay Overview</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">Reservation #{params.reservationNo}</p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Details</h2>
          <Button asChild variant="outline">
            <Link href="/my-reservations">Back to list</Link>
          </Button>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        {reservation ? (
          <div className="card-ocean max-w-3xl rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100/60">
              <h3 className="text-base font-semibold text-slate-900">{reservation.guestName}</h3>
              <Badge variant={statusColor[reservation.status] || "default"}>
                {reservation.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 p-6">
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
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Loading reservation details...</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
