"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { api } from "@/lib/api";
import { getToken, getUsernameFromToken } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { ReservationResponse } from "@/lib/types";

const statusColor: Record<string, "default" | "success" | "warning" | "danger"> = {
  BOOKED: "default",
  CHECKED_IN: "success",
  CHECKED_OUT: "success",
  CANCELLED: "danger",
};

export default function ReservationDetailPage() {
  const params = useParams();
  const reservationNoParam = params?.reservationNo;
  const reservationNoRaw = Array.isArray(reservationNoParam)
    ? reservationNoParam[0] ?? ""
    : reservationNoParam ?? "";

  const guard = useRoleGuard(["CUSTOMER"], "/login");
  const signedInUsername = getUsernameFromToken(getToken());
  const reservationNo = reservationNoRaw.trim().toUpperCase();
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reservationNo) {
      setLoading(false);
      setError("Invalid reservation number.");
      return;
    }

    setLoading(true);
    setError(null);
    setReservation(null);

    api
      .get<ReservationResponse>(`/api/my/reservations/${reservationNo}`)
      .then(setReservation)
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load reservation";
        if (message === "Reservation not found") {
          setError("Reservation not found for this account. Please sign in with the account that created it.");
          return;
        }
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [reservationNo]);

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
        <p className="mx-auto mt-3 max-w-md text-slate-600">Reservation #{reservationNo}</p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Details</h2>
          <Button asChild variant="outline">
            <Link href="/my-reservations">Back to list</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading reservation details...</p>
        ) : error ? (
          <div className="space-y-1">
            <p className="text-sm text-rose-500">{error}</p>
            {signedInUsername ? (
              <p className="text-xs text-slate-500">Signed in as: {signedInUsername}</p>
            ) : null}
          </div>
        ) : reservation ? (
          <div className="card-ocean w-full rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100/60">
              <h3 className="text-base font-semibold text-slate-900">{reservation.guestName}</h3>
              <Badge variant={statusColor[reservation.status] || "default"}>
                {reservation.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 p-6">
              <div>
                <p className="text-xs uppercase text-slate-600">Room Type</p>
                <p className="text-sm font-medium text-slate-900">{reservation.roomType}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-600">Contact</p>
                <p className="text-sm font-medium text-slate-900">{reservation.contactNo}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-600">Check-in</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(reservation.checkInDate)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-600">Check-out</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(reservation.checkOutDate)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase text-slate-600">Address</p>
                <p className="text-sm font-medium text-slate-900">
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
          <p className="text-sm text-slate-500">Reservation not found.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
