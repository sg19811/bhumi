import { test, expect } from "@playwright/test";

// Request-based smoke tests: each public page must return 200 and contain a
// unique, page-specific string in its server-rendered HTML (proves the right
// page rendered, not just any 200 / an error shell).
const PAGES: { path: string; needle: string }[] = [
  { path: "/", needle: "Trusted agricultural land marketplace" },
  { path: "/explore", needle: "Explore agricultural land" },
  { path: "/legal", needle: "Land Legal Navigator" },
  { path: "/legal/wizard", needle: "Land eligibility wizard" },
  { path: "/listing/new", needle: "List your land" },
  { path: "/buy", needle: "Post what land you want to buy" },
  { path: "/requirements", needle: "Buyer requirements" },
  { path: "/about", needle: "Why AcreHub" },
  { path: "/region/Mysuru", needle: "Mysuru" },
  { path: "/land/orchard", needle: "Orchards" },
  { path: "/tools", needle: "Land tools" },
];

for (const p of PAGES) {
  test(`GET ${p.path} → 200 + "${p.needle}"`, async ({ request }) => {
    const res = await request.get(p.path);
    expect(res.status(), `${p.path} should be 200`).toBe(200);
    expect(await res.text(), `${p.path} should contain "${p.needle}"`).toContain(p.needle);
  });
}

// /agent gates client-side (not via an HTTP redirect): logged-out requests
// resolve to the agent route, which SSR-renders a loading state until auth
// settles in the browser. We assert the route resolves (200, no server error).
// NOTE: verifying the actual logged-out gate UI ("Agent dashboard" / "Sign in")
// requires a browser-based test — see overnight log; deferred as a follow-up.
test("GET /agent (logged out) resolves without server error", async ({ request }) => {
  const res = await request.get("/agent");
  expect(res.status()).toBe(200);
});

// /eligibility was folded into /legal — assert the permanent redirect.
// Next.js `permanent: true` emits 308 (not 301); accept either.
test("GET /eligibility → permanent redirect to /legal", async ({ request }) => {
  const res = await request.get("/eligibility", { maxRedirects: 0 });
  expect([301, 308]).toContain(res.status());
  expect(res.headers()["location"] ?? "").toContain("/legal");
});
