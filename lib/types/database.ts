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

export type SourcePermissionStatus = 'REVIEW_REQUIRED' | 'APPROVED' | 'RESTRICTED' | 'BLOCKED' | 'DISABLED';

export type SourceType =
  | 'OFFICIAL_API'
  | 'OFFICIAL_RSS'
  | 'OFFICIAL_XML'
  | 'OFFICIAL_JSON'
  | 'PUBLIC_ATS'
  | 'PERMITTED_PUBLIC_HTML';

export type JobAcquisitionStatus =
  | 'draft'
  | 'quarantined'
  | 'review_required'
  | 'active'
  | 'warning'
  | 'unverifiable'
  | 'expired'
  | 'rejected';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'VERIFIED_WARNING'
  | 'UNVERIFIABLE'
  | 'EXPIRED'
  | 'REJECTED'
  | 'STALE';

export type SponsorshipEvidenceType =
  | 'EXPLICIT_JOB_TEXT'
  | 'EXPLICIT_EMPLOYER_STATEMENT'
  | 'OFFICIAL_VISA_PROGRAM'
  | 'OFFICIAL_EMPLOYER_POLICY'
  | 'HISTORICAL_SPONSORSHIP'
  | 'COMPANY_LEVEL_SIGNAL'
  | 'KEYWORD_INFERENCE'
  | 'NONE';

export interface SourceRecord {
  id: string;
  name: string;
  type?: string;           // 'api' | 'ats' | 'feed' (backward compatibility)
  domain?: string;
  source_type?: SourceType;
  adapter_name?: string;
  base_url?: string | null;
  api_url?: string | null;
  feed_url?: string | null;
  careers_url?: string | null;
  permission_status?: SourcePermissionStatus;
  robots_allowed?: number;
  automated_access_allowed?: number | null;
  storage_allowed?: number | null;
  republication_allowed?: number | null;
  commercial_use_allowed?: number | null;
  attribution_required: number;
  rate_limit?: number;
  terms_url?: string | null;
  max_requests_per_minute?: number;
  concurrency_limit?: number;
  active?: number;
  enabled?: number;
  trust_score?: number;
  requires_api_key?: number;
  total_jobs_seen?: number;
  total_jobs_imported?: number;
  last_success_at?: string | null;
  last_failure_at?: string | null;
  last_error_at?: string | null;
  last_error_message?: string | null;
  last_checked_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourcePolicyRecord {
  id: string;
  source_id: string;
  robots_url?: string | null;
  robots_checked_at?: string | null;
  robots_allowed: number;
  terms_url?: string | null;
  terms_checked_at?: string | null;
  policy_status: SourcePermissionStatus;
  allows_storage?: number | null;
  allows_republication?: number | null;
  allows_commercial_use?: number | null;
  attribution_required: number;
  crawl_frequency_seconds: number;
  max_requests_per_minute: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrawlRunRecord {
  id: string;
  source_id: string;
  started_at: string;
  finished_at?: string | null;
  discovered_count: number;
  fetched_count: number;
  parsed_count: number;
  verified_count: number;
  published_count: number;
  rejected_count: number;
  expired_count: number;
  error_count: number;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'PAUSED';
  error_summary?: string | null;
  created_at: string;
}

export interface RawJobRecord {
  id: string;
  source_id: string;
  source_job_id?: string | null;
  source_url?: string | null;
  fetched_url?: string | null;
  final_url?: string | null;
  raw_payload: string;
  content_hash?: string | null;
  http_status?: number | null;
  response_content_type?: string | null;
  fetched_at: string;
  parser_version?: string | null;
  processing_status: 'PENDING' | 'PARSED' | 'DUPLICATE' | 'FAILED';
  created_at: string;
}

export interface JobVerificationRecord {
  id: string;
  job_id: string;
  source_reachable?: number | null;
  job_url_reachable?: number | null;
  application_url_reachable?: number | null;
  dns_valid?: number | null;
  https_valid?: number | null;
  http_status?: number | null;
  final_job_url?: string | null;
  final_apply_url?: string | null;
  redirect_count: number;
  job_content_detected: number;
  employer_detected: number;
  title_detected: number;
  location_detected: number;
  closed_signal_detected: number;
  expired_signal_detected: number;
  source_open_status?: string | null;
  verification_score: number;
  verification_status: VerificationStatus;
  failure_reason?: string | null;
  checked_at: string;
  next_check_at?: string | null;
  verifier_version?: string | null;
  created_at: string;
}

export interface JobApplicationCheckRecord {
  id: string;
  job_id: string;
  original_url: string;
  final_url?: string | null;
  http_status?: number | null;
  reachable: number;
  employer_domain_match?: number | null;
  ats_domain_match?: number | null;
  application_form_detected: number;
  login_wall: number;
  captcha_detected: number;
  closed_message_detected: number;
  homepage_redirect: number;
  unrelated_redirect: number;
  verification_status: VerificationStatus;
  checked_at: string;
  created_at: string;
}

export interface JobSponsorshipEvidenceRecord {
  id: string;
  job_id: string;
  evidence_type: SponsorshipEvidenceType;
  evidence_text: string;
  evidence_url?: string | null;
  evidence_source?: string | null;
  evidence_date?: string | null;
  confidence: number;
  verified: number;
  created_at: string;
}

export interface JobStatusHistoryRecord {
  id: string;
  job_id: string;
  old_status?: string | null;
  new_status?: string | null;
  reason?: string | null;
  triggered_by?: string | null;
  verification_id?: string | null;
  created_at: string;
}

export interface JobUrlHistoryRecord {
  id: string;
  job_id: string;
  url_type: 'JOB_URL' | 'APPLY_URL' | 'CANONICAL_URL';
  url: string;
  http_status?: number | null;
  final_url?: string | null;
  health_status: 'LIVE' | 'REDIRECT' | 'WARNING' | 'DEAD' | 'UNVERIFIABLE';
  checked_at: string;
  created_at: string;
}

export interface JobRecord {
  id: string;
  source_id: string;
  source_job_id: string;
  canonical_hash: string;
  canonical_url?: string | null;
  title: string;
  company_id: string;
  description: string;
  description_clean: string | null;
  location: string | null;
  city: string | null;
  region: string | null;
  country_code: string;
  location_confidence?: number | null;
  postal_code: string | null;
  remote_type: RemoteType;
  employment_type: EmploymentType;
  category_id: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  job_url: string;
  apply_url: string;
  original_apply_url?: string | null;
  normalized_apply_url?: string | null;
  source_url: string | null;
  published_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  expires_at: string | null;
  last_verified_at?: string | null;
  next_verification_at?: string | null;
  verification_expires_at?: string | null;
  verification_status?: VerificationStatus;
  verification_score?: number | null;
  sponsorship_score: number;
  sponsorship_confidence?: number | null;
  sponsorship_evidence_level?: SponsorshipEvidenceType | null;
  sponsorship_label: SponsorshipLabel;
  sponsorship_positive_evidence: string | null; // JSON string array
  sponsorship_negative_evidence: string | null; // JSON string array
  visa_keywords: string | null;                 // JSON string array
  quality_score: number;
  status: JobAcquisitionStatus;
  is_published: number;                         // 1 = Visible to public, 0 = Internal / Quarantine / Expired
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

export interface CandidateProfileRecord {
  id: string;
  user_id: string | null;
  candidate_email: string | null;
  primary_occupation: string;
  primary_soc_code: string | null;
  seniority: string;
  total_experience_years: number;
  highest_degree: string;
  degree_field: string;
  detected_skills: string[]; // JSON array
  preferred_country: string;
  sponsorship_preference: "required" | "preferred" | "not_required" | "any";
  profile_version: number;
  created_at: string;
  updated_at: string;
}

export type RecommendationTier = "EXCELLENT" | "STRONG" | "GOOD" | "POTENTIAL" | "LOW";

export interface JobRecommendationRecord {
  id: string;
  candidate_id: string;
  job_id: string;
  job_match_score: number;
  sponsorjob_match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  occupation_match_score: number;
  seniority_match_score: number;
  location_match_score: number;
  education_match_score: number;
  sponsorship_score: number;
  data_quality_score: number;
  ranking_position: number;
  recommendation_tier: RecommendationTier;
  matched_skills: string[];
  missing_skills: string[];
  reasons: string[];
  sponsorship_status: "CONFIRMED" | "LIKELY" | "UNKNOWN" | "NOT_AVAILABLE";
  algorithm_version: string;
  job_dataset_version: string;
  created_at: string;
}

export interface ShortlistRequestRecord {
  id: string;
  candidate_id?: string | null;
  email: string;
  target_country: string;
  target_role: string;
  sponsorship_preference: string;
  minimum_match_score: number;
  skills_snapshot: string; // JSON
  status: "ACTIVE" | "PAUSED" | "FULFILLED" | "UNSUBSCRIBED";
  created_at: string;
  updated_at: string;
}

export interface ShortlistMatchRecord {
  id: string;
  shortlist_request_id: string;
  job_id: string;
  match_score: number;
  sponsorship_score: number;
  status: "PENDING" | "SENT" | "CLICKED";
  created_at: string;
  sent_at: string | null;
}

export interface RecommendationFeedbackRecord {
  id: string;
  candidate_id: string;
  job_id: string;
  feedback_type: "HELPFUL" | "NOT_RELEVANT";
  reason?: "WRONG_OCCUPATION" | "WRONG_SKILLS" | "TOO_SENIOR" | "TOO_JUNIOR" | "LOCATION" | "SALARY" | "SPONSORSHIP" | "ALREADY_APPLIED" | "OTHER";
  created_at: string;
}

