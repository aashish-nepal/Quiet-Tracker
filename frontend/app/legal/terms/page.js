import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service · Quiet Tracker',
  description: 'Read the Terms of Service for Quiet Tracker — competitor price monitoring intelligence.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Quiet Tracker ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. These terms apply to all users, including browsers, customers, merchants, and contributors of content.`,
  },
  {
    title: '2. Description of Service',
    body: `Quiet Tracker provides competitor price monitoring intelligence by tracking publicly available product listings across supported e-commerce platforms including Shopify, WooCommerce, Amazon, and Etsy. The Service delivers alerts, historical price data, and screenshot evidence to help commerce teams make informed pricing decisions.`,
  },
  {
    title: '3. Acceptable Use',
    body: `You agree to use the Service only for lawful purposes and in accordance with the terms of the platforms you monitor. You are solely responsible for ensuring that your use of the Service — including any automated data access — complies with applicable laws, platform terms of service, and anti-scraping policies in your jurisdiction. Quiet Tracker must not be used with any malicious, deceptive, or competitively harmful intent beyond legitimate price research.`,
  },
  {
    title: '4. Account Responsibilities',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these terms, engage in abusive usage patterns, or circumvent platform protections.`,
  },
  {
    title: '5. Intellectual Property',
    body: `All content, design, algorithms, and functionality of the Service are owned by Quiet Tracker and are protected by applicable intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the Service without explicit written permission. The data you track remains yours; however, you grant Quiet Tracker a limited license to store and process that data to deliver the Service.`,
  },
  {
    title: '6. Disclaimer of Warranties',
    body: `The Service is provided on an "as-is" and "as-available" basis without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely accurate. Price data is sourced from third-party sites and may occasional differ due to caching delays, platform changes, or regional pricing variations.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `To the maximum extent permitted by law, Quiet Tracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of revenue or profits — arising from your use or inability to use the Service, even if we have been advised of the possibility of such damages.`,
  },
  {
    title: '8. Service Modifications & Termination',
    body: `We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We may suspend accounts that violate these terms or where legal constraints apply. Continued use of the Service after changes constitutes acceptance of the revised terms.`,
  },
  {
    title: '9. Governing Law',
    body: `These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising from these terms will be resolved through good-faith negotiation, and if unresolved, through binding arbitration.`,
  },
  {
    title: '10. Contact',
    body: `If you have questions about these Terms of Service, please contact us at legal@quiettracker.com. We aim to respond to all legal inquiries within 5 business days.`,
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-14 md:py-20">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition"
        >
          ← Back to home
        </Link>
        <p className="eyebrow mt-6">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-primary md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-secondary">
          Last updated: March 2026 · Applies to all Quiet Tracker plans.
        </p>
      </div>

      {/* Intro callout */}
      <div className="mb-10 rounded-2xl border border-brand-500/20 bg-brand-500/5 px-6 py-5">
        <p className="text-sm leading-relaxed text-white/80">
          These terms govern your use of Quiet Tracker. By using the Service, you confirm you have read and agree to these terms. Please read them carefully before using the platform.
        </p>
      </div>

      {/* Sections */}
      <article className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-6"
          >
            <h2 className="mb-3 text-base font-bold text-primary">{section.title}</h2>
            <p className="text-sm leading-relaxed text-white/75">{section.body}</p>
          </div>
        ))}
      </article>

      {/* Footer nav */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-8 text-sm text-secondary">
        <p>© {new Date().getFullYear()} Quiet Tracker. All rights reserved.</p>
        <Link href="/legal/privacy" className="hover:text-primary transition">
          Privacy Policy →
        </Link>
      </div>
    </main>
  );
}
