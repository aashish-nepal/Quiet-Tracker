'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthPanel() {
  const searchParams = useSearchParams();
  const starterCheckoutIntent = searchParams.get('plan') === 'starter';
  const billingInterval = searchParams.get('billingInterval') === 'yearly' ? 'yearly' : 'monthly';
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (starterCheckoutIntent) {
      setMode((current) => (current === 'login' ? 'signup' : current));
    }
  }, [starterCheckoutIntent]);

  async function saveToken(token) {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token })
    });
  }

  async function continueAfterAuth() {
    if (!starterCheckoutIntent) {
      window.location.href = '/dashboard';
      return;
    }

    const response = await fetch('/api/change-plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planId: 'starter', billingInterval })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Unable to start Starter checkout');
    }

    if (payload.url) {
      window.location.href = payload.url;
      return;
    }

    window.location.href = '/dashboard';
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = mode === 'login' ? { email, password } : { email, password, name };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Auth failed');
      await saveToken(data.token);
      await continueAfterAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setError('');
    setGoogleLoading(true);
    try {
      const stateParams = new URLSearchParams();
      if (starterCheckoutIntent) {
        stateParams.set('plan', 'starter');
        stateParams.set('billingInterval', billingInterval);
      }
      const oauthState = stateParams.toString();
      const googleUrlEndpoint = oauthState
        ? `/api/auth/google-url?state=${encodeURIComponent(oauthState)}`
        : '/api/auth/google-url';
      const response = await fetch(googleUrlEndpoint);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to initialize Google sign-in');
      if (!data.url) { setError(data.error || 'Google sign-in is not available right now.'); return; }
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Unable to initialize Google sign-in');
    } finally {
      setGoogleLoading(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4 py-16"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Background glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.13) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative w-full max-w-md animate-fadeUp">
        {/* Logo */}
        <a href="/" className="mb-8 flex items-center justify-center gap-2.5">
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
        </a>

        {/* Card */}
        <div className="card relative overflow-hidden rounded-2xl p-8">
          {/* Accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #3b82f6, #7c3aed, transparent)',
          }} />

          {/* Header */}
          <div className="mb-6 text-center">
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
              {isLogin ? 'Sign in to your workspace' : 'Start tracking competitor prices today'}
            </p>
            {starterCheckoutIntent && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                <span>⚡</span>
                Continuing to Starter checkout ({billingInterval === 'yearly' ? '$290/yr' : '$29/mo'})
              </div>
            )}
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={google}
            disabled={googleLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '11px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--text-primary)', transition: 'all 0.15s',
              opacity: googleLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            {googleLoading ? (
              <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em' }}>
                  Full name
                </label>
                <input
                  className="input-field"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em' }}>
                Email address
              </label>
              <input
                className="input-field"
                placeholder="you@company.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em' }}>
                Password
              </label>
              <input
                className="input-field"
                placeholder={isLogin ? 'Your password' : 'Min. 8 characters'}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={isLogin ? undefined : 8}
                required
              />
            </div>

            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <a
                  href="/auth/forgot-password"
                  style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot password?
                </a>
              </div>
            )}

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.08)', padding: '10px 14px',
                fontSize: 13, color: '#f87171'
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Please wait…
                </span>
              ) : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>


          {/* Toggle mode */}
          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', fontWeight: 600, fontSize: 13, padding: 0 }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}>
          By continuing you agree to our{' '}
          <a href="/legal/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'underline underline-offset-2' }}>Terms</a>
          {' '}and{' '}
          <a href="/legal/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline underline-offset-2' }}>Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}
