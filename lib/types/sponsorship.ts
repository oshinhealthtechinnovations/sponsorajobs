import { SponsorshipLabel } from "./database";

export interface SponsorshipAnalysisResult {
  score: number;
  label: SponsorshipLabel;
  positiveEvidence: string[];
  negativeEvidence: string[];
  keywords: string[];
  requiresReview: boolean;
}

export interface RulePattern {
  id: string;
  pattern: RegExp | string;
  weight: number;
  category: 'positive' | 'negative' | 'country_specific' | 'ambiguous';
  description: string;
  countryCode?: 'GB' | 'US' | 'AU' | 'CA' | 'NZ';
}
