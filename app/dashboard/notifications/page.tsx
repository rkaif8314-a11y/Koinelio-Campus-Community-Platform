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

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading notifications…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Your account</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Notifications</h1><p className="mt-2 text-sm text-slate-600">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'} saved for your account.</p></div>
        <button onClick={() => void markAllRead()} disabled={unreadCount === 0 || savingId !== ''} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><CheckCheck size={16} />Mark all read</button>
      </div>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Bell size={33} className="mx-auto mb-3 text-slate-300" /><h2 className="font-bold text-slate-900">You are all caught up</h2><p className="mt-2 text-sm leading-6 text-slate-500">Notifications appear here when a database-backed campus workflow sends you an update.</p><Link href="/dashboard/clubs" className="mt-4 inline-flex text-sm font-semibold text-indigo-700 hover:underline">Explore clubs</Link></div>
      ) : (
        <div className="space-y-3">{items.map((item) => <article key={item.id} className={`flex gap-3 rounded-2xl border p-4 transition ${item.read_at ? 'border-slate-200 bg-white' : 'border-indigo-100 bg-indigo-50/50'}`}><div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.read_at ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>{item.title.toLowerCase().includes('security') ? <ShieldCheck size={18} /> : <Bell size={18} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{item.title}</h2>{!item.read_at && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">New</span>}</div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{item.body}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>{!item.read_at && <button disabled={savingId !== ''} onClick={() => void markRead(item)} className="shrink-0 self-start rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">{savingId === item.id ? 'Saving…' : 'Mark read'}</button>}</article>)}</div>
      )}
    </div>
  );
}
