'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';
import { supabaseErrorMessage } from '@/lib/supabase-errors';

type ProfileRecord = {
  id: string;
  display_name: string;
  bio: string;
  department: string | null;
  study_year: number | null;
  profile_visibility: 'public' | 'campus' | 'private';
  institution_id: string | null;
  campus_role: 'student' | 'faculty' | 'alumni';
  degree_program: string | null;
  batch_year: number | null;
  graduation_year: number | null;
  avatar_url: string | null;
  skills: string[];
  interests: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  institution_slug: string | null;
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

function toCsv(values: string[] | null | undefined): string {
  return (values ?? []).join(', ');
}

function parseCsv(value: string, maxItems: number, maxLength: number): string[] {
  return Array.from(new Set(value.split(',').map((item) => item.trim().slice(0, maxLength)).filter(Boolean))).slice(0, maxItems);
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [email, setEmail] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const configurationError = getSupabaseConfigError();
      if (configurationError) throw new Error(configurationError);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace('/auth/signin?next=/dashboard/profile');
        return;
      }
      const user = userData.user;
      setEmail(user.email ?? '');

      if (!user.email_confirmed_at) {
        setError('Confirm your IIT Bhilai email before editing your profile.');
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, bio, department, study_year, profile_visibility, institution_id, campus_role, degree_program, batch_year, graduation_year, avatar_url, skills, interests, verification_status, institution_slug')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      const loaded = data as ProfileRecord;
      setProfile(loaded);
      setSkillsText(toCsv(loaded.skills));
      setInterestsText(toCsv(loaded.interests));
    } catch (loadError) {
      setError(supabaseErrorMessage(loadError, 'Unable to load your profile.'));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const cleanName = profile.display_name.trim();
      if (cleanName.length < 2 || cleanName.length > 100) {
        throw new Error('Your display name must be between 2 and 100 characters.');
      }
      if (profile.bio.length > 600) throw new Error('Your bio can contain at most 600 characters.');
      if (profile.department && profile.department.length > 120) throw new Error('Department is too long.');
      if (profile.degree_program && profile.degree_program.length > 160) throw new Error('Degree/programme is too long.');
      if (profile.study_year !== null && (!Number.isInteger(profile.study_year) || profile.study_year < 1 || profile.study_year > 10)) {
        throw new Error('Study year must be between 1 and 10.');
      }

      const payload = {
        display_name: cleanName,
        campus_role: profile.campus_role,
        bio: profile.bio.trim(),
        department: profile.department?.trim() || null,
        study_year: profile.study_year,
        degree_program: profile.degree_program?.trim() || null,
        batch_year: profile.batch_year,
        graduation_year: profile.graduation_year,
        profile_visibility: profile.profile_visibility,
        skills: parseCsv(skillsText, 30, 48),
        interests: parseCsv(interestsText, 20, 48),
      };
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profile.id)
        .select('id, display_name, bio, department, study_year, profile_visibility, institution_id, campus_role, degree_program, batch_year, graduation_year, avatar_url, skills, interests, verification_status, institution_slug')
        .single();

      if (updateError) throw updateError;
      const saved = data as ProfileRecord;
      setProfile(saved);
      setSkillsText(toCsv(saved.skills));
      setInterestsText(toCsv(saved.interests));
      setSuccess('Profile saved to your Koinelio account.');
    } catch (saveError) {
      setError(supabaseErrorMessage(saveError, 'Unable to save profile changes.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !profile) return;
    setUploading(true);
    setError('');
    setSuccess('');
    let uploadedPath = '';

    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Choose a JPG, PNG, or WebP image.');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Profile images must be 2 MB or smaller.');
      }

      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      uploadedPath = `${profile.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(uploadedPath, file, { upsert: false, contentType: file.type, cacheControl: '3600' });

      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('profile-avatars').getPublicUrl(uploadedPath);
      const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id);

      if (updateError) {
        await supabase.storage.from('profile-avatars').remove([uploadedPath]);
        throw updateError;
      }

      setProfile((current) => current ? { ...current, avatar_url: avatarUrl } : current);
      setSuccess('Profile photo uploaded and saved.');
    } catch (uploadError) {
      setError(supabaseErrorMessage(uploadError, 'Unable to upload your profile photo.'));
    } finally {
      setUploading(false);
    }
  }

  function update<K extends keyof ProfileRecord>(key: K, value: ProfileRecord[K]) {
    setProfile((current) => current ? { ...current, [key]: value } : current);
  }

  if (loading) {
    return <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-20 text-sm text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={18} /> Loading your account profile…</div>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <AlertCircle className="mb-3 text-amber-600" size={26} />
          <h1 className="text-xl font-bold text-slate-900">Your profile is not available yet</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error || 'Sign in with your confirmed IIT Bhilai email and retry.'}</p>
          <Link href="/auth/signin" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Go to sign in</Link>
        </div>
      </div>
    );
  }

  const accountStatus = profile.verification_status === 'verified'
    ? 'Institute affiliation verified'
    : profile.verification_status === 'rejected'
      ? 'Affiliation verification not approved'
      : 'Email confirmed · affiliation not institution-verified';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:underline"><ArrowLeft size={15} /> Dashboard</Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Your profile</h1>
          <p className="mt-1 text-sm text-slate-600">Your personal profile is saved to your signed-in Koinelio account.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><ShieldCheck size={14} /> Student account</span>
      </div>

      {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800"><AlertCircle size={18} className="mt-0.5 shrink-0" /> <span>{error}</span></div>}
      {success && <div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /> <span>{success}</span></div>}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900">Profile photo</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG or WebP · maximum 2 MB</p>
            <div className="mt-5 flex flex-col items-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Your profile" className="h-28 w-28 rounded-full border border-slate-200 object-cover shadow-sm" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400"><UserRound size={44} /></div>
              )}
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploading ? 'Uploading…' : profile.avatar_url ? 'Change photo' : 'Upload photo'}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900">Account identity</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-xs text-slate-500">Sign-in email</dt><dd className="mt-1 break-all font-medium text-slate-800">{email}</dd></div>
              <div><dt className="text-xs text-slate-500">Profile label</dt><dd className="mt-1 font-medium capitalize text-slate-800">{profile.campus_role}</dd></div>
              <div><dt className="text-xs text-slate-500">Affiliation</dt><dd className="mt-1 font-medium text-slate-800">{accountStatus}</dd></div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-slate-500">A confirmed institute email is not by itself proof of current enrolment. Trusted affiliation fields cannot be changed from this form.</p>
          </section>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Personal and academic details</h2>
          <p className="mt-1 text-sm text-slate-600">Only fields you are allowed to edit are saved. Institutional role and verification fields are protected.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="displayName">Display name</label>
              <input id="displayName" className={inputClass} required minLength={2} maxLength={100} value={profile.display_name} onChange={(e) => update('display_name', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="bio">About you</label>
              <textarea id="bio" rows={4} maxLength={600} className={inputClass} placeholder="Your interests, projects, goals, or what you enjoy learning…" value={profile.bio} onChange={(e) => update('bio', e.target.value)} />
              <p className="mt-1 text-right text-xs text-slate-400">{profile.bio.length}/600</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="department">Department / discipline</label>
              <input id="department" maxLength={120} className={inputClass} value={profile.department ?? ''} onChange={(e) => update('department', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="degree">Degree / programme</label>
              <input id="degree" maxLength={160} className={inputClass} value={profile.degree_program ?? ''} onChange={(e) => update('degree_program', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="campusRole">Campus profile type</label>
              <select id="campusRole" className={inputClass} value={profile.campus_role} onChange={(e) => update('campus_role', e.target.value as ProfileRecord['campus_role'])}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="alumni">Alumni / graduate</option>
              </select>
              <p className="mt-1 text-xs leading-5 text-slate-500">This is a self-reported profile category, not an institutional appointment or admin permission.</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="studyYear">Current study year</label>
              <select id="studyYear" className={inputClass} value={profile.study_year ?? ''} onChange={(e) => update('study_year', e.target.value ? Number(e.target.value) : null)}>
                <option value="">Not set</option>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="batchYear">Admission batch year</label>
              <input id="batchYear" type="number" min={2016} max={new Date().getFullYear()} className={inputClass} value={profile.batch_year ?? ''} onChange={(e) => update('batch_year', e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="graduationYear">{profile.campus_role === 'alumni' ? 'Graduation year' : 'Expected graduation year'}</label>
              <input id="graduationYear" type="number" min={2016} max={2200} className={inputClass} value={profile.graduation_year ?? ''} onChange={(e) => update('graduation_year', e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="skills">Skills</label>
              <input id="skills" className={inputClass} placeholder="C++, Python, Electronics" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="interests">Interests</label>
              <input id="interests" className={inputClass} placeholder="AI/ML, robotics, open source" value={interestsText} onChange={(e) => setInterestsText(e.target.value)} />
              <p className="mt-1 text-xs text-slate-500">Separate items with commas. Up to 20 interests and 30 skills are saved.</p>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="visibility">Profile visibility</label>
              <select id="visibility" className={inputClass} value={profile.profile_visibility} onChange={(e) => update('profile_visibility', e.target.value as ProfileRecord['profile_visibility'])}>
                <option value="campus">Campus directory (recommended)</option>
                <option value="private">Private — only you</option>
                <option value="public">Public profile</option>
              </select>
              <p className="mt-1 text-xs leading-5 text-slate-500">This preference uses the database's actual privacy setting, not a browser-only demo toggle.</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="max-w-md text-xs leading-5 text-slate-500">Changes are written to Supabase and remain after signing out. Do not enter passwords, government IDs, or private institute credentials in your bio.</p>
            <button type="submit" disabled={saving || uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
