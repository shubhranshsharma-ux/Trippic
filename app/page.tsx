import { Luggage } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <Luggage className="w-10 h-10 text-amber-500" />
          <h1 className="text-4xl font-bold text-stone-800 tracking-tight">Trippic</h1>
        </div>
        <p className="text-stone-500 text-lg">All your trips, in one place.</p>
        <p className="text-stone-400 text-sm">Coming soon — setting up...</p>
      </div>
    </div>
  );
}
