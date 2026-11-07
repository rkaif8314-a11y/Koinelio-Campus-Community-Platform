'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle, LoaderCircle, Mail } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import KoinelioLogoMark from '@/components/koinelio-logo-mark';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^@\s]+@iitbhilai\.ac\.in$/i.test(normalizedEmail)) {
      setError('Use the @iitbhilai.ac.in email linked to your Koinelio account.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setSubmitted(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to request a password-reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-center bg-[var(--k-bg)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-[60]"><ThemeToggle /></div>
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5"><KoinelioLogoMark size={32} /><span className="text-xl font-bold tracking-tight text-[var(--k-ink)]">Koinelio</span></Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--k-ink)]">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">Receive a real Supabase recovery email for your Koinelio account.</p>
        </div>

        <section className="mt-6 rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--k-border)] bg-[var(--k-accent-light)] p-3 text-xs leading-5 text-[var(--k-ink)]"><Mail size={18} className="mt-0.5 shrink-0 text-[var(--k-accent-dark)]" /><p>Only the confirmed <strong>@iitbhilai.ac.in</strong> account domain is accepted. Never enter your institute/LDAP password in Koinelio.</p></div>
          {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-[var(--k-danger)] bg-[var(--k-danger-light)] p-3 text-sm leading-5 text-[var(--k-danger)]"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}

          {submitted ? (
            <div className="py-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--k-success-light)] text-[var(--k-success)]"><CheckCircle size={24} /></div>
              <h2 className="mt-4 text-lg font-bold text-[var(--k-ink)]">Check your inbox</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--k-muted)]">If the account can receive recovery mail, Supabase has sent instructions to <strong className="break-all">{email.trim()}</strong>. Open the latest link to choose a new Koinelio password.</p>
              <p className="mt-3 text-xs leading-5 text-[var(--k-muted)]">If no email arrives, check spam and confirm the recovery redirect URLs in Supabase Auth settings.</p>
              <Link href="/auth/signin" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--k-accent)] hover:underline"><ArrowLeft size={15} />Return to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[var(--k-ink)]">IIT Bhilai institute email</label>
                <input id="email" type="email" autoComplete="email" maxLength={254} required placeholder="name@iitbhilai.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[var(--k-border)] bg-[var(--k-surface)] px-3.5 py-3 text-sm text-[var(--k-ink)] outline-none focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]" />
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--k-accent)] px-4 py-3 text-sm font-semibold text-[var(--k-on-accent)] transition hover:bg-[var(--k-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle size={16} className="animate-spin" />}{loading ? 'Sending recovery email…' : 'Send password-reset email'}</button>
              <div className="pt-2 text-center"><Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k-muted)] hover:text-[var(--k-ink)]"><ArrowLeft size={14} />Back to sign in</Link></div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
