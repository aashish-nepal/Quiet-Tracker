import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch } from '../../../lib/backend';
import { env } from '../../../lib/env';
import { buildIdentityHeaders } from '../../../lib/auth';

export async function POST() {
  try {
    const token = cookies().get('auth_token')?.value;
    const data = await backendFetch('/api/subscriptions/portal', {
      method: 'POST',
      headers: buildIdentityHeaders({
        authToken: token,
        demoUserId: env.demoUserId,
        enableDemoMode: env.enableDemoMode
      }),
      body: {}
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
