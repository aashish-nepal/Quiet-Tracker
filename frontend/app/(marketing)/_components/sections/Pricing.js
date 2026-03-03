'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, ShieldCheck, BarChart3, Download, Bell, Users, Clock } from 'lucide-react';

const featureRows = [
  { icon: BarChart3, label: 'Tracked products', free: '2', starter: '20', highlight: true },
  { icon: Clock, label: 'Check frequency', free: 'Every 24h', starter: 'Every 12h ⚡', highlight: false },
  { icon: Bell, label: 'Alert channels', free: 'Email only', starter: 'Email + Slack + Discord', highlight: false },
  { icon: BarChart3, label: 'Price history', free: '7 days', starter: '30 days', highlight: false },
  { icon: Zap, label: 'Processing priority', free: 'Standard', starter: 'Priority ⚡', highlight: false },
  { icon: Download, label: 'CSV history export', free: false, starter: true, highlight: false },
  { icon: ShieldCheck, label: 'Team access + audit', free: false, starter: true, highlight: false },
  { icon: Check, label: 'Screenshot evidence', free: true, starter: true, highlight: false },
];

const plans = [
  {
    name: 'Free',
    tagline: 'For basic visibility',
    monthly: 0, yearly: 0,
    features: ['2 tracked products', 'Price check every 24h', 'Email alerts only', '7-day price history', 'Basic dashboard'],
    notIncluded: ['Slack & Discord alerts', 'Priority processing', 'CSV history export'],
    cta: 'Start Free', ctaHref: '/auth', style: 'default',
  },
  {
    name: 'Starter',
    tagline: 'For growing stores and lean agencies',
    monthly: 29, yearly: 290,
    badge: 'Most Popular',
    features: ['20 tracked products', '12-hour tracking', 'Email, Slack & Discord alerts', '30-day price history', 'Priority processing', 'Price change % view', 'CSV history export', 'Team access + audit logs'],
    notIncluded: [],
    cta: 'Get Started', ctaHref: '/auth?plan=starter', style: 'featured',
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const activePlans = useMemo(() => plans.map(p => ({ ...p, price: yearly ? p.yearly : p.monthly })), [yearly]);

  return (
    <section id="pricing" className="section-shell" aria-labelledby="pricing-title">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Pricing</p>
          <h2 id="pricing-title" className="mt-4 display-lg">
            Simple, transparent{' '}
            <span className="gradient-text">pricing.</span>
          </h2>
          <p className="mt-3 text-base text-secondary">No hidden fees. No credit card for free plan. Cancel anytime.</p>
        </div>

        {/* Billing toggle */}
        <div className="relative inline-flex items-center self-start rounded-full border border-white/10 bg-white/[0.04] p-1 sm:self-auto">
          <motion.div layout className="absolute inset-y-1 rounded-full bg-brand-600"
            style={{ left: yearly ? '50%' : '4px', right: yearly ? '4px' : '50%' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} />
          <button onClick={() => setYearly(false)}
            className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${!yearly ? 'text-white' : 'text-secondary'}`}>
            Monthly
          </button>
          <button onClick={() => setYearly(true)}
            className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${yearly ? 'text-white' : 'text-secondary'}`}>
            Yearly
            <span className="ml-1.5 rounded-full bg-green-500/20 px-1.5 py-0.5 text-[10px] font-bold text-green-400">-17%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {activePlans.map((plan) => (
          <article key={plan.name}
            className={`relative overflow-hidden rounded-2xl p-0.5 ${plan.style === 'featured'
              ? 'bg-gradient-to-br from-brand-500/40 via-violet-500/20 to-brand-600/30'
              : 'border border-white/[0.08] bg-transparent'
              }`}
          >
            <div className="h-full rounded-[22px] bg-card p-4 md:p-8">
              {plan.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold text-white">
                  {plan.badge}
                </span>
              )}

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">{plan.name}</p>

              <div className="mt-4 flex items-end gap-2">
                <AnimatePresence mode="wait">
                  <motion.span key={plan.price}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-5xl font-black text-primary">
                    ${plan.price}
                  </motion.span>
                </AnimatePresence>
                {plan.price > 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-secondary">/{yearly ? 'yr' : 'mo'}</p>
                    {yearly && <p className="text-[10px] text-green-400 font-semibold">Save ${plan.monthly * 12 - plan.yearly}/yr</p>}
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-secondary">{plan.tagline}</p>

              {/* Features */}
              <ul className="mt-6 space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span className="text-primary">{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-tertiary">
                      <X size={10} strokeWidth={2.5} />
                    </span>
                    <span className="text-tertiary">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`${plan.ctaHref}${yearly ? (plan.ctaHref.includes('?') ? '&' : '?') + 'billingInterval=yearly' : ''}`}
                className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-bold transition ${plan.style === 'featured'
                  ? 'btn-primary'
                  : 'border border-white/15 bg-white/[0.05] text-primary hover:bg-white/10'
                  }`}
              >
                {plan.cta} →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Guarantee */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">✓ 7-day free trial</span>
        <p className="text-sm text-secondary">New Starter subscribers get a 7-day free trial. Cancel anytime — no questions asked.</p>
      </div>

      {/* Full comparison table — collapsible */}
      <div className="mt-6">
        <button
          onClick={() => setShowTable(v => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-left transition hover:bg-white/[0.04]"
        >
          <span className="text-sm font-semibold text-primary">Full plan comparison</span>
          <motion.span
            animate={{ rotate: showTable ? 180 : 0 }}
            transition={{ duration: 0.22 }}
            className="text-tertiary text-sm"
          >▾</motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 card rounded-2xl overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-5 py-4 text-left text-xs font-semibold text-tertiary">Feature</th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-secondary">Free</th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-brand-400">Starter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureRows.map((row, i) => {
                      const Icon = row.icon;
                      return (
                        <motion.tr
                          key={row.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                          className={`border-b border-white/[0.04] last:border-none ${row.highlight ? 'bg-brand-600/5' : ''}`}
                        >
                          <td className="flex items-center gap-3 px-5 py-3.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                              <Icon size={13} className="text-tertiary" />
                            </div>
                            <span className={`font-medium ${row.highlight ? 'text-primary' : 'text-secondary'}`}>{row.label}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {row.free === false ? (
                              <span className="text-tertiary">—</span>
                            ) : row.free === true ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-secondary mx-auto">
                                <Check size={11} strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="text-secondary text-xs">{row.free}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {row.starter === false ? (
                              <span className="text-tertiary">—</span>
                            ) : row.starter === true ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600/20 text-brand-400 mx-auto">
                                <Check size={11} strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="text-brand-400 font-semibold text-xs">{row.starter}</span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
