"use client";

import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Staff Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor arrivals, departures, and revenue.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue range</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              {metrics ? formatCurrency(metrics.revenueInRange) : "Loading..."}
            </div>
          </CardContent>
        </Card>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total reservations</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {metrics?.totalReservations ?? "--"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming check-ins</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {metrics?.upcomingCheckInsNext7Days ?? "--"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming check-outs</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {metrics?.upcomingCheckOutsNext7Days ?? "--"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue (range)</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {metrics ? formatCurrency(metrics.revenueInRange) : "--"}
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
