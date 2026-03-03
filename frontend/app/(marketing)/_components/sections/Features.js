'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Radar, ScanSearch, ShieldCheck, TrendingDown, Zap } from 'lucide-react';

const features = [
  {
    id: 'alerts',
    icon: BellRing,
    tag: 'Smart Alerting',
    title: 'Know the moment it matters',
    body: 'Threshold-based alerts filter out noise — you only get notified when competitor prices cross meaningful boundaries. Delivery via email, Slack, or Discord.',
    metric: { value: '< 2m', label: 'Average detection time' },
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.18)',
    gradient: 'from-blue-500 to-cyan-400',
    span: 'lg:col-span-2',
    visual: () => (
      <div className="space-y-2 mt-1">
        {[
          { name: 'Amazon B08P9 · Running Shoes', pct: '-8.1%', from: '$97.99', to: '$89.99', up: false, t: '2m ago' },
          { name: 'Shopify SKU-190 · Earbuds', pct: '+2.4%', from: '$57.60', to: '$59.00', up: true, t: '6m ago' },
          { name: 'Etsy KIT-31 · Handmade Kit', pct: '-4.2%', from: '$36.00', to: '$34.50', up: false, t: '11m ago' },
        ].map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5"
          >
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.up ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="min-w-0 flex-1 truncate text-xs text-secondary">{a.name}</span>
            <span className={`shrink-0 text-xs font-bold ${a.up ? 'text-green-400' : 'text-red-400'}`}>{a.pct}</span>
            <span className="shrink-0 text-[10px] text-tertiary">{a.t}</span>
          </motion.div>
        ))}
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2">
          <span className="text-[11px] text-tertiary">Delivered via</span>
          {['✉ Email', '💬 Slack', '🎮 Discord'].map(c => (
            <span key={c} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-secondary">{c}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'evidence',
    icon: ScanSearch,
    tag: 'Evidence Capture',
    title: 'Screenshot proof on every alert',
    body: 'Every price change alert includes a timestamped screenshot so your team can act with full confidence.',
    metric: { value: '100%', label: 'Timestamped captures' },
    color: '#10b981',
    glow: 'rgba(16,185,129,0.18)',
    gradient: 'from-emerald-500 to-teal-400',
    span: 'lg:col-span-1',
    visual: () => (
      <div className="mt-1 rounded-xl border border-white/[0.07] bg-black/30 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Evidence Log</span>
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-400/20">Live Capture</span>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 h-20 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="text-center">
            <p className="text-[11px] font-mono text-emerald-400">amazon.com/dp/B08P9CVTFR</p>
            <p className="text-[10px] text-tertiary mt-1">$89.99 · Captured 07:42 UTC</p>
          </div>
          <motion.div
            className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['Confidence: 98%', 'Source: Amazon PDP', 'Auto-export'].map(tag => (
            <span key={tag} className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-tertiary">{tag}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'intelligence',
    icon: Radar,
    tag: 'Pattern Intelligence',
    title: 'See who underprices most — and when',
    body: 'Detect patterns across competitors and products so you can predict their moves before they hurt your margins.',
    metric: { value: '30d', label: 'Trend history' },
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.18)',
    gradient: 'from-violet-500 to-purple-400',
    span: 'lg:col-span-1',
    visual: () => (
      <div className="mt-1">
        <svg viewBox="0 0 200 80" className="h-20 w-full" role="img" aria-label="Pattern intelligence chart">
          <defs>
            <linearGradient id="featGradV" x1="0%" x2="100%" y1="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="featAreaV" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M10 65 C40 45 70 58 100 40 C130 24 160 38 190 22 L190 72 L10 72 Z" fill="url(#featAreaV)" />
          <motion.path
            d="M10 65 C40 45 70 58 100 40 C130 24 160 38 190 22"
            fill="none" stroke="url(#featGradV)" strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          {[{ cx: 100, cy: 40 }, { cx: 190, cy: 22 }].map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="#a855f7" opacity="0.9" />
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[{ label: 'Amazon', val: '68%', color: 'text-orange-400' }, { label: 'Shopify', val: '22%', color: 'text-green-400' }, { label: 'Etsy', val: '10%', color: 'text-rose-400' }].map(r => (
            <div key={r.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] py-2">
              <p className={`text-sm font-bold ${r.color}`}>{r.val}</p>
              <p className="text-[10px] text-tertiary">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'team',
    icon: ShieldCheck,
    tag: 'Team Controls',
    title: 'Role-based access + full audit trail',
    body: 'Assign owner and analyst roles. Every action is logged with an immutable trail for accountability.',
    metric: { value: '∞', label: 'Audit retention' },
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.18)',
    gradient: 'from-amber-500 to-orange-400',
    span: 'lg:col-span-2',
    visual: () => (
      <div className="mt-1 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">Access Control</p>
          {[
            { role: 'Pricing Lead', access: 'Owner', color: '#60a5fa' },
            { role: 'Growth Analyst', access: 'View + Export', color: '#a78bfa' },
            { role: 'Operations', access: 'View only', color: '#6b7280' },
          ].map(r => (
            <div key={r.role} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
              <span className="text-xs text-secondary">{r.role}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}30` }}>
                {r.access}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">Audit Log</p>
          {[
            '08:11 UTC · Alert rule updated',
            '08:03 UTC · Evidence exported',
            '07:58 UTC · Member added',
          ].map(e => (
            <div key={e} className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2 font-mono text-[10px] text-tertiary">{e}</div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Features() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="section-shell" aria-labelledby="feature-title">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">What You Get</p>
        <h2 id="feature-title" className="mt-4 display-md">
          Everything you need to stay{' '}
          <span className="gradient-text">ahead of the market.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-secondary sm:text-base">
          A complete toolkit for commerce teams serious about protecting their pricing margins — built for speed and clarity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          const Visual = feat.visual;
          const isHovered = hovered === feat.id;

          return (
            <motion.article
              key={feat.id}
              onHoverStart={() => setHovered(feat.id)}
              onHoverEnd={() => setHovered(null)}
              className={`card group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.15] md:p-6 ${feat.span}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Glow on hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ background: `radial-gradient(circle at 25% 40%, ${feat.glow}, transparent 65%)` }}
              />

              <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.gradient} shadow-lg`}>
                      <Icon size={17} className="text-white" aria-hidden="true" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-secondary">
                      {feat.tag}
                    </span>
                  </div>
                  {/* Metric pill */}
                  <div className="shrink-0 text-right">
                    <span className={`text-xl font-black bg-gradient-to-r ${feat.gradient} bg-clip-text text-transparent`}>{feat.metric.value}</span>
                    <p className="text-[10px] text-tertiary leading-snug">{feat.metric.label}</p>
                  </div>
                </div>

                <h3 className="mt-4 text-base font-semibold leading-snug text-primary">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{feat.body}</p>

                {/* Visual preview */}
                <div className="mt-4">
                  <Visual />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
