'use client';

import { useTrips } from '@/lib/tripsContext';
import TripPostcard from '@/components/TripPostcard';
import { Archive, Camera } from 'lucide-react';
import Image from 'next/image';

export default function ArchivedContent() {
  const { trips, archivedTripIds, archivedPhotoIds, toggleArchivePhoto } = useTrips();

  const archivedTrips = trips.filter(t => archivedTripIds.includes(t.id));
  const allPhotos = trips.flatMap(t => t.days.flatMap(d => d.photos.map(p => ({ ...p }))));
  const archivedPhotos = allPhotos.filter(p => archivedPhotoIds.includes(p.id));

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-stone-800">Archived trips</h2>
          <p className="text-sm text-stone-400 mt-1">Out of sight, but never forgotten.</p>
        </div>
        {archivedTrips.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400">
            <Archive className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm mb-1">No archived trips yet</p>
            <p className="text-xs">Open any trip card's ⋯ menu and tap Archive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedTrips.map(trip => <TripPostcard key={trip.id} trip={trip} />)}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-stone-800">Archived photos</h2>
          <p className="text-sm text-stone-400 mt-1">Stored away, not thrown away.</p>
        </div>
        {archivedPhotos.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400">
            <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm mb-1">No archived photos yet</p>
            <p className="text-xs">Tap ⋯ on any photo inside a trip to archive it.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {archivedPhotos.map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group">
                <Image src={photo.url} alt={photo.locationName ?? ''} fill className="object-cover" sizes="25vw" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => toggleArchivePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-white/90 text-stone-700 text-[10px] font-medium px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  Unarchive
                </button>
                {photo.locationName && (
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {photo.locationName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
