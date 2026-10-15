'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import {
  CheckCircle,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { actions, state } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'alumni'>('student');
  const [department, setDepartment] = useState('Computer Science');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['AI/ML', 'Hackathons']);
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    'AI/ML',
    'Robotics',
    'Design',
    'Culture & Arts',
    'Entrepreneurship',
    'Finance',
    'Debate',
    'Photography',
    'Research',
    'Sports',
  ];

  const toggleInterest = (item: string) => {
    setSelectedInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Create new demo user in local state and sign in
      const newUser = {
        id: `u_${Date.now()}`,
        name: fullName || 'Demo Campus Member',
        email: email || 'demo@northstar.edu',
        avatar: 'https://i.pravatar.cc/150?img=33',
        role,
        institution: 'Northstar University',
        department,
        bio: `${role === 'student' ? 'Student' : role === 'faculty' ? 'Faculty Member' : 'Alumni'} at Northstar University passionate about collaboration and campus life.`,
        skills: selectedInterests,
        interests: selectedInterests,
        verificationStatus: 'pending' as const,
        clubMemberships: ['c1'],
        clubLeaderOf: [],
        joinedAt: new Date().toISOString(),
        isPublic: true,
      };

      actions.setCurrentUser(newUser);
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5146E5] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="5" cy="9" r="2.5" fill="white" />
              <circle cx="13" cy="5" r="2.5" fill="white" opacity="0.7" />
              <circle cx="13" cy="13" r="2.5" fill="white" opacity="0.7" />
              <line x1="7.2" y1="8" x2="11" y2="6" stroke="white" strokeWidth="1.2" />
              <line x1="7.2" y1="10" x2="11" y2="12" stroke="white" strokeWidth="1.2" />
            </svg>
          </div>
          <span className="text-[#182230] font-bold text-xl tracking-tight">Koinelio</span>
        </Link>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#182230]">
          Join your campus community
        </h2>
        <p className="mt-1 text-center text-xs text-[#667085]">
          Step {step} of 2 — {step === 1 ? 'Account Credentials' : 'Academic Profile & Interests'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E7EB] rounded-2xl sm:px-10">
          {/* STEP 1: CREDENTIALS */}
          {step === 1 && (
            <form
              onSubmit={e => {
                e.preventDefault();
                setStep(2);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1">
                  Institutional Email (.edu)
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@northstar.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
                <strong>Campus Affiliation:</strong> Northstar University (Pilot Institution 2026/2027)
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                Continue to Profile Setup
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* STEP 2: ROLE & INTERESTS */}
          {step === 2 && (
            <form onSubmit={handleCompleteRegistration} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1.5">
                  Campus Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'student', label: 'Student' },
                    { id: 'faculty', label: 'Faculty' },
                    { id: 'alumni', label: 'Alumni' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        role === r.id
                          ? 'border-[#5146E5] bg-[#EEF0FD] text-[#5146E5]'
                          : 'border-[#E5E7EB] hover:bg-[#F7F8FC] text-[#667085]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1">Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded-xl bg-white text-[#182230] font-medium"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Physics">Physics</option>
                  <option value="Design and Media Arts">Design and Media Arts</option>
                  <option value="Economics">Economics</option>
                  <option value="Law">Law</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1.5">
                  Choose Campus Interests
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {interestOptions.map(item => {
                    const selected = selectedInterests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          selected
                            ? 'bg-[#14213D] text-white'
                            : 'bg-[#F7F8FC] border border-[#E5E7EB] text-[#667085] hover:text-[#182230]'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-[#E5E7EB] text-xs font-semibold text-[#667085] rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Enter Koinelio Campus'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-[#667085]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-[#5146E5] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
