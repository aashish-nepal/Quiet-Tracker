import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { env } from '../../../../../lib/env';
import { buildIdentityHeaders } from '../../../../../lib/auth';

export async function GET(_request, { params }) {
  try {
    const token = cookies().get('auth_token')?.value;
    const headers = buildIdentityHeaders({
      authToken: token,
      demoUserId: env.demoUserId,
      enableDemoMode: env.enableDemoMode
    });

    const response = await fetch(`${env.backendUrl}/api/products/${params.productId}/history/csv`, {
      headers,
      cache: 'no-store'
    });

    const body = await response.text();
    if (!response.ok) {
      let parsedError = null;
      try {
        parsedError = JSON.parse(body);
      } catch {
        parsedError = null;
      }
      return NextResponse.json(
        { error: parsedError?.error || body || 'Unable to export CSV history' },
        { status: response.status || 500 }
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'content-type': response.headers.get('content-type') || 'text/csv; charset=utf-8',
        'content-disposition': response.headers.get('content-disposition') || 'attachment; filename="price-history.csv"',
        'cache-control': 'no-store'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
