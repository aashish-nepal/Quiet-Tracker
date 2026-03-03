'use client';

import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('loading'); // 'loading' | 'redirecting' | 'error'

  useEffect(() => {
    async function completeAuthFlow() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const stateValue = urlParams.get('state') || '';
      const stateParams = new URLSearchParams(stateValue);
      const starterCheckoutIntent = stateParams.get('plan') === 'starter';
      const billingInterval = stateParams.get('billingInterval') === 'yearly' ? 'yearly' : 'monthly';

      if (!token) {
        setError('Missing auth token from OAuth callback');
        setStatus('error');
        return;
      }

      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!sessionResponse.ok) {
        throw new Error('Unable to store auth session');
      }

      if (starterCheckoutIntent) {
        const checkoutResponse = await fetch('/api/change-plan', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ planId: 'starter', billingInterval })
        });
        const payload = await checkoutResponse.json();
        if (!checkoutResponse.ok) {
          throw new Error(payload.error || 'Unable to start Starter checkout');
        }
        if (payload.url) {
          setStatus('redirecting');
          setTimeout(() => { window.location.href = payload.url; }, 700);
          return;
        }
      }

      setStatus('redirecting');
      setTimeout(() => { window.location.href = '/dashboard'; }, 700);
    }

    completeAuthFlow().catch((err) => {
      setError(err.message || 'Authentication failed');
      setStatus('error');
    });
  }, []);

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 350,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative w-full max-w-sm animate-fadeUp">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Quiet Tracker
          </span>
        </div>

        {/* Card */}
        <div className="card relative overflow-hidden rounded-2xl p-10 text-center">
          {/* Accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: status === 'error'
              ? 'linear-gradient(90deg, transparent, #ef4444, transparent)'
              : 'linear-gradient(90deg, transparent, #3b82f6, #7c3aed, transparent)',
          }} />

          {status === 'loading' && (
            <>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.08)',
                borderTopColor: '#60a5fa',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 20px'
              }} />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Completing sign in…
              </h1>
              <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                Please wait while we verify your account.
              </p>
            </>
          )}

          {status === 'redirecting' && (
            <>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 24, color: '#4ade80'
              }}>✓</div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Signed in!
              </h1>
              <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                Redirecting you to your dashboard…
              </p>
              <div style={{ marginTop: 16, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
                  animation: 'shimmer 0.7s ease forwards',
                }} />
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 22, color: '#f87171'
              }}>⚠</div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Sign in failed
              </h1>
              <p style={{ marginTop: 8, fontSize: 14, color: '#f87171' }}>{error}</p>
              <a
                href="/auth"
                className="btn-primary"
                style={{ marginTop: 20, display: 'inline-flex' }}
              >
                Try again →
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
