'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getUserById, getClubById, formatDate, timeAgo } from '@/lib/demo-data';
import {
  Users,
  CheckCircle,
  Calendar,
  GraduationCap,
  Briefcase,
  Globe,
  Link2,
  Shield,
  Clock,
  Sparkles,
  Edit3,
  Heart,
  MessageSquare,
  Lock,
  ChevronLeft,
} from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const { state } = useApp();
  const currentUser = useCurrentUser();
  const profileId = params.id as string;
  const user = state.users.find(u => u.id === profileId) ?? getUserById(profileId);

  const [activeTab, setActiveTab] = useState<'posts' | 'clubs' | 'verification'>('posts');

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Users size={40} className="text-[#667085] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#182230]">Profile not found</h2>
        <p className="text-sm text-[#667085] mt-1 mb-6">
          The requested campus member profile does not exist or has been made private.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-lg"
        >
          <ChevronLeft size={16} />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isSelf = user.id === currentUser.id;
  const userPosts = state.posts.filter(p => p.authorId === user.id);
  const userClubs = state.clubs.filter(c => user.clubMemberships.includes(c.id));

  return (
    <div className="min-h-full pb-16">
      {/* Cover Banner */}
      <div className="h-44 sm:h-56 w-full relative bg-gradient-to-r from-[#14213D] via-[#1E293B] to-[#5146E5]/80" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header Profile Bar */}
        <div className="relative -mt-16 sm:-mt-20 mb-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md bg-white object-cover"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#182230]">{user.name}</h1>
                  {user.verificationStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F6F4] text-[#0F9D8A]">
                      <CheckCircle size={13} />
                      Verified {user.role === 'faculty' ? 'Faculty' : user.role === 'alumni' ? 'Alumni' : 'Student'}
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#5146E5] font-semibold mt-1">
                  {user.designation ?? (user.role === 'alumni' ? `Alumni · Class of ${user.graduationYear}` : user.course ?? user.role)}
                </div>

                <div className="flex items-center gap-3 text-xs text-[#667085] mt-1 flex-wrap">
                  <span>{user.department}</span>
                  <span>•</span>
                  <span>{user.institution}</span>
                </div>
              </div>
            </div>

            {/* Profile Action */}
            <div className="self-start sm:self-end">
              {isSelf ? (
                <Link
                  href={`/dashboard/profile/${user.id}/edit`}
                  className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F7F8FC] text-xs font-semibold text-[#182230] rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 size={14} />
                  Edit Profile & Privacy
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#0F9D8A] font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle size={12} />
                    Verified Campus Peer
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-xs text-[#182230] mt-5 leading-relaxed max-w-3xl">
            {user.bio}
          </p>

          {/* Social Links */}
          {(user.linkedIn || user.github || user.website) && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#E5E7EB] text-xs text-[#667085]">
              {user.linkedIn && (
                <span className="flex items-center gap-1 hover:text-[#5146E5]">
                  <Link2 size={13} />
                  {user.linkedIn}
                </span>
              )}
              {user.github && (
                <span className="flex items-center gap-1 hover:text-[#5146E5]">
                  <Link2 size={13} />
                  {user.github}
                </span>
              )}
              {user.website && (
                <span className="flex items-center gap-1 hover:text-[#5146E5]">
                  <Globe size={13} />
                  {user.website}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: TABS & CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab navigation */}
            <div className="flex border-b border-[#E5E7EB]">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-3 px-4 text-xs font-semibold transition-colors ${
                  activeTab === 'posts'
                    ? 'text-[#5146E5] border-b-2 border-[#5146E5]'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                Public Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('clubs')}
                className={`pb-3 px-4 text-xs font-semibold transition-colors ${
                  activeTab === 'clubs'
                    ? 'text-[#5146E5] border-b-2 border-[#5146E5]'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                Clubs & Roles ({userClubs.length})
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`pb-3 px-4 text-xs font-semibold transition-colors ${
                  activeTab === 'verification'
                    ? 'text-[#5146E5] border-b-2 border-[#5146E5]'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                Verification Portfolio
              </button>
            </div>

            {/* TAB: POSTS */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
                    <p className="text-xs text-[#667085]">No campus posts shared yet.</p>
                  </div>
                ) : (
                  userPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#667085]">
                        <span className="capitalize font-semibold text-[#5146E5]">
                          {post.type}
                        </span>
                        <span>{timeAgo(post.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#182230] leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                      {post.image && (
                        <div className="mt-2 rounded-xl overflow-hidden max-h-60 border border-[#E5E7EB]">
                          <img src={post.image} alt="Attachment" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="pt-2 border-t border-[#E5E7EB] flex items-center gap-4 text-xs text-[#667085]">
                        <span className="flex items-center gap-1">
                          <Heart size={13} className="text-rose-500" />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={13} />
                          {post.comments.length}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: CLUBS & ROLES */}
            {activeTab === 'clubs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userClubs.map(club => {
                  const leadership = club.leadership.find(l => l.userId === user.id);
                  return (
                    <div key={club.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E5E7EB]"
                        />
                        <div>
                          <Link
                            href={`/dashboard/clubs/${club.id}`}
                            className="font-bold text-xs text-[#182230] hover:text-[#5146E5]"
                          >
                            {club.name}
                          </Link>
                          <div className="text-[11px] font-semibold text-[#5146E5]">
                            {leadership?.role ?? 'Active Member'}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/clubs/${club.id}`}
                        className="text-xs font-semibold text-[#5146E5]"
                      >
                        →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: VERIFICATION PORTFOLIO */}
            {activeTab === 'verification' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#182230]">Institutional Verification Audit</h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Koinelio distinguishes between institution enrollment, faculty designation, and club leadership appointments. In this prototype, no profile has institute-verified credentials. Real verification requires authorised institutional reviewers.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#182230]">Institutional Affiliation</div>
                      <div className="text-[11px] text-[#667085]">Demo affiliation · not institute-verified</div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1">
                      <CheckCircle size={12} />
                      Demo only
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#182230]">Department & Major</div>
                      <div className="text-[11px] text-[#667085]">{user.department}</div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1">
                      <CheckCircle size={12} />
                      Demo only
                    </span>
                  </div>

                  {user.clubLeaderOf.map(clubId => {
                    const leadClub = getClubById(clubId);
                    return (
                      <div key={clubId} className="p-3.5 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#182230]">
                            Club Leadership: {leadClub?.name}
                          </div>
                          <div className="text-[11px] text-[#667085]">
                            Sample role · not institute-approved
                          </div>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1">
                          <CheckCircle size={12} />
                          Demo only
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: SKILLS & INTERESTS */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-bold text-[#182230] mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-[#EEF0FD] text-[#5146E5] text-xs font-medium rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-bold text-[#182230] mb-3">Interests & Activities</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map(interest => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 bg-[#F7F8FC] border border-[#E5E7EB] text-[#182230] text-xs font-medium rounded-lg"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-[#667085]">
              <Lock size={15} className="text-[#667085] shrink-0 mt-0.5" />
              <span>
                Personal student IDs, private phone numbers, and official transcripts are protected and never displayed publicly.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
