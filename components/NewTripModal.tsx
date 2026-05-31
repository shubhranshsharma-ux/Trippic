'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Camera, Star, Trash2, Loader2, Check } from 'lucide-react';
import { Trip, TripDay, Photo } from '@/lib/types';
import { useTrips } from '@/lib/tripsContext';
import { groupPhotosIntoTrips } from '@/lib/groupPhotosIntoTrips';

interface DraftPhoto {
  id: string;
  url: string;
  takenAt: string;
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] text-sm text-[#171717] placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:bg-white transition-all';

export default function NewTripModal({ onClose }: { onClose: () => void }) {
  const { addTrip, useMock } = useTrips();
  const fileRef = useRef<HTMLInputElement>(null);

  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState('');
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [heroId, setHeroId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next: DraftPhoto[] = files.map((f, i) => ({
      id: `local-${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      takenAt: new Date(f.lastModified || Date.now()).toISOString(),
    }));
    setPhotos(prev => {
      const merged = [...prev, ...next];
      if (!heroId && merged.length) setHeroId(merged[0].id);
      return merged;
    });
  }

  // Pull photos from Google Photos via the picker flow.
  async function importFromGoogle() {
    setError('');
    setImporting(true);
    try {
      const createRes = await fetch('/api/photos/picker/create', { method: 'POST' });
      if (createRes.status === 401) {
        window.location.href = '/api/auth/google';
        return;
      }
      if (!createRes.ok) throw new Error('create failed');
      const session = await createRes.json() as { id: string; pickerUri: string };
      const picker = window.open(session.pickerUri, '_blank');

      const deadline = Date.now() + 5 * 60 * 1000;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(`/api/photos/picker/poll?sessionId=${encodeURIComponent(session.id)}`);
        if (!pollRes.ok) continue;
        const poll = await pollRes.json() as { ready: boolean; mediaItems?: unknown[] };
        if (poll.ready) {
          picker?.close();
          // Reuse the grouping helper to extract proxied urls + dates, flatten its days.
          const grouped = groupPhotosIntoTrips(
            (poll.mediaItems ?? []) as Parameters<typeof groupPhotosIntoTrips>[0]
          );
          const extracted: DraftPhoto[] = grouped
            .flatMap(t => t.days.flatMap(d => d.photos))
            .map(p => ({ id: p.id, url: p.url, takenAt: p.takenAt }));
          setPhotos(prev => {
            const merged = [...prev, ...extracted];
            if (!heroId && merged.length) setHeroId(merged[0].id);
            return merged;
          });
          return;
        }
      }
      setError('Timed out waiting for photo selection.');
    } catch {
      setError('Could not import from Google Photos.');
    } finally {
      setImporting(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== id);
      if (heroId === id) setHeroId(next[0]?.id ?? null);
      return next;
    });
  }

  function handleSave() {
    if (!destination.trim()) { setError('Please enter a trip destination.'); return; }
    if (photos.length === 0) { setError('Add at least one photo.'); return; }

    // Sort photos by date and group into days.
    const sorted = [...photos].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
    const dayMap = new Map<string, DraftPhoto[]>();
    for (const p of sorted) {
      const d = (p.takenAt || new Date().toISOString()).split('T')[0];
      if (!dayMap.has(d)) dayMap.set(d, []);
      dayMap.get(d)!.push(p);
    }

    const days: TripDay[] = Array.from(dayMap.entries()).map(([date, items]) => ({
      date,
      locationName: city || destination,
      photos: items.map(p => ({ id: p.id, url: p.url, takenAt: p.takenAt } satisfies Photo)),
    }));

    const dates = sorted.map(p => p.takenAt.split('T')[0]).filter(Boolean).sort();
    const hero = photos.find(p => p.id === heroId) ?? photos[0];

    const trip: Trip = {
      id: `custom-${Date.now()}`,
      destination: destination.trim(),
      country: country.trim(),
      city: city.trim(),
      startDate: startDate || dates[0] || new Date().toISOString().split('T')[0],
      endDate: endDate || dates[dates.length - 1] || new Date().toISOString().split('T')[0],
      heroPhotoUrl: hero.url,
      photoCount: photos.length,
      days,
      aiSummary: summary.trim(),
      source: 'manual',
    };

    addTrip(trip);
    handleClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 ${closing ? 'animate-fade-in' : 'animate-fade-in'}`}
      style={closing ? { animation: 'fade-in 0.2s reverse forwards' } : undefined}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl border border-[#E5E5E5] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-lg font-extrabold text-[#171717]">Create a custom trip</h2>
            <p className="text-xs text-[#737373] mt-0.5">Add photos and details to build your postcard</p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#171717] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 stagger">
          {/* Photo sources */}
          <div>
            <p className="label-xs mb-2">Photos</p>
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-[#E5E5E5] text-sm font-semibold text-[#525252] hover:border-[#FDE047] hover:text-[#171717] hover:bg-[#FDE047]/5 transition-all"
              >
                <Upload className="w-4 h-4" /> From device
              </button>
              <button
                onClick={importFromGoogle}
                disabled={importing || useMock}
                title={useMock ? 'Connect Google Photos (disabled in demo mode)' : 'Import from Google Photos'}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-[#E5E5E5] text-sm font-semibold text-[#525252] hover:border-[#FDE047] hover:text-[#171717] hover:bg-[#FDE047]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#E5E5E5] disabled:hover:bg-transparent"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {importing ? 'Importing…' : 'Google Photos'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPickFiles} />
          </div>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="label-xs">{photos.length} photo{photos.length > 1 ? 's' : ''} · tap a star to set hero</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photos.map(p => (
                  <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden bg-[#F5F5F5] animate-pop-in">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <button
                      onClick={() => setHeroId(p.id)}
                      title="Set as hero photo"
                      className={`absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        heroId === p.id
                          ? 'bg-[#FDE047] text-[#171717] scale-100'
                          : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${heroId === p.id ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => removePhoto(p.id)}
                      title="Remove"
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {heroId === p.id && (
                      <span className="absolute bottom-1.5 left-1.5 bg-[#FDE047] text-[#171717] text-[9px] font-bold px-1.5 py-0.5 rounded-full">HERO</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div>
            <label className="block label-xs mb-1.5">Destination <span className="text-red-400 normal-case font-normal">*</span></label>
            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Kyoto Getaway" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block label-xs mb-1.5">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Kyoto" className={inputCls} />
            </div>
            <div>
              <label className="block label-xs mb-1.5">Country</label>
              <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Japan" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block label-xs mb-1.5">Start date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block label-xs mb-1.5">End date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block label-xs mb-1.5">Summary <span className="text-[#A3A3A3] normal-case font-normal">(optional)</span></label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="A short note about this trip…" rows={2} className={`${inputCls} resize-none`} />
          </div>

          {error && <p className="text-sm text-red-500 animate-fade-in">{error}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#E5E5E5] px-6 py-4 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#525252] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#FDE047] hover:bg-yellow-300 text-[#171717] text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            <Check className="w-4 h-4" /> Create trip
          </button>
        </div>
      </div>
    </div>
  );
}
