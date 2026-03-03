import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch } from '../../../../lib/backend';
import { env } from '../../../../lib/env';
import { buildIdentityHeaders } from '../../../../lib/auth';

function identityHeaders() {
  const token = cookies().get('auth_token')?.value;
  return buildIdentityHeaders({
    authToken: token,
    demoUserId: env.demoUserId,
    enableDemoMode: env.enableDemoMode
  });
}

export async function GET() {
  try {
    const data = await backendFetch('/api/notifications/channels', { headers: identityHeaders() });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status || 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await backendFetch('/api/notifications/channels', {
      method: 'POST',
      headers: identityHeaders(),
      body
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status || 500 });
  }
}
