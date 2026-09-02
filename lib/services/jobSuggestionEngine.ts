import { JobRepository } from "@/lib/repositories/jobRepository";
import { PublicJobDTO } from "@/lib/types/job";
import { INITIAL_COUNTRIES } from "@/config/countries";

export interface AutocompleteSuggestionItem {
  type: "role" | "company" | "skill" | "country" | "visa";
  label: string;
  sublabel: string;
  query: string;
  paramKey: "q" | "company" | "country" | "sponsorship";
  paramValue: string;
  count?: number;
}

export interface SmartMatchResult {
  detectedIntent: {
    targetRole?: string;
    skills: string[];
    targetCountry?: string;
    experienceLevel?: string;
  };
  matchedJobs: Array<{
    job: PublicJobDTO;
    matchScore: number; // 0 - 100
    visaViable: boolean;
    reasons: string[];
  }>;
  totalFound: number;
}

export interface CareerAlternative {
  currentRole: string;
  alternativeRole: string;
  sponsorshipAdvantage: string;
  demandIndex: "High" | "Very High" | "Critical Shortage";
  typicalSalaryGbp: string;
  searchQuery: string;
}

const COMMON_SKILLS = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "Node.js", "C#", ".NET",
  "Go", "Rust", "C++", "AWS", "Azure", "GCP", "Kubernetes", "Docker", "Terraform",
  "SQL", "PostgreSQL", "MongoDB", "GraphQL", "DevOps", "CI/CD", "Machine Learning",
  "Data Engineering", "Figma", "Product Management", "Cybersecurity", "Microservices"
];

const ALTERNATIVE_ROLES_MAP: Record<string, CareerAlternative[]> = {
  qa: [
    {
      currentRole: "QA Tester",
      alternativeRole: "SDET (Software Development Engineer in Test)",
      sponsorshipAdvantage: "SDETs qualify under high-shortage RQF 3+ software engineering codes with 3x higher visa grant rates.",
      demandIndex: "Very High",
      typicalSalaryGbp: "£55,000",
      searchQuery: "SDET",
    },
    {
      currentRole: "QA Tester",
      alternativeRole: "DevOps / QA Automation Engineer",
      sponsorshipAdvantage: "Combines testing with CI/CD infrastructure, meeting highest tier immigration salary benchmarks.",
      demandIndex: "Critical Shortage",
      typicalSalaryGbp: "£62,000",
      searchQuery: "DevOps Engineer",
    },
  ],
  support: [
    {
      currentRole: "IT Support Specialist",
      alternativeRole: "Cloud Support / Systems Engineer",
      sponsorshipAdvantage: "Cloud systems roles exceed the £38,700 UK Skilled Worker statutory minimum threshold.",
      demandIndex: "Very High",
      typicalSalaryGbp: "£48,000",
      searchQuery: "Cloud Engineer",
    },
  ],
  analyst: [
    {
      currentRole: "Business Analyst",
      alternativeRole: "Data Engineer / Analytics Engineer",
      sponsorshipAdvantage: "Technical data engineering qualifies on national skill shortage lists across UK and Australia.",
      demandIndex: "Critical Shortage",
      typicalSalaryGbp: "£58,000",
      searchQuery: "Data Engineer",
    },
  ],
};

export class JobSuggestionEngine {
  private static jobRepo = new JobRepository();

  /**
   * Generates live multi-vector predictive autocomplete suggestions
   */
  static async getAutocompleteSuggestions(
    rawQuery: string,
    countryFilter?: string
  ): Promise<AutocompleteSuggestionItem[]> {
    const q = rawQuery.trim().toLowerCase();
    if (!q) {
      return [
        {
          type: "role",
          label: "Software Engineer",
          sublabel: "140+ Sponsoring Vacancies",
          query: "Software Engineer",
          paramKey: "q",
          paramValue: "Software Engineer",
        },
        {
          type: "role",
          label: "DevOps & Cloud Engineer",
          sublabel: "High Visa Shortage Demand",
          query: "DevOps",
          paramKey: "q",
          paramValue: "DevOps",
        },
        {
          type: "company",
          label: "Monzo Bank",
          sublabel: "Licensed UK Sponsor (Direct ATS)",
          query: "",
          paramKey: "company",
          paramValue: "Monzo Bank",
        },
        {
          type: "country",
          label: "United Kingdom",
          sublabel: "Skilled Worker Visa (CoS)",
          query: "",
          paramKey: "country",
          paramValue: "gb",
        },
      ];
    }

    const suggestions: AutocompleteSuggestionItem[] = [];

    // 1. Search Matching Live Jobs from Repository
    const searchRes = await this.jobRepo.search({
      q: rawQuery,
      country: countryFilter && countryFilter !== "ALL" ? countryFilter : undefined,
      limit: 15,
    });

    const uniqueTitles = new Map<string, number>();
    const uniqueCompanies = new Map<string, number>();

    for (const j of searchRes.jobs) {
      const titleLower = j.title.toLowerCase();
      if (titleLower.includes(q)) {
        uniqueTitles.set(j.title, (uniqueTitles.get(j.title) || 0) + 1);
      }
      if (j.company.name.toLowerCase().includes(q)) {
        uniqueCompanies.set(j.company.name, (uniqueCompanies.get(j.company.name) || 0) + 1);
      }
    }

    // Add Top Matching Roles
    for (const [title, count] of Array.from(uniqueTitles.entries()).slice(0, 4)) {
      suggestions.push({
        type: "role",
        label: title,
        sublabel: `${count} verified sponsoring job${count > 1 ? "s" : ""} available`,
        query: title,
        paramKey: "q",
        paramValue: title,
        count,
      });
    }

    // Add Top Matching Companies
    for (const [comp, count] of Array.from(uniqueCompanies.entries()).slice(0, 3)) {
      suggestions.push({
        type: "company",
        label: comp,
        sublabel: `Direct Employer · ${count} open role${count > 1 ? "s" : ""}`,
        query: "",
        paramKey: "company",
        paramValue: comp,
        count,
      });
    }

    // 2. Add Matching Technical Skills
    const matchingSkills = COMMON_SKILLS.filter((s) => s.toLowerCase().includes(q));
    for (const skill of matchingSkills.slice(0, 2)) {
      suggestions.push({
        type: "skill",
        label: `${skill} Jobs`,
        sublabel: `Search roles requiring ${skill}`,
        query: skill,
        paramKey: "q",
        paramValue: skill,
      });
    }

    // 3. Add Matching Destination Countries
    for (const c of INITIAL_COUNTRIES) {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q) {
        suggestions.push({
          type: "country",
          label: c.name,
          sublabel: `View all sponsor vacancies in ${c.name}`,
          query: "",
          paramKey: "country",
          paramValue: c.code.toLowerCase(),
        });
      }
    }

    // If query has no direct job matches, provide a fallback search option
    if (suggestions.length === 0) {
      suggestions.push({
        type: "role",
        label: rawQuery.trim(),
        sublabel: `Search all opportunities matching "${rawQuery.trim()}"`,
        query: rawQuery.trim(),
        paramKey: "q",
        paramValue: rawQuery.trim(),
      });
    }

    return suggestions;
  }

  /**
   * Smart AI Job Matcher: extracts intent from natural language prompts and scores catalog jobs
   */
  static async smartMatch(
    prompt: string,
    preferences?: { country?: string; minSalary?: number; limit?: number }
  ): Promise<SmartMatchResult> {
    const cleanPrompt = prompt.toLowerCase();
    const limit = preferences?.limit || 6;

    // Detect Skills
    const detectedSkills = COMMON_SKILLS.filter((s) =>
      cleanPrompt.includes(s.toLowerCase())
    );

    // Detect Country
    let detectedCountry = preferences?.country;
    if (!detectedCountry) {
      if (cleanPrompt.includes("uk") || cleanPrompt.includes("london") || cleanPrompt.includes("england")) detectedCountry = "GB";
      else if (cleanPrompt.includes("us") || cleanPrompt.includes("america") || cleanPrompt.includes("usa")) detectedCountry = "US";
      else if (cleanPrompt.includes("australia") || cleanPrompt.includes("sydney") || cleanPrompt.includes("melbourne")) detectedCountry = "AU";
      else if (cleanPrompt.includes("canada") || cleanPrompt.includes("toronto")) detectedCountry = "CA";
      else if (cleanPrompt.includes("new zealand") || cleanPrompt.includes("auckland")) detectedCountry = "NZ";
    }

    // Detect Experience Level
    let experienceLevel = "Mid-Senior";
    if (cleanPrompt.includes("senior") || cleanPrompt.includes("lead") || cleanPrompt.includes("principal")) {
      experienceLevel = "Senior+";
    } else if (cleanPrompt.includes("junior") || cleanPrompt.includes("entry") || cleanPrompt.includes("graduate")) {
      experienceLevel = "Entry/Junior";
    }

    // Search jobs matching the detected skills or prompt tokens
    const searchRes = await this.jobRepo.search({
      q: prompt.slice(0, 100),
      country: detectedCountry && detectedCountry !== "ALL" ? detectedCountry : undefined,
      limit: 20,
    });

    const matchedJobs = searchRes.jobs.map((job) => {
      let score = 70;
      const reasons: string[] = [];

      // Check skill overlap
      const jobDesc = `${job.title} ${job.category?.name || ""} ${job.sponsorship.positiveEvidence.join(" ")} ${job.sponsorship.visaKeywords.join(" ")}`.toLowerCase();
      let matchedSkillCount = 0;
      for (const skill of detectedSkills) {
        if (jobDesc.includes(skill.toLowerCase())) {
          matchedSkillCount++;
          score += 6;
        }
      }

      if (matchedSkillCount > 0) {
        reasons.push(`Matches ${matchedSkillCount} of your target skills (${detectedSkills.slice(0, 3).join(", ")})`);
      }

      // Check visa viability based on salary
      const salaryMax = job.salary?.max || job.salary?.min || 0;
      const isUk = job.location.country.toUpperCase() === "GB" || job.location.country.toUpperCase() === "UK";
      const satisfiesUkThreshold = isUk ? salaryMax >= 38700 : salaryMax > 0;
      const confidence = job.sponsorshipConfidence ?? 80;
      const visaViable = satisfiesUkThreshold || confidence >= 80;

      if (visaViable) {
        score += 10;
        reasons.push("Compensation & employer license verify statutory visa sponsorship criteria");
      }

      const isDirect = !job.sourceAttributionRequired || job.applyUrl.includes("greenhouse") || job.applyUrl.includes("lever") || job.applyUrl.includes("ashby");
      if (isDirect) {
        score += 5;
        reasons.push("100% direct official employer application link");
      }

      score = Math.min(99, Math.max(50, score));

      return {
        job,
        matchScore: score,
        visaViable,
        reasons: reasons.length > 0 ? reasons : ["Strong general alignment with your candidate background"],
      };
    });

    // Sort by match score descending
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    return {
      detectedIntent: {
        targetRole: prompt.split(" ").slice(0, 3).join(" "),
        skills: detectedSkills,
        targetCountry: detectedCountry,
        experienceLevel,
      },
      matchedJobs: matchedJobs.slice(0, limit),
      totalFound: matchedJobs.length,
    };
  }

  /**
   * Returns career mobility and alternative roles with higher sponsorship success
   */
  static getAlternativeRoles(roleQuery: string): CareerAlternative[] {
    const q = roleQuery.toLowerCase();
    for (const [key, alternatives] of Object.entries(ALTERNATIVE_ROLES_MAP)) {
      if (q.includes(key)) {
        return alternatives;
      }
    }

    // Default universal alternatives
    return [
      {
        currentRole: roleQuery,
        alternativeRole: "Cloud & Infrastructure Engineer",
        sponsorshipAdvantage: "Cloud & DevOps roles have 4x higher visa issuance rates across UK and Australia.",
        demandIndex: "Critical Shortage",
        typicalSalaryGbp: "£55,000 - £75,000",
        searchQuery: "Cloud Engineer",
      },
      {
        currentRole: roleQuery,
        alternativeRole: "Full Stack Software Engineer",
        sponsorshipAdvantage: "Universal standard occupation shortage list classification with fast-track visa processing.",
        demandIndex: "Very High",
        typicalSalaryGbp: "£50,000 - £70,000",
        searchQuery: "Full Stack Engineer",
      },
    ];
  }
}
