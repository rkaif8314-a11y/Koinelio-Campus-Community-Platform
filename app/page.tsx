'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  LockKeyhole,
  Menu,
  MessageCircle,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import KoinelioLogoMark from '@/components/koinelio-logo-mark';
import ThemeToggle from '@/components/theme-toggle';

const features = [
  {
    icon: UserRoundIcon,
    eyebrow: 'YOUR SPACE',
    title: 'A profile that feels like you',
    body: 'Bring your interests, academic journey, projects and skills together in one profile you can keep up to date.',
    accent: 'terracotta',
  },
  {
    icon: Newspaper,
    eyebrow: 'WHAT IS HAPPENING',
    title: 'A campus feed with a purpose',
    body: 'Share discussions, questions, projects, achievements and opportunities—with photo, GIF and video support.',
    accent: 'forest',
  },
  {
    icon: Users,
    eyebrow: 'FIND YOUR PEOPLE',
    title: 'Clubs with real membership',
    body: 'Discover approved communities. Join requests, invitations and Core Member promotions follow explicit approval.',
    accent: 'gold',
  },
  {
    icon: MessageCircle,
    eyebrow: 'THE RIGHT ROOM',
    title: 'Conversations with boundaries',
    body: 'General, Members and Core Team rooms keep club discussion aligned to each member’s permissions.',
    accent: 'plum',
  },
  {
    icon: CalendarDays,
    eyebrow: 'MAKE IT HAPPEN',
    title: 'Events that stay connected',
    body: 'Discover published events and register with your own account. Organizers manage events through their assigned roles.',
    accent: 'sky',
  },
  {
    icon: GraduationCap,
    eyebrow: 'BEYOND YOUR BATCH',
    title: 'Meet alumni and graduates',
    body: 'Explore profiles that people have chosen to share and connect through skills, interests and academic journeys.',
    accent: 'rose',
  },
];

function UserRoundIcon({ size = 24, className }: { size?: number; className?: string }) {
  return <span className={className}><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-4 3.2-6 7.5-6s6.7 2 7.5 6"/></svg></span>;
}

const accentStyles: Record<string, { icon: string; label: string }> = {
  terracotta: { icon: 'bg-[#FBE8E1] text-[#A94832]', label: 'text-[#A94832]' },
  forest: { icon: 'bg-[#DDEEE7] text-[#173D36]', label: 'text-[#173D36]' },
  gold: { icon: 'bg-[#F8EDCF] text-[#8A6116]', label: 'text-[#8A6116]' },
  plum: { icon: 'bg-[#EAE3F3] text-[#654B7C]', label: 'text-[#654B7C]' },
  sky: { icon: 'bg-[#E2EFF0] text-[#3B7174]', label: 'text-[#3B7174]' },
  rose: { icon: 'bg-[#F7E2E4] text-[#9F4651]', label: 'text-[#9F4651]' },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="landing-page min-h-screen bg-[#FBF8F2] font-sans text-[#26312E]">
      <nav className="landing-nav sticky top-0 z-50 border-b border-[#E7E0D6] bg-[#FBF8F2]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <KoinelioLogoMark size={36}/>
            <span className="landing-brand-name text-xl font-bold tracking-tight text-[#173D36]">Koinelio</span>
          </Link>

          <div className="hidden items-center gap-7 xl:flex">
            <a href="#why-koinelio" className="text-sm font-medium text-[#5B6560] transition hover:text-[#173D36]">Why Koinelio</a>
            <a href="#communities" className="text-sm font-medium text-[#5B6560] transition hover:text-[#173D36]">Communities</a>
            <Link href="/dashboard/community" className="text-sm font-medium text-[#5B6560] transition hover:text-[#173D36]">Campus Feed</Link>
            <Link href="/dashboard/alumni" className="text-sm font-medium text-[#5B6560] transition hover:text-[#173D36]">Alumni</Link>
            <Link href="/dashboard/campus" className="text-sm font-medium text-[#5B6560] transition hover:text-[#173D36]">Campus Guide</Link>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <ThemeToggle/>
            <Link href="/auth/signin" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#46534D] transition hover:bg-[#F1EBE0]">Sign in</Link>
            <Link href="/auth/signup" className="landing-primary-link inline-flex items-center gap-2 rounded-xl bg-[#C65D43] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#A94832]">Join Koinelio <ArrowRight size={15}/></Link>
          </div>

          <button type="button" onClick={() => setMobileMenuOpen((value) => !value)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} className="rounded-xl border border-[#E7E0D6] p-2.5 text-[#34443C] hover:bg-white xl:hidden">{mobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
        {mobileMenuOpen && <div className="border-t border-[#E7E0D6] bg-[#FBF8F2] px-4 py-4 xl:hidden">
          <div className="space-y-1">
            <a href="#why-koinelio" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#46534D] hover:bg-white">Why Koinelio</a>
            <a href="#communities" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#46534D] hover:bg-white">Communities</a>
            <Link href="/dashboard/community" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#46534D] hover:bg-white">Campus Feed</Link>
            <Link href="/dashboard/alumni" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#46534D] hover:bg-white">Alumni</Link>
            <Link href="/dashboard/campus" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#46534D] hover:bg-white">Campus Guide</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E7E0D6] pt-3"><Link href="/auth/signin" className="rounded-xl border border-[#D9D0C4] px-3 py-2.5 text-center text-sm font-semibold text-[#34443C]">Sign in</Link><Link href="/auth/signup" className="rounded-xl bg-[#C65D43] px-3 py-2.5 text-center text-sm font-semibold text-white">Join Koinelio</Link></div>
          <div className="mt-3 flex justify-end"><ThemeToggle/></div>
        </div>}
      </nav>

      <section className="landing-hero relative overflow-hidden bg-[#F6F0E5]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-[#E6C7A9]/35 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-32 left-[28%] h-[350px] w-[350px] rounded-full bg-[#C6E1D4]/60 blur-3xl"/>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:px-8 lg:py-24">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DBD0BE] bg-[#FBF8F2]/80 px-3.5 py-2 text-xs font-semibold text-[#46534D] shadow-sm"><span className="h-2 w-2 rounded-full bg-[#C65D43]"/>Built for campus life · IIT Bhilai email-restricted pilot</div>
            <p className="landing-hero-prefix text-sm font-semibold uppercase tracking-[0.19em] text-[#A94832]">Your campus, closer</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight text-[#173D36] sm:text-5xl lg:text-[4.2rem]">Not just another platform. <span className="text-[#C65D43]">Your campus, connected.</span></h1>
            <p className="landing-hero-description mt-6 max-w-2xl text-base leading-8 text-[#59635D] sm:text-lg">Find people who share your interests, build real communities, hear about campus opportunities, and keep every club conversation in the right place.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signup" className="landing-primary-link inline-flex items-center justify-center gap-2 rounded-xl bg-[#C65D43] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(198,93,67,0.18)] transition hover:bg-[#A94832]">Create your account <ArrowRight size={16}/></Link>
              <Link href="/dashboard/campus" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CFC5B5] bg-[#FBF8F2]/80 px-6 py-3.5 text-sm font-semibold text-[#34443C] transition hover:bg-white">Explore the Campus Guide <BookOpen size={16}/></Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-medium text-[#626C66]">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#267354]"/>Profiles that persist</span>
              <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} className="text-[#A94832]"/>Role-based communities</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-[#94701E]"/>Feed for more than announcements</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#D9BDA6]/50 via-[#D4E5DB]/70 to-[#E6D8B6]/45 blur-xl"/>
            <div className="relative overflow-hidden rounded-[1.65rem] border border-[#DAD1C4] bg-white shadow-[0_26px_80px_rgba(55,64,53,0.13)]">
              <div className="flex items-center justify-between border-b border-[#ECE6DE] bg-[#FFFCF7] px-4 py-3.5">
                <div className="flex items-center gap-2.5"><KoinelioLogoMark size={25}/><span className="text-sm font-bold text-[#173D36]">Koinelio</span></div>
                <span className="rounded-full bg-[#DDEEE7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#235845]">Campus space</span>
              </div>
              <div className="grid gap-0 sm:grid-cols-[118px_minmax(0,1fr)]">
                <div className="hidden flex-col gap-1.5 bg-[#173D36] p-3.5 sm:flex">
                  <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Workspace</p>
                  {[
                    ['Campus Feed', Newspaper],
                    ['Discover', Compass],
                    ['Clubs', Users],
                    ['Events', CalendarDays],
                    ['Alumni', GraduationCap],
                  ].map(([label, Icon], index) => {
                    const NavIcon = Icon as typeof Newspaper;
                    return <div key={label as string} className={'flex items-center gap-2 rounded-lg px-2 py-2.5 text-[10px] font-semibold ' + (index === 0 ? 'bg-[#F7F0E4] text-[#173D36]' : 'text-white/65')}><NavIcon size={14}/><span>{label as string}</span></div>;
                  })}
                  <div className="mt-auto rounded-xl border border-white/15 bg-white/5 p-2.5"><p className="text-[9px] text-white/50">Access</p><p className="mt-1 text-[10px] font-semibold text-white">Confirmed email</p><p className="mt-1 text-[9px] leading-4 text-white/55">Roles remain separately controlled.</p></div>
                </div>
                <div className="min-w-0 bg-[#FFFCF7] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#A94832]">Made for your campus</p><h2 className="mt-1.5 text-lg font-bold tracking-tight text-[#173D36]">More ways to connect</h2></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8EDCF] text-[#8A6116]"><HeartHandshake size={18}/></div></div>
                  <p className="mt-2 text-[11px] leading-5 text-[#6C746E]">A look at the spaces Koinelio brings together. Your signed-in content comes from your account and database permissions.</p>
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-3 rounded-xl border border-[#E9E0D5] bg-white p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBE8E1] text-[#A94832]"><Newspaper size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[#27352F]">Campus Feed</p><p className="mt-0.5 text-[10px] text-[#717A73]">Discussions · Projects · Opportunities</p></div><ArrowRight size={14} className="text-[#B1A79A]"/></div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#E9E0D5] bg-white p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DDEEE7] text-[#235845]"><Users size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[#27352F]">Club communities</p><p className="mt-0.5 text-[10px] text-[#717A73]">Join requests · Member roles · Core team</p></div><ArrowRight size={14} className="text-[#B1A79A]"/></div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#E9E0D5] bg-white p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAE3F3] text-[#654B7C]"><MessageCircle size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[#27352F]">Purposeful conversations</p><p className="mt-0.5 text-[10px] text-[#717A73]">General · Members · Core Team rooms</p></div><ArrowRight size={14} className="text-[#B1A79A]"/></div>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#D9E8DE] bg-[#EEF5EF] px-3.5 py-3"><p className="flex items-center gap-1.5 text-[10px] font-bold text-[#235845]"><ShieldCheck size={13}/>Access has real boundaries</p><p className="mt-1 text-[10px] leading-4 text-[#4F6D5A]">Email confirmation, club approval and leadership roles are separate checks—not decorative labels.</p></div>
                </div>
              </div>
            </div>
            <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-[#74796F]"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#267354]"/>An interface preview—not live member activity</span><Link href="/dashboard/community" className="inline-flex items-center gap-1 font-bold text-[#A94832] hover:underline">See the campus feed <ArrowDownRight size={14}/></Link></div>
          </div>
        </div>
      </section>

      <section id="why-koinelio" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A94832]">A campus should feel connected</p><h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#173D36] sm:text-4xl">The right people, spaces and opportunities—closer together.</h2></div>
          <p className="max-w-2xl text-sm leading-7 text-[#667069] sm:text-base">Koinelio brings everyday campus activity into one place: the conversation in the feed, the club you want to join, the event you want to attend, and the graduate you hope to learn from.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, eyebrow, title, body, accent }) => {
            const colors = accentStyles[accent];
            return <article key={title} className="group rounded-2xl border border-[#E5DDD1] bg-white p-5 shadow-[0_2px_10px_rgba(60,52,37,0.025)] transition duration-200 hover:-translate-y-1 hover:border-[#CBBCA9] hover:shadow-[0_14px_32px_rgba(60,52,37,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-4"><div className={'flex h-11 w-11 items-center justify-center rounded-xl ' + colors.icon}><Icon size={21}/></div><span className={'pt-1 text-[9px] font-bold tracking-[0.15em] ' + colors.label}>{eyebrow}</span></div>
              <h3 className="mt-5 text-lg font-bold leading-snug text-[#27352F]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6C746E]">{body}</p>
            </article>;
          })}
        </div>
      </section>

      <section id="communities" className="border-y border-[#DFE3DA] bg-[#EAF1E9]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)] lg:items-center lg:px-8 lg:py-20">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A94832]">Better communities, not more noise</p><h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#173D36] sm:text-4xl">Joining is a process. Belonging is the goal.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[#56685D] sm:text-base">Membership, leadership and room access have clear boundaries. A request stays pending until a coordinator reviews it. A selected invitee must accept before their membership becomes active.</p><Link href="/dashboard/clubs" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173D36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2F29]">Explore clubs <ArrowRight size={15}/></Link></div>
          <div className="space-y-3">
            {[
              { n: '01', title: 'General', body: 'A shared room for confirmed institute-email accounts in an approved club.', icon: Users, color: 'bg-white text-[#C65D43]' },
              { n: '02', title: 'Members', body: 'For active members, Core Members and the Coordinator.', icon: MessageCircle, color: 'bg-white text-[#235845]' },
              { n: '03', title: 'Core Team', body: 'A private workspace for Core Members and the Coordinator.', icon: ShieldCheck, color: 'bg-white text-[#654B7C]' },
            ].map((room) => <div key={room.n} className="flex items-start gap-4 rounded-2xl border border-[#D8E1D6] bg-white/90 p-4 sm:p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F0E7]"><room.icon size={20} className={room.color.split(' ').pop()}/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[10px] font-bold tracking-wide text-[#A94832]">{room.n}</span><h3 className="text-sm font-bold text-[#27352F]">{room.title}</h3></div><p className="mt-1 text-xs leading-5 text-[#667069]">{room.body}</p></div><LockKeyhole size={14} className="mt-1 shrink-0 text-[#8C958C]"/></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[1.8rem] bg-[#173D36] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-white/5"/>
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EBCF8B]">Start with your own account</p><h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Your campus story belongs here.</h2><p className="mt-3 text-sm leading-7 text-white/75">Create an account with your IIT Bhilai institute email, confirm mailbox ownership, and complete your profile after signing in.</p></div>
            <Link href="/auth/signup" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#F1C66D] px-5 py-3.5 text-sm font-bold text-[#392F1D] transition hover:bg-[#F7D88F]">Get started <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#142D28] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5"><KoinelioLogoMark size={34}/><span className="text-xl font-bold tracking-tight">Koinelio</span></Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">One campus. Every connection. A more thoughtful home for campus profiles, communities, conversations and opportunities.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-semibold text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-[#EBCF8B]"/>Independent campus pilot</div>
          </div>
          <div><h3 className="text-sm font-bold text-white">Explore</h3><div className="mt-4 space-y-3 text-sm text-white/65"><Link href="/dashboard/community" className="block transition hover:text-white">Campus Feed</Link><Link href="/dashboard/alumni" className="block transition hover:text-white">Alumni & graduates</Link><Link href="/dashboard/clubs" className="block transition hover:text-white">Clubs & membership</Link><Link href="/dashboard/events" className="block transition hover:text-white">Events</Link><Link href="/dashboard/campus" className="block transition hover:text-white">Campus Guide</Link></div></div>
          <div><h3 className="text-sm font-bold text-white">Your account</h3><div className="mt-4 space-y-3 text-sm text-white/65"><Link href="/auth/signup" className="block transition hover:text-white">Create an account</Link><Link href="/auth/signin" className="block transition hover:text-white">Sign in</Link><Link href="/auth/forgot-password" className="block transition hover:text-white">Reset password</Link><Link href="/dashboard/profile" className="block transition hover:text-white">Manage profile</Link><Link href="/dashboard/settings" className="block transition hover:text-white">Privacy & settings</Link></div></div>
          <div><h3 className="text-sm font-bold text-white">Trust & safety</h3><div className="mt-4 space-y-3 text-sm text-white/65"><span className="block">Confirmed campus email required</span><span className="block">Membership follows approval</span><span className="block">Room access follows role</span><span className="block">No LDAP password collection</span><Link href="/dashboard/help" className="block transition hover:text-white">Help & support</Link></div></div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-[11px] leading-5 text-white/45 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8"><p className="max-w-3xl">Koinelio is independently operated unless formally authorized by IIT Bhilai. An institute email confirms mailbox access, not current enrolment or official endorsement. Do not enter your institute/LDAP password.</p><span className="shrink-0">Koinelio · Built for campus connection</span></div>
        </div>
      </footer>
    </main>
  );
}
