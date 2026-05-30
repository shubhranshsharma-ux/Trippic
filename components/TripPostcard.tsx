'use client';

import { Trip } from '@/lib/types';
import { Camera, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  trip: Trip;
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  return `${months[s.getMonth()]} ${s.getFullYear()} · ${days} day${days !== 1 ? 's' : ''}`;
}

export default function TripPostcard({ trip }: Props) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/trip/${trip.id}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      {/* Hero image */}
      <div className="relative h-44 overflow-hidden bg-stone-100">
        <Image
          src={trip.heroPhotoUrl}
          alt={trip.destination}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Photo count badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          <Camera className="w-3 h-3" />
          {trip.photoCount}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start gap-1.5 mb-1">
          <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <h3 className="font-semibold text-stone-800 text-sm leading-snug">{trip.destination}</h3>
        </div>
        <p className="text-xs text-stone-400 ml-5">{formatDateRange(trip.startDate, trip.endDate)}</p>
      </div>
    </div>
  );
}
