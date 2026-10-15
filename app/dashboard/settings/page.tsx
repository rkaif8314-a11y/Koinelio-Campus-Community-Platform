'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, useCurrentUser } from '@/lib/app-context';
import {
  Settings,
  Shield,
  Bell,
  Lock,
  User,
  Eye,
  LogOut,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Building2,
  Globe,
  Sliders,
} from 'lucide-react';

export default function SettingsPage() {
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'security'>('privacy');
  const [directoryVisibility, setDirectoryVisibility] = useState<'campus_only' | 'cross_campus' | 'public'>('campus_only');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyClubPosts, setNotifyClubPosts] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSignOut = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-[#E5E7EB]">
        <h1 className="text-2xl font-bold text-[#182230]">Account & Privacy Settings</h1>
        <p className="text-xs text-[#667085] mt-1">
          Manage your campus affiliation, directory visibility, notifications, and security
        </p>
      </div>

      {saveToast && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          Demo preference updated in this screen only.
        </div>
      )}

      {/* Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SIDEBAR TABS */}
        <div className="space-y-1">
          {[
            { id: 'privacy', label: 'Privacy & Discovery', icon: Shield },
            { id: 'profile', label: 'Campus Affiliation', icon: Building2 },
            { id: 'notifications', label: 'Notification Settings', icon: Bell },
            { id: 'security', label: 'Security & Sign In', icon: Lock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-[#14213D] text-white shadow-sm'
                    : 'text-[#667085] hover:bg-white hover:text-[#182230]'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-[#E5E7EB] mt-4 space-y-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#182230] hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors text-left"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#182230]">Profile Visibility Tier</h2>
                <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                  Control who can discover your student profile, academic accomplishments, and club memberships across Koinelio.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'campus_only',
                    title: 'IIT Bhilai Only (Recommended)',
                    desc: 'Illustrative demo copy only. Real visibility enforcement is not established by this local preference.',
                  },
                  {
                    id: 'cross_campus',
                    title: 'Participating Partner Institutions',
                    desc: 'Allows verified students and faculty at accredited partner colleges to discover your research and achievements.',
                  },
                  {
                    id: 'public',
                    title: 'Public Web Profile',
                    desc: 'Your profile and public project showcases can be shared with external prospective employers and the public web.',
                  },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      directoryVisibility === opt.id
                        ? 'border-[#5146E5] bg-[#EEF0FD]/30 shadow-xs'
                        : 'border-[#E5E7EB] hover:bg-[#F7F8FC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={directoryVisibility === opt.id}
                      onChange={() => setDirectoryVisibility(opt.id as any)}
                      className="mt-0.5 text-[#5146E5] focus:ring-[#5146E5]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#182230] block">{opt.title}</span>
                      <span className="text-xs text-[#667085] mt-0.5 block leading-relaxed">
                        {opt.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs text-[#667085]">Prototype preference preview · not institute policy</span>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Save Privacy Tier
                </button>
              </div>
            </div>
          )}

          {/* TAB: AFFILIATION */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h2 className="text-base font-bold text-[#182230]">Academic Affiliation</h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#667085] block">Enrolled Institution</span>
                  <span className="font-bold text-[#182230] text-sm mt-0.5 block">
                    {currentUser.institution}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#667085] block">Department & Division</span>
                  <span className="font-bold text-[#182230] text-sm mt-0.5 block">
                    {currentUser.department}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#667085] block">Account Status</span>
                  <span className="font-bold text-emerald-700 text-xs mt-0.5 flex items-center gap-1">
                    <CheckCircle size={13} />
                    Verified Active Campus Standing
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/dashboard/profile/${currentUser.id}/edit`}
                  className="text-xs font-semibold text-[#5146E5] hover:underline"
                >
                  Edit your public biography & skills →
                </Link>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
              <h2 className="text-base font-bold text-[#182230]">Notification Channels</h2>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] cursor-pointer">
                  <div>
                    <span className="font-bold text-[#182230] block">Official Campus Bulletins</span>
                    <span className="text-[#667085]">High-priority announcements from university administration</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.checked)}
                    className="rounded text-[#5146E5] focus:ring-[#5146E5]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] cursor-pointer">
                  <div>
                    <span className="font-bold text-[#182230] block">Event Reminders & Deadlines</span>
                    <span className="text-[#667085]">Alerts for registered events 24 hours prior to commencement</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyEvents}
                    onChange={e => setNotifyEvents(e.target.checked)}
                    className="rounded text-[#5146E5] focus:ring-[#5146E5]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] cursor-pointer">
                  <div>
                    <span className="font-bold text-[#182230] block">My Clubs Activity</span>
                    <span className="text-[#667085]">Discussions and broadcasts from clubs you are a member of</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyClubPosts}
                    onChange={e => setNotifyClubPosts(e.target.checked)}
                    className="rounded text-[#5146E5] focus:ring-[#5146E5]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors mt-2"
              >
                Save Notification Preferences
              </button>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#182230]">Session Security</h2>
                <p className="text-xs text-[#667085] mt-1">
                  Manage single sign-on (SSO) and authentication protocols
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs space-y-2 text-[#667085]">
                <div className="font-bold text-[#182230]">Authentication Provider</div>
                <p>
                  This session is authenticated via <strong>IIT Bhilai Institutional SSO (Demo Sandbox)</strong>. This prototype is not connected to IIT Bhilai institutional SSO. Password changes and MFA are not managed by this demo settings screen.
                </p>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-rose-100">
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                  Danger Zone
                </h3>
                <div className="p-4 border border-rose-200 rounded-xl bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-rose-900">Request Account Deletion</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Permanently remove your community records and revoke all verified leadership credentials.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Account deletion request queued for Registrar review.')}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
                  >
                    Request Deletion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
