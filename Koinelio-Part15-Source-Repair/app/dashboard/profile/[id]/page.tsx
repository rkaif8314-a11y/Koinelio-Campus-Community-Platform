'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, BadgeCheck, BriefcaseBusiness, CalendarDays, LoaderCircle, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type VisibleProfile = {
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
  verification_status: 'pending' | 'verified' | 'rejected';
  profile_visibility: 'public' | 'campus' | 'private';
};

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const profileId = params.id;
  const [profile, setProfile] = useState<VisibleProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/discover');
        return;
      }
      setIsOwner(authData.user.id === profileId);
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, display_name, bio, department, study_year, degree_program, batch_year, graduation_year, avatar_url, skills, interests, verification_status, profile_visibility')
        .eq('id', profileId)
        .single();
      if (queryError) throw queryError;
      setProfile(data as VisibleProfile);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'This profile is private or unavailable to your account.');
    } finally { setLoading(false); }
  }, [profileId, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetches the profile only after the dynamic route and session are available.
  useEffect(() => { void loadProfile(); }, [loadProfile]);

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading profile…</div>;
  if (!profile) return <div className="mx-auto max-w-2xl px-4 py-12"><div className="rounded-2xl border border-slate-200 bg-white p-6"><AlertCircle size={25} className="mb-3 text-amber-600" /><h1 className="text-xl font-bold text-slate-900">Profile not available</h1><p className="mt-2 text-sm leading-6 text-slate-600">{error || 'This person has limited profile visibility or is outside the permitted campus directory.'}</p><Link href="/dashboard/discover" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"><ArrowLeft size={15} />Back to Discover</Link></div></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/dashboard/discover" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:underline"><ArrowLeft size={15} />Discover</Link>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-[#14213D] via-[#253b68] to-[#5146E5]" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-sm" /> : <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-50 text-indigo-700 shadow-sm"><UserRound size={38} /></span>}
            {isOwner && <Link href="/dashboard/profile" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Edit your profile</Link>}
          </div>
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-slate-900">{profile.display_name}</h1>{profile.verification_status === 'verified' && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"><BadgeCheck size={13} />Affiliation verified</span>}</div>
            <p className="mt-2 text-sm text-slate-600">{profile.department || 'Department not set'}{profile.study_year ? ` · Study year ${profile.study_year}` : ''}</p>
            {profile.degree_program && <p className="mt-1 text-sm text-slate-500">{profile.degree_program}</p>}
          </div>
          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><BriefcaseBusiness size={16} className="text-indigo-600" />About</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{profile.bio || 'This person has not added a biography.'}</p></div>
            <div><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><CalendarDays size={16} className="text-indigo-600" />Academic timeline</h2><dl className="mt-2 space-y-2 text-sm"><div><dt className="inline text-slate-500">Admission batch: </dt><dd className="inline font-medium text-slate-800">{profile.batch_year ?? 'Not shared'}</dd></div><div><dt className="inline text-slate-500">Graduation year: </dt><dd className="inline font-medium text-slate-800">{profile.graduation_year ?? 'Not shared'}</dd></div></dl></div>
          </div>
          <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div><h2 className="text-sm font-bold text-slate-900">Skills</h2>{profile.skills.length ? <div className="mt-3 flex flex-wrap gap-2">{profile.skills.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">{item}</span>)}</div> : <p className="mt-2 text-sm text-slate-500">No skills shared yet.</p>}</div>
            <div><h2 className="text-sm font-bold text-slate-900">Interests</h2>{profile.interests.length ? <div className="mt-3 flex flex-wrap gap-2">{profile.interests.map((item) => <span key={item} className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-800">{item}</span>)}</div> : <p className="mt-2 text-sm text-slate-500">No interests shared yet.</p>}</div>
          </div>
        </div>
      </section>
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0" />Academic details may be self-reported. The verified badge appears only when an authorized workflow has marked the affiliation verified.</p>
    </div>
  );
}
