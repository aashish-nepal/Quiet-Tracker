'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | sent | error
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Something went wrong. Please try again.');
            }

            setStatus('sent');
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
            <div className="w-full max-w-md">

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(59,130,246,0.4)' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--brand-400)' }}>Quiet Tracker</span>
                </div>

                {/* Card */}
                <div className="card rounded-2xl p-8" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, #7c3aed, transparent)' }} />

                    {status === 'sent' ? (
                        <div className="text-center">
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h1 className="text-primary" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>Check your email</h1>
                            <p className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
                                If an account exists for <strong className="text-primary">{email}</strong>, you'll receive a password reset link shortly. The link expires in 1 hour.
                            </p>
                            <Link href="/auth" className="text-brand hover:underline" style={{ fontSize: 14, fontWeight: 600 }}>
                                ← Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-primary" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Forgot password?</h1>
                            <p className="text-secondary" style={{ fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
                                Enter your email and we'll send you a reset link.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 16 }}>
                                    <label className="text-secondary" style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                                        Email address
                                    </label>
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        required
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="input w-full"
                                        style={{ padding: '10px 14px', fontSize: 14 }}
                                        disabled={status === 'loading'}
                                    />
                                </div>

                                {status === 'error' && (
                                    <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', fontSize: 13, color: '#f87171' }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    id="forgot-submit"
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="btn-primary w-full"
                                    style={{ padding: '11px 0', fontSize: 14, fontWeight: 700, borderRadius: 10, opacity: status === 'loading' ? 0.6 : 1 }}
                                >
                                    {status === 'loading' ? 'Sending…' : 'Send reset link'}
                                </button>
                            </form>

                            <p className="text-tertiary" style={{ fontSize: 13, marginTop: 20, textAlign: 'center' }}>
                                Remembered it?{' '}
                                <Link href="/auth" className="text-brand hover:underline" style={{ fontWeight: 600 }}>
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
