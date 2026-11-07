'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, CalendarDays, CheckCircle2, Flag, GraduationCap, Heart, ImagePlus,
  LoaderCircle, MessageCircle, Newspaper, Plus, RefreshCw, Send, ShieldCheck, Sparkles, Trash2, Users,
} from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';
import { suggestPostType } from '@/lib/post-classification';

type PostType = 'discussion' | 'question' | 'project' | 'achievement' | 'opportunity' | 'announcement';
type Person = { display_name: string; avatar_url: string | null; department: string | null };
type Profile = { id: string; display_name: string; avatar_url: string | null; department: string | null };
type Post = {
  id: string;
  author_id: string;
  club_id: string | null;
  content: string;
  created_at: string;
  visibility: 'public' | 'campus' | 'club';
  moderation_status: string;
  post_type: PostType;
  media_url: string | null;
  profiles: Person | null;
};
type Like = { post_id: string; user_id: string };
type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: { display_name: string; avatar_url: string | null } | null;
};
type FeedFilter = 'all' | PostType | 'mine';

const typeLabels: Record<PostType, string> = {
  discussion: 'Discussion',
  question: 'Question',
  project: 'Project',
  achievement: 'Achievement',
  opportunity: 'Opportunity',
  announcement: 'Official announcement',
};
const typeStyles: Record<PostType, string> = {
  discussion: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
  question: 'border-[var(--k-border)] bg-[var(--k-accent-light)] text-[var(--k-accent)]',
  project: 'border-[var(--k-border)] bg-[var(--k-surface-muted)] text-[var(--k-ink-soft)]',
  achievement: 'border-[var(--k-warning-light)] bg-[var(--k-warning-light)] text-[var(--k-warning)]',
  opportunity: 'border-[var(--k-success-light)] bg-[var(--k-success-light)] text-[var(--k-success)]',
  announcement: 'border-[var(--k-danger-light)] bg-[var(--k-danger-light)] text-[var(--k-danger)]',
};
const emojis = ['😀', '🎉', '💡', '🚀', '🤝', '📚', '✅', '❤️', '🔥', '💻'];

function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'K';
}
function timestamp(value: string): string {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}
function getMediaType(path: string | null): 'image' | 'gif' | 'video' | null {
  if (!path) return null;
  const extension = path.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'gif') return 'gif';
  if (['mp4', 'webm'].includes(extension ?? '')) return 'video';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension ?? '')) return 'image';
  return null;
}
function Avatar({ name, url, small = false }: { name: string; url: string | null; small?: boolean }) {
  const size = small ? 'h-8 w-8 text-[10px]' : 'h-11 w-11 text-sm';
  return url
    ? <img src={url} alt="" className={size + ' shrink-0 rounded-full object-cover ring-1 ring-[var(--k-border)]'}/>
    : <span aria-hidden="true" className={size + ' flex shrink-0 items-center justify-center rounded-full bg-[var(--k-accent-light)] font-bold text-[var(--k-accent)]'}>{initials(name)}</span>;
}

export default function CommunityPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState('');
  const [canAnnounce, setCanAnnounce] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [postType, setPostType] = useState<PostType>('discussion');
  const [composer, setComposer] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
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
  const [reporting, setReporting] = useState('');

  useEffect(() => () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
  }, [mediaPreview]);

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

      const [profileResult, postResult, rolesResult] = await Promise.all([
        supabase.from('profiles').select('id, display_name, avatar_url, department').eq('id', user.id).single(),
        supabase.from('posts')
          .select('id, author_id, club_id, content, created_at, visibility, moderation_status, post_type, media_url, profiles:profiles!posts_author_id_fkey(display_name, avatar_url, department)')
          .eq('moderation_status', 'published')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('institution_roles').select('role').eq('user_id', user.id).eq('status', 'active'),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (postResult.error) throw postResult.error;
      setProfile(profileResult.data as Profile);
      const rows = (postResult.data ?? []) as unknown as Post[];
      setPosts(rows);
      setCanAnnounce((rolesResult.data ?? []).some((item: { role: string }) =>
        ['institution_admin', 'president', 'technical_gs', 'cultural_gs', 'moderator'].includes(item.role)
      ));

      const ids = rows.map((post) => post.id);
      if (!ids.length) {
        setLikes([]); setComments([]); setMediaUrls({});
        return;
      }

      const [likeResult, commentResult, signedMedia] = await Promise.all([
        supabase.from('post_likes').select('post_id, user_id').in('post_id', ids),
        supabase.from('post_comments')
          .select('id, post_id, author_id, content, created_at, profiles:profiles!post_comments_author_id_fkey(display_name, avatar_url)')
          .in('post_id', ids).order('created_at', { ascending: true }).limit(500),
        Promise.all(rows.filter((post) => post.media_url).map(async (post) => {
          const storedPath = post.media_url as string;
          // Older posts may already hold an external URL; only object paths need signed URLs.
          if (/^https?:\/\//i.test(storedPath)) {
            return { postId: post.id, url: storedPath, error: null };
          }
          const { data, error: mediaError } = await supabase.storage
            .from('campus-post-media').createSignedUrl(storedPath, 3600);
          return { postId: post.id, url: data?.signedUrl ?? '', error: mediaError };
        })),
      ]);

      const problems: string[] = [];
      if (likeResult.error) { setLikes([]); problems.push('Likes could not load: ' + supabaseErrorMessage(likeResult.error, 'query failed')); }
      else setLikes((likeResult.data ?? []) as Like[]);
      if (commentResult.error) { setComments([]); problems.push('Comments could not load: ' + supabaseErrorMessage(commentResult.error, 'query failed')); }
      else setComments((commentResult.data ?? []) as unknown as Comment[]);
      setMediaUrls(Object.fromEntries(signedMedia.filter((item) => item.url).map((item) => [item.postId, item.url])));
      const mediaProblem = signedMedia.find((item) => item.error)?.error;
      if (mediaProblem) problems.push('Media preview unavailable: ' + supabaseErrorMessage(mediaProblem, 'storage access failed') + '. Check that the campus-post-media migration has been applied.');
      setWarning(problems.join(' '));
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load the campus feed from Supabase.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Loads database-backed feed state after authentication is available.
  useEffect(() => { void loadFeed(); }, [loadFeed]);

  const filteredPosts = useMemo(() => posts.filter((post) => {
    if (filter === 'mine') return post.author_id === userId;
    if (filter === 'all') return true;
    return post.post_type === filter;
  }), [filter, posts, userId]);
  const suggestedPostType = useMemo(() => suggestPostType(composer), [composer]);

  function selectMedia(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError('');
    if (!selected) {
      setMediaFile(null); setMediaPreview('');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowed.includes(selected.type)) {
      setMediaFile(null);
      setMediaPreview('');
      setError('Choose a JPG, PNG, WebP, GIF, MP4, or WebM file.');
      event.target.value = '';
      return;
    }
    const isVideo = selected.type.startsWith('video/');
    const maximum = isVideo ? 25 * 1024 * 1024 : 8 * 1024 * 1024;
    if (selected.size > maximum) {
      setMediaFile(null);
      setMediaPreview('');
      setError(isVideo ? 'Videos must be 25 MB or smaller.' : 'Images and GIFs must be 8 MB or smaller.');
      event.target.value = '';
      return;
    }
    setMediaFile(selected);
    setMediaPreview(URL.createObjectURL(selected));
  }

  function appendEmoji(emoji: string) {
    setComposer((current) => current + emoji);
  }

  async function reportPost(post: Post) {
    if (post.author_id === userId) {
      setError('You cannot report your own post.');
      return;
    }
    const enteredReason = window.prompt('Report reason: spam, harassment, misinformation, inappropriate, or other');
    if (!enteredReason) return;
    const reason = enteredReason.trim().toLowerCase();
    if (!['spam', 'harassment', 'misinformation', 'inappropriate', 'other'].includes(reason)) {
      setError('Choose one of: spam, harassment, misinformation, inappropriate, other.');
      return;
    }
    const details = window.prompt('Optional details (do not include private information).') ?? '';
    if (details.length > 1200) {
      setError('Report details must be 1200 characters or fewer.');
      return;
    }
    setReporting(post.id); setError(''); setNotice('');
    try {
      const { error: reportError } = await supabase.rpc('submit_post_report', {
        p_post_id: post.id,
        p_reason: reason,
        p_details: details.trim(),
      });
      if (reportError) throw reportError;
      setNotice('Report sent to the campus moderation queue.');
    } catch (reportError) {
      setError(supabaseErrorMessage(reportError, 'Unable to submit this report.'));
    } finally {
      setReporting('');
    }
  }

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = composer.trim();
    if ((!text && !mediaFile) || publishing) return;
    setPublishing(true); setError(''); setWarning(''); setNotice('');
    let uploadedPath: string | null = null;
    let postSaved = false;
    try {
      const configError = getSupabaseConfigError();
      if (configError) throw new Error(configError);
      if (postType === 'announcement' && !canAnnounce) {
        throw new Error('Only authorized campus leadership can publish official announcements.');
      }

      if (mediaFile) {
        const safeName = mediaFile.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-').slice(-100);
        uploadedPath = userId + '/' + crypto.randomUUID() + '-' + safeName;
        const { error: uploadError } = await supabase.storage.from('campus-post-media').upload(uploadedPath, mediaFile, {
          cacheControl: '3600', upsert: false, contentType: mediaFile.type,
        });
        if (uploadError) {
          const message = supabaseErrorMessage(uploadError, 'storage upload failed');
          if (/bucket not found|not found/i.test(message)) {
            throw new Error(message + '. Apply supabase/migrations/20261016120000_koinelio_feed_media_and_classification.sql to the staging Supabase project first.');
          }
          throw new Error(message);
        }
      }

      const { error: insertError } = await supabase.from('posts').insert({
        author_id: userId,
        content: text || (mediaFile?.type.startsWith('video/') ? 'Shared a campus video.' : 'Shared campus media.'),
        visibility: 'campus',
        moderation_status: 'published',
        post_type: postType,
        media_url: uploadedPath,
        club_id: null,
      });
      if (insertError) throw insertError;
      postSaved = true;
      setComposer(''); setMediaFile(null); setMediaPreview(''); setPostType('discussion');
      setNotice('Your post was saved. The feed below is refreshed from Supabase.');
      await loadFeed(true);
    } catch (postError) {
      if (uploadedPath && !postSaved) {
        await supabase.storage.from('campus-post-media').remove([uploadedPath]).catch(() => undefined);
      }
      setError(supabaseErrorMessage(postError, 'Unable to publish the post.'));
    } finally {
      setPublishing(false);
    }
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
    } catch (likeError) { setError(supabaseErrorMessage(likeError, 'Unable to update the like.')); }
    finally { setLiking(''); }
  }

  async function addComment(event: FormEvent<HTMLFormElement>, post: Post) {
    event.preventDefault();
    const text = (drafts[post.id] ?? '').trim();
    if (!text || commenting) return;
    setCommenting(post.id); setError(''); setNotice('');
    try {
      const { error: insertError } = await supabase.from('post_comments').insert({
        post_id: post.id, author_id: userId, content: text,
      });
      if (insertError) throw insertError;
      setDrafts((current) => ({ ...current, [post.id]: '' }));
      setExpanded((current) => ({ ...current, [post.id]: true }));
      setNotice('Comment posted.');
      await loadFeed(true);
    } catch (commentError) { setError(supabaseErrorMessage(commentError, 'Unable to add the comment.')); }
    finally { setCommenting(''); }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--k-muted)]"><LoaderCircle size={19} className="mr-2 animate-spin" /> Loading your campus community…</div>;

  const filterItems: { value: FeedFilter; label: string }[] = [
    { value: 'all', label: 'All posts' },
    { value: 'discussion', label: 'Discussions' },
    { value: 'question', label: 'Questions' },
    { value: 'project', label: 'Projects' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'opportunity', label: 'Opportunities' },
    ...(canAnnounce ? [{ value: 'announcement' as const, label: 'Official updates' }] : []),
    { value: 'mine', label: 'My posts' },
  ];

  const composerTypes: PostType[] = ['discussion', 'question', 'project', 'achievement', 'opportunity', ...(canAnnounce ? ['announcement' as const] : [])];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--k-accent)]">Koinelio · Campus community</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--k-ink)] sm:text-4xl">The campus feed</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--k-ink-soft)]">Share a question, showcase a project, celebrate a win, or discover an opportunity. Every post is tied to your account and database permissions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/events" className="inline-flex items-center gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-surface-muted)] px-3.5 py-2.5 text-sm font-semibold text-[var(--k-ink-soft)] hover:bg-[var(--k-surface-hover)]"><CalendarDays size={16}/> Events</Link>
            <Link href="/dashboard/alumni" className="inline-flex items-center gap-2 rounded-xl bg-[var(--k-accent)] px-3.5 py-2.5 text-sm font-semibold text-[var(--k-on-accent)] hover:bg-[var(--k-accent-hover)]"><GraduationCap size={16}/> Alumni</Link>
            <button type="button" onClick={() => void loadFeed(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-[var(--k-border)] px-3.5 py-2.5 text-sm font-semibold text-[var(--k-ink-soft)] hover:bg-[var(--k-surface-muted)] disabled:opacity-50"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''}/> Refresh</button>
          </div>
        </div>
      </section>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--k-danger)] bg-[var(--k-danger-light)] p-3 text-sm leading-6 text-[var(--k-danger)]"><AlertCircle size={18} className="mt-0.5 shrink-0"/><span className="break-words">{error}</span></div>}
      {warning && <div role="status" className="mb-4 rounded-xl border border-[var(--k-warning-light)] bg-[var(--k-warning-light)] p-3 text-sm leading-6 text-[var(--k-warning)]">{warning}</div>}
      {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--k-success-light)] bg-[var(--k-success-light)] p-3 text-sm text-[var(--k-success)]"><CheckCircle2 size={17} className="shrink-0"/>{notice}</div>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(270px,0.8fr)]">
        <section className="min-w-0 space-y-4">
          <form onSubmit={createPost} className="rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <Avatar name={profile?.display_name ?? 'Campus member'} url={profile?.avatar_url ?? null}/>
              <div className="min-w-0 flex-1">
                <label htmlFor="community-post" className="mb-2 block text-sm font-bold text-[var(--k-ink)]">Share with your campus</label>
                <textarea id="community-post" value={composer} onChange={(event) => setComposer(event.target.value)} rows={3} maxLength={5000} placeholder="What are you building, learning, celebrating, or wondering about?" className="w-full resize-y rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] px-3.5 py-3 text-sm text-[var(--k-ink)] outline-none placeholder:text-[var(--k-muted)] focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]"/>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-[var(--k-ink-soft)]">Classify post
                    <select value={postType} onChange={(event) => setPostType(event.target.value as PostType)} className="rounded-lg border border-[var(--k-border)] bg-[var(--k-surface)] px-2 py-1.5 text-xs text-[var(--k-ink-soft)]">
                      {composerTypes.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}
                    </select>
                  </label>
                  <span className="text-xs text-[var(--k-muted)]">{composer.length}/5000 characters</span>
                </div>
                {suggestedPostType && suggestedPostType !== postType && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--k-success-light)] bg-[var(--k-success-light)] px-3 py-2.5">
                  <Sparkles size={15} className="shrink-0 text-[var(--k-success)]"/>
                  <p className="flex-1 text-xs leading-5 text-[var(--k-success)]">Text pattern suggests <strong>{typeLabels[suggestedPostType]}</strong>. This is a heuristic, not an AI verdict.</p>
                  <button type="button" onClick={() => setPostType(suggestedPostType)} className="rounded-lg bg-[var(--k-accent)] px-2.5 py-1.5 text-xs font-bold text-[var(--k-on-accent)] transition hover:bg-[var(--k-accent-hover)]">Use suggestion</button>
                </div>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {emojis.map((emoji) => <button key={emoji} type="button" onClick={() => appendEmoji(emoji)} aria-label={'Insert emoji ' + emoji} className="rounded-lg border border-[var(--k-border)] bg-[var(--k-surface-muted)] px-2 py-1 text-base transition hover:bg-[var(--k-warning-light)]">{emoji}</button>)}
                  <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--k-border)] px-3 py-1.5 text-xs font-semibold text-[var(--k-ink-soft)] transition hover:border-[var(--k-accent)] hover:bg-[var(--k-accent-light)] focus-within:ring-4 focus-within:ring-[var(--k-focus-ring)]">
                    <ImagePlus size={15}/> Add photo, GIF or video
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" aria-describedby="community-media-help" onChange={selectMedia} className="sr-only"/>
                  </label>
                </div>
                {mediaFile && <div className="mt-3 flex items-start gap-3 rounded-xl border border-[var(--k-border)] bg-[var(--k-surface-muted)] p-3">
                  {mediaFile.type.startsWith('video/') ? <video src={mediaPreview} controls className="max-h-36 max-w-[180px] rounded-lg bg-black"/> : <img src={mediaPreview} alt="Selected upload preview" className="max-h-36 max-w-[180px] rounded-lg object-cover"/>}
                  <div className="min-w-0 flex-1"><p className="break-all text-xs font-semibold text-[var(--k-ink)]">{mediaFile.name}</p><p className="mt-1 text-xs text-[var(--k-muted)]">{(mediaFile.size / (1024 * 1024)).toFixed(1)} MB · {mediaFile.type.startsWith('video/') ? 'Video' : mediaFile.type === 'image/gif' ? 'Animated GIF' : 'Image'}</p></div>
                  <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(''); }} aria-label="Remove selected media" className="rounded-lg p-1.5 text-[var(--k-muted)] hover:bg-[var(--k-danger-light)] hover:text-[var(--k-danger)]"><Trash2 size={16}/></button>
                </div>}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span id="community-media-help" className="text-[11px] leading-5 text-[var(--k-muted)]">Images/GIFs up to 8 MB · videos up to 25 MB</span>
                  <button type="submit" disabled={publishing || (!composer.trim() && !mediaFile)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--k-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--k-on-accent)] shadow-sm transition hover:bg-[var(--k-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50">{publishing ? <LoaderCircle size={15} className="animate-spin"/> : <Plus size={15}/>} {publishing ? 'Publishing…' : 'Publish post'}</button>
                </div>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-lg font-bold text-[var(--k-ink)]">Recent conversations</h2><p className="mt-1 text-xs text-[var(--k-muted)]">Categories are stored in the database; official announcements require leadership privileges.</p></div>
            <div className="flex max-w-full flex-wrap gap-1.5 rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] p-1">
              {filterItems.map((item) => <button type="button" key={item.value} onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={'rounded-lg px-3 py-2 text-xs font-semibold transition ' + (filter === item.value ? 'bg-[var(--k-accent)] text-[var(--k-on-accent)]' : 'text-[var(--k-ink-soft)] hover:bg-[var(--k-surface-muted)]')}>{item.label}</button>)}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--k-border)] bg-[var(--k-surface)] px-6 py-12 text-center">
              <Newspaper size={34} className="mx-auto mb-3 text-[var(--k-muted)]"/>
              <h3 className="font-bold text-[var(--k-ink)]">{posts.length === 0 ? 'Start the first campus conversation' : 'No posts in this category yet'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--k-muted)]">{posts.length === 0 ? 'No visible published posts are available for your account yet. Start a real conversation above; no sample people or activity are generated.' : 'Choose another category to explore the posts visible to your account.'}</p>
            </div>
          ) : filteredPosts.map((post) => {
            const author = post.profiles?.display_name ?? (post.author_id === userId ? profile?.display_name : null) ?? 'Campus member';
            const postLikes = likes.filter((like) => like.post_id === post.id);
            const liked = postLikes.some((like) => like.user_id === userId);
            const postComments = comments.filter((comment) => comment.post_id === post.id);
            const mediaType = getMediaType(post.media_url);
            return (
              <article key={post.id} className="rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-4 shadow-sm transition hover:shadow-md sm:p-5">
                <header className="flex items-start gap-3">
                  <Avatar name={author} url={post.profiles?.avatar_url ?? null}/>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--k-ink)]">{author}</p><p className="mt-1 text-xs text-[var(--k-muted)]">{post.profiles?.department ?? 'Campus member'} · {timestamp(post.created_at)}</p></div>
                  <span className={'rounded-full border px-2.5 py-1 text-[10px] font-semibold ' + typeStyles[post.post_type]}>{typeLabels[post.post_type]}</span>
                </header>
                {post.content && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--k-ink-soft)]">{post.content}</p>}
                {post.media_url && mediaUrls[post.id] && mediaType === 'video' && <video src={mediaUrls[post.id]} controls preload="metadata" className="mt-4 max-h-[520px] w-full rounded-xl bg-black"/>}
                {post.media_url && mediaUrls[post.id] && (mediaType === 'image' || mediaType === 'gif') && <img src={mediaUrls[post.id]} alt={'Media shared by ' + author} loading="lazy" className="mt-4 max-h-[520px] w-full rounded-xl bg-[var(--k-surface-muted)] object-contain"/>}
                <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--k-border-soft)] pt-3">
                  <button type="button" onClick={() => void toggleLike(post)} disabled={liking === post.id} className={'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ' + (liked ? 'bg-[var(--k-danger-light)] text-[var(--k-danger)]' : 'text-[var(--k-muted)] hover:bg-[var(--k-surface-muted)]')} aria-label={(liked ? 'Unlike post by ' : 'Like post by ') + author}><Heart size={15} className={liked ? 'fill-current' : ''}/>{postLikes.length} {postLikes.length === 1 ? 'like' : 'likes'}</button>
                  <button type="button" onClick={() => setExpanded((current) => ({ ...current, [post.id]: !current[post.id] }))} aria-expanded={Boolean(expanded[post.id])} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--k-muted)] hover:bg-[var(--k-surface-muted)]"><MessageCircle size={15}/>{postComments.length} {postComments.length === 1 ? 'comment' : 'comments'}</button>
                  {post.author_id !== userId && <button type="button" onClick={() => void reportPost(post)} disabled={reporting === post.id} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--k-muted)] hover:bg-[var(--k-danger-light)] hover:text-[var(--k-danger)] disabled:opacity-50"><Flag size={14}/>{reporting === post.id ? 'Sending…' : 'Report'}</button>}
                  {post.post_type === 'announcement' && <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--k-danger)]"><ShieldCheck size={13}/> Authorized announcement</span>}
                </footer>

                {expanded[post.id] && <div className="mt-3 space-y-3 border-t border-[var(--k-border-soft)] pt-3">
                  {postComments.map((comment) => {
                    const name = comment.profiles?.display_name ?? (comment.author_id === userId ? profile?.display_name : null) ?? 'Campus member';
                    return <div key={comment.id} className="flex items-start gap-2.5"><Avatar name={name} url={comment.profiles?.avatar_url ?? null} small/><div className="min-w-0 flex-1 rounded-xl bg-[var(--k-surface-muted)] px-3 py-2.5"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-[var(--k-ink)]">{name}</span><time className="text-[10px] text-[var(--k-muted)]">{timestamp(comment.created_at)}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[var(--k-ink-soft)]">{comment.content}</p></div></div>;
                  })}
                  {postComments.length === 0 && <p className="text-xs text-[var(--k-muted)]">No comments yet. Start the conversation.</p>}
                  <form onSubmit={(event) => void addComment(event, post)} className="flex items-center gap-2">
                    <label htmlFor={'comment-' + post.id} className="sr-only">Add a comment</label>
                    <input id={'comment-' + post.id} value={drafts[post.id] ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={3000} placeholder="Write a useful reply…" className="min-w-0 flex-1 rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] px-3 py-2.5 text-xs text-[var(--k-ink)] outline-none placeholder:text-[var(--k-muted)] focus:border-[var(--k-accent)]"/>
                    <button type="submit" disabled={!drafts[post.id]?.trim() || commenting === post.id} aria-label="Send comment" className="rounded-xl border border-[var(--k-border)] p-2.5 text-[var(--k-ink-soft)] hover:bg-[var(--k-surface-muted)] disabled:opacity-50">{commenting === post.id ? <LoaderCircle size={15} className="animate-spin"/> : <Send size={15}/>}</button>
                  </form>
                </div>}
              </article>
            );
          })}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <section className="rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-5">
            <div className="flex items-center gap-2"><Users size={18} className="text-[var(--k-accent)]"/><h2 className="font-bold text-[var(--k-ink)]">Your campus network</h2></div>
            <p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">Your identity and activity come from your authenticated account. Supabase Row Level Security controls what you can see.</p>
            <div className="mt-4 space-y-2">
              <Link href="/dashboard/clubs" className="flex items-center gap-3 rounded-xl border border-[var(--k-border)] p-3 text-sm font-semibold text-[var(--k-ink-soft)] hover:border-[var(--k-accent)] hover:bg-[var(--k-accent-light)]"><Users size={17} className="text-[var(--k-accent)]"/><span className="flex-1">Find approved clubs</span><span className="text-[var(--k-muted)]">→</span></Link>
              <Link href="/dashboard/alumni" className="flex items-center gap-3 rounded-xl border border-[var(--k-border)] p-3 text-sm font-semibold text-[var(--k-ink-soft)] hover:border-[var(--k-accent)] hover:bg-[var(--k-accent-light)]"><GraduationCap size={17} className="text-[var(--k-accent)]"/><span className="flex-1">Meet alumni</span><span className="text-[var(--k-muted)]">→</span></Link>
              <Link href="/dashboard/events" className="flex items-center gap-3 rounded-xl border border-[var(--k-border)] p-3 text-sm font-semibold text-[var(--k-ink-soft)] hover:border-[var(--k-accent)] hover:bg-[var(--k-accent-light)]"><CalendarDays size={17} className="text-[var(--k-accent)]"/><span className="flex-1">Explore events</span><span className="text-[var(--k-muted)]">→</span></Link>
            </div>
          </section>
          <section className="rounded-2xl border border-[var(--k-success-light)] bg-[var(--k-success-light)] p-4">
            <div className="flex items-center gap-2 text-[var(--k-success)]"><ShieldCheck size={18}/><h2 className="text-sm font-bold">Trust and moderation</h2></div>
            <p className="mt-2 text-xs leading-5 text-[var(--k-success)]">Post categories are persisted, attachments use private campus storage, and official announcements are restricted by database role policies.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
