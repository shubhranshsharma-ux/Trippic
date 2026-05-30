'use client';

import { useState } from 'react';
import { ArrowLeft, Bookmark, Plus, Trash2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WishlistItem {
  id: string;
  destination: string;
  note: string;
}

const SEED: WishlistItem[] = [
  { id: 'w1', destination: 'Santorini, Greece', note: 'Blue domes at sunset — September is best.' },
  { id: 'w2', destination: 'Patagonia, Argentina', note: 'Torres del Paine trek, at least 10 days.' },
  { id: 'w3', destination: 'Kyoto in Winter, Japan', note: 'Snow on temples — completely different vibe.' },
];

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>(SEED);
  const [adding, setAdding] = useState(false);
  const [dest, setDest] = useState('');
  const [note, setNote] = useState('');

  function add() {
    if (!dest.trim()) return;
    setItems(prev => [...prev, { id: Date.now().toString(), destination: dest.trim(), note: note.trim() }]);
    setDest('');
    setNote('');
    setAdding(false);
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-stone-400 hover:text-stone-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h1 className="text-lg font-bold text-stone-800">Wishlist</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-3">
        <p className="text-sm text-stone-400 mb-6">Places you want to visit next.</p>

        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-start gap-3 group">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm">{item.destination}</p>
              {item.note && <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{item.note}</p>}
            </div>
            <button
              onClick={() => remove(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 space-y-3">
            <input
              autoFocus
              type="text"
              placeholder="Destination (e.g. Bali, Indonesia)"
              value={dest}
              onChange={e => setDest(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <div className="flex gap-2">
              <button onClick={add} className="bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium px-4 py-2 rounded-xl">Add</button>
              <button onClick={() => setAdding(false)} className="text-stone-400 hover:text-stone-600 text-sm px-3 py-2">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 text-stone-400 hover:text-amber-500 border-2 border-dashed border-stone-200 hover:border-amber-300 rounded-2xl px-4 py-3 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add destination
          </button>
        )}
      </div>
    </div>
  );
}
