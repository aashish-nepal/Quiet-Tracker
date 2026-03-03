export default function RecentAlerts({ alerts }) {
  return (
    <div className="card rounded-2xl p-5 md:p-6" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', opacity: 0.55 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Recent Alerts</p>
        </div>
        {alerts?.length > 0 && (
          <span className="badge badge-red">{alerts.length}</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {alerts?.length ? (
          alerts.slice(0, 5).map((alert) => {
            const pct = Number(alert.pct_change);
            const isDown = pct < 0;
            return (
              <div key={alert.id} style={{
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.025)',
                borderLeft: `3px solid ${isDown ? '#ef4444' : '#22c55e'}`,
                padding: '9px 10px 9px 12px',
                transition: 'background 0.15s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.product_title}</span>
                  <span style={{
                    flexShrink: 0, borderRadius: 99, padding: '1px 7px',
                    fontSize: 10, fontWeight: 700,
                    background: isDown ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                    color: isDown ? '#f87171' : '#4ade80'
                  }}>
                    {isDown ? '↓' : '↑'} {Math.abs(pct).toFixed(1)}%
                  </span>
                </div>
                <div style={{ marginTop: 3, fontSize: 10, color: 'var(--text-tertiary)' }}>{alert.store_name}</div>
                <div style={{ marginTop: 3, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                  ${Number(alert.old_price).toFixed(2)} →{' '}
                  <span style={{ color: isDown ? '#f87171' : '#4ade80', fontWeight: 700 }}>
                    ${Number(alert.new_price).toFixed(2)}
                  </span>
                </div>
                {alert.screenshot_path && (
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#60a5fa' }}>
                    <span>📸</span> Screenshot captured
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 18 }}>🔔</div>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No alerts yet.</p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>Add products to start monitoring.</p>
          </div>
        )}
      </div>
    </div>
  );
}
