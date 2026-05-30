'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Bookmark, Plus, Trash2, MapPin, Check, Minus } from 'lucide-react';

interface WishlistItem {
  id: string;
  destination: string;
  notes: string[];          // bullet-point notes
  struckOff: boolean;
}

const SEED: WishlistItem[] = [
  { id: 'w1', destination: 'Santorini, Greece', notes: ['Blue domes at sunset — September is best', 'Stay in Oia for sunrise views', 'Book accommodation 6 months ahead'], struckOff: false },
  { id: 'w2', destination: 'Patagonia, Argentina', notes: ['Torres del Paine trek — at least 10 days', 'W-Circuit or full O-Circuit', 'November–February is peak season'], struckOff: false },
  { id: 'w3', destination: 'Kyoto in Winter, Japan', notes: ['Snow on temples — completely different vibe', 'Fushimi Inari is empty before 6am', 'Try kaiseki dinner in Gion'], struckOff: true },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WishlistPanel({ open, onClose }: Props) {
  const [items, setItems] = useState<WishlistItem[]>(SEED);
  const [addingDest, setAddingDest] = useState(false);
  const [newDest, setNewDest] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function addDestination() {
    if (!newDest.trim()) return;
    const item: WishlistItem = { id: Date.now().toString(), destination: newDest.trim(), notes: [], struckOff: false };
    setItems(prev => [...prev, item]);
    setNewDest('');
    setAddingDest(false);
    setExpandedId(item.id);
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function toggleStrike(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, struckOff: !i.struckOff } : i));
  }

  function addNote(id: string) {
    if (!newNote.trim()) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes: [...i.notes, newNote.trim()] } : i));
    setNewNote('');
    setAddingNoteFor(null);
  }

  function removeNote(itemId: string, noteIdx: number) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, notes: i.notes.filter((_, idx) => idx !== noteIdx) } : i));
  }

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 bottom-0 z-50 w-96 max-w-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-stone-800 text-base">Wishlist</h2>
              <p className="text-xs text-stone-400">Dream it. Plan it. Live it.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {items.length === 0 && !addingDest && (
            <div className="text-center py-16 text-stone-400">
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm mb-1">Your wishlist is empty</p>
              <p className="text-xs">Add destinations you dream of visiting.</p>
            </div>
          )}

          {items.map(item => (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                item.struckOff ? 'border-stone-100 bg-stone-50' : 'border-stone-200 bg-white'
              }`}
            >
              {/* Item header */}
              <div
                className="flex items-center gap-2.5 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                {/* Strike-off checkbox */}
                <button
                  onClick={e => { e.stopPropagation(); toggleStrike(item.id); }}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.struckOff ? 'bg-stone-400 border-stone-400' : 'border-stone-300 hover:border-amber-400'
                  }`}
                >
                  {item.struckOff && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className={`text-sm font-semibold truncate ${item.struckOff ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                    {item.destination}
                  </span>
                  {item.notes.length > 0 && (
                    <span className="text-xs text-stone-400 flex-shrink-0">·{item.notes.length}</span>
                  )}
                </div>

                <button
                  onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                  className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded notes */}
              {expandedId === item.id && (
                <div className="px-4 pb-3 border-t border-stone-100">
                  <ul className="space-y-1.5 mt-2.5">
                    {item.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 group/note">
                        <Minus className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className={`text-xs text-stone-600 flex-1 leading-relaxed ${item.struckOff ? 'line-through text-stone-400' : ''}`}>
                          {note}
                        </span>
                        <button
                          onClick={() => removeNote(item.id, idx)}
                          className="opacity-0 group-hover/note:opacity-100 transition-opacity text-stone-300 hover:text-red-400 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {addingNoteFor === item.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Minus className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addNote(item.id); if (e.key === 'Escape') { setAddingNoteFor(null); setNewNote(''); } }}
                        placeholder="Add a note…"
                        className="flex-1 text-xs border-b border-amber-300 focus:outline-none py-0.5 bg-transparent placeholder-stone-400"
                      />
                      <button onClick={() => addNote(item.id)} className="text-xs text-amber-500 font-medium hover:text-amber-600">Add</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingNoteFor(item.id); setNewNote(''); }}
                      className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-500 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add note
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add destination */}
          {addingDest ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
              <input
                autoFocus
                type="text"
                value={newDest}
                onChange={e => setNewDest(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addDestination(); if (e.key === 'Escape') setAddingDest(false); }}
                placeholder="e.g. Bali, Indonesia"
                className="w-full text-sm bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <div className="flex gap-2">
                <button onClick={addDestination} className="bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg">Add</button>
                <button onClick={() => setAddingDest(false)} className="text-stone-400 hover:text-stone-600 text-xs px-2 py-1.5">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingDest(true)}
              className="w-full flex items-center justify-center gap-2 text-stone-400 hover:text-amber-500 border-2 border-dashed border-stone-200 hover:border-amber-300 rounded-2xl py-3 text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" /> Add destination
            </button>
          )}
        </div>
      </div>
    </>
  );
}
