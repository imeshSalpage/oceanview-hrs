import Link from "next/link";
import { Activity, Fish, GlassWater, Leaf, Sparkles, Sunrise, Timer, UtensilsCrossed } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const experiences = [
  {
    Icon: Sunrise,
    title: "Sunrise Lagoon Cruise",
    description: "Sail with our naturalist guides and spot local wildlife at dawn. Watch the sun rise over the Indian Ocean from the water.",
    tag: "Nature & Wildlife",
    duration: "3 hours",
    imageUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: UtensilsCrossed,
    title: "Chef's Table Dining",
    description: "An intimate tasting menu from our executive chef, featuring coastal Sri Lankan flavors and the freshest catch of the day.",
    tag: "Culinary",
    duration: "2.5 hours",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Activity,
    title: "Cliffside Yoga",
    description: "Morning sessions held on our clifftop platform, overlooking the Indian Ocean. Suitable for all levels.",
    tag: "Wellness",
    duration: "1 hour",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Leaf,
    title: "Spa & Wellness Rituals",
    description: "Signature therapies using botanicals from our resort gardens. Includes herbal steam bath, body wrap, and deep-tissue massage.",
    tag: "Spa",
    duration: "2 hours",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: Fish,
    title: "Reef Snorkelling",
    description: "Guided snorkel tours to the coral gardens just off our private jetty—a kaleidoscope of tropical fish awaits.",
    tag: "Adventure",
    duration: "1.5 hours",
    imageUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=1400&q=80",
  },
  {
    Icon: GlassWater,
    title: "Sunset Cocktail Hour",
    description: "Join our mixologist on the infinity deck for handcrafted tropical cocktails as the sun dips below the horizon.",
    tag: "Social",
    duration: "1.5 hours",
    imageUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function ExperiencesPage() {
  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* Page hero */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Resort Experiences</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Curated moments beyond the room
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-slate-600">
          Every experience is thoughtfully crafted—from sunrise sails to cliffside sunsets—so
          your stay becomes a story worth telling.
        </p>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <div key={exp.title} className="card-ocean group rounded-2xl overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${exp.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-white/20 backdrop-blur-sm">
                  <exp.Icon className="h-5 w-5 text-white" />
                </div>
                <span className="ocean-pill absolute right-4 top-4 border-white/50 bg-white/25 text-white">
                  {exp.tag}
                </span>
              </div>
              <div className="space-y-4 p-6">
                <h2 className="text-lg font-bold text-slate-900">{exp.title}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{exp.description}</p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-sky-700">
                  <Timer className="h-3.5 w-3.5" /> {exp.duration}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="ocean-surface rounded-3xl px-8 py-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Ready to dive in?</h2>
          <p className="text-slate-600">Book a room and choose your experiences upon arrival—our concierge will arrange everything.</p>
          <Button asChild size="lg">
            <Link href="/rooms">Browse rooms</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
