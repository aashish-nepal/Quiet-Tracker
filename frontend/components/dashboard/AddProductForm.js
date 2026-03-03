'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [thresholdPct, setThresholdPct] = useState(1);
  const [alertBelowPrice, setAlertBelowPrice] = useState('');
  const [ownPrice, setOwnPrice] = useState('');
  const [summaryMode, setSummaryMode] = useState('immediate');
  const [productGroup, setProductGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          url,
          thresholdPct,
          alertBelowPrice: alertBelowPrice ? Number(alertBelowPrice) : null,
          ownPrice: ownPrice ? Number(ownPrice) : null,
          undercutEnabled: Boolean(ownPrice),
          summaryMode,
          productGroup
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to add product');

      setUrl('');
      setAlertBelowPrice('');
      setOwnPrice('');
      setProductGroup('');
      setSuccess('Product added! Price monitoring is now active.');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const labelStyle = { display: 'block', marginBottom: 7, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' };

  return (
    <div className="card rounded-2xl p-6 md:p-8" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6, #7c3aed, transparent)', opacity: 0.7 }} />
      {/* Soft glow */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 260, height: 120, background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'relative' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 16px rgba(59,130,246,0.2)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Track a New Product</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, marginTop: 2 }}>Paste any competitor product URL to start monitoring prices</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {/* URL — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              Product URL <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </span>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://shopify.com/products/example · Amazon · WooCommerce · Etsy"
                className="input-field"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Threshold */}
          <div>
            <label style={labelStyle}>Alert Threshold %</label>
            <input
              type="number" step="0.5" min="1" max="50"
              value={thresholdPct}
              onChange={(e) => setThresholdPct(Number(e.target.value))}
              className="input-field"
            />
            <p style={{ marginTop: 5, fontSize: 11, color: 'var(--text-tertiary)' }}>Alert when price changes by this %</p>
          </div>

          {/* Alert below price */}
          <div>
            <label style={labelStyle}>
              Alert if below price <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="number" min="0" step="0.01"
              value={alertBelowPrice}
              onChange={(e) => setAlertBelowPrice(e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </div>

          {/* Own price */}
          <div>
            <label style={labelStyle}>
              Your price (undercut) <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="number" min="0" step="0.01"
              value={ownPrice}
              onChange={(e) => setOwnPrice(e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </div>

          {/* Alert mode */}
          <div>
            <label style={labelStyle}>Alert Mode</label>
            <select
              value={summaryMode}
              onChange={(e) => setSummaryMode(e.target.value)}
              className="input-field"
            >
              <option value="immediate">Immediate — alert on each change</option>
              <option value="daily">Daily summary</option>
            </select>
          </div>

          {/* Product group — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              Product Group Key <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'none', fontWeight: 400 }}>(optional, for competitor grouping)</span>
            </label>
            <input
              value={productGroup}
              onChange={(e) => setProductGroup(e.target.value)}
              placeholder="e.g. airpods-2, running-shoes-sku-42"
              className="input-field"
            />
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Adding…
              </span>
            ) : '+ Add Product'}
          </button>

          {success && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4ade80' }}>
              <span style={{ fontSize: 16 }}>✓</span> {success}
            </p>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
            <span>⚠</span> {error}
          </div>
        )}
      </form>
    </div>
  );
}
