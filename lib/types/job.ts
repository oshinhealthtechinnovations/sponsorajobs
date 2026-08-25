import { CountryRecord, CategoryRecord, CompanyRecord, JobRecord, SponsorshipLabel, RemoteType, EmploymentType } from "./database";

/**
 * Normalized Job Model used across the ingestion and application layers
 */
export interface NormalizedJob {
  sourceJobId: string;
  sourceId: string;
  title: string;
  companyName: string;
  companyWebsite?: string;
  companyCareersUrl?: string;
  companyLogoUrl?: string;
  companyIndustry?: string;
  description: string;
  descriptionClean?: string;
  location?: string;
  city?: string;
  region?: string;
  countryCode: string;
  postalCode?: string;
  remoteType: RemoteType;
  employmentType: EmploymentType;
  categorySlug?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobUrl: string;
  applyUrl: string;
  sourceUrl?: string;
  publishedAt?: string;
}

/**
 * Public Job DTO for API & Frontend (never leaks private internal score or raw keys)
 */
export interface PublicJobDTO {
  id: string;
  slug: string;
  title: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
    industry?: string | null;
    website?: string | null;
  };
  location: {
    city?: string | null;
    region?: string | null;
    country: string;
    formatted?: string | null;
  };
  employmentType: EmploymentType;
  remoteType: RemoteType;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  salary?: {
    min?: number | null;
    max?: number | null;
    currency?: string | null;
  } | null;
  sponsorship: {
    label: SponsorshipLabel;
    evidenceMessage?: string;
    positiveEvidence: string[];
    negativeEvidence: string[];
    visaKeywords: string[];
  };
  postedAt: string | null;
  applyUrl: string;
  sourceName?: string;
  sourceAttributionRequired?: boolean;
}
