'use client';

import { useTrips } from '@/lib/tripsContext';
import StatsHero from '@/components/StatsHero';
import TripPostcard from '@/components/TripPostcard';
import { Trip } from '@/lib/types';
import { Luggage, Search, Plus, LogOut, User, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

type SortKey = 'recent' | 'photos' | 'most-visited' | 'longest';

function sortTrips(trips: Trip[], key: SortKey): Trip[] {
  const copy = [...trips];
  if (key === 'recent') {
    return copy.sort((a, b) => b.endDate.localeCompare(a.endDate));
  }
  if (key === 'photos') {
    return copy.sort((a, b) => b.photoCount - a.photoCount);
  }
  if (key === 'most-visited') {
    const freq: Record<string, number> = {};
    trips.forEach(t => { freq[t.country] = (freq[t.country] || 0) + 1; });
    return copy.sort((a, b) => (freq[b.country] - freq[a.country]) || b.endDate.localeCompare(a.endDate));
  }
  if (key === 'longest') {
    const dur = (t: Trip) => new Date(t.endDate).getTime() - new Date(t.startDate).getTime();
    return copy.sort((a, b) => dur(b) - dur(a));
  }
  return copy;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'photos', label: 'Most photos' },
  { key: 'most-visited', label: 'Most visited' },
  { key: 'longest', label: 'Longest' },
];

export default function HomePage() {
  const { trips, stats } = useTrips();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = sortTrips(
    trips.filter(t => t.destination.toLowerCase().includes(search.toLowerCase())),
    sort
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Luggage className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-stone-800">Trippic</span>
          </div>

          {/* Avatar / profile menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-stone-200 hover:border-amber-400 transition-colors bg-amber-100 flex items-center justify-center"
            >
              <User className="w-5 h-5 text-amber-600" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-stone-100 py-2 w-44 z-50">
                <div className="px-4 py-2 border-b border-stone-100">
                  <p className="text-sm font-medium text-stone-800">My Account</p>
                  <p className="text-xs text-stone-400">Demo user</p>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search destinations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
          />
        </div>

        {/* Stats hero */}
        <StatsHero stats={stats} tripCount={trips.length} />

        {/* Sort pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {sortOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sort === opt.key
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Postcard grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* New trip card */}
          <button
            onClick={() => router.push('/new')}
            className="group border-2 border-dashed border-stone-200 rounded-2xl h-[220px] flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all"
          >
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">New trip</span>
          </button>

          {filtered.map(trip => (
            <TripPostcard key={trip.id} trip={trip} />
          ))}
        </div>

        {filtered.length === 0 && search && (
          <div className="text-center py-16 text-stone-400">
            <Camera className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No trips match &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </main>
    </div>
  );
}
