'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function completeSignIn() {
      try {
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !data.user) {
          throw new Error('This confirmation link is invalid or expired. Request a new link and try again.');
        }
        if (!data.user.email_confirmed_at) {
          throw new Error('The institute email has not been confirmed yet. Open the latest confirmation message from your inbox.');
        }
        if (!/^[^@\\s]+@iitbhilai\\.ac\\.in$/i.test(data.user.email ?? '')) {
          await supabase.auth.signOut();
          throw new Error('Only confirmed @iitbhilai.ac.in accounts can sign in to this campus pilot.');
        }
        if (active) {
          router.replace('/dashboard/profile?welcome=1');
          router.refresh();
        }
      } catch (callbackError) {
        if (active) setError(callbackError instanceof Error ? callbackError.message : 'Unable to complete email confirmation.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void completeSignIn();
    return () => { active = false; };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        {loading ? <LoaderCircle size={28} className="mx-auto animate-spin text-indigo-600" /> : error ? <AlertCircle size={28} className="mx-auto text-rose-600" /> : <CheckCircle2 size={28} className="mx-auto text-emerald-600" />}
        <h1 className="mt-4 text-xl font-bold text-slate-900">{loading ? 'Confirming your email…' : error ? 'Confirmation needed' : 'Email confirmed'}</h1>
        <p role="status" className="mt-2 text-sm leading-6 text-slate-600">{loading ? 'We are securely completing your Koinelio sign-in.' : error || 'Your account is ready.'}</p>
        {!loading && error && <a href="/auth/signin" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Return to sign in</a>}
      </div>
    </main>
  );
}
