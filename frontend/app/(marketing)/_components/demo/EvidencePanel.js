'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ExternalLink, Camera, Clock } from 'lucide-react';

const captures = [
  {
    id: 1, sku: 'B08P9-AMZ', product: 'Running Shoes Pro X2', platform: 'Amazon',
    url: 'amazon.com/dp/B08P9CVTFR', timestamp: '08:14 UTC', price: '$89.99',
    prevPrice: '$97.99', confidence: 98, status: 'verified',
  },
  {
    id: 2, sku: 'KIT-31-ETY', product: 'Handmade Craft Kit', platform: 'Etsy',
    url: 'etsy.com/listing/kit-31', timestamp: '07:58 UTC', price: '$34.50',
    prevPrice: '$36.00', confidence: 96, status: 'verified',
  },
  {
    id: 3, sku: 'B07WR-AMZ', product: 'Smart Speaker Gen 3', platform: 'Amazon',
    url: 'amazon.com/dp/B07WRXYZ', timestamp: '07:43 UTC', price: '$115.00',
    prevPrice: '$129.99', confidence: 99, status: 'verified',
  },
];

const totalCaptures = 317;
const barData = [{ p: 'Amazon', n: 142 }, { p: 'Shopify', n: 89 }, { p: 'WooCommerce', n: 56 }, { p: 'Etsy', n: 30 }];
const maxBar = Math.max(...barData.map(d => d.n));

export default function EvidencePanel() {
  const [selected, setSelected] = useState(0);
  const capture = captures[selected];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Captures', value: totalCaptures, icon: Camera },
          { label: 'This Week', value: 48, icon: Clock },
          { label: 'Avg Confidence', value: '97.7%', icon: null },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                {Icon && <Icon size={13} className="text-emerald-400" />}
                <p className="text-xl font-black text-primary">{s.value}</p>
              </div>
              <p className="text-[10px] text-tertiary mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Evidence viewer */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary">Evidence Viewer</p>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
              ✓ Audit-Ready
            </span>
          </div>

          {/* Capture navigator */}
          <div className="flex gap-1.5">
            {captures.map((c, i) => (
              <button key={c.id} onClick={() => setSelected(i)}
                className={`flex-1 rounded-lg border py-1.5 text-[10px] font-semibold transition ${selected === i ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.07] bg-white/[0.02] text-tertiary hover:text-secondary'
                  }`}>
                #{i + 1}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={selected}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {/* Mock screenshot */}
              <div className="relative h-28 rounded-xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 to-black overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[11px] font-mono text-white/50">{capture.url}</p>
                    <p className="text-2xl font-black text-white mt-1">{capture.price}</p>
                    <p className="text-[10px] text-zinc-500 line-through">{capture.prevPrice}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseSoft" />
                  <span className="text-[10px] font-bold text-emerald-400">Captured</span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="font-mono text-[10px] text-white/30">{capture.timestamp}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[`⏱ ${capture.timestamp}`, `🔗 ${capture.platform}`, `✓ ${capture.confidence}% confidence`].map(tag => (
                  <span key={tag} className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-tertiary">{tag}</span>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-white/[0.06] transition">
                  <Download size={12} /> Export
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-white/[0.06] transition">
                  <ExternalLink size={12} /> Source URL
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Platform distribution */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
          <p className="text-xs font-semibold text-primary">Capture Distribution</p>
          <div className="space-y-3">
            {barData.map((b, i) => (
              <div key={b.p}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-secondary">{b.p}</span>
                  <span className="text-xs font-bold text-primary">{b.n}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.n / maxBar) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5">
            <p className="text-[11px] text-emerald-400 font-semibold">📸 {totalCaptures} total captures stored</p>
            <p className="text-[10px] text-tertiary mt-0.5">Screenshots are encrypted at rest and retained per your plan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}