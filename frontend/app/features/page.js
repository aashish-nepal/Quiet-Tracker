import Link from 'next/link';
import PublicNav from '../../components/ui/PublicNav';

const featureGroups = [
  {
    title: 'Tracking Core',
    items: [
      'Automatic platform detection for Shopify, WooCommerce, Amazon, and Etsy',
      'Configurable check cadence by plan and cron scheduler',
      'Variant-aware product tracking to reduce false signals'
    ]
  },
  {
    title: 'Smart Alerting',
    items: [
      'Threshold alerts, below-price alerts, and undercut detection',
      'Immediate notifications or daily summary mode per product',
      'Screenshot evidence attached to email alerts'
    ]
  },
  {
    title: 'Pricing Intelligence',
    items: [
      '30-day trend metrics for each tracked product',
      'Most aggressive competitor ranking',
      'Cheaper-time share and volatility scoring'
    ]
  },
  {
    title: 'Security + Team Ops',
    items: [
      'Email/password auth + Google OAuth',
      'Owner and team-member RBAC',
      'Audit logs for product and account actions'
    ]
  }
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1480px] px-4 py-8 sm:px-6 md:px-10 md:py-12 lg:px-14 2xl:px-20">
      <PublicNav />

      <section className="panel p-7 md:p-10 2xl:p-12">
        <p className="text-xs uppercase tracking-[0.18em] text-slateBlue">Product Features</p>
        <h1 className="mt-3 text-[clamp(2rem,3.5vw,3.6rem)] font-bold leading-tight">
          Everything you need to monitor competitor pricing professionally.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base 2xl:max-w-4xl">
          Quiet Tracker combines reliable monitoring, strategic alerts, and analytics in one minimal dashboard designed for
          e-commerce teams and agencies.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {featureGroups.map((group) => (
          <article key={group.title} className="panel p-5 md:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slateBlue">{group.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {group.items.map((item) => (
                <li key={item} className="rounded-xl bg-white/80 p-2 ring-1 ring-cloud">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-6 panel p-6 text-center md:p-8">
        <h3 className="text-xl font-bold">Launch your monitoring workflow today</h3>
        <p className="mt-2 text-sm text-slate-600">Create an account and start tracking your first competitor in minutes.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/auth" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
            Start Free
          </Link>
          <Link href="/pricing" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink ring-1 ring-cloud">
            View Pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
