import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch } from '../../../../lib/backend';
import { buildIdentityHeaders } from '../../../../lib/auth';
import { env } from '../../../../lib/env';

export async function PATCH(request) {
  try {
    const token = cookies().get('auth_token')?.value;
    const headers = buildIdentityHeaders({
      authToken: token,
      demoUserId: env.demoUserId,
      enableDemoMode: env.enableDemoMode
    });
    const body = await request.json();
    const data = await backendFetch('/api/auth/password', { method: 'PATCH', headers, body });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
