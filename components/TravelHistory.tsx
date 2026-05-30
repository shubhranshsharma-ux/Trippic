'use client';

import { useTrips } from '@/lib/tripsContext';
import { Globe, Map, Camera, Milestone, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number; label: string; color: string }) {
  const display = useCountUp(value);
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-3xl font-bold text-stone-800">{display.toLocaleString()}</p>
        <p className="text-xs text-stone-400 uppercase tracking-wide mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function TravelHistory() {
  const { trips, stats } = useTrips();

  const totalDays = trips.reduce((acc, t) =>
    acc + Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1, 0);

  const countryList = [...new Set(trips.map(t => t.country))];
  const cityList = [...new Set(trips.map(t => t.city))];

  const mostVisited = Object.entries(
    trips.reduce<Record<string, number>>((acc, t) => ({ ...acc, [t.country]: (acc[t.country] || 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-stone-800">Travel History</h2>
        <p className="text-sm text-stone-400 mt-1">Your life in numbers — and miles.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon={Map} value={stats.trips} label="Total trips" color="bg-amber-50 text-amber-500" />
        <StatCard icon={Globe} value={stats.countries} label="Countries" color="bg-blue-50 text-blue-500" />
        <StatCard icon={Milestone} value={stats.continents} label="Continents" color="bg-violet-50 text-violet-500" />
        <StatCard icon={Camera} value={stats.photos} label="Photos" color="bg-rose-50 text-rose-500" />
        <StatCard icon={TrendingUp} value={stats.miles} label="Miles" color="bg-emerald-50 text-emerald-500" />
        <StatCard icon={Map} value={totalDays} label="Days abroad" color="bg-orange-50 text-orange-500" />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h3 className="font-semibold text-stone-800 text-sm mb-3">Countries visited</h3>
        <div className="flex flex-wrap gap-2">
          {countryList.map(c => (
            <span key={c} className="bg-stone-100 text-stone-700 text-xs font-medium px-3 py-1 rounded-full">{c}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h3 className="font-semibold text-stone-800 text-sm mb-4">Most visited countries</h3>
        <div className="space-y-3">
          {mostVisited.map(([country, count]) => (
            <div key={country} className="flex items-center gap-3">
              <span className="text-sm text-stone-700 w-28 flex-shrink-0">{country}</span>
              <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(count / (mostVisited[0][1] || 1)) * 100}%` }} />
              </div>
              <span className="text-xs text-stone-400 w-16 text-right flex-shrink-0">{count} trip{count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h3 className="font-semibold text-stone-800 text-sm mb-3">Cities explored</h3>
        <div className="flex flex-wrap gap-2">
          {cityList.map(c => (
            <span key={c} className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full border border-amber-100">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
