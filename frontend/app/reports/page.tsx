"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart } from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

  const kpis = useMemo(() => {
    if (!reservationSummary) {
      return null;
    }

    const statusCounts = Object.values(reservationSummary.byStatus);
    const totalReservations = statusCounts.reduce((sum, count) => sum + Number(count), 0);
    const cancelledReservations = Number(reservationSummary.byStatus.CANCELLED ?? 0);
    const checkedOutReservations = Number(reservationSummary.byStatus.CHECKED_OUT ?? 0);

    const cancellationRate = totalReservations > 0
      ? (cancelledReservations / totalReservations) * 100
      : 0;

    const completionRate = totalReservations > 0
      ? (checkedOutReservations / totalReservations) * 100
      : 0;

    return {
      totalReservations,
      cancelledReservations,
      checkedOutReservations,
      cancellationRate,
      completionRate,
    };
  }, [reservationSummary]);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />
      <DashboardNav />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-1">
          <span className="ocean-pill inline-flex items-center gap-1.5"><LineChart className="h-3.5 w-3.5" /> Analytics</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600">Reservation overview and revenue breakdowns.</p>
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total reservations", value: kpis?.totalReservations ?? "--", tone: "text-slate-900" },
            { label: "Checked out", value: kpis?.checkedOutReservations ?? "--", tone: "text-emerald-700" },
            { label: "Cancellation rate", value: kpis ? `${kpis.cancellationRate.toFixed(1)}%` : "--", tone: "text-rose-700" },
            { label: "Completion rate", value: kpis ? `${kpis.completionRate.toFixed(1)}%` : "--", tone: "text-sky-700" },
          ].map((item) => (
            <div key={item.label} className="card-ocean rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {/* By room type */}
          <div className="card-ocean rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Reservations by room type</h2>
            <div className="space-y-2">
              {reservationSummary
                ? Object.entries(reservationSummary.byRoomType).map(([room, count]) => (
                    <div key={room} className="flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{room}</span>
                      <span className="font-bold text-sky-700">{count as number}</span>
                    </div>
                  ))
                : <p className="text-sm text-slate-400">Loading…</p>}
            </div>
          </div>

          {/* By status */}
          <div className="card-ocean rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Reservations by status</h2>
            <div className="space-y-2">
              {reservationSummary
                ? Object.entries(reservationSummary.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{status.replace("_", " ")}</span>
                      <span className="font-bold text-sky-700">{count as number}</span>
                    </div>
                  ))
                : <p className="text-sm text-slate-400">Loading…</p>}
            </div>
          </div>
        </section>

        {/* Revenue by room */}
        <div className="ocean-surface rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Revenue by room type</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {revenueSummary
              ? Object.entries(revenueSummary.revenueByRoomType).map(([room, total]) => (
                  <div key={room} className="rounded-xl bg-white/80 border border-sky-100 p-4 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{room}</p>
                    <p className="text-lg font-bold text-sky-700">{formatCurrency(total as number)}</p>
                  </div>
                ))
              : <p className="text-sm text-slate-400">Loading…</p>}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
