'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    async function prepareRecovery() {
      try {
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        const { data, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !data.user) throw new Error('This password reset link is invalid or expired. Request a new reset email.');
        if (!data.user.email_confirmed_at || !/^[^@\s]+@iitbhilai\.ac\.in$/i.test(data.user.email ?? '')) {
          throw new Error('A confirmed @iitbhilai.ac.in email account is required.');
        }
        if (active) setReady(true);
      } catch (prepareError) {
        if (active) setError(prepareError instanceof Error ? prepareError.message : 'Unable to validate the recovery link.');
      }
    }
    void prepareRecovery();
    return () => { active = false; };
  }, [searchParams]);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      if (password.length < 12 || password.length > 128) throw new Error('Use a password between 12 and 128 characters.');
      if (password !== confirmPassword) throw new Error('The passwords do not match.');
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess('Password updated. You can continue to your Koinelio account.');
      setPassword(''); setConfirmPassword('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the password.');
    } finally { setSaving(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--k-bg)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--k-accent-light)] text-[var(--k-accent)]"><KeyRound size={23} /></div>
        <h1 className="mt-4 text-center text-2xl font-bold text-[var(--k-ink)]">Set a new password</h1>
        <p className="mt-2 text-center text-sm leading-6 text-[var(--k-ink-soft)]">Choose a unique password for Koinelio. Do not reuse your institute/LDAP password.</p>
        {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--k-danger)] bg-[var(--k-danger-light)] p-3 text-sm text-[var(--k-danger)]"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
        {success && <div role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--k-border)] bg-[var(--k-success-light)] p-3 text-sm text-[var(--k-success)]"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{success}</div>}
        {!ready && !success ? <div className="mt-6 text-center text-sm text-[var(--k-muted)]"><LoaderCircle className="mr-2 inline animate-spin" size={16} />Validating reset link…</div> : ready && !success ? (
          <form onSubmit={updatePassword} className="mt-6 space-y-4">
            <div><label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[var(--k-ink)]">New password</label><input id="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[var(--k-border)] px-3.5 py-3 text-sm outline-none focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]" placeholder="At least 12 characters" /></div>
            <div><label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-[var(--k-ink)]">Confirm new password</label><input id="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-[var(--k-border)] px-3.5 py-3 text-sm outline-none focus:border-[var(--k-accent)] focus:ring-4 focus:ring-[var(--k-focus-ring)]" /></div>
            <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--k-accent)] px-4 py-3 text-sm font-semibold text-[var(--k-on-accent)] hover:bg-[var(--k-accent-hover)] disabled:opacity-50">{saving && <LoaderCircle size={16} className="animate-spin" />}Update password</button>
          </form>
        ) : null}
        <p className="mt-6 text-center text-sm text-[var(--k-muted)]"><Link href="/auth/signin" className="font-semibold text-[var(--k-accent)] hover:underline">Back to sign in</Link></p>
      </div>
    </main>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[var(--k-bg)] px-4 text-sm text-[var(--k-muted)]">Validating password reset link…</main>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
