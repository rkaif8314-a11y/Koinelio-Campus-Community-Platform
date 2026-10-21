'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  Compass,
  Users,
  Calendar,
  Globe,
  GraduationCap,
  Bell,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  X,
  Menu,
  Plus,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { useApp, useCurrentUser, useUnreadNotificationCount } from '@/lib/app-context';
import { DEMO_SESSION_USERS, DEMO_USERS } from '@/lib/demo-data';
import KoinelioLogoMark from '@/components/koinelio-logo-mark';
import ThemeToggle from '@/components/theme-toggle';

// ─── Nav item definition ──────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeType?: 'count' | 'pill';
}

function useNavItems(unreadCount: number): NavItem[] {
  return [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Discover', href: '/dashboard/discover', icon: Compass },
    { label: 'Campus Guide', href: '/dashboard/campus', icon: BookOpen },
    { label: 'My Clubs', href: '/dashboard/clubs', icon: Users },
    { label: 'Events', href: '/dashboard/events', icon: Calendar },
    { label: 'Community', href: '/dashboard/community', icon: Globe },
    { label: 'Alumni', href: '/dashboard/alumni', icon: GraduationCap },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeType: 'count',
    },
    {
      label: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      badge: 'Soon',
      badgeType: 'pill',
    },
  ];
}

// ─── Sidebar nav link ─────────────────────────────────────────────────────────
function SidebarLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const accentByLabel: Record<string, { icon: string; active: string; hover: string }> = {
    Home: { icon: 'text-sky-300', active: 'bg-sky-400/15 text-white ring-1 ring-sky-300/25', hover: 'hover:bg-sky-400/10 hover:text-white' },
    Discover: { icon: 'text-violet-300', active: 'bg-violet-400/15 text-white ring-1 ring-violet-300/25', hover: 'hover:bg-violet-400/10 hover:text-white' },
    'Campus Guide': { icon: 'text-cyan-300', active: 'bg-cyan-400/15 text-white ring-1 ring-cyan-300/25', hover: 'hover:bg-cyan-400/10 hover:text-white' },
    'My Clubs': { icon: 'text-emerald-300', active: 'bg-emerald-400/15 text-white ring-1 ring-emerald-300/25', hover: 'hover:bg-emerald-400/10 hover:text-white' },
    Events: { icon: 'text-amber-300', active: 'bg-amber-400/15 text-white ring-1 ring-amber-300/25', hover: 'hover:bg-amber-400/10 hover:text-white' },
    Community: { icon: 'text-teal-300', active: 'bg-teal-400/15 text-white ring-1 ring-teal-300/25', hover: 'hover:bg-teal-400/10 hover:text-white' },
    Alumni: { icon: 'text-pink-300', active: 'bg-pink-400/15 text-white ring-1 ring-pink-300/25', hover: 'hover:bg-pink-400/10 hover:text-white' },
    Notifications: { icon: 'text-orange-300', active: 'bg-orange-400/15 text-white ring-1 ring-orange-300/25', hover: 'hover:bg-orange-400/10 hover:text-white' },
    Messages: { icon: 'text-indigo-300', active: 'bg-indigo-400/15 text-white ring-1 ring-indigo-300/25', hover: 'hover:bg-indigo-400/10 hover:text-white' },
  };
  const accent = accentByLabel[item.label] ?? {
    icon: 'text-white/65',
    active: 'bg-white/10 text-white ring-1 ring-white/15',
    hover: 'hover:bg-white/8 hover:text-white',
  };

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80
        ${active ? accent.active : `text-white/65 ${accent.hover}`}`}
    >
      <Icon size={18} aria-hidden="true" className={`flex-shrink-0 transition-colors ${accent.icon} group-hover:brightness-125`} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badgeType === 'count' && (
        <span className="flex-shrink-0 bg-[#5146E5] text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
          {item.badge}
        </span>
      )}
      {item.badge !== undefined && item.badgeType === 'pill' && (
        <span className="flex-shrink-0 bg-white/10 text-white/80 text-[10px] font-semibold rounded-full px-2 py-0.5 ring-1 ring-white/10">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
// ─── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark({ size = 28 }: { size?: number }) {
  return <KoinelioLogoMark size={size} />;
}

// ─── Demo user switcher ───────────────────────────────────────────────────────
function DemoSwitcher() {
  const { actions } = useApp();
  const currentUser = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const firstName = currentUser.name.split(' ')[0];

  function handleSwitch(userId: string) {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      actions.setCurrentUser(user);
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F0FF] text-[#5146E5] text-sm font-medium hover:bg-[#E8E7FF] transition-colors"
      >
        <span className="hidden sm:inline">Demo:</span>
        <span className="font-semibold">{firstName}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 py-1 overflow-hidden">
          <div className="px-3 py-2 border-b border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#667085] uppercase tracking-wide">Switch Demo User</p>
          </div>
          {DEMO_SESSION_USERS.map(su => {
            const user = DEMO_USERS.find(u => u.id === su.id);
            const isActive = su.id === currentUser.id;
            return (
              <button
                key={su.id}
                onClick={() => handleSwitch(su.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F7F8FC] transition-colors text-left ${isActive ? 'bg-[#F0F0FF]' : ''}`}
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-[#5146E5]' : 'text-[#182230]'}`}>
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#667085] truncate capitalize">{su.role.replace('_', ' ')}</p>
                </div>
                {isActive && <CheckCircle size={16} className="text-[#5146E5] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────
function SidebarContent({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  const { actions } = useApp();
  const currentUser = useCurrentUser();
  const unreadCount = useUnreadNotificationCount();
  const navItems = useNavItems(unreadCount);
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  function handleSignOut() {
    router.push('/');
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <LogoMark size={28} />
        <span className="text-white font-bold text-xl tracking-tight">Koinelio</span>
      </div>

      {/* Institution selector */}
      <div className="mx-3 mb-4">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/8 hover:bg-white/12 transition-colors text-left">
          <Building2 size={16} className="text-white/50 flex-shrink-0" />
          <span className="flex-1 text-sm text-white/80 truncate font-medium">IIT Bhilai</span>
          <ChevronDown size={14} className="text-white/40 flex-shrink-0" />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-3 border-t border-white/10" />

      {/* Bottom links */}
      <div className="px-3 space-y-0.5 mb-3">
        <SidebarLink
          item={{ label: 'Help & Support', href: '/dashboard/help', icon: HelpCircle }}
          active={pathname === '/dashboard/help'}
          onClick={onNavClick}
        />
        <SidebarLink
          item={{ label: 'Settings', href: '/dashboard/settings', icon: Settings }}
          active={pathname === '/dashboard/settings'}
          onClick={onNavClick}
        />
      </div>

      {/* User card */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-white/6 border border-white/10">
        <div className="flex items-center gap-2.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-[#5146E5]/50"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentUser.name}</p>
            <p className="text-white/50 text-xs capitalize truncate">
              {currentUser.role.replace('_', ' ')} · {currentUser.department}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-2.5 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/8 text-xs transition-colors"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ pathname }: { pathname: string }) {
  const unreadCount = useUnreadNotificationCount();

  const mobileItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Discover', href: '/dashboard/discover', icon: Compass },
    { label: 'Clubs', href: '/dashboard/clubs', icon: Users },
    { label: 'Events', href: '/dashboard/events', icon: Calendar },
    {
      label: 'Alerts',
      href: '/dashboard/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] lg:hidden">
      <div className="flex">
        {mobileItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-colors
                ${active ? 'text-[#5146E5]' : 'text-[#667085]'}`}
            >
              <span className="relative">
                <Icon size={20} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#5146E5] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const unreadCount = useUnreadNotificationCount();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FC]">
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-[#14213D] overflow-hidden">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile Sidebar overlay ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#14213D] flex flex-col lg:hidden transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="text-white font-bold text-lg">Koinelio</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent pathname={pathname} onNavClick={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* ── Right side: topbar + content ────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center gap-3 px-4 sticky top-0 z-30 flex-shrink-0">
          {/* Mobile: hamburger */}
          <button
            className="lg:hidden text-[#667085] hover:text-[#182230] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Mobile: Institution name */}
          <span className="lg:hidden text-sm font-semibold text-[#182230] truncate">
            IIT Bhilai
          </span>

          {/* Desktop: Search */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search people, clubs, events…"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F8FC] text-sm text-[#182230] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5] transition-colors"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#182230]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex-1 lg:flex-none" />

          {/* Right: Bell + Demo switcher */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-lg text-[#667085] hover:text-[#182230] hover:bg-[#F7F8FC] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#5146E5] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </Link>

            <DemoSwitcher />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] pb-20 lg:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs leading-5 text-amber-950 sm:px-6">
            <p><strong>Unofficial demo:</strong> sample people, member counts, posts, registrations and events are fictional. IIT Bhilai has not endorsed this prototype.</p>
            <Link href="/dashboard/campus" className="inline-flex shrink-0 items-center gap-1 font-bold text-amber-900 underline underline-offset-2">
              Open source-linked Campus Guide <BookOpen size={13} />
            </Link>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav pathname={pathname} />
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
