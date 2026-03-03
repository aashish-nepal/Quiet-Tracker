const testimonials = [
  {
    quote: 'We now catch price drops the same hour they happen. That alone paid for a year of Quiet Tracker within the first week.',
    author: 'Marcus L.',
    role: 'VP Revenue, Multi-Brand Commerce Group',
    avatar: 'ML',
    rating: 5,
    gradient: 'from-blue-500/10 to-violet-500/10'
  },
  {
    quote: 'Screenshot proof made decision reviews effortless. Our merchandising and growth teams finally work from the same data.',
    author: 'Priya S.',
    role: 'Founder, DTC Apparel Portfolio',
    avatar: 'PS',
    rating: 5,
    gradient: 'from-emerald-500/10 to-teal-500/10'
  }
];

export default function Testimonials() {
  return (
    <section className="section-shell" aria-labelledby="proof-title">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Customer Feedback</p>
        <h2 id="proof-title" className="mt-4 display-md">
          Teams trust Quiet Tracker to{' '}
          <span className="gradient-text">protect their margins.</span>
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testimonials.map((t) => (
          <blockquote
            key={t.author}
            className={`card rounded-2xl bg-gradient-to-br ${t.gradient} border-white/[0.08] p-6 md:p-8`}
          >
            {/* Stars */}
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: t.rating }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            <p className="mt-4 text-base leading-relaxed text-primary" style={{ fontStyle: 'normal' }}>
              "{t.quote}"
            </p>

            <footer className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{t.author}</p>
                <p className="text-xs text-secondary">{t.role}</p>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
