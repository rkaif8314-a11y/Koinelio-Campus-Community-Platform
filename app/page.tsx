'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  Menu,
  MessageCircle,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import KoinelioLogoMark from '@/components/koinelio-logo-mark';
import ThemeToggle from '@/components/theme-toggle';

const features = [
  {
    icon: Users,
    title: 'Real campus profiles',
    text: 'Set up your personal and academic profile, add skills and interests, and upload a profile picture that stays with your Koinelio account.',
  },
  {
    icon: ShieldCheck,
    title: 'Club membership with approval',
    text: 'Discover approved clubs, request membership, and track decisions. A pending request never gives you member privileges.',
  },
  {
    icon: BadgeCheck,
    title: 'Clear leadership roles',
    text: 'Coordinators, Core Members, General Secretaries, the President, and administrators have distinct responsibilities and approval paths.',
  },
  {
    icon: MessageCircle,
    title: 'Three club room levels',
    text: 'General for the campus, Members for active members, and Core Team for Core Members and coordinators. Database policies enforce access.',
  },
  {
    icon: CalendarDays,
    title: 'Events that persist',
    text: 'Find events published by authorized organizers, register from your account, and keep registrations tied to your actual signed-in profile.',
  },
  {
    icon: BookOpen,
    title: 'Campus information',
    text: 'Use the Campus Guide to explore publicly sourced information. The guide is distinct from private member records and club activity.',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="landing-page min-h-screen bg-white font-sans text-slate-900">
      <nav className="landing-nav sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <KoinelioLogoMark size={33} />
            <span className="text-xl font-bold tracking-tight text-[#14213D]">Koinelio</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">Features</a>
            <a href="#governance" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">Club governance</a>
            <Link href="/dashboard/campus" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">Campus Guide</Link>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link href="/auth/signin" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Sign in</Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Create account <ArrowRight size={15} /></Link>
          </div>
          <button onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden">{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
        {mobileMenuOpen && <div className="space-y-2 border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Features</a>
          <a href="#governance" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Club governance</a>
          <Link href="/dashboard/campus" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Campus Guide</Link>
          <div className="flex items-center justify-between px-3 py-2"><span className="text-sm text-slate-500">Appearance</span><ThemeToggle /></div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link href="/auth/signin" className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700">Sign in</Link>
            <Link href="/auth/signup" className="rounded-xl bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white">Create account</Link>
          </div>
        </div>}
      </nav>

      <section className="landing-hero relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.13),transparent_62%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-800"><span className="h-2 w-2 rounded-full bg-emerald-500" /> IIT Bhilai email-restricted campus pilot</div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-[#14213D] sm:text-5xl lg:text-6xl">One campus. <span className="text-indigo-600">Every connection.</span></h1>
            <p className="landing-hero-description mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">A shared place for campus profiles, approved clubs, student leadership, events, and focused club conversations—with roles and access enforced by the database.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">Create your account <ArrowRight size={16} /></Link>
              <Link href="/auth/signin" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Already registered? Sign in</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> Real account and profile persistence</span>
              <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} className="text-indigo-600" /> Email-restricted access</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-200/50 via-sky-100/50 to-teal-100/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-indigo-900/5">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 truncate rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-400">Koinelio · Campus workspace</span>
              </div>
              <div className="grid gap-0 sm:grid-cols-[126px_minmax(0,1fr)]">
                <div className="hidden flex-col gap-2 bg-[#14213D] p-4 sm:flex">
                  <div className="mb-4 flex items-center gap-2"><KoinelioLogoMark size={24} /><span className="text-xs font-bold text-white">Koinelio</span></div>
                  {['Campus feed', 'My Clubs', 'Club Rooms', 'Events', 'Profile'].map((item, index) => <div key={item} className={`rounded-lg px-2 py-2 text-[10px] font-medium ${index === 1 ? 'bg-white text-[#14213D]' : 'text-white/65'}`}>{item}</div>)}
                  <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-2.5"><div className="mb-1 text-[9px] text-white/45">Workspace</div><div className="text-[10px] font-semibold text-white">IIT Bhilai</div><div className="mt-1 text-[9px] text-emerald-300">Email-restricted</div></div>
                </div>
                <div className="min-w-0 bg-slate-50 p-4 sm:p-5">
                  <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-700">Club workspace</p><h2 className="mt-1 text-base font-bold text-slate-900">Membership has meaning</h2><p className="mt-1 text-[11px] leading-5 text-slate-500">Joining a club requires approval. Access follows your assigned role.</p></div>
                  <div className="space-y-2.5">
                    {[
                      { title: 'General', sub: 'Campus email accounts', icon: Users, tone: 'bg-sky-50 text-sky-700' },
                      { title: 'Members', sub: 'Active club members', icon: MessageCircle, tone: 'bg-indigo-50 text-indigo-700' },
                      { title: 'Core Team', sub: 'Core Members + Coordinator', icon: ShieldCheck, tone: 'bg-teal-50 text-teal-700' },
                    ].map(({ title, sub, icon: Icon, tone }) => <div key={title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><Icon size={17} /></div><div className="min-w-0 flex-1"><div className="text-xs font-bold text-slate-800">{title}</div><div className="mt-0.5 text-[10px] text-slate-500">{sub}</div></div><LockKeyhole size={14} className="text-slate-400" /></div>)}
                  </div>
                  <p className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3 text-[10px] leading-5 text-sky-900">This preview illustrates the product structure. Actual membership, roles and messages are read from the database; no sample identities are used to sign in.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Built for campus life</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#14213D] sm:text-4xl">A shared campus, with clear boundaries</h2><p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Accounts and campus activity persist between sessions. Private content and leadership capabilities are controlled independently from profile labels.</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md sm:p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon size={21} /></div><h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </div>
      </section>

      <section id="governance" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Leadership workflows</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#14213D] sm:text-4xl">No self-appointed administrators</h2><p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Student sign-up never grants leadership rights. The administrator appoints the President and General Secretaries; the responsible General Secretary reviews club coordinators, and the President or administrator can oversee club approvals.</p></div>
          <div className="space-y-3">
            {[
              ['Administrator', 'Controls bootstrap and appoints campus leadership'],
              ['President', 'Campus-wide club governance and approvals'],
              ['General Secretary', 'Reviews coordinator requests within the assigned council'],
              ['Coordinator', 'Reviews membership requests and invites selected students'],
              ['Core Member', 'Private Core Team room plus normal member access'],
              ['Member', 'Access only after approval or invitation acceptance'],
            ].map(([title, text]) => <div key={title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" /><div><p className="text-sm font-bold text-slate-900">{title}</p><p className="mt-0.5 text-xs leading-5 text-slate-600">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl"><h2 className="text-3xl font-bold tracking-tight text-[#14213D] sm:text-4xl">Make your campus connections count</h2><p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Create your account with your IIT Bhilai institute email, confirm your mailbox, and finish your profile after signing in.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700">Create Koinelio account <ArrowRight size={16} /></Link><Link href="/dashboard/campus" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Explore Campus Guide <BookOpen size={16} /></Link></div></div>
      </section>

      <footer className="bg-[#14213D] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
          <div><Link href="/" className="inline-flex items-center gap-2.5"><KoinelioLogoMark size={31} /><span className="text-xl font-bold">Koinelio</span></Link><p className="mt-3 max-w-lg text-sm leading-6 text-white/65">One campus. Every connection. A campus community pilot for profiles, clubs, events and role-based collaboration.</p></div>
          <div className="grid grid-cols-2 gap-6"><div><h3 className="text-sm font-bold">Account</h3><div className="mt-3 space-y-2 text-sm text-white/65"><Link href="/auth/signup" className="block hover:text-white">Create account</Link><Link href="/auth/signin" className="block hover:text-white">Sign in</Link><Link href="/auth/forgot-password" className="block hover:text-white">Reset password</Link></div></div><div><h3 className="text-sm font-bold">Explore</h3><div className="mt-3 space-y-2 text-sm text-white/65"><Link href="/dashboard/campus" className="block hover:text-white">Campus Guide</Link><Link href="/dashboard/clubs" className="block hover:text-white">Clubs</Link><Link href="/dashboard/events" className="block hover:text-white">Events</Link></div></div></div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs leading-5 text-white/45 sm:px-6">Koinelio is independently operated unless and until formally authorized by IIT Bhilai. An institute email confirms mailbox access, not current enrolment. Never enter your institute/LDAP password.</div>
      </footer>
    </main>
  );
}
