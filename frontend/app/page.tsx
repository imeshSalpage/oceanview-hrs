import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Instant Reservations",
    description: "Book rooms in seconds with real-time availability and pricing.",
  },
  {
    title: "Staff Dashboard",
    description: "Track check-ins, revenue, and status updates from one place.",
  },
  {
    title: "Secure Billing",
    description: "Generate itemized bills with clear nightly rates and totals.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
              Ocean View Resort
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-5xl">
              Your coastal stay, booked in moments.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Discover luxury rooms, seamless check-ins, and transparent billing—built for
              guests, staff, and administrators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/register">Create free account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/my-reservations">View reservations</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <div className="space-y-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
              <p className="text-sm uppercase tracking-wide text-slate-200">Featured Suite</p>
              <h2 className="text-2xl font-semibold">Oceanfront Deluxe Suite</h2>
              <p className="text-sm text-slate-200">
                Private balcony · Spa access · Butler service
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold">LKR 30,000</span>
                <span className="text-sm text-slate-200">per night</span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="border-slate-100 dark:border-slate-800">
                  <CardContent className="space-y-2 p-4">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            "Flexible room types from single to suite",
            "Role-based access for staff and admins",
            "Clear status tracking and printable bills",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{item}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
