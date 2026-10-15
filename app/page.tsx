'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Users, Calendar, Award, Shield, Zap, Globe, ArrowRight,
  ChevronRight, Star, CheckCircle, MessageSquare, Bell,
  BookOpen, TrendingUp, Heart, Menu, X
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5146E5] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="5" cy="9" r="2.5" fill="white" />
                <circle cx="13" cy="5" r="2.5" fill="white" opacity="0.7" />
                <circle cx="13" cy="13" r="2.5" fill="white" opacity="0.7" />
                <line x1="7.2" y1="8" x2="11" y2="6" stroke="white" strokeWidth="1.2" />
                <line x1="7.2" y1="10" x2="11" y2="12" stroke="white" strokeWidth="1.2" />
              </svg>
            </div>
            <span className="text-[#182230] font-bold text-xl tracking-tight">Koinelio</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#667085] hover:text-[#182230] text-sm font-medium transition-colors">Features</a>
            <a href="#clubs" className="text-[#667085] hover:text-[#182230] text-sm font-medium transition-colors">Clubs</a>
            <a href="#events" className="text-[#667085] hover:text-[#182230] text-sm font-medium transition-colors">Events</a>
            <a href="#alumni" className="text-[#667085] hover:text-[#182230] text-sm font-medium transition-colors">Alumni</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/signin" className="text-sm font-medium text-[#667085] hover:text-[#182230] transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white bg-[#5146E5] hover:bg-[#4338CA] px-4 py-2 rounded-lg transition-colors"
            >
              Explore Koinelio
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#F7F8FC] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-3">
            <a href="#features" className="block text-[#667085] hover:text-[#182230] text-sm font-medium py-2">Features</a>
            <a href="#clubs" className="block text-[#667085] hover:text-[#182230] text-sm font-medium py-2">Clubs</a>
            <a href="#events" className="block text-[#667085] hover:text-[#182230] text-sm font-medium py-2">Events</a>
            <a href="#alumni" className="block text-[#667085] hover:text-[#182230] text-sm font-medium py-2">Alumni</a>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/auth/signin" className="text-center text-sm font-medium text-[#667085] border border-[#E5E7EB] rounded-lg px-4 py-2.5">
                Sign in
              </Link>
              <Link href="/dashboard" className="text-center text-sm font-semibold text-white bg-[#5146E5] rounded-lg px-4 py-2.5">
                Explore Koinelio
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-[#F7F8FC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-[#EEF0FD] text-[#5146E5] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-[#5146E5] rounded-full animate-pulse" />
              Now open for pilot institutions — launching January 2027
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#182230] leading-tight tracking-tight mb-6">
              Your campus.{' '}
              <span className="text-[#5146E5]">Your community.</span>{' '}
              Your connections.
            </h1>
            <p className="text-lg text-[#667085] leading-relaxed mb-8 max-w-2xl mx-auto">
              Discover student communities, organize events, connect with faculty and alumni, and be part of everything happening across your campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-[#5146E5] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#4338CA] transition-colors text-sm"
              >
                Explore Koinelio
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#182230] font-medium px-6 py-3.5 rounded-xl border border-[#E5E7EB] hover:border-[#5146E5] hover:text-[#5146E5] transition-colors text-sm"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#5146E5]/10 to-[#0F9D8A]/10 rounded-3xl blur-3xl -z-10" />
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] bg-[#F7F8FC]">
                <div className="w-3 h-3 rounded-full bg-[#FC5F5F]" />
                <div className="w-3 h-3 rounded-full bg-[#FDBC40]" />
                <div className="w-3 h-3 rounded-full bg-[#34C749]" />
                <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1.5 text-xs text-[#667085] border border-[#E5E7EB]">
                  koinelio.app/dashboard
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="flex h-80 sm:h-96">
                {/* Sidebar */}
                <div className="hidden sm:flex w-16 bg-[#14213D] flex-col items-center py-4 gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#5146E5] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                      <circle cx="5" cy="9" r="2.5" fill="white" />
                      <circle cx="13" cy="5" r="2.5" fill="white" opacity="0.7" />
                      <circle cx="13" cy="13" r="2.5" fill="white" opacity="0.7" />
                      <line x1="7.2" y1="8" x2="11" y2="6" stroke="white" strokeWidth="1.2" />
                      <line x1="7.2" y1="10" x2="11" y2="12" stroke="white" strokeWidth="1.2" />
                    </svg>
                  </div>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className={`w-8 h-1 rounded-full ${i === 0 ? 'bg-[#5146E5]' : 'bg-white/20'}`} />
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 bg-[#F7F8FC] p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="h-2.5 bg-[#182230] rounded w-32 mb-1.5" />
                      <div className="h-2 bg-[#667085]/40 rounded w-48" />
                    </div>
                    <div className="w-24 h-7 bg-[#5146E5] rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {['#5146E5', '#0F9D8A', '#14213D'].map((c, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-[#E5E7EB]">
                        <div className="w-6 h-6 rounded-lg mb-2" style={{ backgroundColor: c + '20' }} />
                        <div className="h-2 bg-gray-200 rounded w-12 mb-1" />
                        <div className="h-3 font-bold bg-gray-300 rounded w-8" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 bg-white rounded-xl border border-[#E5E7EB] p-3 space-y-3">
                      {[0,1,2].map(i => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5146E5] to-[#0F9D8A] flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-gray-200 rounded w-24" />
                            <div className="h-1.5 bg-gray-100 rounded w-full" />
                            <div className="h-1.5 bg-gray-100 rounded w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="col-span-2 space-y-3">
                      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3">
                        <div className="h-2 bg-[#5146E5]/30 rounded w-20 mb-2" />
                        {[0,1].map(i => (
                          <div key={i} className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded bg-[#0F9D8A]/20 flex-shrink-0" />
                            <div className="flex-1 h-1.5 bg-gray-100 rounded" />
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#5146E5] rounded-xl p-3 text-white">
                        <div className="h-2 bg-white/30 rounded w-16 mb-1.5" />
                        <div className="h-1.5 bg-white/20 rounded w-24 mb-3" />
                        <div className="h-5 bg-white/20 rounded-lg w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl border border-[#E5E7EB] shadow-lg p-3 hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] flex items-center justify-center">
                <Users size={14} className="text-[#5146E5]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#182230]">284 members</div>
                <div className="text-[10px] text-[#667085]">TechSpark NSU</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl border border-[#E5E7EB] shadow-lg p-3 hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E6F6F4] flex items-center justify-center">
                <CheckCircle size={14} className="text-[#0F9D8A]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#182230]">Verified club</div>
                <div className="text-[10px] text-[#667085]">Institution approved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-10 border-y border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[#667085] mb-6 font-medium">Built for campus communities that take connection seriously</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: Shield, label: 'Institution-verified roles' },
              { icon: Users, label: 'Multi-role platform' },
              { icon: Globe, label: 'Cross-campus discovery' },
              { icon: Heart, label: 'Privacy by design' },
              { icon: Zap, label: 'Real-time community' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[#667085]">
                <Icon size={16} className="text-[#5146E5]" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#182230] mb-4">Everything your campus community needs</h2>
            <p className="text-[#667085] text-lg max-w-2xl mx-auto">One platform for students, faculty, clubs, administrators and alumni. No scattered WhatsApp groups, no missed opportunities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                color: '#5146E5',
                bg: '#EEF0FD',
                title: 'Club & Society Management',
                desc: 'Full lifecycle management for student clubs — memberships, leadership roles, announcements, and events all in one place.',
              },
              {
                icon: Calendar,
                color: '#0F9D8A',
                bg: '#E6F6F4',
                title: 'Event Discovery & Registration',
                desc: 'Discover hackathons, cultural festivals, workshops and seminars. Register, get reminders, and track your campus calendar.',
              },
              {
                icon: Shield,
                color: '#14213D',
                bg: '#E2E8F0',
                title: 'Verified Roles & Profiles',
                desc: 'Institution-verified affiliation badges distinguish real student leaders and faculty advisers from unverified claims.',
              },
              {
                icon: MessageSquare,
                color: '#B7791F',
                bg: '#FEF3C7',
                title: 'Campus Community Feed',
                desc: 'A curated, role-aware campus feed with posts from students, clubs and faculty. Official announcements always clearly marked.',
              },
              {
                icon: TrendingUp,
                color: '#16803D',
                bg: '#DCFCE7',
                title: 'Alumni Network',
                desc: 'Stay connected with your institution long after graduation. Share career insights, discover reunions, and mentor the next generation.',
              },
              {
                icon: Bell,
                color: '#5146E5',
                bg: '#EEF0FD',
                title: 'Smart Notifications',
                desc: 'Stay informed on what matters to you — club updates, event reminders, membership decisions and verification status.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-[#F7F8FC] rounded-2xl p-6 border border-[#E5E7EB] hover:border-[#5146E5]/30 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="font-semibold text-[#182230] mb-2">{title}</h3>
                <p className="text-sm text-[#667085] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLUBS SECTION */}
      <section id="clubs" className="py-20 bg-[#F7F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EEF0FD] text-[#5146E5] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Users size={12} />
                Club Management
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#182230] mb-4">
                Your club, properly organized
              </h2>
              <p className="text-[#667085] leading-relaxed mb-6">
                From membership requests to leadership verification, club announcements to event organization — Koinelio gives student organizations everything they need to run professionally.
              </p>
              <ul className="space-y-3">
                {[
                  'Verified leadership roles attached to clubs',
                  'Membership request and approval flows',
                  'Club-specific announcements and posts',
                  'Faculty adviser oversight and verification',
                  'Club discovery for new students',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#667085]">
                    <CheckCircle size={16} className="text-[#0F9D8A] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/clubs" className="inline-flex items-center gap-2 mt-8 text-[#5146E5] font-semibold text-sm hover:gap-3 transition-all">
                See clubs in demo <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { name: 'TechSpark NSU', cat: 'Technology', members: 284, color: '#5146E5', verified: true },
                { name: 'Northstar Cultural Society', cat: 'Culture & Arts', members: 312, color: '#B7791F', verified: true },
                { name: 'RoboNSU', cat: 'Engineering', members: 92, color: '#0F9D8A', verified: true },
                { name: 'NSU Finance Club', cat: 'Finance', members: 134, color: '#5146E5', verified: true },
              ].map((club) => (
                <div key={club.name} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: club.color + '20' }}>
                    <div className="w-full h-full rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: club.color }}>{club.name[0]}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#182230] truncate">{club.name}</span>
                      {club.verified && <CheckCircle size={12} className="text-[#0F9D8A] flex-shrink-0" />}
                    </div>
                    <span className="text-xs text-[#667085]">{club.cat} · {club.members} members</span>
                  </div>
                  <ChevronRight size={16} className="text-[#667085]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section id="events" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#E6F6F4] text-[#0F9D8A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Calendar size={12} />
              Events & Festivals
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#182230] mb-4">Never miss a campus moment</h2>
            <p className="text-[#667085] max-w-xl mx-auto">From technical hackathons to cultural festivals, sports days to alumni reunions — discover and register for everything on your campus.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'HackNorthstar 2026',
                date: 'Nov 8–9, 2026',
                category: 'Technical',
                color: '#5146E5',
                spots: '82 spots left',
                img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
                featured: true,
              },
              {
                title: 'Cultural Fusion Festival',
                date: 'Nov 14–16, 2026',
                category: 'Cultural',
                color: '#B7791F',
                spots: 'Open registration',
                img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
                featured: true,
              },
              {
                title: 'Startup Pitch Night',
                date: 'Oct 30, 2026',
                category: 'Competition',
                color: '#16803D',
                spots: '52 spots left',
                img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop',
                featured: false,
              },
            ].map((event) => (
              <div key={event.title} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-lg transition-all group">
                <div className="h-40 overflow-hidden">
                  <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: event.color + '15', color: event.color }}>
                      {event.category}
                    </span>
                    {event.featured && (
                      <span className="text-xs font-semibold text-[#B7791F] bg-[#FEF3C7] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star size={10} />Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#182230] text-sm mb-1">{event.title}</h3>
                  <p className="text-xs text-[#667085] mb-3">{event.date}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#0F9D8A] font-medium">{event.spots}</span>
                    <Link href="/dashboard/events" className="text-xs font-semibold text-[#5146E5] hover:underline">View event →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-[#5146E5] font-semibold text-sm hover:gap-3 transition-all">
              See all events in demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* VERIFICATION */}
      <section className="py-20 bg-[#14213D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Shield size={12} />
                Trust & Verification
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Profiles you can trust</h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Koinelio distinguishes between different verification claims — institution affiliation, faculty designation, club membership, and leadership roles. Each claim has its own verification process, managed by authorized institution staff.
              </p>
              <div className="space-y-3">
                {[
                  { badge: 'Verified Student', color: '#0F9D8A', desc: 'Active enrolled student at the institution' },
                  { badge: 'Verified Faculty', color: '#5146E5', desc: 'Authorized faculty member or staff' },
                  { badge: 'Verified Club', color: '#B7791F', desc: 'Institution-approved student organization' },
                  { badge: 'Verified Role', color: '#16803D', desc: 'Leadership role approved by institution admin' },
                ].map(({ badge, color, desc }) => (
                  <div key={badge} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                      <CheckCircle size={12} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{badge}</div>
                      <div className="text-xs text-white/50">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="https://i.pravatar.cc/150?img=47" alt="Aisha" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-white">Aisha Nwosu</div>
                  <div className="text-xs text-white/50">Northstar University</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Institution affiliation', status: 'verified', color: '#0F9D8A' },
                  { label: 'Student status', status: 'verified', color: '#0F9D8A' },
                  { label: 'TechSpark President', status: 'verified', color: '#0F9D8A' },
                  { label: 'E-Cell Co-Lead', status: 'pending', color: '#B7791F' },
                ].map(({ label, status, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-xs text-white/70">{label}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ color, backgroundColor: color + '20' }}>
                      {status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/40">Verification managed by institution administrators. This is a demo profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ALUMNI */}
      <section id="alumni" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#EEF0FD] text-[#5146E5] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Award size={12} />
              Alumni
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#182230] mb-4">Stay connected. Give back.</h2>
            <p className="text-[#667085] max-w-xl mx-auto">Alumni remain part of the Koinelio community — discovering reunions, sharing career insights, and staying connected with their alma mater.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { name: 'Chioma Eze', year: '2022', dept: 'Computer Science', role: 'Sr. Engineer @ Stripe', avatar: 'https://i.pravatar.cc/150?img=43' },
              { name: 'Kwame Asante', year: '2020', dept: 'Electrical Engineering', role: 'CTO & Founder, VoltaGrid', avatar: 'https://i.pravatar.cc/150?img=16' },
              { name: 'Natasha Ivanova', year: '2021', dept: 'Business Administration', role: 'Investment Analyst, GS', avatar: 'https://i.pravatar.cc/150?img=41' },
            ].map((alumni) => (
              <div key={alumni.name} className="text-center bg-[#F7F8FC] rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all">
                <img src={alumni.avatar} alt={alumni.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-white shadow" />
                <div className="font-semibold text-[#182230] text-sm">{alumni.name}</div>
                <div className="text-xs text-[#5146E5] font-medium mb-1">NSU Class of {alumni.year}</div>
                <div className="text-xs text-[#667085] mb-2">{alumni.dept}</div>
                <div className="text-xs text-[#182230] font-medium bg-white rounded-lg px-2 py-1 border border-[#E5E7EB] inline-block">{alumni.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="py-20 bg-[#F7F8FC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield size={32} className="text-[#5146E5] mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-[#182230] mb-4">Privacy and trust, built in</h2>
          <p className="text-[#667085] leading-relaxed mb-8">
            Koinelio is designed with campus privacy in mind. You control who sees your profile, your activities and your connections. Cross-campus discovery respects your privacy settings. No personal contact details are shared without your explicit consent.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { title: 'You control your profile', desc: 'Choose what is visible to your institution, other campuses, or the public.' },
              { title: 'Verified, not assumed', desc: 'No one can claim a verified role without institution authorization.' },
              { title: 'Demo data is clearly labeled', desc: 'This prototype uses fictional data. Nothing here is real user information.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <CheckCircle size={16} className="text-[#0F9D8A] mb-2" />
                <div className="font-semibold text-sm text-[#182230] mb-1">{title}</div>
                <div className="text-xs text-[#667085] leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#5146E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Experience Koinelio
          </h2>
          <p className="text-white/75 text-lg mb-8">
            The prototype is ready. Explore the full platform with demo data — student, faculty, admin and alumni perspectives.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5146E5] font-semibold px-6 py-3.5 rounded-xl hover:bg-[#F7F8FC] transition-colors text-sm"
            >
              Enter Demo — Student View
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-medium px-6 py-3.5 rounded-xl border border-white/25 hover:bg-white/25 transition-colors text-sm"
            >
              Sign In / Create Account
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/50">
            ⓘ This is a prototype. All data is fictional. No real accounts, payments, or institutional verification exist.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#14213D] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#5146E5] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <circle cx="5" cy="9" r="2.5" fill="white" />
                    <circle cx="13" cy="5" r="2.5" fill="white" opacity="0.7" />
                    <circle cx="13" cy="13" r="2.5" fill="white" opacity="0.7" />
                    <line x1="7.2" y1="8" x2="11" y2="6" stroke="white" strokeWidth="1.2" />
                    <line x1="7.2" y1="10" x2="11" y2="12" stroke="white" strokeWidth="1.2" />
                  </svg>
                </div>
                <span className="font-bold text-lg">Koinelio</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">One campus. Every connection.</p>
              <p className="text-white/30 text-xs mt-2">Target launch: 1 January 2027</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Clubs', 'Events', 'Alumni', 'Administration'] },
              { title: 'Company', links: ['About', 'Contact', 'Institutional Onboarding', 'Careers'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-semibold text-sm mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-white/50 hover:text-white text-xs transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-xs">© 2026 Koinelio. Fictional prototype — not a live product.</p>
            <p className="text-white/20 text-xs">Inspired by the Greek word <em>koinos</em> — shared, common.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
