import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AddProductForm from '../../components/dashboard/AddProductForm';
import BillingActions from '../../components/billing/BillingActions';
import AuditLogPanel from '../../components/dashboard/AuditLogPanel';
import NotificationChannelsPanel from '../../components/dashboard/NotificationChannelsPanel';
import OnboardingFlow from '../../components/dashboard/OnboardingFlow';
import PricingIntelligence from '../../components/dashboard/PricingIntelligence';
import ProductTable from '../../components/dashboard/ProductTable';
import PublicNav from '../../components/ui/PublicNav';
import RecentAlerts from '../../components/dashboard/RecentAlerts';
import TeamMembersPanel from '../../components/dashboard/TeamMembersPanel';
import { env } from '../../lib/env';

async function fetchFromBackend(path, token) {
  const response = await fetch(`${env.backendUrl}${path}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error((await response.text()) || 'Backend fetch failed');
  return response.json();
}

async function getDashboardData(token) {
  try {
    const data = await fetchFromBackend('/api/dashboard/me', token);
    // Handle both old flat-array products and new paginated {products, total} envelope
    if (data.products && !Array.isArray(data.products)) {
      data.products = data.products.products ?? [];
    }
    return { data, backendUnavailable: false };
  } catch (error) {
    return {
      backendUnavailable: true,
      data: {
        usage: {
          activeProducts: 0, productLimit: 0, checkIntervalHours: 0,
          historyDays: 0, allowedChannels: ['email'], planId: 'unknown',
          planName: 'Unavailable', nextRefreshAt: null, subscriptionStatus: 'unavailable',
          trialEndsAt: null, currentPeriodEnd: null, gracePeriodEndsAt: null, cancelAtPeriodEnd: false
        },
        products: [],
        recentAlerts: []
      },
      errorMessage: error.message
    };
  }
}

async function getAnalytics(token) {
  try { return await fetchFromBackend('/api/analytics/me', token); }
  catch (error) {
    // Log server-side so the error is visible in backend logs rather than silently swallowed
    console.error('[dashboard] analytics fetch failed:', error.message);
    return {
      trends: [], mostAggressiveCompetitors: [], cheaperTimeShare: [], volatility: [],
      _error: true // flag for optional UI warning
    };
  }
}

async function getCurrentUser(token) {
  try { return await fetchFromBackend('/api/auth/me', token); }
  catch { return null; }
}

export default async function DashboardPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/auth');

  const [dashboardResult, analytics, currentUser] = await Promise.all([
    getDashboardData(token),
    getAnalytics(token),
    getCurrentUser(token)
  ]);
  const data = dashboardResult.data;
  const usage = data.usage;
  const usagePct = Math.min(100, Math.round((usage.activeProducts / Math.max(usage.productLimit, 1)) * 100));
  const usageBarColor = usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-brand-500';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ── Shared nav (same as landing page, profile replaces CTA) ── */}
      <PublicNav isAuthenticated={currentUser !== null} user={currentUser} hideLinks className="mb-6" />

      <main className="mx-auto min-h-screen w-full max-w-container px-4 py-6 sm:px-6 md:px-10 md:py-10 lg:px-2">

        {/* Backend unavailable warning */}
        {dashboardResult.backendUnavailable && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <span className="mt-0.5 shrink-0 text-base">⚠</span>
            <div>
              <p className="font-semibold">Backend unavailable at <code className="rounded bg-amber-500/10 px-1">{env.backendUrl}</code></p>
              <p className="mt-1 text-amber-400/70">Run <code className="rounded bg-amber-500/10 px-1">npm run dev</code> inside <code className="rounded bg-amber-500/10 px-1">backend/</code> to start the server.</p>
            </div>
          </div>
        )}

        {/* ── Hero row ──────────────────────────────────── */}
        <section className="mb-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">

          {/* Welcome card */}
          <div className="card relative overflow-hidden rounded-2xl p-7 md:p-9">
            {/* Top accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, #7c3aed, transparent)' }} />
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 90% 5%, rgba(59,130,246,0.1) 0%, transparent 65%)' }} />

            <div className="relative z-10">
              {/* Eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(59,130,246,0.4)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-400)' }}>
                  Quiet Competitor Tracker
                </span>
              </div>

              {/* Heading */}
              <h1 style={{ margin: 0, fontSize: 'clamp(1.7rem, 2.8vw, 3rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.028em', color: 'var(--text-primary)' }}>
                Track competitor prices<br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in one place.</span>
              </h1>

              {/* Subtitle */}
              <p style={{ margin: '14px 0 0', maxWidth: 480, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Monitor Shopify, WooCommerce, Amazon, and Etsy products with screenshot proof, price alerts, and historical trends.
              </p>

              {/* Platform chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 16 }}>
                {['Shopify', 'WooCommerce', 'Amazon', 'Etsy'].map(p => (
                  <span key={p} style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--text-tertiary)' }}>{p}</span>
                ))}
              </div>

              {/* Compliance */}
              <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: 11, color: '#fbbf24' }}>Respect target platform terms and API limits</span>
              </div>
            </div>
          </div>

          {/* Plan card */}
          <div className="card relative overflow-hidden rounded-2xl p-6">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #7c3aed, #3b82f6, transparent)' }} />

            {/* Plan header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Current Plan</p>
                <h2 style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, textTransform: 'capitalize', letterSpacing: '-0.02em' }}>{usage.planName}</h2>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>

            {/* Usage bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Products used</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: usagePct >= 90 ? '#ef4444' : usagePct >= 70 ? '#f59e0b' : '#60a5fa' }}>
                  {usage.activeProducts} / {usage.productLimit}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${usageBarColor}`}
                  style={{ width: `${usagePct}%`, boxShadow: usagePct >= 90 ? '0 0 8px #ef4444' : usagePct >= 70 ? '0 0 8px #f59e0b' : '0 0 8px #3b82f6' }}
                />
              </div>
            </div>

            {/* Stat chips */}
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                {
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                  label: 'Check interval',
                  value: `Every ${usage.checkIntervalHours}h`,
                },
                {
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
                  label: 'History',
                  value: usage.historyDays === null ? 'Full' : `${usage.historyDays} days`,
                },
                {
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
                  label: 'Status',
                  value: usage.subscriptionStatus,
                  accent: usage.subscriptionStatus === 'active' ? '#4ade80' : '#fbbf24',
                },
                {
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
                  label: 'Products',
                  value: `${usagePct}% used`,
                  accent: usagePct >= 90 ? '#ef4444' : undefined,
                },
              ].map(({ icon, label, value, accent }) => (
                <div key={label} style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-tertiary)', marginBottom: 3 }}>
                    {icon}
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: accent || 'var(--text-primary)', textTransform: 'capitalize' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Trial / Grace alerts */}
            {usage.trialEndsAt && (
              <div style={{ marginTop: 10, padding: '7px 10px', borderRadius: 9, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', fontSize: 12, color: '#fbbf24' }}>
                ⏳ Trial ends {new Date(usage.trialEndsAt).toLocaleDateString()}
              </div>
            )}
            {usage.gracePeriodEndsAt && (
              <div style={{ marginTop: 8, padding: '7px 10px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', fontSize: 12, color: '#f87171' }}>
                🔴 Grace period until {new Date(usage.gracePeriodEndsAt).toLocaleDateString()}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <BillingActions planId={usage.planId} />
            </div>
          </div>
        </section>

        {/* ── Widget row ──────────────────────────────── */}
        <section className="mb-6 grid gap-5 lg:grid-cols-2">
          <OnboardingFlow />
          <RecentAlerts alerts={data.recentAlerts || []} />
        </section>

        {/* ── Add product ─────────────────────────────── */}
        <section className="mb-6">
          <AddProductForm />
        </section>

        {/* ── Product table ───────────────────────────── */}
        <section className="mb-6">
          <ProductTable
            rows={data.products || []}
            canDownloadCsv={usage.planId === 'starter'}
            canViewDetailedPct={usage.planId === 'starter'}
          />
        </section>

        {/* ── Analytics ───────────────────────────────── */}
        <section className="mb-6">
          <PricingIntelligence analytics={analytics} />
        </section>

        {/* ── Bottom row ──────────────────────────────── */}
        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <TeamMembersPanel />
          <NotificationChannelsPanel />
          <AuditLogPanel />
        </section>

        <footer className="mt-10 flex items-center justify-center gap-6 text-xs text-tertiary">
          <a className="hover:text-secondary transition" href="/legal/terms">Terms</a>
          <span className="h-3 w-px bg-white/10" />
          <a className="hover:text-secondary transition" href="/legal/privacy">Privacy</a>
          <span className="h-3 w-px bg-white/10" />
          <span>Quiet Tracker © {new Date().getFullYear()}</span>
        </footer>
      </main>
    </div>
  );
}

