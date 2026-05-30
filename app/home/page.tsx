'use client';

import { useTrips } from '@/lib/tripsContext';
import { useAuth } from '@/lib/authContext';
import TripPostcard from '@/components/TripPostcard';
import { Filters, EMPTY_FILTERS, applyFilters } from '@/components/FilterPanel';
import StoriesCarousel from '@/components/StoriesCarousel';
import WishlistPanel from '@/components/WishlistPanel';
import FavouritesContent from '@/components/FavouritesContent';
import ArchivedContent from '@/components/ArchivedContent';
import TravelHistory from '@/components/TravelHistory';
import { Trip } from '@/lib/types';
import {
  Luggage, Search, Plus, LogOut, User, Bookmark,
  Settings, Map, Star, Archive, BarChart2, Camera, ChevronDown, SlidersHorizontal
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
    <div className="min-h-screen bg-[#F5F5F5] flex pb-20">
      {/* ── Left sidebar ── */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-[#E5E5E5] flex flex-col py-6 px-4 transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto lg:h-auto lg:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-9 h-9 bg-[#FDE047] rounded-xl flex items-center justify-center flex-shrink-0">
            <Luggage className="w-5 h-5 text-[#171717]" />
          </div>
          <span className="font-extrabold text-[#171717] text-xl tracking-tight">Trippic</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.tab}
              onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
              className={`nav-item ${activeTab === item.tab ? 'nav-item-active' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="space-y-0.5 border-t border-[#E5E5E5] pt-4 mt-4">
          <button onClick={() => router.push('/profile')} className="nav-item">
            <Settings className="w-4 h-4" /> Edit profile
          </button>
          <button onClick={() => { logout(); router.push('/'); }} className="nav-item hover:!text-red-500">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>

        {/* User profile chip at bottom */}
        {user && (
          <div className="mt-4 px-2 py-3 rounded-xl bg-[#F5F5F5] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FDE047] flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatarUrl
                ? <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="object-cover w-full h-full" />
                : <User className="w-4 h-4 text-[#171717]" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-700 text-[#171717] font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-[#737373] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#E5E5E5]">
          <div className="px-4 sm:px-6 h-14 flex items-center gap-3">
            {/* Mobile menu button */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#737373] hover:text-[#171717]">
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Search */}
            {activeTab === 'trips' && (
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                <input
                  type="text"
                  placeholder="Search trips…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-sm text-[#171717] placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:bg-white transition-all"
                />
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Wishlist */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#737373] hover:border-[#FDE047] hover:text-[#171717] transition-colors bg-white"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:block">Wishlist</span>
              </button>

              {/* Gear + Avatar */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => router.push('/profile')}
                  className="text-[#737373] hover:text-[#171717] transition-colors p-1.5 rounded-lg hover:bg-[#F5F5F5]"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="w-9 h-9 rounded-full border-2 border-[#E5E5E5] hover:border-[#FDE047] transition-colors bg-[#FDE047]/20 flex items-center justify-center overflow-hidden"
                  >
                    {user?.avatarUrl
                      ? <Image src={user.avatarUrl} alt={user.name} width={36} height={36} className="object-cover w-full h-full" />
                      : <User className="w-5 h-5 text-[#171717]" />
                    }
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 w-48 z-50">
                      <div className="px-4 py-2 border-b border-[#E5E5E5]">
                        <p className="text-sm font-semibold text-[#171717]">{user?.name ?? 'Traveller'}</p>
                        <p className="text-xs text-[#737373]">{user?.email ?? ''}</p>
                      </div>
                      <button onClick={() => { setMenuOpen(false); router.push('/profile'); }} className="w-full text-left px-4 py-2 text-sm text-[#171717] hover:bg-[#F5F5F5] flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Edit profile
                      </button>
                      <button onClick={() => { logout(); router.push('/'); }} className="w-full text-left px-4 py-2 text-sm text-[#171717] hover:bg-[#F5F5F5] flex items-center gap-2">
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
                <div className="card px-5 py-4 flex flex-col justify-between">
                  <div>
                    <p className="label-xs mb-1">Welcome back</p>
                    <h2 className="text-xl font-extrabold text-[#171717]">Hey, {firstName} ✈️</h2>
                  </div>
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-2xl font-extrabold text-[#171717]">{visibleTrips.length}</p>
                      <p className="label-xs">Trips</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-[#171717]">{stats.cities}</p>
                      <p className="label-xs">Cities</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-[#171717]">{stats.countries}</p>
                      <p className="label-xs">Countries</p>
                    </div>
                  </div>
                </div>
                <StoriesCarousel />
              </div>

              {/* Two-column: Organize panel + trips */}
              <div className="flex gap-5 items-start">

                {/* ── Organize panel ── */}
                <div className="w-56 flex-shrink-0 card p-5 space-y-5 sticky top-20">
                  <h3 className="font-extrabold text-[#171717] text-base">Organize</h3>

                  {/* Sort By */}
                  <div>
                    <p className="label-xs mb-2">Sort By</p>
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={e => setSort(e.target.value as SortKey)}
                        className="appearance-none w-full pl-3 pr-7 py-2 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-sm text-[#171717] font-medium focus:outline-none focus:ring-2 focus:ring-[#FDE047] cursor-pointer transition-colors"
                      >
                        {sortOptions.map(opt => (
                          <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373] pointer-events-none" />
                    </div>
                  </div>

                  {/* Location Tags */}
                  <div>
                    <p className="label-xs mb-2">Location Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set(visibleTrips.map(t => t.city))].sort().map(city => (
                        <button
                          key={city}
                          onClick={() => setFilters(f => ({ ...f, cities: f.cities.includes(city) ? f.cities.filter(c => c !== city) : [...f.cities, city] }))}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            filters.cities.includes(city)
                              ? 'bg-[#171717] text-white'
                              : 'bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5] hover:text-[#171717]'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year */}
                  <div>
                    <p className="label-xs mb-2">Year</p>
                    <div className="space-y-2">
                      {[...new Set(visibleTrips.map(t => new Date(t.endDate).getFullYear()))].sort((a,b) => b-a).map(y => (
                        <label key={y} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.years.includes(y)}
                            onChange={() => setFilters(f => ({ ...f, years: f.years.includes(y) ? f.years.filter(x => x !== y) : [...f.years, y] }))}
                            className="w-3.5 h-3.5 rounded accent-[#FDE047]"
                          />
                          <span className="text-sm text-[#737373] group-hover:text-[#171717] transition-colors">{y}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Trip Type */}
                  <div>
                    <p className="label-xs mb-2">Trip Type</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Beach', 'City', 'Mountains', 'Roadtrip'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFilters(f => ({ ...f, tripTypes: f.tripTypes.includes(type) ? f.tripTypes.filter(x => x !== type) : [...f.tripTypes, type] }))}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            filters.tripTypes.includes(type)
                              ? 'bg-[#FDE047] text-[#171717]'
                              : 'bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5] hover:text-[#171717]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="label-xs mb-2">Duration</p>
                    <div className="space-y-2">
                      {['Weekend', 'Up to a week', 'Longer'].map(d => (
                        <label key={d} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.duration.includes(d)}
                            onChange={() => setFilters(f => ({ ...f, duration: f.duration.includes(d) ? f.duration.filter(x => x !== d) : [...f.duration, d] }))}
                            className="w-3.5 h-3.5 rounded accent-[#FDE047]"
                          />
                          <span className="text-sm text-[#737373] group-hover:text-[#171717] transition-colors">{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {filterCount > 0 && (
                    <button
                      onClick={() => setFilters(EMPTY_FILTERS)}
                      className="w-full text-xs text-[#737373] hover:text-[#171717] transition-colors text-center pt-1"
                    >
                      Clear all ({filterCount})
                    </button>
                  )}
                </div>

                {/* ── Trips grid ── */}
                <div className="flex-1 min-w-0">
                  {displayed.length === 0 ? (
                    <div className="text-center py-16 text-stone-400">
                      <Camera className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p>{search ? `No trips match "${search}"` : 'No trips match these filters'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {featuredTrip && <TripPostcard trip={featuredTrip} featured />}
                      {restTrips.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {restTrips.map(trip => <TripPostcard key={trip.id} trip={trip} />)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
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
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2.5 bg-[#FDE047] hover:bg-yellow-300 text-[#171717] pl-4 pr-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 font-bold text-sm"
      >
        <Plus className="w-5 h-5" />
        New trip
      </button>

      <WishlistPanel open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </div>
  );
}
