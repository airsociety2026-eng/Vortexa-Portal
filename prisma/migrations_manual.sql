-- =========================================================================
-- VORTEXA 3.0: Add Unified Import & Git Tracker Columns and Tables
-- Target Database: Supabase Project bvjblwqcdxyzvxdlbyfd
-- =========================================================================

-- 1. Add Unified Registration columns to participants table
ALTER TABLE "participants" ADD COLUMN IF NOT EXISTS "registration_source" TEXT DEFAULT 'NATIVE';
ALTER TABLE "participants" ADD COLUMN IF NOT EXISTS "external_registration_id" TEXT;
ALTER TABLE "participants" ADD COLUMN IF NOT EXISTS "import_batch_id" TEXT;

-- Safe unique constraint on external_registration_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'participants_external_registration_id_key'
    ) THEN
        ALTER TABLE "participants" ADD CONSTRAINT "participants_external_registration_id_key" UNIQUE ("external_registration_id");
    END IF;
END $$;

-- 2. Create commits table for GitHub tracking
CREATE TABLE IF NOT EXISTS "commits" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_email" TEXT,
    "team_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "commits_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "commits_sha_key" ON "commits"("sha");
CREATE INDEX IF NOT EXISTS "commits_team_id_idx" ON "commits"("team_id");

-- 3. Create webhook_events table for GitHub delivery deduplication
CREATE TABLE IF NOT EXISTS "webhook_events" (
    "id" TEXT NOT NULL,
    "github_delivery" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_github_delivery_key" ON "webhook_events"("github_delivery");

-- 4. Create claim_tokens table for account claiming
CREATE TABLE IF NOT EXISTS "claim_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "team_id" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "claim_tokens_token_hash_key" ON "claim_tokens"("token_hash");
