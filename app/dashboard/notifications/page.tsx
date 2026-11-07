'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Bell, CheckCheck, LoaderCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type NotificationRecord = {
  id: string;
  recipient_id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/notifications');
        return;
      }
      const { data, error: queryError } = await supabase
        .from('notifications')
        .select('id, recipient_id, title, body, read_at, created_at')
        .eq('recipient_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (queryError) throw queryError;
      setItems((data ?? []) as NotificationRecord[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load notifications.');
    } finally { setLoading(false); }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrates account-scoped notification data after mount.
  useEffect(() => { void loadNotifications(); }, [loadNotifications]);

  async function markRead(item: NotificationRecord) {
    if (item.read_at) return;
    setSavingId(item.id); setError('');
    try {
      const readAt = new Date().toISOString();
      const { error: updateError } = await supabase.from('notifications')
        .update({ read_at: readAt })
        .eq('id', item.id)
        .eq('recipient_id', item.recipient_id);
      if (updateError) throw updateError;
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: readAt } : entry));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to mark notification as read.');
    } finally { setSavingId(''); }
  }

  async function markAllRead() {
    const unread = items.filter((item) => !item.read_at);
    if (!unread.length) return;
    setSavingId('all'); setError('');
    try {
      const readAt = new Date().toISOString();
      const { error: updateError } = await supabase.from('notifications')
        .update({ read_at: readAt })
        .eq('recipient_id', unread[0].recipient_id)
        .is('read_at', null);
      if (updateError) throw updateError;
      setItems((current) => current.map((item) => item.read_at ? item : { ...item, read_at: readAt }));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to mark notifications as read.');
    } finally { setSavingId(''); }
  }

  const unreadCount = items.filter((item) => !item.read_at).length;

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-[var(--k-muted)]"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading notifications…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--k-accent)]">Your account</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--k-ink)] sm:text-3xl">Notifications</h1><p className="mt-2 text-sm text-[var(--k-ink-soft)]">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'} saved for your account.</p></div>
        <button type="button" onClick={() => void markAllRead()} disabled={unreadCount === 0 || savingId !== ''} className="inline-flex items-center gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--k-ink-soft)] hover:bg-[var(--k-bg)] disabled:opacity-50"><CheckCheck size={16} />Mark all read</button>
      </div>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-danger-light)] p-3 text-sm text-[var(--k-danger)]"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--k-border)] bg-[var(--k-surface)] p-10 text-center"><Bell size={33} className="mx-auto mb-3 text-[var(--k-muted)]" /><h2 className="font-bold text-[var(--k-ink)]">You are all caught up</h2><p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">Notifications appear here when a database-backed campus workflow sends you an update.</p><Link href="/dashboard/clubs" className="mt-4 inline-flex text-sm font-semibold text-[var(--k-accent)] hover:underline">Explore clubs</Link></div>
      ) : (
        <div className="space-y-3">{items.map((item) => <article key={item.id} className={`flex gap-3 rounded-2xl border p-4 transition ${item.read_at ? 'border-[var(--k-border)] bg-[var(--k-surface)]' : 'border-[var(--k-border)] bg-[var(--k-accent-light)]'}`}><div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.read_at ? 'bg-[var(--k-surface-muted)] text-[var(--k-muted)]' : 'bg-[var(--k-accent-light)] text-[var(--k-accent)]'}`}>{item.title.toLowerCase().includes('security') ? <ShieldCheck size={18} /> : <Bell size={18} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-[var(--k-ink)]">{item.title}</h2>{!item.read_at && <span className="rounded-full bg-[var(--k-accent)] px-2 py-0.5 text-[10px] font-bold text-[var(--k-on-accent)]">New</span>}</div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--k-ink-soft)]">{item.body}</p><p className="mt-2 text-xs text-[var(--k-muted)]">{new Date(item.created_at).toLocaleString()}</p></div>{!item.read_at && <button type="button" disabled={savingId !== ''} onClick={() => void markRead(item)} className="shrink-0 self-start rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--k-ink-soft)] hover:bg-[var(--k-bg)] disabled:opacity-50">{savingId === item.id ? 'Saving…' : 'Mark read'}</button>}</article>)}</div>
      )}
    </div>
  );
}
