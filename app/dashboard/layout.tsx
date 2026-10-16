'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertCircle,
  Bell,
  BookOpen,
  CalendarDays,
  Compass,
  GraduationCap,
  Newspaper,
  Building2,
  CheckCircle2,
  HelpCircle,
  Home,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import KoinelioLogoMark from '@/components/koinelio-logo-mark';
import ThemeToggle from '@/components/theme-toggle';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';

type ProfileSnapshot = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  campus_role: string;
  department: string | null;
  verification_status: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Campus Feed', href: '/dashboard/community', icon: Newspaper },
  { label: 'Discover', href: '/dashboard/discover', icon: Compass },
  { label: 'Campus Guide', href: '/dashboard/campus', icon: BookOpen },
  { label: 'My Clubs', href: '/dashboard/clubs', icon: Users },
  { label: 'Events', href: '/dashboard/events', icon: CalendarDays },
  { label: 'Alumni', href: '/dashboard/alumni', icon: GraduationCap },
  { label: 'Club Rooms', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'My Profile', href: '/dashboard/profile', icon: UserRound },
];

function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'K';
}

function NavigationLink({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const active = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-white text-[#14213D] shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={18} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">{item.badge}</span>
      )}
    </Link>
  );
}

function Sidebar({
  profile,
  pathname,
  onSignOut,
  onNavClick,
  leadership,
}: {
  profile: ProfileSnapshot;
  pathname: string;
  onSignOut: () => void;
  onNavClick?: () => void;
  leadership: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" onClick={onNavClick} className="flex items-center gap-2.5 px-4 py-5">
        <KoinelioLogoMark size={29} />
        <span className="text-xl font-bold tracking-tight text-white">Koinelio</span>
      </Link>

      <div className="mx-3 mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <Building2 size={16} className="shrink-0 text-white/55" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">IIT Bhilai</p>
          <p className="truncate text-[10px] text-white/50">Institute email-restricted pilot</p>
        </div>
        <CheckCircle2 size={15} className="ml-auto shrink-0 text-emerald-300" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => <NavigationLink key={item.href} item={item} pathname={pathname} onClick={onNavClick} />)}
        {leadership && (
          <NavigationLink
            item={{ label: 'Governance', href: '/dashboard/admin', icon: ShieldCheck }}
            pathname={pathname}
            onClick={onNavClick}
          />
        )}
      </nav>

      <div className="mx-3 my-3 border-t border-white/10" />
      <div className="space-y-1 px-3 pb-3">
        <NavigationLink item={{ label: 'Help & Support', href: '/dashboard/help', icon: HelpCircle }} pathname={pathname} onClick={onNavClick} />
        <NavigationLink item={{ label: 'Settings', href: '/dashboard/settings', icon: Settings }} pathname={pathname} onClick={onNavClick} />
      </div>

      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <Link href="/dashboard/profile" onClick={onNavClick} className="flex items-center gap-2.5">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-indigo-400/40" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-white">{initials(profile.display_name)}</span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{profile.display_name}</span>
            <span className="block truncate text-[11px] capitalize text-white/55">{profile.campus_role}{profile.department ? ` · ${profile.department}` : ''}</span>
          </span>
        </Link>
        <button onClick={onSignOut} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-white/55 transition hover:bg-white/10 hover:text-white">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  const mobileHrefs = ['/dashboard', '/dashboard/community', '/dashboard/clubs', '/dashboard/events', '/dashboard/alumni'];
  const items = navItems.filter((item) => mobileHrefs.includes(item.href));
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:hidden">
      <div className="flex">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${active ? 'text-indigo-700' : 'text-slate-500'}`}>
              <Icon size={19} />
              {item.label === 'My Clubs' ? 'Clubs' : item.label === 'My Profile' ? 'Profile' : item.label === 'Club Rooms' ? 'Rooms' : item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [leadership, setLeadership] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const loadAuthenticatedUser = useCallback(async () => {
    setLoading(true);
    setAuthError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const user = userData.user;
      if (authError || !user) {
        router.replace('/auth/signin?next=/dashboard');
        return;
      }

      const email = (user.email ?? '').trim().toLowerCase();
      if (!user.email_confirmed_at || !/^[^@\s]+@iitbhilai\.ac\.in$/.test(email)) {
        await supabase.auth.signOut();
        router.replace('/auth/signin?reason=campus-email-required');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, campus_role, department, verification_status')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as ProfileSnapshot);

      const { data: roles } = await supabase
        .from('institution_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('status', 'active');
      const roleNames = (roles ?? []).map((role) => String(role.role));
      setLeadership(roleNames.some((role) => ['institution_admin', 'president', 'technical_gs', 'cultural_gs'].includes(role)));

      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null);
      setUnreadCount(count ?? 0);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to validate your account session.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void loadAuthenticatedUser(); }, [loadAuthenticatedUser]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/auth/signin');
    router.refresh();
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#F7F8FC] text-sm text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={18} /> Checking your account…</div>;
  }

  if (authError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <AlertCircle className="mb-3 text-rose-600" size={25} />
          <h1 className="text-xl font-bold text-slate-900">{authError?.includes('Supabase') ? 'Supabase connection needs attention' : 'Account verification needed'}</h1>
          <p className="mt-2 break-words text-sm leading-6 text-slate-600">{authError || 'Your account profile could not be loaded.'}</p>
          <button onClick={handleSignOut} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Sign in again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FC]">
      <aside className="hidden w-64 shrink-0 flex-col overflow-hidden bg-[#173D36] lg:flex">
        <Sidebar profile={profile} pathname={pathname} onSignOut={handleSignOut} leadership={leadership} />
      </aside>

      {mobileOpen && <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#173D36] transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar profile={profile} pathname={pathname} onSignOut={handleSignOut} onNavClick={() => setMobileOpen(false)} leadership={leadership} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <button className="text-slate-500 hover:text-slate-900 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <span className="truncate text-sm font-semibold text-slate-900 lg:hidden">IIT Bhilai</span>
          <div className="relative hidden max-w-md flex-1 lg:flex">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" placeholder="Search approved clubs and campus guide…" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
            {searchValue && <button onClick={() => setSearchValue('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
          </div>
          <div className="flex-1" />
          <ThemeToggle />
          <Link href="/dashboard/notifications" aria-label={`${unreadCount} unread notifications`} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">{unreadCount}</span>}
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials(profile.display_name)}</span>}
            <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-700 sm:block">{profile.display_name}</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] pb-20 lg:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 bg-sky-50 px-4 py-2.5 text-xs leading-5 text-sky-950 sm:px-6">
            <p><strong>IIT Bhilai email-restricted pilot.</strong> Email confirmation does not itself verify current enrolment. Koinelio is independently operated unless formally authorised by IIT Bhilai. Never enter your institute/LDAP password.</p>
            <Link href="/dashboard/campus" className="inline-flex shrink-0 items-center gap-1 font-bold text-sky-900 underline underline-offset-2">Campus Guide <BookOpen size={13} /></Link>
          </div>
          {children}
        </main>
      </div>

      <MobileNavigation pathname={pathname} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-[#F7F8FC]" />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
