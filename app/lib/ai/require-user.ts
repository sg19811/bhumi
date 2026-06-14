import { supabaseAdmin } from "@/app/lib/supabase-server";

// Validate the Supabase access token sent by the client (Authorization: Bearer …).
// Returns the user id, or null if unauthenticated. Used to gate paid AI endpoints
// so only signed-in users can spend tokens.
export async function getUserId(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

// Returns the user id only if they are an admin, else null. Used to gate
// internal/paid admin endpoints (parsing, matching, publishing).
export async function getAdminUserId(req: Request): Promise<string | null> {
  const userId = await getUserId(req);
  if (!userId) return null;
  const { data } = await supabaseAdmin.from("profiles").select("role").eq("user_id", userId).maybeSingle();
  return data?.role === "admin" ? userId : null;
}
