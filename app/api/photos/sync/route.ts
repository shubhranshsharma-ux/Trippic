import { NextRequest, NextResponse } from 'next/server';
import { decryptSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('gp_session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = decryptSession(sessionCookie.value) as { accessToken?: string } | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accessToken } = session;
  const allItems: unknown[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: '100' });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch photos from Google Photos' }, { status: 502 });
    }

    const data = await res.json() as { mediaItems?: unknown[]; nextPageToken?: string };
    if (data.mediaItems) allItems.push(...data.mediaItems);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return NextResponse.json({ mediaItems: allItems, count: allItems.length });
}
