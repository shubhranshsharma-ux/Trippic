'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Luggage, Eye, EyeOff, User, Upload, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

type Step = 'profile' | 'connect';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError('Name, email and password are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setStep('connect');
  }

  async function handleConnect() {
    setLoading(true);
    await signup({ name, email, gender, age, avatarUrl, keepLoggedIn: true }, password);
    router.push('/home');
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] text-sm text-[#171717] placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:bg-white transition-all";

  if (step === 'connect') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E5E5E5] p-8 w-full max-w-sm text-center">
          <button onClick={() => setStep('profile')} className="text-xs text-[#737373] hover:text-[#171717] mb-6 flex items-center gap-1.5 font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="w-20 h-20 rounded-full bg-[#FDE047]/20 mx-auto mb-4 overflow-hidden flex items-center justify-center border-2 border-[#FDE047]">
            {avatarUrl
              ? <Image src={avatarUrl} alt={name} width={80} height={80} className="object-cover w-full h-full" />
              : <User className="w-9 h-9 text-[#171717]" />
            }
          </div>
          <h2 className="text-2xl font-extrabold text-[#171717] mb-1">Hi, {name.split(' ')[0]}!</h2>
          <p className="text-[#737373] text-sm mb-8 leading-relaxed">
            One last step — connect your Google Photos so we can build your <em>trip</em> collection.
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="btn-inverted w-full justify-center gap-3 py-4 rounded-2xl disabled:opacity-50"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Setting up…' : 'Connect Google Photos'}
          </button>
          <button onClick={handleConnect} className="w-full mt-3 text-[#737373] hover:text-[#171717] text-sm py-2 transition-colors font-medium">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] px-4 py-10">
      <div className="bg-white rounded-3xl shadow-sm border border-[#E5E5E5] p-8 w-full max-w-sm">
        <button onClick={() => router.push('/')} className="text-xs text-[#737373] hover:text-[#171717] mb-6 flex items-center gap-1.5 font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 bg-[#FDE047] rounded-xl flex items-center justify-center">
            <Luggage className="w-5 h-5 text-[#171717]" />
          </div>
          <span className="font-extrabold text-[#171717] text-xl tracking-tight">Trippic</span>
        </div>

        <h2 className="text-2xl font-extrabold text-[#171717] mb-1">Create your account</h2>
        <p className="text-[#737373] text-sm mb-7">Start reliving your <em>trips</em> beautifully.</p>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-[#F5F5F5] border-2 border-dashed border-[#E5E5E5] hover:border-[#FDE047] flex items-center justify-center overflow-hidden transition-colors group"
            >
              {avatarUrl
                ? <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                : <div className="flex flex-col items-center gap-1 text-[#737373] group-hover:text-[#171717] transition-colors">
                    <User className="w-7 h-7" />
                    <Upload className="w-3 h-3" />
                  </div>
              }
            </button>
            <span className="text-xs text-[#737373]">Upload photo (optional)</span>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div>
            <label className="block label-xs mb-1.5">Full name <span className="text-red-400 normal-case font-normal">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" className={inputCls} />
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

          <div>
            <label className="block label-xs mb-1.5">Email <span className="text-red-400 normal-case font-normal">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>

          <div>
            <label className="block label-xs mb-1.5">Set password <span className="text-red-400 normal-case font-normal">*</span></label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className={inputCls} />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <button type="submit" className="btn-primary w-full justify-center py-3.5 rounded-xl">
            Continue →
          </button>
        </form>

        <p className="text-center text-xs text-[#737373] mt-5">
          Have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-[#171717] hover:underline font-bold">Log in</button>
        </p>
      </div>
    </div>
  );
}
