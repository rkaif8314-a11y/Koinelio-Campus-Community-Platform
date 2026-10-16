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

  async function resolveReport(report: Report, decision: 'hide_post' | 'dismiss') {
    const note = window.prompt(decision === 'hide_post' ? 'Optional note explaining why this post is being hidden.' : 'Optional reason for dismissing this report.') ?? '';
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
      await loadReports();
    } catch (resolveError) {
      setError(supabaseErrorMessage(resolveError, 'Unable to resolve this report.'));
    } finally {
      setSaving('');
    }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Checking moderation access…</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><ShieldCheck size={22}/></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Restricted access</p><h1 className="mt-1 text-2xl font-bold text-[var(--app-text)]">Post moderation</h1><p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">Review reports and hide content only when warranted. Decisions are enforced by Supabase, not just by this page.</p></div>
      </header>
      {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17}/>{error}</div>}
      {notice && <div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17}/>{notice}</div>}
      {reports.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] p-10 text-center"><Flag size={30} className="mx-auto mb-3 text-[var(--app-muted)]"/><h2 className="font-semibold text-[var(--app-text)]">No open reports</h2><p className="mt-2 text-sm text-[var(--app-muted)]">New reports will appear here when campus members flag a post.</p></section>
      ) : (
        <section className="space-y-3">{reports.map((report) => <article key={report.id} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold capitalize text-amber-900">{report.reason.replaceAll('_', ' ')}</span><span className="text-xs text-[var(--app-muted)]">Reported {new Date(report.created_at).toLocaleString()}</span></div>
          <h2 className="mt-3 font-semibold text-[var(--app-text)]">Reported post</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--app-muted)]">{report.posts?.content || '[Post contains media without text]'}</p>
          {report.details && <p className="mt-3 rounded-xl bg-[var(--app-surface-muted)] p-3 text-sm leading-6 text-[var(--app-text)]"><strong>Reporter details:</strong> {report.details}</p>}
          <p className="mt-3 text-xs text-[var(--app-muted)]">Current post status: {report.posts?.moderation_status ?? 'not available'}</p>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={saving === report.id} onClick={() => void resolveReport(report, 'dismiss')} className="rounded-xl border border-[var(--app-border)] px-3.5 py-2 text-sm font-semibold text-[var(--app-text)] disabled:opacity-50">Dismiss report</button><button type="button" disabled={saving === report.id} onClick={() => void resolveReport(report, 'hide_post')} className="rounded-xl bg-rose-700 px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving === report.id ? 'Saving…' : 'Hide post and resolve'}</button></div>
        </article>)}</section>
      )}
      <Link href="/dashboard/community" className="mt-6 inline-flex text-sm font-semibold text-[var(--app-muted)] hover:underline">Return to campus feed</Link>
    </main>
  );
}
