'use client';

import { useState } from 'react';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PLATFORMS } from '../icons/PlatformIcons';

const statPills = [
  { label: 'Set up in minutes', icon: '⚡' },
  { label: 'Screenshot proof on alerts', icon: '📸' },
  { label: 'Slack & Discord alerts', icon: '🔔' },
];

// Triplicate for seamless marquee
const marqueeItems = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const liveEvents = [
  { name: 'Amazon B08P9 · Running Shoes', pct: '-8.1%', time: '2m ago', up: false },
  { name: 'Shopify SKU-190 · Wireless Ear', pct: '+2.4%', time: '6m ago', up: true },
  { name: 'Etsy KIT-31 · Handmade Kit', pct: '-4.2%', time: '11m ago', up: false },
  { name: 'Amazon B07WR · Smart Speaker', pct: '-11%', time: '18m ago', up: false },
];

export default function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -30]);
  const [marqueeHovered, setMarqueeHovered] = useState(false);

  return (
    <section
      className="section-shell relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[100px]" />
        <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-violet-600/8 blur-[80px]" />
      </div>

      <div className="premium-grid relative z-10">
        {/* Left copy */}
        <motion.div
          className="col-span-12 lg:col-span-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <span className="badge badge-blue">Revenue Protection Intelligence</span>
          </motion.div>

          <motion.h1
            id="hero-title"
            variants={item}
            className="mt-6 display-lg"
          >
            Stop getting{' '}
            <span className="gradient-text">surprised</span>{' '}
            by competitor price drops.
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-xl text-sm leading-relaxed sm:text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Quiet Tracker monitors competitor listings across Shopify, Amazon, WooCommerce, and Etsy — alerting you the moment prices change with screenshot proof.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/auth" className="btn-primary w-full text-center sm:w-auto">
              Start Free Monitoring →
            </Link>
            <Link href="#experience" className="btn-secondary w-full text-center sm:w-auto">
              View Demo
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-none md:flex-wrap md:overflow-visible md:pb-0">
            {statPills.map((pill) => (
              <span
                key={pill.label}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-secondary"
              >
                <span>{pill.icon}</span>
                {pill.label}
              </span>
            ))}
          </motion.div>

          {/* Mobile-only social proof strip */}
          <motion.div
            variants={item}
            className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 lg:hidden"
          >
            {[
              { value: '2 min', label: 'Setup time' },
              { value: '24/7', label: 'Monitoring' },
              { value: '100%', label: 'Screenshot proof' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-base font-black text-primary sm:text-lg">{stat.value}</span>
                <span className="text-[10px] leading-tight text-secondary">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — Product preview card (desktop only) */}
        <motion.div
          style={{ y }}
          className="col-span-12 hidden lg:col-span-6 lg:block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="card-elevated relative overflow-hidden rounded-2xl p-0.5" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.1), rgba(255,255,255,0.05))' }}>
            <div className="card rounded-[22px] p-5">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-400">Live Price Monitor</p>
                  <p className="mt-1 text-sm font-semibold text-primary">Competitor changes · Last 24h</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-red-400" />
                  2 active alerts
                </div>
              </div>

              {/* Mini chart */}
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <svg viewBox="0 0 420 140" className="h-32 w-full" role="img" aria-label="Price trend chart">
                  <defs>
                    <linearGradient id="heroGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M30 110 C90 94 130 78 180 88 C240 100 290 60 330 66 C355 68 375 52 390 38 L390 130 L30 130 Z" fill="url(#areaGrad)" />
                  <path d="M30 110 C90 94 130 78 180 88 C240 100 290 60 330 66 C355 68 375 52 390 38" fill="none" stroke="#a0a0a0" strokeWidth="1.5" opacity="0.15" />
                  <motion.path
                    d="M30 110 C90 94 130 78 180 88 C240 100 290 60 330 66 C355 68 375 52 390 38"
                    fill="none"
                    stroke="url(#heroGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.4 }}
                  />
                  <circle cx="330" cy="66" r="4" fill="#3b82f6" opacity="0.8" />
                  <circle cx="390" cy="38" r="5" fill="#ef4444" />
                  <motion.circle cx="390" cy="38" r="9" fill="#ef4444" opacity="0.3"
                    initial={{ r: 5 }} animate={{ r: [5, 12, 5] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }} />
                </svg>
              </div>

              {/* Activity feed */}
              <div className="mt-4 space-y-2">
                {liveEvents.slice(0, 3).map((event, i) => (
                  <motion.div
                    key={event.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2.5"
                  >
                    <span className="truncate text-xs text-secondary">{event.name}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-xs font-bold ${event.up ? 'text-green-400' : 'text-red-400'}`}>{event.pct}</span>
                      <span className="text-[10px] text-tertiary">{event.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── "Tracks products from" strip ──────────────────────────── */}
      <motion.div
        className="relative mt-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Divider line */}
        <div className="mb-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Tracks products from
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Fade edge masks */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-8 z-10 w-20"
          style={{ background: 'linear-gradient(to right, var(--color-bg, #080808) 30%, transparent)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-8 z-10 w-20"
          style={{ background: 'linear-gradient(to left, var(--color-bg, #080808) 30%, transparent)' }}
        />

        {/* Infinite marquee — pauses on hover */}
        <div
          className="overflow-hidden cursor-pointer"
          onMouseEnter={() => setMarqueeHovered(true)}
          onMouseLeave={() => setMarqueeHovered(false)}
        >
          <div
            className="marquee-track flex items-center gap-3"
            style={{
              animation: 'heroMarquee 28s linear infinite',
              animationPlayState: marqueeHovered ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {marqueeItems.map(({ name, color, bg, border, Icon }, idx) => (
              <div
                key={`${name}-${idx}`}
                className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity duration-200"
                style={{
                  color,
                  background: bg,
                  border: `1px solid ${border}`,
                  boxShadow: `0 2px 12px ${bg}`,
                }}
              >
                <Icon />
                {name}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes heroMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  );
}
