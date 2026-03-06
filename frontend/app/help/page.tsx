import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "How do I create a reservation?",
    answer: "Create an account, log in, then visit My Reservations to book your stay.",
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, you can cancel your own reservations from the reservation detail page.",
  },
  {
    question: "Where can staff access reports?",
    answer: "Staff and admins can view reports from the Reports page in the dashboard.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen ocean-wave">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-16">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-sky-600 dark:text-sky-300">Help Center</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">We’re here to help.</h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            Find answers to common questions, quick-start links, and system guidance for guests
            and staff.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                {faq.answer}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <Link href="/register" className="block hover:text-slate-900 dark:hover:text-white">
                Register a new account
              </Link>
              <Link href="/login" className="block hover:text-slate-900 dark:hover:text-white">
                Sign in to manage reservations
              </Link>
              <Link href="/dashboard" className="block hover:text-slate-900 dark:hover:text-white">
                Staff dashboard metrics
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>Phone: +94 11 234 5678</p>
              <p>Email: support@oceanviewresort.lk</p>
              <p>Front desk: 24/7 service</p>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
