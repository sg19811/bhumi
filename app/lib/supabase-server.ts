import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the service role key. NEVER import this in a "use client" file.
// Used by server components/pages that must read protected data (admin, requirements).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
