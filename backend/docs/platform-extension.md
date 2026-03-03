# Adding a New Platform

The backend uses a scraper adapter pattern in `src/scrapers`.

To add a new platform:

1. Create `src/scrapers/<platform>.js`.
2. Export a `PlatformScraperAdapter` with:
   - `name`
   - `matches(platform, url)`
   - `fetch(url)`
3. Return normalized data:

```js
{
  platform: 'new_platform',
  externalProductId: 'external-id',
  title: 'Product title',
  storeName: 'store.example.com',
  price: 19.99,
  currency: 'USD',
  inStock: true,
  variantKey: 'optional-variant-key'
}
```

4. Add URL detection in `src/utils/platformDetector.js`.
5. Register the adapter in `src/scrapers/index.js`.
6. Add any credentials to `.env` / `.env.example`.
7. Validate with `POST /api/products/:productId/check`.

## Notes

- Keep adapters idempotent and side-effect free.
- Prefer official APIs, then scrape as fallback.
- Use Playwright only for JS-heavy pages.
- Return numeric prices and explicit currency codes.
- Throw `HttpError` for unsupported or unparseable URLs.
