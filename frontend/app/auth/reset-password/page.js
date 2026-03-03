'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch(`/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || 'Reset failed. Please request a new link.');
            }

            setStatus('success');
            setTimeout(() => router.push('/auth'), 2500);
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    }

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-secondary" style={{ fontSize: 14 }}>
                    Invalid reset link.{' '}
                    <Link href="/auth/forgot-password" className="text-brand hover:underline" style={{ fontWeight: 600 }}>
                        Request a new one →
                    </Link>
                </p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center">
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 className="text-primary" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>Password updated!</h1>
                <p className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>
                    Your password has been reset. Redirecting you to sign in…
                </p>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-primary" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Set new password</h1>
            <p className="text-secondary" style={{ fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
                Choose a strong password for your account.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                    <label className="text-secondary" style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                        New password
                    </label>
                    <input
                        id="reset-new-password"
                        type="password"
                        required
                        autoFocus
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="input w-full"
                        style={{ padding: '10px 14px', fontSize: 14 }}
                        disabled={status === 'loading'}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label className="text-secondary" style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Confirm password
                    </label>
                    <input
                        id="reset-confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="input w-full"
                        style={{ padding: '10px 14px', fontSize: 14 }}
                        disabled={status === 'loading'}
                    />
                </div>

                {/* Strength bar */}
                {newPassword.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%',
                                    borderRadius: 99,
                                    transition: 'width 0.3s, background 0.3s',
                                    width: newPassword.length < 8 ? '25%' : newPassword.length < 12 ? '60%' : '100%',
                                    background: newPassword.length < 8 ? '#ef4444' : newPassword.length < 12 ? '#f59e0b' : '#4ade80'
                                }}
                            />
                        </div>
                        <p style={{ margin: '5px 0 0', fontSize: 11, color: newPassword.length < 8 ? '#f87171' : newPassword.length < 12 ? '#fbbf24' : '#4ade80' }}>
                            {newPassword.length < 8 ? 'Too short' : newPassword.length < 12 ? 'Good' : 'Strong'}
                        </p>
                    </div>
                )}

                {error && (
                    <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', fontSize: 13, color: '#f87171' }}>
                        {error}
                    </div>
                )}

                <button
                    id="reset-submit"
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full"
                    style={{ padding: '11px 0', fontSize: 14, fontWeight: 700, borderRadius: 10, opacity: status === 'loading' ? 0.6 : 1 }}
                >
                    {status === 'loading' ? 'Updating…' : 'Update password'}
                </button>
            </form>

            <p className="text-tertiary" style={{ fontSize: 13, marginTop: 20, textAlign: 'center' }}>
                <Link href="/auth/forgot-password" className="text-brand hover:underline" style={{ fontWeight: 600 }}>
                    Request a new link instead
                </Link>
            </p>
        </>
    );
}

export default function ResetPasswordPage() {
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
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #7c3aed, #3b82f6, transparent)' }} />
                    <Suspense fallback={<p className="text-secondary" style={{ fontSize: 14 }}>Loading…</p>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
