'use client';

import { useTrips } from '@/lib/tripsContext';
import { useAuth } from '@/lib/authContext';
import TripPostcard from '@/components/TripPostcard';
import { Filters, EMPTY_FILTERS, applyFilters } from '@/components/FilterPanel';
import StoriesCarousel, { startAmbientPad } from '@/components/StoriesCarousel';
import WishlistPanel from '@/components/WishlistPanel';
import FavouritesContent from '@/components/FavouritesContent';
import ArchivedContent from '@/components/ArchivedContent';
import TravelHistory from '@/components/TravelHistory';
import { Trip } from '@/lib/types';
import {
  Luggage, Search, Plus, LogOut, User, Bookmark,
  Settings, Map, Star, Archive, BarChart2, Camera, ChevronDown, SlidersHorizontal,
  Globe, Sparkles, ExternalLink, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
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

/* ── Year Wrap Modal ── */
function YearWrapModal({ trips, stats, onClose }: { trips: Trip[]; stats: { countries: number; continents: number; trips: number; cities: number; photos: number; miles: number }; onClose: () => void }) {
  const [slide, setSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const stopAudioRef = useRef<() => void>(() => {});
  const year = new Date().getFullYear() - 1;

  // Chill ambient music — Fm pad (warm, nostalgic)
  useEffect(() => {
    stopAudioRef.current = startAmbientPad('nostalgic');
    return () => stopAudioRef.current();
  }, []);

  function goSlide(n: number) {
    setSlide(n);
    setAnimKey(k => k + 1);
  }

  const totalDays = trips.reduce((acc, t) =>
    acc + Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1, 0);
  const mostPhotos = [...trips].sort((a, b) => b.photoCount - a.photoCount)[0];
  const heroPhotos = trips.slice(0, 5).map(t => t.heroPhotoUrl);
  const countryList = [...new Set(trips.map(t => t.country))].slice(0, 6);

  const slides = [
    { bg: 'from-violet-700 to-indigo-900', label: 'Your Year in Travel', content: (
      <div className="text-center space-y-3">
        <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">{year} Wrapped</p>
        <p className="text-7xl font-extrabold text-white" style={{ animation: 'wrap-number-pop 0.55s cubic-bezier(0.4,0,0.2,1) forwards' }}>{trips.length}</p>
        <p className="text-white text-2xl font-bold">trips this year</p>
        <p className="text-white/60 text-sm mt-2">You explored more of this world than most people ever will.</p>
      </div>
    )},
    { bg: 'from-amber-500 to-orange-700', label: 'Globe Trotter', content: (
      <div className="text-center space-y-3">
        <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">Countries visited</p>
        <p className="text-7xl font-extrabold text-white" style={{ animation: 'wrap-number-pop 0.55s cubic-bezier(0.4,0,0.2,1) forwards' }}>{stats.countries}</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {countryList.map(c => <span key={c} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{c}</span>)}
        </div>
        <p className="text-white/60 text-sm mt-2">Across {stats.continents} continents.</p>
      </div>
    )},
    { bg: 'from-rose-600 to-pink-800', label: 'Photo Memories', content: (
      <div className="text-center space-y-3">
        <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">You captured</p>
        <p className="text-7xl font-extrabold text-white" style={{ animation: 'wrap-number-pop 0.55s cubic-bezier(0.4,0,0.2,1) forwards' }}>{stats.photos}</p>
        <p className="text-white text-2xl font-bold">photos</p>
        {mostPhotos && <p className="text-white/70 text-sm">Your best trip was <span className="text-white font-bold">{mostPhotos.destination}</span> with {mostPhotos.photoCount} shots.</p>}
      </div>
    )},
    { bg: 'from-emerald-600 to-teal-900', label: 'Distance Covered', content: (
      <div className="text-center space-y-3">
        <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">Miles travelled</p>
        <p className="text-7xl font-extrabold text-white" style={{ animation: 'wrap-number-pop 0.55s cubic-bezier(0.4,0,0.2,1) forwards' }}>{stats.miles.toLocaleString()}</p>
        <p className="text-white/70 text-sm mt-2">That&apos;s {Math.round(stats.miles / 24901)}× around the Earth.</p>
        <p className="text-white/60 text-sm">{totalDays} days spent abroad</p>
      </div>
    )},
    { bg: 'from-[#171717] to-stone-800', label: 'See You Next Year', content: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FDE047] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-[#171717]" />
        </div>
        <p className="text-white text-2xl font-extrabold">Keep exploring.</p>
        <p className="text-white/60 text-sm leading-relaxed">The world has {195 - stats.countries} more countries waiting for you. Here&apos;s to {year + 1}.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {heroPhotos.map((url, i) => (
            <div key={i} className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
              <Image src={url} alt="" fill className="object-cover" sizes="48px" />
            </div>
          ))}
        </div>
      </div>
    )},
  ];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goSlide(Math.min(slide + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') goSlide(Math.max(slide - 1, 0));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, slide, slides.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-br ${slides[slide].bg} p-8 min-h-[500px] flex flex-col justify-between overflow-hidden shadow-2xl`}
        style={{ animation: 'slide-up-fade 0.45s cubic-bezier(0.4,0,0.2,1) forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent pointer-events-none" />
        {/* Subtle particle glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Progress bars — animated timer */}
        <div className="flex gap-1 mb-6">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={() => goSlide(i)}>
              {i < slide && <div className="h-full w-full bg-white" />}
              {i === slide && (
                <div
                  key={`wrap-bar-${animKey}`}
                  className="h-full bg-white rounded-full origin-left"
                  style={{ animation: 'story-progress 6s linear forwards' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Slide content — re-animates on slide change */}
        <div
          key={animKey}
          className="flex-1 flex items-center justify-center py-4"
          style={{ animation: 'slide-up-fade 0.4s cubic-bezier(0.4,0,0.2,1) forwards' }}
        >
          {slides[slide].content}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => goSlide(Math.max(slide - 1, 0))}
            disabled={slide === 0}
            className="text-white/50 hover:text-white disabled:opacity-20 transition-colors text-sm font-semibold"
          >← Back</button>
          <p className="text-white/40 text-xs">{slide + 1} / {slides.length}</p>
          {slide < slides.length - 1
            ? <button onClick={() => goSlide(slide + 1)} className="text-white font-semibold text-sm hover:text-white/80 transition-colors">Next →</button>
            : <button onClick={onClose} className="bg-white text-[#171717] font-bold text-sm px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors">Done</button>
          }
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { trips, stats, archivedTripIds } = useTrips();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [yearWrapOpen, setYearWrapOpen] = useState(false);
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

          {/* Scapia promo — right after nav items */}
          <a
            href="https://www.scapia.cards/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 px-3 py-3 mt-2 rounded-xl bg-gradient-to-br from-[#FDE047]/20 to-[#FDE047]/5 border border-[#FDE047]/40 hover:border-[#FDE047] transition-colors group"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-7 h-7 rounded-lg bg-[#FDE047] flex items-center justify-center flex-shrink-0">
              <Globe className="w-3.5 h-3.5 text-[#171717]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#171717] leading-tight">Plan your next trip</p>
              <p className="text-[10px] text-[#737373] leading-tight mt-0.5">Book with Scapia &amp; earn travel miles</p>
              <div className="flex items-center gap-1 mt-1 text-[#171717] text-[10px] font-semibold group-hover:underline">
                Open Scapia <ExternalLink className="w-2.5 h-2.5" />
              </div>
            </div>
          </a>
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
              {/* Stats card + stories row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Compact stats — click to go to Travel History */}
                <button
                  onClick={() => setActiveTab('history')}
                  className="card px-5 py-4 flex flex-col gap-3 overflow-hidden relative text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#FDE047]/10 pointer-events-none" />
                  <div>
                    <p className="label-xs mb-0.5">Your world so far</p>
                    <p className="text-base font-extrabold text-[#171717]">Hey {firstName}, you&apos;ve been busy ✈️</p>
                  </div>
                  {/* 4-stat row */}
                  <div className="flex items-stretch gap-0 divide-x divide-[#E5E5E5]">
                    {[
                      { val: visibleTrips.length, label: 'Trips' },
                      { val: stats.countries, label: 'Countries' },
                      { val: stats.cities, label: 'Cities' },
                      { val: stats.photos, label: 'Photos' },
                    ].map(({ val, label }) => (
                      <div key={label} className="flex-1 flex flex-col items-center py-1">
                        <p className="text-2xl font-extrabold text-[#171717] leading-none">{val}</p>
                        <p className="text-[10px] text-[#737373] mt-0.5 font-semibold uppercase tracking-wide">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* World coverage bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-[#737373] font-semibold">World coverage</span>
                      <span className="text-[10px] font-extrabold text-[#171717]">{Math.round((stats.countries / 195) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FDE047] rounded-full" style={{ width: `${Math.max((stats.countries / 195) * 100, 2)}%` }} />
                    </div>
                    <p className="text-[10px] text-[#737373] mt-0.5">Tap to see full travel history →</p>
                  </div>
                </button>
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

      {/* FABs */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
        {/* Year Wrap FAB */}
        <button
          onClick={() => setYearWrapOpen(true)}
          className="relative flex items-center gap-2 bg-[#171717] text-white pl-3.5 pr-4 py-3 rounded-full shadow-xl font-bold text-sm overflow-hidden hover:-translate-y-0.5 transition-all"
        >
          {/* Shining animation */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" style={{backgroundSize:'200% 100%'}} />
          <Sparkles className="w-4 h-4 text-[#FDE047]" />
          <span>Year Wrap</span>
          <span className="w-2 h-2 rounded-full bg-[#FDE047] animate-pulse ml-0.5" />
        </button>
        {/* New Trip FAB */}
        <button
          onClick={() => router.push('/new')}
          className="flex items-center gap-2.5 bg-[#FDE047] hover:bg-yellow-300 text-[#171717] pl-4 pr-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          New trip
        </button>
      </div>

      {/* Year Wrap Modal */}
      {yearWrapOpen && (
        <YearWrapModal trips={visibleTrips} stats={stats} onClose={() => setYearWrapOpen(false)} />
      )}

      <WishlistPanel open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </div>
  );
}
