function pct(used, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export default function UsageMeter({ usage }) {
  const percent = pct(usage.activeProducts, usage.productLimit);
  const barColor = percent >= 90 ? '#ef4444' : percent >= 70 ? '#f59e0b' : '#3b82f6';
  const glowColor = percent >= 90 ? 'rgba(239,68,68,0.45)' : percent >= 70 ? 'rgba(245,158,11,0.45)' : 'rgba(59,130,246,0.45)';
  const circumference = 2 * Math.PI * 14; // r=14

  return (
    <div className="card rounded-2xl p-5 md:p-6" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${barColor}, transparent)`, opacity: 0.6 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${barColor}22`, border: `1px solid ${barColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={barColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Usage</p>
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: barColor }}>{percent}%</span>
      </div>

      {/* Donut + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="14" fill="none"
              stroke={barColor}
              strokeWidth="3"
              strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.7s ease', filter: `drop-shadow(0 0 4px ${glowColor})` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: barColor }}>{usage.activeProducts}</span>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {usage.activeProducts} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ {usage.productLimit}</span>
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>products tracked</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
            Next check:{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              {usage.nextRefreshAt ? new Date(usage.nextRefreshAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
            </span>
          </p>
        </div>
      </div>

      {/* Bar */}
      <div style={{ marginTop: 14, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${percent}%`, backgroundColor: barColor,
          boxShadow: `0 0 8px ${glowColor}`,
          transition: 'width 0.7s ease'
        }} />
      </div>
    </div>
  );
}
