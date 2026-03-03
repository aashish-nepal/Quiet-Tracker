export const env = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  demoUserId: process.env.DEMO_USER_ID || '',
  enableDemoMode: String(process.env.ENABLE_DEMO_MODE || '').toLowerCase() === 'true'
  // NOTE: CRON_SECRET is intentionally NOT included here.
  // It is a server-only secret and must only be accessed directly in server-side
  // API routes via `process.env.CRON_SECRET` to prevent browser bundle leakage.
};
