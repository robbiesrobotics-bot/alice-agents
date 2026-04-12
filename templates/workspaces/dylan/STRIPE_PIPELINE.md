# STRIPE_PIPELINE.md — Client Purchase Pipeline Spec

**Author:** Dylan (Backend/Data)
**Date:** 2026-03-24
**Status:** Built and deployed — needs Rob's API keys to activate

---

## Overview

End-to-end flow for converting a Stripe checkout into a live A.L.I.C.E. license.

```
Buyer clicks "Buy Pro" → Stripe Checkout → webhook → license + team tokens → welcome email
```

---

## What Already Exists

| Component | Location | Status |
|---|---|---|
| Stripe checkout session creator | `app/api/stripe/checkout/route.ts` (Vercel) | ✅ Live on Vercel |
| Stripe webhook handler (Node.js) | `app/api/stripe/webhook/route.ts` (Vercel) | ✅ Live on Vercel |
| License key generation | `lib/license-fulfillment.ts` (Vercel) | ✅ Live — `ALICE-XXXX-XXXX-XXXX` format |
| License table schema | `supabase/migrations/00006_licenses.sql` | ✅ Created |
| Resend email (license delivery) | Inline in webhook route | ✅ Live on Vercel |
| Success redirect page | `/signup/success?session_id={CHECKOUT_SESSION_ID}` | ✅ Live |
| Teams + team_tokens provisioning | Inline in webhook route | ✅ Live on Vercel |

### Vercel Webhook Handler Logic (current)
1. Validates Stripe signature
2. Deduplicates on `stripe_session_id`
3. Inserts into `licenses` table
4. Provisions team + `mc_ingest_*` / `mc_worker_*` tokens
5. Sends license email via Resend (`hello@av3.ai`)

### `licenses` Table Schema
```sql
CREATE TABLE IF NOT EXISTS licenses (
  id           TEXT PRIMARY KEY DEFAULT 'lic-' || substr(md5(random()::text), 1, 12),
  key          TEXT NOT NULL UNIQUE DEFAULT 'ALICE-' || upper(substr(md5(random()::text), 1, 4))
                               || '-' || upper(substr(md5(random()::text), 1, 4))
                               || '-' || upper(substr(md5(random()::text), 1, 4)),
  email        TEXT NOT NULL,
  plan         TEXT NOT NULL DEFAULT 'pro',
  stripe_session_id  TEXT,
  stripe_customer_id TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked      BOOLEAN NOT NULL DEFAULT false,
  revoked_at   TIMESTAMPTZ,
  metadata     JSONB DEFAULT '{}'
);
-- indexes on key, email, stripe_session_id
```

---

## What's Missing

### 1. Ubuntu Desktop Webhook Handler ✅ DONE
**File:** `~/alice-observability/stripe-webhook-handler.py`

Deployed to Ubuntu Desktop. This Python version:
- Runs as a Flask app on port 5001
- Handles `checkout.session.completed` (validates Stripe signature)
- Generates license key: `ALICE-XXXX-XXXX-XXXX`
- Inserts into Supabase `licenses` table (deduplication by `stripe_session_id`)
- Provisions team + `mc_ingest_*` / `mc_worker_*` tokens in `teams` + `team_tokens` tables
- Triggers n8n welcome email workflow at `http://100.106.110.119:5678/webhook/stripe-checkout-completed`
- Also has a `/test/mock-webhook` endpoint for local testing (no Stripe signature required)
- Dependencies installed: `stripe`, `supabase`, `flask`, `requests`
- Syntax verified ✅ — starts and fails gracefully with clear message when `.env` not configured

### 2. n8n Welcome Email Workflow ✅ DONE
**File:** `n8n-stripe-welcome-workflow.json` (workspace) + live in n8n (ID: `AmpbnxucPsjcAGFP`)

- Webhook trigger: `POST /webhook/stripe-checkout-completed` ✅ (active)
- Parses payload: extracts `license_key`, `email`, `plan`, `ingest_token`, `worker_token`
- Validates email is non-empty (if branch)
- Sends styled HTML welcome email via Resend API (`hello@av3.ai`)
- Uses welcome email template from `workspace-olivia/onboarding/welcome-email.html`
- Variables rendered: `{{ $json.licenseKey }}`, `{{ $json.aliceCloudToken }}`, `{{ $json.activationCmd }}`
- Retry logic: 3 tries with 2s delay
- Import method: n8n REST API (`POST /api/v1/workflows`)
- **Requires:** `RESEND_API_KEY` env var in n8n (`{{ $env.RESEND_API_KEY }}`)

### 3. Environment Variables on Ubuntu Desktop
File: `~/alice-observability/.env`

```
STRIPE_WEBHOOK_SECRET=whsec_...       # Rob needs to provide
SUPABASE_URL=https://tfodkdtknoaodavakajg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Rob needs to provide
N8N_WEBHOOK_URL=http://100.106.110.119:5678/webhook/stripe-checkout-completed
RESEND_API_KEY=re_...                 # Rob needs to provide
FLASK_PORT=5001
```

### 4. Stripe Webhook Reconfiguration
The Stripe webhook in the Stripe Dashboard needs to point to:
- `POST https://getalice.av3.ai/api/stripe/webhook` (Vercel — currently registered)
- OR `POST http://100.106.110.119:5001/webhook/stripe` (Ubuntu Desktop — if preferred)
- The NAT issue (port 5678 not reachable from internet) does NOT affect port 5001 unless that too is NAT-blocked

---

## Full Purchase Flow (with new components)

```
1. User → POST /api/stripe/checkout { plan: "pro" }
   → Vercel → Stripe API → redirect to Stripe Checkout

2. User pays on Stripe Checkout

3. Stripe → POST /api/stripe/webhook (Vercel)
   OR: Stripe → POST :5001/webhook/stripe (Ubuntu Desktop Python handler)
   ↓ (both handlers do the same thing)
   a. Validate Stripe signature
   b. Check stripe_session_id for deduplication
   c. Generate license key: ALICE-XXXX-XXXX-XXXX
   d. Insert into Supabase licenses table
   e. Provision team + ingest/worker tokens
   f. Send license email via Resend (Vercel handler)
      OR: POST to n8n /webhook/stripe-checkout-completed (Python handler)
   g. n8n workflow fires → sends styled welcome email
```

---

## Supabase Tables Used

| Table | Purpose |
|---|---|
| `licenses` | License key per purchase |
| `teams` | Team provisioned per customer |
| `team_tokens` | Mission Control ingest/worker tokens |

---

## Rob's API Keys Needed to Activate

| Key | Where to get it | Used for |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → getalice.av3.ai → Sign-in secret | Verifying Stripe webhook signatures |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` key | Writing to licenses + teams tables |
| `RESEND_API_KEY` | Resend.com → API Keys | Sending welcome emails |
| `STRIPE_PRO_PRICE_ID` | Stripe Dashboard → Products → Pro → Price ID | Checkout session creation |
| `STRIPE_CLOUD_PRICE_ID` | Stripe Dashboard → Products → Cloud → Price ID | Checkout session creation |

**Note:** Supabase URL is `https://tfodkdtknoaodavakajg.supabase.co` (already known from memory).

---

## Testing the Pipeline

### Mock Stripe webhook (local)
```bash
# Trigger a simulated checkout.session.completed event
python3 test_mock_webhook.py
```

### Verify license in Supabase
```bash
curl -X GET 'https://tfodkdtknoaodavakajg.supabase.co/rest/v1/licenses' \
  -H 'apikey: <SERVICE_ROLE_KEY>' \
  -H 'Authorization: Bearer <SERVICE_ROLE_KEY>'
```

### Verify n8n workflow fired
Check n8n execution log at `http://100.106.110.119:5678`

---

## Files Created by This Task

| File | Host | Status |
|---|---|---|
| `stripe-webhook-handler.py` | Ubuntu Desktop `~/alice-observability/` | ✅ Deployed — syntax verified |
| `n8n-stripe-welcome-workflow.json` | Ubuntu Desktop `~/alice-observability/` | ✅ Imported & activated in n8n (ID: `AmpbnxucPsjcAGFP`) |
| `n8n-stripe-welcome-workflow.json` | Workspace `workspace-dylan/` | ✅ Updated to correct n8n API format |
| `STRIPE_PIPELINE.md` | Workspace `workspace-dylan/` | ✅ Spec document |
| `.env.example` | Ubuntu Desktop `~/alice-observability/` | ✅ Copied |
| `00007_verify_licenses_table.sql` | Workspace `workspace-dylan/` | ✅ SQL migration (verify/create licenses + teams + team_tokens) |
| `test_mock_webhook.py` | Workspace `workspace-dylan/` | ✅ Local test script |
