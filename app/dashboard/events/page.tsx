'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getClubById, getUserById, formatDate, formatShortDate, Event } from '@/lib/demo-data';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle,
  Star,
  Globe,
  Share2,
  Sparkles,
  ArrowRight,
  Ticket,
} from 'lucide-react';

export default function EventsPage() {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'registered' | 'featured'>('all');

  const categories = [
    'All',
    'Technical',
    'Cultural',
    'Workshops',
    'Competitions',
    'Seminars',
    'Sports',
    'Alumni Reunions',
  ];

  // Filtering
  const filteredEvents = state.events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || event.category === selectedCategory;

    if (!matchesSearch || !matchesCategory) return false;

    if (dateFilter === 'registered') {
      return state.registeredEventIds.includes(event.id);
    }
    if (dateFilter === 'featured') {
      return event.isFeatured;
    }
    return true;
  });

  const featuredEvents = state.events.filter(e => e.isFeatured);
  const myRegisteredEvents = state.events.filter(e => state.registeredEventIds.includes(e.id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#182230]">Campus Events & Festivals</h1>
          <p className="text-sm text-[#667085] mt-1">
            Discover hackathons, cultural festivals, academic workshops, and campus meetups
          </p>
        </div>

        {/* Registered Quick Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateFilter(dateFilter === 'registered' ? 'all' : 'registered')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              dateFilter === 'registered'
                ? 'bg-[#5146E5] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#182230] hover:bg-[#F7F8FC]'
            }`}
          >
            <Ticket size={14} />
            My Registrations ({state.registeredEventIds.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-8">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            placeholder="Search events by title, topics, venue..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#182230] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5] transition-colors"
          />
        </div>

        {/* Filter Categories */}
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

      {/* FEATURED HERO CARDS (When showing all and not searching) */}
      {dateFilter === 'all' && selectedCategory === 'All' && !searchQuery && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#5146E5]" />
            <h2 className="text-base font-bold text-[#182230]">Featured Campus Highlights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredEvents.slice(0, 2).map(event => {
              const isRegistered = state.registeredEventIds.includes(event.id);
              const organizerClub = event.organizerType === 'club' ? getClubById(event.organizerId) : null;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Cover */}
                    <div className="h-48 relative overflow-hidden bg-slate-100">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-[#5146E5] text-white rounded-md shadow-sm">
                          {event.category}
                        </span>
                        <span className="px-2 py-1 text-[11px] font-semibold bg-amber-500 text-white rounded-md flex items-center gap-1 shadow-sm">
                          <Star size={11} fill="white" />
                          Featured
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="text-xs text-[#5146E5] font-bold mb-1">
                        {formatDate(event.date)} at {event.time}
                      </div>
                      <h3 className="text-lg font-bold text-[#182230] group-hover:text-[#5146E5] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-[#667085] mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#667085]">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin size={12} className="shrink-0" />
                          {event.venue}
                        </span>
                        <span>
                          <strong>{event.registeredCount}</strong> registered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between gap-3">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-xs font-semibold text-[#182230] hover:text-[#5146E5]"
                    >
                      Event Details
                    </Link>

                    <button
                      onClick={() => actions.toggleRegisterEvent(event.id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                        isRegistered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-[#5146E5] text-white hover:bg-[#4338CA]'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle size={13} />
                          Registered
                        </>
                      ) : (
                        'Register Now'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL EVENTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#182230]">
            {dateFilter === 'registered' ? 'My Registered Events' : 'All Upcoming Events'} ({filteredEvents.length})
          </h2>
          {dateFilter !== 'all' && (
            <button
              onClick={() => setDateFilter('all')}
              className="text-xs font-semibold text-[#5146E5] hover:underline"
            >
              Clear view filter
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center max-w-md mx-auto">
            <Calendar size={32} className="text-[#667085] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#182230]">No events matching criteria</h3>
            <p className="text-xs text-[#667085] mt-1">
              Try adjusting your search terms or selecting another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map(event => {
              const isRegistered = state.registeredEventIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-36 relative bg-slate-100">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 text-[#182230] rounded shadow-sm">
                          {event.category}
                        </span>
                      </div>
                      {event.isOnline && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0F9D8A] text-white rounded flex items-center gap-1 shadow-sm">
                            <Globe size={10} />
                            Online
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="text-[11px] font-bold text-[#5146E5]">
                        {formatShortDate(event.date)} · {event.time}
                      </div>

                      <h3 className="font-bold text-sm text-[#182230] mt-1 line-clamp-1 hover:text-[#5146E5]">
                        <Link href={`/dashboard/events/${event.id}`}>
                          {event.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-[#667085] mt-1.5 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#667085]">
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <MapPin size={11} className="shrink-0" />
                          {event.venue}
                        </span>
                        <span>{event.registeredCount} going</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-[#F7F8FC] border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-xs font-semibold text-[#182230] hover:text-[#5146E5]"
                    >
                      Details
                    </Link>

                    <button
                      onClick={() => actions.toggleRegisterEvent(event.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                        isRegistered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#5146E5] text-white hover:bg-[#4338CA]'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle size={12} />
                          Registered
                        </>
                      ) : (
                        'Register'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
