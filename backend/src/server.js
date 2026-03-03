import { createApp } from './app.js';
import { env } from './config/env.js';
import { ensureCoreSchema } from './db/bootstrap.js';

const app = createApp();

async function start() {
  try {
    await ensureCoreSchema();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to ensure core database schema:', error.message || error);
    process.exit(1);
  }

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start();
