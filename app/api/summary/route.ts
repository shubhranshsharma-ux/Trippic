import { NextRequest, NextResponse } from 'next/server';
import { Trip } from '@/lib/types';

export async function POST(request: NextRequest) {
  const body = await request.json() as { trip: Trip };
  const { trip } = body;

  if (!trip) {
    return NextResponse.json({ error: 'Missing trip' }, { status: 400 });
  }

  const days = Math.max(
    1,
    Math.round(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000
    ) + 1
  );
  const location = trip.destination;

  const prompt = `Generate a 2-sentence travel summary for a trip called '${trip.destination}' with ${trip.photoCount} photos taken over ${days} days in ${location}. Be warm and evocative.`;

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const summary = data.choices?.[0]?.message?.content ?? '';

  return NextResponse.json({ summary });
}
