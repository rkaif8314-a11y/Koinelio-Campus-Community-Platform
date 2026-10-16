'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Heart,
  LoaderCircle,
  MessageCircle,
  Newspaper,
  Plus,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  department: string | null;
  degree_program: string | null;
  skills: string[];
  interests: string[];
  verification_status: string;
};

type PostRecord = {
  id: string;
  author_id: string;
  club_id: string | null;
  content: string;
  created_at: string;
  visibility: 'public' | 'campus' | 'club';
  moderation_status: string;
  profiles?: { display_name: string; avatar_url: string | null; department: string | null } | null;
};

type EventRecord = {
  id: string;
  title: string;
  description: string;
  starts_at: string | null;
  location: string | null;
  category: string | null;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: string;
  published_at: string | null;
};

type Engagement = { post_id: string; user_id: string };

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'K';
}

function readableTime(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [likes, setLikes] = useState<Engagement[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [approvedClubCount, setApprovedClubCount] = useState(0);
  const [userId, setUserId] = useState('');
  const [composer, setComposer] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentingPostId, setCommentingPostId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDashboard = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard');
        return;
      }
      const user = authData.user;
      setUserId(user.id);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, department, degree_program, skills, interests, verification_status')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;
      setProfile(profileData as Profile);

      const [postResult, eventResult, announcementResult, clubResult] = await Promise.all([
        supabase.from('posts')
          .select('id, author_id, club_id, content, created_at, visibility, moderation_status, profiles:profiles!posts_author_id_fkey(display_name, avatar_url, department)')
          .eq('moderation_status', 'published')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('events')
          .select('id, title, description, starts_at, location, category')
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
          .limit(5),
        supabase.from('announcements')
          .select('id, title, body, priority, published_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5),
        supabase.from('clubs')
          .select('id', { count: 'exact', head: true })
          .eq('approval_status', 'approved'),
      ]);

      if (postResult.error) throw postResult.error;
      setPosts((postResult.data ?? []) as unknown as PostRecord[]);
      setEvents((eventResult.data ?? []) as EventRecord[]);
      setAnnouncements((announcementResult.data ?? []) as Announcement[]);
      setApprovedClubCount(clubResult.count ?? 0);

      const ids = (postResult.data ?? []).map((post: { id: string }) => post.id);
      if (ids.length) {
        const { data: likeData, error: likeError } = await supabase
          .from('post_likes')
          .select('post_id, user_id')
          .in('post_id', ids);
        if (likeError) throw likeError;
        setLikes((likeData ?? []) as Engagement[]);
      } else {
        setLikes([]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load campus data from Supabase.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const ownPostIds = useMemo(() => new Set(posts.filter((post) => post.author_id === userId).map((post) => post.id)), [posts, userId]);

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = composer.trim();
    if (!content) return;
    setRefreshing(true); setError(''); setNotice('');
    try {
      const { error: insertError } = await supabase.from('posts').insert({
        author_id: userId,
        content,
        visibility: 'campus',
        moderation_status: 'published',
        club_id: null,
      });
      if (insertError) throw insertError;
      setComposer('');
      setNotice('Your post has been saved to the campus feed.');
      await loadDashboard(true);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to publish your post.');
    } finally {
      setRefreshing(false);
    }
  }

  async function toggleLike(post: PostRecord) {
    setError(''); setNotice('');
    const currentlyLiked = likes.some((like) => like.post_id === post.id && like.user_id === userId);
    try {
      if (currentlyLiked) {
        const { error: deleteError } = await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId);
        if (deleteError) throw deleteError;
        setLikes((items) => items.filter((item) => !(item.post_id === post.id && item.user_id === userId)));
      } else {
        const { error: insertError } = await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId });
        if (insertError) throw insertError;
        setLikes((items) => [...items, { post_id: post.id, user_id: userId }]);
      }
    } catch (likeError) {
      setError(likeError instanceof Error ? likeError.message : 'Unable to update this like.');
    }
  }

  async function addComment(event: FormEvent<HTMLFormElement>, post: PostRecord) {
    event.preventDefault();
    const content = (commentDrafts[post.id] ?? '').trim();
    if (!content) return;
    setCommentingPostId(post.id); setError(''); setNotice('');
    try {
      const { error: insertError } = await supabase.from('post_comments').insert({
        post_id: post.id,
        author_id: userId,
        content,
      });
      if (insertError) throw insertError;
      setCommentDrafts((items) => ({ ...items, [post.id]: '' }));
      setNotice('Comment posted.');
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : 'Unable to add comment.');
    } finally {
      setCommentingPostId('');
    }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={18} /> Loading your campus…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#14213D] via-[#253b68] to-[#5146E5] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">IIT Bhilai community</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome back, {profile?.display_name.split(' ')[0] ?? 'student'}.</h1>
            <p className="mt-2 text-sm leading-6 text-white/75">Share updates, discover approved clubs, and connect through real campus data linked to your account.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/profile" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#14213D] hover:bg-indigo-50"><Users size={16} /> Complete profile</Link>
            <button onClick={() => void loadDashboard(true)} disabled={refreshing} className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50">{refreshing ? 'Refreshing…' : 'Refresh'}</button>
          </div>
        </div>
      </section>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span className="break-words">{error}</span></div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</div>}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><Users size={22} className="text-indigo-600" /><div><p className="text-2xl font-bold text-slate-900">{approvedClubCount}</p><p className="text-xs text-slate-500">Approved clubs</p></div></div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><Newspaper size={22} className="text-indigo-600" /><div><p className="text-2xl font-bold text-slate-900">{posts.length}</p><p className="text-xs text-slate-500">Visible campus posts</p></div></div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><CalendarDays size={22} className="text-indigo-600" /><div><p className="text-2xl font-bold text-slate-900">{events.length}</p><p className="text-xs text-slate-500">Upcoming published events</p></div></div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)]">
        <section className="min-w-0 space-y-4">
          <form onSubmit={createPost} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{initials(profile?.display_name ?? '')}</span>}
              <div className="min-w-0 flex-1">
                <label htmlFor="postContent" className="mb-2 block text-sm font-semibold text-slate-800">Share with your campus</label>
                <textarea id="postContent" rows={3} maxLength={5000} value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Share something you learned, a question, or a campus update…" className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-400">Visible to your campus according to profile and post access policies.</span><button disabled={refreshing || !composer.trim()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><Plus size={15} /> Publish post</button></div>
              </div>
            </div>
          </form>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Newspaper size={32} className="mx-auto mb-3 text-slate-300" />
              <h2 className="font-bold text-slate-900">Your campus feed is ready for its first post</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">This feed shows database posts visible to your confirmed account. It does not seed fictional people or activity counts.</p>
            </div>
          ) : posts.map((post) => {
            const author = post.profiles;
            const postLikes = likes.filter((item) => item.post_id === post.id);
            const liked = postLikes.some((item) => item.user_id === userId);
            return <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <header className="flex items-start gap-3">
                {author?.avatar_url ? <img src={author.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{initials(author?.display_name ?? 'Campus member')}</span>}
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{author?.display_name ?? (post.author_id === userId ? profile?.display_name : 'Campus member')}</p><p className="mt-0.5 text-xs text-slate-500">{author?.department ?? 'IIT Bhilai'} · {readableTime(post.created_at)}</p></div>
                {post.author_id === userId && <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-800">Your post</span>}
              </header>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{post.content}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <button onClick={() => void toggleLike(post)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${liked ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50'}`}><Heart size={15} className={liked ? 'fill-current' : ''} />{postLikes.length} {postLikes.length === 1 ? 'like' : 'likes'}</button>
                <span className="inline-flex items-center gap-1.5 px-2 py-2 text-xs text-slate-400"><MessageCircle size={15} />Comments</span>
                <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">{post.visibility} visibility</span>
              </div>
              <form onSubmit={(event) => void addComment(event, post)} className="mt-2 flex items-center gap-2">
                <label htmlFor={`comment-${post.id}`} className="sr-only">Add a comment</label>
                <input id={`comment-${post.id}`} value={commentDrafts[post.id] ?? ''} onChange={(e) => setCommentDrafts((items) => ({ ...items, [post.id]: e.target.value }))} maxLength={3000} placeholder="Write a comment…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-500" />
                <button type="submit" disabled={!commentDrafts[post.id]?.trim() || commentingPostId === post.id} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50" aria-label="Send comment">{commentingPostId === post.id ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}</button>
              </form>
              {ownPostIds.has(post.id) && <p className="mt-2 text-[10px] text-slate-400">You can delete your post from the post menu in a later moderation update.</p>}
            </article>;
          })}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-slate-900">Upcoming events</h2><CalendarDays size={18} className="text-indigo-600" /></div>
            <div className="mt-4 space-y-3">
              {events.length === 0 && <p className="text-sm leading-6 text-slate-500">No published upcoming events are available.</p>}
              {events.map((event) => <article key={event.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"><p className="font-semibold text-slate-800">{event.title}</p><p className="mt-1 text-xs text-slate-500">{event.starts_at ? readableTime(event.starts_at) : 'Date to be announced'}{event.location ? ` · ${event.location}` : ''}</p>{event.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{event.description}</p>}</article>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-slate-900">Campus announcements</h2><Bell size={18} className="text-indigo-600" /></div>
            <div className="mt-4 space-y-3">
              {announcements.length === 0 && <p className="text-sm leading-6 text-slate-500">No published campus announcements are available.</p>}
              {announcements.map((item) => <article key={item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-800">{item.title}</p>{item.priority !== 'normal' && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold capitalize text-amber-800">{item.priority}</span>}</div><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{item.body}</p>{item.published_at && <p className="mt-1 text-[10px] text-slate-400">{readableTime(item.published_at)}</p>}</article>)}
            </div>
          </section>

          <section className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <div className="flex items-center gap-2 text-sky-900"><ShieldCheck size={18} /><p className="text-sm font-bold">Real account, controlled access</p></div>
            <p className="mt-2 text-xs leading-5 text-sky-900/80">Your posts, likes and comments are saved in Supabase. What you can read is controlled by your confirmed account and database policies.</p>
            <Link href="/dashboard/profile" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-900 underline underline-offset-2">Review your profile <ArrowRight size={13} /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
