'use client';

import { Trip } from '@/lib/types';
import { useTrips } from '@/lib/tripsContext';
import { Camera, MapPin, Heart, MoreVertical, Trash2, Archive } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Props { trip: Trip; }

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  return `${months[s.getMonth()]} ${s.getFullYear()} · ${days} day${days !== 1 ? 's' : ''}`;
}

export default function TripPostcard({ trip, featured = false }: Props & { featured?: boolean }) {
  const router = useRouter();
  const { toggleFavourite, deleteTrip, toggleArchiveTrip, archivedTripIds } = useTrips();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isArchived = archivedTripIds.includes(trip.id);

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

  const imgH = featured ? 'h-72' : 'h-44';

  return (
    <div
      onClick={() => router.push(`/trip/${trip.id}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className={`relative ${imgH} overflow-hidden bg-stone-100`}>
        <Image
          src={trip.heroPhotoUrl}
          alt={trip.destination}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Photo count */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          <Camera className="w-3 h-3" />{trip.photoCount}
        </div>
        {/* Top-right controls */}
        <div className="absolute top-2 right-2 flex gap-1.5" onClick={e => e.stopPropagation()}>
          {/* Heart */}
          <button
            onClick={handleFav}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-md ${
              trip.isFavourite ? 'bg-rose-500 text-white' : 'bg-black/40 text-white/80 hover:bg-rose-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${trip.isFavourite ? 'fill-current' : ''}`} />
          </button>
          {/* Three-dot menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center shadow-md transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-stone-100 py-1 w-40 z-30">
                <button
                  onClick={e => { e.stopPropagation(); toggleArchiveTrip(trip.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5 text-stone-400" />
                  {isArchived ? 'Unarchive' : 'Archive trip'}
                </button>
                <button
                  onClick={handleDelete}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${confirmDelete ? 'text-red-600 bg-red-50' : 'text-red-500 hover:bg-red-50'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {confirmDelete ? 'Tap again to confirm' : 'Delete trip'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-1.5 mb-1">
          <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <h3 className="font-semibold text-stone-800 text-sm leading-snug">{trip.destination}</h3>
        </div>
        <p className="text-xs text-stone-400 ml-5">{formatDateRange(trip.startDate, trip.endDate)}</p>
        {featured && trip.aiSummary && (
          <p className="text-xs text-stone-500 mt-2 ml-5 line-clamp-2 leading-relaxed">{trip.aiSummary}</p>
        )}
      </div>
    </div>
  );
}
