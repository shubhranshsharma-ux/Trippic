'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Luggage } from 'lucide-react';
import Image from 'next/image';

const CAROUSEL_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80', label: 'Kyoto, Japan' },
  { url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80', label: 'Lisbon, Portugal' },
  { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80', label: 'Tokyo, Japan' },
  { url: 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=1200&q=80', label: 'Reykjavik, Iceland' },
  { url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=80', label: 'Marrakesh, Morocco' },
  { url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80', label: 'Barcelona, Spain' },
];

export default function LandingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(i => (i + 1) % CAROUSEL_IMAGES.length);
        setFading(false);
      }, 700);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0 z-0">
        {CAROUSEL_IMAGES.map((img, i) => (
          <div
            key={img.url}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? (fading ? 0 : 1) : 0 }}
          >
            <Image
              src={img.url}
              alt={img.label}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/80 via-orange-500/70 to-rose-600/60" />
        {/* Bottom fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#FDE047] rounded-xl flex items-center justify-center">
            <Luggage className="w-5 h-5 text-[#171717]" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">Trippic</span>
        </div>
        <button
          onClick={() => router.push('/about')}
          className="text-white/80 hover:text-white text-sm font-semibold transition-colors border border-white/30 hover:border-white/60 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          About us
        </button>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 pt-8 pb-16 max-w-2xl">
        {/* Destination label pill */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#FDE047] animate-pulse" />
          <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">
            {CAROUSEL_IMAGES[current].label}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.08] mb-5 tracking-tight">
          Every <em className="not-italic italic font-extrabold">trip</em> you&apos;ve<br />
          ever taken,<br />
          <span className="text-white/90">in one beautiful</span><br />
          place.
        </h1>

        <p className="text-white/70 text-lg sm:text-xl mb-10 leading-relaxed">
          Connect your photos. We&apos;ll do the rest.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-4 max-w-xs">
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-[#FDE047] hover:bg-yellow-300 text-[#171717] font-bold py-4 px-8 rounded-2xl text-base shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Connect Google Photos
          </button>
          <p className="text-white/60 text-sm text-center">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-white underline underline-offset-2 hover:text-white/90 font-semibold transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="relative z-10 flex items-center gap-1.5 px-6 sm:px-10 pb-8">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
