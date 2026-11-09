import Link from "next/link";
import PlanCard from "@/components/PlanCard";
import { BRAND, CATEGORIES, WHATSAPP_LINK } from "@/lib/constants";
import { getPlans } from "@/lib/plans";

const WHY = [
  { icon: "⚡", title: "Instant delivery", text: "Your data or airtime lands in seconds, any time of day." },
  { icon: "💸", title: "Cheap prices", text: "Reseller-friendly rates so you save on every purchase." },
  { icon: "🔒", title: "Safe & secure", text: "Wallet payments protected by Paystack and Supabase." },
  { icon: "🎧", title: "24/7 support", text: "Real humans on WhatsApp whenever you need help." },
];

const TESTIMONIALS = [
  { name: "Sample customer A", city: "Jos", text: "Data came in under a minute. This is my go-to plug now." },
  { name: "Sample customer B", city: "Bukuru", text: "Cheaper than my network's own app and the support replies fast." },
  { name: "Sample customer C", city: "Abuja", text: "I resell data to my friends and the wallet makes it easy." },
];

const FAQ = [
  { q: "How fast is delivery?", a: "Most orders complete within seconds. If something is delayed, message us on WhatsApp." },
  { q: "How do I fund my wallet?", a: "Log in, open your dashboard, enter an amount and pay securely with Paystack (card, transfer or USSD)." },
  { q: "What if my purchase fails?", a: "Failed orders are refunded to your wallet automatically." },
  { q: "Do your data plans expire?", a: "Each plan shows its validity (for example 30 days) before you buy." },
];

export default async function HomePage() {
  const deals = await getPlans({ limit: 8 });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 text-white">
        <div className="container-x grid items-center gap-6 py-10 md:grid-cols-2 md:py-16">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              📍 {BRAND.address}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              Cheap Data. Instant Delivery. Trusted Plug.
            </h1>
            <p className="mt-3 max-w-md text-brand-50">
              MTN, Airtel, Glo and 9mobile data, airtime, cable TV, electricity and exam pins, all from one wallet.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/data" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-accent-50 hover:text-accent-700">
                Buy Data Now
              </Link>
              <a
                href={WHATSAPP_LINK()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-white/60 px-6 py-3 text-base text-white hover:bg-white/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="hidden justify-center md:flex" aria-hidden>
            <div className="rounded-3xl bg-white/15 p-8 text-center backdrop-blur">
              <p className="text-6xl">📶</p>
              <p className="mt-2 text-xl font-bold">Data from</p>
              <p className="text-4xl font-extrabold">₦130</p>
              <p className="text-xs text-white/80">Sample price. See live plans below.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-x -mt-6" aria-labelledby="cats">
        <h2 id="cats" className="sr-only">Categories</h2>
        <ul className="card grid grid-cols-4 gap-2 p-3 sm:grid-cols-8">
          {CATEGORIES.map((c) => (
            <li key={c.label}>
              <Link
                href={c.href}
                className="flex flex-col items-center gap-1 rounded-xl p-2 text-center text-[11px] font-semibold text-slate-700 hover:bg-accent-50 hover:text-accent-700 sm:text-xs"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl" aria-hidden>
                  {c.emoji}
                </span>
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Hot deals */}
      <section className="container-x mt-10" aria-labelledby="deals">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="deals" className="text-xl font-extrabold text-brand-900 sm:text-2xl">
            🔥 Hot Deals <span className="badge ml-2 align-middle">Best value</span>
          </h2>
          <Link href="/data" className="text-sm font-semibold text-accent-600 hover:underline">
            See all
          </Link>
        </div>
        {deals.length === 0 ? (
          <p className="card p-6 text-center text-sm text-slate-500">
            Plans will appear here once your Supabase database is connected and seeded.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {deals.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        )}
      </section>

      {/* Why choose us */}
      <section className="container-x mt-12" aria-labelledby="why">
        <h2 id="why" className="mb-4 text-center text-xl font-extrabold text-brand-900 sm:text-2xl">
          Why choose {BRAND.name}?
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="card p-4 text-center">
              <p className="text-3xl" aria-hidden>{w.icon}</p>
              <h3 className="mt-2 font-bold text-accent-700">{w.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-x mt-12" aria-labelledby="reviews">
        <h2 id="reviews" className="mb-1 text-center text-xl font-extrabold text-brand-900 sm:text-2xl">
          What customers say
        </h2>
        <p className="mb-4 text-center text-xs text-slate-400">
          Placeholder reviews. Replace with real customer feedback before launch.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card p-4">
              <blockquote className="text-sm text-slate-700">“{t.text}”</blockquote>
              <figcaption className="mt-3 text-xs font-semibold text-brand-700">
                {t.name} · {t.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x mt-12 max-w-3xl" aria-labelledby="faq">
        <h2 id="faq" className="mb-4 text-center text-xl font-extrabold text-brand-900 sm:text-2xl">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-4">
              <summary className="cursor-pointer list-none font-semibold text-brand-900 marker:hidden">
                <span className="mr-2 text-accent-600 group-open:hidden">+</span>
                <span className="mr-2 hidden text-accent-600 group-open:inline">−</span>
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
