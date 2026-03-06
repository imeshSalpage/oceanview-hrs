"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BedDouble, Ruler, Users, Waves } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { RoomTypeDetails } from "@/lib/types";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomTypeDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<RoomTypeDetails[]>("/api/rooms")
      .then((data) => {
        if (active) setRooms(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load room types");
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* ── Page hero ── */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5"><Waves className="h-3.5 w-3.5" />Rooms &amp; Suites</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Coastal stays for every traveller
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-slate-600">
          Each room is designed to bring the ocean closer—signature amenities, resort
          facilities, and spectacular views included.
        </p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2">
          {rooms.map((room) => (
            <article key={room.roomType} className="card-ocean overflow-hidden rounded-3xl">
              {/* image strip */}
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={room.imageUrls?.[0]}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {/* rate badge */}
                <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 px-3 py-1 text-sm font-bold text-slate-900 shadow backdrop-blur-sm">
                  {formatCurrency(room.ratePerNight)}<span className="text-xs font-normal text-slate-500">/night</span>
                </div>
              </div>

              {/* content */}
              <div className="space-y-4 p-6">
                <div className="space-y-1">
                  <span className="ocean-pill">{room.roomType}</span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{room.name}</h2>
                  <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">{room.description}</p>
                </div>

                {/* spec chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { Icon: BedDouble, text: room.bedType },
                    { Icon: Ruler, text: `${room.sizeSqm} m²` },
                    { Icon: Users, text: `Up to ${room.maxGuests} guests` },
                  ].map((chip) => (
                    <span key={chip.text} className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 border border-sky-100">
                      <chip.Icon className="h-3.5 w-3.5" />
                      {chip.text}
                    </span>
                  ))}
                </div>

                {/* amenity dots */}
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 4).map((amenity) => (
                    <span key={amenity} className="rounded-md bg-cyan-50 px-2 py-0.5 text-xs text-cyan-800 border border-cyan-100">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>

                <Button asChild className="w-full">
                  <Link href={`/rooms/${room.roomType}`}>View details &amp; book</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        {rooms.length === 0 && !error && (
          <div className="ocean-surface rounded-2xl px-8 py-16 text-center">
            <p className="text-slate-500">Loading rooms…</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
