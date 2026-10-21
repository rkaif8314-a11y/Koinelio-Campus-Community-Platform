'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import {
  DEMO_USERS,
  DEMO_CLUBS,
  DEMO_EVENTS,
  DEMO_POSTS,
  getUserById,
  formatDate,
} from '@/lib/demo-data';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Users,
  Calendar,
  Megaphone,
  BarChart3,
  Flag,
  Search,
  Check,
  X,
  Send,
  Lock,
} from 'lucide-react';

export default function AdminPage() {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();

  const [activeTab, setActiveTab] = useState<'verifications' | 'clubs' | 'moderation' | 'announcements' | 'analytics'>('verifications');

  // Simulated verification requests queue
  const [verificationQueue, setVerificationQueue] = useState([
    {
      id: 'vr1',
      userId: 'u4',
      userName: 'Jordan Osei',
      type: 'Leadership Role',
      claim: 'Vice President of NSU Science Club',
      submittedAt: '2026-10-12',
      status: 'pending',
    },
    {
      id: 'vr2',
      userId: 'u5',
      userName: 'Sofia Reyes',
      type: 'Club Verification',
      claim: 'Charter: Northstar Photography Collective',
      submittedAt: '2026-10-14',
      status: 'pending',
    },
  ]);

  // Simulated moderation reports queue
  const [moderationReports, setModerationReports] = useState([
    {
      id: 'rep1',
      targetType: 'Post',
      targetId: 'p9',
      reporterName: 'Leo Martinez',
      reason: 'Academic integrity discussion requires faculty moderation notice',
      snippet: 'Discussion: With AI-generated content becoming mainstream, how should universities update...',
      status: 'under_review',
    },
  ]);

  // Official announcement state
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleVerify = (id: string, approve: boolean) => {
    setVerificationQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: approve ? 'approved' : 'rejected' } : item
      )
    );
  };

  const handleResolveReport = (id: string, action: 'dismissed' | 'resolved') => {
    setModerationReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status: action } : r))
    );
  };

  const handlePublishOfficialAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    actions.addPost({
      authorId: currentUser.id,
      authorType: 'user',
      content: broadcastText,
      type: 'announcement',
      isOfficial: true,
    });

    setBroadcastText('');
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#182230]">Institution Administration</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#14213D] text-white rounded">
              Northstar University
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Verification queues, student society charters, moderation reports, and campus announcements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#0F9D8A] bg-teal-50 border border-teal-100 font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Shield size={14} />
            Administrator Clearance
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] mb-6 overflow-x-auto scrollbar-none">
        {[
          {
            id: 'verifications',
            label: `Verification Requests (${verificationQueue.filter(v => v.status === 'pending').length})`,
          },
          { id: 'clubs', label: `Clubs & Charters (${state.clubs.length})` },
          {
            id: 'moderation',
            label: `Moderation Queue (${moderationReports.filter(r => r.status === 'under_review').length})`,
          },
          { id: 'announcements', label: 'Official Broadcast' },
          { id: 'analytics', label: 'Campus Activity Analytics' },
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
          </button>
        ))}
      </div>

      {/* TAB: VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <Shield size={18} className="text-[#5146E5] shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <strong>Official Affiliation Verification Standard:</strong> Approving a verification attaches an immutable badge to the member's profile confirming enrollment and leadership.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#E5E7EB] overflow-hidden shadow-sm">
            {verificationQueue.map(item => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#182230]">{item.userName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EEF0FD] text-[#5146E5] rounded">
                      {item.type}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#182230] mt-1">
                    Claim: {item.claim}
                  </div>
                  <div className="text-[11px] text-[#667085] mt-0.5">
                    Submitted on {item.submittedAt}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleVerify(item.id, false)}
                        className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <X size={14} />
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleVerify(item.id, true)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Check size={14} />
                        Approve & Badge
                      </button>
                    </>
                  ) : item.status === 'approved' ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1">
                      <CheckCircle size={14} />
                      Approved
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1">
                      <XCircle size={14} />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CLUBS & CHARTERS */}
      {activeTab === 'clubs' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E5E7EB] font-bold text-sm text-[#182230]">
            Chartered Campus Organizations
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {state.clubs.map(club => (
              <div key={club.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#E5E7EB]"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#182230]">{club.name}</div>
                    <div className="text-[11px] text-[#667085]">
                      {club.category} · {club.memberCount} members
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle size={11} />
                    Verified Charter
                  </span>
                  <Link
                    href={`/dashboard/clubs/${club.id}`}
                    className="text-xs text-[#5146E5] font-semibold hover:underline"
                  >
                    View Club
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#E5E7EB] overflow-hidden shadow-sm">
            {moderationReports.map(rep => (
              <div key={rep.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                      Report #{rep.id}
                    </span>
                    <span className="text-xs text-[#667085]">Reported by {rep.reporterName}</span>
                  </div>

                  {rep.status === 'under_review' ? (
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                      Under Review
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-[#667085] rounded-lg">
                      {rep.status === 'dismissed' ? 'Dismissed' : 'Action Taken'}
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#182230]">
                  <strong>Reason:</strong> {rep.reason}
                </div>

                <div className="p-3 bg-[#F7F8FC] rounded-xl text-xs text-[#667085] italic border border-[#E5E7EB]">
                  "{rep.snippet}"
                </div>

                {rep.status === 'under_review' && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'dismissed')}
                      className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-semibold rounded-lg hover:bg-[#F7F8FC]"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'resolved')}
                      className="px-3 py-1.5 bg-[#5146E5] text-white text-xs font-semibold rounded-lg hover:bg-[#4338CA]"
                    >
                      Resolve & Retain
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: OFFICIAL BROADCAST */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-[#5146E5]" />
            <h2 className="text-sm font-bold text-[#182230]">Publish Official Campus Notice</h2>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Notices published from this console appear with the highest priority across all student, faculty, and alumni dashboards with an official Northstar Administration emblem.
          </p>

          {broadcastSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600" />
              Notice successfully published to all 2,400+ campus feeds!
            </div>
          )}

          <form onSubmit={handlePublishOfficialAnnouncement} className="space-y-4">
            <textarea
              rows={5}
              value={broadcastText}
              onChange={e => setBroadcastText(e.target.value)}
              placeholder="Draft the institutional announcement (e.g. academic calendar update, safety notice, campus initiative)..."
              className="w-full p-3.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#5146E5] hover:bg-[#4338CA] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
            >
              <Send size={14} />
              Broadcast Notice
            </button>
          </form>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-semibold">Active Campus Accounts</div>
              <div className="text-2xl font-bold text-[#182230] mt-1">2,842</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">+14% this month</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-semibold">Student Clubs Active</div>
              <div className="text-2xl font-bold text-[#182230] mt-1">{state.clubs.length}</div>
              <div className="text-[11px] text-[#5146E5] font-semibold mt-1">100% chartered</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-semibold">Event Registrations</div>
              <div className="text-2xl font-bold text-[#182230] mt-1">1,480</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Across 10 events</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB]">
              <div className="text-xs text-[#667085] font-semibold">Alumni Engagement Rate</div>
              <div className="text-2xl font-bold text-[#182230] mt-1">64%</div>
              <div className="text-[11px] text-[#0F9D8A] font-semibold mt-1">Homecoming active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
