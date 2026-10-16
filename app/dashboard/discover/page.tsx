'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, BadgeCheck, BookOpen, CalendarDays, LoaderCircle, Search, Users, UserRound } from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type Profile = {
  id: string;
  display_name: string;
  bio: string;
  department: string | null;
  study_year: number | null;
  degree_program: string | null;
  batch_year: number | null;
  graduation_year: number | null;
  avatar_url: string | null;
  skills: string[];
  interests: string[];
  verification_status: string;
};

type Club = { id: string; name: string; description: string; category: string | null; logo_url: string | null; approval_status: string };
type Event = { id: string; title: string; description: string; starts_at: string | null; location: string | null; category: string | null };

type Tab = 'all' | 'people' | 'clubs' | 'events';

function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState(urlQuery);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDirectory = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/discover');
        return;
      }
      setUserId(authData.user.id);
      const [profileResult, clubResult, eventResult] = await Promise.all([
        supabase.from('profiles')
          .select('id, display_name, bio, department, study_year, degree_program, batch_year, graduation_year, avatar_url, skills, interests, verification_status')
          .neq('id', authData.user.id)
          .order('display_name')
          .limit(100),
        supabase.from('clubs')
          .select('id, name, description, category, logo_url, approval_status')
          .eq('approval_status', 'approved')
          .order('name')
          .limit(100),
        supabase.from('events')
          .select('id, title, description, starts_at, location, category')
          .eq('status', 'published')
          .order('starts_at', { ascending: true, nullsFirst: false })
          .limit(50),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (clubResult.error) throw clubResult.error;
      if (eventResult.error) throw eventResult.error;
      setProfiles((profileResult.data ?? []) as Profile[]);
      setClubs((clubResult.data ?? []) as Club[]);
      setEvents((eventResult.data ?? []) as Event[]);
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load the campus directory.'));
    } finally { setLoading(false); }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- The directory loader hydrates query results after authentication.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- The directory loader hydrates query results after authentication.
  useEffect(() => { void loadDirectory(); }, [loadDirectory]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the controlled search field synchronized with navigation from the global search.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the controlled search field synchronized with navigation from the global search.
  useEffect(() => { setQuery(urlQuery); }, [urlQuery]);

  const normalized = query.trim().toLowerCase();
  const people = useMemo(() => profiles.filter((item) =>
    !normalized || [item.display_name, item.department, item.degree_program, item.bio, ...(item.skills ?? []), ...(item.interests ?? [])]
      .some((value) => (value ?? '').toLowerCase().includes(normalized))), [profiles, normalized]);
  const matchedClubs = useMemo(() => clubs.filter((item) =>
    !normalized || [item.name, item.category, item.description].some((value) => (value ?? '').toLowerCase().includes(normalized))), [clubs, normalized]);
  const matchedEvents = useMemo(() => events.filter((item) =>
    !normalized || [item.title, item.category, item.description, item.location].some((value) => (value ?? '').toLowerCase().includes(normalized))), [events, normalized]);

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading campus directory…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Discover campus</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">People, clubs and events</h1><p className="mt-2 text-sm leading-6 text-slate-600">Results come from the database and respect each user's profile visibility and club approval status. Only people visible to your account appear.</p></div>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      <div className="mb-5 flex flex-wrap gap-2">
        {([['all','Everything'],['people','People'],['clubs','Approved clubs'],['events','Published events']] as [Tab,string][]).map(([value,label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-xl px-3.5 py-2 text-sm font-semibold ${tab === value ? 'bg-[#14213D] text-white' : 'text-slate-600 hover:bg-white'}`}>{label}</button>)}
      </div>
      <div className="relative mb-6 max-w-2xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search names, departments, interests, clubs or events…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" /></div>

      {(tab === 'all' || tab === 'people') && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><UserRound size={19} />People</h2><span className="text-xs text-slate-400">{people.length} visible</span></div>
          {people.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No profiles match your search or visibility permissions.</div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{people.map((person) => <article key={person.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">{person.avatar_url ? <img src={person.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700"><UserRound size={22} /></span>}<div className="min-w-0 flex-1"><h3 className="truncate font-bold text-slate-900">{person.display_name}</h3><p className="mt-1 text-xs text-slate-500">{person.department || 'Department not set'}{person.study_year ? ` · Year ${person.study_year}` : ''}</p>{person.verification_status === 'verified' && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800"><BadgeCheck size={11} />Affiliation verified</span>}</div></div>
            {person.bio && <p className="mt-3 line-clamp-3 text-sm leading-5 text-slate-600">{person.bio}</p>}
            {person.degree_program && <p className="mt-3 text-xs text-slate-500">{person.degree_program}</p>}
            {(person.interests?.length ?? 0) > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{person.interests.slice(0,4).map((item) => <span key={item} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{item}</span>)}</div>}
            <Link href={`/dashboard/profile/${person.id}`} className="mt-4 inline-flex text-xs font-bold text-indigo-700 hover:underline">View visible profile →</Link>
          </article>)}</div>}
        </section>
      )}

      {(tab === 'all' || tab === 'clubs') && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Users size={19} />Approved clubs</h2><Link href="/dashboard/clubs" className="text-xs font-semibold text-indigo-700 hover:underline">Memberships & governance →</Link></div>
          {matchedClubs.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No approved clubs match your search.</div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{matchedClubs.map((club) => <article key={club.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-3">{club.logo_url ? <img src={club.logo_url} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Users size={20} /></span>}<div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{club.name}</h3><p className="text-xs text-slate-500">{club.category || 'Campus club'}</p></div></div><p className="mt-3 line-clamp-3 text-sm leading-5 text-slate-600">{club.description || 'No description provided.'}</p><Link href="/dashboard/clubs" className="mt-4 inline-flex text-xs font-bold text-indigo-700 hover:underline">View membership options →</Link></article>)}</div>}
        </section>
      )}

      {(tab === 'all' || tab === 'events') && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><CalendarDays size={19} />Published events</h2><Link href="/dashboard/events" className="text-xs font-semibold text-indigo-700 hover:underline">Registration →</Link></div>
          {matchedEvents.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No published events match your search.</div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{matchedEvents.map((event) => <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-indigo-700">{event.category || 'Campus event'}</p><h3 className="mt-2 font-bold text-slate-900">{event.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-600">{event.description}</p><p className="mt-3 text-xs text-slate-500">{event.starts_at ? new Date(event.starts_at).toLocaleString() : 'Date to be announced'}{event.location ? ` · ${event.location}` : ''}</p><Link href="/dashboard/events" className="mt-4 inline-flex text-xs font-bold text-indigo-700 hover:underline">Register or learn more →</Link></article>)}</div>}
        </section>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading campus discovery…</div>}>
      <DiscoverPageContent />
    </Suspense>
  );
}
