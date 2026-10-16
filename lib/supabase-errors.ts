/**
 * Supabase/PostgREST errors are plain objects, not always Error instances.
 * Preserve the original database details and add safe, actionable diagnostics
 * for the common configuration, migration, Storage and RLS failure modes.
 */
export function supabaseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return enrichMessage(error.message, '', fallback);
  }

  if (error && typeof error === 'object') {
    const value = error as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
      status?: unknown;
    };
    const message = typeof value.message === 'string' ? value.message : '';
    const code = typeof value.code === 'string' ? value.code : '';
    const parts = [
      message,
      code ? 'code: ' + code : '',
      typeof value.details === 'string' ? value.details : '',
      typeof value.hint === 'string' ? value.hint : '',
    ].filter(Boolean);
    return enrichMessage(parts.join(' — ') || fallback, code, fallback);
  }

  return fallback;
}

function enrichMessage(message: string, code: string, fallback: string): string {
  const text = message || fallback;
  const lower = text.toLowerCase();

  if (
    (code === '42703' || lower.includes('column') && lower.includes('does not exist')) &&
    (lower.includes('post_type') || lower.includes('media_url'))
  ) {
    return text + ' Fix: apply supabase/migrations/20261016120000_koinelio_feed_media_and_classification.sql to a staging database first, then redeploy.';
  }

  if (
    (code === '42883' || lower.includes('function') && lower.includes('does not exist')) &&
    (lower.includes('is_iit_bhilai_email_verified') || lower.includes('can_access_club_room'))
  ) {
    return text + ' Fix: the IIT Bhilai governance migration is missing. Validate and apply supabase/migrations/20261016090000_iit_bhilai_access_and_club_governance.sql in staging before production.';
  }

  if (lower.includes('bucket not found') || lower.includes('storage bucket') && lower.includes('not found')) {
    return text + ' Fix: verify that the required profile-avatars or campus-post-media Storage migration has been applied and that the bucket name matches the app.';
  }

  if (code === 'PGRST205' || code === '42P01' || lower.includes('could not find the table')) {
    return text + ' Fix: verify the ordered Supabase schema migrations and refresh the PostgREST schema cache after the migration completes.';
  }

  if (code === '42501' || lower.includes('row-level security') || lower.includes('permission denied')) {
    return text + ' Access is controlled by Supabase Row Level Security. Confirm the signed-in account, email confirmation and assigned role; do not bypass the policy with a service-role key in the browser.';
  }

  if (lower.includes('invalid api key') || lower.includes('jwt expired') || lower.includes('failed to fetch')) {
    return text + ' Check the Vercel/local NEXT_PUBLIC_SUPABASE_URL and publishable/anon key, and confirm the Supabase project is reachable.';
  }

  return text;
}
