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
    body: 'Keep your interests, academic journey, projects and skills in one profile.',
    accent: 'terracotta',
  },
  {
    icon: Newspaper,
    eyebrow: 'WHAT IS HAPPENING',
    title: 'A campus feed with a purpose',
    body: 'Share questions, projects, achievements and opportunities. Add photos, GIFs and videos.',
    accent: 'forest',
  },
  {
    icon: Users,
    eyebrow: 'FIND YOUR PEOPLE',
    title: 'Clubs with real membership',
    body: 'Discover approved clubs. Join requests, invitations and Core Member roles follow a clear approval process.',
    accent: 'gold',
  },
  {
    icon: MessageCircle,
    eyebrow: 'THE RIGHT ROOM',
    title: 'Conversations with boundaries',
    body: 'General, Members and Core Team rooms match each member’s access.',
    accent: 'plum',
  },
  {
    icon: CalendarDays,
    eyebrow: 'MAKE IT HAPPEN',
    title: 'Events that stay connected',
    body: 'Browse published events and register with your account. Organizers manage events through assigned roles.',
    accent: 'sky',
  },
  {
    icon: GraduationCap,
    eyebrow: 'BEYOND YOUR BATCH',
    title: 'Meet alumni and graduates',
    body: 'Explore shared profiles. Connect through skills, interests and academic journeys.',
    accent: 'rose',
  },
];

function UserRoundIcon({ size = 24, className }: { size?: number; className?: string }) {
  return <span className={className}><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-4 3.2-6 7.5-6s6.7 2 7.5 6"/></svg></span>;
}

const accentStyles: Record<string, { icon: string; label: string }> = {
  terracotta: { icon: 'bg-[var(--k-accent-light)] text-[var(--k-accent-dark)]', label: 'text-[var(--k-accent)]' },
  forest: { icon: 'bg-[var(--k-accent-light)] text-[var(--k-accent-dark)]', label: 'text-[var(--k-accent)]' },
  gold: { icon: 'bg-[var(--k-accent-light)] text-[var(--k-accent-dark)]', label: 'text-[var(--k-accent)]' },
  plum: { icon: 'bg-[var(--k-accent-light)] text-[var(--k-accent-dark)]', label: 'text-[var(--k-accent)]' },
  sky: { icon: 'bg-[var(--k-accent-light)] text-[var(--k-accent-dark)]', label: 'text-[var(--k-accent)]' },
  rose: { icon: 'bg-[var(--k-accent-light)] text-[var(--k-accent-dark)]', label: 'text-[var(--k-accent)]' },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="landing-page min-h-screen bg-[var(--k-bg)] font-sans text-[var(--k-ink)]">
      <nav className="landing-nav sticky top-0 z-50 border-b border-[var(--k-border)] bg-[var(--k-bg)] backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <KoinelioLogoMark size={36}/>
            <span className="landing-brand-name text-xl font-bold tracking-tight text-[var(--k-ink)]">Koinelio</span>
          </Link>

          <div className="hidden items-center gap-7 xl:flex">
            <a href="#why-koinelio" className="text-sm font-medium text-[var(--k-ink-soft)] transition hover:text-[var(--k-ink)]">Why Koinelio</a>
            <a href="#communities" className="text-sm font-medium text-[var(--k-ink-soft)] transition hover:text-[var(--k-ink)]">Communities</a>
            <Link href="/dashboard/community" className="text-sm font-medium text-[var(--k-ink-soft)] transition hover:text-[var(--k-ink)]">Campus Feed</Link>
            <Link href="/dashboard/alumni" className="text-sm font-medium text-[var(--k-ink-soft)] transition hover:text-[var(--k-ink)]">Alumni</Link>
            <Link href="/dashboard/campus" className="text-sm font-medium text-[var(--k-ink-soft)] transition hover:text-[var(--k-ink)]">Campus Guide</Link>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <ThemeToggle/>
            <Link href="/auth/signin" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--k-ink-soft)] transition hover:bg-[var(--k-surface-hover)]">Sign in</Link>
            <Link href="/auth/signup" className="landing-primary-link inline-flex items-center gap-2 rounded-xl bg-[var(--k-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--k-on-accent)] shadow-sm transition hover:bg-[var(--k-accent-hover)]">Join Koinelio <ArrowRight size={15}/></Link>
          </div>

          <button type="button" onClick={() => setMobileMenuOpen((value) => !value)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} className="rounded-xl border border-[var(--k-border)] p-2.5 text-[var(--k-ink)] hover:bg-[var(--k-surface)] xl:hidden">{mobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
        {mobileMenuOpen && <div className="border-t border-[var(--k-border)] bg-[var(--k-bg)] px-4 py-4 xl:hidden">
          <div className="space-y-1">
            <a href="#why-koinelio" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--k-ink-soft)] hover:bg-[var(--k-surface)]">Why Koinelio</a>
            <a href="#communities" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--k-ink-soft)] hover:bg-[var(--k-surface)]">Communities</a>
            <Link href="/dashboard/community" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--k-ink-soft)] hover:bg-[var(--k-surface)]">Campus Feed</Link>
            <Link href="/dashboard/alumni" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--k-ink-soft)] hover:bg-[var(--k-surface)]">Alumni</Link>
            <Link href="/dashboard/campus" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--k-ink-soft)] hover:bg-[var(--k-surface)]">Campus Guide</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--k-border)] pt-3"><Link href="/auth/signin" className="rounded-xl border border-[var(--k-border)] px-3 py-2.5 text-center text-sm font-semibold text-[var(--k-ink)]">Sign in</Link><Link href="/auth/signup" className="rounded-xl bg-[var(--k-accent)] px-3 py-2.5 text-center text-sm font-semibold text-[var(--k-on-accent)]">Join Koinelio</Link></div>
          <div className="mt-3 flex justify-end"><ThemeToggle/></div>
        </div>}
      </nav>

      <section className="landing-hero relative overflow-hidden bg-[var(--k-surface-muted)]">
        
        
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:px-8 lg:py-24">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--k-border)] bg-[var(--k-bg)] px-3.5 py-2 text-xs font-semibold text-[var(--k-ink-soft)] shadow-sm"><span className="h-2 w-2 rounded-full bg-[var(--k-accent)]"/>Built for campus life · IIT Bhilai email-restricted pilot</div>
            <p className="landing-hero-prefix text-sm font-semibold uppercase tracking-[0.19em] text-[var(--k-accent)]">Your campus, closer</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight text-[var(--k-ink)] sm:text-5xl lg:text-[4.2rem]">Not just another platform. <span className="text-[var(--k-accent)]">Your campus, connected.</span></h1>
            <p className="landing-hero-description mt-6 max-w-2xl text-base leading-8 text-[var(--k-ink-soft)] sm:text-lg">Find people with similar interests. Build communities. Discover campus opportunities. Keep club conversations in the right rooms.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signup" className="landing-primary-link inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--k-accent)] px-6 py-3.5 text-sm font-semibold text-[var(--k-on-accent)] shadow-sm transition hover:bg-[var(--k-accent-hover)]">Create your account <ArrowRight size={16}/></Link>
              <Link href="/dashboard/campus" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-bg)] px-6 py-3.5 text-sm font-semibold text-[var(--k-ink)] transition hover:bg-[var(--k-surface)]">Explore the Campus Guide <BookOpen size={16}/></Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-medium text-[var(--k-muted)]">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[var(--k-accent)]"/>Profiles that persist</span>
              <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} className="text-[var(--k-accent)]"/>Role-based communities</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-[var(--k-accent)]"/>Feed for more than announcements</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            
            <div className="relative overflow-hidden rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] shadow-[0_26px_80px_rgba(55,64,53,0.13)]">
              <div className="flex items-center justify-between border-b border-[var(--k-border-soft)] bg-[var(--k-surface)] px-4 py-3.5">
                <div className="flex items-center gap-2.5"><KoinelioLogoMark size={25}/><span className="text-sm font-bold text-[var(--k-ink)]">Koinelio</span></div>
                <span className="rounded-full bg-[var(--k-accent-light)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--k-accent-dark)]">Campus space</span>
              </div>
              <div className="grid gap-0 sm:grid-cols-[118px_minmax(0,1fr)]">
                <div className="hidden flex-col gap-1.5 bg-[#202a25] p-3.5 sm:flex">
                  <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Workspace</p>
                  {[
                    ['Campus Feed', Newspaper],
                    ['Discover', Compass],
                    ['Clubs', Users],
                    ['Events', CalendarDays],
                    ['Alumni', GraduationCap],
                  ].map(([label, Icon], index) => {
                    const NavIcon = Icon as typeof Newspaper;
                    return <div key={label as string} className={'flex items-center gap-2 rounded-lg px-2 py-2.5 text-[10px] font-semibold ' + (index === 0 ? 'bg-[var(--k-accent-light)] text-[var(--k-ink)]' : 'text-white/65')}><NavIcon size={14}/><span>{label as string}</span></div>;
                  })}
                  <div className="mt-auto rounded-xl border border-white/15 bg-white/5 p-2.5"><p className="text-[9px] text-white/50">Access</p><p className="mt-1 text-[10px] font-semibold text-white">Confirmed email</p><p className="mt-1 text-[9px] leading-4 text-white/55">Roles remain separately controlled.</p></div>
                </div>
                <div className="min-w-0 bg-[var(--k-surface)] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--k-accent)]">Made for your campus</p><h2 className="mt-1.5 text-lg font-bold tracking-tight text-[var(--k-ink)]">More ways to connect</h2></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--k-accent-light)] text-[var(--k-accent)]"><HeartHandshake size={18}/></div></div>
                  <p className="mt-2 text-[11px] leading-5 text-[var(--k-muted)]">A look at the spaces Koinelio brings together. Your signed-in content comes from your account and database permissions.</p>
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--k-border-soft)] bg-[var(--k-surface)] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--k-accent-light)] text-[var(--k-accent)]"><Newspaper size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[var(--k-ink)]">Campus Feed</p><p className="mt-0.5 text-[10px] text-[var(--k-muted)]">Discussions · Projects · Opportunities</p></div><ArrowRight size={14} className="text-[var(--k-muted)]"/></div>
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--k-border-soft)] bg-[var(--k-surface)] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--k-accent-light)] text-[var(--k-accent-dark)]"><Users size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[var(--k-ink)]">Club communities</p><p className="mt-0.5 text-[10px] text-[var(--k-muted)]">Join requests · Member roles · Core team</p></div><ArrowRight size={14} className="text-[var(--k-muted)]"/></div>
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--k-border-soft)] bg-[var(--k-surface)] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--k-accent-light)] text-[var(--k-accent)]"><MessageCircle size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[var(--k-ink)]">Purposeful conversations</p><p className="mt-0.5 text-[10px] text-[var(--k-muted)]">General · Members · Core Team rooms</p></div><ArrowRight size={14} className="text-[var(--k-muted)]"/></div>
                  </div>
                  <div className="mt-4 rounded-xl border border-[var(--k-border)] bg-[var(--k-accent-light)] px-3.5 py-3"><p className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--k-accent-dark)]"><ShieldCheck size={13}/>Access has real boundaries</p><p className="mt-1 text-[10px] leading-4 text-[var(--k-ink-soft)]">Email confirmation, club approval and leadership roles are separate checks—not decorative labels.</p></div>
                </div>
              </div>
            </div>
            <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-[var(--k-muted)]"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--k-accent)]"/>An interface preview—not live member activity</span><Link href="/dashboard/community" className="inline-flex items-center gap-1 font-bold text-[var(--k-accent)] hover:underline">See the campus feed <ArrowDownRight size={14}/></Link></div>
          </div>
        </div>
      </section>

      <section id="why-koinelio" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--k-accent)]">A campus should feel connected</p><h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[var(--k-ink)] sm:text-4xl">The right people, spaces and opportunities—closer together.</h2></div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--k-muted)] sm:text-base">Koinelio brings campus activity into one place. Follow conversations, find clubs, discover events and learn from alumni.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, eyebrow, title, body, accent }) => {
            const colors = accentStyles[accent];
            return <article key={title} className="group rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5 shadow-[0_2px_10px_rgba(60,52,37,0.025)] transition duration-200 hover:-translate-y-1 hover:border-[var(--k-border)] hover:shadow-[0_14px_32px_rgba(60,52,37,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-4"><div className={'flex h-11 w-11 items-center justify-center rounded-xl ' + colors.icon}><Icon size={21}/></div><span className={'pt-1 text-[9px] font-bold tracking-[0.15em] ' + colors.label}>{eyebrow}</span></div>
              <h3 className="mt-5 text-lg font-bold leading-snug text-[var(--k-ink)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">{body}</p>
            </article>;
          })}
        </div>
      </section>

      <section id="communities" className="border-y border-[var(--k-border)] bg-[var(--k-surface-muted)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)] lg:items-center lg:px-8 lg:py-20">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--k-accent)]">Better communities, not more noise</p><h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[var(--k-ink)] sm:text-4xl">Joining is a process. Belonging is the goal.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[var(--k-ink-soft)] sm:text-base">Membership, leadership and room access follow clear approval steps. A coordinator reviews each request. Invitees must accept before membership becomes active.</p><Link href="/dashboard/clubs" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--k-accent)] px-5 py-3 text-sm font-semibold text-[var(--k-on-accent)] transition hover:bg-[var(--k-accent-hover)]">Explore clubs <ArrowRight size={15}/></Link></div>
          <div className="space-y-3">
            {[
              { n: '01', title: 'General', body: 'For confirmed institute-email accounts in an approved club.', icon: Users, color: 'bg-[var(--k-surface)] text-[var(--k-accent)]' },
              { n: '02', title: 'Members', body: 'For active members and club leadership.', icon: MessageCircle, color: 'bg-[var(--k-surface)] text-[var(--k-accent-dark)]' },
              { n: '03', title: 'Core Team', body: 'A private space for Core Members and the Coordinator.', icon: ShieldCheck, color: 'bg-[var(--k-surface)] text-[var(--k-accent)]' },
            ].map((room) => <div key={room.n} className="flex items-start gap-4 rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-4 sm:p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--k-surface-muted)]"><room.icon size={20} className={room.color.split(' ').pop()}/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[10px] font-bold tracking-wide text-[var(--k-accent)]">{room.n}</span><h3 className="text-sm font-bold text-[var(--k-ink)]">{room.title}</h3></div><p className="mt-1 text-xs leading-5 text-[var(--k-muted)]">{room.body}</p></div><LockKeyhole size={14} className="mt-1 shrink-0 text-[var(--k-muted)]"/></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-[#202a25] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-white/5"/>
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--k-success)]">Start with your own account</p><h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Your campus story belongs here.</h2><p className="mt-3 text-sm leading-7 text-white/75">Create an account with your IIT Bhilai email. Confirm you own the mailbox, then complete your profile.</p></div>
            <Link href="/auth/signup" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--k-accent-light)] px-5 py-3.5 text-sm font-bold text-[var(--k-ink)] transition hover:bg-[var(--k-surface-hover)]">Get started <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#202a25] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5"><KoinelioLogoMark size={34}/><span className="text-xl font-bold tracking-tight">Koinelio</span></Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">One campus. Every connection. A more thoughtful home for campus profiles, communities, conversations and opportunities.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-semibold text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-[#EBCF8B]"/>Independent campus pilot</div>
          </div>
          <div><h3 className="text-sm font-bold text-white">Explore</h3><div className="mt-4 space-y-3 text-sm text-white/65"><Link href="/dashboard/community" className="block transition hover:text-white">Campus Feed</Link><Link href="/dashboard/alumni" className="block transition hover:text-white">Alumni & graduates</Link><Link href="/dashboard/clubs" className="block transition hover:text-white">Clubs & membership</Link><Link href="/dashboard/events" className="block transition hover:text-white">Events</Link><Link href="/dashboard/campus" className="block transition hover:text-white">Campus Guide</Link></div></div>
          <div><h3 className="text-sm font-bold text-white">Your account</h3><div className="mt-4 space-y-3 text-sm text-white/65"><Link href="/auth/signup" className="block transition hover:text-white">Create an account</Link><Link href="/auth/signin" className="block transition hover:text-white">Sign in</Link><Link href="/auth/forgot-password" className="block transition hover:text-white">Reset password</Link><Link href="/dashboard/profile" className="block transition hover:text-white">Manage profile</Link><Link href="/dashboard/settings" className="block transition hover:text-white">Privacy & settings</Link></div></div>
          <div><h3 className="text-sm font-bold text-white">Trust & safety</h3><div className="mt-4 space-y-3 text-sm text-white/65"><span className="block">Confirmed campus email required</span><span className="block">Membership follows approval</span><span className="block">Room access follows role</span><span className="block">No LDAP password collection</span><Link href="/dashboard/help" className="block transition hover:text-white">Help & support</Link><a href="https://github.com/rkaif8314-a11y/Koinelio-Campus-Community-Platform/issues" target="_blank" rel="noreferrer" className="block transition hover:text-white">Report a technical issue</a></div></div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-[11px] leading-5 text-white/60 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8"><p className="max-w-3xl">Koinelio is independently operated unless formally authorized by IIT Bhilai. An institute email confirms mailbox access, not current enrolment or official endorsement. Do not enter your institute/LDAP password.</p><span className="shrink-0">Koinelio · Built for campus connection</span></div>
        </div>
      </footer>
    </main>
  );
}
