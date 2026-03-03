'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MAX_ATTEMPTS = 15;   // 15 × 2s = 30 seconds max wait
const POLL_INTERVAL = 2000; // 2 seconds

// useSearchParams() requires a <Suspense> boundary in Next.js 13+.
// We split the logic into this inner component so it can be wrapped below.
function BillingSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('polling'); // 'polling' | 'confirmed' | 'timeout'
  const attempts = useRef(0);

  useEffect(() => {
    let timer;
    let cancelled = false;

    async function syncAndPoll() {
      // Step 1: Try a direct sync using the Stripe session_id.
      // Stripe appends ?session_id=cs_xxx to the success_url automatically.
      const sessionId = searchParams.get('session_id');
      if (sessionId && sessionId.startsWith('cs_')) {
        try {
          const syncRes = await fetch('/api/sync-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          // If sync succeeded, we may already be on starter — check immediately
          if (syncRes.ok) {
            if (cancelled) return;
            const planRes = await fetch('/api/plan', { cache: 'no-store' });
            if (planRes.ok) {
              const planData = await planRes.json();
              if (planData?.planId === 'starter') {
                if (!cancelled) setStatus('confirmed');
                return;
              }
            }
          }
        } catch {
          // Non-fatal — fall through to polling
        }
      }

      // Step 2: Poll until the DB reflects the updated plan.
      async function checkPlan() {
        if (cancelled) return;
        attempts.current += 1;

        try {
          const res = await fetch('/api/plan', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data?.planId === 'starter') {
              if (!cancelled) setStatus('confirmed');
              return;
            }
          }
        } catch {
          // network hiccup — keep polling
        }

        if (attempts.current >= MAX_ATTEMPTS) {
          if (!cancelled) setStatus('timeout');
          return;
        }

        timer = setTimeout(checkPlan, POLL_INTERVAL);
      }

      // Brief delay before first poll
      timer = setTimeout(checkPlan, 1000);
    }

    syncAndPoll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            border: status === 'polling'
              ? '1px solid rgba(59,130,246,0.3)'
              : '1px solid rgba(74,222,128,0.3)',
            background: status === 'polling'
              ? 'rgba(59,130,246,0.08)'
              : 'rgba(74,222,128,0.08)',
            transition: 'all 0.4s ease'
          }}
        >
          {status === 'polling' ? (
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(59,130,246,0.25)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {/* Card */}
        <div
          className="mt-6 w-full rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 40px rgba(0,0,0,0.3)',
          }}
        >
          {status === 'polling' && (
            <>
              <h1 className="text-2xl font-black text-white">Activating your plan…</h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Hold tight — confirming your Starter subscription. This usually takes a few seconds.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-48 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full animate-pulse rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, (attempts.current / MAX_ATTEMPTS) * 100)}%`, transition: 'width 0.5s ease' }}
                  />
                </div>
              </div>
            </>
          )}

          {status === 'confirmed' && (
            <>
              <h1 className="text-2xl font-black text-white">Subscription updated</h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Your Starter plan is now active. All features are unlocked — enjoy!
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  Return to dashboard →
                </button>
              </div>
            </>
          )}

          {status === 'timeout' && (
            <>
              <h1 className="text-2xl font-black text-white">Payment received</h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Your payment was successful. Your plan may take a moment to reflect — refresh your dashboard if features are not yet unlocked.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  Return to dashboard →
                </button>
              </div>
            </>
          )}
        </div>

        {status !== 'polling' && (
          <p className="mt-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Questions?{' '}
            <a href="mailto:support@quiettracker.app" className="text-brand-400 hover:underline underline-offset-2">
              Contact support
            </a>
          </p>
        )}
      </div>
    </main>
  );
}

// Suspense boundary required by Next.js 13+ when useSearchParams() is used
// in a client component. Without this the page throws during SSR.
export default function BillingSuccessPage() {
  return (
    <Suspense>
      <BillingSuccessInner />
    </Suspense>
  );
}
