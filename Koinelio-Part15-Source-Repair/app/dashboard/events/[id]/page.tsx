'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  MapPin,
  Ticket,
  Users,
} from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type CampusEvent = {
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

type Registration = {
  event_id: string;
  user_id: string;
  status: 'registered' | 'cancelled' | 'attended' | 'no_show';
  registered_at: string;
};

type RelatedEvent = Pick<CampusEvent, 'id' | 'title' | 'starts_at' | 'location' | 'category'>;

const detailSelect = 'id, title, description, starts_at, ends_at, location, created_by, institution_id, status, capacity, category, banner_url, club_id';

function formatDate(value: string | null) {
  if (!value) return 'Date to be announced';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date to be announced'
    : date.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' });
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;
  const [userId, setUserId] = useState('');
  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [organizerName, setOrganizerName] = useState('Campus organizer');
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadEvent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace(`/auth/signin?next=/dashboard/events/${eventId}`);
        return;
      }
      setUserId(authData.user.id);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(detailSelect)
        .eq('id', eventId)
        .maybeSingle();
      if (eventError) throw eventError;
      if (!eventData) {
        setEvent(null);
        setRegistration(null);
        setRelatedEvents([]);
        setOrganizerName('Campus organizer');
        return;
      }
      const loadedEvent = eventData as CampusEvent;
      setEvent(loadedEvent);

      const [registrationResult, organizerResult] = await Promise.all([
        supabase.from('event_registrations')
          .select('event_id, user_id, status, registered_at')
          .eq('event_id', loadedEvent.id)
          .eq('user_id', authData.user.id)
          .maybeSingle(),
        loadedEvent.club_id
          ? supabase.from('clubs').select('name').eq('id', loadedEvent.club_id).maybeSingle()
          : supabase.from('profiles').select('display_name').eq('id', loadedEvent.created_by).maybeSingle(),
      ]);

      if (registrationResult.error) throw registrationResult.error;
      setRegistration((registrationResult.data as Registration | null) ?? null);
      const organizer = organizerResult.error ? null : organizerResult.data as { name?: string; display_name?: string } | null;
      setOrganizerName(organizer?.name ?? organizer?.display_name ?? 'Campus organizer');

      if (loadedEvent.category && loadedEvent.status === 'published') {
        const { data: relatedData, error: relatedError } = await supabase.from('events')
          .select('id, title, starts_at, location, category')
          .eq('status', 'published')
          .eq('category', loadedEvent.category)
          .neq('id', loadedEvent.id)
          .order('starts_at', { ascending: true, nullsFirst: false })
          .limit(3);
        setRelatedEvents(relatedError ? [] : (relatedData ?? []) as RelatedEvent[]);
      } else {
        setRelatedEvents([]);
      }
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load this event.'));
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads account-scoped event details after session validation.
  useEffect(() => { void loadEvent(); }, [loadEvent]);

  const isRegistered = registration?.status === 'registered';
  const hasAttended = registration?.status === 'attended';
  const parsedStartTime = event?.starts_at ? new Date(event.starts_at).getTime() : Number.NaN;
  const startTime = Number.isFinite(parsedStartTime) ? parsedStartTime : null;
  const isPast = startTime !== null && startTime <= Date.now();
  const canRegister = event?.status === 'published' && !isPast && registration === null;

  async function handleRegistration() {
    if (!event || !userId) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (isRegistered) {
        const { error: deleteError } = await supabase.from('event_registrations')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', userId);
        if (deleteError) throw deleteError;
        setNotice('Your registration has been cancelled.');
        setShowCancel(false);
      } else {
        if (!canRegister) return;
        const { error: insertError } = await supabase.from('event_registrations').insert({
          event_id: event.id,
          user_id: userId,
          status: 'registered',
        });
        if (insertError) throw insertError;
        setNotice('You are registered for this event.');
      }
      await loadEvent();
    } catch (registrationError) {
      setError(supabaseErrorMessage(registrationError, 'Unable to update your registration. The event may no longer accept registrations.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    setError('');
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Your browser could not copy the link. Copy the address from the browser bar instead.');
    }
  }

  const eventDateLabel = useMemo(() => {
    if (!event) return '';
    if (!event.starts_at) return 'Date to be announced';
    return event.ends_at
      ? `${formatDate(event.starts_at)} – ${new Date(event.ends_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
      : formatDate(event.starts_at);
  }, [event]);

  if (loading) {
    return <div className="flex min-h-[45vh] items-center justify-center text-sm text-[var(--k-muted)]"><LoaderCircle size={18} className="mr-2 animate-spin" />Loading event details…</div>;
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <CalendarDays size={38} className="mx-auto mb-3 text-[var(--k-muted)]" />
        <h1 className="text-xl font-bold text-[var(--k-ink)]">Event not found</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">This event may have been removed or may not be available to your account.</p>
        {error && <p role="alert" className="mx-auto mt-4 max-w-lg rounded-xl bg-[var(--k-danger-light)] p-3 text-sm text-[var(--k-danger)]">{error}</p>}
        <Link href="/dashboard/events" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--k-border)] px-4 py-2.5 text-sm font-semibold text-[var(--k-ink)] hover:bg-[var(--k-surface-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)]"><ArrowLeft size={16} />Back to events</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--k-muted)] hover:text-[var(--k-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)]"><ArrowLeft size={16} />All events</Link>

      <header className="mt-5 overflow-hidden rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)]">
        <div className="bg-[var(--k-surface-muted)] px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--k-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--k-accent)]">{event.category || 'Campus event'}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${event.status === 'published' ? 'bg-[var(--k-success-light)] text-[var(--k-success)]' : 'bg-[var(--k-warning-light)] text-[var(--k-warning)]'}`}>{event.status.replace('_', ' ')}</span>
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-[var(--k-ink)] sm:text-4xl">{event.title}</h1>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-[var(--k-ink-soft)]">{event.description || 'The organizer has not added a description yet.'}</p>
        </div>
        <div className="grid gap-4 border-t border-[var(--k-border)] p-5 sm:grid-cols-2 sm:p-6">
          <div className="flex items-start gap-3"><span className="rounded-xl bg-[var(--k-accent-light)] p-2.5 text-[var(--k-accent)]"><CalendarDays size={19} /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--k-muted)]">Date and time</p><p className="mt-1 text-sm font-semibold leading-6 text-[var(--k-ink)]">{eventDateLabel}</p></div></div>
          <div className="flex items-start gap-3"><span className="rounded-xl bg-[var(--k-accent-light)] p-2.5 text-[var(--k-accent)]"><MapPin size={19} /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--k-muted)]">Venue</p><p className="mt-1 text-sm font-semibold text-[var(--k-ink)]">{event.location || 'Venue to be announced'}</p></div></div>
          <div className="flex items-start gap-3"><span className="rounded-xl bg-[var(--k-accent-light)] p-2.5 text-[var(--k-accent)]"><Building2 size={19} /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--k-muted)]">Organizer</p><p className="mt-1 text-sm font-semibold text-[var(--k-ink)]">{organizerName}</p></div></div>
          {event.capacity && <div className="flex items-start gap-3"><span className="rounded-xl bg-[var(--k-accent-light)] p-2.5 text-[var(--k-accent)]"><Users size={19} /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--k-muted)]">Organizer's stated capacity</p><p className="mt-1 text-sm font-semibold text-[var(--k-ink)]">{event.capacity} places</p></div></div>}
        </div>
      </header>

      {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-danger-light)] p-3 text-sm text-[var(--k-danger)]"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-success-light)] p-3 text-sm text-[var(--k-success)]"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</div>}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--k-ink)]">About this event</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--k-ink-soft)]">{event.description || 'More information will be shared by the organizer.'}</p>
          {event.ends_at && <p className="mt-4 flex items-center gap-2 text-xs text-[var(--k-muted)]"><Clock3 size={14} />Ends {formatDate(event.ends_at)}</p>}
          <button type="button" onClick={() => void handleShare()} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--k-border)] px-3.5 py-2 text-sm font-semibold text-[var(--k-ink)] hover:bg-[var(--k-surface-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)]"><Copy size={15} />{copied ? 'Link copied' : 'Copy event link'}</button>
        </section>

        <aside className="h-fit rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5">
          <div className="flex items-center gap-2"><Ticket size={19} className="text-[var(--k-accent)]" /><h2 className="font-bold text-[var(--k-ink)]">Registration</h2></div>
          {hasAttended ? (
            <div className="mt-4 rounded-xl bg-[var(--k-success-light)] p-3"><p className="text-sm font-semibold text-[var(--k-success)]">Attendance recorded</p><p className="mt-1 text-xs leading-5 text-[var(--k-ink-soft)]">Your completed attendance record is linked to your account.</p></div>
          ) : isRegistered ? (
            <div className="mt-4 rounded-xl bg-[var(--k-success-light)] p-3"><p className="text-sm font-semibold text-[var(--k-success)]">You are registered</p><p className="mt-1 text-xs leading-5 text-[var(--k-ink-soft)]">Your registration is linked to your account.</p></div>
          ) : registration?.status === 'cancelled' ? (
            <p className="mt-4 rounded-xl bg-[var(--k-warning-light)] p-3 text-sm leading-6 text-[var(--k-warning)]">This registration was cancelled by an organizer. Contact the organizer if you need help.</p>
          ) : registration?.status === 'no_show' ? (
            <p className="mt-4 rounded-xl bg-[var(--k-warning-light)] p-3 text-sm leading-6 text-[var(--k-warning)]">The attendance record is marked as no-show. Contact the organizer if you believe this is incorrect.</p>
          ) : event.status !== 'published' ? (
            <p className="mt-4 text-sm leading-6 text-[var(--k-muted)]">Registration opens when an authorized organizer publishes this event.</p>
          ) : isPast ? (
            <p className="mt-4 text-sm leading-6 text-[var(--k-muted)]">This event has already started. New registrations are closed.</p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--k-muted)]">Register with your campus account to confirm your place.</p>
          )}
          {canRegister && <button type="button" disabled={saving} onClick={() => void handleRegistration()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--k-accent)] px-4 py-3 text-sm font-semibold text-[var(--k-on-accent)] hover:bg-[var(--k-accent-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)] disabled:opacity-50">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Ticket size={16} />}Register for event</button>}
          {isRegistered && registration?.status === 'registered' && <button type="button" onClick={() => setShowCancel(true)} className="mt-4 w-full rounded-xl border border-[var(--k-border)] px-4 py-2.5 text-sm font-semibold text-[var(--k-ink)] hover:bg-[var(--k-surface-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)]">Cancel registration</button>}
          {event.status === 'cancelled' && <p className="mt-3 text-xs text-[var(--k-danger)]">The organizer has cancelled this event.</p>}
        </aside>
      </div>

      {relatedEvents.length > 0 && <section className="mt-8"><h2 className="text-lg font-bold text-[var(--k-ink)]">More in {event.category}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{relatedEvents.map((related) => <Link key={related.id} href={`/dashboard/events/${related.id}`} className="rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] p-4 transition hover:border-[var(--k-accent)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)]"><p className="text-xs font-semibold text-[var(--k-accent)]">{related.starts_at ? new Date(related.starts_at).toLocaleDateString() : 'Date to be announced'}</p><h3 className="mt-2 font-semibold text-[var(--k-ink)]">{related.title}</h3><p className="mt-1 text-xs text-[var(--k-muted)]">{related.location || 'Campus venue'}</p></Link>)}</div></section>}

      {showCancel && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCancel(false); }} onKeyDown={(e) => { if (e.key === 'Escape') setShowCancel(false); }}><section role="dialog" aria-modal="true" aria-labelledby="cancel-registration-title" aria-describedby="cancel-registration-description" className="w-full max-w-md rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5 shadow-xl"><h2 id="cancel-registration-title" className="text-lg font-bold text-[var(--k-ink)]">Cancel your registration?</h2><p id="cancel-registration-description" className="mt-2 text-sm leading-6 text-[var(--k-ink-soft)]">Your place will be released. You can register again while registration remains open.</p><div className="mt-5 flex justify-end gap-2"><button type="button" autoFocus onClick={() => setShowCancel(false)} className="rounded-lg border border-[var(--k-border)] px-3.5 py-2 text-sm font-semibold text-[var(--k-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)]">Keep registration</button><button type="button" disabled={saving} onClick={() => void handleRegistration()} className="rounded-lg bg-[var(--k-danger)] px-3.5 py-2 text-sm font-semibold text-[var(--k-on-danger)] disabled:opacity-50">{saving ? 'Cancelling…' : 'Confirm cancellation'}</button></div></section></div>}
    </main>
  );
}
