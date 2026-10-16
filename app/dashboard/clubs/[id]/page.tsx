'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, LoaderCircle, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ClubRecord = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  institution_id: string | null;
  approval_status: string;
  category: string | null;
  logo_url: string | null;
};
type Membership = { club_id: string; user_id: string; role: 'member' | 'core_member' | 'coordinator'; status: 'pending' | 'active' | 'rejected'; created_at: string };
type ClubEvent = { id: string; title: string; description: string; starts_at: string | null; location: string | null; category: string | null };

export default function ClubDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clubId = params.id;
  const [club, setClub] = useState<ClubRecord | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadClub = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/clubs');
        return;
      }
      setUserId(authData.user.id);
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id, name, description, created_by, created_at, institution_id, approval_status, category, logo_url')
        .eq('id', clubId)
        .single();
      if (clubError) throw clubError;
      setClub(clubData as ClubRecord);

      const [membershipResult, eventResult] = await Promise.all([
        supabase.from('club_memberships')
          .select('club_id, user_id, role, status, created_at')
          .eq('club_id', clubId)
          .eq('user_id', authData.user.id)
          .maybeSingle(),
        supabase.from('events')
          .select('id, title, description, starts_at, location, category')
          .eq('club_id', clubId)
          .eq('status', 'published')
          .order('starts_at', { ascending: true, nullsFirst: false })
          .limit(20),
      ]);
      if (membershipResult.error) throw membershipResult.error;
      if (eventResult.error) throw eventResult.error;
      setMembership(membershipResult.data as Membership | null);
      setEvents((eventResult.data ?? []) as ClubEvent[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'This club is not available to your account.');
    } finally { setLoading(false); }
  }, [clubId, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads the requested club from Supabase after route parameters are available.
  useEffect(() => { void loadClub(); }, [loadClub]);

  async function requestMembership() {
    if (!club) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: requestError } = await supabase.from('club_memberships').insert({
        club_id: club.id, user_id: userId, role: 'member', status: 'pending',
      });
      if (requestError) throw requestError;
      setNotice('Your join request was saved. You are not a member until the coordinator approves it.');
      await loadClub();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to request membership.');
    } finally { setSaving(false); }
  }

  async function leaveClub() {
    if (!club || !membership) return;
    if (!window.confirm('Leave this club? You will lose member and core-room access.')) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: leaveError } = await supabase.from('club_memberships').delete().eq('club_id', club.id).eq('user_id', userId);
      if (leaveError) throw leaveError;
      setNotice('You have left the club.');
      await loadClub();
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : 'Unable to leave the club.');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading club details…</div>;
  if (!club) return <div className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-2xl border border-slate-200 bg-white p-6"><AlertCircle size={25} className="mb-3 text-amber-600" /><h1 className="text-xl font-bold text-slate-900">Club not available</h1><p className="mt-2 text-sm leading-6 text-slate-600">{error || 'This club may be pending approval or unavailable to your account.'}</p><Link href="/dashboard/clubs" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"><ArrowLeft size={15} />Back to clubs</Link></div></div>;

  const isApproved = club.approval_status === 'approved';
  const isActive = membership?.status === 'active';
  const isPending = membership?.status === 'pending';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/dashboard/clubs" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:underline"><ArrowLeft size={15} />All clubs</Link>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#14213D] via-[#253b68] to-[#5146E5]" />
        <div className="p-5 sm:p-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-50 text-indigo-700 shadow-sm">{club.logo_url ? <img src={club.logo_url} alt="" className="h-full w-full object-cover" /> : <Users size={30} />}</div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/dashboard/messages?club=${club.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><MessageCircle size={16} />Open rooms</Link>
              {isApproved && isActive ? <button disabled={saving} onClick={() => void leaveClub()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50">Leave club</button> : isApproved && isPending ? <span className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900">Request pending</span> : isApproved ? <button disabled={saving} onClick={() => void requestMembership()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Submitting…' : 'Request to join'}</button> : null}
            </div>
          </div>
          <div className="mt-4"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-slate-900">{club.name}</h1>{isApproved && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"><ShieldCheck size={13} />Approved club</span>}</div><p className="mt-1 text-sm text-slate-500">{club.category || 'Campus club'} · Created {new Date(club.created_at).toLocaleDateString()}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{club.description || 'No description has been provided.'}</p></div>
          {!isApproved && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">This club proposal has not been approved. Membership and room access are unavailable until the authorized administrator or campus President approves it.</div>}
          {membership && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Your status: <strong className="capitalize">{membership.status.replace('_', ' ')}</strong>{membership.status === 'active' && <> · Role: <strong>{membership.role.replace('_', ' ')}</strong></>}</div>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><CalendarDays size={19} className="text-indigo-600" /><h2 className="font-bold text-slate-900">Published club events</h2></div><div className="mt-4 space-y-3">{events.length === 0 && <p className="text-sm text-slate-500">There are no published events for this club yet.</p>}{events.map((event) => <article key={event.id} className="rounded-xl border border-slate-100 p-3"><h3 className="font-semibold text-slate-900">{event.title}</h3><p className="mt-1 text-xs text-slate-500">{event.starts_at ? new Date(event.starts_at).toLocaleString() : 'Date to be announced'}{event.location ? ` · ${event.location}` : ''}</p>{event.description && <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p>}</article>)}</div>
        {isActive && <p className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-950">Your active membership grants access according to the club role. Core Team access is limited to Core Members and Coordinators.</p>}
      </section>
    </div>
  );
}
