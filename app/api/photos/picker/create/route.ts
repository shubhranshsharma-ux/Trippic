import { NextRequest, NextResponse } from 'next/server';
import { decryptSession } from '@/lib/session';

// Creates a Google Photos Picker session. The user opens the returned
// pickerUri, selects photos, and we then poll for completion.
export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('gp_session');
  const session = sessionCookie
    ? (decryptSession(sessionCookie.value) as { accessToken?: string } | null)
    : null;

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch('https://photospicker.googleapis.com/v1/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: 'Failed to create picker session', detail, status: res.status },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
