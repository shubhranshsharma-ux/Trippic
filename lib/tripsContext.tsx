'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trip, TravelStats, TripDay } from './types';
import { mockTrips, mockStats } from './mockData';

interface TripsContextValue {
  trips: Trip[];
  stats: TravelStats;
  favouritePhotoIds: string[];
  archivedTripIds: string[];
  archivedPhotoIds: string[];
  addTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  toggleFavourite: (id: string) => void;
  togglePhotoFavourite: (photoId: string) => void;
  toggleArchiveTrip: (id: string) => void;
  toggleArchivePhoto: (photoId: string) => void;
  setHeroPhoto: (tripId: string, photoUrl: string) => void;
  deletePhoto: (tripId: string, photoId: string) => void;
  updateDay: (tripId: string, date: string, patch: Partial<Pick<TripDay, 'summary' | 'kmTravelled'>>) => void;
  useMock: boolean;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
  const [trips, setTrips] = useState<Trip[]>(useMock ? mockTrips : []);
  const [stats] = useState<TravelStats>(useMock ? mockStats : { countries: 0, continents: 0, trips: 0, cities: 0, photos: 0, miles: 0 });
  const [favouritePhotoIds, setFavouritePhotoIds] = useState<string[]>([]);
  const [archivedTripIds, setArchivedTripIds] = useState<string[]>([]);
  const [archivedPhotoIds, setArchivedPhotoIds] = useState<string[]>([]);

  function addTrip(trip: Trip) { setTrips(prev => [trip, ...prev]); }
  function deleteTrip(id: string) { setTrips(prev => prev.filter(t => t.id !== id)); }
  function toggleFavourite(id: string) {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, isFavourite: !t.isFavourite } : t));
  }
  function togglePhotoFavourite(photoId: string) {
    setFavouritePhotoIds(prev => prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]);
  }
  function toggleArchiveTrip(id: string) {
    setArchivedTripIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleArchivePhoto(photoId: string) {
    setArchivedPhotoIds(prev => prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]);
  }
  function setHeroPhoto(tripId: string, photoUrl: string) {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, heroPhotoUrl: photoUrl } : t));
  }
  function deletePhoto(tripId: string, photoId: string) {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const days = t.days.map(d => ({ ...d, photos: d.photos.filter(p => p.id !== photoId) })).filter(d => d.photos.length > 0);
      return { ...t, days, photoCount: Math.max(0, t.photoCount - 1) };
    }));
  }
  function updateDay(tripId: string, date: string, patch: Partial<Pick<TripDay, 'summary' | 'kmTravelled'>>) {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, days: t.days.map(d => d.date === date ? { ...d, ...patch } : d) };
    }));
  }

  return (
    <TripsContext.Provider value={{ trips, stats, favouritePhotoIds, archivedTripIds, archivedPhotoIds, addTrip, deleteTrip, toggleFavourite, togglePhotoFavourite, toggleArchiveTrip, toggleArchivePhoto, setHeroPhoto, deletePhoto, updateDay, useMock }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within TripsProvider');
  return ctx;
}
