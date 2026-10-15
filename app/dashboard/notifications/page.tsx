'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import { getUserById, timeAgo, formatDate, Notification } from '@/lib/demo-data';
import {
  Bell,
  CheckCircle,
  MessageSquare,
  Heart,
  Users,
  Calendar,
  Shield,
  Sparkles,
  ArrowRight,
  Settings,
  Clock,
  Megaphone,
  Check,
} from 'lucide-react';

export default function NotificationsPage() {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userNotifications = state.notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const displayedNotifications = userNotifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={16} className="text-[#5146E5]" />;
      case 'like':
        return <Heart size={16} className="text-rose-500" />;
      case 'membership_decision':
      case 'club_invite':
        return <Users size={16} className="text-amber-500" />;
      case 'event_reminder':
      case 'registration':
        return <Calendar size={16} className="text-[#0F9D8A]" />;
      case 'verification':
        return <Shield size={16} className="text-emerald-600" />;
      case 'announcement':
        return <Megaphone size={16} className="text-[#14213D]" />;
      default:
        return <Bell size={16} className="text-[#5146E5]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold text-[#182230]">Notification Center</h1>
          <p className="text-xs text-[#667085] mt-1">
            Real-time campus updates, club requests, event reminders, and official notices
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => actions.markAllNotificationsRead()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F7F8FC] text-xs font-semibold text-[#182230] rounded-xl transition-colors self-start sm:self-center"
          >
            <Check size={14} className="text-[#0F9D8A]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-[#14213D] text-white'
              : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
          }`}
        >
          All Activity ({userNotifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-[#14213D] text-white'
              : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {displayedNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center max-w-md mx-auto">
          <Bell size={36} className="text-[#667085] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#182230]">All caught up</h3>
          <p className="text-xs text-[#667085] mt-1">
            You have no {filter === 'unread' ? 'unread ' : ''}notifications at this time.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#E5E7EB] overflow-hidden shadow-sm">
          {displayedNotifications.map(n => {
            const actor = n.actorId ? getUserById(n.actorId) : null;
            return (
              <div
                key={n.id}
                onClick={() => actions.markNotificationRead(n.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  !n.isRead ? 'bg-[#EEF0FD]/30 hover:bg-[#EEF0FD]/50' : 'hover:bg-[#F7F8FC]'
                }`}
              >
                {/* Icon Circle */}
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#182230] leading-snug">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-[#667085] whitespace-nowrap shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Destination link if available */}
                  {n.actionUrl && (
                    <Link
                      href={n.actionUrl}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5146E5] hover:underline mt-2"
                    >
                      View Details
                      <ArrowRight size={10} />
                    </Link>
                  )}
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5146E5] shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preferences note */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-[#667085]">
        <Settings size={16} className="text-[#667085] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#182230] block mb-0.5">
            Simulation Notice: Local Prototype Notifications
          </span>
          Notifications are generated and tracked locally within this session. External push notifications, SMS alerts, and email notifications will be deployed in Phase 2 with our Supabase & Postmark backend integrations.
        </div>
      </div>
    </div>
  );
}
