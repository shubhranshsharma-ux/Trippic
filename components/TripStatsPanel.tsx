'use client';

import { Trip } from '@/lib/types';
import { X, Camera, Calendar, MapPin, Sun, Sunset, Moon, Sunrise } from 'lucide-react';
import { useEffect } from 'react';

// ── helpers ──────────────────────────────────────────────────────

function tripDurationDays(t: Trip) {
  return Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86_400_000) + 1;
}

function computeStats(trip: Trip) {
  const photosPerDay = trip.days.map(d => d.photos.length);
  const busiestDayIdx = photosPerDay.indexOf(Math.max(...photosPerDay));
  const busiestDayLabel = `Day ${busiestDayIdx + 1}`;

  const tod = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  trip.days.forEach(d => d.photos.forEach(p => {
    if (!p.takenAt) return;
    const h = new Date(p.takenAt).getHours();
    if (h >= 5  && h < 12) tod.morning++;
    else if (h >= 12 && h < 17) tod.afternoon++;
    else if (h >= 17 && h < 21) tod.evening++;
    else tod.night++;
  }));

  const todMax = Math.max(tod.morning, tod.afternoon, tod.evening, tod.night);
  const todLabel =
    todMax === tod.morning   ? 'morning photographer 🌅' :
    todMax === tod.afternoon ? 'afternoon explorer 🌤️'  :
    todMax === tod.evening   ? 'evening photographer 🌇' :
    'night owl 🌙';

  const placesVisited = new Set(trip.days.map(d => d.locationName)).size;
  const hasGPS = trip.days.some(d => d.photos.some(p => p.lat != null));

  return { photosPerDay, busiestDayLabel, tod, todMax, todLabel, placesVisited, hasGPS };
}

// ── Stat tile ────────────────────────────────────────────────────

function Tile({ label, value, gps = false }: { label: string; value: string | number; gps?: boolean }) {
  return (
    <div className={`rounded-xl p-3 flex flex-col gap-1 ${gps ? 'bg-[#1e3a5f]' : 'bg-[#2a2a2a]'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/50 font-semibold uppercase tracking-wide">{label}</span>
        {gps && <span className="text-[9px] font-bold bg-[#0EA5E9]/30 text-[#0EA5E9] px-1.5 py-0.5 rounded-full">GPS</span>}
      </div>
      <span className="text-2xl font-extrabold text-white leading-none">{value}</span>
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────

export default function TripStatsPanel({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const duration = tripDurationDays(trip);
  const { photosPerDay, busiestDayLabel, tod, todMax, todLabel, placesVisited, hasGPS } = computeStats(trip);
  const maxPpd = Math.max(...photosPerDay, 1);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const todTotal = tod.morning + tod.afternoon + tod.evening + tod.night || 1;
  const todRows = [
    { label: 'Morning',   icon: Sunrise, val: tod.morning },
    { label: 'Afternoon', icon: Sun,     val: tod.afternoon },
    { label: 'Evening',   icon: Sunset,  val: tod.evening },
    { label: 'Night',     icon: Moon,    val: tod.night },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-[#1a1a1a] rounded-2xl p-5 space-y-4 overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white font-extrabold text-lg leading-tight">{trip.destination}</p>
            <p className="text-white/40 text-xs mt-0.5 font-medium">trip stats</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stat tiles row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Tile label="Photos"   value={trip.photoCount} />
          <Tile label="Duration" value={`${duration} day${duration !== 1 ? 's' : ''}`} />
          <Tile label="Busiest day" value={busiestDayLabel} />
          {hasGPS && <Tile label="Places" value={placesVisited} gps />}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Photos per day sparkline */}
          <div className="bg-[#2a2a2a] rounded-xl p-4">
            <p className="text-white font-bold text-sm mb-3">Photos per day</p>
            <div className="flex items-end gap-1.5 h-16">
              {photosPerDay.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#FDE047]/80 rounded-t-sm transition-all"
                    style={{ height: `${Math.max((count / maxPpd) * 56, count > 0 ? 4 : 0)}px` }}
                  />
                  <span className="text-[9px] text-white/40">D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time of day */}
          <div className="bg-[#2a2a2a] rounded-xl p-4">
            <p className="text-white font-bold text-sm mb-3">When you shot</p>
            <div className="space-y-2">
              {todRows.map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[11px] text-white/50 w-16 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FDE047]/70 rounded-full" style={{ width: `${(val / todTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-[11px] mt-3">You were a {todLabel}</p>
          </div>
        </div>

        {/* Footer note */}
        {hasGPS && (
          <p className="text-white/25 text-[10px]">
            Tiles marked <span className="bg-[#0EA5E9]/30 text-[#0EA5E9] px-1 rounded">GPS</span> only appear when location data is available.
          </p>
        )}
      </div>
    </div>
  );
}
