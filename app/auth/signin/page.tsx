'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { DEMO_USERS, DEMO_SESSION_USERS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const { actions } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('aisha.nwosu@northstar.edu');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  function handleDemoLogin(userId: string) {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      actions.setCurrentUser(user);
      router.push('/dashboard');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Demo: any northstar email works
    const user = DEMO_USERS.find(u => u.email === email);
    if (user && password.length >= 6) {
      actions.setCurrentUser(user);
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Try a demo account below, or use any @northstar.edu email with 6+ character password.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#14213D] flex-col justify-between p-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5146E5] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="5" cy="9" r="2.5" fill="white" />
              <circle cx="13" cy="5" r="2.5" fill="white" opacity="0.7" />
              <circle cx="13" cy="13" r="2.5" fill="white" opacity="0.7" />
              <line x1="7.2" y1="8" x2="11" y2="6" stroke="white" strokeWidth="1.2" />
              <line x1="7.2" y1="10" x2="11" y2="12" stroke="white" strokeWidth="1.2" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">Koinelio</span>
        </Link>
        <div>
          <blockquote className="text-white/80 text-xl font-light leading-relaxed italic mb-4">
            "The single most valuable thing I did at NSU was get deeply involved in TechSpark. The projects, the competitions, the network — it all translated directly to my career."
          </blockquote>
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?img=43" alt="Chioma" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="text-white font-semibold text-sm">Chioma Eze</div>
              <div className="text-white/50 text-xs">NSU CS '22 · Sr. Engineer @ Stripe</div>
            </div>
          </div>
        </div>
        <p className="text-white/20 text-xs">Fictional demo content — Northstar University prototype</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#5146E5] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="5" cy="9" r="2.5" fill="white" />
                <circle cx="13" cy="5" r="2.5" fill="white" opacity="0.7" />
                <circle cx="13" cy="13" r="2.5" fill="white" opacity="0.7" />
                <line x1="7.2" y1="8" x2="11" y2="6" stroke="white" strokeWidth="1.2" />
                <line x1="7.2" y1="10" x2="11" y2="12" stroke="white" strokeWidth="1.2" />
              </svg>
            </div>
            <span className="text-[#182230] font-bold text-xl">Koinelio</span>
          </Link>

          <h1 className="text-2xl font-bold text-[#182230] mb-1">Welcome back</h1>
          <p className="text-[#667085] text-sm mb-6">Sign in to your Northstar University account</p>

          {/* Demo banner */}
          <div className="bg-[#EEF0FD] border border-[#5146E5]/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2 mb-3">
              <CheckCircle size={16} className="text-[#5146E5] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#5146E5] mb-0.5">Demo Mode</div>
                <div className="text-xs text-[#667085]">This is a prototype. No real authentication exists. Use a demo account to explore:</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {DEMO_SESSION_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleDemoLogin(u.id)}
                  className="w-full text-left text-xs bg-white hover:bg-[#5146E5] hover:text-white px-3 py-2 rounded-lg border border-[#E5E7EB] transition-colors font-medium text-[#182230] flex items-center gap-2 group"
                >
                  <ArrowRight size={12} className="text-[#5146E5] group-hover:text-white" />
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs text-[#667085]">or sign in manually</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#182230] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@northstar.edu"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5] transition-colors"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#182230]">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-[#5146E5] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/20 focus:border-[#5146E5] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#182230] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#FEE2E2] border border-[#D92D20]/20 rounded-lg px-3 py-2.5 text-xs text-[#D92D20]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5146E5] text-white font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#667085] mt-6">
            New to Koinelio?{' '}
            <Link href="/auth/signup" className="text-[#5146E5] font-medium hover:underline">Create an account</Link>
          </p>

          <p className="text-center text-xs text-[#667085]/60 mt-4">
            ⓘ Production authentication with institutional verification is planned for the 2027 launch.
          </p>
        </div>
      </div>
    </div>
  );
}
