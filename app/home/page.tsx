'use client';

import { useTrips } from '@/lib/tripsContext';
import StatsHero from '@/components/StatsHero';
import TripPostcard from '@/components/TripPostcard';
import FilterPanel, { Filters, EMPTY_FILTERS, applyFilters } from '@/components/FilterPanel';
import { Trip } from '@/lib/types';
import { Luggage, Search, Plus, LogOut, User, Camera, SlidersHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

type SortKey = 'recent' | 'photos' | 'most-visited' | 'longest';

function sortTrips(trips: Trip[], key: SortKey): Trip[] {
  const copy = [...trips];
  if (key === 'recent') return copy.sort((a, b) => b.endDate.localeCompare(a.endDate));
  if (key === 'photos') return copy.sort((a, b) => b.photoCount - a.photoCount);
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

function activeFilterCount(f: Filters) {
  return f.years.length + f.cities.length + f.tripTypes.length + f.duration.length + (f.minPhotos > 0 ? 1 : 0);
}

export default function HomePage() {
  const { trips, stats } = useTrips();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
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

  const searched = trips.filter(t => t.destination.toLowerCase().includes(search.toLowerCase()));
  const afterFilters = applyFilters(searched, filters);
  const displayed = sortTrips(afterFilters, sort);
  const filterCount = activeFilterCount(filters);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Luggage className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-800">Trippic</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(v => !v)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-stone-300 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {filterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-9 h-9 rounded-full border-2 border-stone-200 hover:border-amber-400 transition-colors bg-amber-100 flex items-center justify-center"
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
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search destinations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
          />
        </div>

        {/* Stats hero — full width */}
        <div className="mb-6">
          <StatsHero stats={stats} tripCount={trips.length} />
        </div>

        {/* Main layout: sidebar + content */}
        <div className="flex gap-6 items-start">
          {/* Filter sidebar — desktop */}
          <aside className="hidden lg:block">
            <FilterPanel trips={trips} filters={filters} onChange={setFilters} />
          </aside>

          {/* Mobile filter overlay */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => setMobileFilterOpen(false)} className="text-stone-400 hover:text-white p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterPanel trips={trips} filters={filters} onChange={setFilters} />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">
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
              {filterCount > 0 && (
                <span className="text-xs text-stone-400 ml-1">
                  {displayed.length} of {trips.length} trips
                </span>
              )}
            </div>

            {/* Postcard grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/new')}
                className="group border-2 border-dashed border-stone-200 rounded-2xl h-[220px] flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all"
              >
                <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">New trip</span>
              </button>

              {displayed.map(trip => (
                <TripPostcard key={trip.id} trip={trip} />
              ))}
            </div>

            {displayed.length === 0 && (
              <div className="text-center py-16 text-stone-400">
                <Camera className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>{search ? `No trips match "${search}"` : 'No trips match these filters'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
