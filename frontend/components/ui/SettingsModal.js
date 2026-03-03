'use client';

import { useRef, useState } from 'react';

function initials(user) {
    const name = (user?.name || user?.email || 'U').trim();
    return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

/* ── Tiny reusable primitives ─────────────────────────── */

function Label({ children }) {
    return (
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>
            {children}
        </p>
    );
}

function Input({ style, ...props }) {
    return (
        <input
            className="input-field"
            style={{ width: '100%', ...style }}
            {...props}
        />
    );
}

function Btn({ variant = 'primary', disabled, children, style, ...props }) {
    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
        opacity: disabled ? 0.55 : 1, transition: 'all 0.15s', ...style,
    };
    const styles = {
        primary: { background: 'var(--brand-600)', color: '#fff', boxShadow: '0 0 20px rgba(59,130,246,0.25)' },
        secondary: { background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)' },
        danger: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' },
    };
    return <button disabled={disabled} style={{ ...base, ...styles[variant] }} {...props}>{children}</button>;
}

/* ── Confirmation modal overlay ───────────────────────── */
function ConfirmModal({ title, body, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel, loading }) {
    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, animation: 'fadeUp 0.15s ease both' }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
                <p style={{ margin: '10px 0 24px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{body}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <Btn variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Btn>
                    <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
                        {loading ? 'Saving…' : confirmLabel}
                    </Btn>
                </div>
            </div>
        </div>
    );
}

/* ── Main SettingsModal ───────────────────────────────── */
export default function SettingsModal({ user, onClose, onUpdated }) {
    const fileInputRef = useRef(null);

    // Profile
    const [name, setName] = useState(user?.name || '');
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
    const [dragActive, setDragActive] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [confirmProfile, setConfirmProfile] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    // Password
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    // Feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const previewUrl = photoUrl || user?.photoUrl || '';

    /* ── Upload avatar ── */
    async function uploadFile(file) {
        if (!file) return;
        setError(''); setUploadLoading(true);
        try {
            const fd = new FormData(); fd.append('file', file);
            const res = await fetch('/api/auth/upload-photo', { method: 'POST', body: fd });
            const p = await res.json();
            if (!res.ok) throw new Error(p.error || 'Upload failed');
            setPhotoUrl(p.url || '');
            setSuccess('Photo uploaded — click Save Profile to apply.');
        } catch (err) { setError(err.message); }
        finally { setUploadLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    }

    /* ── Save profile ── */
    async function saveProfile() {
        setError(''); setConfirmProfile(false); setProfileLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name, photoUrl }),
            });
            const p = await res.json();
            if (!res.ok) throw new Error(p.error || 'Update failed');
            setSuccess('Profile saved successfully.');
            onUpdated?.({ name, photoUrl: p.photoUrl || photoUrl });
        } catch (err) { setError(err.message); }
        finally { setProfileLoading(false); }
    }

    /* ── Change password ── */
    async function changePassword() {
        setError(''); setConfirmPw(false); setPwLoading(true);
        try {
            const res = await fetch('/api/auth/password', {
                method: 'PATCH', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
            });
            const p = await res.json();
            if (!res.ok) throw new Error(p.error || 'Password change failed');
            setCurrentPw(''); setNewPw('');
            setSuccess('Password updated successfully.');
        } catch (err) { setError(err.message); }
        finally { setPwLoading(false); }
    }

    return (
        <>
            {/* ── Modal backdrop ── */}
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
                onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div style={{
                    background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 24, width: '100%', maxWidth: 500, maxHeight: '90vh',
                    overflowY: 'auto', animation: 'fadeUp 0.18s ease both',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                }}>

                    {/* Header */}
                    <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'var(--bg-elevated)' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Profile & Settings</h2>
                            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-tertiary)' }}>Manage your account details</p>
                        </div>
                        <button
                            type="button" onClick={onClose}
                            style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        >×</button>
                    </div>

                    <div style={{ padding: '24px' }}>

                        {/* ── Feedback ── */}
                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 13, marginBottom: 20 }}>
                                <span>⚠</span>{error}
                            </div>
                        )}
                        {success && !error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.08)', color: '#4ade80', fontSize: 13, marginBottom: 20 }}>
                                <span>✓</span>{success}
                            </div>
                        )}

                        {/* ══ SECTION 1: Avatar ══ */}
                        <section style={{ marginBottom: 28 }}>
                            <Label>Profile Picture</Label>

                            {/* Current avatar + preview */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.12)' }} referrerPolicy="no-referrer" />
                                    ) : (
                                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.1)' }}>
                                            {initials(user)}
                                        </div>
                                    )}
                                    {uploadLoading && (
                                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{name || user?.name || 'Your Name'}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>{user?.email}</p>
                                </div>
                            </div>

                            {/* Drag & drop zone */}
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadFile(e.target.files?.[0])} />
                            <div
                                onClick={() => !uploadLoading && fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                                onDrop={e => { e.preventDefault(); setDragActive(false); uploadFile(e.dataTransfer?.files?.[0]); }}
                                style={{
                                    border: `2px dashed ${dragActive ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: 14, padding: '20px 16px', textAlign: 'center', cursor: uploadLoading ? 'not-allowed' : 'pointer',
                                    background: dragActive ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
                                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {uploadLoading ? 'Uploading…' : 'Drop image here or click to browse'}
                                </p>
                                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)' }}>PNG, JPG, WebP · Max 5 MB</p>
                            </div>
                        </section>

                        {/* ══ SECTION 2: Name ══ */}
                        <section style={{ marginBottom: 28 }}>
                            <Label>Display Name</Label>
                            <Input
                                placeholder="Your full name"
                                value={name}
                                onChange={e => { setName(e.target.value); setSuccess(''); }}
                            />
                        </section>

                        {/* Save profile button */}
                        <Btn
                            variant="primary"
                            style={{ width: '100%', marginBottom: 32 }}
                            disabled={profileLoading}
                            onClick={() => { setError(''); setSuccess(''); setConfirmProfile(true); }}
                        >
                            {profileLoading ? 'Saving…' : 'Save Profile'}
                        </Btn>

                        {/* Divider */}
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 28 }} />

                        {/* ══ SECTION 3: Password ══ */}
                        <section style={{ marginBottom: 8 }}>
                            <Label>Change Password</Label>
                            {user?.hasPassword && (
                                <Input
                                    type="password"
                                    placeholder="Current password"
                                    value={currentPw}
                                    onChange={e => { setCurrentPw(e.target.value); setSuccess(''); }}
                                    style={{ marginBottom: 10 }}
                                />
                            )}
                            {!user?.hasPassword && (
                                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                                    No password set yet (Google sign-in). Setting a password lets you also log in with email.
                                </p>
                            )}
                            <Input
                                type="password"
                                placeholder="New password (min 8 characters)"
                                minLength={8}
                                value={newPw}
                                onChange={e => { setNewPw(e.target.value); setSuccess(''); }}
                            />
                        </section>

                        <Btn
                            variant="secondary"
                            style={{ width: '100%', marginTop: 12 }}
                            disabled={pwLoading || newPw.length < 8}
                            onClick={() => { setError(''); setSuccess(''); setConfirmPw(true); }}
                        >
                            {pwLoading ? 'Updating…' : 'Change Password'}
                        </Btn>

                    </div>
                </div>
            </div>

            {/* ── Confirm: Save profile ── */}
            {confirmProfile && (
                <ConfirmModal
                    title="Save Profile Changes?"
                    body="Your display name and profile picture will be updated immediately."
                    confirmLabel="Save Profile"
                    onConfirm={saveProfile}
                    onCancel={() => setConfirmProfile(false)}
                    loading={profileLoading}
                />
            )}

            {/* ── Confirm: Change password ── */}
            {confirmPw && (
                <ConfirmModal
                    title="Change Password?"
                    body="Your password will be updated immediately. You'll use the new password on your next login."
                    confirmLabel="Change Password"
                    onConfirm={changePassword}
                    onCancel={() => setConfirmPw(false)}
                    loading={pwLoading}
                />
            )}
        </>
    );
}
