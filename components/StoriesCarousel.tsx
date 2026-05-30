'use client';

import { useTrips } from '@/lib/tripsContext';
import { Sparkles, ChevronLeft, ChevronRight, Calendar, Users, Star, Compass, X, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback } from 'react';

interface Story {
  id: string;
  type: 'on-this-day' | 'group' | 'highlight' | 'streak';
  title: string;
  subtitle: string;
  imageUrl: string;
  photos: string[];
  tripId?: string;
  icon: React.ReactNode;
  accent: string;
}

function StoryModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const [slide, setSlide] = useState(0);
  const photos = story.photos.length > 0 ? story.photos : [story.imageUrl];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setSlide(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setSlide(i => (i - 1 + photos.length) % photos.length);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, photos.length]);

  // Auto-advance slides
  useEffect(() => {
    const t = setTimeout(() => setSlide(i => (i + 1) % photos.length), 3500);
    return () => clearTimeout(t);
  }, [slide, photos.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> AI Curated
              </div>
            </div>
            <h2 className="text-white font-extrabold text-xl">{story.title}</h2>
            <p className="text-white/60 text-sm mt-0.5">{story.subtitle}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
          <Image src={photos[slide]} alt={`Slide ${slide + 1}`} fill className="object-cover transition-opacity duration-500" sizes="700px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1">
            {photos.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div className={`h-full bg-white rounded-full transition-all duration-300 ${i < slide ? 'w-full' : i === slide ? 'w-full animate-pulse' : 'w-0'}`} />
              </div>
            ))}
          </div>

          {/* Photo number */}
          <div className="absolute bottom-3 right-3 text-white/70 text-xs font-medium bg-black/30 px-2 py-1 rounded-full">
            {slide + 1} / {photos.length}
          </div>

          {/* Nav */}
          {photos.length > 1 && (
            <>
              <button onClick={() => setSlide(i => (i - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setSlide(i => (i + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Dot nav */}
        <div className="flex justify-center gap-1.5 mt-4">
          {photos.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${i === slide ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StoriesCarousel() {
  const { trips } = useTrips();
  const [idx, setIdx] = useState(0);
  const [modalStory, setModalStory] = useState<Story | null>(null);

  const stories: Story[] = useMemo(() => {
    const result: Story[] = [];
    const now = new Date();

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
          photos: t.days.flatMap(d => d.photos.map(p => p.url)).slice(0, 5),
          tripId: t.id,
          icon: <Calendar className="w-3.5 h-3.5" />,
          accent: 'from-violet-600/80 to-indigo-600/60',
        });
      }
    });

    const mostPhotos = [...trips].sort((a, b) => b.photoCount - a.photoCount)[0];
    if (mostPhotos) {
      result.push({
        id: `highlight-${mostPhotos.id}`,
        type: 'highlight',
        title: 'Your most captured trip',
        subtitle: `${mostPhotos.photoCount} photos from ${mostPhotos.city}`,
        imageUrl: mostPhotos.heroPhotoUrl,
        photos: mostPhotos.days.flatMap(d => d.photos.map(p => p.url)).slice(0, 5),
        tripId: mostPhotos.id,
        icon: <Star className="w-3.5 h-3.5" />,
        accent: 'from-amber-600/80 to-orange-500/60',
      });
    }

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
        photos: longest.days.flatMap(d => d.photos.map(p => p.url)).slice(0, 5),
        tripId: longest.id,
        icon: <Compass className="w-3.5 h-3.5" />,
        accent: 'from-emerald-600/80 to-teal-600/60',
      });
    }

    const groupTrip = trips[Math.floor(trips.length / 2)];
    if (groupTrip) {
      result.push({
        id: `group-${groupTrip.id}`,
        type: 'group',
        title: 'A memory with friends',
        subtitle: `The ${groupTrip.city} trip — people, places, moments`,
        imageUrl: groupTrip.heroPhotoUrl,
        photos: groupTrip.days.flatMap(d => d.photos.map(p => p.url)).slice(0, 5),
        tripId: groupTrip.id,
        icon: <Users className="w-3.5 h-3.5" />,
        accent: 'from-rose-600/80 to-pink-500/60',
      });
    }

    if (result.length === 0 && trips.length > 0) {
      result.push({
        id: 'fallback',
        type: 'highlight',
        title: 'Your travel story begins',
        subtitle: 'AI summaries will appear as your trips grow',
        imageUrl: trips[0].heroPhotoUrl,
        photos: trips[0].days.flatMap(d => d.photos.map(p => p.url)).slice(0, 5),
        tripId: trips[0].id,
        icon: <Sparkles className="w-3.5 h-3.5" />,
        accent: 'from-amber-600/80 to-orange-500/60',
      });
    }

    return result;
  }, [trips]);

  // Auto-advance carousel
  const next = useCallback(() => setIdx(i => (i + 1) % stories.length), [stories.length]);
  const prev = () => setIdx(i => (i - 1 + stories.length) % stories.length);

  useEffect(() => {
    if (stories.length <= 1) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next, stories.length]);

  if (stories.length === 0) return null;

  const story = stories[idx];

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer h-full min-h-[160px]"
        onClick={() => setModalStory(story)}
      >
        <Image src={story.imageUrl} alt={story.title} fill className="object-cover" sizes="50vw" />
        <div className={`absolute inset-0 bg-gradient-to-br ${story.accent}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* AI badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" /> AI Curated · Tap to view
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
            {story.icon}
            <span className="uppercase tracking-wide font-semibold">
              {story.type === 'on-this-day' ? 'On This Day' : story.type === 'group' ? 'Group Memory' : story.type === 'highlight' ? 'Highlight' : 'Adventure'}
            </span>
          </div>
          <p className="text-white font-bold text-sm leading-tight">{story.title}</p>
          <p className="text-white/75 text-xs mt-0.5">{story.subtitle}</p>
        </div>

        {/* Dots */}
        {stories.length > 1 && (
          <div className="absolute bottom-2 right-3 flex gap-1">
            {stories.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>

      {modalStory && <StoryModal story={modalStory} onClose={() => setModalStory(null)} />}
    </>
  );
}
