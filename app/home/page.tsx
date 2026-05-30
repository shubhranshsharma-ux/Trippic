'use client';

import { useTrips } from '@/lib/tripsContext';
import { useAuth } from '@/lib/authContext';
import TripPostcard from '@/components/TripPostcard';
import FilterPanel, { Filters, EMPTY_FILTERS, applyFilters } from '@/components/FilterPanel';
import StoriesCarousel from '@/components/StoriesCarousel';
import WishlistPanel from '@/components/WishlistPanel';
import FavouritesContent from '@/components/FavouritesContent';
import ArchivedContent from '@/components/ArchivedContent';
import TravelHistory from '@/components/TravelHistory';
import { Trip } from '@/lib/types';
import {
  Luggage, Search, Plus, LogOut, User, Bookmark,
  Settings, Map, Star, Archive, BarChart2, SlidersHorizontal, X, Camera, ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

type SortKey = 'recent' | 'photos' | 'most-visited' | 'longest';
type NavTab = 'trips' | 'history' | 'favourites' | 'archived';

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

const NAV_ITEMS: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
  { tab: 'trips', label: 'My Trips', icon: <Map className="w-4 h-4" /> },
  { tab: 'history', label: 'Travel History', icon: <BarChart2 className="w-4 h-4" /> },
  { tab: 'favourites', label: 'Favourites', icon: <Star className="w-4 h-4" /> },
  { tab: 'archived', label: 'Archived', icon: <Archive className="w-4 h-4" /> },
];

export default function HomePage() {
  const { trips, stats, archivedTripIds } = useTrips();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('trips');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user === null && typeof window !== 'undefined') {
      const t = setTimeout(() => { if (!localStorage.getItem('trippic_user')) router.replace('/'); }, 100);
      return () => clearTimeout(t);
    }
  }, [user, router]);

  useEffect(() => {
    function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const visibleTrips = trips.filter(t => !archivedTripIds.includes(t.id));
  const searched = visibleTrips.filter(t => t.destination.toLowerCase().includes(search.toLowerCase()));
  const afterFilters = applyFilters(searched, filters);
  const displayed = sortTrips(afterFilters, sort);
  const filterCount = activeFilterCount(filters);
  const firstName = user?.name?.split(' ')[0] ?? 'Traveller';

  // Featured = first trip, rest in grid
  const [featuredTrip, ...restTrips] = displayed;

  return (
    <div className="min-h-screen bg-stone-50 flex pb-20">
      {/* ── Left sidebar ── */}
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-56 bg-white border-r border-stone-100 flex flex-col py-6 px-3 transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto lg:h-auto lg:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Luggage className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-stone-800 text-base">Trippic</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.tab}
              onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.tab
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="space-y-1 border-t border-stone-100 pt-4 mt-4">
          <button
            onClick={() => router.push('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            <Settings className="w-4 h-4" /> Edit profile
          </button>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-stone-100">
          <div className="px-4 sm:px-6 h-14 flex items-center gap-3">
            {/* Mobile menu button */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-stone-500 hover:text-stone-800">
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Search */}
            {activeTab === 'trips' && (
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search trips…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-100 border border-transparent rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white focus:border-stone-200 transition-all"
                />
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Archived */}
              <button
                onClick={() => setActiveTab('archived')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span className="hidden sm:block">Archived</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:border-amber-300 hover:text-amber-600 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:block">Wishlist</span>
              </button>

              {/* Avatar with gear icon to the left */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => router.push('/profile')}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-lg hover:bg-stone-100"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="w-9 h-9 rounded-full border-2 border-stone-200 hover:border-amber-400 transition-colors bg-amber-100 flex items-center justify-center overflow-hidden"
                  >
                    {user?.avatarUrl
                      ? <Image src={user.avatarUrl} alt={user.name} width={36} height={36} className="object-cover w-full h-full" />
                      : <User className="w-5 h-5 text-amber-600" />
                    }
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-stone-100 py-2 w-48 z-50">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-sm font-medium text-stone-800">{user?.name ?? 'Traveller'}</p>
                        <p className="text-xs text-stone-400">{user?.email ?? ''}</p>
                      </div>
                      <button onClick={() => { setMenuOpen(false); router.push('/profile'); }} className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Edit profile
                      </button>
                      <button onClick={() => { logout(); router.push('/'); }} className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6">
          {/* ── MY TRIPS ── */}
          {activeTab === 'trips' && (
            <div className="space-y-5">
              {/* Compact stats + stories row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: greeting + stats */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-1">Welcome back</p>
                    <h2 className="text-xl font-bold text-stone-800">Hey, {firstName} ✈️</h2>
                  </div>
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-2xl font-bold text-stone-800">{visibleTrips.length}</p>
                      <p className="text-xs text-stone-400 uppercase tracking-wide">Trips</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">{stats.cities}</p>
                      <p className="text-xs text-stone-400 uppercase tracking-wide">Cities</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">{stats.countries}</p>
                      <p className="text-xs text-stone-400 uppercase tracking-wide">Countries</p>
                    </div>
                  </div>
                </div>

                {/* Right: AI stories carousel */}
                <StoriesCarousel />
              </div>

              {/* Sort + filter row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sort By dropdown */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortKey)}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer hover:border-stone-300 transition-colors"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.key} value={opt.key}>Sort: {opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setFilterPanelOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${filterCount > 0 ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'}`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters{filterCount > 0 ? ` (${filterCount})` : ''}
                </button>
                {filterCount > 0 && <span className="text-xs text-stone-400">{displayed.length} of {visibleTrips.length} trips</span>}
              </div>

              {/* Filter panel inline */}
              {filterPanelOpen && (
                <div className="relative">
                  <button onClick={() => setFilterPanelOpen(false)} className="absolute top-3 right-3 z-10 text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                  <FilterPanel trips={visibleTrips} filters={filters} onChange={setFilters} />
                </div>
              )}

              {/* Trip grid */}
              {displayed.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <Camera className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>{search ? `No trips match "${search}"` : 'No trips match these filters'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Featured first trip — full width large card */}
                  {featuredTrip && <TripPostcard trip={featuredTrip} featured />}

                  {/* Rest in 3-col grid */}
                  {restTrips.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {restTrips.map(trip => <TripPostcard key={trip.id} trip={trip} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TRAVEL HISTORY ── */}
          {activeTab === 'history' && <TravelHistory />}

          {/* ── FAVOURITES ── */}
          {activeTab === 'favourites' && <FavouritesContent />}

          {/* ── ARCHIVED ── */}
          {activeTab === 'archived' && <ArchivedContent />}
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/new')}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2.5 bg-stone-800 hover:bg-stone-700 text-white pl-4 pr-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 font-semibold text-sm"
      >
        <Plus className="w-5 h-5" />
        New trip
      </button>

      <WishlistPanel open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </div>
  );
}
