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

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:bg-white transition-all";

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-[#737373] hover:text-[#171717] transition-colors p-1.5 rounded-lg hover:bg-[#F5F5F5]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-extrabold text-[#171717]">Edit profile</h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSave} className="card p-8 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-[#F5F5F5] border-2 border-dashed border-[#E5E5E5] hover:border-[#FDE047] flex items-center justify-center overflow-hidden transition-colors group"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt={name} fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-[#737373] group-hover:text-[#171717] transition-colors">
                  <User className="w-8 h-8" />
                  <Upload className="w-3 h-3" />
                </div>
              )}
            </button>
            <span className="text-xs text-[#737373]">Tap to change photo</span>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div>
            <label className="block label-xs mb-1.5">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block label-xs mb-1.5">Email <span className="text-[#737373] normal-case font-normal">(cannot be changed)</span></label>
            <input type="email" value={user?.email ?? ''} disabled
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-sm text-[#737373] bg-[#F5F5F5] cursor-not-allowed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block label-xs mb-1.5">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:bg-white">
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block label-xs mb-1.5">Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="28" min={1} max={120} className={inputCls} />
            </div>
          </div>

          <button type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              saved ? 'bg-green-500 text-white' : 'btn-primary'
            }`}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
