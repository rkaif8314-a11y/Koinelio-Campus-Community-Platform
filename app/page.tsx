'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';
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
            <Link href="/dashboard/campus" className="text-[#667085] hover:text-[#182230] text-sm font-medium transition-colors">IIT Bhilai guide</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/signin" className="text-sm font-medium text-[#667085] hover:text-[#182230] transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white bg-[#5146E5] hover:bg-[#4338CA] px-4 py-2 rounded-lg transition-colors"
            >
              Open interactive demo
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
            <Link href="/dashboard/campus" className="block text-[#667085] hover:text-[#182230] text-sm font-medium py-2">IIT Bhilai campus guide</Link>
            <div className="flex items-center justify-between pt-1 text-sm text-[#667085]">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/auth/signin" className="text-center text-sm font-medium text-[#667085] border border-[#E5E7EB] rounded-lg px-4 py-2.5">
                Sign in
              </Link>
              <Link href="/dashboard" className="text-center text-sm font-semibold text-white bg-[#5146E5] rounded-lg px-4 py-2.5">
                Open interactive demo
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
              Independent prototype · IIT Bhilai public-source demo
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#182230] leading-tight tracking-tight mb-6">
              Your campus.{' '}
              <span className="text-[#5146E5]">Your community.</span>{' '}
              Your connections.
            </h1>
            <p className="text-lg text-[#667085] leading-relaxed mb-5 max-w-2xl mx-auto">
              Explore a source-linked IIT Bhilai campus guide and preview how student communities, clubs, events, and alumni connections could work in one place.
            </p>
            <p className="mx-auto mb-8 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs leading-5 text-amber-900">
              <strong>Demo only:</strong> Koinelio is independently built and is not endorsed or operated by IIT Bhilai. Sample people, club counts, posts, registrations, and demo events are fictional. Official facts link to public sources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-[#5146E5] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#4338CA] transition-colors text-sm"
              >
                Open interactive demo
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
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-[#182230]">Good morning, Maya <span aria-hidden="true">👋</span></p>
                      <p className="text-[10px] sm:text-xs text-[#667085] mt-0.5">Your campus is buzzing today.</p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#5146E5] px-3 py-2 text-[10px] font-semibold text-white">
                      <span aria-hidden="true">＋</span> Share an update
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                    {[
                      { label: 'Connections', value: '24 new', icon: Users, tint: 'bg-[#EEF0FD]', color: 'text-[#5146E5]' },
                      { label: 'Campus events', value: '08 soon', icon: Calendar, tint: 'bg-[#E6F6F4]', color: 'text-[#0F9D8A]' },
                      { label: 'Achievements', value: '12 shared', icon: Award, tint: 'bg-[#FEF3C7]', color: 'text-[#B7791F]' },
                    ].map(({ label, value, icon: Icon, tint, color }) => (
                      <div key={label} className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white p-2 sm:p-3">
                        <div className={`hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint} ${color}`}>
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[9px] sm:text-[10px] text-[#667085]">{label}</p>
                          <p className="truncate text-[10px] sm:text-xs font-bold text-[#182230]">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    <div className="col-span-3 rounded-xl border border-[#E5E7EB] bg-white p-2.5 sm:p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] sm:text-xs font-bold text-[#182230]">From your community</p>
                        <span className="inline-flex items-center gap-1 text-[9px] text-[#0F9D8A]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" /> Live
                        </span>
                      </div>
                      {[
                        { name: 'Aarav Mehta', initials: 'AM', time: '12 min', text: 'Our robotics team is looking for curious minds. Join our build night!', likes: '18', avatar: 'bg-gradient-to-br from-[#818CF8] to-[#5146E5]' },
                        { name: 'Sofia Khan', initials: 'SK', time: '34 min', text: 'Sharing a few moments from yesterday’s culture night 💛', likes: '32', avatar: 'bg-gradient-to-br from-[#F9A8D4] to-[#D946EF]' },
                        { name: 'Rohan Das', initials: 'RD', time: '1 hr', text: 'Study group for signals and systems this evening. Everyone is welcome.', likes: '11', avatar: 'bg-gradient-to-br from-[#5EEAD4] to-[#0F9D8A]' },
                      ].map((person) => (
                        <div key={person.name} className="flex gap-2 border-t border-[#E5E7EB] py-2 first:border-0">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${person.avatar}`}>
                            {person.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5">
                              <p className="truncate text-[9px] sm:text-[10px] font-bold text-[#182230]">{person.name}</p>
                              <span className="shrink-0 text-[8px] text-[#667085]">{person.time}</span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed text-[#667085]">{person.text}</p>
                            <div className="mt-1 flex items-center gap-1 text-[8px] text-[#5146E5]">
                              <Heart size={9} /> {person.likes} appreciations
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <div className="rounded-xl border border-[#E5E7EB] bg-white p-2.5 sm:p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Calendar size={12} className="text-[#5146E5]" />
                          <p className="text-[10px] sm:text-xs font-bold text-[#182230]">Campus moments</p>
                        </div>
                        <div className="mb-2 rounded-lg bg-[#EEF0FD] p-2">
                          <p className="text-[9px] font-bold text-[#5146E5]">TODAY · 4:30 PM</p>
                          <p className="mt-0.5 text-[9px] font-semibold text-[#182230]">Tech meetup</p>
                          <p className="text-[8px] text-[#667085]">Innovation lab</p>
                        </div>
                        <div className="rounded-lg bg-[#E6F6F4] p-2">
                          <p className="text-[9px] font-bold text-[#0F766E]">TOMORROW</p>
                          <p className="mt-0.5 text-[9px] font-semibold text-[#182230]">Design jam</p>
                          <p className="text-[8px] text-[#667085]">Bring your ideas</p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-[#5146E5] to-[#6557E8] p-2.5 sm:p-3 text-white">
                        <p className="text-[10px] sm:text-xs font-bold">Better together ✨</p>
                        <p className="mt-1 text-[9px] leading-relaxed text-white/85">Meet people who share your interests.</p>
                        <div className="mt-2 flex items-center">
                          {[
                            ['MA', 'bg-[#F9A8D4]'],
                            ['RK', 'bg-[#5EEAD4]'],
                            ['SK', 'bg-[#FCD34D]'],
                            ['+', 'bg-white/25'],
                          ].map(([initials, avatar], index) => (
                            <span key={initials} className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#5C50E7] text-[8px] font-bold ${avatar} ${index === 3 ? 'text-white' : 'text-[#191B4D]'} ${index > 0 ? '-ml-1.5' : ''}`}>
                              {initials}
                            </span>
                          ))}
                        </div>
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
                <div className="text-xs font-semibold text-[#182230]">Sample members</div>
                <div className="text-[10px] text-[#667085]">Ingenuity — Competitive Programming Club</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl border border-[#E5E7EB] shadow-lg p-3 hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E6F6F4] flex items-center justify-center">
                <CheckCircle size={14} className="text-[#0F9D8A]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#182230]">Sample club profile</div>
                <div className="text-[10px] text-[#667085]">Not institute-verified</div>
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
                title: 'Demo role statuss & Profiles',
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
                { name: 'Ingenuity — Competitive Programming Club', cat: 'Sci-Tech', members: 'Sample roster', color: '#5146E5', verified: false },
                { name: 'DSAI Club', cat: 'Data Science & AI', members: 'Sample roster', color: '#0F9D8A', verified: false },
                { name: 'DesignX', cat: 'Cultural', members: 'Sample roster', color: '#B7791F', verified: false },
                { name: 'Space Exploration Society', cat: 'Sci-Tech', members: 'Sample roster', color: '#5146E5', verified: false },
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
                    <span className="text-xs text-[#667085]">{club.cat} · {club.members}</span>
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
              Sample events · not official
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#182230] mb-4">Never miss a campus moment</h2>
            <p className="text-[#667085] max-w-xl mx-auto">These cards demonstrate the event interface only. Dates, venues, registrations and event details are fictional; see the Campus Guide for official source links.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Demo · Beginner Coding Jam',
                date: 'Sample date · Oct 25, 2026',
                category: 'Technical demo',
                color: '#5146E5',
                spots: 'Sample registration',
                img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
                featured: true,
              },
              {
                title: 'Demo · Student Design Showcase',
                date: 'Sample date · Nov 4, 2026',
                category: 'Cultural demo',
                color: '#B7791F',
                spots: 'Sample registration',
                img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
                featured: true,
              },
              {
                title: 'Demo · Student Project Pitch Circle',
                date: 'Sample date · Dec 5, 2026',
                category: 'Project demo',
                color: '#16803D',
                spots: 'Sample registration',
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
                Verification workflow preview
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Verification should be explicit</h2>
              <p className="text-white/70 leading-relaxed mb-6">
                This section previews how affiliation, faculty, club, and leadership claims could be reviewed. No identity or role shown in this demo is verified. A real institutional rollout needs approved administrators, scoped permissions, and an auditable review process.
              </p>
              <div className="space-y-3">
                {[
                  { badge: 'Demo student status', color: '#0F9D8A', desc: 'Real affiliation would require institutional review' },
                  { badge: 'Demo faculty status', color: '#5146E5', desc: 'No real faculty identity is represented' },
                  { badge: 'Demo club status', color: '#B7791F', desc: 'Club name is source-linked; Koinelio listing is not verified' },
                  { badge: 'Demo role status', color: '#16803D', desc: 'No role in this prototype is institution-verified' },
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
                  <div className="font-semibold text-white">Aisha Verma</div>
                  <div className="text-xs text-white/50">IIT Bhilai</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Institution affiliation', status: 'demo', color: '#64748B' },
                  { label: 'Student status', status: 'demo', color: '#64748B' },
                  { label: 'Demo club coordinator', status: 'demo', color: '#64748B' },
                  { label: 'Sample role request', status: 'demo', color: '#64748B' },
                ].map(({ label, status, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-xs text-white/70">{label}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ color, backgroundColor: color + '20' }}>
                      {status === 'verified' ? '✓ Verified' : status === 'pending' ? '⏳ Pending' : 'Demo only'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/40">Future verification would require authorised institution roles. This is a fictional demo profile.</p>
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
              { name: 'Riya Sen', year: '2022', dept: 'Computer Science and Engineering', role: 'Sample alumni persona', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=al1' },
              { name: 'Vikram Anand', year: '2021', dept: 'Electrical Engineering', role: 'Sample alumni persona', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=al2' },
              { name: 'Ira Thomas', year: '2022', dept: 'Data Science and Artificial Intelligence', role: 'Sample alumni persona', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=al3' },
            ].map((alumni) => (
              <div key={alumni.name} className="text-center bg-[#F7F8FC] rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all">
                <img src={alumni.avatar} alt={alumni.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-white shadow" />
                <div className="font-semibold text-[#182230] text-sm">{alumni.name}</div>
                <div className="text-xs text-[#5146E5] font-medium mb-1">IIT Bhilai demo persona · class of {alumni.year}</div>
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
          <h2 className="text-2xl md:text-3xl font-bold text-[#182230] mb-4">Privacy controls are a design goal</h2>
          <p className="text-[#667085] leading-relaxed mb-8">
            These are intended product principles shown in a prototype, not a claim that all production privacy controls are live. The current dashboard uses fictional profiles and local demo interactions. Production access control, institution verification and privacy enforcement must be implemented and tested before a real pilot.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { title: 'Profile settings preview', desc: 'Preview how audience and profile visibility settings might appear.' },
              { title: 'Verification is not assumed', desc: 'Real verification would require an approved institution role and an auditable review.' },
              { title: 'Demo data is clearly labeled', desc: 'Sample profiles, posts, member counts and demo events are fictional.' },
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
            Explore the interactive prototype from student, faculty, admin, and alumni perspectives. All profile and community activity is sample data.
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
            ⓘ Supabase authentication is connected, while most dashboard activity is local demo state. This is not an official IIT Bhilai service; sample profiles, memberships, counts, and events are fictional.
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
