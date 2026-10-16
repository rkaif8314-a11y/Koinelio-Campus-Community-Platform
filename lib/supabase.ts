import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseKey =
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim() ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export function getSupabaseConfigError(): string | null {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length) {
    return "Supabase is not configured for this deployment. Add " + missing.join(" and ") +
      " in Vercel Project Settings → Environment Variables, then redeploy. Never put a service-role key in a NEXT_PUBLIC variable.";
  }
  try {
    const parsed = new URL(supabaseUrl);
    const localHttp = parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
    if (parsed.protocol !== "https:" && !localHttp) {
      return "NEXT_PUBLIC_SUPABASE_URL must use HTTPS (HTTP is allowed only for localhost development).";
    }
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL is invalid. Copy the Project URL from Supabase → Project Settings → API.";
  }
  return null;
}

export const supabase = createClient(
  supabaseUrl || "https://missing-project.supabase.co",
  supabaseKey || "missing-supabase-key",
  { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: "pkce" } }
);
