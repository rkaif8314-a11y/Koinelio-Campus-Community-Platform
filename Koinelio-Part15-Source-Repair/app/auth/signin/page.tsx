'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/theme-toggle';
import KoinelioLogoMark from '@/components/koinelio-logo-mark';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^@\s]+@iitbhilai\.ac\.in$/i.test(normalizedEmail)) {
        throw new Error('Use your @iitbhilai.ac.in institute email to sign in.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user || !data.session) {
        throw new Error('Sign-in did not create a session. Check whether your email is confirmed.');
      }

      // Verify that the signup trigger created a profile record for this account.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        setMessage('Your sign-in was accepted, but we could not verify your profile. Please try again shortly. Do not create a second account.');
        return;
      }
      if (!profile) {
        setMessage('Your account is authenticated, but its Koinelio profile has not been created yet. Please contact the project maintainer; do not sign up again.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in. Please try again.';
      if (/email not confirmed/i.test(message)) {
        setError('Your email is not confirmed yet. Open the confirmation email from Supabase, then try signing in again.');
      } else if (/invalid login credentials/i.test(message)) {
        setError('Email or password is incorrect. Make sure you have already created a Koinelio account through Sign up.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--k-bg)] flex">
      <div className="fixed right-4 top-4 z-[60]"><ThemeToggle /></div>
      <aside className="hidden lg:flex lg:w-[42%] bg-[#202a25] flex-col justify-between p-10 xl:p-14">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <KoinelioLogoMark size={36} />
          <span className="text-white font-bold text-xl tracking-tight">Koinelio</span>
        </Link>

        <div className="max-w-lg">
          <p className="text-[#B3CFC2] text-sm font-semibold uppercase tracking-[0.18em] mb-4">One campus. Every connection.</p>
          <h1 className="text-white text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Your campus community, all in one place.
          </h1>
          <p className="mt-5 text-white/65 text-base leading-7">
            Discover clubs and events, build your profile, and connect with students and alumni.
          </p>
        </div>

        <p className="text-white/40 text-xs">Koinelio is an independent campus community project.</p>
      </aside>

      <section className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-9 lg:hidden">
            <KoinelioLogoMark size={36} />
            <span className="text-[var(--k-ink)] font-bold text-xl">Koinelio</span>
          </Link>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--k-accent-light)] text-[var(--k-accent)] flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--k-ink)]">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">Sign in to your Koinelio account.</p>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-[var(--k-danger)] bg-[var(--k-danger-light)] px-4 py-3 text-sm leading-5 text-[var(--k-danger)]">
              {error}
            </div>
          )}
          {message && (
            <div role="status" className="mb-5 rounded-xl border border-[var(--k-border)] bg-[var(--k-warning-light)] px-4 py-3 text-sm leading-5 text-[var(--k-warning)]">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--k-ink)] mb-2">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="name@iitbhilai.ac.in"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] text-[var(--k-ink)] outline-none transition focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--k-ink)] mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 text-sm rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] text-[var(--k-ink)] outline-none transition focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--k-muted)] hover:text-[var(--k-ink)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--k-accent)] hover:bg-[var(--k-accent-hover)] text-[var(--k-on-accent)] py-3.5 px-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[var(--k-muted)]">
            New to Koinelio?{' '}
            <Link href="/auth/signup" className="font-semibold text-[var(--k-accent)] hover:underline">Create an account</Link>
          </p>
          <p className="mt-5 text-center text-xs leading-5 text-[var(--k-muted)]">
            Use the confirmed @iitbhilai.ac.in email linked to your Koinelio account. Never enter your institute/LDAP password here.
          </p>
        </div>
      </section>
    </main>
  );
}
