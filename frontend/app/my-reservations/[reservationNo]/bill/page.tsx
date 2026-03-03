"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { BillResponse } from "@/lib/types";

interface PageProps {
  params: { reservationNo: string };
}

export default function BillPage({ params }: PageProps) {
  const guard = useRoleGuard(["CUSTOMER"], "/login");
  const [bill, setBill] = useState<BillResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<BillResponse>(`/api/my/reservations/${params.reservationNo}/bill`)
      .then(setBill)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load bill"));
  }, [params.reservationNo]);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Reservation Bill</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{params.reservationNo}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/my-reservations/${params.reservationNo}`}>Back to details</Link>
          </Button>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        {bill ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{bill.guestName}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{bill.roomType}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Nights</span>
                <span className="font-medium text-slate-900 dark:text-white">{bill.nights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Rate per night</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(bill.ratePerNight)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold dark:border-slate-800">
                <span>Total</span>
                <span>{formatCurrency(bill.total)}</span>
              </div>
              <Button onClick={() => window.print()} variant="outline">
                Print bill
              </Button>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-slate-500">Loading bill...</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
