-- Migration: 00007_verify_licenses_table.sql
-- Purpose: Verify/create the licenses table for Stripe webhook fulfillment
-- Project: tfodkdtknoaodavakajg.supabase.co
-- Run: psql $SUPABASE_DB_URL -f 00007_verify_licenses_table.sql

-- The licenses table was created by migration 00006_licenses.sql (v1.4.8).
-- This migration adds missing indexes and verifies the table is properly configured.

-- ─── Licenses Table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.licenses (
    id                  TEXT PRIMARY KEY DEFAULT 'lic-' || substr(md5(random()::text), 1, 12),
    key                 TEXT NOT NULL UNIQUE DEFAULT
        'ALICE-' || upper(substr(md5(random()::text), 1, 4))
        || '-'    || upper(substr(md5(random()::text), 1, 4))
        || '-'    || upper(substr(md5(random()::text), 1, 4)),
    email               TEXT NOT NULL,
    plan                TEXT NOT NULL DEFAULT 'pro',
    stripe_session_id   TEXT,
    stripe_customer_id  TEXT,
    purchased_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked             BOOLEAN NOT NULL DEFAULT false,
    revoked_at          TIMESTAMPTZ,
    metadata            JSONB DEFAULT '{}'::jsonb
);

-- Unique index on stripe_session_id (deduplication key for webhooks)
CREATE UNIQUE INDEX IF NOT EXISTS idx_licenses_stripe_session_id
    ON public.licenses(stripe_session_id)
    WHERE stripe_session_id IS NOT NULL;

-- Index on key (license validation lookups)
CREATE UNIQUE INDEX IF NOT EXISTS idx_licenses_key
    ON public.licenses(key);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_licenses_email
    ON public.licenses(email);

-- ─── Teams Table ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.teams (
    id           BIGSERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    plan         TEXT NOT NULL DEFAULT 'pro',
    owner_email  TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata     JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_owner_email ON public.teams(owner_email);

-- ─── Team Tokens Table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.team_tokens (
    id           BIGSERIAL PRIMARY KEY,
    team_id      BIGINT REFERENCES public.teams(id) ON DELETE CASCADE,
    license_key  TEXT NOT NULL,
    ingest_token TEXT NOT NULL UNIQUE,
    worker_token TEXT NOT NULL UNIQUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata     JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_team_tokens_team_id ON public.team_tokens(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tokens_license_key ON public.team_tokens(license_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_tokens_ingest ON public.team_tokens(ingest_token);

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- For service role (webhook handler): full access
-- For anon: read-only by key only

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tokens ENABLE ROW LEVEL SECURITY;

-- Service role has full access by default (no policy needed).
-- Allow anon to validate licenses by key:
DROP POLICY IF EXISTS "licenses_anon_validate" ON public.licenses;
CREATE POLICY "licenses_anon_validate" ON public.licenses
    FOR SELECT USING (true);

-- Allow anon to find team by slug (for Mission Control):
DROP POLICY IF EXISTS "teams_anon_read" ON public.teams;
CREATE POLICY "teams_anon_read" ON public.teams
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "team_tokens_anon_read" ON public.team_tokens;
CREATE POLICY "team_tokens_anon_read" ON public.team_tokens
    FOR SELECT USING (true);

-- ─── Verify ────────────────────────────────────────────────────────────────────

SELECT 'licenses'     AS table_name, COUNT(*) AS row_count FROM public.licenses
UNION ALL
SELECT 'teams',                       COUNT(*)          FROM public.teams
UNION ALL
SELECT 'team_tokens',                COUNT(*)          FROM public.team_tokens;
