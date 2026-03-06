import Link from "next/link";
import {
  Fish,
  Lock,
  Shell,
  UtensilsCrossed,
  Waves,
  WavesLadder,
  HeartPulse,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "4", label: "Room types" },
  { value: "24/7", label: "Front desk" },
  { value: "5★", label: "Guest rating" },
  { value: "2003", label: "Est." },
];

const highlights = [
  {
    Icon: Waves,
    title: "Oceanfront Views",
    description: "Wake up to panoramic Indian Ocean vistas from every room.",
  },
  {
    Icon: UtensilsCrossed,
    title: "Coastal Dining",
    description: "Farm-to-table meals crafted from Sri Lankan coastal flavors.",
  },
  {
    Icon: HeartPulse,
    title: "Wellness & Spa",
    description: "Signature therapies using botanicals sourced from our gardens.",
  },
  {
    Icon: Fish,
    title: "Water Adventures",
    description: "Snorkelling, diving and sunset cruises, all from our private jetty.",
  },
  {
    Icon: WavesLadder,
    title: "Infinity Pool",
    description: "Horizon-edge pool perched above the reef with sunset cocktails.",
  },
  {
    Icon: Lock,
    title: "Secure Booking",
    description: "Instant confirmation, transparent billing, no hidden fees.",
  },
];

export default function Home() {
  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pt-20 pb-28 text-center">
        {/* floating orb behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[920px] -translate-x-1/2 -translate-y-1/4 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)", filter: "blur(72px)" }}
        />

        <span className="ocean-pill inline-flex items-center gap-1.5"><Shell className="h-3.5 w-3.5" />Ocean View Resort · Galle, Sri Lanka</span>

        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
          Your perfect coastal escape{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #0891b2, #06b6d4, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            starts here
          </span>
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-slate-600">
          Luxury rooms, seamless reservations and world-class hospitality—all on
          the shores of the Indian Ocean.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Button asChild size="lg" className="shadow-lg shadow-cyan-200/60">
            <Link href="/rooms">Explore rooms</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Create account</Link>
          </Button>
        </div>

        {/* stat row */}
        <div className="mt-6 flex flex-wrap justify-center gap-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-sky-700">{s.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured suite banner ── */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="hero-ocean relative overflow-hidden rounded-3xl p-1 shadow-2xl shadow-cyan-300/30">
          <div className="relative rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-sky-900/80 to-cyan-900/60 p-10 backdrop-blur-sm">
            {/* decorative blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-sky-600/25 blur-2xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                <span className="ocean-pill !bg-white/10 !text-cyan-200 !border-white/20">Featured</span>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Oceanfront Deluxe Suite</h2>
                <p className="max-w-lg text-sky-100/80">
                  Private balcony overlooking the reef, personal butler service, king-size bed
                  and complimentary spa access. The ultimate retreat.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {["Private Balcony", "Butler Service", "Spa Access", "Ocean View"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm border border-white/15">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ocean-surface min-w-[200px] rounded-2xl p-6 text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">From</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">LKR 30,000</p>
                <p className="text-xs text-slate-500">per night</p>
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link href="/rooms/DELUXE">Book now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Resort highlights ── */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-10 text-center">
          <span className="ocean-pill">Why Ocean View</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">Everything you need, nothing you don&apos;t</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Every detail crafted so you can relax, recharge and reconnect with the ocean.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="card-ocean rounded-2xl p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-2xl border border-sky-100">
                <h.Icon className="h-5 w-5 text-sky-700" />
              </div>
              <h3 className="font-semibold text-slate-900">{h.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="ocean-surface rounded-3xl px-8 py-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Ready to make a reservation?</h2>
          <p className="text-slate-600">Real-time availability, instant confirmation, transparent pricing.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-1">
            <Button asChild size="lg">
              <Link href="/rooms">Browse all rooms</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/my-reservations">My reservations</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
