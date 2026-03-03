'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

function displayNameFromUser(user) {
  const n = String(user?.name || '').trim();
  if (n) return n;
  const e = String(user?.email || '').trim();
  return e.includes('@') ? e.split('@')[0] : e || 'User';
}

function initialsFromUser(user) {
  const label = displayNameFromUser(user);
  return String(label).trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '').join('');
}

export default function SessionBar({ isAuthenticated, user = null, hideBrand = false }) {
  const router = useRouter();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);
  const displayName = displayNameFromUser(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [confirmProfileSaveOpen, setConfirmProfileSaveOpen] = useState(false);
  const [confirmPasswordSaveOpen, setConfirmPasswordSaveOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState(null);
  const [name, setName] = useState(user?.name || displayName);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [savedPhotoUrl, setSavedPhotoUrl] = useState(user?.photoUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const previewPhotoUrl = photoUrl || savedPhotoUrl || '';

  useEffect(() => {
    setName(user?.name || displayNameFromUser(user));
    setPhotoUrl(user?.photoUrl || '');
    setSavedPhotoUrl(user?.photoUrl || '');
  }, [user?.name, user?.email, user?.photoUrl]);

  useEffect(() => {
    function onMouseDown(e) { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false); setSettingsOpen(false);
        setConfirmLogoutOpen(false); setConfirmProfileSaveOpen(false); setConfirmPasswordSaveOpen(false);
      }
    }
    document.addEventListener('pointerdown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onMouseDown); document.removeEventListener('keydown', onKeyDown); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  async function logout() {
    setLogoutLoading(true);
    try { await fetch('/api/auth/logout', { method: 'POST' }); window.location.replace('/auth'); }
    catch { setError('Unable to log out. Please try again.'); setConfirmLogoutOpen(false); }
    finally { setLogoutLoading(false); }
  }

  async function saveProfileConfirmed() {
    setError(''); setConfirmProfileSaveOpen(false); setProfileLoading(true);
    try {
      const res = await fetch('/api/auth/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, photoUrl }) });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to update profile');
      setSavedPhotoUrl(p.photoUrl || photoUrl || '');
      setToast({ title: 'Profile Updated', body: 'Your account details were saved.' });
      setMenuOpen(false); router.refresh();
    } catch (err) { setError(err.message || 'Unable to update profile'); }
    finally { setProfileLoading(false); }
  }

  async function uploadPhotoFile(file) {
    if (!file) return;
    setError(''); setUploadLoading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/auth/upload-photo', { method: 'POST', body: fd });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to upload photo');
      setPhotoUrl(p.url || '');
      setSuccess('Photo uploaded. Click "Save profile" to apply.');
    } catch (err) { setError(err.message || 'Unable to upload photo'); }
    finally { setUploadLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  }

  async function savePasswordConfirmed() {
    setError(''); setConfirmPasswordSaveOpen(false); setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/password', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || 'Unable to change password');
      setCurrentPassword(''); setNewPassword('');
      setToast({ title: 'Password Updated', body: 'Your password was changed.' });
      setMenuOpen(false); router.refresh();
    } catch (err) { setError(err.message || 'Unable to change password'); }
    finally { setPasswordLoading(false); }
  }

  const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card-elevated w-full max-w-lg rounded-2xl p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className={hideBrand ? 'relative shrink-0' : 'mb-6 flex flex-wrap items-center justify-between gap-3'}>
      {/* Brand — hidden when embedded in top-bar */}
      {!hideBrand && (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-sm font-bold text-primary">Quiet Tracker</span>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[60] w-[min(92vw,360px)] rounded-2xl border border-green-500/30 bg-card px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <p className="text-sm font-semibold text-primary">{toast.title}</p>
          </div>
          <p className="mt-1 text-xs text-secondary">{toast.body}</p>
        </div>
      )}

      <div ref={menuRef} className="relative">
        {isAuthenticated ? (
          <>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => {
                // Calculate position synchronously so dropdown renders at correct coords on first frame
                if (buttonRef.current) {
                  const rect = buttonRef.current.getBoundingClientRect();
                  setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                }
                setMenuOpen((v) => !v);
              }}
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.07]"
              style={{ minWidth: 0 }}
            >
              {savedPhotoUrl ? (
                <img src={savedPhotoUrl} alt="Profile" className="h-7 w-7 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {initialsFromUser(user)}
                </div>
              )}
              <span className="hidden max-w-[140px] truncate text-sm font-semibold text-primary sm:block">{displayName}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-tertiary" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="card fixed z-[9999] w-56 overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  top: dropdownPos.top,
                  right: dropdownPos.right,
                  animation: 'fadeUp 0.15s ease both',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* User info header */}
                <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
                  {savedPhotoUrl ? (
                    <img src={savedPhotoUrl} alt="Profile" className="h-8 w-8 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {initialsFromUser(user)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{displayName}</p>
                    <p className="truncate text-[11px] text-tertiary">{user?.email || ''}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-secondary transition hover:bg-white/[0.06] hover:text-primary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2.1 2.1 0 0 1-2.97 2.97l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2.1 2.1 0 0 1-4.2 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2.1 2.1 0 0 1-2.97-2.97l.06-.06A1.65 1.65 0 0 0 4.54 15a1.65 1.65 0 0 0-1.51-1H3a2.1 2.1 0 0 1 0-4.2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2.1 2.1 0 0 1 2.97-2.97l.06.06A1.65 1.65 0 0 0 9 4.54a1.65 1.65 0 0 0 1-1.51V3a2.1 2.1 0 0 1 4.2 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2.1 2.1 0 0 1 2.97 2.97l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2.1 2.1 0 0 1 0 4.2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                  </button>

                  <div className="my-1 h-px bg-white/[0.06]" />

                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setConfirmLogoutOpen(true); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}

            {/* Settings modal */}
            {settingsOpen && (
              <Modal onClose={() => { setSettingsOpen(false); setError(''); setSuccess(''); }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-primary">Profile Settings</h2>
                    <p className="text-xs text-secondary">Update your account information</p>
                  </div>
                  <button onClick={() => { setSettingsOpen(false); setError(''); setSuccess(''); }} className="text-tertiary hover:text-primary transition text-lg leading-none">×</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setError(''); setSuccess(''); setConfirmProfileSaveOpen(true); }} className="mt-5 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Full name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Profile photo</label>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => uploadPhotoFile(e.target.files?.[0])} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                      onDrop={(e) => { e.preventDefault(); setDragActive(false); uploadPhotoFile(e.dataTransfer?.files?.[0]); }}
                      disabled={uploadLoading}
                      className={`w-full rounded-xl border-2 border-dashed px-4 py-4 text-xs transition ${dragActive ? 'border-brand-500 bg-brand-500/5' : 'border-white/10 bg-white/[0.02]'} text-secondary disabled:opacity-60`}
                    >
                      {uploadLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Uploading…
                        </span>
                      ) : 'Drop image here or click to upload'}
                    </button>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      {previewPhotoUrl ? (
                        <img src={previewPhotoUrl} alt="Preview" className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                          {initialsFromUser({ name, email: user?.email })}
                        </div>
                      )}
                      <p className="text-xs text-tertiary">Avatar preview</p>
                    </div>
                  </div>
                  <button type="submit" disabled={profileLoading} className="btn-primary w-full justify-center disabled:opacity-60">
                    {profileLoading ? 'Saving…' : 'Save Profile'}
                  </button>
                </form>

                <form onSubmit={(e) => { e.preventDefault(); setError(''); setConfirmPasswordSaveOpen(true); }} className="mt-5 space-y-3 border-t border-white/[0.07] pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Change Password</p>
                  {user?.hasPassword ? (
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" placeholder="Current password" required />
                  ) : (
                    <p className="text-xs text-tertiary">No password set yet. Set one now for email login.</p>
                  )}
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="New password (min 8 chars)" minLength={8} required />
                  <button type="submit" disabled={passwordLoading} className="btn-secondary w-full justify-center disabled:opacity-60">
                    {passwordLoading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>

                {error && <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400"><span>⚠</span>{error}</div>}
                {success && <div className="mt-3 text-xs text-green-400">✓ {success}</div>}
              </Modal>
            )}

            {/* Confirm profile save */}
            {confirmProfileSaveOpen && (
              <Modal onClose={() => setConfirmProfileSaveOpen(false)}>
                <h2 className="text-base font-semibold text-primary">Confirm Profile Update</h2>
                <p className="mt-2 text-sm text-secondary">Save changes to your name and profile photo?</p>
                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={() => setConfirmProfileSaveOpen(false)} className="btn-ghost">Cancel</button>
                  <button onClick={saveProfileConfirmed} disabled={profileLoading} className="btn-primary disabled:opacity-60">
                    {profileLoading ? 'Saving…' : 'Confirm'}
                  </button>
                </div>
              </Modal>
            )}

            {/* Confirm password change */}
            {confirmPasswordSaveOpen && (
              <Modal onClose={() => setConfirmPasswordSaveOpen(false)}>
                <h2 className="text-base font-semibold text-primary">Confirm Password Change</h2>
                <p className="mt-2 text-sm text-secondary">Your password will be updated immediately after confirmation.</p>
                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={() => setConfirmPasswordSaveOpen(false)} className="btn-ghost">Cancel</button>
                  <button onClick={savePasswordConfirmed} disabled={passwordLoading} className="btn-primary disabled:opacity-60">
                    {passwordLoading ? 'Updating…' : 'Confirm'}
                  </button>
                </div>
              </Modal>
            )}

            {/* Confirm logout */}
            {confirmLogoutOpen && (
              <Modal onClose={() => setConfirmLogoutOpen(false)}>
                <h2 className="text-base font-semibold text-primary">Sign Out</h2>
                <p className="mt-2 text-sm text-secondary">You'll be signed out of your account on this device.</p>
                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={() => setConfirmLogoutOpen(false)} className="btn-ghost">Cancel</button>
                  <button onClick={logout} disabled={logoutLoading} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
                    {logoutLoading ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              </Modal>
            )}
          </>
        ) : (
          <a href="/auth" className="btn-primary">Sign in →</a>
        )}
      </div>
    </div>
  );
}
