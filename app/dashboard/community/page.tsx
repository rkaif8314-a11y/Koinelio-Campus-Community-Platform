'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getUserById, getClubById, timeAgo, formatDate, Post } from '@/lib/demo-data';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Send,
  Plus,
  CheckCircle,
  MoreHorizontal,
  Megaphone,
  HelpCircle,
  Trophy,
  Code2,
  Newspaper,
  GraduationCap,
  Sparkles,
  Flag,
  Calendar,
  X,
} from 'lucide-react';

type FeedFilter = 'all' | 'announcement' | 'achievement' | 'question' | 'project' | 'alumni';

export default function CommunityPage() {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();

  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<Post['type']>('general');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Filtered posts
  const filteredPosts = state.posts.filter(p => {
    if (activeFilter === 'all') return true;
    return p.type === activeFilter;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    actions.addPost({
      authorId: currentUser.id,
      authorType: 'user',
      content: postContent,
      type: postType,
      isOfficial: currentUser.role === 'admin' || currentUser.role === 'faculty',
    });

    setPostContent('');
    setComposerOpen(false);
  };

  const handleReport = (postId: string) => {
    setReportSuccess(postId);
    setTimeout(() => setReportSuccess(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#182230]">Campus Community Feed</h1>
          <p className="text-sm text-[#667085] mt-1">
            Voices, achievements, project updates, and discussions across Northstar University
          </p>
        </div>
        <button
          onClick={() => setComposerOpen(!composerOpen)}
          className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus size={14} />
          Create Post
        </button>
      </div>

      {/* COMPOSER CARD */}
      {composerOpen && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6 shadow-sm animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E7EB]">
            <span className="text-xs font-bold text-[#182230]">Share with the Campus</span>
            <button
              onClick={() => setComposerOpen(false)}
              className="text-[#667085] hover:text-[#182230]"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              rows={4}
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder={`What's on your mind or in your research, ${currentUser.name.split(' ')[0]}?`}
              className="w-full p-3.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
              required
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#667085] font-semibold">Post Category:</span>
                <select
                  value={postType}
                  onChange={e => setPostType(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#182230] font-medium"
                >
                  <option value="general">General Post</option>
                  <option value="question">Question & Discussion</option>
                  <option value="achievement">Achievement / Milestone</option>
                  <option value="project">Project Showcase</option>
                  {(currentUser.role === 'admin' || currentUser.role === 'faculty') && (
                    <option value="announcement">Official Announcement</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#667085] hover:text-[#182230]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Send size={13} />
                  Publish Post
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
        {[
          { id: 'all', label: 'All Feeds' },
          { id: 'announcement', label: '📢 Announcements' },
          { id: 'achievement', label: '🏆 Achievements' },
          { id: 'project', label: '🚀 Projects' },
          { id: 'question', label: '❓ Discussions' },
          { id: 'alumni', label: '🎓 Alumni Insights' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as FeedFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === filter.id
                ? 'bg-[#14213D] text-white shadow-sm'
                : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {reportSuccess && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
          <Flag size={14} className="text-amber-600" />
          Thank you. The post has been flagged for institution administrator review.
        </div>
      )}

      {/* POST LIST */}
      <div className="space-y-4">
        {filteredPosts.map(post => {
          const authorUser = post.authorType === 'user' ? getUserById(post.authorId) : null;
          const authorClub = post.authorType === 'club' ? getClubById(post.authorId) : null;

          const authorName = authorUser?.name ?? authorClub?.name ?? 'Campus Member';
          const authorAvatar = authorUser?.avatar ?? authorClub?.logo ?? 'https://i.pravatar.cc/150';
          const authorVerified =
            authorUser?.verificationStatus === 'verified' || authorClub?.verificationStatus === 'verified';

          const isLiked = post.likes.includes(currentUser.id);
          const isSaved = state.savedPostIds.includes(post.id);

          return (
            <CommunityPostCard
              key={post.id}
              post={post}
              authorName={authorName}
              authorAvatar={authorAvatar}
              authorVerified={authorVerified}
              authorRole={authorUser?.role ?? 'club'}
              authorDept={authorUser?.department}
              isLiked={isLiked}
              isSaved={isSaved}
              onLike={() => actions.toggleLikePost(post.id)}
              onSave={() => actions.toggleSavePost(post.id)}
              onComment={(text: string) => actions.addComment(post.id, text)}
              onReport={() => handleReport(post.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Individual Post Card with Interactive Comments ────────────────────────────
function CommunityPostCard({
  post,
  authorName,
  authorAvatar,
  authorVerified,
  authorRole,
  authorDept,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onComment,
  onReport,
}: {
  post: Post;
  authorName: string;
  authorAvatar: string;
  authorVerified: boolean;
  authorRole: string;
  authorDept?: string;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onComment: (text: string) => void;
  onReport: () => void;
}) {
  const { state } = useApp();
  const currentUser = useCurrentUser();
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onComment(commentInput);
    setCommentInput('');
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all ${
        post.isOfficial
          ? 'border-l-4 border-l-[#5146E5] border-[#E5E7EB]'
          : 'border-[#E5E7EB]'
      }`}
    >
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB] shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-[#182230]">{authorName}</span>
                {authorVerified && (
                  <CheckCircle size={14} className="text-[#0F9D8A] shrink-0" />
                )}
                {post.isOfficial && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#EEF0FD] text-[#5146E5] rounded">
                    Official Notice
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#667085] flex items-center gap-1.5 mt-0.5">
                <span className="capitalize">{authorRole}</span>
                {authorDept && (
                  <>
                    <span>•</span>
                    <span>{authorDept}</span>
                  </>
                )}
                <span>•</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-[#667085] hover:text-[#182230] p-1"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 w-36 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-1 z-10">
                <button
                  onClick={() => {
                    onReport();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <Flag size={12} />
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-xs text-[#182230] mt-3 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {post.image && (
          <div className="mt-3 rounded-xl overflow-hidden max-h-80 border border-[#E5E7EB]">
            <img
              src={post.image}
              alt="Post attachment"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-5 py-2.5 bg-[#F7F8FC] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#667085]">
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 font-semibold transition-colors ${
              isLiked ? 'text-rose-600' : 'hover:text-[#182230]'
            }`}
          >
            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{post.likes.length}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 font-semibold hover:text-[#182230] transition-colors"
          >
            <MessageSquare size={15} />
            <span>{post.comments.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            className={`p-1 transition-colors ${isSaved ? 'text-[#5146E5]' : 'hover:text-[#182230]'}`}
            title={isSaved ? 'Saved' : 'Save post'}
          >
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="p-5 border-t border-[#E5E7EB] bg-white space-y-3">
          {/* Comment composer */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Write a constructive campus comment..."
              className="flex-1 px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-xl hover:bg-[#4338CA] transition-colors shrink-0"
            >
              <Send size={12} />
            </button>
          </form>

          {/* Comment list */}
          {post.comments.length > 0 && (
            <div className="space-y-2.5 pt-2">
              {post.comments.map(c => {
                const commentUser = getUserById(c.authorId);
                return (
                  <div key={c.id} className="p-3 bg-[#F7F8FC] rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#182230]">
                        {commentUser?.name ?? 'Campus Member'}
                      </span>
                      <span className="text-[10px] text-[#667085]">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-[#182230] leading-relaxed">{c.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
