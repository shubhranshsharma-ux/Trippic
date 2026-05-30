'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Luggage, Eye, EyeOff, Upload, User } from 'lucide-react';
import Image from 'next/image';

type Mode = 'landing' | 'login' | 'signup-profile' | 'signup-connect';

export default function LandingPage() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('landing');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  // Signup form
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await login(loginEmail, loginPassword, keepLoggedIn);
    router.push('/home');
  }

  async function handleSignupProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !signupEmail || !signupPassword) { setError('Name, email and password are required.'); return; }
    setMode('signup-connect');
  }

  async function handleConnect() {
    setLoading(true);
    await signup({ name, email: signupEmail, gender, age, avatarUrl, keepLoggedIn: true }, signupPassword);
    router.push('/home');
  }

  // ── Landing ──────────────────────────────────────────────────────────────
  if (mode === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 px-4">
        <div className="flex flex-col items-center gap-8 text-center max-w-sm w-full">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Luggage className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-stone-800 tracking-tight">Trippic</h1>
          </div>
          <p className="text-lg text-stone-500 leading-relaxed">All your trips, in one place. Beautifully.</p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setMode('signup-profile')}
              className="w-full bg-stone-800 hover:bg-stone-700 text-white px-6 py-3.5 rounded-2xl font-semibold shadow transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Create account
            </button>
            <button
              onClick={() => setMode('login')}
              className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-6 py-3.5 rounded-2xl font-semibold transition-all"
            >
              Log in
            </button>
          </div>
          <p className="text-xs text-stone-400">Your photos stay private. We just help you relive them.</p>
        </div>
      </div>
    );
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (mode === 'login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
          <button onClick={() => setMode('landing')} className="text-xs text-stone-400 hover:text-stone-600 mb-6 flex items-center gap-1">
            ← Back
          </button>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
              <Luggage className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-800 text-lg">Trippic</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Welcome back</h2>
          <p className="text-stone-400 text-sm mb-6">Log in to your trips</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={keepLoggedIn} onChange={e => setKeepLoggedIn(e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-sm text-stone-600">Keep me logged in</span>
            </label>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <p className="text-center text-xs text-stone-400 mt-4">
            No account?{' '}
            <button onClick={() => setMode('signup-profile')} className="text-amber-500 hover:underline font-medium">Sign up</button>
          </p>
        </div>
      </div>
    );
  }

  // ── Sign up — profile ─────────────────────────────────────────────────────
  if (mode === 'signup-profile') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
          <button onClick={() => setMode('landing')} className="text-xs text-stone-400 hover:text-stone-600 mb-6 flex items-center gap-1">
            ← Back
          </button>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
              <Luggage className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-800 text-lg">Trippic</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Create account</h2>
          <p className="text-stone-400 text-sm mb-6">Tell us a bit about yourself</p>

          <form onSubmit={handleSignupProfile} className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="relative w-20 h-20 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 hover:border-amber-400 flex items-center justify-center overflow-hidden transition-colors group"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-amber-500 transition-colors">
                    <User className="w-7 h-7" />
                    <Upload className="w-3 h-3" />
                  </div>
                )}
              </button>
              <span className="text-xs text-stone-400">Upload photo</span>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Full name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
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

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Continue →
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-4">
            Have an account?{' '}
            <button onClick={() => setMode('login')} className="text-amber-500 hover:underline font-medium">Log in</button>
          </p>
        </div>
      </div>
    );
  }

  // ── Sign up — connect Google Photos ───────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        <button onClick={() => setMode('signup-profile')} className="text-xs text-stone-400 hover:text-stone-600 mb-6 flex items-center gap-1">
          ← Back
        </button>
        {/* Avatar preview */}
        <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto mb-4 overflow-hidden flex items-center justify-center border-2 border-amber-200">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <User className="w-8 h-8 text-amber-500" />
          )}
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-1">Hi, {name.split(' ')[0]}!</h2>
        <p className="text-stone-400 text-sm mb-8">One last step — connect your Google Photos so we can build your trip collection.</p>

        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white px-6 py-3.5 rounded-2xl font-semibold shadow transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Connecting…' : 'Connect Google Photos'}
        </button>

        <button
          onClick={handleConnect}
          className="w-full mt-3 text-stone-400 hover:text-stone-600 text-sm py-2 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
