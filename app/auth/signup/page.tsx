'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/theme-toggle';
import KoinelioLogoMark from '@/components/koinelio-logo-mark';
import {
  INSTITUTE_DEPARTMENTS,
  INSTITUTE_DISCIPLINES_AND_CENTRES,
  INSTITUTE_PROGRAMMES,
} from '@/lib/institution-config';

const currentYear = new Date().getFullYear();
const IIT_BHILAI_EMAIL_RE = /^[^@\s]+@iitbhilai\.ac\.in$/i;

function isIitBhilaiEmail(email: string): boolean {
  return IIT_BHILAI_EMAIL_RE.test(email.trim());
}

const departmentOptions = Array.from(new Set([
  ...INSTITUTE_DEPARTMENTS,
  ...INSTITUTE_DISCIPLINES_AND_CENTRES
    .filter((item) => item.type === 'Discipline')
    .map((item) => item.name),
  'Interdisciplinary / not listed',
]));

const programmeOptions = INSTITUTE_PROGRAMMES.flatMap((group) =>
  group.programmes.map((programme) => ({
    value: `${group.level} — ${programme}`,
    label: `${group.level} · ${programme}`,
  }))
);

const interestOptions = [
  'AI/ML', 'Robotics', 'Electronics', 'Open Source', 'Design',
  'Culture & Arts', 'Entrepreneurship', 'Research', 'Sports',
  'Hackathons', 'Software Development', 'Competitive Programming',
  'Photography', 'Music', 'Mentoring',
] as const;

const inputClass = 'w-full rounded-xl border border-[#D0D5DD] bg-white px-3.5 py-3 text-sm text-[#182230] shadow-sm outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#5146E5] focus:ring-4 focus:ring-[#5146E5]/10';
const labelClass = 'mb-1.5 block text-sm font-semibold text-[#344054]';

export default function SignUpPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['AI/ML', 'Open Source']);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests((previous) => previous.filter((interest) => interest !== item));
      setAuthError('');
      return;
    }
    if (selectedInterests.length >= 8) {
      setAuthError('Choose up to 8 interests so your profile stays focused.');
      return;
    }
    setSelectedInterests((previous) => [...previous, item]);
    setAuthError('');
  };

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      setAuthError('Enter a name between 2 and 100 characters.');
      return;
    }
    if (!normalizedEmail || normalizedEmail.length > 254) {
      setAuthError('Enter a valid email address.');
      return;
    }
    if (!isIitBhilaiEmail(normalizedEmail)) {
      setAuthError('Use your @iitbhilai.ac.in institute email. You must confirm it before signing in.');
      return;
    }
    if (password.length < 12) {
      setAuthError('Use a password or passphrase with at least 12 characters.');
      return;
    }

    setStep(2);
  };

  const handleCompleteRegistration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const normalizedName = fullName.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const parsedBatchYear = Number(batchYear);

      if (normalizedName.length < 2 || normalizedName.length > 100) {
        throw new Error('Enter a name between 2 and 100 characters.');
      }
      if (!normalizedEmail || normalizedEmail.length > 254) {
        throw new Error('Enter a valid email address.');
      }
      if (!isIitBhilaiEmail(normalizedEmail)) {
        throw new Error('Use your @iitbhilai.ac.in institute email. You must confirm it before signing in.');
      }
      if (password.length < 12 || password.length > 128) {
        throw new Error('Use a password between 12 and 128 characters.');
      }
      if (!department) throw new Error('Choose your department or discipline.');
      if (!degreeProgram) throw new Error('Choose your degree and programme.');
      if (!Number.isInteger(parsedBatchYear) || parsedBatchYear < 2016 || parsedBatchYear > currentYear) {
        throw new Error(`Choose a valid admission/joining year from 2016 to ${currentYear}.`);
      }
      if (selectedInterests.length < 1 || selectedInterests.length > 8) {
        throw new Error('Choose between 1 and 8 campus interests.');
      }

      // Institution and role are self-reported profile fields—not identity proof or permissions.
      // Never put an institute ID, institute password, or verification document in Auth metadata.
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: normalizedName,
            full_name: normalizedName,
            role: 'student',
            institution_slug: 'iit-bhilai',
            department,
            degree_program: degreeProgram,
            batch_year: parsedBatchYear,
            interests: selectedInterests,
            onboarding_version: 'iit-bhilai-v2',
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Supabase did not return a user. Please try again.');

      setAuthMessage(
        data.session
          ? 'Your Koinelio account was created. Your selected campus is self-reported and remains unverified. Demo posts, profiles, registrations and counts are still prototype data.'
          : 'Your account request was created. Check your email for a confirmation link if email confirmation is enabled. Your campus choice is self-reported and does not verify institute affiliation.'
      );
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#F7F8FC] px-4 py-12 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-100/70 via-sky-50/40 to-transparent" />
      <div className="fixed right-4 top-4 z-[60]"><ThemeToggle /></div>

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5 rounded-xl p-1.5">
            <KoinelioLogoMark size={36} />
            <span className="text-xl font-bold tracking-tight text-[#182230]">Koinelio</span>
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#5146E5]">One campus. Every connection.</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#182230] sm:text-3xl">Join your campus community</h1>
          {!authMessage && (
            <div className="mx-auto mt-4 flex max-w-xs items-center gap-3" aria-label={`Step ${step} of 2`}>
              {[1, 2].map((number) => (
                <React.Fragment key={number}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= number ? 'bg-[#5146E5] text-white' : 'border border-[#D0D5DD] bg-white text-[#667085]'}`}>{step > number ? '✓' : number}</span>
                  {number === 1 && <span className={`h-1 flex-1 rounded-full ${step === 2 ? 'bg-[#5146E5]' : 'bg-[#E5E7EB]'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}
          {!authMessage && <p className="mt-2 text-sm text-[#667085]">Step {step} of 2 · {step === 1 ? 'Account credentials' : 'Academic profile'}</p>}
        </div>

        <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white/95 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-8">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-950">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold">Independent student-built prototype</p>
              <p className="mt-1">Koinelio is not operated, approved or endorsed by IIT Bhilai. This signup does not connect to institute records or SSO.</p>
            </div>
          </div>

          {authError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">{authError}</div>}

          {authMessage ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><CheckCircle size={27} /></div>
              <h2 className="mt-4 text-xl font-bold text-[#182230]">Account request submitted</h2>
              <p role="status" className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#667085]">{authMessage}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5146E5] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4338CA]">Continue to sign in <ArrowRight size={16} /></Link>
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 text-sm font-semibold text-[#344054] hover:bg-slate-50">Preview the demo</Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#667085]">Never enter your institute/LDAP password in Koinelio. The institute ID field is intentionally unavailable until a private verification workflow is approved and ready.</p>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <label htmlFor="fullName" className={labelClass}>Full name</label>
                <input id="fullName" type="text" autoComplete="name" minLength={2} maxLength={100} required placeholder="How should we display your name?" value={fullName} onChange={(event) => setFullName(event.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>IIT Bhilai institute email</label>
                <input id="email" type="email" autoComplete="email" maxLength={254} required placeholder="name@iitbhilai.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
                <p className="mt-1.5 text-xs leading-5 text-[#667085]">Only @iitbhilai.ac.in addresses are accepted. You must confirm the email link before signing in; this domain check alone does not verify current enrolment.</p>
              </div>
              <div>
                <label htmlFor="password" className={labelClass}>Create password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} required placeholder="Use 12+ characters or a passphrase" value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#667085] hover:bg-slate-100">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-[#667085]">Use a unique password. Authentication is handled by Supabase; never use your institute password.</p>
              </div>
              <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5146E5] to-[#4338CA] py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-900/10 hover:from-[#4338CA] hover:to-[#3730A3]">Continue to academic profile <ArrowRight size={16} /></button>
            </form>
          ) : (
            <form onSubmit={handleCompleteRegistration} className="space-y-5">
              <div>
                <label htmlFor="institution" className={labelClass}>College / institution</label>
                <div className="relative">
                  <select id="institution" value="iit-bhilai" disabled aria-describedby="institution-help" className={`${inputClass} cursor-not-allowed appearance-none bg-slate-50 pr-10 opacity-100`}>
                    <option value="iit-bhilai">Indian Institute of Technology Bhilai (IIT Bhilai)</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">Pilot</span>
                </div>
                <p id="institution-help" className="mt-1.5 text-xs leading-5 text-[#667085]">IIT Bhilai is the only institution configured for this pilot. Your selection is self-reported, not verified.</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-[#344054]">Campus role: Student</p>
                <p className="mt-1 text-xs leading-5 text-[#667085]">Privileged roles are assigned separately through the institute’s approved governance workflow. Signup never grants administrator, president, General Secretary, or club-coordinator access.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="department" className={labelClass}>Department / discipline</label>
                  <select id="department" required value={department} onChange={(event) => setDepartment(event.target.value)} className={inputClass}>
                    <option value="">Select a department</option>
                    {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="degreeProgram" className={labelClass}>Degree and programme</label>
                  <select id="degreeProgram" required value={degreeProgram} onChange={(event) => setDegreeProgram(event.target.value)} className={inputClass}>
                    <option value="">Select your programme</option>
                    {programmeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="batchYear" className={labelClass}>{role === 'faculty' ? 'Joining year at the institute' : 'Admission batch year'}</label>
                <select id="batchYear" required value={batchYear} onChange={(event) => setBatchYear(event.target.value)} className={inputClass}>
                  <option value="">Select a year</option>
                  {Array.from({ length: currentYear - 2016 + 1 }, (_, index) => currentYear - index).map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              <fieldset>
                <div className="flex items-center justify-between gap-3">
                  <legend className={labelClass}>Campus interests</legend>
                  <span className="text-xs text-[#667085]">Select 1–8</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((item) => {
                    const selected = selectedInterests.includes(item);
                    return <button key={item} type="button" aria-pressed={selected} onClick={() => toggleInterest(item)} className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${selected ? 'border-[#5146E5] bg-[#EEF0FD] text-[#3730A3]' : 'border-[#E5E7EB] bg-white text-[#475467] hover:border-indigo-200 hover:bg-indigo-50'}`}>{item}</button>;
                  })}
                </div>
              </fieldset>

              <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm leading-5 text-sky-950">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-sky-800" />
                <div>
                  <p className="font-semibold">Privacy-first affiliation</p>
                  <p className="mt-1">We do not collect your institute ID or LDAP credentials in this release. The campus choice is saved as self-reported information only; it does not set a trusted institution ID, verify you, or unlock campus-only access.</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button type="button" disabled={loading} onClick={() => { setAuthError(''); setStep(1); }} className="inline-flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 text-sm font-semibold text-[#475467] hover:bg-slate-50"><ArrowLeft size={16} /> Back</button>
                <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5146E5] to-[#4338CA] px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-900/10 hover:from-[#4338CA] hover:to-[#3730A3] disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Creating account...</> : <>Create account <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          )}

          {!authMessage && <div className="mt-6 border-t border-[#E5E7EB] pt-5 text-center text-sm text-[#667085]">
            Already have an account? <Link href="/auth/signin" className="font-semibold text-[#5146E5] hover:text-[#3730A3] hover:underline">Sign in</Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link href="/dashboard" className="font-semibold text-[#5146E5] hover:text-[#3730A3] hover:underline">Preview demo without an account</Link>
          </div>}
        </section>
        <p className="mx-auto mt-4 max-w-lg px-2 text-center text-xs leading-5 text-[#667085]">Public institution facts in the campus guide link to public sources. Demo member profiles, posts, activity counts and registrations are fictional and stay in browser demo state.</p>
      </div>
    </main>
  );
}