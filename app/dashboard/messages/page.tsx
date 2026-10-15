'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  Lock,
  Shield,
  Clock,
  ArrowRight,
  Users,
  CheckCircle,
} from 'lucide-react';

export default function MessagesPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 md:p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#EEF0FD] text-[#5146E5] flex items-center justify-center mx-auto mb-5 shadow-sm">
          <MessageSquare size={32} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full mb-4 border border-amber-200">
          <Clock size={12} />
          Planned Feature · Launching 1 January 2027
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#182230]">
          Real-Time Direct & Club Messaging
        </h1>

        <p className="text-sm text-[#667085] max-w-xl mx-auto mt-3 leading-relaxed">
          Koinelio Direct Channels will connect students, project teammates, and faculty in end-to-end authenticated conversations without sharing personal phone numbers or external chat links.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 text-left">
          <div className="p-4 bg-[#F7F8FC] rounded-2xl border border-[#E5E7EB]">
            <Shield size={18} className="text-[#0F9D8A] mb-2" />
            <h4 className="font-bold text-xs text-[#182230]">Privacy Protected</h4>
            <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
              No private WhatsApp or mobile numbers revealed. All messaging is tied to verified institutional accounts.
            </p>
          </div>

          <div className="p-4 bg-[#F7F8FC] rounded-2xl border border-[#E5E7EB]">
            <Users size={18} className="text-[#5146E5] mb-2" />
            <h4 className="font-bold text-xs text-[#182230]">Club Committees</h4>
            <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
              Automated channels for executive boards, recruitment applicants, and general club memberships.
            </p>
          </div>

          <div className="p-4 bg-[#F7F8FC] rounded-2xl border border-[#E5E7EB]">
            <Sparkles size={18} className="text-[#B7791F] mb-2" />
            <h4 className="font-bold text-xs text-[#182230]">Supabase Realtime</h4>
            <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
              Built on PostgreSQL row-level security and web sockets for instant notifications and typing presence.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/community"
            className="px-5 py-2.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            Explore Campus Community Feed
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 border border-[#E5E7EB] text-xs font-semibold text-[#182230] hover:bg-[#F7F8FC] rounded-xl transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
