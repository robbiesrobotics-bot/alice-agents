# AliceFleet Supabase — Production Database

## Connection Details

**Project ID:** `xxxgvtwnlbtdgmlgccee`
**Database URL:** `https://xxxgvtwnlbtdgmlgccee.supabase.co`
**Postgres:** `postgres://postgres@db.xxxgvtwnlbtdgmlgccee.supabase.co:5432/postgres`

## API Keys

**Service Role Key:**
```
<JWT_TOKEN>```

**Publishable Key:**
```
sb_publishable_kxs4XmTkNnLplhzB2e3G0Q_udm9hn5X
```

**Personal Access Token (for management API):**
```
sbp_ed0f5d2dbd0ded3e1da0b48aac5493acc37a4d1f
```

## What's Deployed

- **65 tables** across 12 migrations
- **RLS enabled** on all tables (135 policies)
- **4 system roles**: viewer, operator, admin, super_admin
- **16 permissions** across modules
- **44 role-permission mappings**
- **pg_notify triggers** for Supabase Realtime on: agent_events, sessions, notifications, activities

## Database Architecture

- Multi-tenant: organization → tenant → user hierarchy
- CRM/Billing/Fleet tables: admin-only RLS (operators/viewers blocked)
- Mission Control tables: operator+ access
- All tenant-scoped tables have `tenant_id` FK with RLS enforcement

## Management API

```bash
# Apply migrations
curl -X POST "https://api.supabase.com/v1/projects/xxxgvtwnlbtdgmlgccee/database/query" \
  -H "Authorization: Bearer sbp_ed0f5d2dbd0ded3e1da0b48aac5493acc37a4d1f" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Supabase-CLI/2.53.6" \
  -d '{"query": "SELECT 1"}'
```
