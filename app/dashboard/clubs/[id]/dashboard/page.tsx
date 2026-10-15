'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getClubById, getUserById, formatDate } from '@/lib/demo-data';
import {
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Shield,
  Settings,
  ChevronLeft,
  Search,
  Plus,
  Send,
  AlertCircle,
  Building2,
  Bell,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function ClubLeaderDashboard() {
  const params = useParams();
  const router = useRouter();
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();
  const clubId = params.id as string;
  const club = getClubById(clubId);

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'requests' | 'events' | 'announcements' | 'settings'>('overview');
  const [memberSearch, setMemberSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // New announcement modal / form
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  // Check access authorization: only club leaders or admin
  const isLeader = currentUser.clubLeaderOf.includes(clubId) || currentUser.role === 'admin';

  if (!club) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Building2 size={40} className="text-[#667085] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#182230]">Club not found</h2>
        <Link
          href="/dashboard/clubs"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-lg"
        >
          <ChevronLeft size={16} />
          Back to Clubs
        </Link>
      </div>
    );
  }

  if (!isLeader) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Shield size={40} className="text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#182230]">Access Restricted</h2>
        <p className="text-sm text-[#667085] mt-2 mb-6 leading-relaxed">
          The leader dashboard is only accessible to verified executive leaders of <strong>{club.name}</strong> or institution administrators.
        </p>
        <Link
          href={`/dashboard/clubs/${club.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-lg"
        >
          <ChevronLeft size={16} />
          View Public Club Page
        </Link>
      </div>
    );
  }

  // Club members: find users who have this club in clubMemberships
  const clubMembers = state.users.filter(u => u.clubMemberships.includes(club.id));
  const filteredMembers = clubMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.department.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Pending requests for this club
  const pendingRequests = state.membershipRequests.filter(
    r => r.clubId === club.id && r.status === 'pending'
  );

  const clubEvents = state.events.filter(e => e.organizerId === club.id);

  const handleDecision = (requestId: string, decision: 'approved' | 'rejected') => {
    actions.decideMembershipRequest(requestId, decision);
    setFeedback(`Request ${decision === 'approved' ? 'approved' : 'declined'} successfully.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    actions.addPost({
      authorId: club.id,
      authorType: 'club',
      content: announcementText,
      type: 'announcement',
      isOfficial: true,
      clubId: club.id,
    });

    setAnnouncementText('');
    setAnnouncementSent(true);
    setTimeout(() => setAnnouncementSent(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/clubs/${club.id}`}
            className="p-2 border border-[#E5E7EB] rounded-lg text-[#667085] hover:text-[#182230] hover:bg-white transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <img
            src={club.logo}
            alt={club.name}
            className="w-12 h-12 rounded-xl object-cover border border-[#E5E7EB]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#182230]">{club.name}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#14213D] text-white rounded">
                Executive Portal
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Managed by {currentUser.name} ({currentUser.role})
            </p>
          </div>
        </div>

        <Link
          href={`/dashboard/clubs/${club.id}`}
          className="text-xs font-semibold text-[#5146E5] hover:underline self-start md:self-center"
        >
          View Public Page →
        </Link>
      </div>

      {feedback && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle size={14} className="text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] mb-6 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'members', label: `Members (${clubMembers.length})` },
          { id: 'requests', label: `Recruitment (${pendingRequests.length})`, alert: pendingRequests.length > 0 },
          { id: 'events', label: `Events (${clubEvents.length})` },
          { id: 'announcements', label: 'Announcements' },
          { id: 'settings', label: 'Club Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors relative ${
              activeTab === tab.id
                ? 'text-[#5146E5] border-b-2 border-[#5146E5]'
                : 'text-[#667085] hover:text-[#182230]'
            }`}
          >
            {tab.label}
            {tab.alert && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white font-bold rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-medium">Total Active Members</div>
              <div className="text-2xl font-bold text-[#182230] mt-1">{club.memberCount}</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                Verified roster
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-medium">Pending Applications</div>
              <div className="text-2xl font-bold text-[#182230] mt-1">{pendingRequests.length}</div>
              <div className="text-[11px] text-amber-600 mt-1 font-medium">
                Awaiting review
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-medium">Upcoming Events</div>
              <div className="text-2xl font-bold text-[#182230] mt-1">{clubEvents.length}</div>
              <div className="text-[11px] text-[#5146E5] mt-1 font-medium">
                Scheduled for Autumn
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-medium">Charter Status</div>
              <div className="text-base font-bold text-[#0F9D8A] mt-2 flex items-center gap-1.5">
                <CheckCircle size={16} />
                Official Chapter
              </div>
              <div className="text-[11px] text-[#667085] mt-0.5">
                Adviser: {club.leadership.find(l => l.role.includes('Adviser'))?.role ?? 'Assigned'}
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <Shield size={20} className="text-[#5146E5] shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <strong>Official Leadership Governance:</strong> Official leadership roles at Northstar University require faculty or administration approval. Changes to the executive board are submitted directly to the Office of Student Affairs.
            </div>
          </div>
        </div>
      )}

      {/* TAB: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[#182230]">Enrolled Roster</h3>
            <div className="w-full sm:w-64 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                placeholder="Search member name or dept..."
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] border-b border-[#E5E7EB] text-[#667085] font-bold">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role / Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Affiliation Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredMembers.map(m => {
                  const leadershipRole = club.leadership.find(l => l.userId === m.id);
                  return (
                    <tr key={m.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <Link
                              href={`/dashboard/profile/${m.id}`}
                              className="font-bold text-[#182230] hover:text-[#5146E5]"
                            >
                              {m.name}
                            </Link>
                            <div className="text-[10px] text-[#667085]">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {leadershipRole ? (
                          <span className="font-semibold text-[#5146E5]">
                            {leadershipRole.role}
                          </span>
                        ) : (
                          <span className="text-[#667085]">Member</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#182230]">{m.department}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle size={11} />
                          Enrolled
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dashboard/profile/${m.id}`}
                          className="text-xs text-[#5146E5] hover:underline font-semibold"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: RECRUITMENT REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center max-w-lg mx-auto">
              <UserCheck size={32} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#182230]">Inbox is clear</h3>
              <p className="text-xs text-[#667085] mt-1">
                There are currently no pending membership applications for this club.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#E5E7EB]">
              {pendingRequests.map(req => {
                const applicant = getUserById(req.userId);
                return (
                  <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={applicant?.avatar ?? 'https://i.pravatar.cc/150'}
                        alt={applicant?.name}
                        className="w-10 h-10 rounded-full object-cover mt-0.5 border border-[#E5E7EB]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/profile/${req.userId}`}
                            className="font-bold text-sm text-[#182230] hover:text-[#5146E5]"
                          >
                            {applicant?.name ?? 'Applicant'}
                          </Link>
                          <span className="text-[10px] text-[#667085] bg-[#F7F8FC] border border-[#E5E7EB] px-2 py-0.5 rounded">
                            {applicant?.department}
                          </span>
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Submitted on {formatDate(req.requestedAt)}
                        </div>
                        {req.message && (
                          <div className="mt-2 text-xs text-[#182230] bg-[#F7F8FC] p-2.5 rounded-xl border border-[#E5E7EB]">
                            "{req.message}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleDecision(req.id, 'rejected')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <UserX size={14} />
                        Decline
                      </button>
                      <button
                        onClick={() => handleDecision(req.id, 'approved')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <UserCheck size={14} />
                        Approve Membership
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#182230]">Club Scheduled Events</h3>
            <Link
              href="/dashboard/events"
              className="px-3.5 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Plus size={14} />
              Host New Event
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubEvents.map(event => (
              <div key={event.id} className="p-4 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#667085] mb-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-[#5146E5] font-semibold rounded">
                      {event.category}
                    </span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <h4 className="font-bold text-[#182230] text-sm mb-1">{event.title}</h4>
                  <p className="text-xs text-[#667085] line-clamp-2">{event.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#667085]">
                    <strong>{event.registeredCount}</strong> registered
                  </span>
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="text-[#5146E5] font-semibold hover:underline"
                  >
                    Manage Event →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-2xl mx-auto space-y-4">
          <h3 className="text-sm font-bold text-[#182230]">Broadcast Club Announcement</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Announcements published here will appear on the campus community feed with an official verified badge from <strong>{club.name}</strong>.
          </p>

          {announcementSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-600" />
              Announcement broadcast successfully to all campus members!
            </div>
          )}

          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <textarea
              rows={4}
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              placeholder="Write your announcement to all club members and followers..."
              className="w-full p-3.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Send size={14} />
              Publish Broadcast
            </button>
          </form>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-2xl mx-auto space-y-4">
          <h3 className="text-sm font-bold text-[#182230]">Club Configuration</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#182230] mb-1">Club Display Name</label>
              <input
                type="text"
                defaultValue={club.name}
                className="w-full p-2.5 border border-[#E5E7EB] rounded-xl bg-slate-50 text-[#667085]"
                disabled
              />
              <span className="text-[10px] text-[#667085] mt-1 block">
                Official name modifications must be approved by the Student Affairs administration.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#182230] mb-1">Category</label>
              <input
                type="text"
                defaultValue={club.category}
                className="w-full p-2.5 border border-[#E5E7EB] rounded-xl bg-slate-50 text-[#667085]"
                disabled
              />
            </div>

            <div>
              <label className="block font-semibold text-[#182230] mb-1">Public Mission / Objectives</label>
              <textarea
                rows={3}
                defaultValue={club.objectives}
                className="w-full p-2.5 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setFeedback('Club profile settings saved.');
                setTimeout(() => setFeedback(null), 3000);
              }}
              className="px-4 py-2 bg-[#14213D] text-white font-semibold rounded-xl"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
