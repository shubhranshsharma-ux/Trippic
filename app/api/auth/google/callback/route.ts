import { NextRequest, NextResponse } from 'next/server';
import { encryptSession } from '@/lib/session';
import { getAppUrl } from '@/lib/appUrl';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const appUrl = getAppUrl();

  if (!code) {
    return NextResponse.redirect(`${appUrl}/home?error=no_code`);
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    return NextResponse.redirect(`${appUrl}/home?error=token_exchange_failed&detail=${encodeURIComponent(errBody)}`);
  }

  const tokens = await tokenRes.json();

  // Encrypt and store in cookie
  const encrypted = encryptSession({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
  });

  const response = NextResponse.redirect(`${appUrl}/home?connected=1`);
  response.cookies.set('gp_session', encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return response;
}
