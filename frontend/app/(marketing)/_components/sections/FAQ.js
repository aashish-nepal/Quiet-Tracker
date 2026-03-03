'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

const categories = ['All', 'Pricing', 'Security', 'Features', 'Team'];

const faqs = [
  {
    q: 'How quickly are price changes detected?',
    a: 'On the Starter plan, listings are checked every 12 hours. Free plan checks every 24 hours. Alerts are sent immediately when a price crosses your configured threshold — typically within 2 minutes of detection.',
    cat: 'Features',
  },
  {
    q: 'Can we use screenshot evidence in internal reviews?',
    a: 'Yes. Every alert includes a timestamped screenshot with source URL and capture time, stored securely and exportable as evidence for pricing decisions and team reviews.',
    cat: 'Features',
  },
  {
    q: 'How is team access controlled?',
    a: 'Quiet Tracker supports role-based access (Owner and Analyst roles), full immutable audit logs of every action, and Google OAuth for secure, passwordless login.',
    cat: 'Security',
  },
  {
    q: 'Is this for store owners or agencies?',
    a: 'Both. Individual store owners use it to watch competitors. Agencies use Starter to monitor multiple client stores across platforms from a single unified dashboard.',
    cat: 'Team',
  },
  {
    q: 'What happens when I hit my product limit?',
    a: "You'll see a clear message when you're at your plan limit. Upgrading to Starter instantly raises it to 20 products with priority processing and no disruption to existing monitors.",
    cat: 'Pricing',
  },
  {
    q: 'Is my pricing data secure?',
    a: 'Absolutely. All data is encrypted at rest. We use bcrypt password hashing, HTTPS-only endpoints, and strict environment-level secret separation. Screenshots are protected by database-level access controls.',
    cat: 'Security',
  },
  {
    q: 'Which platforms are supported?',
    a: 'Quiet Tracker currently monitors Shopify, WooCommerce, Amazon (US), and Etsy. Support for additional platforms is on the roadmap based on demand.',
    cat: 'Features',
  },
  {
    q: 'Can I cancel my Starter plan anytime?',
    a: "Yes. Cancel anytime from your billing dashboard — no questions asked. You'll keep access until the end of your billing period. New subscribers also get a 7-day free trial.",
    cat: 'Pricing',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f => {
    const matchesCat = activeCategory === 'All' || f.cat === activeCategory;
    const matchesSearch = search === '' ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="faq" className="section-shell" aria-labelledby="faq-title">
      {/* Header */}
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-title" className="mt-4 display-lg">
          Honest answers <span className="gradient-text">before you sign up.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-secondary sm:text-base">
          Everything you need to know about how Quiet Tracker works, what’s included, and what to expect.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
        <input
          type="search"
          placeholder="Search questions…"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(null); }}
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3 pl-9 pr-4 text-sm text-primary placeholder:text-tertiary outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 transition"
        />
      </div>

      {/* Category filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setOpen(null); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${activeCategory === cat
              ? 'bg-brand-600 text-white'
              : 'border border-white/[0.08] bg-white/[0.03] text-secondary hover:text-primary hover:border-white/[0.14]'
              }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 opacity-60">{faqs.filter(f => f.cat === cat).length}</span>
            )}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-tertiary">{filtered.length} question{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Accordion */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] py-10 text-center"
            >
              <p className="text-sm text-tertiary">No questions match your search.</p>
            </motion.div>
          ) : (
            filtered.map((item, index) => {
              const isOpen = open === index;
              return (
                <motion.article
                  key={item.q}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className={`card overflow-hidden rounded-2xl transition-all duration-200 ${isOpen ? 'border-brand-500/30' : 'hover:border-white/[0.14]'
                    }`}
                >
                  <h3>
                    <button
                      onClick={() => setOpen(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-white"
                      style={{ color: '#f4f4f5' }}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Category badge */}
                        <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-tertiary">
                          {item.cat}
                        </span>
                        <span className="faq-q text-sm font-semibold md:text-base">{item.q}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <ChevronDown size={16} className="text-secondary" aria-hidden="true" />
                      </motion.div>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="border-t border-white/[0.06] px-5 py-4">
                          <p className="text-sm leading-relaxed text-secondary">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA nudge */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
        <p className="text-sm text-secondary">Still have questions? We're real people who respond fast.</p>
        <a href="mailto:hello@quiettracker.com"
          className="rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-xs font-semibold text-primary hover:bg-white/[0.09] transition">
          Contact us →
        </a>
      </div>
    </section>
  );
}
