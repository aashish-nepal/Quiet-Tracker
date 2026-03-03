'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowUp, Bell, ExternalLink, Filter, RefreshCw } from 'lucide-react';

const allAlerts = [
  { id: 1, sku: 'B08P9-AMZ', product: 'Running Shoes Pro X2', platform: 'Amazon', from: 97.99, to: 89.99, pct: -8.1, severity: 'high', ago: '2m', channel: 'Slack' },
  { id: 2, sku: 'SKU-190-SHO', product: 'Wireless Earbuds Ultra', platform: 'Shopify', from: 57.60, to: 59.00, pct: 2.4, severity: 'low', ago: '6m', channel: 'Email' },
  { id: 3, sku: 'KIT-31-ETY', product: 'Handmade Craft Kit', platform: 'Etsy', from: 36.00, to: 34.50, pct: -4.2, severity: 'medium', ago: '11m', channel: 'Discord' },
  { id: 4, sku: 'B07WR-AMZ', product: 'Smart Speaker Gen 3', platform: 'Amazon', from: 129.99, to: 115.00, pct: -11.0, severity: 'high', ago: '18m', channel: 'Slack' },
  { id: 5, sku: 'WOO-2091', product: 'Yoga Mat Premium', platform: 'WooCommerce', from: 45.00, to: 42.00, pct: -6.7, severity: 'medium', ago: '31m', channel: 'Email' },
];

const severityConfig = {
  high: { label: 'High', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  medium: { label: 'Medium', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  low: { label: 'Low', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
};

const riskTrend = [24, 38, 52, 44, 69, 58, 74, 61];

export default function AlertsPanel() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const filtered = filter === 'all' ? allAlerts : allAlerts.filter(a => a.severity === filter);
  const highCount = allAlerts.filter(a => a.severity === 'high').length;
  const totalDrop = allAlerts.filter(a => a.pct < 0).reduce((s, a) => s + Math.abs(a.pct), 0).toFixed(1);

  const maxRisk = Math.max(...riskTrend);
  const W = 240, H = 60;
  const pts = riskTrend.map((v, i) => `${(i / (riskTrend.length - 1)) * W},${H - (v / maxRisk) * (H - 8)}`).join(' ');
  const polyPts = `0,${H} ${pts} ${W},${H}`;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Alerts', value: allAlerts.length, color: 'text-primary', sub: 'last 24h' },
          { label: 'High Severity', value: highCount, color: 'text-red-400', sub: 'require action' },
          { label: 'Avg Drop', value: `-${totalDrop}%`, color: 'text-amber-400', sub: 'across undercuts' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] font-semibold text-secondary mt-0.5">{s.label}</p>
            <p className="text-[10px] text-tertiary">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Mini risk chart */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-primary">Undercut Risk — Last 24h</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulseSoft" />
            <span className="text-[11px] text-red-400 font-semibold">Risk: {riskTrend[tick % riskTrend.length]}</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-14 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="riskGrad" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="riskArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1={H - (60 / maxRisk) * (H - 8)} x2={W} y2={H - (60 / maxRisk) * (H - 8)}
            stroke="rgba(239,68,68,0.3)" strokeDasharray="3 3" strokeWidth="1" />
          <polygon points={polyPts} fill="url(#riskArea)" />
          <polyline points={pts} fill="none" stroke="url(#riskGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-[10px] text-tertiary mt-1">Dashed line = 60 risk threshold. Alerts fire above threshold.</p>
      </div>

      {/* Filter tabs + alert list */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-tertiary" />
          {['all', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition capitalize ${filter === f ? 'bg-brand-600 text-white' : 'border border-white/[0.08] bg-white/[0.03] text-secondary hover:text-primary'
                }`}
            >
              {f === 'all' ? `All (${allAlerts.length})` : f}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-tertiary">{filtered.length} shown</span>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(alert => {
              const sev = severityConfig[alert.severity];
              const isDown = alert.pct < 0;
              const isExp = expanded === alert.id;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <button
                    onClick={() => setExpanded(isExp ? null : alert.id)}
                    className="w-full text-left rounded-xl border border-white/[0.06] bg-black/20 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${isDown ? 'bg-red-400' : 'bg-green-400'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-primary">{alert.product}</p>
                        <p className="text-[10px] text-tertiary">{alert.platform} · {alert.sku}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-sm font-black ${isDown ? 'text-red-400' : 'text-green-400'}`}>
                          {isDown ? <ArrowDown size={11} className="inline" /> : <ArrowUp size={11} className="inline" />}
                          {Math.abs(alert.pct)}%
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold border ${sev.bg} ${sev.text} ${sev.border}`}>
                        {sev.label}
                      </span>
                    </div>
                    <AnimatePresence>
                      {isExp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-white/[0.05] px-3 py-3 grid grid-cols-3 gap-2 text-center"
                        >
                          <div>
                            <p className="text-[10px] text-tertiary">Was</p>
                            <p className="text-xs font-semibold text-secondary line-through">${alert.from}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-tertiary">Now</p>
                            <p className={`text-xs font-bold ${isDown ? 'text-red-400' : 'text-green-400'}`}>${alert.to}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-tertiary">Via</p>
                            <p className="text-xs font-semibold text-secondary">{alert.channel}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}