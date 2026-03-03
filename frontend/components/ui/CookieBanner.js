'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem('cookie_consent_v1');
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    window.localStorage.setItem('cookie_consent_v1', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.10] px-5 py-4"
        style={{
          background: 'rgba(22, 22, 26, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Text */}
        <p className="flex-1 text-sm leading-relaxed text-secondary" style={{ minWidth: '200px' }}>
          <span className="mr-1 font-semibold text-primary">🍪</span>
          We use essential cookies for login sessions and analytics.{' '}
          <Link href="/legal/privacy" className="text-brand-400 underline-offset-2 hover:underline transition">
            Privacy Policy
          </Link>
        </p>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/legal/privacy"
            className="rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-secondary transition hover:text-primary hover:bg-white/[0.08]"
          >
            Learn more
          </Link>
          <button
            onClick={accept}
            className="rounded-full bg-brand-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-500 active:scale-95"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
