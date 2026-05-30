'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ArrowLeft, User, Upload, Check } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, signup } = useAuth();
  const router = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [age, setAge] = useState(user?.age ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await signup({ ...user, name, gender, age, avatarUrl }, '');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-stone-400 hover:text-stone-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-stone-800">Edit profile</h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 hover:border-amber-400 flex items-center justify-center overflow-hidden transition-colors group"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt={name} fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-amber-500 transition-colors">
                  <User className="w-8 h-8" />
                  <Upload className="w-3 h-3" />
                </div>
              )}
            </button>
            <span className="text-xs text-stone-400">Tap to change photo</span>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Email <span className="text-stone-400 font-normal">(cannot be changed)</span></label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-stone-100 text-sm text-stone-400 bg-stone-50 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="28"
                min={1}
                max={120}
                className="w-full px-3 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
            }`}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
