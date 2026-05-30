'use client';

import { Trip } from '@/lib/types';
import { X } from 'lucide-react';
import { useMemo } from 'react';

export interface Filters {
  years: number[];
  cities: string[];
  tripTypes: string[];
  duration: string[];
  minPhotos: number;
}

export const EMPTY_FILTERS: Filters = {
  years: [],
  cities: [],
  tripTypes: [],
  duration: [],
  minPhotos: 0,
};

const TRIP_TYPES = ['Beach', 'City', 'Mountains', 'Roadtrip'];
const DURATIONS = ['Weekend', 'Up to a week', 'Longer'];

function tripDays(t: Trip) {
  return Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1;
}

interface Props {
  trips: Trip[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function applyFilters(trips: Trip[], f: Filters): Trip[] {
  return trips.filter(t => {
    if (f.years.length && !f.years.includes(new Date(t.endDate).getFullYear())) return false;
    if (f.cities.length && !f.cities.includes(t.city)) return false;
    if (f.tripTypes.length) {
      // naive type tag: Beach if country is Morocco/Spain/Portugal/Iceland, Mountains if Iceland, else City
      const tag = inferTripType(t);
      if (!f.tripTypes.includes(tag)) return false;
    }
    if (f.duration.length) {
      const days = tripDays(t);
      const match = f.duration.some(d => {
        if (d === 'Weekend') return days <= 3;
        if (d === 'Up to a week') return days > 3 && days <= 7;
        if (d === 'Longer') return days > 7;
        return false;
      });
      if (!match) return false;
    }
    if (f.minPhotos > 0 && t.photoCount < f.minPhotos) return false;
    return true;
  });
}

function inferTripType(t: Trip): string {
  const beachCountries = ['Morocco', 'Spain', 'Portugal'];
  if (beachCountries.includes(t.country)) return 'Beach';
  if (t.country === 'Iceland') return 'Mountains';
  return 'City';
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

export default function FilterPanel({ trips, filters, onChange }: Props) {
  const allYears = useMemo(() =>
    [...new Set(trips.map(t => new Date(t.endDate).getFullYear()))].sort((a, b) => b - a),
    [trips]
  );
  const allCities = useMemo(() =>
    [...new Set(trips.map(t => t.city))].sort(),
    [trips]
  );

  const SHOW_LIMIT = 3;
  const showMoreCities = allCities.length > SHOW_LIMIT;
  const visibleCities = allCities.slice(0, SHOW_LIMIT);
  const hiddenCount = allCities.length - SHOW_LIMIT;

  const maxPhotos = useMemo(() => Math.max(...trips.map(t => t.photoCount), 0), [trips]);

  const hasActive =
    filters.years.length || filters.cities.length ||
    filters.tripTypes.length || filters.duration.length || filters.minPhotos > 0;

  function clearAll() { onChange(EMPTY_FILTERS); }

  return (
    <div className="bg-stone-900 text-white rounded-2xl p-5 w-64 flex-shrink-0 space-y-5 self-start sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base">Filters</span>
        {hasActive && (
          <button onClick={clearAll} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Year */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Year</p>
        <div className="space-y-1.5">
          {allYears.map(y => (
            <label key={y} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.years.includes(y)}
                onChange={() => onChange({ ...filters, years: toggle(filters.years, y) })}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm text-stone-200 group-hover:text-white transition-colors">{y}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cities */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">City</p>
        <div className="space-y-1.5">
          {visibleCities.map(city => (
            <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.cities.includes(city)}
                onChange={() => onChange({ ...filters, cities: toggle(filters.cities, city) })}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm text-stone-200 group-hover:text-white transition-colors">{city}</span>
            </label>
          ))}
          {showMoreCities && (
            <button
              onClick={() => onChange({ ...filters, cities: [] })}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
            >
              + {hiddenCount} more
            </button>
          )}
        </div>
      </div>

      {/* Trip Type */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Trip Type</p>
        <div className="flex flex-wrap gap-2">
          {TRIP_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onChange({ ...filters, tripTypes: toggle(filters.tripTypes, type) })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.tripTypes.includes(type)
                  ? 'bg-blue-500 text-white'
                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Duration</p>
        <div className="space-y-1.5">
          {DURATIONS.map(d => (
            <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.duration.includes(d)}
                onChange={() => onChange({ ...filters, duration: toggle(filters.duration, d) })}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm text-stone-200 group-hover:text-white transition-colors">{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Photos slider */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Photos</p>
        <input
          type="range"
          min={0}
          max={maxPhotos}
          value={filters.minPhotos}
          onChange={e => onChange({ ...filters, minPhotos: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <p className="text-xs text-stone-400 mt-1">
          {filters.minPhotos > 0 ? `At least ${filters.minPhotos} photos` : 'Any number'}
        </p>
      </div>
    </div>
  );
}
