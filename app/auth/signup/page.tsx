'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/theme-toggle';

type CampusRole = 'student' | 'faculty' | 'alumni';

export default function SignUpPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<CampusRole>('student');
  const [department, setDepartment] = useState('Computer Science');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'AI/ML',
    'Hackathons',
  ]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

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
    'Hackathons',
    'Software Development',
  ];

  const toggleInterest = (item: string) => {
    setSelectedInterests((previous) =>
      previous.includes(item)
        ? previous.filter((interest) => interest !== item)
        : [...previous, item]
    );
  };

  const handleCompleteRegistration = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const normalizedName = fullName.trim();
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedName) {
        throw new Error('Please enter your full name.');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: normalizedName,
            full_name: normalizedName,
            role,
            department,
            interests: selectedInterests,
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Supabase did not return a user. Please try again.');
      }

      if (data.session) {
        setAuthMessage(
          'Your account has been created and Supabase returned an active session. Signup is connected; the sign-in and dashboard flow is being connected separately.'
        );
      } else {
        setAuthMessage(
          'Your account has been created. Check your email for a confirmation link, if email confirmation is enabled. Your profile row is created automatically by the database trigger.'
        );
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-[60]"><ThemeToggle /></div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5146E5] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="5" cy="9" r="2.5" fill="white" />
              <circle cx="13" cy="5" r="2.5" fill="white" opacity="0.7" />
              <circle cx="13" cy="13" r="2.5" fill="white" opacity="0.7" />
              <line x1="7.2" y1="8" x2="11" y2="6" stroke="white" strokeWidth="1.2" />
              <line x1="7.2" y1="10" x2="11" y2="12" stroke="white" strokeWidth="1.2" />
            </svg>
          </div>
          <span className="text-[#182230] font-bold text-xl tracking-tight">Koinelio</span>
        </Link>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#182230]">
          Join your campus community
        </h1>
        {!authMessage && (
          <p className="mt-1 text-center text-xs text-[#667085]">
            Step {step} of 2 — {step === 1 ? 'Account Credentials' : 'Academic Profile & Interests'}
          </p>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E7EB] rounded-2xl sm:px-10">
          {authError && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {authError}
            </div>
          )}

          {authMessage ? (
            <div className="py-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle size={25} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#182230]">Registration submitted</h2>
              <p role="status" className="mt-3 text-sm leading-6 text-[#667085]">
                {authMessage}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5146E5] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4338CA]"
              >
                Back to Koinelio <ArrowRight size={16} />
              </Link>
              <p className="mt-4 text-xs leading-5 text-[#667085]">
                Do not submit the form again if you received a successful registration message.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setAuthError('');
                    setStep(2);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="fullName" className="mb-1 block text-xs font-bold text-[#182230]">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-xs text-[#182230] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-bold text-[#182230]">
                      Campus Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      required
                      placeholder="you@yourcampus.ac.in"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-xs text-[#182230] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
                    />
                    <p className="mt-1.5 text-[11px] leading-5 text-[#667085]">
                      Use an email address you can access. Institutional domain verification is not configured yet.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1 block text-xs font-bold text-[#182230]">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      required
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-xs text-[#182230] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
                    />
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-[11px] leading-relaxed text-indigo-900">
                    <strong>Campus Affiliation:</strong> Institution selection and verification will be configured separately.
                  </div>

                  <button
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5146E5] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#4338CA]"
                  >
                    Continue to Profile Setup <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleCompleteRegistration} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#182230]">Campus Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: 'student', label: 'Student' },
                        { id: 'faculty', label: 'Faculty' },
                        { id: 'alumni', label: 'Alumni' },
                      ] as const).map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={role === option.id}
                          onClick={() => setRole(option.id)}
                          className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all ${role === option.id
                              ? 'border-[#5146E5] bg-[#EEF0FD] text-[#5146E5]'
                              : 'border-[#E5E7EB] text-[#667085] hover:bg-[#F7F8FC]'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="department" className="mb-1 block text-xs font-bold text-[#182230]">Department</label>
                    <select
                      id="department"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#182230] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Physics">Physics</option>
                      <option value="Design and Media Arts">Design and Media Arts</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#182230]">Choose Campus Interests</label>
                    <div className="flex flex-wrap gap-1.5">
                      {interestOptions.map((item) => {
                        const selected = selectedInterests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleInterest(item)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${selected
                                ? 'bg-[#14213D] text-white'
                                : 'border border-[#E5E7EB] bg-[#F7F8FC] text-[#667085] hover:text-[#182230]'
                              }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-[11px] leading-relaxed text-indigo-900">
                    <Shield size={15} className="mt-0.5 shrink-0" />
                    <span>Your password is handled by Supabase Authentication. Do not share it with anyone.</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setAuthError('');
                        setStep(1);
                      }}
                      className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#667085] disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5146E5] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Creating Account...
                        </>
                      ) : (
                        <>Create Account <ArrowRight size={14} /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {!authMessage && (
            <div className="mt-6 text-center text-xs text-[#667085]">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-semibold text-[#5146E5] hover:underline">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
