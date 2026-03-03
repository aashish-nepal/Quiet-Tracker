import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch } from '../../../lib/backend';
import { env } from '../../../lib/env';
import { buildIdentityHeaders } from '../../../lib/auth';

export async function POST(request) {
    try {
        const { sessionId } = await request.json();
        const token = cookies().get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const data = await backendFetch('/api/subscriptions/sync-after-checkout', {
            method: 'POST',
            headers: buildIdentityHeaders({
                authToken: token,
                demoUserId: env.demoUserId,
                enableDemoMode: env.enableDemoMode
            }),
            body: { sessionId }
        });

        return NextResponse.json(data);
    } catch (error) {
        // Non-fatal — the billing success page will fall back to polling
        return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
}
