'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getClubById, getUserById, formatDate, DEMO_EVENTS, DEMO_POSTS } from '@/lib/demo-data';
import {
  Users,
  CheckCircle,
  Calendar,
  Globe,
  Share2,
  Settings,
  Shield,
  ChevronLeft,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
  MessageSquare,
  Heart,
  Tag,
  Building2,
} from 'lucide-react';

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();
  const clubId = params.id as string;
  const club = getClubById(clubId);

  const [copied, setCopied] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (!club) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Building2 size={40} className="text-[#667085] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#182230]">Club not found</h2>
        <p className="text-sm text-[#667085] mt-1 mb-6">
          The requested student club or society does not exist.
        </p>
        <Link
          href="/dashboard/clubs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-lg"
        >
          <ChevronLeft size={16} />
          Back to Clubs
        </Link>
      </div>
    );
  }

  const isMember = currentUser.clubMemberships.includes(club.id);
  const isLeader = currentUser.clubLeaderOf.includes(club.id);
  const hasPendingReq = state.membershipRequests.some(
    r => r.clubId === club.id && r.userId === currentUser.id && r.status === 'pending'
  );

  const clubEvents = state.events.filter(e => e.organizerId === club.id);
  const clubPosts = state.posts.filter(p => p.clubId === club.id);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.requestJoinClub(club.id, requestMsg);
    setShowJoinModal(false);
    setRequestMsg('');
  };

  return (
    <div className="min-h-full pb-12">
      {/* Cover Banner */}
      <div className="h-56 md:h-72 w-full relative bg-slate-800">
        <img
          src={club.coverImage}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Back navigation */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/dashboard/clubs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white text-xs font-semibold backdrop-blur transition-colors"
          >
            <ChevronLeft size={14} />
            All Clubs
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Profile Bar */}
        <div className="relative -mt-16 sm:-mt-20 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <img
              src={club.logo}
              alt={club.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md bg-white object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-[#182230]">{club.name}</h1>
                {club.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F6F4] text-[#0F9D8A]">
                    <CheckCircle size={13} />
                    Verified Club
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#667085] mt-1.5 flex-wrap">
                <span className="font-semibold text-[#5146E5] bg-[#EEF0FD] px-2 py-0.5 rounded">
                  {club.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {club.memberCount} Members
                </span>
                <span>•</span>
                <span>{club.founded ? `Founded ${formatDate(club.founded)}` : 'Founding date not publicly listed'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 border border-[#E5E7EB] hover:bg-[#F7F8FC] text-xs font-semibold text-[#182230] rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Share2 size={14} />
              {copied ? 'Copied Link!' : 'Share'}
            </button>

            {isLeader ? (
              <Link
                href={`/dashboard/clubs/${club.id}/dashboard`}
                className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Settings size={14} />
                Club Leader Dashboard
              </Link>
            ) : isMember ? (
              <button
                onClick={() => actions.leaveClub(club.id)}
                className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl transition-colors"
              >
                Leave Club
              </button>
            ) : hasPendingReq ? (
              <span className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl border border-amber-200 flex items-center gap-1.5">
                <Clock size={14} />
                Request Pending
              </span>
            ) : (
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Request to Join
              </button>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            {/* About & Objectives */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h2 className="text-base font-bold text-[#182230]">About {club.name}</h2>
              <p className="text-sm text-[#667085] leading-relaxed">
                {club.description}
              </p>

              {club.objectives && (
                <div className="pt-3 border-t border-[#E5E7EB]">
                  <h3 className="text-xs font-bold text-[#182230] uppercase tracking-wider mb-2">
                    Charter & Objectives
                  </h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    {club.objectives}
                  </p>
                </div>
              )}
            </div>

            {/* Leadership Team */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#182230]">Leadership & Executive Board</h2>
                <span className="text-xs text-[#667085]">
                  Official 2026/2027 Term
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {club.leadership.map((pos, idx) => {
                  const leaderUser = getUserById(pos.userId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] flex items-center gap-3"
                    >
                      {leaderUser ? (
                        <img
                          src={leaderUser.avatar}
                          alt={leaderUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/dashboard/profile/${pos.userId}`}
                            className="text-xs font-bold text-[#182230] hover:text-[#5146E5] truncate"
                          >
                            {leaderUser?.name ?? 'Student Leader'}
                          </Link>
                          {pos.verificationStatus === 'verified' && (
                            <CheckCircle size={12} className="text-[#0F9D8A] shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-[#5146E5] mt-0.5">
                          {pos.role}
                        </div>
                        <div className="text-[10px] text-[#667085]">
                          Since {formatDate(pos.since)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Club Events */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#182230]">Upcoming Events</h2>
                <Link
                  href="/dashboard/events"
                  className="text-xs font-semibold text-[#5146E5] hover:underline"
                >
                  View All Events
                </Link>
              </div>

              {clubEvents.length === 0 ? (
                <p className="text-xs text-[#667085] py-4 text-center">
                  No upcoming events scheduled right now. Check back soon!
                </p>
              ) : (
                <div className="space-y-3">
                  {clubEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3.5 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] flex items-center justify-between gap-3 hover:border-[#5146E5]/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-[#5146E5] shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-[#182230]">{event.title}</h3>
                          <div className="flex items-center gap-2 text-[11px] text-[#667085] mt-0.5">
                            <span>{formatDate(event.date)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {event.venue}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:border-[#5146E5] text-xs font-semibold text-[#182230] rounded-lg transition-colors whitespace-nowrap"
                      >
                        View Event
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Club Posts */}
            {clubPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h2 className="text-base font-bold text-[#182230] mb-4">Recent Club Updates</h2>
                <div className="space-y-4">
                  {clubPosts.map(post => (
                    <div
                      key={post.id}
                      className="p-4 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] space-y-2"
                    >
                      <p className="text-xs text-[#182230] leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                      <div className="text-[10px] text-[#667085] flex items-center justify-between pt-2 border-t border-[#E5E7EB]/60">
                        <span>{formatDate(post.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} className="text-rose-500" />
                          {post.likes.length} likes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (STATS & DETAILS) */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#182230]">Club Overview</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]">
                  <span className="text-[#667085]">Institution</span>
                  <span className="font-semibold text-[#182230]">{club.institution}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]">
                  <span className="text-[#667085]">Category</span>
                  <span className="font-semibold text-[#182230]">{club.category}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]">
                  <span className="text-[#667085]">Active Members</span>
                  <span className="font-semibold text-[#182230]">{club.memberCount}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]">
                  <span className="text-[#667085]">Affiliation Status</span>
                  <span className="font-semibold text-[#0F9D8A] flex items-center gap-1">
                    <CheckCircle size={12} />
                    Verified Chapter
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#667085]">Privacy</span>
                  <span className="font-semibold text-[#182230]">
                    {club.isPublic ? 'Publicly Visible' : 'Campus Only'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags & Interests */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-bold text-[#182230] mb-3">Topics & Focus Areas</h3>
              <div className="flex flex-wrap gap-1.5">
                {club.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-[#EEF0FD] text-[#5146E5] text-xs font-medium rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Social & External Links */}
            {Object.keys(club.socialLinks).length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                <h3 className="text-sm font-bold text-[#182230] mb-3">Links & Resources</h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(club.socialLinks).map(([platform, link]) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between p-2 bg-[#F7F8FC] rounded-lg border border-[#E5E7EB]"
                    >
                      <span className="capitalize font-medium text-[#182230]">{platform}</span>
                      <span className="text-[#5146E5] flex items-center gap-1">
                        {link}
                        <ExternalLink size={11} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REQUEST TO JOIN MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#182230]">
              Request to Join {club.name}
            </h3>
            <p className="text-xs text-[#667085] mt-1 mb-4 leading-relaxed">
              Your request will be submitted to the club's executive board and faculty adviser for review.
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1">
                  Introduction / Note to the team (optional)
                </label>
                <textarea
                  rows={3}
                  value={requestMsg}
                  onChange={e => setRequestMsg(e.target.value)}
                  placeholder="Share a sentence about your department, interest, or why you'd like to join..."
                  className="w-full p-3 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F7F8FC] text-xs font-semibold text-[#182230] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
