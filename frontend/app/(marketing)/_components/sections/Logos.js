const logos = [
  { name: 'Shopify', color: '#96bf48', icon: '🛍' },
  { name: 'WooCommerce', color: '#7f54b3', icon: '⚙' },
  { name: 'Amazon', color: '#ff9900', icon: '📦' },
  { name: 'Etsy', color: '#f56400', icon: '🎨' },
];

export default function Logos() {
  return (
    <section className="section-shell" aria-label="Supported platforms">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="mr-2 text-xs font-medium text-tertiary">Tracks products from:</span>
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 transition hover:border-white/15"
          >
            <span className="text-sm">{logo.icon}</span>
            <span className="text-sm font-semibold" style={{ color: logo.color }}>
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
