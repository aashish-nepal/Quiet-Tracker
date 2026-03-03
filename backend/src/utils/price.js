export function toNumber(value) {
  const n = parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function safePercentChange(oldPrice, newPrice) {
  if (oldPrice == null || oldPrice === 0) return null;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}
