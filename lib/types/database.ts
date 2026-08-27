/**
 * Database schema type definitions for SponsorAJobs
 */

export interface CountryRecord {
  id: string;
  code: string;           // ISO 2-letter uppercase: 'GB' | 'US' | 'AU' | 'CA' | 'NZ'
  name: string;           // e.g. 'United Kingdom'
  slug: string;           // e.g. 'uk', 'usa', 'australia', 'canada', 'new-zealand'
  flag: string;           // Emoji flag
  currency: string;       // ISO Currency code: 'GBP', 'USD', 'AUD', 'CAD', 'NZD'
  active: number;         // 1 or 0
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  active: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyRecord {
  id: string;
  name: string;
  normalized_name: string;
  website: string | null;
  careers_url: string | null;
  logo_url: string | null;
  industry: string | null;
  description: string | null;
  country_code: string | null;
  sponsorship_signal: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceRecord {
  id: string;
  name: string;
  type: string;           // 'api' | 'ats' | 'feed'
  base_url: string | null;
  active: number;
  requires_api_key: number;
  rate_limit: number;
  terms_url: string | null;
  attribution_required: number;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  total_jobs_seen: number;
  total_jobs_imported: number;
  created_at: string;
  updated_at: string;
}

export interface CompanySourceConfigRecord {
  id: string;
  company_id: string;
  source_type: string;
  source_identifier: string;
  source_url: string | null;
  active: number;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SponsorshipLabel =
  | 'Strong'
  | 'Likely'
  | 'Possible'
  | 'Weak'
  | 'No Sponsorship Signal'
  | 'Explicitly Not Offered'
  | 'REVIEW_REQUIRED';

export type RemoteType = 'ONSITE' | 'HYBRID' | 'REMOTE' | 'UNKNOWN';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'TEMPORARY'
  | 'INTERNSHIP'
  | 'APPRENTICESHIP'
  | 'OTHER'
  | 'UNKNOWN';

export interface JobRecord {
  id: string;
  source_id: string;
  source_job_id: string;
  canonical_hash: string;
  title: string;
  company_id: string;
  description: string;
  description_clean: string | null;
  location: string | null;
  city: string | null;
  region: string | null;
  country_code: string;
  postal_code: string | null;
  remote_type: RemoteType;
  employment_type: EmploymentType;
  category_id: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  job_url: string;
  apply_url: string;
  source_url: string | null;
  published_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  expires_at: string | null;
  sponsorship_score: number;
  sponsorship_label: SponsorshipLabel;
  sponsorship_positive_evidence: string | null; // JSON string array
  sponsorship_negative_evidence: string | null; // JSON string array
  visa_keywords: string | null;                 // JSON string array
  quality_score: number;
  status: 'active' | 'expired' | 'rejected' | 'draft' | 'review_required';
  is_featured: number;
  created_at: string;
  updated_at: string;
}

export interface SourceRunRecord {
  id: string;
  source_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'failed' | 'partial';
  jobs_fetched: number;
  jobs_inserted: number;
  jobs_updated: number;
  jobs_rejected: number;
  jobs_duplicates: number;
  error_message: string | null;
}

export interface AdminActionLogRecord {
  id: string;
  admin: string;
  action: string;
  entity: string;
  entity_id: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
}

export interface CVAnalysisRecord {
  id: string;
  user_id: string | null;
  candidate_email: string | null;
  candidate_phone: string | null;
  target_country: string;
  target_role: string;
  soc_code: string | null;
  seniority: string;
  highest_degree: string;
  years_experience: number;
  word_count: number;
  overall_score: number;
  cv_quality_score: number;
  ats_compatibility_score: number;
  job_match_score: number;
  sponsorship_score: number;
  parsing_risk: string;
  detected_skills: string;   // JSON array of strings
  missing_skills: string;    // JSON array of strings
  raw_text_snippet: string | null;
  full_result_json: string;  // Serialized FullATSIntelligenceResult
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface CVAggregateStats {
  totalAnalyzed: number;
  averageOverallScore: number;
  averageSponsorshipScore: number;
  topSkills: { skill: string; count: number }[];
  topMissingSkills: { skill: string; count: number }[];
  countryDistribution: { country: string; count: number }[];
  socDistribution: { socCode: string; count: number }[];
  seniorityDistribution: { seniority: string; count: number }[];
}
