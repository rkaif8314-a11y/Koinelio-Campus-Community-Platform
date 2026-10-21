'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import {
  getUserById,
  getClubById,
  timeAgo,
  formatShortDate,
  DEMO_EVENTS,
  DEMO_POSTS,
  User,
  Club,
} from '@/lib/demo-data';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Send,
  Plus,
  Calendar,
  Users,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  Image as ImageIcon,
  Smile,
  Megaphone,
  HelpCircle,
  Trophy,
  Code2,
  Newspaper,
  GraduationCap,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type PostType = 'general' | 'announcement' | 'event' | 'achievement' | 'question' | 'alumni' | 'project';

function PostTypeBadge({ type }: { type: PostType }) {
  const config: Record<PostType, { label: string; icon: React.ElementType; color: string }> = {
    general: { label: 'Post', icon: Newspaper, color: 'text-[#667085] bg-[#F7F8FC]' },
    announcement: { label: 'Announcement', icon: Megaphone, color: 'text-orange-600 bg-orange-50' },
    event: { label: 'Event', icon: Calendar, color: 'text-[#5146E5] bg-indigo-50' },
    achievement: { label: 'Achievement', icon: Trophy, color: 'text-yellow-600 bg-yellow-50' },
    question: { label: 'Question', icon: HelpCircle, color: 'text-blue-600 bg-blue-50' },
    alumni: { label: 'Alumni', icon: GraduationCap, color: 'text-[#0F9D8A] bg-teal-50' },
    project: { label: 'Project', icon: Code2, color: 'text-purple-600 bg-purple-50' },
  };

  const { label, icon: Icon, color } = config[type] ?? config.general;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

// ─── Post Composer ────────────────────────────────────────────────────────────
function PostComposer() {
  const { actions } = useApp();
  const currentUser = useCurrentUser();
  const firstName = currentUser.name.split(' ')[0];

  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('general');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!content.trim()) return;
    actions.addPost({
      authorId: currentUser.id,
      authorType: 'user',
      content: content.trim(),
      type: postType,
      isOfficial: false,
    });
    setContent('');
    setPostType('general');
    setExpanded(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  const postTypes: { value: PostType; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'question', label: 'Question' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'project', label: 'Project' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
      {submitted && (
        <div className="mb-3 flex items-center gap-2 text-sm text-[#0F9D8A] bg-teal-50 rounded-lg px-3 py-2">
          <CheckCircle size={15} />
          <span>Post shared with your campus community!</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E5E7EB] text-sm text-[#667085] hover:bg-[#F0F0FF] hover:border-[#5146E5]/30 transition-colors"
          >
            What&apos;s on your mind, {firstName}?
          </button>
        ) : (
          <div className="flex-1">
            <textarea
              autoFocus
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`What's on your mind, ${firstName}?`}
              rows={3}
              className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] px-4 py-3 text-sm text-[#182230] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5] transition-colors"
            />
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
          {/* Post type selector */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium text-[#667085]">Post as:</span>
            {postTypes.map(pt => (
              <button
                key={pt.value}
                onClick={() => setPostType(pt.value)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border
                  ${postType === pt.value
                    ? 'bg-[#5146E5] text-white border-[#5146E5]'
                    : 'bg-white text-[#667085] border-[#E5E7EB] hover:border-[#5146E5]/40'
                  }`}
              >
                {pt.label}
              </button>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg text-[#667085] hover:bg-[#F7F8FC] hover:text-[#5146E5] transition-colors" title="Add image">
                <ImageIcon size={18} />
              </button>
              <button className="p-2 rounded-lg text-[#667085] hover:bg-[#F7F8FC] hover:text-[#5146E5] transition-colors" title="Add emoji">
                <Smile size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setExpanded(false); setContent(''); }}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#667085] hover:bg-[#F7F8FC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="px-5 py-1.5 rounded-lg text-sm font-semibold bg-[#5146E5] text-white hover:bg-[#4338ca] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {!expanded && (
        <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center gap-1">
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#667085] hover:bg-[#F7F8FC] transition-colors"
          >
            <ImageIcon size={15} />
            Photo
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#667085] hover:bg-[#F7F8FC] transition-colors"
          >
            <HelpCircle size={15} />
            Question
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#667085] hover:bg-[#F7F8FC] transition-colors"
          >
            <Trophy size={15} />
            Achievement
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: (typeof DEMO_POSTS)[0] }) {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);

  const author: User | Club | undefined =
    post.authorType === 'user'
      ? getUserById(post.authorId)
      : getClubById(post.authorId);

  if (!author) return null;

  const authorName = 'name' in author ? author.name : (author as Club).name;
  const authorAvatar = 'avatar' in author ? (author as User).avatar : (author as Club).logo;
  const isVerified =
    'verificationStatus' in author && author.verificationStatus === 'verified';

  const liked = post.likes.includes(currentUser.id);
  const saved = state.savedPostIds.includes(post.id);
  const MAX_LEN = 280;
  const needsTruncation = post.content.length > MAX_LEN;
  const displayContent =
    needsTruncation && !expanded ? post.content.slice(0, MAX_LEN) + '…' : post.content;

  function handleShare() {
    const url = `${window.location.origin}/dashboard/posts/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Post link: ' + url);
    });
  }

  function handleComment() {
    if (!commentText.trim()) return;
    actions.addComment(post.id, commentText.trim());
    setCommentText('');
  }

  return (
    <article
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden
        ${post.isOfficial ? 'border-l-4 border-l-orange-400 border-[#E5E7EB]' : 'border-[#E5E7EB]'}`}
    >
      {/* Header */}
      <div className="p-4 pb-0 flex items-start gap-3">
        <img
          src={authorAvatar}
          alt={authorName}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-[#182230]">{authorName}</span>
            {isVerified && <CheckCircle size={14} className="text-[#5146E5] flex-shrink-0" />}
            {post.isOfficial && (
              <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                Official
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#667085]">{timeAgo(post.createdAt)}</span>
            <span className="text-[#E5E7EB]">·</span>
            <PostTypeBadge type={post.type} />
          </div>
        </div>
        <button className="p-1.5 rounded-lg text-[#667085] hover:bg-[#F7F8FC] transition-colors flex-shrink-0">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        <p className="text-sm text-[#182230] leading-relaxed whitespace-pre-line">{displayContent}</p>
        {needsTruncation && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-[#5146E5] hover:underline mt-1"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Post image */}
      {post.image && (
        <div className="mt-3 px-4">
          <img
            src={post.image}
            alt="Post image"
            className="w-full max-h-80 object-cover rounded-xl border border-[#E5E7EB]"
          />
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 py-3 mt-1 flex items-center gap-1">
        {/* Like */}
        <button
          onClick={() => actions.toggleLikePost(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${liked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-[#667085] hover:bg-[#F7F8FC]'}`}
        >
          <Heart size={16} className={liked ? 'fill-red-500' : ''} />
          <span className="text-xs">{post.likes.length}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${showComments ? 'text-[#5146E5] bg-[#F0F0FF]' : 'text-[#667085] hover:bg-[#F7F8FC]'}`}
        >
          <MessageSquare size={16} />
          <span className="text-xs">{post.comments.length}</span>
        </button>

        {/* Save */}
        <button
          onClick={() => actions.toggleSavePost(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${saved ? 'text-[#0F9D8A] bg-teal-50 hover:bg-teal-100' : 'text-[#667085] hover:bg-[#F7F8FC]'}`}
        >
          <Bookmark size={16} className={saved ? 'fill-[#0F9D8A]' : ''} />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#667085] hover:bg-[#F7F8FC] transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 space-y-3">
          {post.comments.length > 0 && (
            <div className="space-y-3">
              {post.comments.map(comment => {
                const commentAuthor = getUserById(comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start gap-2.5">
                    <img
                      src={commentAuthor?.avatar ?? `https://i.pravatar.cc/150?u=${comment.authorId}`}
                      alt={commentAuthor?.name ?? 'User'}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 bg-[#F7F8FC] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-[#182230]">
                          {commentAuthor?.name ?? 'Unknown'}
                        </span>
                        <span className="text-[10px] text-[#667085]">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[#182230] leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {post.comments.length === 0 && (
            <p className="text-xs text-[#667085] text-center py-1">No comments yet. Be the first!</p>
          )}

          {/* Add comment input */}
          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex items-center gap-2 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#5146E5]/20 focus-within:border-[#5146E5] transition-colors">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Write a comment…"
                className="flex-1 bg-transparent text-xs text-[#182230] placeholder:text-[#667085] focus:outline-none"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="text-[#5146E5] hover:text-[#4338ca] transition-colors disabled:opacity-30"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Upcoming events widget ───────────────────────────────────────────────────
function UpcomingEventsWidget() {
  const { state, actions } = useApp();

  const upcomingEvents = DEMO_EVENTS
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
        <h3 className="font-semibold text-sm text-[#182230] flex items-center gap-2">
          <Calendar size={15} className="text-[#5146E5]" />
          Upcoming Events
        </h3>
        <Link
          href="/dashboard/events"
          className="text-xs font-medium text-[#5146E5] hover:text-[#4338ca] flex items-center gap-0.5"
        >
          View all <ChevronRight size={13} />
        </Link>
      </div>
      <div className="divide-y divide-[#F7F8FC]">
        {upcomingEvents.map(event => {
          const isRegistered = state.registeredEventIds.includes(event.id);
          return (
            <div key={event.id} className="flex items-start gap-3 p-3 hover:bg-[#F7F8FC] transition-colors">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-[#E5E7EB]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#182230] line-clamp-2 leading-tight">
                  {event.title}
                </p>
                <p className="text-[10px] text-[#667085] mt-0.5 flex items-center gap-1">
                  <Calendar size={10} />
                  {formatShortDate(event.date)} · {event.time}
                </p>
                <button
                  onClick={() => actions.toggleRegisterEvent(event.id)}
                  className={`mt-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors
                    ${isRegistered
                      ? 'bg-[#0F9D8A]/10 text-[#0F9D8A] hover:bg-red-50 hover:text-red-500'
                      : 'bg-[#5146E5]/10 text-[#5146E5] hover:bg-[#5146E5] hover:text-white'
                    }`}
                >
                  {isRegistered ? '✓ Registered' : 'Register'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── My Clubs widget ──────────────────────────────────────────────────────────
function MyClubsWidget() {
  const { state } = useApp();
  const currentUser = useCurrentUser();

  const myClubs = state.clubs.filter(c =>
    currentUser.clubMemberships.includes(c.id)
  );

  if (myClubs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 text-center">
        <Users size={28} className="text-[#E5E7EB] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#182230]">No clubs yet</p>
        <p className="text-xs text-[#667085] mt-1">Discover and join clubs</p>
        <Link
          href="/dashboard/discover"
          className="mt-3 inline-block text-xs font-medium text-[#5146E5] hover:underline"
        >
          Browse clubs →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
        <h3 className="font-semibold text-sm text-[#182230] flex items-center gap-2">
          <Users size={15} className="text-[#0F9D8A]" />
          My Clubs
        </h3>
        <Link
          href="/dashboard/clubs"
          className="text-xs font-medium text-[#5146E5] hover:text-[#4338ca] flex items-center gap-0.5"
        >
          View all <ChevronRight size={13} />
        </Link>
      </div>
      <div className="divide-y divide-[#F7F8FC]">
        {myClubs.map(club => (
          <Link
            key={club.id}
            href={`/dashboard/clubs/${club.id}`}
            className="flex items-center gap-3 p-3 hover:bg-[#F7F8FC] transition-colors"
          >
            <img
              src={club.logo}
              alt={club.name}
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#182230] truncate">{club.name}</p>
              <p className="text-[10px] text-[#667085] mt-0.5">
                {club.memberCount.toLocaleString()} members · {club.category}
              </p>
            </div>
            <ChevronRight size={13} className="text-[#667085] flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Campus Announcements widget ──────────────────────────────────────────────
function CampusAnnouncementsWidget() {
  const { state } = useApp();

  const announcements = state.posts
    .filter(p => p.isOfficial)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
        <h3 className="font-semibold text-sm text-[#182230] flex items-center gap-2">
          <Megaphone size={15} className="text-orange-500" />
          Announcements
        </h3>
      </div>
      <div className="divide-y divide-[#F7F8FC]">
        {announcements.map(post => {
          const author = getUserById(post.authorId);
          return (
            <div key={post.id} className="p-3 hover:bg-[#F7F8FC] transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <img
                  src={author?.avatar ?? `https://i.pravatar.cc/150?u=${post.authorId}`}
                  alt={author?.name ?? 'Author'}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-[10px] font-medium text-[#667085] truncate">
                  {author?.name ?? 'Campus'}
                </span>
                <span className="text-[10px] text-[#E5E7EB]">·</span>
                <span className="text-[10px] text-[#667085]">{timeAgo(post.createdAt)}</span>
              </div>
              <p className="text-xs text-[#182230] line-clamp-2 leading-relaxed">
                {post.content}
              </p>
            </div>
          );
        })}
        {announcements.length === 0 && (
          <p className="p-4 text-xs text-[#667085] text-center">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onCreatePost}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5146E5] text-white text-sm font-medium hover:bg-[#4338ca] transition-colors shadow-sm"
      >
        <Plus size={16} />
        Create Post
      </button>
      <Link
        href="/dashboard/events"
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#182230] text-sm font-medium hover:bg-[#F7F8FC] transition-colors border border-[#E5E7EB] shadow-sm"
      >
        <Calendar size={16} className="text-[#5146E5]" />
        Browse Events
      </Link>
      <Link
        href="/dashboard/discover"
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#182230] text-sm font-medium hover:bg-[#F7F8FC] transition-colors border border-[#E5E7EB] shadow-sm"
      >
        <Users size={16} className="text-[#0F9D8A]" />
        Explore Clubs
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { state } = useApp();
  const currentUser = useCurrentUser();
  const firstName = currentUser.name.split(' ')[0];
  const greeting = getGreeting();

  // Ref/state to scroll to composer & expand it
  const [composerFocused, setComposerFocused] = useState(false);

  // Feed posts from state
  const feedPosts = state.posts;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ── Greeting header ─────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#182230]">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          Northstar University · <span className="text-[#5146E5] font-medium">Demo Mode</span>
        </p>
      </div>

      {/* ── Quick actions ────────────────────────────────────────── */}
      <div className="mb-6">
        <QuickActions onCreatePost={() => setComposerFocused(true)} />
      </div>

      {/* ── Two-column grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── LEFT: Feed ───────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Post composer */}
          <PostComposer key={composerFocused ? 'focused' : 'idle'} />

          {/* Feed */}
          {feedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
              <Newspaper size={32} className="text-[#E5E7EB] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#182230]">No posts yet</p>
              <p className="text-xs text-[#667085] mt-1">Be the first to share something!</p>
            </div>
          ) : (
            feedPosts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* ── RIGHT: Widgets ───────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <UpcomingEventsWidget />
          <MyClubsWidget />
          <CampusAnnouncementsWidget />
        </div>
      </div>
    </div>
  );
}
