/**
 * Supabase/PostgREST errors are plain objects, not always Error instances.
 * Keep the message, Postgres code, details, and hint visible so a missing
 * migration or Row Level Security denial is diagnosable instead of generic.
 */
export function supabaseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === 'object') {
    const value = error as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
    };
    const parts = [
      typeof value.message === 'string' ? value.message : '',
      typeof value.code === 'string' && value.code ? 'code: ' + value.code : '',
      typeof value.details === 'string' ? value.details : '',
      typeof value.hint === 'string' ? value.hint : '',
    ].filter(Boolean);
    if (parts.length) return parts.join(' — ');
  }

  return fallback;
}
