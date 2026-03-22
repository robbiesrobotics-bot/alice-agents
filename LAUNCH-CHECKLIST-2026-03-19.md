# A.L.I.C.E. Launch Checklist

This checklist is the staging and production gate for the March 19, 2026 launch week release.

## 1. Environment Preflight

### Mission Control

Required for hosted staging and production:

```env
MC_DEPLOYMENT_MODE=hosted
NEXT_PUBLIC_MC_DEPLOYMENT_MODE=hosted
INGEST_TOKEN=...
MC_SUPABASE_URL=https://<project>.supabase.co
MC_SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENCLAW_GATEWAY_URL=https://<gateway-host>
OPENCLAW_GATEWAY_TOKEN=...
```

Required for local verification:

```env
MC_DEPLOYMENT_MODE=local
NEXT_PUBLIC_MC_DEPLOYMENT_MODE=local
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=...
```

### Landing

```env
NEXT_PUBLIC_SITE_URL=https://<landing-domain>
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_CLOUD_PRICE_ID=price_...
RESEND_API_KEY=re_...
```

### ALICE package / installer

Confirm local OpenClaw state and Mission Control bridge output:

```bash
openclaw gateway status
node --test test/doctor.test.mjs test/config-merger.test.mjs test/mission-control.test.mjs
```

## 2. Build And Test Gate

### Mission Control

```bash
cd /Users/aliceclaw/.openclaw/workspace-olivia/mission-control
npm install
npm test
```

Launch-week local dev path:

```bash
npm run dev
```

Optional Turbopack check:

```bash
npm run dev:turbo
```

Pass criteria:
- `npm test` is green.
- `npm run dev` boots cleanly.
- Hosted mode rejects unauthenticated access and missing Supabase config.

### Landing

```bash
cd /Users/aliceclaw/.openclaw/workspace-olivia/alice-agents/landing
npm install
npm test
npm run build
```

Pass criteria:
- env tests and webhook helper tests are green
- checkout build succeeds with staging envs
- webhook route reports `503` when critical billing env is missing

### ALICE package

```bash
cd /Users/aliceclaw/.openclaw/workspace-olivia/alice-agents
node --test test/doctor.test.mjs test/config-merger.test.mjs test/mission-control.test.mjs
```

Pass criteria:
- doctor reports shared-default model inheritance correctly
- Mission Control bridge config is detected correctly

## 3. Staging End-To-End Flow

### Commerce and fulfillment

1. Open the landing pricing page in staging.
2. Start a Stripe test-mode checkout for `pro`.
3. Complete payment with a Stripe test card.
4. Verify the webhook stores one `licenses` row with:
   - the expected email
   - the expected plan
   - a non-null `stripe_session_id`
5. Replay the same webhook event from Stripe.

Pass criteria:
- first delivery creates one license
- replay does not create a duplicate license
- fulfillment email is sent once or is safely idempotent

### Installer and licensing

1. Use the issued license with:

```bash
npx @robbiesrobotics/alice-agents --license <LICENSE_KEY>
```

2. Complete install against a fresh OpenClaw profile or clean local state.
3. Run the doctor.

Pass criteria:
- installer completes without pinning the team to an unintended provider/model
- inherited agents follow the OpenClaw shared default
- explicit per-agent overrides still work if configured

### Runtime and bridge

1. Start the local OpenClaw gateway.
2. Trigger one real agent chat or orchestration run.
3. Confirm bridge traffic reaches Mission Control ingest using the shared `INGEST_TOKEN`.

Pass criteria:
- Mission Control shows the session/activity record
- invalid ingest tokens are rejected
- hosted ingest without token is rejected

### Mission Control UI

1. Sign into staging Mission Control.
2. Load dashboard, agents, chat, jobs, workflows, settings.
3. Verify one workflow dispatch and one ad hoc job.

Pass criteria:
- no anonymous dashboard access
- no JSON fallback in hosted mode
- live data and stored records both appear correctly

## 4. Production Go / No-Go

Go only if all of the following are true:

- Mission Control hosted auth is fail-closed.
- Mission Control ingest requires a valid token.
- Hosted Mission Control uses Supabase, not JSON fallback.
- Landing checkout points at the correct production domain.
- Stripe webhook replay is idempotent.
- ALICE install, licensing, and bridge flow pass on a clean machine/profile.
- One complete staging run has been executed within 24 hours of deploy.

No-go triggers:

- any public or unauthenticated Mission Control access path remains
- webhook replay creates duplicate licenses
- staging install pins agents to the wrong model/provider
- Mission Control staging cannot display real runtime activity after a live run
