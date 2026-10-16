'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Crown,
  LoaderCircle,
  MailPlus,
  MessageCircle,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type ClubRecord = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
  institution_id: string | null;
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
};

type MemberRecord = {
  club_id: string;
  user_id: string;
  role: 'member' | 'core_member' | 'coordinator';
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  profiles: {
    display_name: string;
    department: string | null;
    degree_program: string | null;
    avatar_url: string | null;
  } | null;
};

type InvitationRecord = {
  id: string;
  club_id: string;
  invitee_id: string;
  invited_by: string;
  invited_role: 'member' | 'core_member';
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';
  message: string;
  created_at: string;
};

type CampusProfile = {
  id: string;
  display_name: string;
  department: string | null;
  degree_program: string | null;
};

type Panel = 'overview' | 'members' | 'requests' | 'invitations';

const panelOptions: { id: Panel; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'requests', label: 'Join requests' },
  { id: 'invitations', label: 'Invitations' },
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#C65D43] focus:ring-4 focus:ring-[#C65D43]/10';
const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#C65D43] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A94832] disabled:cursor-not-allowed disabled:opacity-50';

function RolePill({ role }: { role: string }) {
  const style = role === 'coordinator'
    ? 'border-[#D9E8DE] bg-[#EEF5EF] text-[#235845]'
    : role === 'core_member'
      ? 'border-[#EAE3F3] bg-[#F4EFF8] text-[#654B7C]'
      : 'border-slate-200 bg-slate-50 text-slate-700';
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${style}`}>{role === 'coordinator' ? <Crown size={11}/> : role === 'core_member' ? <ShieldCheck size={11}/> : <Users size={11}/>} {role.replace('_', ' ')}</span>;
}

function StatusPill({ status }: { status: string }) {
  const classes = status === 'active' || status === 'accepted'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'rejected' || status === 'declined' || status === 'expired'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : 'border-amber-200 bg-amber-50 text-amber-900';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${classes}`}>{status.replace('_', ' ')}</span>;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'K';
}

function dateLabel(value: string): string {
  return new Date(value).toLocaleDateString([], { dateStyle: 'medium' });
}

export default function ClubLeaderDashboard() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clubId = params.id;

  const [club, setClub] = useState<ClubRecord | null>(null);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [people, setPeople] = useState<CampusProfile[]>([]);
  const [userId, setUserId] = useState('');
  const [activeRoles, setActiveRoles] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel>('overview');
  const [search, setSearch] = useState('');
  const [inviteeId, setInviteeId] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'core_member'>('member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const configError = getSupabaseConfigError();
      if (configError) throw new Error(configError);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData.user;
      if (authError || !user) {
        router.replace('/auth/signin?next=' + encodeURIComponent('/dashboard/clubs/' + clubId + '/dashboard'));
        return;
      }
      const email = (user.email ?? '').trim().toLowerCase();
      if (!user.email_confirmed_at || !/^[^@\s]+@iitbhilai\.ac\.in$/i.test(email)) {
        router.replace('/auth/signin?reason=campus-email-required');
        return;
      }
      setUserId(user.id);

      const [clubResult, rolesResult, membershipResult] = await Promise.all([
        supabase.from('clubs')
          .select('id, name, description, category, logo_url, created_by, created_at, institution_id, approval_status')
          .eq('id', clubId)
          .single(),
        supabase.from('institution_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .is('club_id', null),
        supabase.from('club_memberships')
          .select('club_id, user_id, role, status, created_at')
          .eq('club_id', clubId)
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (clubResult.error) throw clubResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (membershipResult.error) throw membershipResult.error;

      const currentClub = clubResult.data as ClubRecord;
      const roles = (rolesResult.data ?? []).map((item: { role: string }) => item.role);
      const myMembership = membershipResult.data as Pick<MemberRecord, 'club_id' | 'user_id' | 'role' | 'status' | 'created_at'> | null;
      const isExecutive = roles.some((role) => ['institution_admin', 'president'].includes(role));
      const canManage = isExecutive || (myMembership?.status === 'active' && myMembership.role === 'coordinator');

      setClub(currentClub);
      setActiveRoles(roles);

      if (!canManage) {
        setMembers([]);
        setInvitations([]);
        setPeople([]);
        setError('This workspace is restricted to the club coordinator, campus president and administrator. A pending join request does not grant management access.');
        return;
      }

      const [membersResult, invitationsResult, peopleResult] = await Promise.all([
        supabase.from('club_memberships')
          .select('club_id, user_id, role, status, created_at, profiles:profiles!club_memberships_user_id_fkey(display_name, department, degree_program, avatar_url)')
          .eq('club_id', clubId)
          .order('created_at', { ascending: false }),
        supabase.from('club_member_invitations')
          .select('id, club_id, invitee_id, invited_by, invited_role, status, message, created_at')
          .eq('club_id', clubId)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('profiles')
          .select('id, display_name, department, degree_program')
          .neq('id', user.id)
          .order('display_name')
          .limit(100),
      ]);

      if (membersResult.error) throw membersResult.error;
      if (invitationsResult.error) throw invitationsResult.error;
      if (peopleResult.error) throw peopleResult.error;

      setMembers((membersResult.data ?? []) as unknown as MemberRecord[]);
      setInvitations((invitationsResult.data ?? []) as InvitationRecord[]);
      setPeople((peopleResult.data ?? []) as CampusProfile[]);
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load the club workspace from Supabase.'));
    } finally {
      setLoading(false);
    }
  }, [clubId, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Load authenticated, role-checked workspace data after route parameters are available.
  useEffect(() => { void loadWorkspace(); }, [loadWorkspace]);

  const executive = activeRoles.some((role) => ['institution_admin', 'president'].includes(role));
  const myMembership = members.find((member) => member.user_id === userId);
  const activeMembers = members.filter((member) => member.status === 'active');
  const pendingMembers = members.filter((member) => member.status === 'pending');
  const pendingInvitations = invitations.filter((invitation) => invitation.status === 'pending');
  const filteredMembers = useMemo(() => activeMembers.filter((member) => {
    const name = member.profiles?.display_name ?? 'Campus member';
    const department = member.profiles?.department ?? '';
    const query = search.trim().toLowerCase();
    return !query || name.toLowerCase().includes(query) || department.toLowerCase().includes(query);
  }), [activeMembers, search]);
  const isAuthorized = executive || (myMembership?.role === 'coordinator' && myMembership.status === 'active');

  async function reviewMembership(member: MemberRecord, decision: 'active' | 'rejected') {
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: updateError } = await supabase.from('club_memberships')
        .update({ status: decision })
        .eq('club_id', clubId)
        .eq('user_id', member.user_id);
      if (updateError) throw updateError;
      setNotice(decision === 'active' ? 'Membership approved. The database has granted the member access allowed by their role.' : 'Membership request rejected.');
      await loadWorkspace();
    } catch (reviewError) {
      setError(supabaseErrorMessage(reviewError, 'Unable to review this membership request.'));
    } finally {
      setSaving(false);
    }
  }

  async function promoteCoreMember(member: MemberRecord) {
    if (member.role === 'coordinator') return;
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: promoteError } = await supabase.rpc('promote_club_core_member', {
        p_club_id: clubId,
        p_user_id: member.user_id,
      });
      if (promoteError) throw promoteError;
      setNotice('Core Member promotion saved. Core Team access follows the database membership role.');
      await loadWorkspace();
    } catch (promoteError) {
      setError(supabaseErrorMessage(promoteError, 'Unable to promote this member to Core Member.'));
    } finally {
      setSaving(false);
    }
  }

  async function inviteSelectedMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteeId) {
      setError('Choose a campus profile to invite.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: inviteError } = await supabase.rpc('invite_club_member', {
        p_club_id: clubId,
        p_invitee_id: inviteeId,
        p_invited_role: inviteRole,
        p_message: inviteMessage.trim(),
      });
      if (inviteError) throw inviteError;
      const selectedName = people.find((person) => person.id === inviteeId)?.display_name ?? 'The selected member';
      setInviteMessage('');
      setNotice(`Invitation sent to ${selectedName}. They must accept before membership becomes active.`);
      setPanel('invitations');
      await loadWorkspace();
    } catch (inviteError) {
      setError(supabaseErrorMessage(inviteError, 'Unable to create a club invitation.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[45vh] items-center justify-center text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin"/> Loading the real club workspace…</div>;
  }

  if (!club) {
    return <div className="mx-auto max-w-3xl px-4 py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6"><AlertCircle size={28} className="mb-3 text-amber-600"/><h1 className="text-xl font-bold text-slate-900">Club workspace unavailable</h1><p className="mt-2 text-sm leading-6 text-slate-600">{error || 'This club may be pending approval or unavailable to your account.'}</p><Link href="/dashboard/clubs" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A94832] hover:underline"><ArrowLeft size={15}/>All clubs</Link></section></div>;
  }

  if (!isAuthorized) {
    return <div className="mx-auto max-w-3xl px-4 py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6"><ShieldCheck size={28} className="mb-3 text-amber-600"/><h1 className="text-xl font-bold text-slate-900">Management access is restricted</h1><p className="mt-2 text-sm leading-6 text-slate-600">{error || 'Only this club’s active coordinator, the campus president, or the administrator can use the management workspace.'}</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/dashboard/clubs/${club.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><ArrowLeft size={15}/>Back to club details</Link><Link href="/dashboard/clubs" className="inline-flex items-center rounded-xl bg-[#C65D43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A94832]">All clubs</Link></div></section></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/dashboard/clubs/${club.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A94832] hover:underline"><ArrowLeft size={15}/>Back to club details</Link>
        <Link href="/dashboard/clubs" className="text-xs font-semibold text-slate-500 hover:text-[#A94832]">All clubs</Link>
      </div>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0"/><span className="break-words">{error}</span></div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0"/><span>{notice}</span></div>}

      <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#173D36] via-[#24584D] to-[#C65D43] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            {club.logo_url ? <img src={club.logo_url} alt="" className="h-14 w-14 shrink-0 rounded-2xl border border-white/20 object-cover"/> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10"><Users size={27}/></div>}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-amber-100">Club management</p>
              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">{club.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{club.description || 'Manage real membership, roles and invitations for your campus community.'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2"><StatusPill status={club.approval_status}/>{club.category && <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white/85">{club.category}</span>}{executive && <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white"><BadgeCheck size={11}/>Campus oversight</span>}</div>
            </div>
          </div>
          <Link href={`/dashboard/messages?club=${club.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#173D36] transition hover:bg-amber-50"><MessageCircle size={16}/>Open club rooms</Link>
        </div>
      </section>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Users size={19} className="text-[#C65D43]"/><p className="mt-3 text-2xl font-bold text-slate-900">{activeMembers.length}</p><p className="text-xs text-slate-500">Active members</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Clock3 size={19} className="text-[#8A6116]"/><p className="mt-3 text-2xl font-bold text-slate-900">{pendingMembers.length}</p><p className="text-xs text-slate-500">Pending join requests</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><MailPlus size={19} className="text-[#654B7C]"/><p className="mt-3 text-2xl font-bold text-slate-900">{pendingInvitations.length}</p><p className="text-xs text-slate-500">Awaiting invitation response</p></div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {panelOptions.map((item) => <button key={item.id} type="button" onClick={() => setPanel(item.id)} aria-pressed={panel === item.id} className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${panel === item.id ? 'bg-[#173D36] text-white' : 'text-slate-600 hover:bg-white'}`}>{item.label}{item.id === 'requests' && pendingMembers.length > 0 ? ` · ${pendingMembers.length}` : item.id === 'invitations' && pendingInvitations.length > 0 ? ` · ${pendingInvitations.length}` : ''}</button>)}
      </div>

      {panel === 'overview' && (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.85fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">How your club works</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Every action below writes to Supabase. Member status, Core Member promotion, and invitations are checked again by database permissions, so a client-side button cannot grant access by itself.</p>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-[#D9E8DE] bg-[#F0F6F0] p-3.5"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#267354]"/><div><h3 className="text-sm font-bold text-[#235845]">General room</h3><p className="mt-1 text-xs leading-5 text-[#4F6D5A]">Available to confirmed IIT Bhilai email accounts once the club is approved.</p></div></div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5"><Users size={18} className="mt-0.5 shrink-0 text-slate-600"/><div><h3 className="text-sm font-bold text-slate-800">Members room</h3><p className="mt-1 text-xs leading-5 text-slate-600">Only active members, Core Members and the Coordinator can read or send messages.</p></div></div>
              <div className="flex items-start gap-3 rounded-xl border border-[#EAE3F3] bg-[#F7F2FA] p-3.5"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#654B7C]"/><div><h3 className="text-sm font-bold text-[#654B7C]">Core Team room</h3><p className="mt-1 text-xs leading-5 text-[#765F88]">Only active Core Members and the Coordinator can access this private club space.</p></div></div>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Invite a selected member</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Use after your club&apos;s selection/interview process. An invitee must explicitly accept before membership is activated.</p>
            <form onSubmit={inviteSelectedMember} className="mt-4 space-y-3">
              <div><label htmlFor="invitee" className="mb-1.5 block text-xs font-semibold text-slate-700">Campus profile</label><select id="invitee" required value={inviteeId} onChange={(event) => setInviteeId(event.target.value)} className={inputClass}><option value="">Choose a student profile</option>{people.map((person) => <option key={person.id} value={person.id}>{person.display_name}{person.department ? ` · ${person.department}` : ''}</option>)}</select></div>
              <div><label htmlFor="inviteRole" className="mb-1.5 block text-xs font-semibold text-slate-700">Role offered</label><select id="inviteRole" value={inviteRole} onChange={(event) => setInviteRole(event.target.value as 'member' | 'core_member')} className={inputClass}><option value="member">General Member</option><option value="core_member">Core Member</option></select></div>
              <div><label htmlFor="inviteMessage" className="mb-1.5 block text-xs font-semibold text-slate-700">Message (optional)</label><textarea id="inviteMessage" rows={3} maxLength={1200} value={inviteMessage} onChange={(event) => setInviteMessage(event.target.value)} className={inputClass} placeholder="Welcome, selected role, next steps…"/></div>
              <button type="submit" disabled={saving || club.approval_status !== 'approved'} className={`${primaryButtonClass} w-full`}>{saving ? <LoaderCircle size={15} className="animate-spin"/> : <MailPlus size={15}/>} Send invitation</button>
              {club.approval_status !== 'approved' && <p className="text-xs leading-5 text-amber-800">Invitations are enabled only after the club is approved.</p>}
            </form>
          </section>
        </div>
      )}

      {panel === 'members' && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-5">
            <div><h2 className="font-bold text-slate-900">Active club members</h2><p className="mt-1 text-xs text-slate-500">Member roles below come from the database, not demo rosters.</p></div>
            <div className="relative w-full max-w-xs"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or department…" className={`${inputClass} pl-9`}/></div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredMembers.length === 0 && <p className="p-6 text-sm text-slate-500">No active members match this search.</p>}
            {filteredMembers.map((member) => {
              const name = member.profiles?.display_name ?? 'Campus member';
              return <div key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">{member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover"/> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8E5DC] text-xs font-bold text-[#9F432E]">{initials(name)}</span>}<div className="min-w-0"><Link href={`/dashboard/profile/${member.user_id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-[#A94832]">{name}</Link><p className="mt-1 truncate text-xs text-slate-500">{member.profiles?.department ?? 'Department not shared'}{member.profiles?.degree_program ? ` · ${member.profiles.degree_program}` : ''}</p><p className="mt-1 text-[10px] text-slate-400">Joined record · {dateLabel(member.created_at)}</p></div></div>
                <div className="flex flex-wrap items-center gap-2"><RolePill role={member.role}/>{member.role === 'member' && <button type="button" disabled={saving || club.approval_status !== 'approved'} onClick={() => void promoteCoreMember(member)} className="rounded-lg border border-[#EAE3F3] px-3 py-2 text-xs font-semibold text-[#654B7C] transition hover:bg-[#F7F2FA] disabled:opacity-50">{saving ? 'Saving…' : 'Promote to Core'}</button>}</div>
              </div>;
            })}
          </div>
        </section>
      )}

      {panel === 'requests' && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 sm:px-5"><h2 className="font-bold text-slate-900">Pending join requests</h2><p className="mt-1 text-xs leading-5 text-slate-500">Review membership requests here. Approval activates only the General Member role; Core Member promotion is a separate decision.</p></div>
          <div className="divide-y divide-slate-100">
            {pendingMembers.length === 0 && <div className="p-8 text-center"><CheckCircle2 size={29} className="mx-auto mb-2 text-emerald-600"/><p className="text-sm font-semibold text-slate-800">No pending join requests</p><p className="mt-1 text-xs text-slate-500">New requests will appear here when students apply to join.</p></div>}
            {pendingMembers.map((member) => {
              const name = member.profiles?.display_name ?? 'Campus member';
              return <div key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5"><div className="flex min-w-0 items-center gap-3">{member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover"/> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8E5DC] text-xs font-bold text-[#9F432E]">{initials(name)}</span>}<div className="min-w-0"><Link href={`/dashboard/profile/${member.user_id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-[#A94832]">{name}</Link><p className="mt-1 text-xs text-slate-500">{member.profiles?.department ?? 'Department not shared'} · request received {dateLabel(member.created_at)}</p></div></div><div className="flex items-center gap-2"><button type="button" disabled={saving} onClick={() => void reviewMembership(member, 'rejected')} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><X size={13}/>Reject</button><button type="button" disabled={saving} onClick={() => void reviewMembership(member, 'active')} className="inline-flex items-center gap-1 rounded-lg bg-[#173D36] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0F2F29] disabled:opacity-50"><Check size={13}/>Approve member</button></div></div>;
            })}
          </div>
        </section>
      )}

      {panel === 'invitations' && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 sm:px-5"><h2 className="font-bold text-slate-900">Invitation status</h2><p className="mt-1 text-xs leading-5 text-slate-500">An invitation never activates membership on its own. The invitee must accept while signed in to their own account.</p></div>
          <div className="divide-y divide-slate-100">
            {invitations.length === 0 && <p className="p-6 text-sm text-slate-500">No invitations have been created for this club.</p>}
            {invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5"><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{people.find((person) => person.id === invitation.invitee_id)?.display_name ?? 'Invited campus member'}</p><p className="mt-1 text-xs text-slate-500">{invitation.invited_role.replace('_', ' ')} · sent {dateLabel(invitation.created_at)}</p>{invitation.message && <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{invitation.message}</p>}</div><StatusPill status={invitation.status}/></div>)}
          </div>
        </section>
      )}

      <p className="mt-5 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-950"><ShieldCheck size={15} className="mt-0.5 shrink-0"/> Every operation is checked by Supabase RLS/RPC. The interface cannot give a user a role that the database has not authorized.</p>
    </div>
  );
}
