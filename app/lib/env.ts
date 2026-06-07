// Boot-time environment validation. Imported (as a side effect) by app/layout.tsx
// so it runs on the server at build + request time. In production it THROWS a clear,
// descriptive error when a required var is missing or obviously malformed; in dev it
// warns so a temporarily-missing var doesn't hard-block local work.
//
// Never logs secret VALUES — only the variable name + the expected shape.

function validateEnv(): void {
  const problems: string[] = [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    problems.push("NEXT_PUBLIC_SUPABASE_URL is missing");
  } else {
    try {
      new URL(url);
    } catch {
      problems.push("NEXT_PUBLIC_SUPABASE_URL is not a valid URL");
    }
  }

  // Supabase keys are either the new `sb_publishable_` / `sb_secret_` format or a
  // legacy JWT (`eyJ…`). Accept both; flag anything else as malformed.
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anon) problems.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  else if (!anon.startsWith("sb_publishable_") && !anon.startsWith("eyJ"))
    problems.push("NEXT_PUBLIC_SUPABASE_ANON_KEY looks malformed (expected an sb_publishable_… key or a JWT)");

  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!svc) problems.push("SUPABASE_SERVICE_ROLE_KEY is missing");
  else if (!svc.startsWith("sb_secret_") && !svc.startsWith("eyJ"))
    problems.push("SUPABASE_SERVICE_ROLE_KEY looks malformed (expected an sb_secret_… key or a JWT)");

  // The service-role key must never be exposed to the browser.
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
    problems.push("SUPABASE_SERVICE_ROLE_KEY must NOT be exposed with a NEXT_PUBLIC_ prefix");

  if (problems.length === 0) return;

  const message =
    `Invalid environment configuration — fix these in .env.local / Vercel:\n  - ` +
    problems.join("\n  - ");

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[env] ${message}`);
  }
}

validateEnv();

export {};
