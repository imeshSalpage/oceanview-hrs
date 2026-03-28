import Link from "next/link";
import { Building2, Castle, Clock3, Coffee, Landmark, Sparkles, TreePalm, WandSparkles } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const nearbyPlaces = [
  {
    Icon: Castle,
    title: "Galle Fort Ramparts",
    description: "Walk UNESCO-listed fort walls, colonial streets, and sunset viewpoints above the sea.",
    openHours: "Open all day",
    imageUrl: "https://images.unsplash.com/photo-1588416499018-9d7a7f4f4b96?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Coffee,
    title: "Pedlar Street Cafes",
    description: "Boutique coffee spots, artisan gelato, and hidden courtyards inside Old Galle.",
    openHours: "8:00 AM - 10:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: TreePalm,
    title: "Jungle Beach",
    description: "A calm crescent bay tucked between forest and reef, ideal for a quiet afternoon swim.",
    openHours: "7:00 AM - 6:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Landmark,
    title: "Maritime Museum",
    description: "Explore Sri Lanka's seafaring heritage with ship artifacts and coral exhibits.",
    openHours: "9:00 AM - 5:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Building2,
    title: "Dutch Reformed Church",
    description: "Historic architecture and serene interiors reflecting Galle's layered colonial timeline.",
    openHours: "9:30 AM - 4:30 PM",
    imageUrl: "https://images.unsplash.com/photo-1520637836862-4d197d17c36a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: WandSparkles,
    title: "Handloom & Craft Arcade",
    description: "Discover handmade batik, spices, and wooden crafts curated by local families.",
    openHours: "10:00 AM - 8:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function NearbyPlacesPage() {
  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      <section className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Nearby Places
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Places worth visiting nearby
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          From heritage landmarks to hidden beaches, explore the best of Galle around the resort.
        </p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nearbyPlaces.map((place) => (
            <article key={place.title} className="card-ocean overflow-hidden rounded-2xl">
              <div className="relative h-44 w-full overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
                  style={{ backgroundImage: `url(${place.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-white/20 backdrop-blur-sm">
                  <place.Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-3 p-6">
                <h2 className="text-lg font-bold text-slate-900">{place.title}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{place.description}</p>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700">
                  <Clock3 className="h-3.5 w-3.5" /> {place.openHours}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="ocean-surface rounded-3xl px-8 py-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Looking for custom itineraries?</h2>
          <p className="text-slate-600">Tell us your interests and we will build a half-day or full-day route for you.</p>
          <Button asChild size="lg">
            <Link href="/contact">Request itinerary</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}