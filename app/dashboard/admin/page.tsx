'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  Megaphone,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type RoleName = 'institution_admin' | 'president' | 'technical_gs' | 'cultural_gs' | 'moderator' | 'club_coordinator';
type RoleRequest = {
  id: string;
  institution_id: string;
  user_id: string;
  requested_role: RoleName;
  club_id: string | null;
  rationale: string;
  status: string;
  created_at: string;
  profiles?: { display_name: string; department: string | null } | null;
  clubs?: { name: string; category: string | null } | null;
};
type ClubProposal = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  approval_status: string;
  created_at: string;
  created_by: string;
};
type Announcement = { id: string; title: string; body: string; priority: string; status: string; published_at: string | null };

const labelByRole: Record<RoleName, string> = {
  institution_admin: 'Institution Administrator',
  president: 'Campus President',
  technical_gs: 'General Secretary — Technical Council',
  cultural_gs: 'General Secretary — Cultural Council',
  moderator: 'Moderator',
  club_coordinator: 'Club Coordinator',
};

function shortDate(value: string) {
  return new Date(value).toLocaleDateString([], { dateStyle: 'medium' });
}

export default function AdminPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [clubs, setClubs] = useState<ClubProposal[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const loadData = useCallback(async () => {
    setLoading(true); setError(''); setAccessDenied(false);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/admin');
        return;
      }
      const user = authData.user;
      setUserId(user.id);
      if (!user.email_confirmed_at || !/^[^@\s]+@iitbhilai\.ac\.in$/i.test(user.email ?? '')) {
        throw new Error('A confirmed @iitbhilai.ac.in email is required.');
      }

      const [profileResult, rolesResult, platformAdminResult] = await Promise.all([
        supabase.from('profiles').select('institution_id').eq('id', user.id).single(),
        supabase.from('institution_roles').select('role').eq('user_id', user.id).eq('status', 'active'),
        supabase.rpc('is_platform_admin'),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (rolesResult.error) throw rolesResult.error;
      const activeRoles = (rolesResult.data ?? []).map((item: { role: string }) => item.role as RoleName);
      const platformAdmin = !platformAdminResult.error && platformAdminResult.data === true;
      setRoles(activeRoles);
      setIsPlatformAdmin(platformAdmin);
      setInstitutionId((profileResult.data as { institution_id: string | null }).institution_id);

      const permitted = platformAdmin || activeRoles.some((role) =>
        ['institution_admin', 'president', 'technical_gs', 'cultural_gs'].includes(role)
      );
      if (!permitted) {
        setAccessDenied(true);
        return;
      }

      const [requestsResult, clubsResult, announcementsResult] = await Promise.all([
        supabase.from('institution_role_requests')
          .select('id, institution_id, user_id, requested_role, club_id, rationale, status, created_at, profiles:profiles!institution_role_requests_user_id_fkey(display_name, department), clubs:clubs!institution_role_requests_club_id_fkey(name, category)')
          .eq('status', 'pending')
          .order('created_at', { ascending: true }),
        supabase.from('clubs')
          .select('id, name, description, category, approval_status, created_at, created_by')
          .in('approval_status', ['pending', 'draft'])
          .order('created_at', { ascending: true }),
        supabase.from('announcements')
          .select('id, title, body, priority, status, published_at')
          .order('created_at', { ascending: false })
          .limit(20),
      ]);
      if (requestsResult.error) throw requestsResult.error;
      if (clubsResult.error) throw clubsResult.error;
      // Privacy rules may hide some profiles or announcements; a failed optional
      // list should not grant additional privileges or prevent the basic queue.
      setRoleRequests((requestsResult.data ?? []) as unknown as RoleRequest[]);
      setClubs((clubsResult.data ?? []) as ClubProposal[]);
      setAnnouncements((announcementsResult.data ?? []) as Announcement[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load governance data.');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void loadData(); }, [loadData]);

  const admin = isPlatformAdmin || roles.includes('institution_admin');
  const president = roles.includes('president');
  const technicalGs = roles.includes('technical_gs');
  const culturalGs = roles.includes('cultural_gs');
  const canManageAnnouncements = admin || president || technicalGs || culturalGs;
  const canApproveClubs = admin || president;
  const pendingRequests = useMemo(() => roleRequests.filter((item) => item.status === 'pending'), [roleRequests]);

  async function decideRequest(request: RoleRequest, decision: 'approved' | 'rejected') {
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: decisionError } = await supabase.rpc('decide_institution_role_request', {
        p_request_id: request.id,
        p_decision: decision,
      });
      if (decisionError) throw decisionError;
      setNotice(decision === 'approved'
        ? `${labelByRole[request.requested_role]} approved. The trusted role grant was saved by the database.`
        : 'Governance request rejected.');
      await loadData();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'The database rejected this decision.');
    } finally { setSaving(false); }
  }

  async function decideClub(club: ClubProposal, status: 'approved' | 'rejected') {
    if (!canApproveClubs) {
      setError('Only the platform/institution administrator or campus president can approve club proposals.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: updateError } = await supabase.from('clubs').update({ approval_status: status }).eq('id', club.id);
      if (updateError) throw updateError;
      setNotice(status === 'approved'
        ? `“${club.name}” was approved. The database controls its rooms and membership from here.`
        : `“${club.name}” was rejected.`);
      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update club approval status.');
    } finally { setSaving(false); }
  }

  async function publishAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!institutionId) { setError('The authorized administrator must initialize the IIT Bhilai tenant first.'); return; }
    if (!canManageAnnouncements) { setError('Your role cannot publish institute announcements.'); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: insertError } = await supabase.from('announcements').insert({
        institution_id: institutionId,
        created_by: userId,
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        priority: announcementPriority,
        status: 'published',
        published_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
      setAnnouncementTitle(''); setAnnouncementBody(''); setAnnouncementPriority('normal');
      setNotice('Announcement published to the configured campus audience.');
      await loadData();
    } catch (insertError) {
      setError(insertError instanceof Error ? insertError.message : 'Unable to publish the announcement.');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Checking governance permissions…</div>;

  if (accessDenied) {
    return <div className="mx-auto max-w-2xl px-4 py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6"><ShieldCheck size={30} className="mb-3 text-slate-400" /><h1 className="text-xl font-bold text-slate-900">Governance access is restricted</h1><p className="mt-2 text-sm leading-6 text-slate-600">This area is for the designated campus administrator, president, and General Secretaries. A student account cannot self-assign these roles.</p><Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Return to dashboard</Link></section></div>;
  }

  const displayedRequests = pendingRequests.filter((request) => {
    if (request.requested_role === 'institution_admin') return false;
    if (request.requested_role !== 'club_coordinator') return isPlatformAdmin;
    return admin || president ||
      (technicalGs && /sci[- ]?tech|technical|engineering|robot|electronics|computer|coding|science|data science|artificial intelligence|innovation|startup/i.test(request.clubs?.category ?? '')) ||
      (culturalGs && /culture|art|music|dance|film|photo|literary|oratory|debate|performing/i.test(request.clubs?.category ?? ''));
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Restricted campus governance</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Governance & approvals</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Only your database-granted role determines what can be approved. The UI cannot grant administrator, president, General Secretary or coordinator privileges.</p></div>
        <div className="flex flex-wrap gap-2">{admin && <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800">Administrator</span>}{president && <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800">President</span>}{technicalGs && <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800">Technical GS</span>}{culturalGs && <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800">Cultural GS</span>}</div>
      </div>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</div>}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Users size={19} className="text-indigo-600" /><p className="mt-3 text-2xl font-bold text-slate-900">{clubs.length}</p><p className="text-xs text-slate-500">Club proposals in view</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><ClipboardCheck size={19} className="text-indigo-600" /><p className="mt-3 text-2xl font-bold text-slate-900">{displayedRequests.length}</p><p className="text-xs text-slate-500">Leadership requests in view</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Megaphone size={19} className="text-indigo-600" /><p className="mt-3 text-2xl font-bold text-slate-900">{announcements.length}</p><p className="text-xs text-slate-500">Recent announcements in view</p></div>
      </div>

      <div className="space-y-6">
        {canApproveClubs && <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Building2 size={20} /></div><div><h2 className="font-bold text-slate-900">Club charter approvals</h2><p className="mt-1 text-sm leading-5 text-slate-600">Only an authorized administrator or the campus president can approve or reject a club proposal. The database controls the approval status.</p></div></div>
          <div className="mt-4 space-y-3">{clubs.length === 0 && <p className="text-sm text-slate-500">No proposals are waiting for your decision.</p>}{clubs.map((club) => <article key={club.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 p-4"><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{club.name}</h3><p className="mt-1 text-xs text-slate-500">{club.category || 'Uncategorised'} · submitted {shortDate(club.created_at)}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{club.description}</p><span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-amber-900">{club.approval_status}</span></div><div className="flex gap-2"><button disabled={saving} onClick={() => void decideClub(club, 'rejected')} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"><X size={13} />Reject</button><button disabled={saving} onClick={() => void decideClub(club, 'approved')} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"><Check size={13} />Approve</button></div></article>)}</div>
        </section>}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><ShieldCheck size={20} /></div><div><h2 className="font-bold text-slate-900">Leadership and coordinator requests</h2><p className="mt-1 text-sm leading-5 text-slate-600">Campus administrator appoints the president and General Secretaries. The responsible General Secretary reviews coordinator requests by club category; the president or administrator can oversee all categories.</p></div></div>
          <div className="mt-4 space-y-3">
            {displayedRequests.length === 0 && <p className="text-sm text-slate-500">No governance requests require a decision from your role.</p>}
            {displayedRequests.map((request) => <article key={request.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 p-4"><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{request.profiles?.display_name ?? 'Campus member'}</h3><p className="mt-1 text-xs text-slate-500">{request.profiles?.department ?? 'Department not shared'} · submitted {shortDate(request.created_at)}</p><p className="mt-2 text-sm font-semibold text-indigo-800">{labelByRole[request.requested_role]}</p>{request.clubs && <p className="mt-1 text-xs text-slate-600">{request.clubs.name} · {request.clubs.category ?? 'Category not set'}</p>}{request.rationale && <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-600">{request.rationale}</p>}</div><div className="flex gap-2"><button disabled={saving} onClick={() => void decideRequest(request, 'rejected')} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"><X size={13} />Reject</button><button disabled={saving} onClick={() => void decideRequest(request, 'approved')} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"><Check size={13} />Approve</button></div></article>)}
          </div>
          {admin && <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-950">Institution administrator role cannot be requested or approved from this interface. It is assigned only through the owner-controlled, private email allowlist and bootstrap workflow.</p>}
        </section>

        {canManageAnnouncements && <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Megaphone size={20} /></div><div><h2 className="font-bold text-slate-900">Campus announcement</h2><p className="mt-1 text-sm leading-5 text-slate-600">Publish a database-backed announcement to the configured campus audience. This does not claim the message is an IIT Bhilai official notice unless properly authorized.</p></div></div>
          <form onSubmit={publishAnnouncement} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="announcementTitle" className="mb-1.5 block text-xs font-semibold text-slate-700">Title</label><input id="announcementTitle" required maxLength={180} value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500" /></div>
            <div><label htmlFor="announcementPriority" className="mb-1.5 block text-xs font-semibold text-slate-700">Priority</label><select id="announcementPriority" value={announcementPriority} onChange={(e) => setAnnouncementPriority(e.target.value as 'normal' | 'important' | 'urgent')} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select></div>
            <div className="sm:col-span-2"><label htmlFor="announcementBody" className="mb-1.5 block text-xs font-semibold text-slate-700">Message</label><textarea id="announcementBody" required maxLength={10000} rows={4} value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-500" /></div>
            <div className="sm:col-span-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving && <LoaderCircle size={15} className="animate-spin" />}Publish announcement</button></div>
          </form>
        </section>}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold text-slate-900">Recent announcements</h2>
          <div className="mt-4 space-y-3">{announcements.length === 0 && <p className="text-sm text-slate-500">No announcements visible to your account.</p>}{announcements.map((item) => <article key={item.id} className="rounded-xl border border-slate-100 p-3"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{item.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600">{item.status}</span><span className="text-[10px] uppercase tracking-wide text-slate-400">{item.priority}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.body}</p></article>)}</div>
        </section>
      </div>
    </div>
  );
}
