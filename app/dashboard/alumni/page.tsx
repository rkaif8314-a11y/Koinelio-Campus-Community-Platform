'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, BriefcaseBusiness, GraduationCap, LoaderCircle, Search, UserRound } from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type AlumniProfile = {
  id: string;
  display_name: string;
  bio: string;
  department: string | null;
  degree_program: string | null;
  graduation_year: number | null;
  avatar_url: string | null;
  skills: string[];
  interests: string[];
  verification_status: string;
};

export default function AlumniPage() {
  const router = useRouter();
  const [items, setItems] = useState<AlumniProfile[]>([]);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlumni = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/alumni');
        return;
      }
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, display_name, bio, department, degree_program, graduation_year, avatar_url, skills, interests, verification_status')
        .eq('profile_category', 'alumni')
        .not('graduation_year', 'is', null)
        .lte('graduation_year', new Date().getFullYear())
        .order('graduation_year', { ascending: false })
        .limit(100);
      if (queryError) throw queryError;
      setItems((data ?? []) as AlumniProfile[]);
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load visible graduate profiles.'));
    } finally { setLoading(false); }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetches the current user's visible graduate directory after mount.
  useEffect(() => { void loadAlumni(); }, [loadAlumni]);

  const q = query.trim().toLowerCase();
  const graduates = items.filter((person) => {
    const matchesYear = year === 'All' || String(person.graduation_year) === year;
    const matchesQuery = !q || [person.display_name, person.department, person.degree_program, person.bio, ...(person.skills ?? []), ...(person.interests ?? [])].some((value) => (value ?? '').toLowerCase().includes(q));
    return matchesYear && matchesQuery;
  });
  const graduationYears = Array.from(new Set(items.map((item) => item.graduation_year).filter((value): value is number => value !== null))).sort((a,b) => b-a);

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-[var(--k-muted)]"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading graduate profiles…</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--k-accent)]">Campus network</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--k-ink)] sm:text-3xl">Alumni & graduates</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--k-ink-soft)]">Profiles are shown only when permitted by their database privacy settings. Graduation year is self-reported unless independently verified.</p></div>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--k-danger)] bg-[var(--k-danger-light)] p-3 text-sm text-[var(--k-danger)]"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--k-muted)]" size={17} /><input aria-label="Search graduate profiles" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search graduate profiles, skills, departments…" className="w-full rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]" /></div><select aria-label="Filter graduates by graduation year" value={year} onChange={(e) => setYear(e.target.value)} className="rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] px-3.5 py-3 text-sm outline-none focus:border-[var(--k-accent)]"><option>All</option>{graduationYears.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
      {graduates.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--k-border)] bg-[var(--k-surface)] p-10 text-center"><GraduationCap size={34} className="mx-auto mb-3 text-[var(--k-muted)]" /><h2 className="font-bold text-[var(--k-ink)]">No visible graduate profiles</h2><p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">A graduate appears here only when they choose the alumni profile type, record a past graduation year, and allow your account to view their profile.</p><Link href="/dashboard/profile" className="mt-4 inline-flex text-sm font-semibold text-[var(--k-accent)] hover:underline">Update your profile</Link></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{graduates.map((person) => <article key={person.id} className="rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5"><div className="flex items-start gap-3">{person.avatar_url ? <img src={person.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--k-accent-light)] text-[var(--k-accent)]"><UserRound size={22} /></span>}<div className="min-w-0 flex-1"><h2 className="truncate font-bold text-[var(--k-ink)]">{person.display_name}</h2><p className="mt-1 text-xs text-[var(--k-muted)]">{person.department || 'Department not set'}</p></div></div><div className="mt-3 flex items-center gap-2 text-xs text-[var(--k-ink-soft)]"><GraduationCap size={14} />Class of {person.graduation_year}</div><p className="mt-3 line-clamp-3 text-sm leading-5 text-[var(--k-ink-soft)]">{person.bio || 'No biography shared.'}</p>{person.skills.length > 0 && <p className="mt-3 line-clamp-2 text-xs text-[var(--k-muted)]"><BriefcaseBusiness size={12} className="mr-1 inline" />{person.skills.slice(0,5).join(' · ')}</p>}<Link href={`/dashboard/profile/${person.id}`} className="mt-4 inline-flex text-xs font-bold text-[var(--k-accent)] hover:underline">View profile →</Link></article>)}</div>}
    </div>
  );
}
