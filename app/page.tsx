'use client';

import { Luggage } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  function handleConnect() {
    // On mock path, go straight to home
    router.push('/home');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 px-4">
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Luggage className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-stone-800 tracking-tight">Trippic</h1>
        </div>

        {/* Tagline */}
        <p className="text-xl text-stone-500 leading-relaxed">
          All your trips, in one place. Beautifully.
        </p>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          className="flex items-center gap-3 bg-stone-800 hover:bg-stone-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Connect Google Photos
        </button>

        <p className="text-sm text-stone-400">
          Your photos stay private. We just help you relive them.
        </p>
      </div>
    </div>
  );
}
