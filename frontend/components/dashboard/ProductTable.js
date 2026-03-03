'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return `$${Number(amount).toFixed(2)}`;
}

function PctBadge({ pct, canViewDetailedPct }) {
  if (pct === null) return <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>—</span>;
  const up = pct >= 0;
  const label = !canViewDetailedPct
    ? (pct > 0 ? 'Up ↑' : pct < 0 ? 'Down ↓' : 'Flat')
    : `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;

  return (
    <span style={{
      display: 'inline-block', borderRadius: 99, padding: '2px 8px',
      fontSize: 11, fontWeight: 700,
      background: up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
      color: up ? '#4ade80' : '#f87171',
      border: `1px solid ${up ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`
    }}>
      {label}
    </span>
  );
}

export default function ProductTable({ rows, canDownloadCsv = false, canViewDetailedPct = true }) {
  const router = useRouter();
  const [storeFilter, setStoreFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [minChange, setMinChange] = useState('0');
  const [actionBusy, setActionBusy] = useState({});
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const stores = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.store).filter(Boolean))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const min = Number(minChange || '0');
    return rows.filter((row) => {
      const matchesStore = storeFilter === 'all' || row.store === storeFilter;
      const matchesSearch =
        !search ||
        row.product?.toLowerCase().includes(search.toLowerCase()) ||
        row.url?.toLowerCase().includes(search.toLowerCase());
      const pct = row.pct_change === null || row.pct_change === undefined ? 0 : Math.abs(Number(row.pct_change));
      const matchesChange = canViewDetailedPct ? pct >= min : true;
      return matchesStore && matchesSearch && matchesChange;
    });
  }, [rows, storeFilter, search, minChange, canViewDetailedPct]);

  const isBusy = (productId, action) => Boolean(actionBusy[`${action}:${productId}`]);

  async function checkNow(productId) {
    const key = `check:${productId}`;
    setActionError(''); setActionSuccess('');
    setActionBusy((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`/api/products/${productId}/check`, { method: 'POST' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Check failed');
      setActionSuccess('Manual check completed successfully.');
      router.refresh();
    } catch (err) {
      setActionError(err.message || 'Unable to check product now');
    } finally {
      setActionBusy((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function removeProduct(productId) {
    const key = `delete:${productId}`;
    setActionError(''); setActionSuccess('');
    setActionBusy((prev) => ({ ...prev, [key]: true }));
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Delete failed');
      setActionSuccess('Product removed.');
      router.refresh();
    } catch (err) {
      setActionError(err.message || 'Unable to delete product');
    } finally {
      setActionBusy((prev) => ({ ...prev, [key]: false }));
    }
  }

  return (
    <div className="card rounded-2xl p-6 md:p-8" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', opacity: 0.6 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Tracked Products</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            {filteredRows.length} of {rows.length} products
          </p>
        </div>
        {!canViewDetailedPct && (
          <span className="badge badge-gray" style={{ fontSize: 10 }}>Upgrade for exact % values</span>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or URLs…"
            className="input-field"
            style={{ paddingLeft: 34, width: 240, fontSize: 12 }}
          />
        </div>

        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="input-field"
          style={{ width: 'auto', fontSize: 12 }}
        >
          <option value="all">All stores</option>
          {stores.map((store) => (
            <option key={store} value={store}>{store}</option>
          ))}
        </select>

        {canViewDetailedPct && (
          <input
            type="number" min="0" step="0.1"
            value={minChange}
            onChange={(e) => setMinChange(e.target.value)}
            className="input-field"
            style={{ width: 110, fontSize: 12 }}
            aria-label="Minimum % change filter"
            placeholder="Min % change"
          />
        )}
      </div>

      {/* Status messages */}
      {actionError && (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
          <span>⚠</span> {actionError}
        </div>
      )}
      {actionSuccess && (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.1)', padding: '10px 14px', fontSize: 13, color: '#4ade80' }}>
          <span>✓</span> {actionSuccess}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 900, borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              {['Product', 'Store', 'Old Price', 'New Price', 'Change', 'Mode', 'Next Check', 'Updated', 'History', 'Actions'].map((h) => (
                <th key={h} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 10, paddingRight: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const pct = row.pct_change === null || row.pct_change === undefined ? null : Number(row.pct_change);
              return (
                <tr key={row.id} style={{ transition: 'background 0.12s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{row.product || 'Untitled product'}</div>
                    <div style={{ marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {row.platform}{row.variant_key ? ` · ${row.variant_key}` : ''}
                    </div>
                  </td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{row.store || 'Unknown'}</td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{formatCurrency(row.old_price)}</td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(row.new_price)}</td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0' }}>
                    <PctBadge pct={pct} canViewDetailedPct={canViewDetailedPct} />
                  </td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0' }}>
                    <span className="badge badge-gray" style={{ fontSize: 10, textTransform: 'capitalize' }}>{row.summary_mode || 'immediate'}</span>
                  </td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0', fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {row.next_check_at ? new Date(row.next_check_at).toLocaleString() : 'Scheduled'}
                  </td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0', fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {row.last_checked_at ? new Date(row.last_checked_at).toLocaleString() : 'Never'}
                  </td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px 12px 0' }}>
                    {canDownloadCsv ? (
                      <button
                        onClick={() => { window.location.href = `/api/products/${row.id}/history-csv`; }}
                        className="btn-ghost"
                        style={{ fontSize: 11, padding: '5px 10px' }}
                      >
                        ↓ CSV
                      </button>
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Starter only</span>
                    )}
                  </td>
                  <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0 12px 0' }}>
                    {confirmDeleteId === row.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Remove?</span>
                        <button
                          onClick={() => removeProduct(row.id)}
                          disabled={isBusy(row.id, 'delete')}
                          className="btn-ghost"
                          style={{ fontSize: 11, padding: '4px 10px', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                        >
                          {isBusy(row.id, 'delete') ? '…' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="btn-ghost"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => checkNow(row.id)}
                          disabled={isBusy(row.id, 'check') || isBusy(row.id, 'delete')}
                          className="btn-ghost"
                          style={{ fontSize: 11, padding: '5px 10px', opacity: (isBusy(row.id, 'check') || isBusy(row.id, 'delete')) ? 0.4 : 1 }}
                        >
                          {isBusy(row.id, 'check') ? '…' : '⟳ Check'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(row.id)}
                          disabled={isBusy(row.id, 'check') || isBusy(row.id, 'delete')}
                          className="btn-ghost"
                          style={{ fontSize: 11, padding: '5px 10px', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)', opacity: (isBusy(row.id, 'check') || isBusy(row.id, 'delete')) ? 0.4 : 1 }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {isBusy(row.id, 'delete') ? '…' : '✕'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: '48px 0', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22 }}>📭</div>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>No tracked products match this filter.</p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Try adjusting your search or add a new product above.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
