import Link from "next/link";
import { Anchor, Bike, Camera, Compass, Mountain, Sparkles, Timer, Waves } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const nearbyActivities = [
  {
    Icon: Anchor,
    title: "Whale Watching at Mirissa",
    description: "Head out at dawn for blue whale and dolphin spotting with certified marine guides.",
    travel: "40 min drive",
    imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Bike,
    title: "Coastal Cycling Trail",
    description: "Ride palm-lined backroads through fishing villages and hidden bays with ocean viewpoints.",
    travel: "15 min drive",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Mountain,
    title: "Rumassala Nature Hike",
    description: "Guided forest walk with panoramic Galle Bay views and medicinal plant storytelling.",
    travel: "25 min drive",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Camera,
    title: "Sunset Photography Tour",
    description: "Capture golden-hour scenes at reefs, lighthouses, and clifftops with a local photographer.",
    travel: "10 min drive",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Waves,
    title: "Beginner Surf Session",
    description: "Soft reef breaks and one-on-one coaching make this perfect for first-time surfers.",
    travel: "30 min drive",
    imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Compass,
    title: "Village Tuk-Tuk Safari",
    description: "Explore nearby markets, tea kiosks, and artisan workshops in a curated local route.",
    travel: "From lobby",
    imageUrl: "https://images.unsplash.com/photo-1519003300449-424ad0405076?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function NearbyActivitiesPage() {
  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      <section className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Nearby Activities
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Adventure around Ocean View
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Discover high-energy adventures and local-led experiences just minutes from the resort.
        </p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nearbyActivities.map((activity) => (
            <article key={activity.title} className="card-ocean overflow-hidden rounded-2xl">
              <div className="relative h-44 w-full overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
                  style={{ backgroundImage: `url(${activity.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-white/20 backdrop-blur-sm">
                  <activity.Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-3 p-6">
                <h2 className="text-lg font-bold text-slate-900">{activity.title}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{activity.description}</p>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700">
                  <Timer className="h-3.5 w-3.5" /> {activity.travel}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="ocean-surface rounded-3xl px-8 py-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Need concierge planning?</h2>
          <p className="text-slate-600">Our team can arrange transport, tickets, and private guides in minutes.</p>
          <Button asChild size="lg">
            <Link href="/contact">Plan with concierge</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}