"use client";

import { useEffect, useState } from "react";
import { Banknote, BellRing, CalendarDays, DoorOpen, Shield } from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { DashboardMetricsResponse } from "@/lib/types";

const defaultStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().slice(0, 10);
};

const defaultEndDate = () => new Date().toISOString().slice(0, 10);

export default function DashboardPage() {
  const guard = useRoleGuard(["ADMIN", "RECEPTION"], "/login");
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(defaultEndDate());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<DashboardMetricsResponse>(
        `/api/dashboard/metrics?startDate=${startDate}&endDate=${endDate}`
      )
      .then((data) => {
        if (active) {
          setMetrics(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard metrics");
        }
      });

    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />
      <DashboardNav />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        {/* Page header */}
        <div className="space-y-1">
          <span className="ocean-pill inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Staff Portal</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Monitor arrivals, departures, and revenue at a glance.</p>
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : null}

        {/* Metric cards */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total reservations", value: metrics?.totalReservations ?? "--", Icon: CalendarDays },
            { label: "Check-ins (7 days)", value: metrics?.upcomingCheckInsNext7Days ?? "--", Icon: BellRing },
            { label: "Check-outs (7 days)", value: metrics?.upcomingCheckOutsNext7Days ?? "--", Icon: DoorOpen },
            { label: "Revenue (range)", value: metrics ? formatCurrency(metrics.revenueInRange) : "--", Icon: Banknote },
          ].map((stat) => (
            <div key={stat.label} className="card-ocean rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                <stat.Icon className="h-5 w-5 text-sky-700" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Date range filter */}
        <div className="ocean-surface rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Revenue date range</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">From</label>
              <input
                type="date"
                className="ocean-input w-44"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">To</label>
              <input
                type="date"
                className="ocean-input w-44"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-2xl font-bold text-sky-700">
                {metrics ? formatCurrency(metrics.revenueInRange) : "—"}
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
