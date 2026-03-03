'use client';

import { useEffect, useMemo, useState } from 'react';

const steps = [
  { id: 1, icon: '🔗', title: 'Paste your first competitor URL', hint: 'Use the form below to add any product link.' },
  { id: 2, icon: '🔔', title: 'Configure your alert threshold', hint: 'Set the % change that triggers a notification.' },
  { id: 3, icon: '✉', title: 'Connect a notification channel', hint: 'Add your email, Slack, or Discord webhook.' }
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingState, setLoadingState] = useState(true);

  // Restore persisted onboarding progress on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch('/api/auth/onboarding');
        if (res.ok) {
          const p = await res.json();
          if (p.completed) { setDone(true); }
          else if (p.step && p.step >= 1 && p.step <= 3) { setStep(p.step); }
        }
      } catch { /* silently ignore, start fresh */ }
      finally { setLoadingState(false); }
    }
    loadProgress();
  }, []);

  const progress = useMemo(() => Math.round((step / 3) * 100), [step]);

  async function persist(nextStep, completed) {
    setSaving(true);
    try {
      await fetch('/api/auth/onboarding', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ step: nextStep, completed })
      });
    } finally { setSaving(false); }
  }

  async function next() {
    if (step < 3) { const ns = step + 1; setStep(ns); await persist(ns, false); return; }
    setDone(true); await persist(3, true);
  }

  if (loadingState) {
    return (
      <div className="card rounded-2xl p-5 md:p-6" style={{ position: 'relative', overflow: 'hidden', minHeight: 120 }}>
        <div style={{ height: 2, position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', opacity: 0.7 }} />
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#60a5fa', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card rounded-2xl p-5 md:p-6 flex flex-col items-center text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #22c55e, transparent)', opacity: 0.8 }} />
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎉</div>
        <p style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Setup complete!</p>
        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>Your workspace is ready. Products will be checked on your plan schedule.</p>
      </div>
    );
  }

  const current = steps[step - 1];

  return (
    <div className="card rounded-2xl p-5 md:p-6" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', opacity: 0.7 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Quick Setup</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>{step} / 3</span>
      </div>

      {/* Progress bar with glow */}
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{
          height: '100%', borderRadius: 99, background: '#3b82f6',
          width: `${progress}%`, transition: 'width 0.5s ease',
          boxShadow: '0 0 8px rgba(59,130,246,0.55)'
        }} />
      </div>

      {/* Step pills */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
        {steps.map((s) => (
          <div key={s.id} style={{
            flex: 1, borderRadius: 99, padding: '4px 0', textAlign: 'center',
            fontSize: 10, fontWeight: 700, transition: 'all 0.2s',
            background: s.id === step ? 'rgba(59,130,246,0.18)' : s.id < step ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
            color: s.id === step ? '#60a5fa' : s.id < step ? '#4ade80' : 'var(--text-tertiary)',
            border: `1px solid ${s.id === step ? 'rgba(59,130,246,0.3)' : s.id < step ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`
          }}>
            {s.id < step ? '✓' : s.id}
          </div>
        ))}
      </div>

      {/* Current step */}
      <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)', padding: 14 }}>
        <div style={{ fontSize: 22 }}>{current.icon}</div>
        <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{current.title}</p>
        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>{current.hint}</p>
      </div>

      <button
        onClick={next}
        disabled={saving}
        className="btn-primary"
        style={{ marginTop: 14, width: '100%', justifyContent: 'center', fontSize: 12, padding: '9px 0', opacity: saving ? 0.6 : 1 }}
      >
        {saving
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Saving…</span>
          : step < 3 ? 'Next Step →' : 'Finish Setup ✓'}
      </button>
    </div>
  );
}
