# Founder lead alerts — setup

Every new lead row can email **isha@acrehubindia.com** the moment it's created. The code is built
(`app/api/notify-lead/route.ts` + `app/lib/email.ts`); these are the one-time activation steps.

## 1. Environment variables (Vercel → Settings → Environment Variables, and `.env.local`)

| Var | Value | Notes |
|---|---|---|
| `RESEND_API_KEY` | your Resend key | **Required** — without it, no email is sent (the app stays silent). |
| `FOUNDER_EMAIL` | `isha@acrehubindia.com` | Recipient. Defaults to this even if unset, but set it to be explicit. |
| `ALERT_FROM_EMAIL` | e.g. `AcreHub <alerts@acrehubindia.com>` | Verified sender in Resend. Falls back to Resend's test sender. |
| `LEAD_WEBHOOK_SECRET` | a random string | Protects the webhook (falls back to `CRON_SECRET` if unset). |

> In Resend, verify the `acrehubindia.com` domain so `ALERT_FROM_EMAIL` can send from it.

## 2. Create the Supabase Database Webhooks

In Supabase → **Database → Webhooks → Create a new hook**, one per lead table:

- **Tables:** `inquiries`, `buyer_interests`, `legal_inquiries`, `site_visit_requests`, `verification_requests`
- **Events:** `INSERT` only
- **Type:** HTTP Request → **POST**
- **URL:** `https://acrehubindia.com/api/notify-lead`
- **HTTP Headers:** add `Authorization: Bearer <LEAD_WEBHOOK_SECRET>`
  - (or append `?key=<LEAD_WEBHOOK_SECRET>` to the URL instead)

The route ignores any table it doesn't recognise, so adding an extra one by mistake is harmless.

## 3. Test

Submit a test inquiry/lawyer request on the live site, or POST a sample payload:

```
POST https://acrehubindia.com/api/notify-lead?key=<LEAD_WEBHOOK_SECRET>
{ "type": "INSERT", "table": "legal_inquiries",
  "record": { "name": "Test", "phone": "9999999999", "legal_concern": "Sample" } }
```

A `{ "ok": true, "emailed": true }` response (and an email to Isha) confirms it works.
`"emailed": false` means `RESEND_API_KEY` isn't set yet.
