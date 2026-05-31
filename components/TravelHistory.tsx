'use client';

import { useTrips } from '@/lib/tripsContext';
import Image from 'next/image';
import { Sun, Sunset, Moon, Sunrise } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function tripDuration(startDate: string, endDate: string): number {
  return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;
}

export default function TravelHistory() {
  const { trips } = useTrips();

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#737373]">
        <span className="text-4xl">🗺️</span>
        <p className="label-xs">No trips recorded yet</p>
      </div>
    );
  }

  // ── derived stats ──────────────────────────────────────────────
  const totalTrips = trips.length;
  const totalPhotos = trips.reduce((s, t) => s + t.photoCount, 0);
  const totalDays = trips.reduce((s, t) => s + tripDuration(t.startDate, t.endDate), 0);
  const countryList = [...new Set(trips.map(t => t.country))].sort();
  const cityList = [...new Set(trips.map(t => t.city))].sort();
  const totalCountries = countryList.length;
  const totalCities = cityList.length;

  // country trip counts
  const countryCount = trips.reduce<Record<string, number>>((acc, t) => {
    acc[t.country] = (acc[t.country] || 0) + 1;
    return acc;
  }, {});
  const mostVisited = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const mostVisitedCountry = mostVisited[0];

  // longest trip
  const longestTrip = trips.reduce((best, t) =>
    tripDuration(t.startDate, t.endDate) > tripDuration(best.startDate, best.endDate) ? t : best, trips[0]);
  const longestDays = tripDuration(longestTrip.startDate, longestTrip.endDate);

  // most photographed
  const mostPhotographed = trips.reduce((best, t) => t.photoCount > best.photoCount ? t : best, trips[0]);

  // trips per year
  const yearCount = trips.reduce<Record<string, number>>((acc, t) => {
    const y = new Date(t.startDate).getFullYear().toString();
    acc[y] = (acc[y] || 0) + 1;
    return acc;
  }, {});
  const yearEntries = Object.entries(yearCount).sort((a, b) => Number(a[0]) - Number(b[0]));
  const maxYearCount = Math.max(...yearEntries.map(e => e[1]));

  // trips per month (across all years)
  const monthCount = new Array(12).fill(0);
  trips.forEach(t => { monthCount[new Date(t.startDate).getMonth()]++; });
  const maxMonthCount = Math.max(...monthCount, 1);

  // photos per trip (sorted descending)
  const photoBarTrips = [...trips].sort((a, b) => b.photoCount - a.photoCount).slice(0, 8);
  const maxPhotoCount = photoBarTrips[0]?.photoCount || 1;

  // aggregate time-of-day across all trips
  const aggTod = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  trips.forEach(t => t.days.forEach(d => d.photos.forEach(p => {
    if (!p.takenAt) return;
    const h = new Date(p.takenAt).getHours();
    if (h >= 5  && h < 12) aggTod.morning++;
    else if (h >= 12 && h < 17) aggTod.afternoon++;
    else if (h >= 17 && h < 21) aggTod.evening++;
    else aggTod.night++;
  })));
  const aggTodTotal = aggTod.morning + aggTod.afternoon + aggTod.evening + aggTod.night || 1;
  const aggTodRows = [
    { label: 'Morning',   val: aggTod.morning },
    { label: 'Afternoon', val: aggTod.afternoon },
    { label: 'Evening',   val: aggTod.evening },
    { label: 'Night',     val: aggTod.night },
  ];

  return (
    <div className="space-y-4">

      {/* ── Page title ── */}
      <div>
        <h2 className="section-title">Travel History</h2>
        <p className="text-sm text-[#737373] mt-0.5">Your journeys, visualised.</p>
      </div>

      {/* ── Aggregate stats panel ── */}
      <div className="card py-4 px-5 space-y-4">
        <p className="label-xs">Overall snapshot</p>
        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Photos',       value: totalPhotos.toLocaleString() },
            { label: 'Trips',        value: totalTrips },
            { label: 'Days abroad',  value: totalDays },
            { label: 'Countries',    value: totalCountries },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[11px] text-[#737373] font-semibold uppercase tracking-wide">{label}</span>
              <span className="text-2xl font-extrabold text-[#171717] leading-none">{value}</span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Trips per year sparkline */}
          <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4">
            <p className="text-[#171717] font-bold text-sm mb-3">Trips per year</p>
            <div className="flex items-end gap-2 h-16">
              {yearEntries.map(([year, count]) => (
                <div key={year} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#FDE047] rounded-t-sm"
                    style={{ height: `${Math.max((count / maxYearCount) * 56, 4)}px` }}
                  />
                  <span className="text-[9px] text-[#737373]">{year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time of day */}
          <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4">
            <p className="text-[#171717] font-bold text-sm mb-3">When you shoot</p>
            <div className="space-y-2">
              {aggTodRows.map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#737373] w-16 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FDE047] rounded-full" style={{ width: `${(val / aggTodTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dense top stats row ── */}
      <div className="card py-4 px-5">
        <p className="label-xs mb-3">At a glance</p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {[
            { value: totalTrips, label: 'Trips' },
            { value: totalCountries, label: 'Countries' },
            { value: totalCities, label: 'Cities' },
            { value: totalDays, label: 'Days abroad' },
            { value: totalPhotos.toLocaleString(), label: 'Photos' },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#171717] leading-none">{value}</span>
              <span className="text-xs text-[#737373] font-semibold uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Most visited country */}
        <div className="card py-4 px-5 flex flex-col gap-1">
          <p className="label-xs">Most visited country</p>
          <p className="text-2xl font-extrabold text-[#171717] leading-tight">{mostVisitedCountry[0]}</p>
          <p className="text-sm text-[#737373]">
            {mostVisitedCountry[1]} trip{mostVisitedCountry[1] !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Longest trip */}
        <div className="card py-4 px-5 flex flex-col gap-1">
          <p className="label-xs">Longest trip</p>
          <p className="text-2xl font-extrabold text-[#171717] leading-tight truncate">{longestTrip.destination}</p>
          <p className="text-sm text-[#737373]">{longestDays} days · {longestTrip.country}</p>
        </div>

      </div>

      {/* ── Most photographed trip ── */}
      <div className="card py-4 px-5">
        <p className="label-xs mb-3">Most photographed trip</p>
        <div className="flex gap-4 items-start">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#E5E5E5]">
            {mostPhotographed.heroPhotoUrl && (
              <Image
                src={mostPhotographed.heroPhotoUrl}
                alt={mostPhotographed.destination}
                fill
                sizes="80px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="font-extrabold text-[#171717] text-base leading-tight truncate">
              {mostPhotographed.destination}
            </p>
            <p className="text-sm text-[#737373]">{mostPhotographed.country}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#171717]">{mostPhotographed.photoCount}</span>
              <span className="label-xs">photos</span>
            </div>
            <p className="text-xs text-[#737373]">
              {new Date(mostPhotographed.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' – '}
              {new Date(mostPhotographed.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Trips by year ── */}
      <div className="card py-4 px-5">
        <p className="label-xs mb-3">Trips by year</p>
        <div className="space-y-2">
          {yearEntries.map(([year, count]) => (
            <div key={year} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#171717] w-10 flex-shrink-0">{year}</span>
              <div className="flex-1 bg-[#F5F5F5] rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FDE047] flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${Math.max((count / maxYearCount) * 100, 8)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#171717] w-5 flex-shrink-0 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trips by month heat strip ── */}
      <div className="card py-4 px-5">
        <p className="label-xs mb-3">Trips by month</p>
        <div className="grid grid-cols-12 gap-1">
          {MONTHS.map((month, i) => {
            const count = monthCount[i];
            const intensity = count === 0 ? 0 : count === 1 ? 0.35 : Math.min(count / maxMonthCount, 1);
            const bg = count === 0
              ? '#E5E5E5'
              : `color-mix(in srgb, #FDE047 ${Math.round(intensity * 100)}%, #F5F5F5)`;
            return (
              <div key={month} className="flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-md"
                  style={{ height: 32, background: bg }}
                  title={`${month}: ${count} trip${count !== 1 ? 's' : ''}`}
                />
                <span className="text-[9px] font-semibold text-[#737373] uppercase tracking-wide">{month}</span>
              </div>
            );
          })}
        </div>
        {/* legend */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-[#737373]">0</span>
          <div className="flex gap-0.5">
            {[0, 0.35, 0.6, 1].map((op, i) => (
              <div
                key={i}
                className="w-4 h-3 rounded-sm"
                style={{ background: op === 0 ? '#E5E5E5' : `color-mix(in srgb, #FDE047 ${Math.round(op * 100)}%, #F5F5F5)` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#737373]">more</span>
        </div>
      </div>

      {/* ── Photos per trip bar chart ── */}
      <div className="card py-4 px-5">
        <p className="label-xs mb-3">Photos per trip (top {photoBarTrips.length})</p>
        <div className="space-y-2">
          {photoBarTrips.map(t => (
            <div key={t.id} className="flex items-center gap-3">
              <span className="text-xs text-[#171717] font-medium w-28 flex-shrink-0 truncate">{t.destination}</span>
              <div className="flex-1 bg-[#F5F5F5] rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FDE047] transition-all duration-500"
                  style={{ width: `${(t.photoCount / maxPhotoCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#171717] w-8 text-right flex-shrink-0">{t.photoCount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Most visited countries bars ── */}
      <div className="card py-4 px-5">
        <p className="label-xs mb-3">Most visited countries</p>
        <div className="space-y-2.5">
          {mostVisited.map(([country, count]) => (
            <div key={country} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#171717] w-28 flex-shrink-0 truncate">{country}</span>
              <div className="flex-1 bg-[#F5F5F5] rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#171717] transition-all duration-500"
                  style={{ width: `${(count / (mostVisited[0][1] || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#737373] w-14 text-right flex-shrink-0">
                {count} trip{count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Countries + Cities pills ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="card py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <p className="label-xs">Countries visited</p>
            <span className="text-xs font-extrabold text-[#171717]">{totalCountries}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {countryList.map(c => (
              <span
                key={c}
                className="bg-[#171717] text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="card py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <p className="label-xs">Cities explored</p>
            <span className="text-xs font-extrabold text-[#171717]">{totalCities}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cityList.map(c => (
              <span
                key={c}
                className="bg-[#FDE047] text-[#171717] text-xs font-semibold px-3 py-1 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
