import { NormalizedJob } from "../types/job";
import { RemoteType, EmploymentType } from "../types/database";

// Geographic city/region dictionary for validation
const CITY_TO_COUNTRY: Record<string, string> = {
  // India
  mumbai: "IN",
  delhi: "IN",
  bangalore: "IN",
  bengaluru: "IN",
  hyderabad: "IN",
  pune: "IN",
  chennai: "IN",
  kolkata: "IN",

  // United Kingdom
  london: "GB",
  manchester: "GB",
  birmingham: "GB",
  edinburgh: "GB",
  glasgow: "GB",
  bristol: "GB",
  leeds: "GB",
  cambridge: "GB",
  oxford: "GB",

  // United States
  "new york": "US",
  "san francisco": "US",
  austin: "US",
  seattle: "US",
  chicago: "US",
  boston: "US",
  denver: "US",
  losangeles: "US",
  "los angeles": "US",
  springfield: "US",
  indianapolis: "US",

  // Canada
  toronto: "CA",
  vancouver: "CA",
  montreal: "CA",
  calgary: "CA",
  ottawa: "CA",
  oakbank: "CA",

  // Australia
  sydney: "AU",
  melbourne: "AU",
  brisbane: "AU",
  perth: "AU",
  adelaide: "AU",

  // New Zealand
  auckland: "NZ",
  wellington: "NZ",
  christchurch: "NZ",
  whangarei: "NZ",
};

export interface LocationValidationResult {
  isValid: boolean;
  normalizedCountryCode: string;
  locationConfidence: number; // 0 to 100
  requiresReview: boolean;
  anomalyReason?: string;
}

export class NormalizationEngine {
  /**
   * Validates geographic consistency between declared location text and country code
   */
  static validateLocationConsistency(
    rawLocation: string = "",
    declaredCountryCode: string = ""
  ): LocationValidationResult {
    const locLower = (rawLocation || "").toLowerCase();
    const declaredCode = (declaredCountryCode || "").toUpperCase().trim();

    // Check if location text contains known cities
    let detectedCountry: string | null = null;

    for (const [city, cCode] of Object.entries(CITY_TO_COUNTRY)) {
      if (locLower.includes(city)) {
        detectedCountry = cCode;
        break;
      }
    }

    if (!detectedCountry) {
      if (locLower.includes("united kingdom") || locLower.includes("england") || locLower.includes("scotland")) {
        detectedCountry = "GB";
      } else if (locLower.includes("united states") || locLower.includes("usa") || locLower.includes("california") || locLower.includes("texas")) {
        detectedCountry = "US";
      } else if (locLower.includes("canada") || locLower.includes("ontario") || locLower.includes("british columbia")) {
        detectedCountry = "CA";
      } else if (locLower.includes("australia") || locLower.includes("nsw") || locLower.includes("victoria")) {
        detectedCountry = "AU";
      } else if (locLower.includes("new zealand") || locLower.includes("nz")) {
        detectedCountry = "NZ";
      } else if (locLower.includes("india") || locLower.includes("ind")) {
        detectedCountry = "IN";
      }
    }

    // Check for conflict (e.g. Mumbai, IND paired with countryCode US)
    if (detectedCountry && declaredCode && detectedCountry !== declaredCode) {
      return {
        isValid: false,
        normalizedCountryCode: detectedCountry,
        locationConfidence: 20,
        requiresReview: true,
        anomalyReason: `Geographic contradiction: Location text '${rawLocation}' indicates ${detectedCountry}, but declared country_code was ${declaredCode}.`,
      };
    }

    const finalCode = detectedCountry || declaredCode || "GB";
    return {
      isValid: true,
      normalizedCountryCode: finalCode,
      locationConfidence: detectedCountry ? 100 : 70,
      requiresReview: false,
    };
  }

  /**
   * Normalizes URLs while safely preserving identifying tokens
   */
  static normalizeUrl(rawUrl: string): {
    originalUrl: string;
    normalizedUrl: string;
    canonicalUrl: string;
  } {
    if (!rawUrl) return { originalUrl: "", normalizedUrl: "", canonicalUrl: "" };

    try {
      const u = new URL(rawUrl);
      
      // Clean duplicate slashes in pathname
      u.pathname = u.pathname.replace(/\/+/g, "/");

      // Canonical URL strips tracking params
      const canonical = new URL(u.toString());
      const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
      trackingParams.forEach((tp) => canonical.searchParams.delete(tp));

      return {
        originalUrl: rawUrl,
        normalizedUrl: u.toString(),
        canonicalUrl: canonical.toString(),
      };
    } catch {
      return {
        originalUrl: rawUrl,
        normalizedUrl: rawUrl,
        canonicalUrl: rawUrl,
      };
    }
  }

  /**
   * Normalizes remote and employment types
   */
  static normalizeTypes(rawRemote?: string, rawEmployment?: string): {
    remoteType: RemoteType;
    employmentType: EmploymentType;
  } {
    let remoteType: RemoteType = "UNKNOWN";
    const rLower = (rawRemote || "").toLowerCase();
    if (rLower.includes("remote") || rLower.includes("work from home") || rLower.includes("wfh")) {
      remoteType = "REMOTE";
    } else if (rLower.includes("hybrid") || rLower.includes("flexible")) {
      remoteType = "HYBRID";
    } else if (rLower.includes("onsite") || rLower.includes("in office") || rLower.includes("on-site")) {
      remoteType = "ONSITE";
    }

    let employmentType: EmploymentType = "FULL_TIME";
    const eLower = (rawEmployment || "").toLowerCase();
    if (eLower.includes("part") || eLower.includes("part-time")) {
      employmentType = "PART_TIME";
    } else if (eLower.includes("contract") || eLower.includes("freelance") || eLower.includes("ftc")) {
      employmentType = "CONTRACT";
    } else if (eLower.includes("intern")) {
      employmentType = "INTERNSHIP";
    }

    return { remoteType, employmentType };
  }
}
