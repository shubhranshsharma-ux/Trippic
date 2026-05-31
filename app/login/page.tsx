'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Luggage, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    await login(email, password, keep);
    router.push('/home');
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] text-sm text-[#171717] placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:bg-white transition-all";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] px-4">
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

        <h2 className="text-2xl font-extrabold text-[#171717] mb-1">Welcome back</h2>
        <p className="text-[#737373] text-sm mb-7">Log in to your <em>trips</em></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#737373] mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#737373] mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} className={inputCls} />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} className="w-4 h-4 rounded accent-[#FDE047]" />
            <span className="text-sm text-[#737373] font-medium">Keep me logged in</span>
          </label>
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 rounded-xl">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-xs text-[#737373] mt-5">
          No account?{' '}
          <button onClick={() => router.push('/signup')} className="text-[#171717] hover:underline font-bold">Sign up</button>
        </p>
      </div>
    </div>
  );
}
