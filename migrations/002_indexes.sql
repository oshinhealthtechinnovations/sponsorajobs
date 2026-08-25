-- SponsorAJobs D1 Migration 002: Indexes
-- Performance indexes for fast job search, filtering, deduplication, and SEO pages

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_country_code ON jobs(country_code);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_sponsorship_label ON jobs(sponsorship_label);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_canonical_hash ON jobs(canonical_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON jobs(remote_type);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);

-- Composite indexes for common combined search queries
CREATE INDEX IF NOT EXISTS idx_jobs_country_status ON jobs(country_code, status);
CREATE INDEX IF NOT EXISTS idx_jobs_country_category_status ON jobs(country_code, category_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_country_sponsorship_status ON jobs(country_code, sponsorship_label, status);

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_normalized_name ON companies(normalized_name);
CREATE INDEX IF NOT EXISTS idx_companies_country_code ON companies(country_code);

-- Source runs table indexes
CREATE INDEX IF NOT EXISTS idx_source_runs_source_id ON source_runs(source_id);
CREATE INDEX IF NOT EXISTS idx_source_runs_started_at ON source_runs(started_at DESC);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Countries table indexes
CREATE INDEX IF NOT EXISTS idx_countries_slug ON countries(slug);
