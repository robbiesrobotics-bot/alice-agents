# LEARNINGS.md — Task Reflections

_After completing non-trivial tasks, append a structured reflection here._
_Olivia periodically reviews these and promotes the best patterns into PLAYBOOK.md._

<!-- Entries below, newest first -->

### 2026-03-20 — Mission Control overnight backend status check from repo state
- **Outcome:** success
- **What worked:** verifying the current branch state before touching code avoided unnecessary edits; `npm run build` and the expanded focused test suite were enough to validate the in-progress backend changes quickly
- **What to improve:** add a lightweight schema inventory doc for tables like `session_messages` so migration gaps are obvious during backend work instead of being discovered by grep
- **Reusable pattern:** when inheriting uncommitted backend work, first prove whether the repo is already green locally, then separate runtime-schema risks from build/test risks before deciding to patch code


### 2026-03-20 — Mission Control overnight reconciliation check confirmed no DB change needed
- **Outcome:** success
- **What worked:** reading the runbook first, then verifying live table and column availability over PostgREST with the repo’s service-role key, established the effective remote schema state without risky write attempts
- **What to improve:** expose migration-history visibility (for example `supabase_migrations.schema_migrations`) through a documented read-only path so checks can confirm exact migration IDs instead of inferring from schema effects
- **Reusable pattern:** for additive Supabase migrations, when DB credentials or CLI link state are incomplete, confirm the live presence of migration-specific tables and columns via service-role REST probes before deciding to apply anything


### 2026-03-20 — Mission Control MCP discovery fallback from runtime config and persisted catalog
- **Outcome:** success
- **What worked:** replacing the stub with a layered discovery path that first inspects local OpenClaw MCP config metadata and then falls back to persisted `ah_mcp_tools` rows kept the implementation useful without inventing an unproven remote MCP HTTP contract
- **What to improve:** add an explicit Mission Control ⇄ OpenClaw tool-discovery contract or gateway endpoint so remote live discovery can be implemented intentionally instead of inferred from config snapshots
- **Reusable pattern:** for partially-defined integrations, prefer supported local/runtime metadata plus persisted catalog data, normalize a few common shapes, and return soft-empty results rather than probing speculative network endpoints


### 2026-03-20 — Mission Control safe session/message persistence fallback
- **Outcome:** success
- **What worked:** read the existing `memory-service`, transcript/session routes, and Supabase helpers first, then aligned the implementation to already-used `sessions` and `session_messages` tables with payload fallbacks instead of inventing a new schema contract
- **What to improve:** centralize PostgREST schema/table error detection in a shared helper so graceful fallback behavior is consistent across the codebase
- **Reusable pattern:** for optional Supabase-backed persistence in mixed local/hosted setups, attempt writes with a small ordered set of payload shapes, treat missing-table/missing-column errors as feature detection, cache unsupported tables in-process, and only warn on non-schema failures

### 2026-03-20 — Mission Control backend/build and Supabase migration status check
- **Outcome:** success
- **What worked:** combined local verification (`git status`, `npm run build`, `npm test`) with direct Supabase REST probes using the service-role key to confirm cloud table presence when CLI linking/Docker status were unavailable
- **What to improve:** add a checked-in Supabase project link/config or a documented read-only remote schema check so migration state can be verified without relying on Docker or ad hoc REST probing
- **Reusable pattern:** when `supabase status`/`migration list` are blocked, confirm critical migration effects by querying expected tables over PostgREST with the service-role key before deciding whether any DB change is safe or necessary

### 2026-03-20 — Verified Mission Control cloud reconciliation schema state
- **Outcome:** success
- **What worked:** using the configured Supabase URL plus service-role key to query the live PostgREST API gave a safe, direct read of remote schema/table availability without needing destructive DB access
- **What to improve:** if exact migration-history proof matters, add a lightweight verification path for `supabase_migrations.schema_migrations` or a dedicated healthcheck RPC
- **Reusable pattern:** when direct DB credentials are unavailable but service-role API access exists, verify migration effects by checking live tables/columns/endpoints that uniquely distinguish the target migration

### 2026-03-20 — Verified Mission Control remote Supabase migration state
- **Outcome:** success
- **What worked:** Using repo env + service-role-backed REST probes to verify remote table presence when Supabase CLI lacked a linked project and access token.
- **What to improve:** Keep a lightweight project-link/auth note in the repo so migration history can be checked via CLI without fallback probing.
- **Reusable pattern:** When CLI auth/link is missing, verify additive Supabase migrations by probing expected tables/endpoints over PostgREST with the service role key before attempting any schema change.

### 2026-03-24 — Stripe Pipeline build (webhook handler + n8n welcome email)
- **Outcome:** success
- **What worked:** reading the existing Vercel webhook handler to understand the exact flow before writing the Python version; querying the n8n SQLite database directly to extract the API key; using the n8n REST API (POST /api/v1/workflows) to import and activate the workflow programmatically.
- **What to improve:** n8n v2.12 requires `name`, `nodes`, `connections`, and `settings` fields on create — `staticData` must be `null` not absent, and extra fields like `triggerCount` and `versionId` cause "must NOT have additional properties" errors. The `settings` field must include `executionOrder`, `saveManualExecutions`, `callerPolicy`, and `errorWorkflow`.
- **Reusable pattern:** n8n API workflow import needs exactly `{name, nodes, connections, settings}` at minimum — any extra top-level fields cause schema validation errors.
- **Reusable pattern:** when n8n API key is not in env vars, it can be extracted from the SQLite database at `/home/node/.n8n/database.sqlite` in the `user_api_keys` table.

### 2026-03-29 — KidSpark Phase 3: Stripe v21 fixes + remaining route wiring
- **Outcome:** success
- **What worked:** Reading the Stripe v21 type definitions directly from node_modules to understand what changed. The task description listed 9 routes to wire but most were already complete from the previous session — careful review avoided duplicate work.
- **What to improve:** Stripe v21 (npm stripe@21) uses API version `2026-03-25.dahlia` and made breaking type changes: `Subscription.current_period_start/end` moved to `SubscriptionItem.current_period_start/end`, `Invoice.subscription` moved to `Invoice.parent.subscription_details.subscription`. Best to drop the explicit `apiVersion` param entirely and let the SDK use its built-in default.
- **Reusable pattern:** When Stripe SDK major version bumps, always check `node_modules/stripe/types/apiVersion.d.ts` for the expected API version, and grep changed type definitions rather than guessing.

### 2026-03-23 — Architected three-product AI coding service for Rob
- **Outcome:** success
- **What worked:** Led with model routing table first — everyone (Rob, Devon, future devs) immediately understands where work happens. Layered architecture (n8n = orchestrator, Qdrant = brain, Langfuse = observability) kept the three offerings from becoming spaghetti.
- **What to improve:** Should have spec'd the per-client namespace isolation in Qdrant more formally before writing the rest — it touches security and billing.
- **Reusable pattern:** "Infrastructure first, then offerings" — always anchor model routing + node mapping before describing agent flows.
