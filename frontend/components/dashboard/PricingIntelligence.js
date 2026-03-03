export default function PricingIntelligence({ analytics }) {
  const topAggressive = analytics?.mostAggressiveCompetitors?.slice(0, 5) || [];
  const volatilityTop = analytics?.volatility?.slice(0, 5) || [];

  return (
    <div className="card rounded-2xl p-6 md:p-8" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #a78bfa, #60a5fa, transparent)', opacity: 0.65 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Pricing Intelligence</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>Competitor behaviour & price volatility</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {/* Most aggressive */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '0.01em' }}>Most Aggressive Competitors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {topAggressive.length ? (
              topAggressive.map((row, idx) => (
                <div key={`${row.group_key}-${row.store_name}-${idx}`} style={{
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.025)',
                  borderLeft: '3px solid rgba(167,139,250,0.5)',
                  padding: '8px 10px 8px 12px'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{row.store_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{row.group_key}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'monospace' }}>Avg ${Number(row.avg_price_usd).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No data yet. Add competitor products to see insights.</p>
              </div>
            )}
          </div>
        </div>

        {/* Volatility */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '0.01em' }}>Volatility Score</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {volatilityTop.length ? (
              volatilityTop.map((row) => (
                <div key={row.tracked_product_id} style={{
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.025)',
                  borderLeft: '3px solid rgba(245,158,11,0.5)',
                  padding: '8px 10px 8px 12px'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{row.product_title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{row.store_name}</div>
                  <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2, fontWeight: 600 }}>Score: {row.volatility_score || 'N/A'}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No volatility data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
