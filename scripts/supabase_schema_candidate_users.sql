-- ==============================================================================
-- SponsorAJobs: Candidate Accounts & Authentication Table for Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profession TEXT,
  promo_code TEXT,
  is_email_verified BOOLEAN DEFAULT true,
  is_trial BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE candidate_users ENABLE ROW LEVEL SECURITY;

-- Allow REST API service role & anon operations for authentication
CREATE POLICY "Allow anon insert to candidate_users" 
  ON candidate_users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anon select from candidate_users" 
  ON candidate_users FOR SELECT 
  USING (true);

CREATE POLICY "Allow anon update to candidate_users" 
  ON candidate_users FOR UPDATE 
  USING (true);

-- Index for instant email lookups
CREATE INDEX IF NOT EXISTS idx_candidate_users_email ON candidate_users(email);
