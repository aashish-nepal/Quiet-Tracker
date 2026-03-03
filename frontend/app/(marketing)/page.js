import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PublicNav from '../../components/ui/PublicNav';
import { env } from '../../lib/env';
import Hero from './_components/sections/Hero';
import Solution from './_components/sections/Solution';
import Features from './_components/sections/Features';
import CTA from './_components/sections/CTA';

// Defined first so dynamic() loading props can reference it safely
function SectionPlaceholder({ label, minHeight }) {
  return (
    <section className={`section-shell panel ${minHeight} animate-pulse p-6 md:p-8`} aria-live="polite">
      <p className="eyebrow">{label}</p>
      <div className="mt-4 h-5 w-1/3 rounded bg-white/[0.06]" />
      <div className="mt-3 h-4 w-2/3 rounded bg-white/[0.04]" />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="h-28 rounded bg-white/[0.04]" />
        <div className="h-28 rounded bg-white/[0.04]" />
        <div className="h-28 rounded bg-white/[0.04]" />
      </div>
    </section>
  );
}

const Demo = dynamic(() => import('./_components/sections/Demo'), {
  ssr: false,
  loading: () => <SectionPlaceholder label="Loading Product Experience" minHeight="min-h-[680px]" />
});
const Pricing = dynamic(() => import('./_components/sections/Pricing'), {
  ssr: false,
  loading: () => <SectionPlaceholder label="Loading Pricing Intelligence" minHeight="min-h-[760px]" />
});
const FAQ = dynamic(() => import('./_components/sections/FAQ'), {
  ssr: false,
  loading: () => <SectionPlaceholder label="Loading FAQ" minHeight="min-h-[420px]" />
});

export default async function LandingPage() {
  const token = (await cookies()).get('auth_token')?.value;

  // Fetch current user if logged in (for profile in nav) — silently ignore errors
  let currentUser = null;
  if (token) {
    try {
      const res = await fetch(`${env.backendUrl}/api/auth/me`, {
        headers: { authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) currentUser = await res.json();
    } catch { /* backend may be offline, nav degrades gracefully */ }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-container px-4 py-6 sm:px-6 md:px-10 md:py-10 lg:px-2">
      <PublicNav className="mb-5" isAuthenticated={currentUser !== null} user={currentUser} />
      <Hero />
      <Solution />
      <Features />
      <Demo />
      <Pricing />
      <FAQ />
      <CTA />

      <footer className="mt-16 flex flex-col items-center gap-3 border-t border-line pt-6 text-center text-xs text-muted md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
          <Link href="#pricing" className="hover:underline">Pricing</Link>
          <Link href="#faq" className="hover:underline">FAQ</Link>
          <Link href="/legal/terms" className="hover:underline">Terms</Link>
          <Link href="/legal/privacy" className="hover:underline">Privacy</Link>
          <span>Invite-only beta</span>
        </div>
        <p>Quiet Tracker · Revenue Protection Intelligence</p>
      </footer>
    </main>
  );
}
