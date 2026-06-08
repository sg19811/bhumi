import { defineConfig } from "@playwright/test";

// Smoke tests are request-based (HTTP only) — they don't launch a browser, so
// CI doesn't need browser binaries and runs fast. They DO need the app running
// with Supabase env vars (most pages fetch data), so the webServer builds +
// starts the app and CI must provide NEXT_PUBLIC_SUPABASE_* / SERVICE_ROLE.
const PORT = Number(process.env.SMOKE_PORT ?? 3100);

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
