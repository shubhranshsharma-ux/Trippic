'use client';

import { Photo } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ photos, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  function prev() { setIndex(i => (i - 1 + photos.length) % photos.length); }
  function next() { setIndex(i => (i + 1) % photos.length); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {photos.length}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          className="absolute left-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          onClick={e => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full h-full mx-16"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.locationName || 'Travel photo'}
          fill
          className="object-contain"
          sizes="90vw"
        />
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button
          className="absolute right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          onClick={e => { e.stopPropagation(); next(); }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Caption */}
      {photo.locationName && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {photo.locationName}
        </div>
      )}
    </div>
  );
}
