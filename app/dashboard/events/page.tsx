'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  Plus,
  Ticket,
  Users,
} from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type EventRecord = {
  id: string;
  title: string;
  description: string;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  created_by: string;
  institution_id: string | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  capacity: number | null;
  category: string | null;
  banner_url: string | null;
  club_id: string | null;
};

type Registration = { event_id: string; user_id: string; status: string; registered_at: string };
type Club = { id: string; name: string; category: string | null; approval_status: string; institution_id: string | null };
type Membership = { club_id: string; role: string; status: string };
type InstitutionRole = { role: string; club_id: string | null; institution_id: string };

const inputClass = 'w-full rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] px-3.5 py-2.5 text-sm text-[var(--k-ink)] outline-none focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--k-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--k-on-accent)] transition hover:bg-[var(--k-accent-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50';

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date to be announced';
}

export default function EventsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [institutionRoles, setInstitutionRoles] = useState<InstitutionRole[]>([]);
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [clubId, setClubId] = useState('');

  const loadEvents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/events');
        return;
      }
      const user = authData.user;
      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase.from('profiles').select('institution_id').eq('id', user.id).single();
      if (profileError) throw profileError;
      const tenantId = (profile as { institution_id: string | null }).institution_id;
      setInstitutionId(tenantId);

      const [eventResult, registrationResult, clubResult, membershipResult, roleResult, platformAdminResult] = await Promise.all([
        supabase.from('events')
          .select('id, title, description, starts_at, ends_at, location, created_by, institution_id, status, capacity, category, banner_url, club_id')
          .or(`status.eq.published,created_by.eq.${user.id}`)
          .order('starts_at', { ascending: true, nullsFirst: false })
          .limit(100),
        supabase.from('event_registrations').select('event_id, user_id, status, registered_at').eq('user_id', user.id),
        supabase.from('clubs').select('id, name, category, approval_status, institution_id').eq('approval_status', 'approved').order('name'),
        supabase.from('club_memberships').select('club_id, role, status').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('institution_roles').select('role, club_id, institution_id').eq('user_id', user.id).eq('status', 'active'),
        supabase.rpc('is_platform_admin'),
      ]);
      if (eventResult.error) throw eventResult.error;
      if (registrationResult.error) throw registrationResult.error;
      if (clubResult.error) throw clubResult.error;
      if (membershipResult.error) throw membershipResult.error;
      if (roleResult.error) throw roleResult.error;
      if (platformAdminResult.error) throw platformAdminResult.error;
      setEvents((eventResult.data ?? []) as EventRecord[]);
      setRegistrations((registrationResult.data ?? []) as Registration[]);
      setClubs((clubResult.data ?? []) as Club[]);
      setMemberships((membershipResult.data ?? []) as Membership[]);
      setInstitutionRoles((roleResult.data ?? []) as InstitutionRole[]);
      setPlatformAdmin(platformAdminResult.data === true);
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load events from Supabase.'));
    } finally { setLoading(false); }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetches the user's persisted event and registration state after mount.
  useEffect(() => { void loadEvents(); }, [loadEvents]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  const registrationByEvent = useMemo(() => new Map(registrations.map((item) => [item.event_id, item])), [registrations]);
  const managedClubIds = useMemo(() => {
    const ids = new Set(memberships.filter((item) => item.role === 'coordinator').map((item) => item.club_id));
    institutionRoles.filter((item) => item.role === 'club_coordinator' && item.club_id).forEach((item) => ids.add(item.club_id as string));
    const roles = institutionRoles.map((item) => item.role);
    if (platformAdmin || roles.includes('president')) clubs.forEach((club) => ids.add(club.id));
    const adminInstitutionIds = new Set(institutionRoles.filter((item) => item.role === 'institution_admin').map((item) => item.institution_id));
    clubs.filter((club) => club.institution_id && adminInstitutionIds.has(club.institution_id)).forEach((club) => ids.add(club.id));
    return ids;
  }, [memberships, institutionRoles, platformAdmin, clubs]);
  const executivePublisher = platformAdmin || institutionRoles.some((item) => ['institution_admin', 'president', 'technical_gs', 'cultural_gs'].includes(item.role));
  const manageableClubs = clubs.filter((club) => managedClubIds.has(club.id));
  const visibleEvents = events.filter((event) => event.status === 'published' || event.created_by === userId);

  async function toggleRegistration(event: EventRecord) {
    setSaving(true); setError(''); setNotice('');
    try {
      const registration = registrationByEvent.get(event.id);
      if (registration && registration.status !== 'registered') {
        setError(registration.status === 'attended'
          ? 'Attendance has already been recorded for this event.'
          : 'This registration is closed. Contact the organizer if you need help.');
        return;
      }
      if (registration?.status === 'registered') {
        const { error: deleteError } = await supabase.from('event_registrations').delete().eq('event_id', event.id).eq('user_id', userId);
        if (deleteError) throw deleteError;
        setNotice('Your event registration was cancelled.');
      } else {
        const { error: insertError } = await supabase.from('event_registrations').insert({ event_id: event.id, user_id: userId, status: 'registered' });
        if (insertError) throw insertError;
        setNotice('You are registered for this event.');
      }
      await loadEvents();
    } catch (registrationError) {
      setError(supabaseErrorMessage(registrationError, 'Unable to update your event registration.'));
    } finally { setSaving(false); }
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!institutionId) {
      setError('The authorized administrator must initialize the IIT Bhilai tenant before events can be created.');
      return;
    }
    if (!executivePublisher && !clubId) {
      setError('Choose a club you coordinate. Only authorized campus leadership can create institute-wide events.');
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        location: location.trim() || null,
        category,
        created_by: userId,
        institution_id: institutionId,
        club_id: clubId || null,
        status: 'draft',
      };
      const { error: insertError } = await supabase.from('events').insert(payload);
      if (insertError) throw insertError;
      setTitle(''); setDescription(''); setStartsAt(''); setLocation(''); setClubId(''); setShowCreate(false);
      setNotice('Event draft saved. It will not appear to other members until authorized organizers publish it.');
      await loadEvents();
    } catch (createError) {
      setError(supabaseErrorMessage(createError, 'Unable to save event draft.'));
    } finally { setSaving(false); }
  }

  async function publishEvent(event: EventRecord) {
    setSaving(true); setError(''); setNotice('');
    try {
      const { error: updateError } = await supabase.from('events').update({ status: 'published' }).eq('id', event.id);
      if (updateError) throw updateError;
      setNotice('Event published.');
      await loadEvents();
    } catch (publishError) {
      setError(supabaseErrorMessage(publishError, 'Your role does not have permission to publish this event.'));
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-[var(--k-muted)]"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading published events…</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--k-accent)]">Campus calendar</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--k-ink)] sm:text-3xl">Events</h1><p className="mt-2 text-sm text-[var(--k-ink-soft)]">Only database-published events are shown to other members. Your own drafts remain private until they are published.</p></div>
        {(executivePublisher || manageableClubs.length > 0) && <button type="button" onClick={() => setShowCreate((value) => !value)} className={buttonClass}><Plus size={16} />Create event draft</button>}
      </div>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-danger-light)] p-3 text-sm text-[var(--k-danger)]"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-[var(--k-border)] bg-[var(--k-success-light)] p-3 text-sm text-[var(--k-success)]">{notice}</div>}

      {showCreate && <form onSubmit={createEvent} className="mb-6 rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5">
        <h2 className="font-bold text-[var(--k-ink)]">Create an event draft</h2><p className="mt-1 text-xs text-[var(--k-muted)]">Publishing requires an authorized organizer; the database rejects unauthorized status changes.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="eventTitle" className="mb-1 block text-xs font-semibold text-[var(--k-ink-soft)]">Title</label><input id="eventTitle" required maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} /></div>
          <div><label htmlFor="eventCategory" className="mb-1 block text-xs font-semibold text-[var(--k-ink-soft)]">Category</label><select id="eventCategory" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>{['Workshop', 'Talk', 'Competition', 'Cultural', 'Sports', 'Recruitment', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></div>
          {!executivePublisher && <div><label htmlFor="eventClub" className="mb-1 block text-xs font-semibold text-[var(--k-ink-soft)]">Managed club</label><select id="eventClub" required value={clubId} onChange={(e) => setClubId(e.target.value)} className={inputClass}><option value="">Choose your club</option>{manageableClubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}</select></div>}
          <div><label htmlFor="eventDate" className="mb-1 block text-xs font-semibold text-[var(--k-ink-soft)]">Start date and time</label><input id="eventDate" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} /></div>
          <div><label htmlFor="eventLocation" className="mb-1 block text-xs font-semibold text-[var(--k-ink-soft)]">Venue</label><input id="eventLocation" maxLength={240} value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} /></div>
          <div className="sm:col-span-2"><label htmlFor="eventDescription" className="mb-1 block text-xs font-semibold text-[var(--k-ink-soft)]">Description</label><textarea id="eventDescription" rows={3} maxLength={6000} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} /></div>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-[var(--k-border)] px-4 py-2.5 text-sm font-semibold text-[var(--k-ink-soft)]">Cancel</button><button disabled={saving} className={buttonClass}>{saving && <LoaderCircle size={15} className="animate-spin" />}Save draft</button></div>
      </form>}

      {visibleEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--k-border)] bg-[var(--k-surface)] p-10 text-center"><CalendarDays size={34} className="mx-auto mb-3 text-[var(--k-muted)]" /><h2 className="font-bold text-[var(--k-ink)]">No published events yet</h2><p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">Events will appear here when an authorized club coordinator or campus organizer publishes them. Sample event cards are not shown in the signed-in product.</p><Link href="/dashboard/clubs" className="mt-4 inline-flex text-sm font-semibold text-[var(--k-accent)] hover:underline">Explore approved clubs</Link></div>
      ) : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleEvents.map((event) => {
        const registration = registrationByEvent.get(event.id);
        const isRegistered = registration?.status === 'registered';
        const isDraft = event.status === 'draft';
        const eventStart = event.starts_at ? new Date(event.starts_at).getTime() : null;
        const registrationOpen = event.status === 'published' && currentTime !== null && (eventStart === null || (Number.isFinite(eventStart) && eventStart > currentTime));
        const clubName = clubs.find((club) => club.id === event.club_id)?.name;
        const mayPublish = executivePublisher || (event.club_id !== null && managedClubIds.has(event.club_id));
        return <article key={event.id} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] shadow-sm">
          {event.banner_url ? <img src={event.banner_url} alt="" className="h-36 w-full object-cover" /> : <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[var(--k-accent-light)] to-[var(--k-surface-muted)] text-[var(--k-accent)]"><CalendarDays size={31} /></div>}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wide text-[var(--k-accent)]">{event.category || 'Campus event'}</span>{isDraft && <span className="rounded-full border border-[var(--k-border)] bg-[var(--k-warning-light)] px-2 py-1 text-[10px] font-semibold text-[var(--k-warning)]">Draft</span>}</div>
            <h2 className="mt-2 text-lg font-bold text-[var(--k-ink)]">{event.title}</h2>
            {clubName && <p className="mt-1 text-xs font-semibold text-[var(--k-muted)]">{clubName}</p>}
            <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line text-sm leading-6 text-[var(--k-ink-soft)]">{event.description || 'No additional description provided.'}</p>
            <div className="mt-4 space-y-2 border-t border-[var(--k-border-soft)] pt-4 text-xs text-[var(--k-ink-soft)]"><p className="flex items-center gap-2"><Clock3 size={14} className="text-[var(--k-accent)]" />{dateLabel(event.starts_at)}</p>{event.location && <p className="flex items-center gap-2"><MapPin size={14} className="text-[var(--k-accent)]" />{event.location}</p>}{event.capacity && <p className="flex items-center gap-2"><Users size={14} className="text-[var(--k-accent)]" />Stated capacity {event.capacity}</p>}</div>
            <div className="mt-4 flex flex-wrap gap-2">{isDraft ? mayPublish && <button type="button" disabled={saving} onClick={() => void publishEvent(event)} className={buttonClass}><Check size={15} />Publish event</button> : registration?.status === 'attended' ? <span role="status" className="rounded-full bg-[var(--k-success-light)] px-3 py-2 text-xs font-semibold text-[var(--k-success)]">Attendance recorded</span> : registration?.status === 'cancelled' ? <span role="status" className="rounded-full bg-[var(--k-warning-light)] px-3 py-2 text-xs font-semibold text-[var(--k-warning)]">Registration closed</span> : registration?.status === 'no_show' ? <span role="status" className="rounded-full bg-[var(--k-warning-light)] px-3 py-2 text-xs font-semibold text-[var(--k-warning)]">Marked no-show</span> : isRegistered ? <button type="button" disabled={saving} onClick={() => void toggleRegistration(event)} className={`${buttonClass} bg-[var(--k-success)] hover:brightness-95`}><Check size={15} />Registered · Cancel</button> : registrationOpen ? <button type="button" disabled={saving} onClick={() => void toggleRegistration(event)} className={buttonClass}><Ticket size={15} />Register</button> : <span role="status" className="rounded-full bg-[var(--k-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--k-muted)]">Registration closed</span>}</div>
          </div>
        </article>;
      })}</div>}
    </div>
  );
}
