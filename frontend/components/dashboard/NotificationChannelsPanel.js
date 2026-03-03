'use client';

import { useEffect, useState } from 'react';

const CHANNEL_ICONS = { email: '✉', slack: '💬', discord: '🎮' };
const CHANNEL_TYPES = ['email', 'slack', 'discord'];

export default function NotificationChannelsPanel() {
  const [channels, setChannels] = useState([]);
  const [type, setType] = useState('email');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadChannels() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/notifications/channels');
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to load channels');
      setChannels(Array.isArray(p) ? p : []);
    } catch (err) { setError(err.message || 'Unable to load channels'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadChannels(); }, []);

  async function addChannel(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await fetch('/api/notifications/channels', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, target, isEnabled: true })
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to save channel');
      setTarget(''); await loadChannels();
    } catch (err) { setError(err.message || 'Unable to save channel'); }
    finally { setSaving(false); }
  }

  return (
    <div className="card rounded-2xl p-5 md:p-6" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)', opacity: 0.55 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Notification Channels</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>Email, Slack, or Discord</p>
        </div>
      </div>

      <form onSubmit={addChannel} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {/* Channel type tabs — underline style */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 }}>
          {CHANNEL_TYPES.map((ct) => (
            <button
              key={ct} type="button" onClick={() => setType(ct)}
              style={{
                flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600,
                background: 'transparent', border: 'none', cursor: 'pointer',
                textTransform: 'capitalize',
                color: type === ct ? '#a78bfa' : 'var(--text-tertiary)',
                borderBottom: `2px solid ${type === ct ? '#a78bfa' : 'transparent'}`,
                marginBottom: -1, transition: 'color 0.15s, border-color 0.15s'
              }}
            >
              {CHANNEL_ICONS[ct]} {ct}
            </button>
          ))}
        </div>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={type === 'email' ? 'alerts@company.com' : 'Webhook URL'}
          className="input-field"
          style={{ fontSize: 12 }}
          required
        />
        <button disabled={saving} className="btn-primary" style={{ justifyContent: 'center', fontSize: 12, padding: '8px 0', opacity: saving ? 0.6 : 1 }}>
          {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Saving…</span> : '+ Add Channel'}
        </button>
      </form>

      {error && <p style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#f87171' }}><span>⚠</span>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading && <div style={{ height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />}
        {!loading && channels.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', padding: '12px 0' }}>No channels configured yet.</p>
        )}
        {!loading && channels.map((ch) => (
          <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)', padding: '9px 12px' }}>
            <span style={{ fontSize: 16 }}>{CHANNEL_ICONS[ch.type] || '📡'}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{ch.type}</span>
              <p style={{ margin: '1px 0 0', fontSize: 10, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.target}</p>
            </div>
            <span className={`badge ${ch.is_enabled ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10, flexShrink: 0 }}>
              {ch.is_enabled ? 'Active' : 'Off'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
