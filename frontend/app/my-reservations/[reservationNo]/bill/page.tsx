"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

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
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* ── Page hero ── */}
      <section className="relative mx-auto w-full max-w-4xl px-6 pt-14 pb-10 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-56 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" />Bill</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Reservation Bill</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">{params.reservationNo}</p>
      </section>

      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
          <Button asChild variant="outline">
            <Link href={`/my-reservations/${params.reservationNo}`}>Back to details</Link>
          </Button>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        {bill ? (
          <div className="card-ocean rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100/60">
              <h3 className="text-base font-semibold text-slate-900">{bill.guestName}</h3>
              <span className="ocean-pill">{bill.roomType}</span>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Nights</span>
                <span className="font-medium text-slate-900">{bill.nights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Rate per night</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(bill.ratePerNight)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-sky-100 pt-4 text-lg font-semibold">
                <span>Total</span>
                <span className="text-sky-700">{formatCurrency(bill.total)}</span>
              </div>
              <Button onClick={() => window.print()} variant="outline">
                Print bill
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Loading bill...</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
