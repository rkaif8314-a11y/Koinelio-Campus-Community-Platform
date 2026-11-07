'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Flag, LoaderCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type Report = {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
  posts: { content: string; moderation_status: string; author_id: string } | null;
};

export default function ModerationPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resolutionTarget, setResolutionTarget] = useState<{ report: Report; decision: 'hide_post' | 'dismiss' } | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/moderation');
        return;
      }
      const [roleResult, adminResult] = await Promise.all([
        supabase.from('institution_roles').select('role').eq('user_id', authData.user.id).eq('status', 'active'),
        supabase.rpc('is_platform_admin'),
      ]);
      if (roleResult.error) throw roleResult.error;
      if (adminResult.error) throw adminResult.error;
      const allowed = adminResult.data === true || (roleResult.data ?? []).some((row: { role: string }) => ['institution_admin', 'moderator'].includes(row.role));
      if (!allowed) {
        router.replace('/dashboard');
        return;
      }
      const { data, error: reportError } = await supabase
        .from('post_reports')
        .select('id, post_id, reporter_id, reason, details, status, created_at, posts:posts!post_reports_post_id_fkey(content, moderation_status, author_id)')
        .eq('status', 'open')
        .order('created_at', { ascending: true })
        .limit(100);
      if (reportError) throw reportError;
      setReports((data ?? []) as unknown as Report[]);
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load the moderation queue.'));
    } finally {
      setLoading(false);
    }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads moderation reports after auth is checked.
  useEffect(() => { void loadReports(); }, [loadReports]);

  async function resolveReport(report: Report, decision: 'hide_post' | 'dismiss', note: string) {
    if (note.length > 1200) {
      setError('Resolution note must be 1200 characters or fewer.');
      return;
    }
    setSaving(report.id); setError(''); setNotice('');
    try {
      const { error: resolveError } = await supabase.rpc('resolve_post_report', {
        p_report_id: report.id,
        p_decision: decision,
        p_resolution_note: note.trim(),
      });
      if (resolveError) throw resolveError;
      setNotice(decision === 'hide_post' ? 'Post hidden and report reviewed.' : 'Report dismissed.');
      setResolutionTarget(null);
      setResolutionNote('');
      await loadReports();
    } catch (resolveError) {
      setError(supabaseErrorMessage(resolveError, 'Unable to resolve this report.'));
    } finally {
      setSaving('');
    }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-[var(--k-muted)]"><LoaderCircle size={18} className="mr-2 animate-spin" /> Checking moderation access…</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--k-warning-light)] text-[var(--k-warning)]"><ShieldCheck size={22}/></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--k-warning)]">Restricted access</p><h1 className="mt-1 text-2xl font-bold text-[var(--k-ink)]">Post moderation</h1><p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">Review reports and hide content only when warranted. Decisions are enforced by Supabase, not just by this page.</p></div>
      </header>
      {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-danger-light)] p-3 text-sm text-[var(--k-danger)]"><AlertCircle size={17}/>{error}</div>}
      {notice && <div role="status" className="mb-4 flex gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-success-light)] p-3 text-sm text-[var(--k-success)]"><CheckCircle2 size={17}/>{notice}</div>}
      {reports.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[var(--k-border)] bg-[var(--k-surface)] p-10 text-center"><Flag size={30} className="mx-auto mb-3 text-[var(--k-muted)]"/><h2 className="font-semibold text-[var(--k-ink)]">No open reports</h2><p className="mt-2 text-sm text-[var(--k-muted)]">New reports will appear here when campus members flag a post.</p></section>
      ) : (
        <section className="space-y-3">{reports.map((report) => <article key={report.id} className="rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--k-warning-light)] px-2.5 py-1 text-xs font-bold capitalize text-[var(--k-warning)]">{report.reason.replaceAll('_', ' ')}</span><span className="text-xs text-[var(--k-muted)]">Reported {new Date(report.created_at).toLocaleString()}</span></div>
          <h2 className="mt-3 font-semibold text-[var(--k-ink)]">Reported post</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--k-muted)]">{report.posts?.content || '[Post contains media without text]'}</p>
          {report.details && <p className="mt-3 rounded-xl bg-[var(--k-surface-muted)] p-3 text-sm leading-6 text-[var(--k-ink)]"><strong>Reporter details:</strong> {report.details}</p>}
          <p className="mt-3 text-xs text-[var(--k-muted)]">Current post status: {report.posts?.moderation_status ?? 'not available'}</p>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={saving === report.id} onClick={() => { setResolutionTarget({ report, decision: 'dismiss' }); setResolutionNote(''); }} className="rounded-xl border border-[var(--k-border)] px-3.5 py-2 text-sm font-semibold text-[var(--k-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)] disabled:opacity-50">Dismiss report</button><button type="button" disabled={saving === report.id} onClick={() => { setResolutionTarget({ report, decision: 'hide_post' }); setResolutionNote(''); }} className="rounded-xl bg-[var(--k-danger)] px-3.5 py-2 text-sm font-semibold text-[var(--k-on-danger)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--k-focus-ring)] disabled:opacity-50">{saving === report.id ? 'Saving…' : 'Hide post and resolve'}</button></div>
        </article>)}</section>
      )}

      {resolutionTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && saving !== resolutionTarget.report.id) setResolutionTarget(null); }} onKeyDown={(event) => { if (event.key === 'Escape' && saving !== resolutionTarget.report.id) setResolutionTarget(null); }}><section role="dialog" aria-modal="true" aria-labelledby="resolution-title" aria-describedby="resolution-description" className="w-full max-w-lg rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5 shadow-xl"><h2 id="resolution-title" className="text-lg font-bold text-[var(--k-ink)]">{resolutionTarget.decision === 'hide_post' ? 'Hide this post?' : 'Dismiss this report?'}</h2><p id="resolution-description" className="mt-2 text-sm leading-6 text-[var(--k-ink-soft)]">{resolutionTarget.decision === 'hide_post' ? 'The post will be hidden through the moderation RPC. Add an optional note for the audit trail.' : 'The report will be closed without hiding the post. Add an optional reason.'}</p><label htmlFor="resolution-note" className="mt-4 block text-xs font-semibold text-[var(--k-ink-soft)]">Resolution note (optional)<textarea id="resolution-note" autoFocus rows={3} maxLength={1200} value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] px-3 py-2.5 text-sm text-[var(--k-ink)] outline-none focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]" /></label><p className="mt-1 text-right text-[10px] text-[var(--k-muted)]">{resolutionNote.length}/1200</p><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={saving === resolutionTarget.report.id} onClick={() => setResolutionTarget(null)} className="rounded-lg border border-[var(--k-border)] px-3.5 py-2 text-sm font-semibold text-[var(--k-ink)]">Cancel</button><button type="button" disabled={saving === resolutionTarget.report.id} onClick={() => void resolveReport(resolutionTarget.report, resolutionTarget.decision, resolutionNote)} className={`rounded-lg px-3.5 py-2 text-sm font-semibold disabled:opacity-50 ${resolutionTarget.decision === 'hide_post' ? 'bg-[var(--k-danger)] text-[var(--k-on-danger)]' : 'bg-[var(--k-accent)] text-[var(--k-on-accent)]'}`}>{saving === resolutionTarget.report.id ? 'Saving…' : resolutionTarget.decision === 'hide_post' ? 'Confirm hide' : 'Confirm dismiss'}</button></div></section></div>}
      <Link href="/dashboard/community" className="mt-6 inline-flex text-sm font-semibold text-[var(--k-muted)] hover:underline">Return to campus feed</Link>
    </main>
  );
}
