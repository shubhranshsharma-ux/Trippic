import { NextRequest, NextResponse } from 'next/server';
import { decryptSession } from '@/lib/session';

// Proxies a Google Photos Picker baseUrl, attaching the user's access token.
// Picker media bytes are not publicly accessible and require authorization.
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('gp_session');
  const session = sessionCookie
    ? (decryptSession(sessionCookie.value) as { accessToken?: string } | null)
    : null;

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = request.nextUrl.searchParams.get('url');
  if (!baseUrl || !/^https:\/\/[^/]*\.googleusercontent\.com\//.test(baseUrl)) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  // Request a reasonably sized image (=w1600-h1600 keeps aspect ratio).
  const sized = baseUrl.includes('=') ? baseUrl : `${baseUrl}=w1600-h1600`;

  const res = await fetch(sized, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
