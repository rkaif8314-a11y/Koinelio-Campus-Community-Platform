'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getClubById, getUserById, DEMO_CLUBS, formatDate } from '@/lib/demo-data';
import {
  Users,
  CheckCircle,
  Search,
  Plus,
  ChevronRight,
  Settings,
  Shield,
  Clock,
  Filter,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Building2,
} from 'lucide-react';

export default function ClubsPage() {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<'my_clubs' | 'discover' | 'requests'>('my_clubs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const categories = [
    'All',
    'Technology',
    'Engineering',
    'Culture & Arts',
    'Science & Research',
    'Entrepreneurship',
    'Finance',
    'Debate & Public Speaking',
    'Arts & Media',
  ];

  // My clubs
  const myClubs = state.clubs.filter(c => currentUser.clubMemberships.includes(c.id));

  // Discover clubs
  const discoverClubs = state.clubs.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // User's membership requests
  const userRequests = state.membershipRequests.filter(r => r.userId === currentUser.id);

  const handleJoin = (clubId: string) => {
    actions.requestJoinClub(clubId, 'I would love to be part of this community!');
    setRequestSuccess(clubId);
    setTimeout(() => setRequestSuccess(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#182230]">Campus Clubs & Societies</h1>
          <p className="text-sm text-[#667085] mt-1">
            Connect with student organizations, attend workshops, and collaborate with peers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/discover"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#5146E5] bg-[#EEF0FD] hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Sparkles size={14} />
            Explore Directory
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] mb-6">
        <button
          onClick={() => setActiveTab('my_clubs')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
            activeTab === 'my_clubs'
              ? 'text-[#5146E5] border-b-2 border-[#5146E5]'
              : 'text-[#667085] hover:text-[#182230]'
          }`}
        >
          My Clubs ({myClubs.length})
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
            activeTab === 'discover'
              ? 'text-[#5146E5] border-b-2 border-[#5146E5]'
              : 'text-[#667085] hover:text-[#182230]'
          }`}
        >
          Discover Clubs ({state.clubs.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
            activeTab === 'requests'
              ? 'text-[#5146E5] border-b-2 border-[#5146E5]'
              : 'text-[#667085] hover:text-[#182230]'
          }`}
        >
          My Requests
          {userRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 font-bold rounded-full">
              {userRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MY CLUBS */}
      {activeTab === 'my_clubs' && (
        <div>
          {myClubs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5146E5] flex items-center justify-center mx-auto mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-base font-bold text-[#182230]">No club memberships yet</h3>
              <p className="text-xs text-[#667085] mt-1.5 mb-6 leading-relaxed">
                You haven't joined any clubs at Northstar University yet. Browse through our student societies to discover projects, events, and networking opportunities.
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Browse Clubs
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myClubs.map(club => {
                const isLeader = currentUser.clubLeaderOf.includes(club.id);
                return (
                  <div
                    key={club.id}
                    className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover */}
                      <div className="h-28 relative bg-slate-100">
                        <img
                          src={club.coverImage}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {isLeader ? (
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-[#14213D] text-white rounded-md shadow-sm">
                              Leader / President
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/90 text-[#182230] rounded-md shadow-sm">
                              Member
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 pt-0 relative">
                        <div className="-mt-7 mb-2 flex items-end justify-between">
                          <img
                            src={club.logo}
                            alt={club.name}
                            className="w-14 h-14 rounded-xl border-2 border-white shadow-sm bg-white object-cover"
                          />
                          <span className="text-xs text-[#667085] font-medium flex items-center gap-1">
                            <Users size={12} />
                            {club.memberCount} members
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <h3 className="font-bold text-[#182230] text-base truncate">{club.name}</h3>
                          {club.verificationStatus === 'verified' && (
                            <CheckCircle size={15} className="text-[#0F9D8A] shrink-0" />
                          )}
                        </div>

                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold text-[#5146E5] bg-[#EEF0FD] rounded">
                          {club.category}
                        </span>

                        <p className="text-xs text-[#667085] mt-2 line-clamp-2 leading-relaxed">
                          {club.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-3 bg-[#F7F8FC] border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/clubs/${club.id}`}
                        className="text-xs font-semibold text-[#182230] hover:text-[#5146E5] transition-colors"
                      >
                        View Page
                      </Link>

                      {isLeader ? (
                        <Link
                          href={`/dashboard/clubs/${club.id}/dashboard`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Settings size={12} />
                          Club Dashboard
                        </Link>
                      ) : (
                        <button
                          onClick={() => actions.leaveClub(club.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISCOVER */}
      {activeTab === 'discover' && (
        <div>
          {/* Search & Category Filter */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]"
              />
              <input
                type="text"
                placeholder="Search clubs by name, description, tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#182230] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5] transition-colors"
              />
            </div>

            {/* Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#14213D] text-white'
                      : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Toast feedback */}
          {requestSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle size={16} className="text-emerald-600" />
              Membership request submitted! A club administrator will review your affiliation.
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {discoverClubs.map(club => {
              const isMember = currentUser.clubMemberships.includes(club.id);
              const hasPendingReq = state.membershipRequests.some(
                r => r.clubId === club.id && r.userId === currentUser.id && r.status === 'pending'
              );

              return (
                <div
                  key={club.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Cover */}
                    <div className="h-28 relative bg-slate-100">
                      <img
                        src={club.coverImage}
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 text-[#182230] rounded shadow-sm">
                          {club.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 pt-0 relative">
                      <div className="-mt-7 mb-2 flex items-end justify-between">
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-14 h-14 rounded-xl border-2 border-white shadow-sm bg-white object-cover"
                        />
                        <span className="text-xs text-[#667085] font-medium flex items-center gap-1">
                          <Users size={12} />
                          {club.memberCount} members
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <h3 className="font-bold text-[#182230] text-base truncate">{club.name}</h3>
                        {club.verificationStatus === 'verified' && (
                          <CheckCircle size={15} className="text-[#0F9D8A] shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-[#667085] mt-2 line-clamp-3 leading-relaxed">
                        {club.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {club.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-[#F7F8FC] border border-[#E5E7EB] text-[10px] text-[#667085] rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-[#F7F8FC] border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <Link
                      href={`/dashboard/clubs/${club.id}`}
                      className="text-xs font-semibold text-[#182230] hover:text-[#5146E5] transition-colors"
                    >
                      Club Details
                    </Link>

                    {isMember ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                        <CheckCircle size={12} />
                        Joined
                      </span>
                    ) : hasPendingReq ? (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                        <Clock size={12} />
                        Requested
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoin(club.id)}
                        className="px-3 py-1.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Join Club
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {userRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center max-w-lg mx-auto">
              <Clock size={28} className="text-[#667085] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#182230]">No membership requests</h3>
              <p className="text-xs text-[#667085] mt-1">
                You haven't requested to join any clubs yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-4 border-b border-[#E5E7EB] font-bold text-sm text-[#182230]">
                Your Affiliation & Membership Requests
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {userRequests.map(req => {
                  const club = getClubById(req.clubId);
                  return (
                    <div key={req.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {club ? (
                          <img
                            src={club.logo}
                            alt={club.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#E5E7EB]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Building2 size={20} className="text-[#667085]" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[#182230]">
                            {club?.name ?? 'Unknown Club'}
                          </div>
                          <div className="text-xs text-[#667085]">
                            Submitted on {formatDate(req.requestedAt)}
                          </div>
                          {req.message && (
                            <p className="text-xs text-[#667085] italic mt-1 bg-[#F7F8FC] p-2 rounded-lg border border-[#E5E7EB]">
                              "{req.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1">
                            <Clock size={12} />
                            Pending Review
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1">
                            <CheckCircle size={12} />
                            Approved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
