'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CalendarDays, CheckCircle2, GraduationCap, Heart, LoaderCircle, MessageCircle, Newspaper, Plus, RefreshCw, Send, ShieldCheck, Users } from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';

type Person = { display_name: string; avatar_url: string | null; department: string | null };
type Profile = { id: string; display_name: string; avatar_url: string | null; department: string | null };
type Post = { id: string; author_id: string; club_id: string | null; content: string; created_at: string; visibility: 'public' | 'campus' | 'club'; moderation_status: string; profiles: Person | null };
type Like = { post_id: string; user_id: string };
type Comment = { id: string; post_id: string; author_id: string; content: string; created_at: string; profiles: { display_name: string; avatar_url: string | null } | null };
type FeedFilter = 'all' | 'campus' | 'club' | 'mine';

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const item = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    const parts = [item.message, item.code ? 'code: ' + String(item.code) : '', item.details, item.hint]
      .filter((part) => typeof part === 'string' && part.length > 0);
    if (parts.length) return parts.join(' — ');
  }
  return fallback;
}
function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'K';
}
function timestamp(value: string): string {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}
function Avatar({ name, url, small = false }: { name: string; url: string | null; small?: boolean }) {
  const size = small ? 'h-8 w-8 text-[10px]' : 'h-11 w-11 text-sm';
  return url
    ? <img src={url} alt="" className={size + ' shrink-0 rounded-full object-cover ring-1 ring-slate-200'} />
    : <span aria-hidden="true" className={size + ' flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700'}>{initials(name)}</span>;
}

export default function CommunityPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [composer, setComposer] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [commenting, setCommenting] = useState('');
  const [liking, setLiking] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [notice, setNotice] = useState('');

  const loadFeed = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    setWarning('');
    try {
      const configError = getSupabaseConfigError();
      if (configError) throw new Error(configError);
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) {
        router.replace('/auth/signin?next=%2Fdashboard%2Fcommunity');
        return;
      }
      const user = auth.user;
      if (!user.email_confirmed_at || !/^[^@\s]+@iitbhilai\.ac\.in$/i.test(user.email ?? '')) {
        router.replace('/auth/signin?reason=campus-email-required&next=%2Fdashboard%2Fcommunity');
        return;
      }
      setUserId(user.id);
      const [profileResult, postResult] = await Promise.all([
        supabase.from('profiles').select('id, display_name, avatar_url, department').eq('id', user.id).single(),
        supabase.from('posts')
          .select('id, author_id, club_id, content, created_at, visibility, moderation_status, profiles:profiles!posts_author_id_fkey(display_name, avatar_url, department)')
          .eq('moderation_status', 'published')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (postResult.error) throw postResult.error;
      setProfile(profileResult.data as Profile);
      const rows = (postResult.data ?? []) as unknown as Post[];
      setPosts(rows);
      const ids = rows.map((post) => post.id);
      if (!ids.length) { setLikes([]); setComments([]); return; }

      const [likeResult, commentResult] = await Promise.all([
        supabase.from('post_likes').select('post_id, user_id').in('post_id', ids),
        supabase.from('post_comments')
          .select('id, post_id, author_id, content, created_at, profiles:profiles!post_comments_author_id_fkey(display_name, avatar_url)')
          .in('post_id', ids).order('created_at', { ascending: true }).limit(500),
      ]);
      const problems: string[] = [];
      if (likeResult.error) { setLikes([]); problems.push('Likes unavailable: ' + errorMessage(likeResult.error, 'query failed')); }
      else setLikes((likeResult.data ?? []) as Like[]);
      if (commentResult.error) { setComments([]); problems.push('Comments unavailable: ' + errorMessage(commentResult.error, 'query failed')); }
      else setComments((commentResult.data ?? []) as unknown as Comment[]);
      setWarning(problems.join(' '));
    } catch (loadError) {
      setError(errorMessage(loadError, 'Unable to load the campus feed from Supabase.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => { void loadFeed(); }, [loadFeed]);
  const filteredPosts = useMemo(() => posts.filter((post) => {
    if (filter === 'mine') return post.author_id === userId;
    if (filter === 'campus') return post.visibility === 'campus';
    if (filter === 'club') return post.visibility === 'club';
    return true;
  }), [filter, posts, userId]);

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = composer.trim();
    if (!content || publishing) return;
    setPublishing(true); setError(''); setNotice('');
    try {
      const configError = getSupabaseConfigError();
      if (configError) throw new Error(configError);
      const { error: insertError } = await supabase.from('posts').insert({
        author_id: userId, content, visibility: 'campus', moderation_status: 'published', club_id: null,
      });
      if (insertError) throw insertError;
      setComposer('');
      setNotice('Your post was saved to the campus database.');
      await loadFeed(true);
    } catch (createError) {
      setError(errorMessage(createError, 'Unable to publish the post.'));
    } finally { setPublishing(false); }
  }

  async function toggleLike(post: Post) {
    if (liking) return;
    setLiking(post.id); setError('');
    const exists = likes.some((like) => like.post_id === post.id && like.user_id === userId);
    try {
      const result = exists
        ? await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId)
        : await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId });
      if (result.error) throw result.error;
      setLikes((current) => exists
        ? current.filter((like) => !(like.post_id === post.id && like.user_id === userId))
        : [...current, { post_id: post.id, user_id: userId }]);
    } catch (likeError) { setError(errorMessage(likeError, 'Unable to update the like.')); }
    finally { setLiking(''); }
  }

  async function addComment(event: FormEvent<HTMLFormElement>, post: Post) {
    event.preventDefault();
    const content = (drafts[post.id] ?? '').trim();
    if (!content || commenting) return;
    setCommenting(post.id); setError(''); setNotice('');
    try {
      const { error: insertError } = await supabase.from('post_comments').insert({
        post_id: post.id, author_id: userId, content,
      });
      if (insertError) throw insertError;
      setDrafts((current) => ({ ...current, [post.id]: '' }));
      setExpanded((current) => ({ ...current, [post.id]: true }));
      setNotice('Comment posted.');
      await loadFeed(true);
    } catch (commentError) { setError(errorMessage(commentError, 'Unable to add the comment.')); }
    finally { setCommenting(''); }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500"><LoaderCircle size={19} className="mr-2 animate-spin" /> Loading the campus feed…</div>;

  const filters: { value: FeedFilter; label: string }[] = [
    { value: 'all', label: 'All posts' }, { value: 'campus', label: 'Campus' },
    { value: 'club', label: 'Club posts' }, { value: 'mine', label: 'My posts' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#14213D] via-[#2B338C] to-[#5146E5] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Koinelio · Campus community</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">The campus feed</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Student updates, questions, achievements and discussions, loaded from your signed-in account and database access policies.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/events" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"><CalendarDays size={16} /> Events</Link>
            <Link href="/dashboard/alumni" className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-[#14213D] hover:bg-indigo-50"><GraduationCap size={16} /> Alumni</Link>
            <button type="button" onClick={() => void loadFeed(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        </div>
      </section>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span className="break-words">{error}</span></div>}
      {warning && <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{warning}</div>}
      {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="shrink-0" />{notice}</div>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(270px,0.8fr)]">
        <section className="min-w-0 space-y-4">
          <form onSubmit={createPost} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <Avatar name={profile?.display_name ?? 'Campus member'} url={profile?.avatar_url ?? null} />
              <div className="min-w-0 flex-1">
                <label htmlFor="community-post" className="mb-2 block text-sm font-bold text-slate-900">Share with your campus</label>
                <textarea id="community-post" value={composer} onChange={(event) => setComposer(event.target.value)} rows={3} maxLength={5000} placeholder="Share a project update, ask a question, celebrate an achievement, or start a discussion…" className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-400">{composer.length}/5000 · Campus visibility</span><button type="submit" disabled={publishing || !composer.trim()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{publishing ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}{publishing ? 'Publishing…' : 'Publish post'}</button></div>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-bold text-slate-900">Recent conversations</h2><p className="mt-1 text-xs text-slate-500">Only rows allowed by your account's database policies are shown.</p></div>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1">
              {filters.map((item) => <button type="button" key={item.value} onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={'rounded-lg px-3 py-2 text-xs font-semibold transition ' + (filter === item.value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50')}>{item.label}</button>)}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <Newspaper size={33} className="mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-900">{posts.length === 0 ? 'Your campus is ready for its first conversation' : 'No posts match this filter'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{posts.length === 0 ? 'There are no visible published posts yet. Start a real conversation above; this feed does not add fake people or activity.' : 'Choose another filter to see posts available to your account.'}</p>
            </div>
          ) : filteredPosts.map((post) => {
            const authorName = post.profiles?.display_name ?? (post.author_id === userId ? profile?.display_name : null) ?? 'Campus member';
            const postLikes = likes.filter((like) => like.post_id === post.id);
            const liked = postLikes.some((like) => like.user_id === userId);
            const postComments = comments.filter((comment) => comment.post_id === post.id);
            return (
              <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <header className="flex items-start gap-3">
                  <Avatar name={authorName} url={post.profiles?.avatar_url ?? null} />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{authorName}</p><p className="mt-1 text-xs text-slate-500">{post.profiles?.department ?? 'Campus member'} · {timestamp(post.created_at)}</p></div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">{post.visibility} visibility</span>
                </header>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{post.content}</p>
                <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={() => void toggleLike(post)} disabled={liking === post.id} className={'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ' + (liked ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50')} aria-label={(liked ? 'Unlike post by ' : 'Like post by ') + authorName}><Heart size={15} className={liked ? 'fill-current' : ''} />{postLikes.length} {postLikes.length === 1 ? 'like' : 'likes'}</button>
                  <button type="button" onClick={() => setExpanded((current) => ({ ...current, [post.id]: !current[post.id] }))} aria-expanded={Boolean(expanded[post.id])} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"><MessageCircle size={15} />{postComments.length} {postComments.length === 1 ? 'comment' : 'comments'}</button>
                </footer>
                {expanded[post.id] && <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                  {postComments.map((comment) => {
                    const name = comment.profiles?.display_name ?? (comment.author_id === userId ? profile?.display_name : null) ?? 'Campus member';
                    return <div key={comment.id} className="flex items-start gap-2.5"><Avatar name={name} url={comment.profiles?.avatar_url ?? null} small /><div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-slate-800">{name}</span><time className="text-[10px] text-slate-400">{timestamp(comment.created_at)}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-700">{comment.content}</p></div></div>;
                  })}
                  {postComments.length === 0 && <p className="text-xs text-slate-500">No comments yet. Start the conversation.</p>}
                  <form onSubmit={(event) => void addComment(event, post)} className="flex items-center gap-2">
                    <label htmlFor={'comment-' + post.id} className="sr-only">Add a comment</label>
                    <input id={'comment-' + post.id} value={drafts[post.id] ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={3000} placeholder="Write a reply…" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500" />
                    <button type="submit" disabled={!drafts[post.id]?.trim() || commenting === post.id} aria-label="Send comment" className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50">{commenting === post.id ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}</button>
                  </form>
                </div>}
              </article>
            );
          })}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2"><Users size={18} className="text-indigo-600" /><h2 className="font-bold text-slate-900">Your campus network</h2></div>
            <p className="mt-2 text-sm leading-6 text-slate-500">Your identity and activity come from your authenticated account. Supabase Row Level Security controls what you can see.</p>
            <div className="mt-4 space-y-2">
              <Link href="/dashboard/clubs" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"><Users size={17} className="text-indigo-600" /><span className="flex-1">Find approved clubs</span><span className="text-slate-400">→</span></Link>
              <Link href="/dashboard/alumni" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"><GraduationCap size={17} className="text-indigo-600" /><span className="flex-1">Meet alumni</span><span className="text-slate-400">→</span></Link>
              <Link href="/dashboard/events" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"><CalendarDays size={17} className="text-indigo-600" /><span className="flex-1">Explore events</span><span className="text-slate-400">→</span></Link>
            </div>
          </section>
          <section className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <div className="flex items-center gap-2 text-sky-950"><ShieldCheck size={18} /><h2 className="text-sm font-bold">Real accounts, not demo users</h2></div>
            <p className="mt-2 text-xs leading-5 text-sky-900">Posts, likes and comments use Supabase. Missing permissions or migrations are shown as errors rather than replaced by fictional activity.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
