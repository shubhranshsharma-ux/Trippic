'use client';

import { Trip } from '@/lib/types';
import { useTrips } from '@/lib/tripsContext';
import { Camera, Heart, MoreVertical, Trash2, Archive } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Props { trip: Trip; featured?: boolean; }

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  return `${months[s.getMonth()]} ${s.getFullYear()} · ${days} day${days !== 1 ? 's' : ''}`;
}

function inferTripType(t: Trip): string {
  const beach = ['Morocco', 'Spain', 'Portugal'];
  if (beach.includes(t.country)) return 'Beach';
  if (t.country === 'Iceland') return 'Mountains';
  return 'City';
}

export default function TripPostcard({ trip, featured = false }: Props) {
  const router = useRouter();
  const { toggleFavourite, deleteTrip, toggleArchiveTrip, archivedTripIds } = useTrips();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isArchived = archivedTripIds.includes(trip.id);
  const tripType = inferTripType(trip);

  useEffect(() => {
    function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function handleFav(e: React.MouseEvent) { e.stopPropagation(); toggleFavourite(trip.id); }
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmDelete) { deleteTrip(trip.id); }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); }
    setMenuOpen(false);
  }

  /* ── FEATURED card — full overlay layout ── */
  if (featured) {
    return (
      <div
        onClick={() => router.push(`/trip/${trip.id}`)}
        className="group cursor-pointer relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
      >
        <Image
          src={trip.heroPhotoUrl}
          alt={trip.destination}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="100vw"
          priority
        />
        {/* Gradient overlay — stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Top controls */}
        <div className="absolute top-4 right-4 flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleFav}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-md ${
              trip.isFavourite ? 'bg-rose-500 text-white' : 'bg-black/40 text-white/80 hover:bg-rose-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${trip.isFavourite ? 'fill-current' : ''}`} />
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center shadow-md transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-[#E5E5E5] py-1 w-40 z-30">
                <button onClick={e => { e.stopPropagation(); toggleArchiveTrip(trip.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-[#171717] hover:bg-[#F5F5F5] flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-[#737373]" />{isArchived ? 'Unarchive' : 'Archive trip'}
                </button>
                <button onClick={handleDelete}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${confirmDelete ? 'text-red-600 bg-red-50' : 'text-red-500 hover:bg-red-50'}`}>
                  <Trash2 className="w-3.5 h-3.5" />{confirmDelete ? 'Tap again to confirm' : 'Delete trip'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          {/* Country + date pill row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FDE047] text-[#171717] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              {trip.country}
            </span>
            <span className="text-white/60 text-xs font-medium">• {formatMonth(trip.startDate)}</span>
          </div>
          {/* Trip name — reduced so image is the hero */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-1.5 tracking-tight">
            {trip.destination}
          </h2>
          {/* AI summary — one line only */}
          {trip.aiSummary && (
            <p className="text-white/65 text-xs leading-relaxed line-clamp-1 max-w-lg">
              {trip.aiSummary}
            </p>
          )}
          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-white/55 text-[11px] font-medium">
              <Camera className="w-3 h-3" />{trip.photoCount}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/55 text-[11px] font-medium">{formatDateRange(trip.startDate, trip.endDate)}</span>
            <span className="text-white/30">·</span>
            <span className="bg-white/10 text-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full">{tripType}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Regular card ── */
  return (
    <div
      onClick={() => router.push(`/trip/${trip.id}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E5E5E5] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative h-44 overflow-hidden bg-[#F5F5F5]">
        <Image
          src={trip.heroPhotoUrl}
          alt={trip.destination}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Bottom gradient for photo count */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Photo count bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-semibold">
          <Camera className="w-3 h-3" />{trip.photoCount}
        </div>
        {/* Top-right controls */}
        <div className="absolute top-2 right-2 flex gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleFav}
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-md ${
              trip.isFavourite ? 'bg-rose-500 text-white' : 'bg-black/40 text-white/80 hover:bg-rose-500 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${trip.isFavourite ? 'fill-current' : ''}`} />
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center shadow-md transition-all"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-[#E5E5E5] py-1 w-40 z-30">
                <button onClick={e => { e.stopPropagation(); toggleArchiveTrip(trip.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-[#171717] hover:bg-[#F5F5F5] flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-[#737373]" />{isArchived ? 'Unarchive' : 'Archive trip'}
                </button>
                <button onClick={handleDelete}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${confirmDelete ? 'text-red-600 bg-red-50' : 'text-red-500 hover:bg-red-50'}`}>
                  <Trash2 className="w-3.5 h-3.5" />{confirmDelete ? 'Tap again to confirm' : 'Delete trip'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Destination name */}
        <h3 className="font-bold text-[#171717] text-sm leading-snug mb-1">{trip.destination}</h3>
        <p className="text-xs text-[#737373] mb-2.5">{formatDateRange(trip.startDate, trip.endDate)}</p>
        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          <span className="bg-[#FDE047] text-[#171717] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {trip.country}
          </span>
          <span className="bg-[#F5F5F5] text-[#737373] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E5E5]">
            {tripType}
          </span>
          <span className="bg-[#F5F5F5] text-[#737373] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E5E5]">
            {trip.city}
          </span>
        </div>
      </div>
    </div>
  );
}
