'use client';

import { useTrips } from '@/lib/tripsContext';
import TripPostcard from '@/components/TripPostcard';
import { Heart, Camera } from 'lucide-react';
import Image from 'next/image';

export default function FavouritesContent() {
  const { trips, favouritePhotoIds, togglePhotoFavourite } = useTrips();

  const favTrips = trips.filter(t => t.isFavourite);
  const allPhotos = trips.flatMap(t => t.days.flatMap(d => d.photos.map(p => ({ ...p, tripDestination: t.destination }))));
  const favPhotos = allPhotos.filter(p => favouritePhotoIds.includes(p.id));

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-stone-800">Trips close to your heart</h2>
          <p className="text-sm text-stone-400 mt-1">The ones you keep coming back to in your mind.</p>
        </div>
        {favTrips.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400">
            <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm mb-1">No favourite trips yet</p>
            <p className="text-xs">Tap ❤️ on any trip card to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favTrips.map(trip => <TripPostcard key={trip.id} trip={trip} />)}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-stone-800">Shots that stopped you mid-scroll</h2>
          <p className="text-sm text-stone-400 mt-1">Photos you loved enough to save twice.</p>
        </div>
        {favPhotos.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400">
            <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm mb-1">No favourite photos yet</p>
            <p className="text-xs">Hover over any photo in a trip and tap ❤️ to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {favPhotos.map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group">
                <Image src={photo.url} alt={photo.locationName ?? ''} fill className="object-cover" sizes="25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => togglePhotoFavourite(photo.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
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
