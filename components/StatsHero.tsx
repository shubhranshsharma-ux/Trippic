'use client';

import { TravelStats } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

interface Props {
  stats: TravelStats;
  tripCount: number;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

function StatTile({ label, value }: { label: string; value: number }) {
  const display = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold text-stone-800">{display.toLocaleString()}</span>
      <span className="text-xs text-stone-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function StatsHero({ stats, tripCount }: Props) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6">
      <p className="text-stone-700 text-base mb-5 leading-relaxed">
        You&apos;ve explored{' '}
        <span className="font-semibold text-amber-600">{stats.countries} countries</span> across{' '}
        <span className="font-semibold text-amber-600">{stats.continents} continents</span> — that&apos;s a life well travelled.
      </p>
      <div className="grid grid-cols-4 gap-4">
        <StatTile label="Trips" value={tripCount} />
        <StatTile label="Cities" value={stats.cities} />
        <StatTile label="Photos" value={stats.photos} />
        <StatTile label="Miles" value={stats.miles} />
      </div>
    </div>
  );
}
