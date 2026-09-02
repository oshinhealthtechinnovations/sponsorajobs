/**
 * Free RestCountries Intelligence Service
 * Powered by open public RestCountries API (https://restcountries.com/v3.1/)
 * 100% Free, Zero API Keys, Zero Rate Limits.
 */

export interface CountryIntelligenceProfile {
  code: string;
  name: string;
  officialName: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  formattedPopulation: string;
  languages: string[];
  currencies: { code: string; name: string; symbol: string }[];
  timezones: string[];
  flagEmoji: string;
  coatOfArmsUrl?: string;
  borders: string[];
  drivingSide: string;
  callingCode: string;
  visaHighlights: {
    workPermitType: string;
    minimumSalaryThreshold: string;
    processingTime: string;
    prPathway: string;
  };
}

const STATIC_COUNTRY_PROFILES: Record<string, CountryIntelligenceProfile> = {
  GB: {
    code: "GB",
    name: "United Kingdom",
    officialName: "United Kingdom of Great Britain and Northern Ireland",
    capital: "London",
    region: "Europe",
    subregion: "Northern Europe",
    population: 67330000,
    formattedPopulation: "67.3M",
    languages: ["English"],
    currencies: [{ code: "GBP", name: "British Pound", symbol: "£" }],
    timezones: ["UTC+00:00 (GMT/BST)"],
    flagEmoji: "🇬🇧",
    borders: ["Ireland"],
    drivingSide: "Left",
    callingCode: "+44",
    visaHighlights: {
      workPermitType: "Skilled Worker Visa (formerly Tier 2)",
      minimumSalaryThreshold: "£38,700/year (or going rate)",
      processingTime: "3 - 8 weeks",
      prPathway: "Indefinite Leave to Remain (ILR) after 5 years",
    },
  },
  US: {
    code: "US",
    name: "United States",
    officialName: "United States of America",
    capital: "Washington, D.C.",
    region: "Americas",
    subregion: "North America",
    population: 333300000,
    formattedPopulation: "333.3M",
    languages: ["English"],
    currencies: [{ code: "USD", name: "United States Dollar", symbol: "$" }],
    timezones: ["UTC-05:00 to UTC-10:00"],
    flagEmoji: "🇺🇸",
    borders: ["Canada", "Mexico"],
    drivingSide: "Right",
    callingCode: "+1",
    visaHighlights: {
      workPermitType: "H-1B Specialty Occupation / O-1 / L-1",
      minimumSalaryThreshold: "Prevailing wage determination by DOL",
      processingTime: "2 - 6 months (Premium: 15 days)",
      prPathway: "Employment-Based Green Card (EB-2 / EB-3)",
    },
  },
  AU: {
    code: "AU",
    name: "Australia",
    officialName: "Commonwealth of Australia",
    capital: "Canberra",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    population: 25690000,
    formattedPopulation: "25.7M",
    languages: ["English"],
    currencies: [{ code: "AUD", name: "Australian Dollar", symbol: "A$" }],
    timezones: ["UTC+08:00 to UTC+10:30"],
    flagEmoji: "🇦🇺",
    borders: [],
    drivingSide: "Left",
    callingCode: "+61",
    visaHighlights: {
      workPermitType: "Subclass 482 Skills in Demand (TSS)",
      minimumSalaryThreshold: "AUD $73,150/year (TSMIT)",
      processingTime: "4 - 8 weeks",
      prPathway: "Subclass 186 Employer Nomination Scheme (ENS)",
    },
  },
  CA: {
    code: "CA",
    name: "Canada",
    officialName: "Canada",
    capital: "Ottawa",
    region: "Americas",
    subregion: "North America",
    population: 38250000,
    formattedPopulation: "38.3M",
    languages: ["English", "French"],
    currencies: [{ code: "CAD", name: "Canadian Dollar", symbol: "C$" }],
    timezones: ["UTC-03:30 to UTC-08:00"],
    flagEmoji: "🇨🇦",
    borders: ["United States"],
    drivingSide: "Right",
    callingCode: "+1",
    visaHighlights: {
      workPermitType: "LMIA Employer-Specific Work Permit / Global Talent Stream",
      minimumSalaryThreshold: "Provincial median wage benchmark",
      processingTime: "2 - 12 weeks (Global Talent: 2 weeks)",
      prPathway: "Express Entry (Canadian Experience Class / PNP)",
    },
  },
  NZ: {
    code: "NZ",
    name: "New Zealand",
    officialName: "New Zealand",
    capital: "Wellington",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    population: 5124000,
    formattedPopulation: "5.1M",
    languages: ["English", "Māori"],
    currencies: [{ code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" }],
    timezones: ["UTC+12:00 (NZST)"],
    flagEmoji: "🇳🇿",
    borders: [],
    drivingSide: "Left",
    callingCode: "+64",
    visaHighlights: {
      workPermitType: "Accredited Employer Work Visa (AEWV)",
      minimumSalaryThreshold: "NZD $29.66/hour (Median Wage rate)",
      processingTime: "4 - 7 weeks",
      prPathway: "Green List Fast-Track & Straight to Residence",
    },
  },
};

export class CountryIntelligenceService {
  /**
   * Retrieves full country intelligence profile with live RestCountries enrichment
   */
  static async getCountryProfile(countryCode: string): Promise<CountryIntelligenceProfile | null> {
    const code = countryCode.toUpperCase().trim();
    const staticProfile = STATIC_COUNTRY_PROFILES[code];

    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`, {
        next: { revalidate: 86400 * 7 }, // cache 7 days
      });

      if (res.ok) {
        const [data] = await res.json();
        if (data) {
          const languages = data.languages ? Object.values(data.languages) as string[] : staticProfile?.languages || ["English"];
          const currencies = data.currencies
            ? Object.entries(data.currencies).map(([cCode, cVal]: [string, any]) => ({
                code: cCode,
                name: cVal.name || cCode,
                symbol: cVal.symbol || cCode,
              }))
            : staticProfile?.currencies || [{ code: "USD", name: "US Dollar", symbol: "$" }];

          const population = data.population || staticProfile?.population || 0;
          const formattedPopulation = population > 1000000
            ? `${(population / 1000000).toFixed(1)}M`
            : `${(population / 1000).toFixed(0)}k`;

          return {
            code,
            name: data.name?.common || staticProfile?.name || code,
            officialName: data.name?.official || staticProfile?.officialName || code,
            capital: data.capital?.[0] || staticProfile?.capital || "Main City",
            region: data.region || staticProfile?.region || "Global",
            subregion: data.subregion || staticProfile?.subregion || "Global",
            population,
            formattedPopulation,
            languages,
            currencies,
            timezones: data.timezones || staticProfile?.timezones || ["UTC"],
            flagEmoji: data.flag || staticProfile?.flagEmoji || "🌐",
            coatOfArmsUrl: data.coatOfArms?.svg || data.coatOfArms?.png,
            borders: data.borders || staticProfile?.borders || [],
            drivingSide: data.car?.side ? data.car.side.charAt(0).toUpperCase() + data.car.side.slice(1) : staticProfile?.drivingSide || "Right",
            callingCode: (data.idd?.root || "") + (data.idd?.suffixes?.[0] || ""),
            visaHighlights: staticProfile?.visaHighlights || {
              workPermitType: "Verified Employer Visa Sponsorship",
              minimumSalaryThreshold: "Market Rate Disclosed in Contract",
              processingTime: "4 - 8 weeks average",
              prPathway: "Permanent Residency pathway available",
            },
          };
        }
      }
    } catch {
      // Fallback
    }

    return staticProfile || null;
  }
}
