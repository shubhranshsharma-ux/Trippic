import { Trip, TripDay, Photo } from './types';

// Shape returned by the Google Photos Picker API.
interface MediaItem {
  id: string;
  createTime?: string;
  type?: string;
  mediaFile?: {
    baseUrl?: string;
    filename?: string;
    mimeType?: string;
  };
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

function creationTime(item: MediaItem): string | undefined {
  return item.createTime;
}

// Picker baseUrls require auth, so route them through our image proxy.
function photoUrl(item: MediaItem): string {
  const base = item.mediaFile?.baseUrl;
  if (!base) return '';
  return `/api/photos/proxy?url=${encodeURIComponent(base)}`;
}

export function groupPhotosIntoTrips(mediaItems: MediaItem[]): Trip[] {
  if (!mediaItems.length) return [];

  // Sort by creationTime ascending
  const sorted = [...mediaItems].sort((a, b) => {
    const ta = new Date(creationTime(a) ?? 0).getTime();
    const tb = new Date(creationTime(b) ?? 0).getTime();
    return ta - tb;
  });

  // Group into clusters separated by >2 day gaps
  const clusters: MediaItem[][] = [];
  let current: MediaItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevTime = new Date(creationTime(sorted[i - 1]) ?? 0).getTime();
    const currTime = new Date(creationTime(sorted[i]) ?? 0).getTime();
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
    const firstDate = new Date(creationTime(first) ?? Date.now());
    const lastDate = new Date(creationTime(last) ?? Date.now());

    const startDate = firstDate.toISOString().split('T')[0];
    const endDate = lastDate.toISOString().split('T')[0];

    const monthYear = firstDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const title = `Trip to ${monthYear}`;

    // Group photos by date for TripDays
    const dayMap = new Map<string, MediaItem[]>();
    for (const item of cluster) {
      const d = new Date(creationTime(item) ?? Date.now()).toISOString().split('T')[0];
      if (!dayMap.has(d)) dayMap.set(d, []);
      dayMap.get(d)!.push(item);
    }

    const days: TripDay[] = Array.from(dayMap.entries()).map(([date, items]) => ({
      date,
      locationName: title,
      photos: items.map(item => ({
        id: item.id,
        url: photoUrl(item),
        takenAt: creationTime(item) ?? date,
      } satisfies Photo)),
    }));

    return {
      id: `gp-trip-${idx}-${startDate}`,
      destination: title,
      country: '',
      city: '',
      startDate,
      endDate,
      heroPhotoUrl: photoUrl(first),
      photoCount: cluster.length,
      days,
      aiSummary: '',
      source: 'auto',
    } satisfies Trip;
  });
}
