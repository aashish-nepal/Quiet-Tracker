import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch } from '../../../../../lib/backend';
import { env } from '../../../../../lib/env';
import { buildIdentityHeaders } from '../../../../../lib/auth';

function identityHeaders() {
  const token = cookies().get('auth_token')?.value;
  return buildIdentityHeaders({
    authToken: token,
    demoUserId: env.demoUserId,
    enableDemoMode: env.enableDemoMode
  });
}

export async function POST(_request, { params }) {
  try {
    const data = await backendFetch(`/api/products/${params.productId}/check`, {
      method: 'POST',
      headers: identityHeaders(),
      body: {}
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status || 500 });
  }
}
