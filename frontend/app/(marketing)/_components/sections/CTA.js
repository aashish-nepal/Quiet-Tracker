'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section
      className="section-shell relative overflow-hidden rounded-2xl px-5 py-14 text-center sm:px-8 md:px-10 md:py-24"
      aria-labelledby="cta-title"
    >
      {/* Base dark background matching site theme */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: 'linear-gradient(160deg, #0f0f13 0%, #111118 50%, #0c0c10 100%)' }}
        aria-hidden="true"
      />

      {/* Subtle border glow */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.10)' }}
        aria-hidden="true"
      />

      {/* Brand blue radial glow — top center */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: '700px',
          height: '340px',
          background: 'radial-gradient(ellipse at center top, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Violet glow — bottom right accent */}
      <div
        className="pointer-events-none absolute -bottom-10 right-0 h-64 w-64 rounded-full blur-[80px]"
        style={{ background: 'rgba(124, 58, 237, 0.12)' }}
        aria-hidden="true"
      />

      {/* Subtle grid mesh */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-20"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Badge */}
        <span className="inline-block rounded-full border border-brand-500/30 bg-brand-600/10 px-4 py-1.5 text-xs font-semibold text-brand-400 backdrop-blur-sm">
          Invite-only beta · Limited spots
        </span>

        <h2 id="cta-title" className="mt-5 text-2xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
          Start monitoring competitor prices
          <br className="hidden sm:block" />
          <span className="gradient-text"> in under 5 minutes.</span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          Paste a URL, set your threshold, and get your first alert before the end of the day.
          No credit card required for the free plan.
        </p>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="mt-8 flex w-full justify-center sm:inline-flex sm:w-auto"
        >
          <Link
            href="/auth"
            className="btn-primary w-full rounded-full px-8 py-4 text-sm font-bold shadow-lg sm:w-auto"
          >
            Create Free Account →
          </Link>
        </motion.div>

        <p className="mt-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Free plan · No credit card · Cancel anytime
        </p>
      </div>
    </section>
  );
}
