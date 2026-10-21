'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail, KeyRound } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-[60]"><ThemeToggle /></div>
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
          Reset your password
        </h2>
        <p className="mt-1 text-center text-xs text-[#667085]">
          Enter your registered institutional email to receive reset instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E7EB] rounded-2xl sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-[#182230]">Check your inbox</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have dispatched a password recovery token. Follow the link to select a new password.
              </p>
              <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl text-[11px] text-[#667085]">
                ⓘ Prototype simulation: No external email is transmitted in demo mode.
              </div>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#5146E5] hover:underline"
              >
                <ArrowLeft size={14} />
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#182230] mb-1">
                  Institutional Email (.edu)
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@northstar.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Send Recovery Instructions
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#182230]"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
