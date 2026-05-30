'use client';

import { useTrips } from '@/lib/tripsContext';
import TripPostcard from '@/components/TripPostcard';
import { ArrowLeft, Heart, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function FavouritesPage() {
  const { trips } = useTrips();
  const router = useRouter();

  const favTrips = trips.filter(t => t.isFavourite);
  const favPhotos = favTrips.flatMap(t => t.days.flatMap(d => d.photos)).slice(0, 12);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-stone-400 hover:text-stone-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h1 className="text-lg font-bold text-stone-800">Favourites</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {favTrips.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium mb-1">No favourites yet</p>
            <p className="text-sm">Heart a trip card to save it here.</p>
          </div>
        ) : (
          <>
            {/* Favourite trips */}
            <section>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Favourite trips</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favTrips.map(trip => <TripPostcard key={trip.id} trip={trip} />)}
              </div>
            </section>

            {/* Favourite photos */}
            {favPhotos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-stone-400" />
                  <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Photos from favourites</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {favPhotos.map(photo => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                      <Image src={photo.url} alt={photo.locationName ?? ''} fill className="object-cover hover:opacity-90 transition-opacity" sizes="25vw" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
