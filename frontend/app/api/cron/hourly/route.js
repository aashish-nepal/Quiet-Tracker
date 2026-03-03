import { NextResponse } from 'next/server';
import { backendFetch } from '../../../../lib/backend';
import { env } from '../../../../lib/env';

function authorized(request) {
  const auth = request.headers.get('authorization') || '';
  const expected = `Bearer ${env.cronSecret}`;
  return env.cronSecret ? auth === expected : true;
}

export async function GET(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await backendFetch('/api/internal/run-scheduled-checks', {
      method: 'POST',
      headers: { 'x-cron-secret': env.cronSecret },
      body: { limit: 200 }
    });

    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
