import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy · Quiet Tracker',
  description: 'Learn how Quiet Tracker collects, uses, and protects your personal information.',
};

const sections = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly when creating an account, including your name, email address, and Google OAuth credentials. When you use the Service, we also collect usage data such as tracked URLs, alert configurations, price snapshots, and activity logs. Payment information is processed securely through Stripe — we never store raw card numbers.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your data exclusively to provide, improve, and secure the Service. This includes processing tracked URLs, generating price alerts, delivering notifications via email, Slack, or Discord, and maintaining billing records. We do not use your data for advertising and do not share it with third parties for marketing purposes.`,
  },
  {
    title: '3. Data Storage & Security',
    body: `All data is encrypted at rest using industry-standard encryption. We use HTTPS-only endpoints, bcrypt password hashing for all local credentials, and strict environment-level secret separation. Screenshots captured during monitoring are stored securely and protected by database-level access controls. Access to production systems is restricted to authorized personnel only.`,
  },
  {
    title: '4. Third-Party Services',
    body: `To deliver the Service, we work with trusted third-party providers: Stripe for payment processing, Firebase/Google Cloud for secure data storage and authentication, SendGrid for transactional emails, and Slack/Discord for notification delivery. Each provider is contractually bound to handle your data securely and in accordance with applicable privacy laws.`,
  },
  {
    title: '5. Data Retention',
    body: `We retain your account data as long as your account is active. Price snapshots and alert history are retained according to your plan — standard plans retain up to 30 days of history; longer retention may be available on request. You can request deletion of your account and all associated data at any time by contacting support.`,
  },
  {
    title: '6. Cookies & Tracking',
    body: `We use session cookies and authentication tokens solely to maintain your login state. We do not use third-party advertising cookies or behavioral tracking technologies. You can disable cookies in your browser settings, though this may affect core functionality of the Service.`,
  },
  {
    title: '7. Your Rights',
    body: `Depending on your jurisdiction, you may have rights including access to your personal data, correction of inaccurate data, restriction or objection to processing, and data portability. To exercise any of these rights, contact us at privacy@quiettracker.com. We will respond within 30 days. If you are an EU resident, you also have the right to lodge a complaint with your local supervisory authority.`,
  },
  {
    title: '8. Children\'s Privacy',
    body: `The Service is not directed to individuals under 16 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately and we will promptly delete it.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. When we do, we will update the "Last updated" date above. Continued use of the Service after any changes constitutes your acceptance of the revised policy. We encourage you to review this page periodically.`,
  },
  {
    title: '10. Contact Us',
    body: `For any privacy-related questions, requests, or concerns, please contact our privacy team at privacy@quiettracker.com. For general inquiries, reach us at hello@quiettracker.com. We are committed to resolving any concerns promptly and transparently.`,
  },
];

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-secondary">
          Last updated: March 2026 · We do not sell your personal data.
        </p>
      </div>

      {/* Intro callout */}
      <div className="mb-10 rounded-2xl border border-brand-500/20 bg-brand-500/5 px-6 py-5">
        <p className="text-sm leading-relaxed text-white/80">
          Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we keep it safe. We use your data only to run and improve Quiet Tracker — nothing else.
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
        <Link href="/legal/terms" className="hover:text-primary transition">
          Terms of Service →
        </Link>
      </div>
    </main>
  );
}
