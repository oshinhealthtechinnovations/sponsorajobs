-- SponsorAJobs D1 Migration 001: Initial Schema
-- Production Schema for Visa-Sponsorship Job Discovery Platform

-- 1. Countries Table (Config-driven international support)
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,          -- ISO 2-letter uppercase (e.g. GB, US, AU, CA, NZ)
    name TEXT NOT NULL,                 -- e.g. United Kingdom
    slug TEXT NOT NULL UNIQUE,          -- e.g. uk, usa, australia, canada, new-zealand
    flag TEXT NOT NULL,                 -- Emoji flag e.g. 🇬🇧
    currency TEXT NOT NULL,             -- ISO currency e.g. GBP, USD, AUD, CAD, NZD
    active INTEGER NOT NULL DEFAULT 1,  -- 1=Active, 0=Inactive
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table (Hierarchical job categories)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    active INTEGER NOT NULL DEFAULT 1,
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    website TEXT,
    careers_url TEXT,
    logo_url TEXT,
    industry TEXT,
    description TEXT,
    country_code TEXT REFERENCES countries(code),
    sponsorship_signal TEXT DEFAULT 'UNKNOWN',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sources Table (Registry of external ingestion adapters)
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,          -- e.g. usajobs, adzuna, ashby, workable, greenhouse
    type TEXT NOT NULL,                 -- e.g. api, ats, feed
    base_url TEXT,
    active INTEGER NOT NULL DEFAULT 0,  -- 0=Disabled by default for safety
    requires_api_key INTEGER NOT NULL DEFAULT 0,
    rate_limit INTEGER DEFAULT 60,      -- Requests per minute
    terms_url TEXT,
    attribution_required INTEGER NOT NULL DEFAULT 0,
    last_success_at TEXT,
    last_error_at TEXT,
    last_error_message TEXT,
    total_jobs_seen INTEGER NOT NULL DEFAULT 0,
    total_jobs_imported INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Company Source Configuration (ATS mapping for specific companies)
CREATE TABLE IF NOT EXISTS company_source_config (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,          -- e.g. ashby, workable, greenhouse
    source_identifier TEXT NOT NULL,    -- Org ID / token
    source_url TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    last_checked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Jobs Table (Normalized job listings with sponsorship intelligence)
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id),
    source_job_id TEXT NOT NULL,
    canonical_hash TEXT NOT NULL UNIQUE, -- SHA-256 / MD5 of normalized (company + title + location + applyUrl)
    title TEXT NOT NULL,
    company_id TEXT NOT NULL REFERENCES companies(id),
    description TEXT NOT NULL,
    description_clean TEXT,
    location TEXT,
    city TEXT,
    region TEXT,
    country_code TEXT NOT NULL REFERENCES countries(code),
    postal_code TEXT,
    remote_type TEXT NOT NULL DEFAULT 'UNKNOWN',       -- ONSITE, HYBRID, REMOTE, UNKNOWN
    employment_type TEXT NOT NULL DEFAULT 'UNKNOWN',   -- FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERNSHIP, APPRENTICESHIP, OTHER, UNKNOWN
    category_id TEXT REFERENCES categories(id),
    salary_min REAL,
    salary_max REAL,
    salary_currency TEXT,
    job_url TEXT NOT NULL,
    apply_url TEXT NOT NULL,
    source_url TEXT,
    published_at TEXT,
    first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT,
    sponsorship_score INTEGER NOT NULL DEFAULT 0,
    sponsorship_label TEXT NOT NULL DEFAULT 'No Sponsorship Signal', -- Strong, Likely, Possible, Weak, No Sponsorship Signal, Explicitly Not Offered, REVIEW_REQUIRED
    sponsorship_positive_evidence TEXT, -- JSON array of matched positive phrases
    sponsorship_negative_evidence TEXT, -- JSON array of matched negative phrases
    visa_keywords TEXT,                 -- JSON array of keywords detected
    quality_score INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'active', -- active, expired, rejected, draft, review_required
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Source Runs Table (Telemetry & Ingestion Logs)
CREATE TABLE IF NOT EXISTS source_runs (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id),
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    status TEXT NOT NULL DEFAULT 'running', -- running, success, failed, partial
    jobs_fetched INTEGER NOT NULL DEFAULT 0,
    jobs_inserted INTEGER NOT NULL DEFAULT 0,
    jobs_updated INTEGER NOT NULL DEFAULT 0,
    jobs_rejected INTEGER NOT NULL DEFAULT 0,
    jobs_duplicates INTEGER NOT NULL DEFAULT 0,
    error_message TEXT
);

-- 8. Admin Action Log (Audit trail)
CREATE TABLE IF NOT EXISTS admin_action_log (
    id TEXT PRIMARY KEY,
    admin TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Saved Jobs Table (Prepared for user accounts)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- 10. Job Alerts Table (Prepared for notification system)
CREATE TABLE IF NOT EXISTS job_alerts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    keyword TEXT,
    country_code TEXT REFERENCES countries(code),
    category_id TEXT REFERENCES categories(id),
    sponsorship_label TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
