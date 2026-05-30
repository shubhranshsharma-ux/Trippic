export interface Photo {
  id: string;
  url: string;
  takenAt: string;
  lat?: number;
  lng?: number;
  locationName?: string;
}

export interface TripDay {
  date: string;
  locationName: string;
  photos: Photo[];
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  heroPhotoUrl: string;
  photoCount: number;
  days: TripDay[];
  aiSummary: string;
  source: 'auto' | 'manual';
}

export interface TravelStats {
  countries: number;
  continents: number;
  trips: number;
  cities: number;
  photos: number;
  miles: number;
}
