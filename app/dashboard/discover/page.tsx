'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import {
  DEMO_CLUBS,
  DEMO_EVENTS,
  DEMO_USERS,
  formatDate,
  formatShortDate,
} from '@/lib/demo-data';
import {
  Search,
  Users,
  Calendar,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  ArrowRight,
  Filter,
  X,
  Building2,
  BookOpen,
} from 'lucide-react';

type TabType = 'all' | 'clubs' | 'events' | 'students' | 'faculty' | 'alumni';

export default function DiscoverPage() {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const departments = [
    'All',
    'Computer Science',
    'Electrical Engineering',
    'Business Administration',
    'Physics',
    'Design and Media Arts',
    'Economics',
    'Law',
  ];

  // Search logic
  const q = query.toLowerCase();

  const matchedClubs = state.clubs.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );

  const matchedEvents = state.events.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q)
  );

  const matchedUsers = state.users.filter(u => {
    const matchesQuery =
      u.name.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.skills.some(s => s.toLowerCase().includes(q)) ||
      u.interests.some(i => i.toLowerCase().includes(q));

    const matchesDept = selectedDept === 'All' || u.department === selectedDept;
    return matchesQuery && matchesDept;
  });

  const students = matchedUsers.filter(u => u.role === 'student');
  const faculty = matchedUsers.filter(u => u.role === 'faculty');
  const alumni = matchedUsers.filter(u => u.role === 'alumni');

  const totalResults =
    activeTab === 'all'
      ? matchedClubs.length + matchedEvents.length + matchedUsers.length
      : activeTab === 'clubs'
      ? matchedClubs.length
      : activeTab === 'events'
      ? matchedEvents.length
      : activeTab === 'students'
      ? students.length
      : activeTab === 'faculty'
      ? faculty.length
      : alumni.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#182230]">Explore Campus Directory</h1>
        <p className="text-sm text-[#667085] mt-1">
          Search across student societies, upcoming events, faculty advisers, peers, and alumni
        </p>

        {/* Global Search Bar */}
        <div className="mt-4 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            placeholder="Search by keywords, interests (e.g. 'Robotics', 'Machine Learning', 'Debate')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-sm text-[#182230] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5] shadow-sm transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#182230]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] mb-6 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'clubs', label: `Clubs (${matchedClubs.length})` },
          { id: 'events', label: `Events (${matchedEvents.length})` },
          { id: 'students', label: `Students (${students.length})` },
          { id: 'faculty', label: `Faculty (${faculty.length})` },
          { id: 'alumni', label: `Alumni (${alumni.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
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

      {/* Department Filter for People Tabs */}
      {['all', 'students', 'faculty', 'alumni'].includes(activeTab) && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 scrollbar-none">
          <span className="text-xs text-[#667085] font-semibold mr-1 flex items-center gap-1">
            <Filter size={12} />
            Department:
          </span>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-[#14213D] text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      )}

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-[#667085] mb-6">
        <span>Found {totalResults} campus records</span>
        <span className="text-[#0F9D8A] font-semibold flex items-center gap-1">
          <CheckCircle size={12} />
          Northstar University directory
        </span>
      </div>

      {/* ZERO RESULTS */}
      {totalResults === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center max-w-md mx-auto">
          <Search size={32} className="text-[#667085] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#182230]">No records match your query</h3>
          <p className="text-xs text-[#667085] mt-1 mb-4">
            Try adjusting your search keywords, clearing department filters, or browsing other tabs.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedDept('All');
            }}
            className="px-3.5 py-1.5 bg-[#EEF0FD] text-[#5146E5] font-semibold text-xs rounded-lg"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* SECTION: CLUBS */}
      {(activeTab === 'all' || activeTab === 'clubs') && matchedClubs.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#182230] flex items-center gap-2">
              <Users size={16} className="text-[#5146E5]" />
              Student Clubs & Chapters ({matchedClubs.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedClubs.map(club => {
              const isMember = currentUser.clubMemberships.includes(club.id);
              return (
                <div
                  key={club.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E5E7EB] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/clubs/${club.id}`}
                          className="font-bold text-sm text-[#182230] hover:text-[#5146E5] truncate"
                        >
                          {club.name}
                        </Link>
                        {club.verificationStatus === 'verified' && (
                          <CheckCircle size={13} className="text-[#0F9D8A] shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#5146E5] font-semibold bg-[#EEF0FD] px-1.5 py-0.5 rounded">
                        {club.category}
                      </span>
                      <p className="text-xs text-[#667085] mt-1.5 line-clamp-2">
                        {club.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="text-[#667085]">{club.memberCount} members</span>
                    <Link
                      href={`/dashboard/clubs/${club.id}`}
                      className="text-[#5146E5] font-semibold hover:underline flex items-center gap-1"
                    >
                      View Club
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: EVENTS */}
      {(activeTab === 'all' || activeTab === 'events') && matchedEvents.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#182230] flex items-center gap-2">
              <Calendar size={16} className="text-[#0F9D8A]" />
              Campus Events & Conferences ({matchedEvents.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedEvents.map(event => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#667085] mb-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-[#5146E5] font-semibold rounded">
                      {event.category}
                    </span>
                    <span>{formatShortDate(event.date)}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#182230]">
                    <Link href={`/dashboard/events/${event.id}`} className="hover:text-[#5146E5]">
                      {event.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-[#667085] mt-1 line-clamp-2">{event.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#667085] truncate max-w-[150px]">{event.venue}</span>
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="text-[#5146E5] font-semibold hover:underline"
                  >
                    View RSVP →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PEOPLE (Students, Faculty, Alumni) */}
      {(activeTab === 'all' || activeTab === 'students' || activeTab === 'faculty' || activeTab === 'alumni') &&
        matchedUsers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#182230] flex items-center gap-2">
                <GraduationCap size={16} className="text-[#14213D]" />
                Members & People Directory ({matchedUsers.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#E5E7EB] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/dashboard/profile/${user.id}`}
                            className="font-bold text-sm text-[#182230] hover:text-[#5146E5] truncate"
                          >
                            {user.name}
                          </Link>
                          {user.verificationStatus === 'verified' && (
                            <CheckCircle size={13} className="text-[#0F9D8A] shrink-0" />
                          )}
                        </div>

                        <div className="text-[11px] font-semibold text-[#5146E5] capitalize">
                          {user.designation ?? (user.role === 'alumni' ? `Alumni · Class of ${user.graduationYear}` : user.course ?? user.role)}
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5 truncate">{user.department}</div>
                      </div>
                    </div>

                    <p className="text-xs text-[#667085] mt-3 line-clamp-2 leading-relaxed">
                      {user.bio}
                    </p>

                    {/* Skills/Interests */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {user.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-[#F7F8FC] border border-[#E5E7EB] text-[10px] text-[#667085] rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="text-[#0F9D8A] font-semibold text-[11px]">
                      {user.verificationStatus === 'verified' ? '✓ Verified Affiliation' : 'Pending Verification'}
                    </span>
                    <Link
                      href={`/dashboard/profile/${user.id}`}
                      className="text-[#5146E5] font-semibold hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
