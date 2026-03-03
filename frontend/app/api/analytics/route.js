import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch } from '../../../lib/backend';
import { env } from '../../../lib/env';
import { buildIdentityHeaders } from '../../../lib/auth';

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;
    const useDemo = !token && env.enableDemoMode && Boolean(env.demoUserId);
    if (!token && !useDemo) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const headers = buildIdentityHeaders({
      authToken: token,
      demoUserId: env.demoUserId,
      enableDemoMode: env.enableDemoMode
    });
    const path = token ? '/api/analytics/me' : `/api/analytics/${env.demoUserId}`;
    const data = await backendFetch(path, { headers });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
