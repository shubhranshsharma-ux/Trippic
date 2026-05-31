import { Trip, TripDay, Photo } from './types';

interface MediaItem {
  id: string;
  baseUrl: string;
  mediaMetadata?: {
    creationTime?: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
    };
  };
  filename?: string;
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function groupPhotosIntoTrips(mediaItems: MediaItem[]): Trip[] {
  if (!mediaItems.length) return [];

  // Sort by creationTime ascending
  const sorted = [...mediaItems].sort((a, b) => {
    const ta = new Date(a.mediaMetadata?.creationTime ?? 0).getTime();
    const tb = new Date(b.mediaMetadata?.creationTime ?? 0).getTime();
    return ta - tb;
  });

  // Group into clusters separated by >2 day gaps
  const clusters: MediaItem[][] = [];
  let current: MediaItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevTime = new Date(sorted[i - 1].mediaMetadata?.creationTime ?? 0).getTime();
    const currTime = new Date(sorted[i].mediaMetadata?.creationTime ?? 0).getTime();
    if (currTime - prevTime > TWO_DAYS_MS) {
      clusters.push(current);
      current = [];
    }
    current.push(sorted[i]);
  }
  clusters.push(current);

  // Build Trip[] from clusters
  return clusters.map((cluster, idx) => {
    const first = cluster[0];
    const last = cluster[cluster.length - 1];
    const firstDate = new Date(first.mediaMetadata?.creationTime ?? Date.now());
    const lastDate = new Date(last.mediaMetadata?.creationTime ?? Date.now());

    const startDate = firstDate.toISOString().split('T')[0];
    const endDate = lastDate.toISOString().split('T')[0];

    const monthYear = firstDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const title = `Trip to ${monthYear}`;

    // Group photos by date for TripDays
    const dayMap = new Map<string, MediaItem[]>();
    for (const item of cluster) {
      const d = new Date(item.mediaMetadata?.creationTime ?? Date.now()).toISOString().split('T')[0];
      if (!dayMap.has(d)) dayMap.set(d, []);
      dayMap.get(d)!.push(item);
    }

    const days: TripDay[] = Array.from(dayMap.entries()).map(([date, items]) => ({
      date,
      locationName: title,
      photos: items.map(item => ({
        id: item.id,
        url: item.baseUrl,
        takenAt: item.mediaMetadata?.creationTime ?? date,
      } satisfies Photo)),
    }));

    return {
      id: `gp-trip-${idx}-${startDate}`,
      destination: title,
      country: '',
      city: '',
      startDate,
      endDate,
      heroPhotoUrl: first.baseUrl,
      photoCount: cluster.length,
      days,
      aiSummary: '',
      source: 'auto',
    } satisfies Trip;
  });
}
