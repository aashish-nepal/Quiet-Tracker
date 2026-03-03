import { NextResponse } from 'next/server';
import { backendFetch } from '../../../../lib/backend';

export async function GET(request) {
  try {
    const state = request.nextUrl.searchParams.get('state') || '';
    const query = new URLSearchParams();
    if (state) query.set('state', state);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const data = await backendFetch(`/api/auth/google/url${suffix}`);
    return NextResponse.json(data);
  } catch (error) {
    const message = error?.details?.error || error.message || 'Unable to initialize Google sign-in';
    const googleConfigError = message.toLowerCase().includes('google oauth is not configured');

    if (googleConfigError) {
      return NextResponse.json({
        url: null,
        configured: false,
        error: 'Google sign-in is not configured yet. Use email and password for now.'
      });
    }

    return NextResponse.json({ error: message }, { status: error.status || 500 });
  }
}
