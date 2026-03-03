'use client';

import { useState } from 'react';

export default function BillingActions({ planId }) {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const isStarter = planId === 'starter';

  // Guard: if the backend is unavailable, planId is 'unknown' — show a safe fallback
  if (!planId || planId === 'unknown') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: 'var(--text-tertiary)'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
        Service unavailable
      </span>
    );
  }

  async function changePlan(id) {
    const key = `${id}-${billingInterval}`;
    setLoading(key); setError('');
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ planId: id, billingInterval }),
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Plan change failed');
      if (p.url) window.location.href = p.url; else window.location.reload();
    } catch (err) { setError(err.message); }
    finally { setLoading(''); }
  }

  async function openPortal() {
    setLoading('portal'); setError('');
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to open billing portal');
      if (p.url) window.location.href = p.url;
    } catch (err) { setError(err.message); }
    finally { setLoading(''); }
  }

  return (
    <div>
      {isStarter ? (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* Active plan badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: 'rgba(34,197,94,0.1)', color: '#4ade80',
            border: '1px solid rgba(34,197,94,0.25)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Starter — Active
          </span>
          <button
            onClick={openPortal}
            disabled={Boolean(loading)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-secondary)', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'all 0.15s',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {loading === 'portal' ? 'Opening…' : 'Billing Portal'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Interval toggle */}
          <div style={{ display: 'inline-flex', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', padding: 3, gap: 2 }}>
            {['monthly', 'yearly'].map(iv => (
              <button
                key={iv}
                onClick={() => setBillingInterval(iv)}
                disabled={Boolean(loading)}
                style={{
                  padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: billingInterval === iv ? 'var(--brand-600)' : 'transparent',
                  color: billingInterval === iv ? '#fff' : 'var(--text-secondary)',
                  boxShadow: billingInterval === iv ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                }}
              >
                {iv === 'yearly' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    Yearly
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>−17%</span>
                  </span>
                ) : 'Monthly'}
              </button>
            ))}
          </div>

          {/* Upgrade CTA */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => changePlan('starter')}
              disabled={Boolean(loading)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, var(--brand-600), #7c3aed)',
                color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 24px rgba(59,130,246,0.3)', opacity: loading ? 0.7 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              {loading === `starter-${billingInterval}` ? (
                <>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Processing…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                  {billingInterval === 'yearly' ? 'Upgrade to Starter · $290/yr' : 'Upgrade to Starter · $29/mo'}
                </>
              )}
            </button>

            <button
              onClick={openPortal}
              disabled={Boolean(loading)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, transition: 'all 0.15s',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {loading === 'portal' ? 'Opening…' : 'Billing Portal'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#f87171' }}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}
