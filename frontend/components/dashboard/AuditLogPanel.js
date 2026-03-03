'use client';

import { useEffect, useState } from 'react';

function formatTimestamp(value) {
  if (!value) return 'Unknown';
  const d = new Date(value);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const ACTION_COLORS = {
  'auth.signup': '#22c55e',
  'auth.login': '#60a5fa',
  'product.add': '#a78bfa',
  'product.delete': '#ef4444',
  'onboarding.update': '#f59e0b',
};
const ACTION_PREFIX_COLORS = {
  auth: '#60a5fa',
  product: '#a78bfa',
  onboarding: '#f59e0b',
};
function getActionColor(action) {
  if (!action) return '#71717a';
  // Exact match first
  if (ACTION_COLORS[action]) return ACTION_COLORS[action];
  // Fall back to prefix (e.g. "auth.logout" → blue)
  const prefix = action.split('.')[0];
  return ACTION_PREFIX_COLORS[prefix] || '#71717a';
}

export default function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true); setError('');
      try {
        const res = await fetch('/api/audit');
        const p = await res.json();
        if (!res.ok) throw new Error(p.error || 'Unable to load audit logs');
        setLogs(Array.isArray(p) ? p.slice(0, 10) : []);
      } catch (err) { setError(err.message || 'Unable to load audit logs'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="card rounded-2xl p-5 md:p-6" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #22c55e, transparent)', opacity: 0.45 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Audit Log</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>Recent account activity</p>
        </div>
        {logs.length > 0 && <span className="badge badge-gray">{logs.length}</span>}
      </div>

      {error && <p style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#f87171' }}><span>⚠</span>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {loading && [1, 2, 3].map((i) => (
          <div key={i} style={{ height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
        {!loading && logs.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 16 }}>📋</div>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>No audit entries yet.</p>
          </div>
        )}
        {!loading && logs.map((entry) => {
          const color = getActionColor(entry.action);
          return (
            <div key={entry.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `3px solid ${color}`,
              background: 'rgba(255,255,255,0.02)',
              padding: '8px 10px 8px 12px'
            }}>
              <div style={{ marginTop: 3, width: 6, height: 6, borderRadius: '50%', flexShrink: 0, backgroundColor: color, boxShadow: `0 0 6px ${color}70` }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{entry.action}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                  {entry.entity_type} · {formatTimestamp(entry.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
