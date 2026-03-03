'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const weekData = [
  { d: 'Mon', you: 32.3, comp: 31.5 },
  { d: 'Tue', you: 32.1, comp: 31.2 },
  { d: 'Wed', you: 31.9, comp: 30.7 },
  { d: 'Thu', you: 32.4, comp: 30.9 },
  { d: 'Fri', you: 32.2, comp: 30.8 },
  { d: 'Sat', you: 32.7, comp: 31.1 },
  { d: 'Sun', you: 33.1, comp: 30.6 },
];

const competitors = [
  { name: 'Rival A (Amazon)', drops: 14, avgDrop: '-6.8%', threat: 'high', color: '#ef4444' },
  { name: 'Rival B (Shopify)', drops: 7, avgDrop: '-3.2%', threat: 'medium', color: '#f59e0b' },
  { name: 'Rival C (Etsy)', drops: 3, avgDrop: '-1.9%', threat: 'low', color: '#22c55e' },
];

const threatColors = { high: 'text-red-400 border-red-500/20 bg-red-500/10', medium: 'text-amber-400 border-amber-500/20 bg-amber-500/10', low: 'text-green-400 border-green-500/20 bg-green-500/10' };

export default function AnalyticsPanel() {
  const [view, setView] = useState('margin');

  const W = 360, H = 100;
  const minV = Math.min(...weekData.map(d => Math.min(d.you, d.comp))) - 0.5;
  const maxV = Math.max(...weekData.map(d => Math.max(d.you, d.comp))) + 0.5;
  const scale = v => H - ((v - minV) / (maxV - minV)) * (H - 12);
  const youPts = weekData.map((d, i) => `${(i / (weekData.length - 1)) * W},${scale(d.you)}`).join(' ');
  const compPts = weekData.map((d, i) => `${(i / (weekData.length - 1)) * W},${scale(d.comp)}`).join(' ');
  const youArea = `0,${H} ${youPts} ${W},${H}`;

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Your Avg Margin', value: '32.5%', delta: '+0.4%', up: true },
          { label: 'Comp. Median', value: '31.0%', delta: '-0.2%', up: false },
          { label: 'Margin Lead', value: '+1.5pp', delta: 'Protected', up: true },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xl font-black text-primary">{k.value}</p>
            <p className="text-[10px] text-tertiary mt-0.5">{k.label}</p>
            <div className={`mt-1.5 flex items-center gap-1 text-[11px] font-semibold ${k.up ? 'text-green-400' : 'text-red-400'}`}>
              {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Margin chart */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-primary">Margin Stability vs Competitor Median</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-blue-500 inline-block" />You</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-red-400/60 inline-block" />Competitors</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="aYou" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={youArea} fill="url(#aYou)" />
          <motion.polyline points={compPts} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3"
            strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }} />
          <motion.polyline points={youPts} fill="none" stroke="#3b82f6" strokeWidth="2.5"
            strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }} />
          {weekData.map((d, i) => (
            <circle key={i} cx={(i / (weekData.length - 1)) * W} cy={scale(d.you)} r="3" fill="#3b82f6" />
          ))}
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-tertiary">
          {weekData.map(d => <span key={d.d}>{d.d}</span>)}
        </div>
      </div>

      {/* Competitor threat table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <p className="text-xs font-semibold text-primary mb-3">Competitor Threat Ranking — Last 30d</p>
        <div className="space-y-2">
          {competitors.map((c, i) => (
            <motion.div key={c.name}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/15 px-3 py-2.5"
            >
              <span className="text-xs font-mono text-tertiary w-4">#{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-primary">{c.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-secondary">{c.drops} drops</p>
                <p className="text-[10px] text-red-400">{c.avgDrop} avg</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${threatColors[c.threat]}`}>
                {c.threat}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
