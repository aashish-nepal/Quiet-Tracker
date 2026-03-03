'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SettingsModal from './SettingsModal';

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initials(user) {
  const name = (user?.name || user?.email || 'U').trim();
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

export default function PublicNav({
  className = '',
  isAuthenticated = false,
  user = null,
  hideLinks = false,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const avatarBtnRef = useRef(null);
  const dropRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    function onDown(e) {
      if (dropRef.current && !dropRef.current.contains(e.target) &&
        avatarBtnRef.current && !avatarBtnRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [profileOpen]);

  function toggleProfile() {
    if (avatarBtnRef.current) {
      const r = avatarBtnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setProfileOpen(v => !v);
  }

  async function logout() {
    setLogoutLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth';
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <>
      <header
        className={`sticky top-3 z-[200] mx-auto max-w-[1280px] rounded-2xl glass-dark ${className}`.trim()}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-5">

          {/* ── Logo ── */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600"
              style={{ boxShadow: '0 0 14px rgba(59,130,246,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-primary">Quiet Tracker</span>
          </Link>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1">

            {/* Public links — shown when not hideLinks, on sm+ */}
            {!hideLinks && (
              <nav className="hidden items-center sm:flex">
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:bg-white/[0.06] hover:text-primary"
                  >Dashboard</Link>
                )}
                <button
                  onClick={() => scrollTo('pricing')}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:bg-white/[0.06] hover:text-primary"
                >Pricing</button>
                <button
                  onClick={() => scrollTo('faq')}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:bg-white/[0.06] hover:text-primary"
                >FAQ</button>
              </nav>
            )}

            {/* CTA or Avatar */}
            {isAuthenticated ? (
              /* ── Profile avatar button ── */
              <button
                ref={avatarBtnRef}
                type="button"
                onClick={toggleProfile}
                className="ml-1 flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-1.5 pr-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                {(currentUser?.photoUrl || user?.photoUrl) ? (
                  <img src={currentUser?.photoUrl || user.photoUrl} alt="" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                    {initials(currentUser || user)}
                  </div>
                )}
                <span className="hidden max-w-[120px] truncate text-sm font-semibold text-primary sm:block">
                  {(currentUser?.name || user?.name)?.split(' ')[0] || 'Account'}
                </span>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
                  className="shrink-0 text-tertiary"
                  style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            ) : (
              /* ── Get Started ── */
              <>
                <Link href="/auth" className="btn-primary hidden text-[13px] sm:inline-flex">
                  Get Started →
                </Link>
                <Link href="/auth" className="btn-primary text-[12px] sm:hidden">
                  Sign up
                </Link>
                {/* Mobile hamburger (only when public links exist) */}
                {!hideLinks && (
                  <button
                    type="button"
                    onClick={() => setMobileOpen(v => !v)}
                    className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-secondary transition hover:text-primary sm:hidden"
                    aria-label="Menu"
                  >
                    {mobileOpen ? (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="3" x2="11" y2="11" /><line x1="11" y1="3" x2="3" y2="11" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="1" y1="3" x2="13" y2="3" /><line x1="1" y1="7" x2="13" y2="7" /><line x1="1" y1="11" x2="13" y2="11" />
                      </svg>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile dropdown (public, not authenticated) */}
        {!isAuthenticated && !hideLinks && mobileOpen && (
          <div className="border-t border-white/[0.07] px-4 pb-4 pt-2 sm:hidden">
            <button onClick={() => { scrollTo('pricing'); setMobileOpen(false); }}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-secondary transition hover:bg-white/[0.06] hover:text-primary">
              Pricing
            </button>
            <button onClick={() => { scrollTo('faq'); setMobileOpen(false); }}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-secondary transition hover:bg-white/[0.06] hover:text-primary">
              FAQ
            </button>
            <Link href="/auth" onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-xl bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-500">
              Get Started →
            </Link>
          </div>
        )}
      </header>

      {/* ── Profile dropdown — rendered at document root level (fixed) ── */}
      {isAuthenticated && profileOpen && (
        <div
          ref={dropRef}
          style={{
            position: 'fixed',
            top: dropPos.top,
            right: dropPos.right,
            zIndex: 9999,
            minWidth: 220,
            background: 'var(--bg-elevated)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            animation: 'fadeUp 0.15s ease both',
          }}
        >
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {(currentUser?.photoUrl || user?.photoUrl) ? (
              <img src={currentUser?.photoUrl || user.photoUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} referrerPolicy="no-referrer" />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initials(currentUser || user)}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name || user?.name || 'Account'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || ''}
              </p>
            </div>
          </div>

          {/* Links */}
          <div style={{ padding: '6px' }}>
            <Link
              href="/dashboard"
              onClick={() => setProfileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </Link>

            <button
              type="button"
              onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              Profile &amp; Settings
            </button>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

            <button
              type="button"
              onClick={() => { setProfileOpen(false); setConfirmLogout(true); }}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#f87171', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
      {/* ── Logout confirmation modal ── */}
      {confirmLogout && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmLogout(false); }}
        >
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, animation: 'fadeUp 0.15s ease both', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            {/* Icon */}
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Sign out?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>You'll be signed out of your account on this device.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setConfirmLogout(false)}
                disabled={logoutLoading}
                style={{ padding: '9px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={logout}
                disabled={logoutLoading}
                style={{ padding: '9px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: logoutLoading ? 'not-allowed' : 'pointer', opacity: logoutLoading ? 0.6 : 1 }}
              >{logoutLoading ? 'Signing out…' : 'Sign Out'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings modal ── */}
      {isAuthenticated && settingsOpen && (
        <SettingsModal
          user={currentUser || user}
          onClose={() => setSettingsOpen(false)}
          onUpdated={(updated) => {
            setCurrentUser(prev => ({ ...(prev || user), ...updated }));
            setSettingsOpen(false);
          }}
        />
      )}
    </>
  );
}
