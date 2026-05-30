'use client';

import { useTrips } from '@/lib/tripsContext';
import { Photo } from '@/lib/types';
import Lightbox from '@/components/Lightbox';
import { ArrowLeft, Camera, Calendar, MapPin, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function tripDuration(start: string, end: string) {
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return `${days} day${days !== 1 ? 's' : ''}`;
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
          <button onClick={() => router.push('/home')} className="text-amber-500 hover:underline">
            Back to trips
          </button>
        </div>
      </div>
    );
  }

  // Flatten all photos for lightbox navigation
  const allPhotos: Photo[] = trip.days.flatMap(d => d.photos);

  function openLightbox(photo: Photo) {
    const idx = allPhotos.findIndex(p => p.id === photo.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 bg-stone-900">
        <Image
          src={trip.heroPhotoUrl}
          alt={trip.destination}
          fill
          className="object-cover opacity-80"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.push('/home')}
          className="absolute top-5 left-5 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to trips
        </button>

        {/* Overlay info */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{trip.destination}</h1>
          <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatFullDate(trip.startDate)} – {formatFullDate(trip.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {tripDuration(trip.startDate, trip.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              {trip.photoCount} photos
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* AI Summary */}
        <div className="bg-white border border-amber-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">AI Trip Summary</span>
          </div>
          <p className="text-stone-600 leading-relaxed">{trip.aiSummary}</p>
        </div>

        {/* Days */}
        {trip.days.map((day, dayIdx) => {
          const dayNum = dayIdx + 1;
          const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
          return (
            <div key={day.date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-stone-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {dayNum}
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{date}</p>
                  <p className="text-xs text-stone-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{day.locationName}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {day.photos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => openLightbox(photo)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.locationName || day.locationName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          photos={allPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
