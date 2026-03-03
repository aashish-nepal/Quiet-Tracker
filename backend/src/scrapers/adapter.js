export class PlatformScraperAdapter {
  constructor(name, matchesFn, fetchFn) {
    this.name = name;
    this.matches = matchesFn;
    this.fetch = fetchFn;
  }
}

export function extractVariantKeyFromUrl(url) {
  try {
    const parsed = new URL(url);
    const variant = parsed.searchParams.get('variant');
    const size = parsed.searchParams.get('size');
    const color = parsed.searchParams.get('color');

    if (variant) return `variant:${variant}`;
    if (size || color) {
      return `size:${size || 'na'}|color:${color || 'na'}`;
    }
  } catch {
    return null;
  }

  return null;
}
