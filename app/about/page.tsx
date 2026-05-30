'use client';

import { useRouter } from 'next/navigation';
import { Luggage, ArrowLeft, MapPin, Users, Zap, Globe } from 'lucide-react';
import Image from 'next/image';

const TEAM = [
  {
    name: 'Priya Nair',
    role: 'Co-founder & CEO',
    bio: 'Former product lead at Airbnb. Has visited 61 countries and still can\'t pick a favourite.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b9e5?w=200&q=80',
  },
  {
    name: 'Marcus Webb',
    role: 'Co-founder & CTO',
    bio: 'Ex-Google engineer who built photo-processing infrastructure at scale. Avid diver, reluctant flyer.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  {
    name: 'Leila Ahmadi',
    role: 'Head of Design',
    bio: 'Obsessed with the intersection of memory and visual storytelling. Based between London and Tehran.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  },
  {
    name: 'Tomás Rivera',
    role: 'Head of Growth',
    bio: 'Grew two travel startups from zero to acquisition. Counts road trips across Patagonia as therapy.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  },
];

const STATS = [
  { icon: Users, value: '180K+', label: 'Travellers' },
  { icon: Globe, value: '140', label: 'Countries covered' },
  { icon: MapPin, value: '2.4M', label: 'Trips archived' },
  { icon: Zap, value: '< 2s', label: 'Avg. trip grouping' },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <Luggage className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-800">Trippic</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=80"
          alt="Travel"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/75 via-orange-500/60 to-rose-600/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
            We built Trippic<br />because <em>trips</em> deserve better.
          </h1>
          <p className="text-white/75 text-lg max-w-xl">
            Your memories are scattered. We bring them home.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* Story */}
        <section className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-4">Our story</p>
          <p className="text-stone-600 text-lg leading-relaxed mb-5">
            Trippic started in 2022 when our co-founders returned from a three-week trip across Southeast Asia and spent an entire weekend failing to organise 3,000 photos into anything coherent. By Sunday evening, they had a prototype that could do it in under ten seconds.
          </p>
          <p className="text-stone-500 leading-relaxed">
            We believe travel is one of the most meaningful things a person can do — and that the stories you bring back deserve to be preserved with the same care you gave to the journey itself. Trippic automatically groups your photos into trips, names them, summarises them with AI, and presents them as the beautiful collection they should always have been.
          </p>
        </section>

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white rounded-2xl p-6 text-center border border-stone-100 shadow-sm">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-stone-800 mb-1">{value}</p>
                <p className="text-xs text-stone-400 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-8 text-center">What we stand for</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: 'Privacy first', body: 'Your photos are yours. We process everything on-device where possible, and never train models on your personal images without explicit consent.' },
              { title: 'Zero effort', body: 'You went on the trip. We do the filing. Trippic should feel effortless — the app that quietly does the work so you don\'t have to.' },
              { title: 'Built to last', body: 'Trends in social media come and go. Your memories don\'t. We\'re building Trippic to be the permanent, private home for a lifetime of travel.' },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-2">{v.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-8 text-center">The team</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-amber-100">
                  <Image src={member.avatar} alt={member.name} width={64} height={64} className="object-cover w-full h-full" />
                </div>
                <p className="font-semibold text-stone-800 text-sm">{member.name}</p>
                <p className="text-xs text-amber-500 mb-2">{member.role}</p>
                <p className="text-xs text-stone-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-3">Ready to relive your <em>trips</em>?</h2>
            <p className="text-white/80 mb-6">Join 180,000 travellers who never lose a memory.</p>
            <button
              onClick={() => router.push('/signup')}
              className="bg-white text-stone-900 font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Get started — it&apos;s free
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
