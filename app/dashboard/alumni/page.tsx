'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { DEMO_USERS, DEMO_POSTS, DEMO_EVENTS, formatDate } from '@/lib/demo-data';
import {
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Heart,
  Shield,
  Award,
} from 'lucide-react';

export default function AlumniPage() {
  const { state } = useApp();
  const currentUser = useCurrentUser();

  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [mentorshipOnly, setMentorshipOnly] = useState<boolean>(false);

  // Alumni records
  const alumniUsers = state.users.filter(u => u.role === 'alumni' && u.isPublic);

  const departments = [
    'All',
    'Computer Science',
    'Electrical Engineering',
    'Business Administration',
  ];

  const graduationYears = ['All', '2022', '2021', '2020'];

  // Filtering
  const filteredAlumni = alumniUsers.filter(al => {
    const q = query.toLowerCase();
    const matchesQuery =
      al.name.toLowerCase().includes(q) ||
      al.department.toLowerCase().includes(q) ||
      al.bio.toLowerCase().includes(q) ||
      al.skills.some(s => s.toLowerCase().includes(q));

    const matchesYear = selectedYear === 'All' || al.graduationYear?.toString() === selectedYear;
    const matchesDept = selectedDept === 'All' || al.department === selectedDept;
    const matchesMentorship = !mentorshipOnly || al.interests.includes('Mentoring');

    return matchesQuery && matchesYear && matchesDept && matchesMentorship;
  });

  // Alumni stories from posts
  const alumniStories = state.posts.filter(p => p.type === 'alumni');

  // Reunion events
  const reunionEvents = state.events.filter(e => e.category === 'Alumni Reunions');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#182230]">Alumni Network & Directory</h1>
        <p className="text-sm text-[#667085] mt-1">
          Connect with graduates, explore career paths, and discover campus homecoming reunions
        </p>
      </div>

      {/* Hero Homecoming Notice */}
      {reunionEvents.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#14213D] to-[#1E293B] text-white rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#0F9D8A] text-white rounded-full">
              Upcoming Gathering
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              {reunionEvents[0].title}
            </h2>
            <p className="text-xs text-white/70 max-w-xl leading-relaxed">
              {reunionEvents[0].description}
            </p>
            <div className="text-xs text-teal-300 font-medium pt-1">
              {formatDate(reunionEvents[0].date)} · {reunionEvents[0].venue}
            </div>
          </div>
          <Link
            href={`/dashboard/events/${reunionEvents[0].id}`}
            className="px-4 py-2 bg-white text-[#14213D] hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            RSVP for Reunion
          </Link>
        </div>
      )}

      {/* Directory Search & Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-8 shadow-sm space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            placeholder="Search alumni by name, role, company, or domain (e.g. 'Stripe', 'Fintech', 'Clean Energy')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F7F8FC] text-xs text-[#182230] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E7EB] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#667085] font-semibold">Graduation Year:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="p-1.5 border border-[#E5E7EB] rounded-lg bg-white font-medium text-[#182230]"
              >
                {graduationYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Department filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#667085] font-semibold">Department:</span>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="p-1.5 border border-[#E5E7EB] rounded-lg bg-white font-medium text-[#182230]"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mentorship opt-in checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-[#182230] font-medium">
            <input
              type="checkbox"
              checked={mentorshipOnly}
              onChange={e => setMentorshipOnly(e.target.checked)}
              className="rounded text-[#5146E5] focus:ring-[#5146E5]"
            />
            <span>Open to Student Mentorship only</span>
          </label>
        </div>
      </div>

      {/* ALUMNI CARDS GRID */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#182230]">
            Alumni Directory ({filteredAlumni.length})
          </h2>
          <span className="text-xs text-[#667085]">
            Fictional alumni demo profiles
          </span>
        </div>

        {filteredAlumni.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center max-w-md mx-auto">
            <GraduationCap size={32} className="text-[#667085] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#182230]">No alumni match your filters</h3>
            <p className="text-xs text-[#667085] mt-1">Try resetting the department or year filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlumni.map(al => {
              const isMentor = al.interests.includes('Mentoring');
              return (
                <div
                  key={al.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={al.avatar}
                        alt={al.name}
                        className="w-14 h-14 rounded-full object-cover border border-[#E5E7EB] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/dashboard/profile/${al.id}`}
                            className="font-bold text-sm text-[#182230] hover:text-[#5146E5] truncate"
                          >
                            {al.name}
                          </Link>
                          <CheckCircle size={13} className="text-[#0F9D8A] shrink-0" />
                        </div>
                        <div className="text-xs font-semibold text-[#5146E5] mt-0.5">
                          Class of {al.graduationYear}
                        </div>
                        <div className="text-[11px] text-[#667085] truncate">{al.department}</div>
                      </div>
                    </div>

                    <p className="text-xs text-[#182230] mt-3 leading-relaxed line-clamp-3">
                      {al.bio}
                    </p>

                    {/* Mentorship indicator */}
                    {isMentor && (
                      <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F9D8A] text-[11px] font-bold">
                        <Award size={12} />
                        Voluntary Mentor Opt-in
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="text-[#667085] text-[11px]">Directory Visible</span>
                    <Link
                      href={`/dashboard/profile/${al.id}`}
                      className="text-[#5146E5] font-semibold hover:underline flex items-center gap-1"
                    >
                      View Profile
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ALUMNI STORIES & PERSPECTIVES */}
      {alumniStories.length > 0 && (
        <div className="bg-[#F7F8FC] rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#5146E5]" />
            <h2 className="text-base font-bold text-[#182230]">Alumni Perspectives & Career Insights</h2>
          </div>

          <div className="space-y-4">
            {alumniStories.map(story => {
              const author = state.users.find(u => u.id === story.authorId);
              return (
                <div key={story.id} className="p-4 bg-white rounded-xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={author?.avatar ?? 'https://i.pravatar.cc/150'}
                      alt={author?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#182230]">{author?.name}</div>
                      <div className="text-[10px] text-[#667085]">
                        Class of {author?.graduationYear} · {author?.department}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#182230] leading-relaxed whitespace-pre-line italic">
                    "{story.content}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
