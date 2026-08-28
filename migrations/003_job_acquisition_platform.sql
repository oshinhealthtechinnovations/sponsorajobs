-- SponsorAJobs Migration 003: Job Acquisition & Verification Platform Architecture
-- Implements Master Specification Version 1.0 (Parts 3-27, 37-39)

-- 1. Enhanced Sources Table
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    source_type TEXT NOT NULL,          -- OFFICIAL_API, OFFICIAL_RSS, OFFICIAL_XML, OFFICIAL_JSON, PUBLIC_ATS, PERMITTED_PUBLIC_HTML
    adapter_name TEXT NOT NULL,
    api_url TEXT,
    feed_url TEXT,
    careers_url TEXT,
    permission_status TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED', -- REVIEW_REQUIRED, APPROVED, RESTRICTED, BLOCKED, DISABLED
    robots_allowed INTEGER NOT NULL DEFAULT 0,
    automated_access_allowed INTEGER,
    storage_allowed INTEGER,
    republication_allowed INTEGER,
    commercial_use_allowed INTEGER,
    attribution_required INTEGER NOT NULL DEFAULT 0,
    max_requests_per_minute INTEGER NOT NULL DEFAULT 10,
    concurrency_limit INTEGER NOT NULL DEFAULT 1,
    enabled INTEGER NOT NULL DEFAULT 0,  -- Only 1 when permission_status = 'APPROVED'
    trust_score INTEGER NOT NULL DEFAULT 0,
    last_success_at TEXT,
    last_failure_at TEXT,
    last_checked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Source Policies Table
CREATE TABLE IF NOT EXISTS source_policies (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    robots_url TEXT,
    robots_checked_at TEXT,
    robots_allowed INTEGER NOT NULL DEFAULT 0,
    terms_url TEXT,
    terms_checked_at TEXT,
    policy_status TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
    allows_storage INTEGER,
    allows_republication INTEGER,
    allows_commercial_use INTEGER,
    attribution_required INTEGER DEFAULT 0,
    crawl_frequency_seconds INTEGER DEFAULT 21600, -- 6 hours default
    max_requests_per_minute INTEGER DEFAULT 10,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crawl Runs Table
CREATE TABLE IF NOT EXISTS crawl_runs (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id),
    started_at TEXT NOT NULL,
    finished_at TEXT,
    discovered_count INTEGER DEFAULT 0,
    fetched_count INTEGER DEFAULT 0,
    parsed_count INTEGER DEFAULT 0,
    verified_count INTEGER DEFAULT 0,
    published_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    expired_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'RUNNING',      -- RUNNING, SUCCESS, FAILED, PARTIAL, PAUSED
    error_summary TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Raw Ingestion Layer (Never lose raw source response)
CREATE TABLE IF NOT EXISTS raw_jobs (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id),
    source_job_id TEXT,
    source_url TEXT,
    fetched_url TEXT,
    final_url TEXT,
    raw_payload TEXT NOT NULL,          -- Original untouched JSON / XML / HTML string
    content_hash TEXT,
    http_status INTEGER,
    response_content_type TEXT,
    fetched_at TEXT NOT NULL,
    parser_version TEXT,
    processing_status TEXT DEFAULT 'PENDING', -- PENDING, PARSED, DUPLICATE, FAILED
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Job URL Verifications Table
CREATE TABLE IF NOT EXISTS job_verifications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    source_reachable INTEGER,
    job_url_reachable INTEGER,
    application_url_reachable INTEGER,
    dns_valid INTEGER,
    https_valid INTEGER,
    http_status INTEGER,
    final_job_url TEXT,
    final_apply_url TEXT,
    redirect_count INTEGER DEFAULT 0,
    job_content_detected INTEGER DEFAULT 0,
    employer_detected INTEGER DEFAULT 0,
    title_detected INTEGER DEFAULT 0,
    location_detected INTEGER DEFAULT 0,
    closed_signal_detected INTEGER DEFAULT 0,
    expired_signal_detected INTEGER DEFAULT 0,
    source_open_status TEXT,
    verification_score INTEGER DEFAULT 0,
    verification_status TEXT NOT NULL, -- UNVERIFIED, VERIFYING, VERIFIED, VERIFIED_WARNING, UNVERIFIABLE, EXPIRED, REJECTED
    failure_reason TEXT,
    checked_at TEXT NOT NULL,
    next_check_at TEXT,
    verifier_version TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. Job Application Checks Table
CREATE TABLE IF NOT EXISTS job_application_checks (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    original_url TEXT NOT NULL,
    final_url TEXT,
    http_status INTEGER,
    reachable INTEGER DEFAULT 0,
    employer_domain_match INTEGER,
    ats_domain_match INTEGER,
    application_form_detected INTEGER DEFAULT 0,
    login_wall INTEGER DEFAULT 0,
    captcha_detected INTEGER DEFAULT 0,
    closed_message_detected INTEGER DEFAULT 0,
    homepage_redirect INTEGER DEFAULT 0,
    unrelated_redirect INTEGER DEFAULT 0,
    verification_status TEXT NOT NULL,
    checked_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 7. Job Sponsorship Evidence Table (Separates Confirmed vs Inference)
CREATE TABLE IF NOT EXISTS job_sponsorship_evidence (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    evidence_type TEXT NOT NULL,        -- EXPLICIT_JOB_TEXT, EXPLICIT_EMPLOYER_STATEMENT, OFFICIAL_VISA_PROGRAM, OFFICIAL_EMPLOYER_POLICY, HISTORICAL_SPONSORSHIP, COMPANY_LEVEL_SIGNAL, KEYWORD_INFERENCE, NONE
    evidence_text TEXT NOT NULL,
    evidence_url TEXT,
    evidence_source TEXT,
    evidence_date TEXT,
    confidence INTEGER DEFAULT 0,       -- 0 to 100
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 8. Job Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS job_status_history (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    reason TEXT,
    triggered_by TEXT,                  -- system_verifier, ingestion_pipeline, admin_override, expiration_worker
    verification_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 9. Job URL History Table (Tracking Redirects & Mutations)
CREATE TABLE IF NOT EXISTS job_url_history (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    url_type TEXT NOT NULL,             -- JOB_URL, APPLY_URL, CANONICAL_URL
    url TEXT NOT NULL,
    http_status INTEGER,
    final_url TEXT,
    health_status TEXT,                 -- LIVE, REDIRECT, WARNING, DEAD, UNVERIFIABLE
    checked_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_raw_jobs_source_status ON raw_jobs(source_id, processing_status);
CREATE INDEX IF NOT EXISTS idx_job_verifications_job_id ON job_verifications(job_id, checked_at);
CREATE INDEX IF NOT EXISTS idx_job_application_checks_job ON job_application_checks(job_id);
CREATE INDEX IF NOT EXISTS idx_job_status_history_job ON job_status_history(job_id);
CREATE INDEX IF NOT EXISTS idx_job_sponsorship_evidence_job ON job_sponsorship_evidence(job_id);
