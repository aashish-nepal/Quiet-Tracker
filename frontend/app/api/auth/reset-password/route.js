import { NextResponse } from 'next/server';
import { backendFetch } from '../../../../lib/backend';

export async function POST(request) {
    try {
        const body = await request.json();
        const data = await backendFetch('/api/auth/reset-password', { method: 'POST', body });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
}
