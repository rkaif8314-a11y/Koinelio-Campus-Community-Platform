'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CalendarClock, CheckCircle2, LoaderCircle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type Club = { id: string; name: string; approval_status: string };
type Drive = {
  id: string; club_id: string; title: string; description: string; eligibility: string;
  deadline: string | null; status: 'draft' | 'open' | 'closed' | 'archived'; created_by: string;
};
type Application = {
  id: string; drive_id: string; applicant_id: string; answers: Record<string, unknown>;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'selected' | 'withdrawn';
  submitted_at: string; reviewer_notes: string;
};
type Interview = {
  id: string; application_id: string; scheduled_at: string; mode: 'online' | 'offline';
  meeting_url: string | null; location: string | null; status: string; message: string;
};
const statuses = ['submitted', 'under_review', 'shortlisted', 'rejected', 'selected', 'withdrawn'] as const;
const fieldClass = 'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] outline-none focus:ring-2 focus:ring-emerald-600/20';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#173D36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#24584D] disabled:opacity-50';

export default function RecruitmentPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [managedClubIds, setManagedClubIds] = useState<string[]>([]);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [clubId, setClubId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applicationText, setApplicationText] = useState('');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [interviewForm, setInterviewForm] = useState<{ applicationId: string; scheduledAt: string; mode: 'online' | 'offline'; meetingUrl: string; location: string; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) { router.replace('/auth/signin?next=/dashboard/recruitment'); return; }
      setUserId(auth.user.id);
      const [clubResult, membershipResult, driveResult, applicationResult, interviewResult] = await Promise.all([
        supabase.from('clubs').select('id, name, approval_status').eq('approval_status', 'approved').order('name'),
        supabase.from('club_memberships').select('club_id, role, status').eq('user_id', auth.user.id).eq('status', 'active'),
        supabase.from('recruitment_drives').select('id, club_id, title, description, eligibility, deadline, status, created_by').order('created_at', { ascending: false }).limit(100),
        supabase.from('recruitment_applications').select('id, drive_id, applicant_id, answers, status, submitted_at, reviewer_notes').order('submitted_at', { ascending: false }).limit(200),
        supabase.from('recruitment_interviews').select('id, application_id, scheduled_at, mode, meeting_url, location, status, message').order('scheduled_at', { ascending: true }).limit(100),
      ]);
      for (const result of [clubResult, membershipResult, driveResult, applicationResult, interviewResult]) if (result.error) throw result.error;
      setClubs((clubResult.data ?? []) as Club[]);
      setManagedClubIds((membershipResult.data ?? []).filter((m: { role: string }) => m.role === 'coordinator').map((m: { club_id: string }) => m.club_id));
      setDrives((driveResult.data ?? []) as Drive[]);
      setApplications((applicationResult.data ?? []) as Application[]);
      setInterviews((interviewResult.data ?? []) as Interview[]);
    } catch (loadError) { setError(supabaseErrorMessage(loadError, 'Unable to load recruitment from Supabase.')); }
    finally { setLoading(false); }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads persisted recruitment state after auth validation.
  useEffect(() => { void loadData(); }, [loadData]);

  const myApplications = useMemo(() => applications.filter((app) => app.applicant_id === userId), [applications, userId]);
  const managerApplications = useMemo(() => applications.filter((app) => {
    const drive = drives.find((item) => item.id === app.drive_id);
    return Boolean(drive && managedClubIds.includes(drive.club_id));
  }), [applications, drives, managedClubIds]);
  const myInterviews = useMemo(() => interviews.filter((interview) => {
    const app = applications.find((item) => item.id === interview.application_id);
    const drive = app ? drives.find((item) => item.id === app.drive_id) : undefined;
    return app?.applicant_id === userId || Boolean(drive && managedClubIds.includes(drive.club_id));
  }), [interviews, applications, drives, userId, managedClubIds]);
  const openDrives = drives.filter((drive) => drive.status === 'open');
  const manageableClubs = clubs.filter((club) => managedClubIds.includes(club.id));

  async function createDrive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clubId || !title.trim()) { setError('Choose a club and add a recruitment title.'); return; }
    setSaving('create'); setError(''); setNotice('');
    try {
      const { error: insertError } = await supabase.from('recruitment_drives').insert({
        club_id: clubId, created_by: userId, title: title.trim(), description: description.trim(),
        eligibility: eligibility.trim(), deadline: deadline ? new Date(deadline).toISOString() : null,
        status: 'open', application_questions: [{ id: 'response', label: 'Why would you like to join this club?' }],
      });
      if (insertError) throw insertError;
      setShowCreate(false); setTitle(''); setDescription(''); setEligibility(''); setDeadline('');
      setNotice('Recruitment drive opened. Database permissions determine who can publish it.');
      await loadData();
    } catch (createError) { setError(supabaseErrorMessage(createError, 'Unable to open this recruitment drive.')); }
    finally { setSaving(''); }
  }

  async function apply(drive: Drive) {
    setSaving(drive.id); setError(''); setNotice('');
    try {
      const { error: applyError } = await supabase.from('recruitment_applications').insert({
        drive_id: drive.id, applicant_id: userId, answers: { response: applicationText.trim() }, status: 'submitted',
      });
      if (applyError) throw applyError;
      setApplicationText('');
      setNotice('Application submitted. Only you and authorised club reviewers can view it.');
      await loadData();
    } catch (applyError) { setError(supabaseErrorMessage(applyError, 'Unable to submit your application. You may already have applied.')); }
    finally { setSaving(''); }
  }

  async function updateApplication(app: Application, status: typeof statuses[number]) {
    setSaving(app.id); setError(''); setNotice('');
    try {
      const { error: updateError } = await supabase.from('recruitment_applications').update({
        status, reviewer_notes: (reviewNotes[app.id] ?? app.reviewer_notes ?? '').trim(),
      }).eq('id', app.id);
      if (updateError) throw updateError;
      setNotice('Application review saved.');
      await loadData();
    } catch (updateError) { setError(supabaseErrorMessage(updateError, 'Unable to update application status.')); }
    finally { setSaving(''); }
  }

  async function scheduleInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!interviewForm) return;
    setSaving(interviewForm.applicationId); setError(''); setNotice('');
    try {
      const payload = {
        application_id: interviewForm.applicationId, scheduled_at: new Date(interviewForm.scheduledAt).toISOString(),
        mode: interviewForm.mode, meeting_url: interviewForm.mode === 'online' ? interviewForm.meetingUrl.trim() : null,
        location: interviewForm.mode === 'offline' ? interviewForm.location.trim() : null,
        message: interviewForm.message.trim(), created_by: userId,
      };
      const { error: scheduleError } = await supabase.from('recruitment_interviews').insert(payload);
      if (scheduleError) throw scheduleError;
      setInterviewForm(null); setNotice('Interview scheduled. The applicant can see the details from their account.');
      await loadData();
    } catch (scheduleError) { setError(supabaseErrorMessage(scheduleError, 'Unable to schedule this interview.')); }
    finally { setSaving(''); }
  }

  if (loading) return <div className="flex min-h-[45vh] items-center justify-center text-sm text-[var(--app-muted)]"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading recruitment…</div>;

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Club opportunities</p><h1 className="mt-1 text-3xl font-bold text-[var(--app-text)]">Recruitment</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">Apply to approved clubs, follow your application status, and view interview details. Access is enforced by Supabase Row Level Security.</p></div>
      {manageableClubs.length > 0 && <button type="button" onClick={() => setShowCreate((v) => !v)} className={buttonClass}><Users size={16}/>Open recruitment</button>}
    </header>
    {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17}/><span>{error}</span></div>}
    {notice && <div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17}/><span>{notice}</span></div>}
    {showCreate && <form onSubmit={createDrive} className="mb-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
      <h2 className="font-bold text-[var(--app-text)]">Open a recruitment drive</h2><p className="mt-1 text-xs text-[var(--app-muted)]">Only active coordinators for approved clubs can create drives.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-[var(--app-text)]">Club<select required value={clubId} onChange={(e) => setClubId(e.target.value)} className={fieldClass}><option value="">Choose managed club</option>{manageableClubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label>
        <label className="text-xs font-semibold text-[var(--app-text)]">Title<input required maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass}/></label>
        <label className="text-xs font-semibold text-[var(--app-text)]">Application deadline<input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={fieldClass}/></label>
        <label className="text-xs font-semibold text-[var(--app-text)]">Eligibility<input maxLength={1000} value={eligibility} onChange={(e) => setEligibility(e.target.value)} className={fieldClass} placeholder="Who should apply?"/></label>
        <label className="text-xs font-semibold text-[var(--app-text)] sm:col-span-2">Description<textarea rows={3} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass}/></label>
      </div>
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm">Cancel</button><button disabled={saving === 'create'} className={buttonClass}>{saving === 'create' && <LoaderCircle size={15} className="animate-spin"/>}Publish drive</button></div>
    </form>}
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-[var(--app-text)]">Open opportunities <span className="text-sm font-normal text-[var(--app-muted)]">({openDrives.length})</span></h2>
      {openDrives.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--app-border)] p-8 text-center text-sm text-[var(--app-muted)]">No open recruitment drives are available right now.</div> : <div className="grid gap-4 md:grid-cols-2">{openDrives.map((drive) => {
        const club = clubs.find((item) => item.id === drive.club_id);
        const existing = myApplications.find((app) => app.drive_id === drive.id);
        return <article key={drive.id} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-semibold text-emerald-700">{club?.name ?? 'Approved club'}</p><h3 className="mt-1 text-lg font-bold text-[var(--app-text)]">{drive.title}</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">Open</span></div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--app-muted)]">{drive.description || 'No additional description.'}</p>
          {drive.eligibility && <p className="mt-3 text-xs leading-5 text-[var(--app-muted)]"><strong>Eligibility:</strong> {drive.eligibility}</p>}
          {drive.deadline && <p className="mt-3 flex items-center gap-2 text-xs text-[var(--app-muted)]"><CalendarClock size={14}/> Deadline: {new Date(drive.deadline).toLocaleString()}</p>}
          {existing ? <p className="mt-4 rounded-xl bg-[var(--app-surface-muted)] p-3 text-sm">Your application status: <strong className="capitalize">{existing.status.replace('_', ' ')}</strong></p> : <div className="mt-4 space-y-2"><label className="block text-xs font-semibold text-[var(--app-text)]">Why do you want to join? <textarea maxLength={3000} rows={2} value={applicationText} onChange={(e) => setApplicationText(e.target.value)} className={fieldClass}/></label><button type="button" disabled={saving === drive.id || !applicationText.trim()} onClick={() => void apply(drive)} className={buttonClass}>{saving === drive.id ? 'Submitting…' : 'Submit application'}</button></div>}
        </article>;
      })}</div>}
    </section>
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-[var(--app-text)]">My applications</h2>
      {myApplications.length === 0 ? <p className="rounded-xl bg-[var(--app-surface)] p-4 text-sm text-[var(--app-muted)]">Your submitted applications and status updates will appear here.</p> : <div className="space-y-3">{myApplications.map((app) => {
        const drive = drives.find((d) => d.id === app.drive_id);
        const answer = typeof app.answers?.response === 'string' ? app.answers.response : '';
        return <article key={app.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold text-[var(--app-text)]">{drive?.title ?? 'Recruitment drive'}</h3><p className="mt-1 text-xs text-[var(--app-muted)]">Submitted {new Date(app.submitted_at).toLocaleString()}</p></div><span className="rounded-full bg-[var(--app-surface-muted)] px-3 py-1 text-xs font-semibold capitalize">{app.status.replace('_', ' ')}</span></div>{answer && <p className="mt-3 text-sm text-[var(--app-muted)]">{answer}</p>}{app.reviewer_notes && <p className="mt-3 rounded-lg bg-[var(--app-surface-muted)] p-3 text-sm"><strong>Reviewer note:</strong> {app.reviewer_notes}</p>}</article>;
      })}</div>}
    </section>
    {managerApplications.length > 0 && <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-[var(--app-text)]">Applications to your clubs</h2>
      <div className="space-y-3">{managerApplications.map((app) => {
        const drive = drives.find((d) => d.id === app.drive_id);
        const answer = typeof app.answers?.response === 'string' ? app.answers.response : '';
        const interview = interviews.find((item) => item.application_id === app.id && item.status !== 'cancelled');
        return <article key={app.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-[var(--app-text)]">{drive?.title ?? 'Recruitment drive'}</h3><p className="mt-1 text-xs text-[var(--app-muted)]">Applicant ID: {app.applicant_id}</p></div><span className="text-xs capitalize text-[var(--app-muted)]">{app.status.replace('_', ' ')}</span></div>
          {answer && <p className="mt-3 text-sm text-[var(--app-muted)]">{answer}</p>}
          <label className="mt-3 block text-xs font-semibold text-[var(--app-text)]">Reviewer note<textarea rows={2} maxLength={1200} value={reviewNotes[app.id] ?? app.reviewer_notes} onChange={(e) => setReviewNotes((v) => ({ ...v, [app.id]: e.target.value }))} className={fieldClass}/></label>
          <div className="mt-3 flex flex-wrap items-center gap-2"><select aria-label="Application status" value={app.status} onChange={(e) => void updateApplication(app, e.target.value as typeof statuses[number])} disabled={saving === app.id} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs">{statuses.filter((s) => s !== 'withdrawn').map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select><button type="button" onClick={() => void updateApplication(app, app.status)} disabled={saving === app.id} className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-semibold">Save note</button><button type="button" onClick={() => setInterviewForm({ applicationId: app.id, scheduledAt: '', mode: 'online', meetingUrl: '', location: '', message: '' })} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Schedule interview</button></div>
          {interview && <p className="mt-3 text-xs text-[var(--app-muted)]">Interview: {new Date(interview.scheduled_at).toLocaleString()} · {interview.mode === 'online' ? interview.meeting_url : interview.location}</p>}
        </article>;
      })}</div>
    </section>}
    {interviewForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={scheduleInterview} className="w-full max-w-lg rounded-2xl bg-[var(--app-surface)] p-5 shadow-xl">
      <h2 className="text-lg font-bold text-[var(--app-text)]">Schedule interview</h2><div className="mt-4 space-y-3">
        <label className="block text-xs font-semibold">Date and time<input required type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} className={fieldClass}/></label>
        <label className="block text-xs font-semibold">Mode<select value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value as 'online' | 'offline' })} className={fieldClass}><option value="online">Online</option><option value="offline">Offline</option></select></label>
        {interviewForm.mode === 'online' ? <label className="block text-xs font-semibold">Meeting link<input required type="url" maxLength={1000} value={interviewForm.meetingUrl} onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })} className={fieldClass}/></label> : <label className="block text-xs font-semibold">Location<input required maxLength={240} value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} className={fieldClass}/></label>}
        <label className="block text-xs font-semibold">Message<textarea rows={2} maxLength={1200} value={interviewForm.message} onChange={(e) => setInterviewForm({ ...interviewForm, message: e.target.value })} className={fieldClass}/></label>
      </div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setInterviewForm(null)} className="rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm">Cancel</button><button disabled={saving === interviewForm.applicationId} className={buttonClass}>Schedule</button></div>
    </form></div>}
    {myInterviews.length > 0 && <section className="mb-8"><h2 className="mb-3 text-lg font-bold text-[var(--app-text)]">Interview schedule</h2><div className="space-y-2">{myInterviews.filter((item) => applications.some((app) => app.applicant_id === userId && app.id === item.application_id)).map((item) => <article key={item.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"><p className="font-semibold text-[var(--app-text)]">{new Date(item.scheduled_at).toLocaleString()}</p><p className="mt-1 text-sm text-[var(--app-muted)]">{item.mode === 'online' ? <a className="underline" href={item.meeting_url ?? '#'} target="_blank" rel="noreferrer">Open interview meeting</a> : item.location}</p>{item.message && <p className="mt-2 text-sm text-[var(--app-muted)]">{item.message}</p>}</article>)}</div></section>}
    <p className="mt-8 text-xs leading-5 text-[var(--app-muted)]">Applications contain personal information. Share interview links only with the intended participants and do not include private credentials in application answers.</p>
    <Link href="/dashboard/clubs" className="mt-4 inline-flex text-sm font-semibold text-[var(--app-muted)] hover:underline">Browse approved clubs</Link>
  </main>;
}
