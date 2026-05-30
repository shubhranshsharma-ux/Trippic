'use client';

import { useTrips } from '@/lib/tripsContext';
import { Photo } from '@/lib/types';
import Lightbox from '@/components/Lightbox';
import { ArrowLeft, Camera, Calendar, MapPin, Sparkles, MoreVertical, Trash2, ImageIcon, Pencil, Check, X, Heart, Clock } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function tripDuration(start: string, end: string) {
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return `${days} day${days !== 1 ? 's' : ''}`;
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

interface PhotoMenuProps {
  onDelete: () => void;
  onMakeHero: () => void;
}
function PhotoMenu({ onDelete, onMakeHero }: PhotoMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="absolute top-2 right-2 z-10">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-stone-100 py-1 w-40 z-20">
          <button onClick={e => { e.stopPropagation(); onMakeHero(); setOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Make hero photo
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); setOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /> Delete photo
          </button>
        </div>
      )}
    </div>
  );
}

interface DaySummaryProps { tripId: string; date: string; summary?: string; kmTravelled?: number; }
function DaySummary({ tripId, date, summary, kmTravelled }: DaySummaryProps) {
  const { updateDay } = useTrips();
  const [editing, setEditing] = useState(false);
  const [draftSummary, setDraftSummary] = useState(summary ?? '');
  const [draftKm, setDraftKm] = useState(String(kmTravelled ?? ''));
  function save() {
    updateDay(tripId, date, { summary: draftSummary, kmTravelled: draftKm ? Number(draftKm) : undefined });
    setEditing(false);
  }
  if (editing) {
    return (
      <div className="mt-2 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
        <textarea value={draftSummary} onChange={e => setDraftSummary(e.target.value)} rows={2} placeholder="What did you do today?"
          className="w-full text-xs text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 flex-shrink-0">km travelled:</span>
          <input type="number" value={draftKm} onChange={e => setDraftKm(e.target.value)} min={0}
            className="w-20 text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-300" />
          <div className="flex gap-1 ml-auto">
            <button onClick={save} className="flex items-center gap-1 bg-stone-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-stone-700">
              <Check className="w-3 h-3" /> Save
            </button>
            <button onClick={() => setEditing(false)} className="text-stone-500 text-xs px-2 py-1.5 rounded-lg hover:bg-stone-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-1 mb-4 flex items-start gap-2 group/summary">
      <p className="text-xs text-stone-500 leading-relaxed flex-1">
        {summary ?? <span className="italic text-stone-300">No summary — hover and click pencil to add one</span>}
        {kmTravelled ? <span className="text-stone-400 ml-2">· {kmTravelled} km</span> : null}
      </p>
      <button onClick={() => setEditing(true)} className="opacity-0 group-hover/summary:opacity-100 transition-opacity text-stone-400 hover:text-stone-600 flex-shrink-0">
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}

interface PhotoCardProps {
  photo: Photo;
  tripId: string;
  onOpen: () => void;
}
function PhotoCard({ photo, tripId, onOpen }: PhotoCardProps) {
  const { deletePhoto, setHeroPhoto, togglePhotoFavourite, favouritePhotoIds } = useTrips();
  const isFav = favouritePhotoIds.includes(photo.id);

  // Only show meta if data actually exists on the photo
  const hasLocation = Boolean(photo.locationName);
  const hasTime = Boolean(photo.takenAt);
  const showMeta = hasLocation || hasTime;

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group/photo">
      {/* Clickable image */}
      <button onClick={onOpen} className="absolute inset-0 z-0">
        <Image src={photo.url} alt={photo.locationName || 'Photo'} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
      </button>

      {/* Bottom vignette with meta — only if data exists */}
      {showMeta && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 pb-2.5 px-2.5 opacity-0 group-hover/photo:opacity-100 transition-opacity pointer-events-none z-10">
          {hasLocation && (
            <p className="text-white text-[10px] font-medium flex items-center gap-1 leading-tight truncate">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              {photo.locationName}
            </p>
          )}
          {hasTime && (
            <p className="text-white/70 text-[10px] flex items-center gap-1 mt-0.5">
              <Clock className="w-2.5 h-2.5 flex-shrink-0" />
              {formatTime(photo.takenAt)}
            </p>
          )}
        </div>
      )}

      {/* Top controls — show on hover */}
      <div className="opacity-0 group-hover/photo:opacity-100 transition-opacity z-20">
        {/* Heart / favourite */}
        <button
          onClick={e => { e.stopPropagation(); togglePhotoFavourite(photo.id); }}
          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center shadow transition-all ${
            isFav ? 'bg-rose-500 text-white' : 'bg-black/50 backdrop-blur-sm text-white hover:bg-rose-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Three-dot menu */}
        <PhotoMenu
          onDelete={() => deletePhoto(tripId, photo.id)}
          onMakeHero={() => setHeroPhoto(tripId, photo.url)}
        />
      </div>
    </div>
  );
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { trips } = useTrips();
  const router = useRouter();
  const trip = trips.find(t => t.id === id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        <div className="text-center">
          <p className="text-lg mb-4">Trip not found</p>
          <button onClick={() => router.push('/home')} className="text-amber-500 hover:underline">Back to trips</button>
        </div>
      </div>
    );
  }

  const allPhotos: Photo[] = trip.days.flatMap(d => d.photos);
  function openLightbox(photo: Photo) {
    const idx = allPhotos.findIndex(p => p.id === photo.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="relative h-72 sm:h-96 bg-stone-900">
        <Image src={trip.heroPhotoUrl} alt={trip.destination} fill className="object-cover opacity-80" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button onClick={() => router.push('/home')} className="absolute top-5 left-5 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to trips
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{trip.destination}</h1>
          <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatFullDate(trip.startDate)} – {formatFullDate(trip.endDate)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{tripDuration(trip.startDate, trip.endDate)}</span>
            <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" />{trip.photoCount} photos</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white border border-amber-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">AI Trip Summary</span>
          </div>
          <p className="text-stone-600 leading-relaxed">{trip.aiSummary}</p>
        </div>

        {trip.days.map((day, dayIdx) => {
          const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
          return (
            <div key={day.date}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-stone-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {dayIdx + 1}
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{date}</p>
                  <p className="text-xs text-stone-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{day.locationName}</p>
                </div>
              </div>
              <div className="ml-11">
                <DaySummary tripId={trip.id} date={day.date} summary={day.summary} kmTravelled={day.kmTravelled} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {day.photos.map(photo => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      tripId={trip.id}
                      onOpen={() => openLightbox(photo)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lightboxOpen && (
        <Lightbox photos={allPhotos} initialIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
