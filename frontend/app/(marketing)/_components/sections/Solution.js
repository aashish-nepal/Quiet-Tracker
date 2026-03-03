'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, RefreshCw, BellRing, ChevronRight, ExternalLink, Check } from 'lucide-react';


const steps = [
  {
    number: '01',
    icon: Link2,
    tag: 'Setup',
    title: 'Paste any competitor URL',
    desc: 'Drop in a product link from Shopify, WooCommerce, Amazon, or Etsy. Quiet Tracker extracts the price, product name, and relevant metadata automatically.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.15)',
    gradient: 'from-blue-500 to-cyan-400',
    preview: 'url-input',
  },
  {
    number: '02',
    icon: RefreshCw,
    tag: 'Monitoring',
    title: 'We check prices automatically',
    desc: 'Our infrastructure polls competitor listings on your schedule — every 12h on Starter, every 24h on Free — with screenshot capture on every check for evidence.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.15)',
    gradient: 'from-violet-500 to-purple-400',
    preview: 'monitoring-grid',
  },
  {
    number: '03',
    icon: BellRing,
    tag: 'Alerts',
    title: 'Get alerted the moment prices change',
    desc: 'Receive instant email, Slack, or Discord notifications the moment a competitor crosses your threshold — with price diff, % change, and screenshot proof attached.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.15)',
    gradient: 'from-emerald-500 to-teal-400',
    preview: 'alert-feed',
  },
];

/* ── Preview panels ─────────────────────────────── */

function URLInputPreview({ active }) {
  const [typed, setTyped] = useState('');
  const fullUrl = 'https://www.amazon.com/dp/B08P9CVTFR/';

  useEffect(() => {
    if (!active) { setTyped(''); return; }
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(fullUrl.slice(0, i));
      if (i >= fullUrl.length) clearInterval(t);
    }, 38);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="space-y-4">
      {/* URL input */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-3">Add Competitor Product</p>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5">
          <Link2 size={13} className="shrink-0 text-blue-400" />
          <span className="flex-1 truncate font-mono text-xs text-white/80">
            {typed}
            <motion.span
              className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { name: 'Shopify', color: '#96bf48', bg: 'rgba(150,191,72,0.08)', border: 'rgba(150,191,72,0.22)' },
            { name: 'WooCommerce', color: '#9b6fd0', bg: 'rgba(127,84,179,0.08)', border: 'rgba(127,84,179,0.22)' },
            { name: 'Amazon', color: '#ff9900', bg: 'rgba(255,153,0,0.08)', border: 'rgba(255,153,0,0.22)' },
            { name: 'Etsy', color: '#f56400', bg: 'rgba(245,100,0,0.08)', border: 'rgba(245,100,0,0.22)' },
          ].map(({ name, color, bg, border }) => (
            <div
              key={name}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ color, background: bg, border: `1px solid ${border}` }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
      {/* Extracted card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: typed.length > 30 ? 1 : 0, y: typed.length > 30 ? 0 : 8 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-lg">📦</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary">Amazon Smart Speaker B08P9CVTFR</p>
            <p className="text-xs text-blue-400 font-bold mt-0.5">$49.99 detected</p>
          </div>
          <span className="ml-auto shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
            <Check size={13} strokeWidth={3} />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

const monitoredProducts = [
  { name: 'Running Shoes B08P9', platform: 'Amazon', price: '$89.99', status: 'checked', color: '#ff9900', ago: '2m ago' },
  { name: 'Wireless Earbuds SKU-190', platform: 'Shopify', price: '$59.00', status: 'checking', color: '#96bf48', ago: 'checking…' },
  { name: 'Handmade Kit KIT-31', platform: 'Etsy', price: '$34.50', status: 'checked', color: '#f56400', ago: '14m ago' },
  { name: 'Smart Watch WC-2023', platform: 'WooCommerce', price: '$129.00', status: 'checked', color: '#9b6fd0', ago: '22m ago' },
];

function MonitoringPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Active Monitors</p>
        <div className="flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-400">
          <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-violet-400" />
          Live
        </div>
      </div>
      <div className="space-y-2">
        {monitoredProducts.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
          >
            <div
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background: p.status === 'checking' && tick % 2 === 0 ? p.color : p.color,
                opacity: p.status === 'checking' ? (tick % 2 === 0 ? 1 : 0.3) : 1,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-primary">{p.name}</p>
              <p className="text-[11px] text-tertiary">{p.platform}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-bold text-primary">{p.price}</p>
              <p className="text-[10px] text-tertiary">{p.status === 'checking' ? (tick % 2 === 0 ? 'checking…' : 'checking') : p.ago}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Schedule bar */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-tertiary">Next check cycle</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
              animate={{ width: ['15%', '85%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <span className="text-[11px] font-semibold text-violet-400">11h 42m</span>
        </div>
      </div>
    </div>
  );
}

const alertFeed = [
  { product: 'Amazon B08P9 · Running Shoes', pct: '-8.1%', from: '$97.99', to: '$89.99', time: '2m ago', up: false },
  { product: 'Shopify SKU-190 · Wireless Ear', pct: '+2.4%', from: '$57.60', to: '$59.00', time: '6m ago', up: true },
  { product: 'Etsy KIT-31 · Handmade Kit', pct: '-4.2%', from: '$36.00', to: '$34.50', time: '11m ago', up: false },
];

function AlertFeedPreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Live Alert Feed</p>
        <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-red-400" />
          2 active
        </span>
      </div>
      {alertFeed.map((alert, i) => (
        <motion.div
          key={alert.product}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="rounded-xl border border-white/[0.07] bg-white/[0.025] overflow-hidden"
        >
          <div className={`h-0.5 w-full ${alert.up ? 'bg-green-400' : 'bg-red-400'} opacity-60`} />
          <div className="px-3 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-primary">{alert.product}</p>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-tertiary">
                <span className="line-through">{alert.from}</span>
                <span>→</span>
                <span className={`font-semibold ${alert.up ? 'text-green-400' : 'text-red-400'}`}>{alert.to}</span>
              </div>
            </div>
            <div className="shrink-0 text-right space-y-1">
              <span className={`block text-sm font-black ${alert.up ? 'text-green-400' : 'text-red-400'}`}>{alert.pct}</span>
              <span className="block text-[10px] text-tertiary">{alert.time}</span>
            </div>
          </div>
          <div className="flex border-t border-white/[0.05] divide-x divide-white/[0.05]">
            <button className="flex-1 py-1.5 text-center text-[10px] font-semibold text-secondary hover:text-primary hover:bg-white/[0.03] transition">
              View Evidence
            </button>
            <button className="flex-1 py-1.5 text-center text-[10px] font-semibold text-secondary hover:text-primary hover:bg-white/[0.03] transition">
              Open in Slack
            </button>
          </div>
        </motion.div>
      ))}
      {/* Channels row */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <span className="text-[11px] text-tertiary">Delivered via</span>
        {['✉ Email', '💬 Slack', '🎮 Discord'].map((ch) => (
          <span key={ch} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-secondary">{ch}</span>
        ))}
      </div>
    </div>
  );
}

const previewMap = {
  'url-input': URLInputPreview,
  'monitoring-grid': MonitoringPreview,
  'alert-feed': AlertFeedPreview,
};


export default function Solution() {
  const [active, setActive] = useState(0);
  const activeStep = steps[active];
  const PreviewComponent = previewMap[activeStep.preview];

  return (
    <section id="how-it-works" className="section-shell" aria-labelledby="solution-title">
      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">How It Works</p>
        <h2 id="solution-title" className="mt-4 display-lg">
          From URL to alert in{' '}
          <span className="gradient-text">3 simple steps.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-secondary sm:text-base">
          No spreadsheets, no manual checking — automated intelligence that responds before you even wake up.
        </p>
      </div>

      {/* Main interactive panel */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">

          {/* ── Left: steps ─────────────────────────── */}
          <div className="flex flex-col gap-1 border-b border-white/[0.06] p-5 md:p-7 lg:border-b-0 lg:border-r">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = active === i;
              return (
                <button
                  key={step.number}
                  onClick={() => setActive(i)}
                  className={`group relative w-full rounded-2xl p-5 text-left transition-all duration-300 ${isActive
                    ? 'border border-white/[0.1] bg-white/[0.04]'
                    : 'border border-transparent hover:border-white/[0.07] hover:bg-white/[0.02]'
                    }`}
                >
                  {/* Active left accent bar */}
                  {isActive && (
                    <motion.div
                      layoutId="active-bar"
                      className="absolute left-0 inset-y-3 w-0.5 rounded-full"
                      style={{ background: step.color }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${isActive
                        ? `bg-gradient-to-br ${step.gradient} shadow-lg`
                        : 'bg-white/[0.05] border border-white/[0.08]'
                        }`}
                    >
                      <Icon
                        size={17}
                        className={isActive ? 'text-white' : 'text-tertiary group-hover:text-secondary transition'}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold" style={{ color: isActive ? step.color : 'var(--text-tertiary)' }}>
                          {step.number}
                        </span>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-tertiary">
                          {step.tag}
                        </span>
                      </div>
                      <h3 className={`text-sm font-semibold transition ${isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}>
                        {step.title}
                      </h3>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-2 text-sm leading-relaxed text-secondary"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <ChevronRight
                      size={15}
                      className={`mt-0.5 shrink-0 transition-all duration-300 ${isActive ? 'text-secondary rotate-90' : 'text-tertiary/40 group-hover:text-tertiary rotate-0'
                        }`}
                    />
                  </div>
                </button>
              );
            })}

            {/* Progress dots */}
            <div className="mt-4 flex items-center gap-2 px-5">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    background: active === i ? s.color : 'rgba(255,255,255,0.1)',
                    width: active === i ? 24 : 8,
                  }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
              <span className="ml-auto text-[11px] text-tertiary">{active + 1} / {steps.length}</span>
            </div>
          </div>

          {/* ── Right: live preview ──────────────────── */}
          <div className="p-5 md:p-7">
            <div className="mb-5 flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-lg text-white"
                style={{ background: `linear-gradient(135deg, ${activeStep.color}, ${activeStep.color}88)` }}
              >
                {(() => { const Icon = activeStep.icon; return <Icon size={13} />; })()}
              </div>
              <span className="text-xs font-semibold text-secondary">{activeStep.tag} Preview</span>
              <span className="ml-auto flex items-center gap-1.5 text-[11px] text-tertiary">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseSoft" />
                Live simulation
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.preview}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <PreviewComponent active={active === steps.findIndex(s => s.preview === activeStep.preview)} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
