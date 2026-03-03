import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch } from '../../../lib/backend';
import { env } from '../../../lib/env';
import { buildIdentityHeaders } from '../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const token = cookies().get('auth_token')?.value;
    const headers = buildIdentityHeaders({
      authToken: token,
      demoUserId: env.demoUserId,
      enableDemoMode: env.enableDemoMode
    });
    const data = await backendFetch('/api/subscriptions/change-plan', {
      method: 'POST',
      headers,
      body
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
