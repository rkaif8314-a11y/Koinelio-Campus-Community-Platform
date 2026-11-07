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
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

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
  post_type: 'discussion' | 'question' | 'project' | 'achievement' | 'opportunity' | 'announcement';
  media_url: string | null;
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
function mediaKind(path: string | null): 'video' | 'image' | 'gif' | null {
  const extension = path?.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'gif') return 'gif';
  if (['mp4', 'webm'].includes(extension ?? '')) return 'video';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension ?? '')) return 'image';
  return null;
}
const postTypeLabel: Record<PostRecord['post_type'], string> = {
  discussion: 'Discussion', question: 'Question', project: 'Project',
  achievement: 'Achievement', opportunity: 'Opportunity', announcement: 'Official update',
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [likes, setLikes] = useState<Engagement[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementFilter, setAnnouncementFilter] = useState<'all' | 'urgent' | 'important' | 'normal'>('all');
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
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
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
          .select('id, author_id, club_id, content, created_at, visibility, moderation_status, post_type, media_url, profiles:profiles!posts_author_id_fkey(display_name, avatar_url, department)')
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
          .limit(20),
        supabase.from('clubs')
          .select('id', { count: 'exact', head: true })
          .eq('approval_status', 'approved'),
      ]);

      if (postResult.error) throw postResult.error;
      if (eventResult.error) throw eventResult.error;
      if (announcementResult.error) throw announcementResult.error;
      if (clubResult.error) throw clubResult.error;
      const loadedPosts = (postResult.data ?? []) as unknown as PostRecord[];
      setPosts(loadedPosts);
      const signedMedia = await Promise.all(loadedPosts.filter((post) => post.media_url).map(async (post) => {
        const storedPath = post.media_url as string;
        if (/^https?:\/\//i.test(storedPath)) return { id: post.id, url: storedPath };
        const { data, error: mediaError } = await supabase.storage.from('campus-post-media').createSignedUrl(storedPath, 3600);
        return { id: post.id, url: mediaError ? '' : data?.signedUrl ?? '' };
      }));
      setMediaUrls(Object.fromEntries(signedMedia.filter((item) => item.url).map((item) => [item.id, item.url])));
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
      setError(supabaseErrorMessage(loadError, 'Unable to load campus data from Supabase.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads the real campus dashboard from authenticated Supabase queries.
  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const ownPostIds = useMemo(() => new Set(posts.filter((post) => post.author_id === userId).map((post) => post.id)), [posts, userId]);
  const prioritizedAnnouncements = announcements
    .filter((item) => announcementFilter === 'all' || item.priority === announcementFilter)
    .slice()
    .sort((a, b) => {
      const rank: Record<string, number> = { urgent: 0, important: 1, normal: 2 };
      const priorityDifference = (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
      if (priorityDifference !== 0) return priorityDifference;
      return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
    });

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
        post_type: 'discussion',
        media_url: null,
        club_id: null,
      });
      if (insertError) throw insertError;
      setComposer('');
      setNotice('Your post has been saved to the campus feed.');
      await loadDashboard(true);
    } catch (createError) {
      setError(supabaseErrorMessage(createError, 'Unable to publish your post.'));
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
      setError(supabaseErrorMessage(likeError, 'Unable to update this like.'));
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
      setError(supabaseErrorMessage(commentError, 'Unable to add comment.'));
    } finally {
      setCommentingPostId('');
    }
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-[var(--k-muted)]"><LoaderCircle className="mr-2 animate-spin" size={18} /> Loading your campus…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <Card padded="md" bordered shadow>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--k-accent-dark)]">IIT Bhilai community</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--k-ink)]">Welcome back, {profile?.display_name.split(' ')[0] ?? 'student'}.</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--k-ink-soft)]">Share updates, discover approved clubs, and connect through real campus data linked to your account.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/profile" className="rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--k-ink)] hover:bg-[var(--k-surface-hover)]"><Users size={16} /> Complete profile</Link>
            <Link href="/dashboard/community" className="rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--k-ink)] hover:bg-[var(--k-surface-hover)]"><Newspaper size={16} /> Campus feed</Link>
            <Link href="/dashboard/alumni" className="rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--k-ink)] hover:bg-[var(--k-surface-hover)]"><ArrowRight size={16} /> Alumni</Link>
            <Button variant="secondary" onClick={() => void loadDashboard(true)} disabled={refreshing} className="w-auto">{refreshing ? 'Refreshing…' : 'Refresh'}</Button>
          </div>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card padded="sm" bordered shadow className="flex items-center gap-3">
          <Users size={22} className="text-[var(--k-accent-dark)]" />
          <div>
            <p className="text-2xl font-bold text-[var(--k-ink)]">{approvedClubCount}</p>
            <p className="text-xs text-[var(--k-muted)]">Approved clubs</p>
          </div>
        </Card>
        <Card padded="sm" bordered shadow className="flex items-center gap-3">
          <Newspaper size={22} className="text-[var(--k-accent-dark)]" />
          <div>
            <p className="text-2xl font-bold text-[var(--k-ink)]">{posts.length}</p>
            <p className="text-xs text-[var(--k-muted)]">Visible campus posts</p>
          </div>
        </Card>
        <Card padded="sm" bordered shadow className="flex items-center gap-3">
          <CalendarDays size={22} className="text-[var(--k-accent-dark)]" />
          <div>
            <p className="text-2xl font-bold text-[var(--k-ink)]">{events.length}</p>
            <p className="text-xs text-[var(--k-muted)]">Upcoming published events</p>
          </div>
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)]">
        <section className="min-w-0 space-y-4">
          <Card padded="md" bordered shadow>
            <form onSubmit={createPost} className="space-y-3">
              <div className="flex items-start gap-3">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--k-accent-light)] text-sm font-bold text-[var(--k-accent-dark)]">{initials(profile?.display_name ?? '')}</span>}
                <div className="min-w-0 flex-1">
                  <label htmlFor="postContent" className="mb-2 block text-sm font-semibold text-[var(--k-ink)]">Share with your campus</label>
                  <textarea id="postContent" rows={3} maxLength={5000} value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Share something you learned, a question, or a campus update…" className="w-full resize-y rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-3.5 py-3 text-sm outline-none focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-accent-light)]" />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-[var(--k-muted)]">Visible to your campus according to profile and post access policies.</span><Button disabled={refreshing || !composer.trim()} className="w-auto">{refreshing ? <LoaderCircle size={15} className="animate-spin mr-2" /> : 'Publish post'} <Plus size={15} /></Button></div>
                </div>
              </div>
            </form>
          </Card>

          {posts.length === 0 ? (
            <EmptyState
              icon={<Newspaper size={32} />}
              title="Your campus feed is ready for its first post"
              subtitle="This feed shows database posts visible to your confirmed account. It does not seed fictional people or activity counts."
            />
          ) : posts.map((post) => {
            const author = post.profiles;
            const postLikes = likes.filter((item) => item.post_id === post.id);
            const liked = postLikes.some((item) => item.user_id === userId);
            return <Card padded="md" bordered shadow key={post.id}>
              <header className="flex items-start gap-3">
                {author?.avatar_url ? <img src={author.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--k-surface-muted)] text-sm font-bold text-[var(--k-ink-soft)]">{initials(author?.display_name ?? 'Campus member')}</span>}
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--k-ink)]">{author?.display_name ?? (post.author_id === userId ? profile?.display_name : 'Campus member')}</p><p className="mt-0.5 text-xs text-[var(--k-muted)]">{author?.department ?? 'IIT Bhilai'} · {readableTime(post.created_at)}</p></div>
                <span className="rounded-full border border-[var(--k-border-soft)] bg-[var(--k-surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--k-ink-soft)]">{postTypeLabel[post.post_type] ?? 'Discussion'}</span>
                {post.author_id === userId && <span className="rounded-full border-[var(--k-danger-light)] bg-[var(--k-danger-light)] px-2.5 py-1 text-[10px] font-semibold text-[var(--k-danger)]">Your post</span>}
              </header>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--k-ink)]">{post.content}</p>
              {post.media_url && mediaUrls[post.id] && mediaKind(post.media_url) === 'video' && <video src={mediaUrls[post.id]} controls preload="metadata" className="mt-4 max-h-[420px] w-full rounded-lg bg-[var(--k-ink)]" />}
              {post.media_url && mediaUrls[post.id] && ['image', 'gif'].includes(mediaKind(post.media_url) ?? '') && <img src={mediaUrls[post.id]} alt="Campus post attachment" loading="lazy" className="mt-4 max-h-[420px] w-full rounded-lg bg-[var(--k-surface-muted)] object-contain" />}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--k-border-soft)] pt-3">
                <button onClick={() => void toggleLike(post)} className={liked ? 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors bg-[var(--k-danger-light)] text-[var(--k-danger)]' : 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors text-[var(--k-muted)] hover:bg-[var(--k-surface-hover)]'}><Heart size={15} className={liked ? 'fill-current' : ''} />{postLikes.length} {postLikes.length === 1 ? 'like' : 'likes'}</button>
                <span className="inline-flex items-center gap-1.5 px-2 py-2 text-xs text-[var(--k-muted)]"><MessageCircle size={15} />Comments</span>
                <span className="ml-auto text-[10px] uppercase tracking-wide text-[var(--k-muted)]">{post.visibility} visibility</span>
              </div>
              <form onSubmit={(event) => void addComment(event, post)} className="mt-2 flex items-center gap-2">
                <label htmlFor={`comment-${post.id}`} className="sr-only">Add a comment</label>
                <input id={`comment-${post.id}`} value={commentDrafts[post.id] ?? ''} onChange={(e) => setCommentDrafts((items) => ({ ...items, [post.id]: e.target.value }))} maxLength={3000} placeholder="Write a comment…" className="min-w-0 flex-1 rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-3 py-2.5 text-xs outline-none focus:border-[var(--k-accent)]" />
                <button type="submit" disabled={!commentDrafts[post.id]?.trim() || commentingPostId === post.id} className="rounded-lg border border-[var(--k-border)] p-2.5 text-[var(--k-ink-soft)] hover:bg-[var(--k-surface-hover)] disabled:opacity-50" aria-label="Send comment">{commentingPostId === post.id ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}</button>
              </form>
              {ownPostIds.has(post.id) && <p className="mt-2 text-[10px] text-[var(--k-muted)]">You can delete your post from the post menu in a later moderation update.</p>}
            </Card>;
          })}
        </section>

        <aside className="space-y-4">
          <Card padded="md" bordered shadow>
            <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-[var(--k-ink)]">Upcoming events</h2><CalendarDays size={18} className="text-[var(--k-accent-dark)]" /></div>
            <div className="mt-4 space-y-3">
              {events.length === 0 && <p className="text-sm leading-6 text-[var(--k-muted)]">No published upcoming events are available.</p>}
              {events.map((event) => <article key={event.id} className="border-b border-[var(--k-border-soft)] pb-3 last:border-0 last:pb-0"><p className="font-semibold text-[var(--k-ink)]">{event.title}</p><p className="mt-1 text-xs text-[var(--k-muted)]">{event.starts_at ? readableTime(event.starts_at) : 'Date to be announced'}{event.location ? ` · ${event.location}` : ''}</p>{event.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--k-muted)]">{event.description}</p>}</article>)}
            </div>
          </Card>

          <Card padded="md" bordered shadow>
            <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-[var(--k-ink)]">Campus announcements</h2><Bell size={18} className="text-[var(--k-accent-dark)]" /></div>
            <div role="group" aria-label="Filter announcements by priority" className="mt-3 flex flex-wrap gap-1.5">
              {(['all', 'urgent', 'important', 'normal'] as const).map((value) => <button key={value} type="button" aria-pressed={announcementFilter === value} onClick={() => setAnnouncementFilter(value)} className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold capitalize transition ${announcementFilter === value ? 'border-[var(--k-accent-dark)] bg-[var(--k-accent-dark)] text-[var(--k-on-accent)]' : 'border-[var(--k-border)] bg-[var(--k-surface)] text-[var(--k-muted)] hover:bg-[var(--k-surface-hover)]'}`}>{value === 'all' ? 'All priorities' : value}</button>)}
            </div>
            <div className="mt-4 space-y-3">
              {announcements.length === 0 && <p className="text-sm leading-6 text-[var(--k-muted)]">No published campus announcements are available.</p>}
              {announcements.length > 0 && prioritizedAnnouncements.length === 0 && <p className="text-sm leading-6 text-[var(--k-muted)]">No {announcementFilter} announcements are available.</p>}
              {prioritizedAnnouncements.slice(0, 8).map((item) => <article key={item.id} className="border-b border-[var(--k-border-soft)] pb-3 last:border-0 last:pb-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[var(--k-ink)]">{item.title}</p>{item.priority !== 'normal' && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${item.priority === 'urgent' ? 'bg-[var(--k-danger-light)] text-[var(--k-danger)]' : 'bg-[var(--k-warning-light)] text-[var(--k-warning)]'}`}>{item.priority}</span>}</div><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[var(--k-muted)]">{item.body}</p>{item.published_at && <p className="mt-1 text-[10px] text-[var(--k-muted)]">{readableTime(item.published_at)}</p>}</article>)}
            </div>
          </Card>

          <Card padded="sm" bordered shadow className="border-[var(--k-accent-light)] bg-[var(--k-accent-light)]">
            <div className="flex items-center gap-2 text-[var(--k-accent-dark)]"><ShieldCheck size={18} /><p className="text-sm font-bold">Real account, controlled access</p></div>
            <p className="mt-2 text-xs leading-5 text-[var(--k-ink-soft)]">Your posts, likes and comments are saved in Supabase. What you can read is controlled by your confirmed account and database policies.</p>
            <Link href="/dashboard/profile" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--k-accent-dark)] underline underline-offset-2">Review your profile <ArrowRight size={13} /></Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
