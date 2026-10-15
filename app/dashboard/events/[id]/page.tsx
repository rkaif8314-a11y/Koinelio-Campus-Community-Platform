'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getEventById, getClubById, getUserById, formatDate } from '@/lib/demo-data';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  Share2,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Building2,
  Tag,
  Shield,
  ArrowRight,
  Sparkles,
  Ticket,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();
  const eventId = params.id as string;
  const event = getEventById(eventId);

  const [copied, setCopied] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Calendar size={40} className="text-[#667085] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#182230]">Event not found</h2>
        <p className="text-sm text-[#667085] mt-1 mb-6">
          The requested event schedule does not exist or has been removed.
        </p>
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-lg"
        >
          <ChevronLeft size={16} />
          Back to Events
        </Link>
      </div>
    );
  }

  const isRegistered = state.registeredEventIds.includes(event.id);
  const organizerClub = event.organizerType === 'club' ? getClubById(event.organizerId) : null;
  const organizerUser = event.organizerType === 'user' ? getUserById(event.organizerId) : null;

  const relatedEvents = state.events.filter(
    e => e.category === event.category && e.id !== event.id
  ).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegister = () => {
    actions.toggleRegisterEvent(event.id);
  };

  const handleCancelRegistration = () => {
    actions.toggleRegisterEvent(event.id);
    setShowConfirmCancel(false);
  };

  return (
    <div className="min-h-full pb-16">
      {/* Cover Image Banner */}
      <div className="h-64 md:h-80 w-full relative bg-slate-900">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white text-xs font-semibold backdrop-blur transition-colors"
          >
            <ChevronLeft size={14} />
            All Events
          </Link>
        </div>

        {/* Title overlay on desktop */}
        <div className="absolute bottom-6 left-0 right-0 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-bold bg-[#5146E5] text-white rounded-lg shadow-sm">
              {event.category}
            </span>
            {event.isFeatured && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-lg shadow-sm flex items-center gap-1">
                <Sparkles size={12} />
                Featured Highlight
              </span>
            )}
            {event.isOnline && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-[#0F9D8A] text-white rounded-lg shadow-sm flex items-center gap-1">
                <Globe size={12} />
                Virtual Event
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-[#5146E5] shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-xs text-[#667085] font-semibold">Date & Time</div>
                  <div className="text-sm font-bold text-[#182230] mt-0.5">
                    {formatDate(event.date)}
                    {event.endDate && ` – ${formatDate(event.endDate)}`}
                  </div>
                  <div className="text-xs text-[#667085] mt-0.5">{event.time}</div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-[#0F9D8A] shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs text-[#667085] font-semibold">Location / Venue</div>
                  <div className="text-sm font-bold text-[#182230] mt-0.5">{event.venue}</div>
                  {event.isOnline && event.onlineLink && (
                    <div className="text-xs text-[#5146E5] font-medium mt-0.5 underline">
                      {event.onlineLink}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h2 className="text-base font-bold text-[#182230]">Event Description</h2>
              <div className="text-sm text-[#667085] leading-relaxed whitespace-pre-line">
                {event.description}
              </div>

              {/* Eligibility & Requirements */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <h3 className="text-xs font-bold text-[#182230] uppercase tracking-wider mb-2">
                  Eligibility & Attendance Guidelines
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  {event.eligibility}
                </p>
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-[#F7F8FC] border border-[#E5E7EB] text-xs font-medium text-[#667085] rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Organizer Banner */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {organizerClub ? (
                  <img
                    src={organizerClub.logo}
                    alt={organizerClub.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#E5E7EB]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Building2 size={24} className="text-[#667085]" />
                  </div>
                )}
                <div>
                  <div className="text-xs text-[#667085] font-semibold">Organized by</div>
                  <div className="text-sm font-bold text-[#182230]">
                    {organizerClub?.name ?? organizerUser?.name ?? 'Northstar University'}
                  </div>
                  <div className="text-[11px] text-[#0F9D8A] font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle size={12} />
                    Verified Campus Organizer
                  </div>
                </div>
              </div>

              {organizerClub && (
                <Link
                  href={`/dashboard/clubs/${organizerClub.id}`}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#5146E5] bg-[#EEF0FD] hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  View Club
                </Link>
              )}
            </div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#182230]">More in {event.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedEvents.map(rel => (
                    <Link
                      key={rel.id}
                      href={`/dashboard/events/${rel.id}`}
                      className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#5146E5] transition-all block group"
                    >
                      <div className="text-[11px] font-bold text-[#5146E5]">
                        {formatDate(rel.date)}
                      </div>
                      <div className="text-xs font-bold text-[#182230] group-hover:text-[#5146E5] mt-1 line-clamp-1">
                        {rel.title}
                      </div>
                      <div className="text-[10px] text-[#667085] mt-1">{rel.venue}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: REGISTRATION BOX */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm sticky top-20 space-y-5">
              <div>
                <span className="text-xs text-[#667085] font-semibold uppercase tracking-wider block">
                  Registration Status
                </span>
                <div className="text-2xl font-bold text-[#182230] mt-1">
                  {event.registeredCount}{' '}
                  <span className="text-xs font-normal text-[#667085]">
                    {event.capacity ? `/ ${event.capacity} seats confirmed` : 'registered attendees'}
                  </span>
                </div>
              </div>

              {/* Progress bar if capacity */}
              {event.capacity && (
                <div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5146E5] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#667085] mt-1 font-medium">
                    <span>{event.capacity - event.registeredCount} spots remaining</span>
                    <span>Deadline: {formatDate(event.registrationDeadline)}</span>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              {isRegistered ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    You are registered for this event!
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    A confirmation record has been added to your dashboard calendar and notifications.
                  </p>
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="w-full py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  className="w-full py-3 bg-[#5146E5] hover:bg-[#4338CA] text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-[#5146E5]/20 flex items-center justify-center gap-2"
                >
                  <Ticket size={16} />
                  Confirm Event RSVP
                </button>
              )}

              {/* Share & Invite */}
              <button
                onClick={handleShare}
                className="w-full py-2.5 border border-[#E5E7EB] hover:bg-[#F7F8FC] text-xs font-semibold text-[#182230] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 size={14} />
                {copied ? 'Link Copied to Clipboard!' : 'Share Event Link'}
              </button>

              <div className="text-[11px] text-[#667085] leading-relaxed pt-2 border-t border-[#E5E7EB]">
                ⓘ Prototype simulation: RSVP updates your local session and profile calendar. No external email is dispatched.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CANCEL CONFIRMATION DIALOG */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#182230]">Cancel RSVP?</h3>
            <p className="text-xs text-[#667085] mt-1.5 mb-5 leading-relaxed">
              Are you sure you want to surrender your registration for <strong>{event.title}</strong>? Your spot will be returned to the open campus pool.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F7F8FC] text-xs font-semibold text-[#182230] rounded-xl"
              >
                Keep Registration
              </button>
              <button
                onClick={handleCancelRegistration}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
