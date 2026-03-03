import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const token = body?.token;
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
