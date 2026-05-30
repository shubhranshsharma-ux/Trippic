'use client';

import { useTrips } from '@/lib/tripsContext';
import { Sparkles, ChevronLeft, ChevronRight, Calendar, Users, Star, Compass } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Story {
  id: string;
  type: 'on-this-day' | 'group' | 'highlight' | 'streak';
  title: string;
  subtitle: string;
  imageUrl: string;
  tripId?: string;
  icon: React.ReactNode;
  accent: string;
}

export default function StoriesCarousel() {
  const { trips } = useTrips();
  const router = useRouter();
  const [idx, setIdx] = useState(0);

  const stories: Story[] = useMemo(() => {
    const result: Story[] = [];
    const now = new Date();

    // On this day last year
    trips.forEach(t => {
      const start = new Date(t.startDate);
      const sameMonthDay = start.getMonth() === now.getMonth() && Math.abs(start.getDate() - now.getDate()) <= 3;
      const lastYear = now.getFullYear() - start.getFullYear() === 1;
      if (sameMonthDay && lastYear) {
        result.push({
          id: `otd-${t.id}`,
          type: 'on-this-day',
          title: 'On this day last year',
          subtitle: `You were in ${t.city} — remember?`,
          imageUrl: t.heroPhotoUrl,
          tripId: t.id,
          icon: <Calendar className="w-3.5 h-3.5" />,
          accent: 'from-violet-600/80 to-indigo-600/60',
        });
      }
    });

    // Most photographed trip — "favourite moments"
    const mostPhotos = [...trips].sort((a, b) => b.photoCount - a.photoCount)[0];
    if (mostPhotos) {
      result.push({
        id: `highlight-${mostPhotos.id}`,
        type: 'highlight',
        title: 'Your most captured trip',
        subtitle: `${mostPhotos.photoCount} photos from ${mostPhotos.city}`,
        imageUrl: mostPhotos.heroPhotoUrl,
        tripId: mostPhotos.id,
        icon: <Star className="w-3.5 h-3.5" />,
        accent: 'from-amber-600/80 to-orange-500/60',
      });
    }

    // Longest trip
    const longest = [...trips].sort((a, b) => {
      const da = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
      const db = new Date(b.endDate).getTime() - new Date(b.startDate).getTime();
      return db - da;
    })[0];
    if (longest) {
      const days = Math.round((new Date(longest.endDate).getTime() - new Date(longest.startDate).getTime()) / 86400000) + 1;
      result.push({
        id: `longest-${longest.id}`,
        type: 'streak',
        title: 'Your longest adventure',
        subtitle: `${days} days exploring ${longest.city}`,
        imageUrl: longest.heroPhotoUrl,
        tripId: longest.id,
        icon: <Compass className="w-3.5 h-3.5" />,
        accent: 'from-emerald-600/80 to-teal-600/60',
      });
    }

    // Group memory — random trip framed as group
    const groupTrip = trips[Math.floor(trips.length / 2)];
    if (groupTrip) {
      result.push({
        id: `group-${groupTrip.id}`,
        type: 'group',
        title: 'A memory with friends',
        subtitle: `The ${groupTrip.city} trip — people, places, moments`,
        imageUrl: groupTrip.heroPhotoUrl,
        tripId: groupTrip.id,
        icon: <Users className="w-3.5 h-3.5" />,
        accent: 'from-rose-600/80 to-pink-500/60',
      });
    }

    // Fallback stories if no trips match dynamic rules
    if (result.length === 0 && trips.length > 0) {
      result.push({
        id: 'fallback',
        type: 'highlight',
        title: 'Your travel story begins',
        subtitle: 'AI summaries will appear as your trips grow',
        imageUrl: trips[0].heroPhotoUrl,
        tripId: trips[0].id,
        icon: <Sparkles className="w-3.5 h-3.5" />,
        accent: 'from-amber-600/80 to-orange-500/60',
      });
    }

    return result;
  }, [trips]);

  if (stories.length === 0) return null;

  const story = stories[idx];
  const prev = () => setIdx(i => (i - 1 + stories.length) % stories.length);
  const next = () => setIdx(i => (i + 1) % stories.length);

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer h-full min-h-[160px]"
      onClick={() => story.tripId && router.push(`/trip/${story.tripId}`)}
    >
      <Image src={story.imageUrl} alt={story.title} fill className="object-cover" sizes="50vw" />
      <div className={`absolute inset-0 bg-gradient-to-br ${story.accent}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* AI badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
        <Sparkles className="w-3 h-3" /> AI Curated
      </div>

      {/* Nav arrows */}
      {stories.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-1.5 text-white/80 text-[10px] mb-1">
          {story.icon} <span className="uppercase tracking-wide font-medium">{story.type === 'on-this-day' ? 'On This Day' : story.type === 'group' ? 'Group Memory' : story.type === 'highlight' ? 'Highlight' : 'Adventure'}</span>
        </div>
        <p className="text-white font-bold text-sm leading-tight">{story.title}</p>
        <p className="text-white/75 text-xs mt-0.5">{story.subtitle}</p>
      </div>

      {/* Dots */}
      {stories.length > 1 && (
        <div className="absolute bottom-2 right-3 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
