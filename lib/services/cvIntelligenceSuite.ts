/**
 * Free CV Intelligence Suite
 * 
 * Includes:
 * 1. AI Visa Sponsorship Cover Letter & Pitch Generator (OpenRouter Free Tier + Intelligent Local Engine)
 * 2. CV Bullet Point Impact & Action Verb Optimizer
 * 3. Official Immigration SOC / NOC / ANZSCO Occupation Code Matcher
 */

export interface CoverLetterInput {
  candidateName?: string;
  jobTitle: string;
  companyName: string;
  countryCode: string; // UK, US, AU, CA, NZ
  cvText?: string;
  experienceYears?: number;
  keySkills?: string[];
}

export interface CoverLetterResult {
  coverLetter: string;
  subjectLine: string;
  visaHighlights: string;
  keySellingPoints: string[];
  recommendedSponsorshipArguments: string[];
}

export interface BulletOptimizationResult {
  original: string;
  optimized: string;
  score: number; // 0 - 100
  critique: string;
  actionVerbUsed: string;
  metricsPresent: boolean;
}

export interface ImmigrationOccupation {
  title: string;
  ukSocCode: string;
  canadaNocCode: string;
  australiaAnzscoCode: string;
  eligibleVisaRoutes: string[];
  isShortageList: boolean;
  standardMedianSalaryGbp: string;
}

export const IMMIGRATION_OCCUPATIONS: ImmigrationOccupation[] = [
  {
    title: "Software Engineer / Developer",
    ukSocCode: "2136 (Programmers and software development professionals)",
    canadaNocCode: "21232 (Software developers and programmers)",
    australiaAnzscoCode: "261313 (Software Engineer)",
    eligibleVisaRoutes: ["UK Skilled Worker", "US H-1B / O-1", "AU 482 TSS / 186 ENS", "CA Global Talent Stream"],
    isShortageList: true,
    standardMedianSalaryGbp: "£49,400",
  },
  {
    title: "Data Analyst / Data Scientist",
    ukSocCode: "2135 (IT business analysts, architects and systems designers)",
    canadaNocCode: "21211 (Data scientists)",
    australiaAnzscoCode: "261399 (Software and Applications Programmers nec)",
    eligibleVisaRoutes: ["UK Skilled Worker", "US H-1B", "AU 482 TSS", "CA Express Entry"],
    isShortageList: true,
    standardMedianSalaryGbp: "£44,000",
  },
  {
    title: "DevOps / Cloud Infrastructure Engineer",
    ukSocCode: "2139 (Information technology and telecommunications professionals nec)",
    canadaNocCode: "21222 (Information systems specialists)",
    australiaAnzscoCode: "262112 (ICT Security Specialist / Systems Administrator)",
    eligibleVisaRoutes: ["UK Skilled Worker", "US H-1B", "AU 482 TSS", "CA Global Talent Stream"],
    isShortageList: true,
    standardMedianSalaryGbp: "£55,000",
  },
  {
    title: "Civil / Structural Engineer",
    ukSocCode: "2121 (Civil engineers)",
    canadaNocCode: "21300 (Civil engineers)",
    australiaAnzscoCode: "233211 (Civil Engineer)",
    eligibleVisaRoutes: ["UK Skilled Worker", "AU 482 TSS / DAMA", "CA Express Entry"],
    isShortageList: true,
    standardMedianSalaryGbp: "£42,500",
  },
  {
    title: "Registered Nurse / Healthcare Specialist",
    ukSocCode: "2231 (Nurses)",
    canadaNocCode: "31301 (Registered nurses and registered psychiatric nurses)",
    australiaAnzscoCode: "254499 (Registered Nurses nec)",
    eligibleVisaRoutes: ["UK Health and Care Worker Visa", "AU 482 / 189", "CA Healthcare Category-Based PR"],
    isShortageList: true,
    standardMedianSalaryGbp: "£36,000",
  },
  {
    title: "Product Manager / Tech Lead",
    ukSocCode: "2134 (IT project and programme managers)",
    canadaNocCode: "20012 (Computer and information systems managers)",
    australiaAnzscoCode: "135112 (ICT Project Manager)",
    eligibleVisaRoutes: ["UK Skilled Worker / Global Talent", "US H-1B / L-1", "AU 482 TSS", "CA Express Entry"],
    isShortageList: false,
    standardMedianSalaryGbp: "£58,000",
  },
  {
    title: "Mechanical Engineer",
    ukSocCode: "2122 (Mechanical engineers)",
    canadaNocCode: "21301 (Mechanical engineers)",
    australiaAnzscoCode: "233512 (Mechanical Engineer)",
    eligibleVisaRoutes: ["UK Skilled Worker", "AU 482 TSS", "CA Express Entry"],
    isShortageList: true,
    standardMedianSalaryGbp: "£41,000",
  },
];

const STRONG_ACTION_VERBS = [
  "Architected",
  "Spearheaded",
  "Engineered",
  "Orchestrated",
  "Accelerated",
  "Optimized",
  "Automated",
  "Delivered",
  "Pioneered",
  "Transformed",
  "Scaled",
  "Consolidated",
  "Designed",
  "Implemented",
];

export class CvIntelligenceSuite {
  /**
   * Generates a tailored Visa Sponsorship Cover Letter
   */
  static async generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterResult> {
    const candidateName = input.candidateName || "Candidate";
    const country = (input.countryCode || "UK").toUpperCase();
    const skillsList = input.keySkills && input.keySkills.length > 0
      ? input.keySkills.join(", ")
      : "advanced technical problem-solving, modern architecture, and cross-functional leadership";

    const visaTarget =
      country === "US"
        ? "H-1B / O-1 visa sponsorship"
        : country === "AU"
        ? "Subclass 482 Skills in Demand (TSS) visa sponsorship"
        : country === "CA"
        ? "Global Talent Stream / LMIA work permit sponsorship"
        : country === "NZ"
        ? "Accredited Employer Work Visa (AEWV)"
        : "UK Skilled Worker Visa (Certificate of Sponsorship - CoS)";

    const legalImmigrationStatement =
      country === "UK"
        ? "I have confirmed that this role satisfies the UK Home Office standard skill level (RQF 3+) and salary thresholds. I am fully prepared to relocate with my valid English proficiency and requisite documentation ready for immediate CoS assignment."
        : country === "US"
        ? "I have verified that my academic background and specialty domain qualify under USCIS specialty occupation guidelines, and I am prepared to facilitate seamless petition filing."
        : "I have verified all immigration prerequisite requirements for this jurisdiction and am ready for immediate transition with minimal administrative lead time.";

    // Try OpenRouter AI if configured
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://sponsorajobs.com",
            "X-Title": "SponsorAJobs AI CV Assistant",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [
              {
                role: "system",
                content: `You are an elite international executive career strategist specializing in visa sponsorship applications for top global employers in ${country}. Write a compelling, high-converting cover letter that directly addresses the employer's visa sponsorship process while demonstrating exceptional technical capability.`,
              },
              {
                role: "user",
                content: `Write a visa sponsorship cover letter for:
Candidate: ${candidateName}
Position: ${input.jobTitle}
Company: ${input.companyName}
Target Country: ${country} (${visaTarget})
Experience: ${input.experienceYears || 5} years
Key Skills: ${skillsList}
CV Snippet: ${input.cvText ? input.cvText.slice(0, 800) : "Experienced professional with proven track record"}`,
              },
            ],
            temperature: 0.4,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiLetter = data.choices?.[0]?.message?.content;
          if (aiLetter && aiLetter.length > 200) {
            return {
              coverLetter: aiLetter.trim(),
              subjectLine: `Application: ${input.jobTitle} at ${input.companyName} – ${candidateName} (${visaTarget})`,
              visaHighlights: legalImmigrationStatement,
              keySellingPoints: [
                `Direct alignment with ${input.jobTitle} technical requirements.`,
                `Verified immigration eligibility for ${visaTarget}.`,
                `Zero lead-time onboarding and relocation readiness.`,
              ],
              recommendedSponsorshipArguments: [
                "Position qualifies under standard occupation shortage classifications.",
                "Candidate possesses specialized international expertise not readily available in local talent pool.",
                "Candidate handles all preliminary document verifications to streamline HR petition submission.",
              ],
            };
          }
        }
      } catch {
        // Fallback to deterministic executive generator
      }
    }

    // High-converting deterministic executive template
    const coverLetter = `Dear Hiring Team at ${input.companyName},

I am writing to express my enthusiastic application for the position of ${input.jobTitle} with ${input.companyName}. With over ${input.experienceYears || "5+"} years of specialized experience in ${skillsList}, I have built a career delivering measurable technical velocity and scalable business impact.

What attracts me specifically to ${input.companyName} is your technical rigor and market leadership. In my previous roles, I have consistently driven key engineering milestones—from architecting mission-critical services to mentoring cross-functional teams and accelerating release cycles. I am eager to bring this exact focus on quality and innovation to your team.

Regarding immigration and relocation: I am seeking ${visaTarget}. ${legalImmigrationStatement} As an international professional with deep domain competency, I have prepared all relevant credentials to ensure the sponsorship and visa petition process is straightforward, predictable, and frictionless for your recruitment and legal teams.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical expertise and international perspective can deliver immediate value to ${input.companyName}.

Sincerely,
${candidateName}
International Applicant & ${input.jobTitle}`;

    return {
      coverLetter,
      subjectLine: `Application: ${input.jobTitle} at ${input.companyName} – ${candidateName} (${visaTarget})`,
      visaHighlights: legalImmigrationStatement,
      keySellingPoints: [
        `Direct alignment with ${input.jobTitle} technical requirements.`,
        `Verified immigration eligibility for ${visaTarget}.`,
        `Zero lead-time onboarding and relocation readiness.`,
      ],
      recommendedSponsorshipArguments: [
        "Position qualifies under standard occupation shortage classifications.",
        "Candidate possesses specialized international expertise not readily available in local talent pool.",
        "Candidate handles all preliminary document verifications to streamline HR petition submission.",
      ],
    };
  }

  /**
   * Analyzes and optimizes CV bullet points with action verbs and metric density
   */
  static optimizeBulletPoint(bullet: string): BulletOptimizationResult {
    const clean = bullet.trim().replace(/^[-•*]\s*/, "");
    const words = clean.split(/\s+/);
    const firstWord = words[0] || "";

    const hasMetric = /\b\d+(\.\d+)?%?\b|\$|£|€|hours?|days?|teams?|users?/i.test(clean);
    const isWeakStart = /^(responsible for|assisted with|worked on|helped with|participated in|tasked with|handled)\b/i.test(clean);

    let chosenVerb = STRONG_ACTION_VERBS[Math.floor(Math.random() * STRONG_ACTION_VERBS.length)];
    for (const v of STRONG_ACTION_VERBS) {
      if (firstWord.toLowerCase() === v.toLowerCase()) {
        chosenVerb = v;
        break;
      }
    }

    let optimized = clean;
    let critique = "Good action orientation.";
    let score = 75;

    if (isWeakStart) {
      score -= 20;
      critique = "Replace passive phrase with a decisive, quantified action verb.";
      optimized = clean.replace(/^(responsible for|assisted with|worked on|helped with|participated in|tasked with|handled)\s+/i, "");
      optimized = `${chosenVerb} ${optimized}`;
    }

    if (!hasMetric) {
      score -= 10;
      critique += " Add tangible business metrics (e.g. % improvement, latency reduction, user volume).";
      if (!optimized.includes("resulting in") && !optimized.includes("driving")) {
        optimized += `, driving a 25%+ increase in operational efficiency`;
      }
    } else {
      score += 15;
    }

    score = Math.min(100, Math.max(45, score));

    return {
      original: clean,
      optimized: optimized.charAt(0).toUpperCase() + optimized.slice(1),
      score,
      critique: critique.trim(),
      actionVerbUsed: chosenVerb,
      metricsPresent: hasMetric,
    };
  }

  /**
   * Matches candidate role query against official immigration SOC/NOC/ANZSCO codes
   */
  static matchOccupationCodes(query: string): ImmigrationOccupation[] {
    const q = query.toLowerCase().trim();
    if (!q) return IMMIGRATION_OCCUPATIONS;

    return IMMIGRATION_OCCUPATIONS.filter(
      (occ) =>
        occ.title.toLowerCase().includes(q) ||
        occ.ukSocCode.toLowerCase().includes(q) ||
        occ.canadaNocCode.toLowerCase().includes(q) ||
        occ.australiaAnzscoCode.toLowerCase().includes(q)
    );
  }
}
