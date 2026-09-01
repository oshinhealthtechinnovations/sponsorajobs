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

-- ==============================================================================
-- Candidate Job Applications Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_slug TEXT,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  location TEXT,
  salary TEXT,
  apply_url TEXT NOT NULL,
  status TEXT DEFAULT 'APPLIED',
  notes TEXT DEFAULT '',
  interview_date TIMESTAMPTZ,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert to candidate_applications" 
  ON candidate_applications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anon select from candidate_applications" 
  ON candidate_applications FOR SELECT 
  USING (true);

CREATE POLICY "Allow anon update to candidate_applications" 
  ON candidate_applications FOR UPDATE 
  USING (true);

CREATE POLICY "Allow anon delete from candidate_applications" 
  ON candidate_applications FOR DELETE 
  USING (true);

CREATE INDEX IF NOT EXISTS idx_candidate_applications_user ON candidate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_job ON candidate_applications(job_id);

