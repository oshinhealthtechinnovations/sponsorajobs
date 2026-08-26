-- ==============================================================================
-- SponsorAJobs — Supabase Production Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create Job Alerts Subscribers Table
CREATE TABLE IF NOT EXISTS public.job_alerts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    keyword TEXT,
    country_code TEXT,
    category_id TEXT,
    sponsorship_label TEXT,
    frequency TEXT DEFAULT 'daily',
    active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_job_alerts_email ON public.job_alerts(email);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON public.job_alerts(active);
CREATE INDEX IF NOT EXISTS idx_job_alerts_created_at ON public.job_alerts(created_at DESC);

-- 3. Configure Row Level Security (RLS)
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public subscribers to insert their email alerts
DROP POLICY IF EXISTS "Allow anonymous alert signup" ON public.job_alerts;
CREATE POLICY "Allow anonymous alert signup" 
ON public.job_alerts 
FOR INSERT 
TO anon, authenticated, service_role 
WITH CHECK (true);

-- Allow reading alerts for admin and dashboard
DROP POLICY IF EXISTS "Allow read alerts" ON public.job_alerts;
CREATE POLICY "Allow read alerts" 
ON public.job_alerts 
FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

-- ==============================================================================
-- Verification Query
-- ==============================================================================
SELECT 'SponsorAJobs Supabase schema created successfully!' as status;
