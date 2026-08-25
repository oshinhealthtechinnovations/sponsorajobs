import { RulePattern } from "@/lib/types/sponsorship";

/**
 * Comprehensive Sponsorship Rules Engine Dictionary
 * As specified in Master Build Prompt Sections 18, 19, 21, 104, 142, 143, 144
 */

export const POSITIVE_SPONSORSHIP_PATTERNS: RulePattern[] = [
  // High confidence positive indicators (+90 to +100)
  {
    id: "pos_explicit_available",
    pattern: /\b(?:visa\s+sponsorship\s+is\s+available|explicit\s+sponsorship\s+available|we\s+offer\s+visa\s+sponsorship|visa\s+sponsorship\s+provided)\b/i,
    weight: 100,
    category: "positive",
    description: "Explicit visa sponsorship offered"
  },
  {
    id: "pos_visa_sponsorship_available",
    pattern: /\b(?:visa\s+sponsorship\s+available|sponsorship\s+is\s+available|sponsorship\s+available|will\s+provide\s+visa\s+sponsorship|visa\s+sponsorship\s+offered)\b/i,
    weight: 90,
    category: "positive",
    description: "Visa sponsorship available"
  },
  {
    id: "pos_will_sponsor",
    pattern: /\b(?:employer\s+will\s+sponsor|company\s+will\s+sponsor|we\s+will\s+sponsor|will\s+sponsor\s+(?:the\s+right\s+candidate|visas?|foreign\s+workers?))\b/i,
    weight: 85,
    category: "positive",
    description: "Employer directly states they will sponsor"
  },
  {
    id: "pos_work_visa_sponsorship",
    pattern: /\b(?:work\s+visa\s+sponsorship|work\s+permit\s+sponsorship|sponsorship\s+for\s+the\s+right\s+candidate|employer\s+sponsored\s+position|employer\s+sponsorship\s+available)\b/i,
    weight: 75,
    category: "positive",
    description: "Work visa sponsorship mentioned"
  },
  {
    id: "pos_immigration_support",
    pattern: /\b(?:immigration\s+support\s+provided|relocation\s+and\s+visa\s+assistance|visa\s+assistance\s+provided|visa\s+support\s+and\s+relocation|full\s+visa\s+support|immigration\s+support)\b/i,
    weight: 75,
    category: "positive",
    description: "Immigration & visa support/assistance"
  },

  // Country specific patterns (+75 to +85)
  // UK
  {
    id: "uk_skilled_worker",
    pattern: /\b(?:skilled\s+worker\s+visa|skilled\s+worker\s+sponsorship|certificate\s+of\s+sponsorship|\bcos\b|tier\s+2\s+sponsorship|home\s+office\s+sponsor\s+licen[cs]e|health\s+and\s+care\s+worker\s+visa)\b/i,
    weight: 80,
    category: "country_specific",
    countryCode: "GB",
    description: "UK Skilled Worker / CoS / Sponsor Licence"
  },
  // USA
  {
    id: "us_h1b_greencard",
    pattern: /\b(?:h-?1b\s+sponsorship|h-?1b\s+transfer|h-?1b\s+cap-exempt|green\s+card\s+sponsorship|o-?1\s+sponsorship|employment-based\s+sponsorship|e-?3\s+visa\s+support|tn\s+visa\s+sponsorship)\b/i,
    weight: 80,
    category: "country_specific",
    countryCode: "US",
    description: "US H-1B / Green Card / O-1 sponsorship"
  },
  // Australia
  {
    id: "au_tss_482_186",
    pattern: /\b(?:subclass\s+482|subclass\s+186|subclass\s+494|skills\s+in\s+demand\s+visa|tss\s+visa|standard\s+business\s+sponsor|employer\s+nomination\s+scheme)\b/i,
    weight: 80,
    category: "country_specific",
    countryCode: "AU",
    description: "Australia Subclass 482 / 186 / Skills in Demand"
  },
  // Canada
  {
    id: "ca_lmia_foreign_worker",
    pattern: /\b(?:lmia\s+supported|lmia\s+exempt|positive\s+lmia|temporary\s+foreign\s+worker|provincial\s+nominee\s+program|\bpnp\b\s+sponsorship|work\s+permit\s+support)\b/i,
    weight: 80,
    category: "country_specific",
    countryCode: "CA",
    description: "Canada LMIA / TFWP / PNP"
  },
  // New Zealand
  {
    id: "nz_aewv_accredited",
    pattern: /\b(?:accredited\s+employer\s+work\s+visa|\baewv\b|inz\s+accredited\s+employer|green\s+list\s+tier\s+1|straight\s+to\s+residence\s+pathway)\b/i,
    weight: 80,
    category: "country_specific",
    countryCode: "NZ",
    description: "New Zealand AEWV / Accredited Employer"
  }
];

export const NEGATIVE_SPONSORSHIP_PATTERNS: RulePattern[] = [
  {
    id: "neg_explicitly_no_sponsorship",
    pattern: /\b(?:no\s+visa\s+sponsorship(?:\s+is\s+available|\s+offered|\s+provided)?|sponsorship\s+is\s+not\s+available|not\s+offering\s+sponsorship|unable\s+to\s+sponsor|we\s+do\s+not\s+sponsor|cannot\s+sponsor|cannot\s+provide\s+sponsorship|not\s+able\s+to\s+sponsor|we\s+are\s+unable\s+to\s+offer\s+sponsorship|we\s+cannot\s+provide\s+visa\s+support)\b/i,
    weight: -100,
    category: "negative",
    description: "Explicitly no sponsorship offered"
  },
  {
    id: "neg_unrestricted_auth",
    pattern: /\b(?:must\s+have\s+unrestricted\s+work\s+authorization|must\s+already\s+have\s+(?:the\s+)?right\s+to\s+work|candidates\s+must\s+have\s+a\s+valid\s+visa|must\s+be\s+authorized\s+to\s+work\s+without\s+sponsorship|no\s+sponsorship\s+now\s+or\s+in\s+the\s+future|requires\s+existing\s+right\s+to\s+work|must\s+be\s+legally\s+eligible\s+to\s+work\s+without\s+visa\s+assistance)\b/i,
    weight: -80,
    category: "negative",
    description: "Work authorization required / No sponsorship future"
  },
  {
    id: "neg_citizens_permanent_only",
    pattern: /\b(?:citizens\s+or\s+permanent\s+residents\s+only|us\s+citizenship\s+required|uk\s+nationals\s+only|australian\s+citizens\s+only|canadian\s+citizens\s+or\s+permanent\s+residents\s+only|security\s+clearance\s+requires\s+citizenship|must\s+be\s+a\s+citizen\s+or\s+permanent\s+resident)\b/i,
    weight: -90,
    category: "negative",
    description: "Citizenship/PR required exclusively"
  }
];

export const AMBIGUOUS_SPONSORSHIP_PATTERNS: RulePattern[] = [
  {
    id: "amb_may_be_considered",
    pattern: /\b(?:(?:visa\s+(?:support|assistance)|sponsorship)\s+may\s+be\s+(?:considered|available)|potential\s+(?:visa\s+support|sponsorship)|(?:sponsorship|visa\s+support|visa\s+assistance)\s+considered\s+on\s+a\s+case-by-case\s+basis|may\s+sponsor\s+qualified\s+applicants)\b/i,
    weight: 45,
    category: "ambiguous",
    description: "Ambiguous / may be considered"
  }
];
