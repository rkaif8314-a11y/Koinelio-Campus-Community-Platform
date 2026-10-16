'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AccountProfile = {
  id: string;
  display_name: string;
  department: string | null;
  profile_visibility: 'public' | 'campus' | 'private';
  verification_status: 'pending' | 'verified' | 'rejected';
};

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/signin?next=/dashboard/settings');
        return;
      }
      setEmail(authData.user.email ?? '');
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, department, profile_visibility, verification_status')
        .eq('id', authData.user.id)
        .single();
      if (profileError) throw profileError;
      setProfile(data as AccountProfile);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load account settings.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrates persistent account settings from Supabase after authentication.
  useEffect(() => { void loadSettings(); }, [loadSettings]);

  async function saveVisibility(value: AccountProfile['profile_visibility']) {
    if (!profile) return;
    setSavingPrivacy(true); setError(''); setNotice('');
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_visibility: value })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile({ ...profile, profile_visibility: value });
      setNotice('Privacy setting saved to your profile.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the privacy setting.');
    } finally { setSavingPrivacy(false); }
  }

  async function sendPasswordReset() {
    if (!email) return;
    setSendingReset(true); setError(''); setNotice('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setNotice('Password reset instructions have been sent to your account email if the address is eligible.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to request a password reset.');
    } finally { setSendingReset(false); }
  }

  async function signOut() {
    setSigningOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      setSigningOut(false);
      return;
    }
    router.replace('/auth/signin');
    router.refresh();
  }

  if (loading) return <div className="flex items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading account settings…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Account security</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">These controls update your authenticated account or its database-backed profile, not temporary browser state.</p>
      </div>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span className="break-words">{error}</span></div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</div>}

      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><UserRound size={20} /></div><div><h2 className="font-bold text-slate-900">Account and campus profile</h2><p className="mt-1 text-sm text-slate-600">Your sign-in email is managed by Supabase Auth. Name, academic details, profile photo and visibility are stored in your profile row.</p></div></div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account email</dt><dd className="mt-1 break-all text-sm font-semibold text-slate-800">{email}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Profile name</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{profile?.display_name}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{profile?.department || 'Not set'}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Affiliation status</dt><dd className="mt-1 text-sm font-semibold capitalize text-slate-800">{profile?.verification_status ?? 'pending'}{profile?.verification_status !== 'verified' ? ' · email confirmation is not institute-verification' : ''}</dd></div>
          </dl>
          <Link href="/dashboard/profile" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Edit profile</Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><ShieldCheck size={20} /></div><div><h2 className="font-bold text-slate-900">Profile visibility</h2><p className="mt-1 text-sm leading-6 text-slate-600">Choose how your profile appears to other authenticated campus accounts. The database's row-level policies still govern what each user may access.</p></div></div>
          <div className="mt-5 space-y-2">
            {([
              ['campus', 'Campus directory', 'Visible to allowed users in the same campus directory.'],
              ['private', 'Private', 'Only you can read the profile row through normal profile access policies.'],
              ['public', 'Public profile', 'Profile may be visible outside the campus when the relevant app surface permits it.'],
            ] as [AccountProfile['profile_visibility'], string, string][]).map(([value, title, description]) => <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${profile?.profile_visibility === value ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 hover:bg-slate-50'}`}><input type="radio" name="visibility" checked={profile?.profile_visibility === value} onChange={() => void saveVisibility(value)} disabled={savingPrivacy} className="mt-1 accent-indigo-600" /><span><span className="block text-sm font-semibold text-slate-800">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span></label>)}
          </div>
          {savingPrivacy && <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin" /> Saving preference…</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><KeyRound size={20} /></div><div><h2 className="font-bold text-slate-900">Password and session</h2><p className="mt-1 text-sm leading-6 text-slate-600">Request a reset link from Supabase. Koinelio does not ask for or store your institute/LDAP password.</p></div></div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => void sendPasswordReset()} disabled={sendingReset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-55">{sendingReset ? <LoaderCircle size={16} className="animate-spin" /> : <KeyRound size={16} />}{sendingReset ? 'Sending…' : 'Email password reset link'}</button>
            <button onClick={() => void signOut()} disabled={signingOut} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-55">{signingOut ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}Sign out</button>
          </div>
        </section>

        <p className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-xs leading-5 text-sky-950">Koinelio is an independently operated campus pilot unless IIT Bhilai formally authorizes it. Email-domain confirmation is not proof of current enrolment. Do not enter your institute credentials or private identity documents here.</p>
      </div>
    </div>
  );
}
