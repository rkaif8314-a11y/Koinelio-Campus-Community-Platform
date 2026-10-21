'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp, useCurrentUser } from '@/lib/app-context';
import {
  ChevronLeft,
  CheckCircle,
  Save,
  Lock,
  Globe,
  Eye,
  Shield,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { state, actions } = useApp();
  const currentUser = useCurrentUser();
  const profileId = params.id as string;

  // Security check: Only self can edit
  const isSelf = profileId === currentUser.id;

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [department, setDepartment] = useState(currentUser.department);
  const [isPublic, setIsPublic] = useState(currentUser.isPublic);
  const [skills, setSkills] = useState<string[]>(currentUser.skills);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState<string[]>(currentUser.interests);
  const [newInterest, setNewInterest] = useState('');
  const [linkedIn, setLinkedIn] = useState(currentUser.linkedIn ?? '');
  const [github, setGithub] = useState(currentUser.github ?? '');
  const [website, setWebsite] = useState(currentUser.website ?? '');
  const [savedToast, setSavedToast] = useState(false);

  if (!isSelf) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Shield size={40} className="text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#182230]">Unauthorized Profile Access</h2>
        <p className="text-sm text-[#667085] mt-2 mb-6">
          You can only edit settings and visibility controls for your own user account.
        </p>
        <Link
          href={`/dashboard/profile/${currentUser.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5146E5] text-white text-xs font-semibold rounded-lg"
        >
          Return to Your Profile
        </Link>
      </div>
    );
  }

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    actions.updateCurrentUser({
      name,
      bio,
      department,
      isPublic,
      skills,
      interests,
      linkedIn: linkedIn || undefined,
      github: github || undefined,
      website: website || undefined,
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      router.push(`/dashboard/profile/${currentUser.id}`);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/profile/${currentUser.id}`}
            className="p-2 border border-[#E5E7EB] rounded-lg text-[#667085] hover:text-[#182230] hover:bg-white"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#182230]">Edit Profile & Preferences</h1>
            <p className="text-xs text-[#667085]">
              Update public details, academic biography, and campus privacy
            </p>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          Profile settings saved successfully! Returning to profile...
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#182230]">General Identification</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182230] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182230] mb-1">Institution</label>
              <input
                type="text"
                value={currentUser.institution}
                className="w-full p-2.5 text-xs border border-[#E5E7EB] rounded-xl bg-slate-50 text-[#667085]"
                disabled
              />
              <span className="text-[10px] text-[#667085] mt-1 block">
                Primary affiliation managed by Registrar.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182230] mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full p-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#182230] mb-1">Campus Biography</label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full p-3 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
              required
            />
          </div>
        </div>

        {/* Skills & Expertise */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#182230]">Skills & Technologies</h2>

          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF0FD] text-[#5146E5] text-xs font-medium rounded-lg"
              >
                {s}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="hover:text-[#182230]"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g., 'React', 'Python', 'Leadership')..."
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              className="flex-1 p-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-[#F7F8FC] border border-[#E5E7EB] hover:bg-slate-100 text-xs font-semibold rounded-xl"
            >
              Add
            </button>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#182230]">Campus Interests</h2>

          <div className="flex flex-wrap gap-2 mb-2">
            {interests.map(i => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[#182230] text-xs font-medium rounded-lg"
              >
                {i}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(i)}
                  className="hover:text-rose-600"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add interest (e.g., 'Robotics', 'Debate', 'Photography')..."
              value={newInterest}
              onChange={e => setNewInterest(e.target.value)}
              onKeyDown={handleAddInterest}
              className="flex-1 p-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2 bg-[#F7F8FC] border border-[#E5E7EB] hover:bg-slate-100 text-xs font-semibold rounded-xl"
            >
              Add
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#182230]">External Links (Optional)</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#667085] mb-1">LinkedIn URL</label>
              <input
                type="text"
                placeholder="linkedin.com/in/username"
                value={linkedIn}
                onChange={e => setLinkedIn(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#667085] mb-1">GitHub URL</label>
              <input
                type="text"
                placeholder="github.com/username"
                value={github}
                onChange={e => setGithub(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#5146E5]" />
            <h2 className="text-sm font-bold text-[#182230]">Directory Visibility & Privacy</h2>
          </div>

          <label className="flex items-start gap-3 p-3 bg-[#F7F8FC] rounded-xl border border-[#E5E7EB] cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              className="mt-1 rounded text-[#5146E5] focus:ring-[#5146E5]"
            />
            <div className="text-xs">
              <span className="font-bold text-[#182230] block">
                Allow profile discovery in Northstar campus directory
              </span>
              <span className="text-[#667085] mt-0.5 block leading-relaxed">
                When enabled, fellow students, faculty, and verified clubs can view your public bio, skills, and club memberships.
              </span>
            </div>
          </label>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href={`/dashboard/profile/${currentUser.id}`}
            className="px-5 py-2.5 border border-[#E5E7EB] text-xs font-semibold text-[#667085] hover:text-[#182230] rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
