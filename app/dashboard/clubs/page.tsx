'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  LoaderCircle,
  MailPlus,
  Plus,
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
  created_by: string;
  created_at: string;
  institution_id: string | null;
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  category: string | null;
  logo_url: string | null;
};

type MembershipRecord = {
  club_id: string;
  user_id: string;
  role: 'member' | 'core_member' | 'coordinator';
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  profiles?: { display_name: string; department: string | null; avatar_url: string | null } | null;
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

type RoleRequestRecord = {
  id: string;
  institution_id: string;
  user_id: string;
  requested_role: string;
  club_id: string | null;
  rationale: string;
  status: string;
  created_at: string;
  profiles?: { display_name: string; department: string | null } | null;
  clubs?: { name: string; category: string | null } | null;
};

type CampusProfile = {
  id: string;
  display_name: string;
  department: string | null;
  degree_program: string | null;
};

type Tab = 'discover' | 'mine' | 'requests' | 'governance';

const categories = [
  'Technology / Sci-Tech',
  'Engineering',
  'Science & Research',
  'Culture & Arts',
  'Literary & Debate',
  'Entrepreneurship',
  'Sports',
  'Other',
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-55';

function ErrorBanner({ children }: { children: string }) {
  return <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{children}</span></div>;
}

function StatePill({ status }: { status: string }) {
  const style = status === 'approved' || status === 'active' || status === 'accepted'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'rejected' || status === 'declined' || status === 'suspended'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : 'border-amber-200 bg-amber-50 text-amber-900';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${style}`}>{status.replaceAll('_', ' ')}</span>;
}

export default function ClubsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequestRecord[]>([]);
  const [campusProfiles, setCampusProfiles] = useState<CampusProfile[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('discover');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newClubName, setNewClubName] = useState('');
  const [newClubCategory, setNewClubCategory] = useState(categories[0]);
  const [newClubDescription, setNewClubDescription] = useState('');
  const [showCreateClub, setShowCreateClub] = useState(false);

  const [inviteClubId, setInviteClubId] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'core_member'>('member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [requestedRole, setRequestedRole] = useState<'president' | 'technical_gs' | 'cultural_gs' | 'moderator'>('technical_gs');
  const [roleRationale, setRoleRationale] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/clubs');
        return;
      }
      setUserId(authData.user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, institution_id')
        .eq('id', authData.user.id)
        .single();
      if (profileError) throw profileError;
      setInstitutionId((profile as { institution_id: string | null }).institution_id);

      const [clubResult, membershipResult, invitationResult, roleResult, peopleResult] = await Promise.all([
        supabase.from('clubs')
          .select('id, name, description, created_by, created_at, institution_id, approval_status, category, logo_url')
          .order('name'),
        supabase.from('club_memberships')
          .select('club_id, user_id, role, status, created_at, profiles:profiles!club_memberships_user_id_fkey(display_name, department, avatar_url)')
          .order('created_at', { ascending: false }),
        supabase.from('club_member_invitations')
          .select('id, club_id, invitee_id, invited_by, invited_role, status, message, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('institution_role_requests')
          .select('id, institution_id, user_id, requested_role, club_id, rationale, status, created_at, profiles:profiles!institution_role_requests_user_id_fkey(display_name, department), clubs:clubs!institution_role_requests_club_id_fkey(name, category)')
          .order('created_at', { ascending: false }),
        supabase.from('profiles')
          .select('id, display_name, department, degree_program')
          .neq('id', authData.user.id)
          .order('display_name')
          .limit(100),
      ]);

      if (clubResult.error) throw clubResult.error;
      if (membershipResult.error) throw membershipResult.error;
      if (invitationResult.error) throw invitationResult.error;
      if (roleResult.error) throw roleResult.error;
      if (peopleResult.error) throw peopleResult.error;

      setClubs((clubResult.data ?? []) as ClubRecord[]);
      setMemberships((membershipResult.data ?? []) as unknown as MembershipRecord[]);
      setInvitations((invitationResult.data ?? []) as InvitationRecord[]);
      setRoleRequests((roleResult.data ?? []) as unknown as RoleRequestRecord[]);
      setCampusProfiles((peopleResult.data ?? []) as CampusProfile[]);
      const { data: userRoles } = await supabase
        .from('institution_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('status', 'active');
      setRoles((userRoles ?? []).map((item: { role: string }) => item.role));
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load club data from the database.'));
    } finally {
      setLoading(false);
    }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads account-scoped club state from Supabase after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads account-scoped club state from Supabase after mount.
  useEffect(() => { void loadData(); }, [loadData]);

  const activeMemberships = memberships.filter((item) => item.user_id === userId && item.status === 'active');
  const ownRequests = memberships.filter((item) => item.user_id === userId && item.status !== 'active');
  const invitationsForMe = invitations.filter((item) => item.invitee_id === userId && item.status === 'pending');
  const invitationsByMe = invitations.filter((item) => item.invited_by === userId && item.status === 'pending');
  const leadership = roles.some((role) => ['institution_admin', 'president', 'technical_gs', 'cultural_gs'].includes(role));
  const ownClubIds = new Set(activeMemberships.map((item) => item.club_id));
  const requestByClub = new Map(ownRequests.map((item) => [item.club_id, item]));
  const clubById = new Map(clubs.map((club) => [club.id, club]));

  const filteredClubs = useMemo(() => clubs.filter((club) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || club.name.toLowerCase().includes(query) || club.description.toLowerCase().includes(query);
    const matchesCategory = category === 'All' || (club.category ?? 'Other') === category;
    return club.approval_status === 'approved' && matchesSearch && matchesCategory;
  }), [clubs, search, category]);

  async function createClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!institutionId) {
      setError('Your campus tenant is not initialized yet. The authorized administrator must complete the tenant bootstrap before clubs can be created.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: insertError } = await supabase.from('clubs').insert({
        name: newClubName.trim(),
        category: newClubCategory,
        description: newClubDescription.trim(),
        created_by: userId,
        institution_id: institutionId,
        approval_status: 'pending',
      });
      if (insertError) throw insertError;
      setNewClubName(''); setNewClubDescription(''); setShowCreateClub(false);
      setSuccess('Club proposal submitted. It will appear as an approved club only after administrator/president approval.');
      await loadData();
    } catch (createError) {
      setError(supabaseErrorMessage(createError, 'Unable to submit the club proposal.'));
    } finally { setSaving(false); }
  }

  async function requestMembership(clubId: string) {
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: requestError } = await supabase.from('club_memberships').insert({
        club_id: clubId, user_id: userId, role: 'member', status: 'pending',
      });
      if (requestError) throw requestError;
      setSuccess('Membership request sent. You will become a member only after the club coordinator approves it.');
      await loadData();
    } catch (requestError) {
      setError(supabaseErrorMessage(requestError, 'Unable to submit the membership request. Check your existing request status.'));
    } finally { setSaving(false); }
  }

  async function leaveClub(clubId: string) {
    if (!window.confirm('Leave this club? You will lose access to member and core rooms.')) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: leaveError } = await supabase.from('club_memberships').delete().eq('club_id', clubId).eq('user_id', userId);
      if (leaveError) throw leaveError;
      setSuccess('You have left the club.');
      await loadData();
    } catch (leaveError) {
      setError(supabaseErrorMessage(leaveError, 'Unable to leave this club.'));
    } finally { setSaving(false); }
  }

  async function reviewMembership(membership: MembershipRecord, decision: 'active' | 'rejected') {
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: reviewError } = await supabase.from('club_memberships')
        .update({ status: decision })
        .eq('club_id', membership.club_id)
        .eq('user_id', membership.user_id);
      if (reviewError) throw reviewError;
      setSuccess(decision === 'active' ? 'Member approved. Their access is now enabled by database policies.' : 'Membership request rejected.');
      await loadData();
    } catch (reviewError) {
      setError(supabaseErrorMessage(reviewError, 'Unable to review membership request.'));
    } finally { setSaving(false); }
  }

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteClubId || !inviteUserId) { setError('Choose a club and a campus profile to invite.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: inviteError } = await supabase.rpc('invite_club_member', {
        p_club_id: inviteClubId,
        p_invitee_id: inviteUserId,
        p_invited_role: inviteRole,
        p_message: inviteMessage.trim(),
      });
      if (inviteError) throw inviteError;
      setInviteMessage('');
      setSuccess('Invitation sent. The selected student must accept it before membership becomes active.');
      await loadData();
    } catch (inviteError) {
      setError(supabaseErrorMessage(inviteError, 'Unable to send the club invitation.'));
    } finally { setSaving(false); }
  }

  async function respondToInvitation(invitation: InvitationRecord, accept: boolean) {
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: responseError } = await supabase.rpc('respond_to_club_invitation', {
        p_invitation_id: invitation.id,
        p_accept: accept,
      });
      if (responseError) throw responseError;
      setSuccess(accept ? 'Invitation accepted. Your membership is active now.' : 'Invitation declined.');
      await loadData();
    } catch (responseError) {
      setError(supabaseErrorMessage(responseError, 'Unable to respond to the invitation.'));
    } finally { setSaving(false); }
  }

  async function requestCampusLeadership(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!institutionId) { setError('The authorized administrator must finish the campus tenant setup first.'); return; }
    if (roleRequests.some((request) => request.user_id === userId && request.requested_role === requestedRole && request.status === 'pending')) {
      setError('You already have a pending request for this role.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: requestError } = await supabase.from('institution_role_requests').insert({
        institution_id: institutionId,
        user_id: userId,
        requested_role: requestedRole,
        club_id: null,
        rationale: roleRationale.trim(),
        status: 'pending',
      });
      if (requestError) throw requestError;
      setRoleRationale('');
      setSuccess('Leadership request submitted. It remains pending until the authorized administrator approves it.');
      await loadData();
    } catch (requestError) {
      setError(supabaseErrorMessage(requestError, 'Unable to submit leadership request.'));
    } finally { setSaving(false); }
  }

  async function requestCoordinator(club: ClubRecord) {
    if (!institutionId) { setError('The authorized administrator must finish the campus tenant setup first.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: requestError } = await supabase.from('institution_role_requests').insert({
        institution_id: institutionId,
        user_id: userId,
        requested_role: 'club_coordinator',
        club_id: club.id,
        rationale: 'Requesting coordinator consideration for this club.',
        status: 'pending',
      });
      if (requestError) throw requestError;
      setSuccess('Coordinator request submitted. The responsible General Secretary, president, or administrator must approve it.');
      await loadData();
    } catch (requestError) {
      setError(supabaseErrorMessage(requestError, 'Unable to request coordinator consideration.'));
    } finally { setSaving(false); }
  }

  async function decideRoleRequest(requestId: string, decision: 'approved' | 'rejected') {
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: decisionError } = await supabase.rpc('decide_institution_role_request', {
        p_request_id: requestId,
        p_decision: decision,
      });
      if (decisionError) throw decisionError;
      setSuccess(decision === 'approved' ? 'Governance request approved and the role grant saved.' : 'Governance request rejected.');
      await loadData();
    } catch (decisionError) {
      setError(supabaseErrorMessage(decisionError, 'Unable to decide this governance request.'));
    } finally { setSaving(false); }
  }

  const pendingMemberships = memberships.filter((item) => item.status === 'pending' && item.user_id !== userId);
  const pendingRoleRequests = roleRequests.filter((item) => item.status === 'pending' && leadership);
  const pendingClubApprovals = clubs.filter((club) =>
    ['pending', 'draft'].includes(club.approval_status) &&
    roles.some((role) => ['institution_admin', 'president'].includes(role))
  );
  const canManageClub = (clubId: string) =>
    activeMemberships.some((item) => item.club_id === clubId && item.role === 'coordinator') ||
    roles.some((role) => ['institution_admin', 'president'].includes(role));

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={18} /> Loading clubs from Supabase…</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Campus communities</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Clubs & governance</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Club membership is persistent. Join requests require coordinator approval; invited students must accept before membership is activated.</p>
        </div>
        <button onClick={() => setShowCreateClub((value) => !value)} className={buttonClass}><Plus size={16} /> Propose a club</button>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}
      {success && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><Check size={17} className="mt-0.5 shrink-0" />{success}</div>}

      {showCreateClub && (
        <form onSubmit={createClub} className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Submit a club proposal</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">New clubs start pending. The creator cannot self-approve or self-assign coordinator powers.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div><label htmlFor="clubName" className="mb-1.5 block text-sm font-semibold text-slate-700">Club name</label><input id="clubName" required maxLength={120} value={newClubName} onChange={(e) => setNewClubName(e.target.value)} className={inputClass} placeholder="e.g. Robotics and Automation Club" /></div>
            <div><label htmlFor="clubCategory" className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label><select id="clubCategory" value={newClubCategory} onChange={(e) => setNewClubCategory(e.target.value)} className={inputClass}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="md:col-span-2"><label htmlFor="clubDescription" className="mb-1.5 block text-sm font-semibold text-slate-700">Purpose and activities</label><textarea id="clubDescription" rows={3} maxLength={4000} required value={newClubDescription} onChange={(e) => setNewClubDescription(e.target.value)} className={inputClass} placeholder="What will the club do, and who is it for?" /></div>
          </div>
          <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowCreateClub(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={saving} className={buttonClass}>{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />} Submit proposal</button></div>
        </form>
      )}

      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {([
          ['discover', 'Discover clubs'],
          ['mine', 'My memberships'],
          ['requests', `Requests & invitations${ownRequests.length + invitationsForMe.length ? ` (${ownRequests.length + invitationsForMe.length})` : ''}`],
          ['governance', `Review queue${leadership ? ` (${pendingClubApprovals.length + pendingMemberships.length + pendingRoleRequests.length})` : ''}`],
        ] as [Tab, string][]).map(([value, label]) => (
          <button key={value} onClick={() => setTab(value)} className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${tab === value ? 'bg-[#14213D] text-white' : 'text-slate-600 hover:bg-white'}`}>{label}</button>
        ))}
      </div>

      {tab === 'discover' && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search approved clubs…" className={`${inputClass} pl-10`} /></div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          {filteredClubs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Users size={32} className="mx-auto mb-3 text-slate-300" /><h2 className="font-bold text-slate-800">No approved clubs to show yet</h2><p className="mt-2 text-sm text-slate-500">Only database-approved clubs appear here. You can propose a club for review.</p></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredClubs.map((club) => {
                const membership = requestByClub.get(club.id);
                const active = ownClubIds.has(club.id);
                const manager = canManageClub(club.id);
                return <article key={club.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 text-indigo-700">{club.logo_url ? <img src={club.logo_url} alt="" className="h-full w-full object-cover" /> : <Users size={23} />}</div>
                    <div className="min-w-0 flex-1"><h2 className="font-bold text-slate-900">{club.name}</h2><p className="mt-1 text-xs text-slate-500">{club.category || 'Campus club'}</p></div>
                    <BadgeCheck size={18} className="shrink-0 text-emerald-600" />
                  </div>
                  <p className="mt-4 line-clamp-4 flex-1 whitespace-pre-line text-sm leading-6 text-slate-600">{club.description || 'No club description provided yet.'}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    {active ? <span className="text-xs font-semibold text-emerald-700">Active member</span> : membership ? <StatePill status={membership.status} /> : <span className="text-xs text-slate-500">Approval-controlled membership</span>}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dashboard/messages?club=${club.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Rooms</Link>
                      {active ? <button disabled={saving} onClick={() => void leaveClub(club.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Leave</button> : !membership ? <button disabled={saving} onClick={() => void requestMembership(club.id)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Request to join</button> : null}
                    </div>
                  </div>
                  {manager && <button onClick={() => { setInviteClubId(club.id); setTab('governance'); }} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:underline"><MailPlus size={14} /> Invite selected members</button>}
                </article>;
              })}
            </div>
          )}
        </>
      )}

      {tab === 'mine' && (
        <div className="space-y-3">
          {activeMemberships.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">You have no active club memberships yet. Request to join an approved club or accept an invitation.</div> : activeMemberships.map((membership) => {
            const club = clubById.get(membership.club_id);
            if (!club) return null;
            return <div key={membership.club_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div><h2 className="font-bold text-slate-900">{club.name}</h2><p className="mt-1 text-xs text-slate-500">{club.category || 'Campus club'}</p></div>
              <div className="flex items-center gap-2"><StatePill status={membership.role} /><Link href={`/dashboard/messages?club=${club.id}`} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Open rooms</Link><button disabled={saving} onClick={() => void leaveClub(club.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Leave</button></div>
            </div>;
          })}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Invitations for you</h2>
            <p className="mt-1 text-xs text-slate-500">You become a member only after you accept an invitation.</p>
            <div className="mt-4 space-y-3">
              {invitationsForMe.length === 0 && <p className="text-sm text-slate-500">No pending invitations.</p>}
              {invitationsForMe.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><p className="font-semibold text-slate-900">{clubById.get(invitation.club_id)?.name ?? 'Club invitation'}</p><p className="mt-1 text-xs text-slate-500">Offered role: {invitation.invited_role.replace('_', ' ')}{invitation.message ? ` · ${invitation.message}` : ''}</p></div><div className="flex gap-2"><button disabled={saving} onClick={() => void respondToInvitation(invitation, false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"><X size={13} className="mr-1 inline" />Decline</button><button disabled={saving} onClick={() => void respondToInvitation(invitation, true)} className={`${buttonClass} px-3 py-2 text-xs`}><Check size={13} />Accept</button></div></div>)}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Your membership requests</h2>
            <div className="mt-4 space-y-3">
              {ownRequests.length === 0 && <p className="text-sm text-slate-500">No pending or rejected membership requests.</p>}
              {ownRequests.map((request) => <div key={request.club_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><p className="font-semibold text-slate-900">{clubById.get(request.club_id)?.name ?? 'Club'}</p><p className="mt-1 text-xs text-slate-500">Submitted {new Date(request.created_at).toLocaleDateString()}</p></div><StatePill status={request.status} /></div>)}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Invitations sent by you</h2>
            <div className="mt-4 space-y-3">
              {invitationsByMe.length === 0 && <p className="text-sm text-slate-500">No pending invitations sent.</p>}
              {invitationsByMe.map((invitation) => <div key={invitation.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><p className="font-semibold text-slate-900">{campusProfiles.find((person) => person.id === invitation.invitee_id)?.display_name ?? 'Campus member'}</p><p className="text-xs text-slate-500">{clubById.get(invitation.club_id)?.name ?? 'Club'} · {invitation.invited_role.replace('_', ' ')}</p></div><StatePill status={invitation.status} /></div>)}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Request campus leadership consideration</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">You may request consideration for campus President, Technical/Cultural General Secretary or Moderator. Only the authorized platform administrator can approve these institute-wide roles. Requesting does not grant access.</p>
            <form onSubmit={requestCampusLeadership} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="requestedCampusRole" className="mb-1.5 block text-xs font-semibold text-slate-700">Role requested</label>
                <select id="requestedCampusRole" value={requestedRole} onChange={(e) => setRequestedRole(e.target.value as 'president' | 'technical_gs' | 'cultural_gs' | 'moderator')} className={inputClass}>
                  <option value="president">Campus President</option>
                  <option value="technical_gs">General Secretary — Technical Council</option>
                  <option value="cultural_gs">General Secretary — Cultural Council</option>
                  <option value="moderator">Community Moderator</option>
                </select>
              </div>
              <div>
                <label htmlFor="roleRationale" className="mb-1.5 block text-xs font-semibold text-slate-700">Relevant experience / rationale</label>
                <input id="roleRationale" maxLength={2000} value={roleRationale} onChange={(e) => setRoleRationale(e.target.value)} className={inputClass} placeholder="Why are you requesting consideration?" />
              </div>
              <div className="sm:col-span-2"><button disabled={saving} className={buttonClass}><ShieldCheck size={15} />Submit role request</button></div>
            </form>
            {roleRequests.filter((request) => request.user_id === userId && request.requested_role !== 'club_coordinator').length > 0 && <div className="mt-4 space-y-2">{roleRequests.filter((request) => request.user_id === userId && request.requested_role !== 'club_coordinator').map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-xs"><span className="font-semibold text-slate-800">{request.requested_role.replaceAll('_', ' ')}</span><StatePill status={request.status} /></div>)}</div>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Coordinator consideration</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Coordinators are appointed after approval by the General Secretary responsible for that club category, the campus president, or the administrator. Membership alone never grants coordinator powers.</p>
            <div className="mt-4 space-y-3">
              {activeMemberships.filter((item) => item.role === 'member').map((membership) => {
                const club = clubById.get(membership.club_id);
                if (!club) return null;
                const hasRequest = roleRequests.some((req) => req.user_id === userId && req.club_id === club.id && req.status === 'pending' && req.requested_role === 'club_coordinator');
                return <div key={club.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><p className="font-semibold text-slate-900">{club.name}</p><p className="text-xs text-slate-500">Current role: member</p></div><button disabled={saving || hasRequest} onClick={() => void requestCoordinator(club)} className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50">{hasRequest ? 'Request pending' : 'Request coordinator review'}</button></div>;
              })}
            </div>
          </section>
        </div>
      )}

      {tab === 'governance' && (
        <div className="space-y-6">
          {!leadership && <div className="rounded-2xl border border-slate-200 bg-white p-6"><ShieldCheck className="mb-2 text-slate-400" size={25} /><h2 className="font-bold text-slate-900">Coordinator and executive review queue</h2><p className="mt-2 text-sm leading-6 text-slate-600">This queue shows only requests permitted to your account by database row-level security. Coordinators see requests for their own clubs; campus executives see the requests their role permits.</p></div>}

          {leadership && <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Club proposals</h2>
            <p className="mt-1 text-xs text-slate-500">Only an administrator or campus president can change club approval status.</p>
            <div className="mt-4 space-y-3">
              {pendingClubApprovals.length === 0 && <p className="text-sm text-slate-500">No club proposals waiting for approval.</p>}
              {pendingClubApprovals.map((club) => <div key={club.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div className="min-w-0"><p className="font-semibold text-slate-900">{club.name}</p><p className="mt-1 text-xs text-slate-500">{club.category || 'Uncategorised'} · {club.description.slice(0, 130)}</p><StatePill status={club.approval_status} /></div><div className="flex gap-2"><button disabled={saving} onClick={() => void reviewClub(club, 'rejected')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Reject</button><button disabled={saving} onClick={() => void reviewClub(club, 'approved')} className={`${buttonClass} px-3 py-2 text-xs`}><Check size={13} />Approve</button></div></div>)}
            </div>
          </section>}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Pending membership approvals</h2>
            <p className="mt-1 text-xs text-slate-500">Club coordinators can review requests for the clubs they manage.</p>
            <div className="mt-4 space-y-3">
              {pendingMemberships.length === 0 && <p className="text-sm text-slate-500">No pending requests are visible to your account.</p>}
              {pendingMemberships.map((membership) => <div key={`${membership.club_id}-${membership.user_id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><p className="font-semibold text-slate-900">{membership.profiles?.display_name ?? 'Campus member'}</p><p className="mt-1 text-xs text-slate-500">{clubById.get(membership.club_id)?.name ?? 'Club'}{membership.profiles?.department ? ` · ${membership.profiles.department}` : ''}</p></div><div className="flex gap-2"><button disabled={saving} onClick={() => void reviewMembership(membership, 'rejected')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Reject</button><button disabled={saving} onClick={() => void reviewMembership(membership, 'active')} className={`${buttonClass} px-3 py-2 text-xs`}><Check size={13} />Approve</button></div></div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Governance role requests</h2>
            <p className="mt-1 text-xs text-slate-500">The database verifies whether you may approve this exact role. A UI button does not grant additional permission.</p>
            <div className="mt-4 space-y-3">
              {pendingRoleRequests.length === 0 && <p className="text-sm text-slate-500">No pending leadership requests are visible to your account.</p>}
              {pendingRoleRequests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div><p className="font-semibold text-slate-900">{request.profiles?.display_name ?? 'Campus member'}</p><p className="mt-1 text-xs text-slate-500">{request.requested_role.replaceAll('_', ' ')} · {request.clubs?.name ?? 'Institute-wide role'}{request.rationale ? ` · ${request.rationale}` : ''}</p></div><div className="flex gap-2"><button disabled={saving} onClick={() => void decideRoleRequest(request.id, 'rejected')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Reject</button><button disabled={saving} onClick={() => void decideRoleRequest(request.id, 'approved')} className={`${buttonClass} px-3 py-2 text-xs`}><Check size={13} />Approve</button></div></div>)}
            </div>
          </section>

          {activeMemberships.some((membership) => membership.role === 'coordinator') && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-slate-900">Invite students after selection/interview</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Invite a selected campus account as a General Member or Core Member. They are not added until they accept. The database checks coordinator authority.</p>
              <form onSubmit={inviteMember} className="mt-4 grid gap-3 md:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="inviteClub">Club</label><select id="inviteClub" required value={inviteClubId} onChange={(e) => setInviteClubId(e.target.value)} className={inputClass}><option value="">Choose managed club</option>{activeMemberships.filter((m) => m.role === 'coordinator').map((membership) => { const club = clubById.get(membership.club_id); return club ? <option key={club.id} value={club.id}>{club.name}</option> : null; })}</select></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="invitePerson">Selected campus student</label><select id="invitePerson" required value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} className={inputClass}><option value="">Choose a profile</option>{campusProfiles.map((person) => <option key={person.id} value={person.id}>{person.display_name}{person.department ? ` · ${person.department}` : ''}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="inviteRole">Invite as</label><select id="inviteRole" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'member' | 'core_member')} className={inputClass}><option value="member">General Member</option><option value="core_member">Core Member</option></select></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="inviteMessage">Message (optional)</label><input id="inviteMessage" maxLength={1200} value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} className={inputClass} placeholder="Interview selection, role, next step…" /></div>
                <div className="md:col-span-2"><button disabled={saving} className={buttonClass}><MailPlus size={16} />Send invitation</button></div>
              </form>
            </section>
          )}

          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-xs leading-5 text-sky-950"><strong>Permission model:</strong> club coordinator → manages membership and invitations for that club; Technical/Cultural General Secretary → reviews matching coordinator requests; president/administrator → campus-wide club governance. Users cannot self-assign these privileges.</div>
        </div>
      )}
    </div>
  );

  async function reviewClub(club: ClubRecord, approval_status: 'approved' | 'rejected') {
    setSaving(true); setError(''); setSuccess('');
    try {
      const { error: updateError } = await supabase.from('clubs').update({ approval_status }).eq('id', club.id);
      if (updateError) throw updateError;
      setSuccess(approval_status === 'approved' ? 'Club approved. Its three rooms are now provisioned and access is controlled by membership role.' : 'Club proposal rejected.');
      await loadData();
    } catch (updateError) {
      setError(supabaseErrorMessage(updateError, 'Unable to update club approval status.'));
    } finally { setSaving(false); }
  }
}
