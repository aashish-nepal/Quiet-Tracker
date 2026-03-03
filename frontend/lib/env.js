const rawBackendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000').trim();

// Ensure the URL has a protocol
const backendUrl = rawBackendUrl.startsWith('http')
  ? rawBackendUrl
  : `https://${rawBackendUrl}`;

export const env = {
  backendUrl,
  demoUserId: process.env.DEMO_USER_ID || '',
  enableDemoMode: String(process.env.ENABLE_DEMO_MODE || '').toLowerCase() === 'true'
  // NOTE: CRON_SECRET is intentionally NOT included here.
  // It is a server-only secret and must only be accessed directly in server-side
  // API routes via `process.env.CRON_SECRET` to prevent browser bundle leakage.
};

