'use client';

import { useEffect, useState } from 'react';

export default function TeamMembersPanel() {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('team_member');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadMembers() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/team');
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to load team');
      setMembers(Array.isArray(p) ? p : []);
    } catch (err) { setError(err.message || 'Unable to load team'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadMembers(); }, []);

  async function addMember(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await fetch('/api/auth/team', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to add member');
      setEmail(''); setRole('team_member'); await loadMembers();
    } catch (err) { setError(err.message || 'Unable to add member'); }
    finally { setSaving(false); }
  }

  function initials(member) {
    const s = String(member.name || member.email || '').trim();
    return s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
  }

  const ROLE_COLORS = { owner: '#60a5fa', team_member: '#a78bfa' };

  return (
    <div className="card rounded-2xl p-5 md:p-6" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)', opacity: 0.55 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Team Members</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>Invite collaborators</p>
        </div>
      </div>

      <form onSubmit={addMember} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <input
          type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="member@company.com"
          className="input-field"
          style={{ fontSize: 12 }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field" style={{ fontSize: 12 }}>
          <option value="team_member">Team Member (View + Comment)</option>
          <option value="owner">Owner (Full Access)</option>
        </select>
        <button disabled={saving} className="btn-primary" style={{ justifyContent: 'center', fontSize: 12, padding: '8px 0', opacity: saving ? 0.6 : 1 }}>
          {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Inviting…</span> : '+ Invite Member'}
        </button>
      </form>

      {error && <p style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#f87171' }}><span>⚠</span>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading && [1, 2].map((i) => <div key={i} style={{ height: 46, borderRadius: 10, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        {!loading && members.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', padding: '12px 0' }}>No team members yet.</p>
        )}
        {!loading && members.map((m) => {
          const color = ROLE_COLORS[m.role] || '#71717a';
          const init = initials(m);
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)', padding: '9px 12px' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(124,58,237,0.35))',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#93c5fd'
              }}>
                {init}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name || m.email}</p>
                <p style={{ margin: '1px 0 0', fontSize: 10, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, textTransform: 'capitalize', flexShrink: 0,
                background: `${color}15`, color, border: `1px solid ${color}30`
              }}>
                {m.role?.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
