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
    <main className="relative flex min-h-screen flex-col justify-center bg-[#F7F8FC] px-4 py-12 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-[60]"><ThemeToggle /></div>
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5"><KoinelioLogoMark size={32} /><span className="text-xl font-bold tracking-tight text-[#182230]">Koinelio</span></Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#182230]">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">Receive a real Supabase recovery email for your Koinelio account.</p>
        </div>

        <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-950"><Mail size={18} className="mt-0.5 shrink-0 text-sky-800" /><p>Only the confirmed <strong>@iitbhilai.ac.in</strong> account domain is accepted. Never enter your institute/LDAP password in Koinelio.</p></div>
          {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}

          {submitted ? (
            <div className="py-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle size={24} /></div>
              <h2 className="mt-4 text-lg font-bold text-[#182230]">Check your inbox</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">If the account can receive recovery mail, Supabase has sent instructions to <strong className="break-all">{email.trim()}</strong>. Open the latest link to choose a new Koinelio password.</p>
              <p className="mt-3 text-xs leading-5 text-[#667085]">If no email arrives, check spam and confirm the recovery redirect URLs in Supabase Auth settings.</p>
              <Link href="/auth/signin" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5146E5] hover:underline"><ArrowLeft size={15} />Return to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#344054]">IIT Bhilai institute email</label>
                <input id="email" type="email" autoComplete="email" maxLength={254} required placeholder="name@iitbhilai.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#D0D5DD] bg-white px-3.5 py-3 text-sm text-[#182230] outline-none focus:border-[#5146E5] focus:ring-4 focus:ring-[#5146E5]/10" />
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5146E5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle size={16} className="animate-spin" />}{loading ? 'Sending recovery email…' : 'Send password-reset email'}</button>
              <div className="pt-2 text-center"><Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#667085] hover:text-[#182230]"><ArrowLeft size={14} />Back to sign in</Link></div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
