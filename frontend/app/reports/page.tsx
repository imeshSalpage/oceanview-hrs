"use client";

import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { ReservationSummaryResponse, RevenueSummaryResponse } from "@/lib/types";

export default function ReportsPage() {
  const guard = useRoleGuard(["ADMIN", "RECEPTION"], "/login");
  const [reservationSummary, setReservationSummary] = useState<ReservationSummaryResponse | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<ReservationSummaryResponse>("/api/reports/reservations-summary"),
      api.get<RevenueSummaryResponse>("/api/reports/revenue-summary"),
    ])
      .then(([reservationData, revenueData]) => {
        setReservationSummary(reservationData);
        setRevenueSummary(revenueData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load reports"));
  }, []);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reservations overview and revenue breakdowns.
          </p>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Reservations by room type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {reservationSummary
                ? Object.entries(reservationSummary.byRoomType).map(([room, count]) => (
                    <div key={room} className="flex items-center justify-between">
                      <span>{room}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{count}</span>
                    </div>
                  ))
                : "Loading..."}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reservations by status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {reservationSummary
                ? Object.entries(reservationSummary.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span>{status.replace("_", " ")}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{count}</span>
                    </div>
                  ))
                : "Loading..."}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Revenue summary by room type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {revenueSummary
              ? Object.entries(revenueSummary.revenueByRoomType).map(([room, total]) => (
                  <div key={room} className="flex items-center justify-between">
                    <span>{room}</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))
              : "Loading..."}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
