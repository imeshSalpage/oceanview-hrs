import Link from "next/link";
import { Clock3, Mail, Map, MapPin, MessageCircleMore, Phone } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const contactDetails = [
  { Icon: MapPin, label: "Address", value: "Ocean View Road, Unawatuna, Galle, Sri Lanka" },
  { Icon: Phone, label: "Phone", value: "+94 77 123 4567" },
  { Icon: Mail, label: "Email", value: "hello@oceanviewresort.lk" },
  { Icon: Clock3, label: "Front desk", value: "Open 24 / 7" },
];

const faqs = [
  { q: "Can I request an early check-in?", a: "Yes—contact our front desk 24 h before arrival and we will do our best." },
  { q: "Is airport transfer available?", a: "We offer transfers from Colombo Bandaranaike and Mattala airports. Book via email." },
  { q: "Are pets allowed?", a: "We welcome well-behaved dogs in our garden-view rooms. Please let us know in advance." },
  { q: "What is the cancellation policy?", a: "Free cancellation up to 48 hours before check-in. After that, one night's rate applies." },
];

export default function ContactPage() {
  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />

      {/* Page hero */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)", filter: "blur(60px)" }}
        />
        <span className="ocean-pill mb-4 inline-flex items-center gap-1.5"><MessageCircleMore className="h-3.5 w-3.5" />Contact us</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          We&apos;d love to welcome you
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-slate-600">
          Questions, special requests, or just want to say hello? Our team is here round the clock.
        </p>
      </section>

      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 pb-24">
        {/* Contact info grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactDetails.map((item) => (
            <div key={item.label} className="card-ocean rounded-2xl p-5 text-center space-y-2">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-2xl border border-sky-100">
                <item.Icon className="h-5 w-5 text-sky-700" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="text-sm font-medium text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        <div className="hero-ocean relative overflow-hidden rounded-3xl p-1 shadow-xl shadow-cyan-200/30">
          <div className="flex h-48 items-center justify-center rounded-[calc(1.5rem-4px)] bg-sky-900/70 backdrop-blur-sm">
            <div className="text-center space-y-1">
              <Map className="mx-auto h-8 w-8 text-white" />
              <p className="text-sm font-medium text-white/80">Unawatuna, Galle — 6°01&apos;N 80°14&apos;E</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="ocean-surface rounded-2xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="ocean-surface rounded-3xl px-8 py-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Ready to book?</h2>
          <p className="text-slate-600">Browse our room types and secure your stay in minutes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/rooms">Browse rooms</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
