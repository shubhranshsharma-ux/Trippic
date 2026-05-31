import { NextRequest, NextResponse } from 'next/server';
import { decryptSession } from '@/lib/session';

// Polls a picker session. Once the user has finished selecting photos
// (mediaItemsSet === true), fetches all picked media items.
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('gp_session');
  const session = sessionCookie
    ? (decryptSession(sessionCookie.value) as { accessToken?: string } | null)
    : null;

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const auth = { Authorization: `Bearer ${session.accessToken}` };

  // Check session status
  const sessRes = await fetch(
    `https://photospicker.googleapis.com/v1/sessions/${encodeURIComponent(sessionId)}`,
    { headers: auth }
  );

  if (!sessRes.ok) {
    const detail = await sessRes.text();
    return NextResponse.json(
      { error: 'Failed to poll session', detail, status: sessRes.status },
      { status: 502 }
    );
  }

  const sess = await sessRes.json() as { mediaItemsSet?: boolean };

  if (!sess.mediaItemsSet) {
    return NextResponse.json({ ready: false });
  }

  // User finished picking — fetch all picked media items (paginated)
  const mediaItems: unknown[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ sessionId, pageSize: '100' });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(
      `https://photospicker.googleapis.com/v1/mediaItems?${params.toString()}`,
      { headers: auth }
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: 'Failed to fetch picked media items', detail, status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json() as { mediaItems?: unknown[]; nextPageToken?: string };
    if (data.mediaItems) mediaItems.push(...data.mediaItems);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return NextResponse.json({ ready: true, mediaItems, count: mediaItems.length });
}
