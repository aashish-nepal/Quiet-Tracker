'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, MessageSquare, User, Users } from 'lucide-react';

const members = [
  { name: 'Sarah K.', role: 'Owner', avatar: 'SK', color: '#60a5fa', actions: 24, last: '08:14 UTC' },
  { name: 'James M.', role: 'Analyst', avatar: 'JM', color: '#a78bfa', actions: 11, last: '07:58 UTC' },
  { name: 'Priya S.', role: 'Analyst', avatar: 'PS', color: '#34d399', actions: 7, last: 'Yesterday' },
];

const auditLog = [
  { actor: 'Sarah K.', action: 'Updated alert threshold for B08P9', time: '08:11 UTC', type: 'rule' },
  { actor: 'James M.', action: 'Exported evidence CSV — last 30d', time: '08:03 UTC', type: 'export' },
  { actor: 'Sarah K.', action: 'Added Priya S. as Analyst', time: '07:58 UTC', type: 'member' },
  { actor: 'James M.', action: 'Acknowledged alert KIT-31-ETY', time: '07:44 UTC', type: 'alert' },
  { actor: 'Priya S.', action: 'Viewed evidence for RUN-14-SHO', time: 'Yesterday', type: 'view' },
];

const typeConfig = {
  rule: { icon: '⚙', color: 'text-blue-400' },
  export: { icon: '📥', color: 'text-emerald-400' },
  member: { icon: '👤', color: 'text-violet-400' },
  alert: { icon: '🔔', color: 'text-amber-400' },
  view: { icon: '👁', color: 'text-secondary' },
};

const workflow = [
  { step: '01', who: 'Pricing Lead', icon: User, action: 'Receives Slack/Discord alert with price diff + screenshot', color: '#3b82f6' },
  { step: '02', who: 'Shared Dashboard', icon: Users, action: 'Full team sees live alert feed and evidence log in real time', color: '#a855f7' },
  { step: '03', who: 'Pricing Lead', icon: CheckCircle2, action: 'Approves response action — median time to action: 11 minutes', color: '#22c55e' },
];

export default function TeamPanel() {
  const [tab, setTab] = useState('members');

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Team Members', value: members.length, icon: Users },
          { label: 'Actions Logged', value: 42, icon: Clock },
          { label: 'Median Response', value: '11m', icon: MessageSquare },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <Icon size={13} className="text-violet-400" />
                <p className="text-xl font-black text-primary">{s.value}</p>
              </div>
              <p className="text-[10px] text-tertiary mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1.5">
        {['members', 'audit', 'workflow'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition ${tab === t ? 'bg-brand-600 text-white' : 'text-secondary hover:text-primary'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'members' && (
          <motion.div key="members"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="space-y-2"
          >
            {members.map((m, i) => (
              <motion.div key={m.name}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: `${m.color}28`, border: `1.5px solid ${m.color}40`, color: m.color }}>
                  {m.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary">{m.name}</p>
                  <p className="text-[10px] text-tertiary">{m.actions} actions · last active {m.last}</p>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
                  {m.role}
                </span>
              </motion.div>
            ))}
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01] py-3 text-center">
              <p className="text-[11px] text-tertiary">+ Invite more team members</p>
            </div>
          </motion.div>
        )}

        {tab === 'audit' && (
          <motion.div key="audit"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="space-y-2"
          >
            {auditLog.map((entry, i) => {
              const t = typeConfig[entry.type];
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5"
                >
                  <span className="mt-0.5 text-sm">{t.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-primary">{entry.action}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${t.color}`}>{entry.actor}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-tertiary">{entry.time}</span>
                </motion.div>
              );
            })}
            <p className="text-center text-[10px] text-tertiary pt-1">Immutable audit log — every action recorded forever.</p>
          </motion.div>
        )}

        {tab === 'workflow' && (
          <motion.div key="workflow"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="space-y-3"
          >
            {workflow.map((w, i) => {
              const Icon = w.icon;
              return (
                <motion.div key={w.step}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${w.color}18`, border: `1px solid ${w.color}30` }}>
                    <Icon size={16} style={{ color: w.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold" style={{ color: w.color }}>{w.step}</span>
                      <span className="text-xs font-semibold text-primary">{w.who}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-secondary">{w.action}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
