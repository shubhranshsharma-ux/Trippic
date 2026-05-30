'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trip, TravelStats } from './types';
import { mockTrips, mockStats } from './mockData';

interface TripsContextValue {
  trips: Trip[];
  stats: TravelStats;
  addTrip: (trip: Trip) => void;
  useMock: boolean;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
  const [trips, setTrips] = useState<Trip[]>(useMock ? mockTrips : []);
  const [stats] = useState<TravelStats>(useMock ? mockStats : { countries: 0, continents: 0, trips: 0, cities: 0, photos: 0, miles: 0 });

  function addTrip(trip: Trip) {
    setTrips(prev => [trip, ...prev]);
  }

  return (
    <TripsContext.Provider value={{ trips, stats, addTrip, useMock }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within TripsProvider');
  return ctx;
}
