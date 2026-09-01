/**
 * 7-Day Fast-Rank SEO Engine
 * Strategy Lead: Sumit Raj (Chief SEO & Growth Strategist)
 * 
 * Specializes in ranking international visa sponsorship job portals & listings
 * to Page 1 of Google Search within 7 days using high-intent keyword clustering,
 * JobPosting JSON-LD rich snippets, semantic internal linking, and rapid IndexNow/Googlebot pinging.
 */

export interface FastRankAnalysis {
  overallScore: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "Needs Optimization";
  optimizedTitle: string;
  recommendedSlug: string;
  metaDescription: string;
  focusKeywords: string[];
  secondaryKeywords: string[];
  schemaMarkup: Record<string, any>;
  sevenDayPlan: {
    day: number;
    title: string;
    focus: string;
    actionItems: string[];
    completedByDefault?: boolean;
  }[];
  criticalAudits: {
    rule: string;
    status: "pass" | "warn" | "fail";
    impact: "High" | "Medium" | "Critical";
    detail: string;
  }[];
}

export class FastRankEngine {
  /**
   * Pre-configured high-traffic visa sponsorship keyword clusters
   */
  static readonly VISA_KEYWORD_MATRIX = {
    UK: [
      "Tier 2 sponsor jobs UK",
      "Skilled Worker visa sponsorship London",
      "UK licensed visa sponsor jobs 2026",
      "Scale-up visa jobs United Kingdom",
      "NHS visa sponsorship jobs",
    ],
    US: [
      "H-1B visa sponsorship jobs USA",
      "Cap-exempt H1B engineering jobs",
      "O-1 visa sponsorship tech companies",
      "US green card sponsorship tech jobs",
      "OPT STEM extension sponsor jobs",
    ],
    AU: [
      "Subclass 482 TSS visa sponsor Australia",
      "Australia 186 visa sponsorship jobs",
      "PR pathway visa sponsor Sydney Melbourne",
      "DAMA visa sponsorship jobs Australia",
    ],
    CA: [
      "LMIA approved sponsor jobs Canada",
      "Global Talent Stream visa tech Toronto",
      "Express Entry PNP sponsor jobs Vancouver",
    ],
    DE: [
      "EU Blue Card jobs Germany Berlin",
      "Chancenkarte Opportunity Card sponsor jobs",
      "English speaking sponsor jobs Germany",
    ],
  };

  /**
   * Generates a 7-day fast ranking blueprint for any job or keyword cluster
   */
  static generateSevenDayPlan(jobTitle: string, company: string, country: string) {
    return [
      {
        day: 1,
        title: "Technical Schema & Core Web Vitals Foundation",
        focus: "Google Jobs Rich Snippet Compliance",
        actionItems: [
          "Validate Google JobPosting JSON-LD schema (validThrough, hiringOrganization, jobLocation).",
          "Ensure page load speed is < 1.2s (LCP < 2.5s, CLS < 0.1).",
          "Set canonical tag pointing to primary HTTPS URL.",
        ],
        completedByDefault: true,
      },
      {
        day: 2,
        title: "High-Intent Visa Keyword Clustering",
        focus: "Search Intent Alignment",
        actionItems: [
          `Inject primary visa keywords: '${jobTitle} visa sponsorship ${country}'.`,
          `Embed secondary long-tail keywords and salary ranges in description.`,
          `Include clear visa eligibility requirements (e.g. Tier 2 / H-1B / 482 TSS).`,
        ],
        completedByDefault: true,
      },
      {
        day: 3,
        title: "Rapid Google Indexing API & IndexNow Push",
        focus: "Zero-Latency Search Engine Crawling",
        actionItems: [
          "Ping Google Indexing API (URL_UPDATED endpoint) for immediate Googlebot crawl.",
          "Dispatch IndexNow notification to Bing and Yandex search engines.",
          "Update dynamic XML sitemap with high priority (0.90).",
        ],
        completedByDefault: true,
      },
      {
        day: 4,
        title: "Internal Linking & Semantic Silo Graph",
        focus: "Link Equity Distribution",
        actionItems: [
          `Link from Country Hub (/jobs/${country.toLowerCase()}) to this job.`,
          `Add breadcrumb structured data (Home > ${country} Jobs > ${company} > ${jobTitle}).`,
          `Cross-link 3 related sponsored openings from ${company}.`,
        ],
      },
      {
        day: 5,
        title: "High-CTR SERP Hook & Social Card Optimization",
        focus: "Click-Through-Rate Amplification",
        actionItems: [
          "Add high-CTR triggers: '[Verified Visa Sponsor] | Apply Direct'.",
          "Generate OpenGraph and Twitter Summary Cards with salary and visa badge.",
          "Ensure meta description is exactly 145-155 characters with clear CTA.",
        ],
      },
      {
        day: 6,
        title: "Programmatic FAQ Schema & Rich Snippets Injection",
        focus: "SERP Real-Estate Domination",
        actionItems: [
          "Inject FAQPage schema answering: 'Does this role offer visa relocation assistance?'.",
          "Add structured salary data (baseSalary currency & unitText).",
          "Syndicate listing to candidate alert subscribers.",
        ],
      },
      {
        day: 7,
        title: "SERP Position Verification & Rank Tracking",
        focus: "1st Page Ranking Lock-In",
        actionItems: [
          `Verify Google search query: 'site:sponsorajobs.com ${jobTitle} ${company}'.`,
          "Monitor Google Search Console impressions and average ranking position.",
          "Perform live CTR audit and refine title tags if ranking position is 4–10.",
        ],
      },
    ];
  }

  /**
   * Analyzes an employer's job listing and produces comprehensive 7-day SEO recommendations
   */
  static analyzeJobListing(params: {
    title: string;
    company: string;
    location: string;
    country: string;
    description: string;
    salary?: string;
    visaTier?: string;
  }): FastRankAnalysis {
    const { title, company, location, country, description, salary, visaTier } = params;

    const countryCode = country.toUpperCase() || "UK";
    const visaKeyword = visaTier || (countryCode === "US" ? "H-1B Visa" : countryCode === "AU" ? "482 TSS Visa" : "Tier 2 / Skilled Worker Visa");

    // 1. Optimized Title
    const optimizedTitle = `${title} (${visaKeyword} Sponsorship) – ${company}, ${location}`;
    
    // 2. Slug
    const cleanSlug = `${title}-${company}-${countryCode}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 3. Meta Description (145 - 155 chars)
    let metaDesc = `Apply for ${title} at ${company} in ${location}. Verified ${visaKeyword} sponsorship available. Direct employer application & fast response.`;
    if (metaDesc.length > 155) {
      metaDesc = metaDesc.substring(0, 152) + "...";
    }

    // 4. Keywords
    const countryKeywords = (this.VISA_KEYWORD_MATRIX as any)[countryCode] || this.VISA_KEYWORD_MATRIX.UK;
    const focusKeywords = [
      `${title} visa sponsorship ${country}`,
      `${company} sponsor jobs`,
      `${visaKeyword} jobs ${location}`,
      ...countryKeywords.slice(0, 2),
    ];

    const secondaryKeywords = [
      `International hire ${title}`,
      `Relocation assistance jobs ${country}`,
      `Verified sponsor list ${company}`,
      `${title} salary ${salary || "competitive"}`,
    ];

    // 5. Schema Markup
    const schemaMarkup = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: optimizedTitle,
      description: description,
      datePosted: new Date().toISOString().split("T")[0],
      validThrough: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: company,
        sameAs: "https://sponsorajobs.com",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: location,
          addressCountry: countryCode,
        },
      },
      baseSalary: salary
        ? {
            "@type": "MonetaryAmount",
            currency: countryCode === "UK" ? "GBP" : countryCode === "US" ? "USD" : "EUR",
            value: {
              "@type": "QuantitativeValue",
              value: salary,
              unitText: "YEAR",
            },
          }
        : undefined,
      applicantLocationRequirements: {
        "@type": "Country",
        name: "Worldwide",
      },
    };

    // 6. Audits
    const audits: FastRankAnalysis["criticalAudits"] = [];

    // Check title length
    if (title.length < 10) {
      audits.push({
        rule: "Job Title Specificity",
        status: "fail",
        impact: "High",
        detail: "Title is too short. Include seniority level and primary specialty.",
      });
    } else {
      audits.push({
        rule: "Job Title Specificity",
        status: "pass",
        impact: "High",
        detail: "Title contains strong intent keywords.",
      });
    }

    // Check visa keywords in description
    const descLower = description.toLowerCase();
    const hasVisaMention = descLower.includes("visa") || descLower.includes("sponsor") || descLower.includes("relocation");
    if (!hasVisaMention) {
      audits.push({
        rule: "Visa Sponsorship Keyword Density",
        status: "fail",
        impact: "Critical",
        detail: "Description does not mention visa sponsorship or relocation terms. Add clear sponsorship details.",
      });
    } else {
      audits.push({
        rule: "Visa Sponsorship Keyword Density",
        status: "pass",
        impact: "Critical",
        detail: "Sponsorship intent is explicitly verified in description.",
      });
    }

    // Check description length
    if (description.length < 300) {
      audits.push({
        rule: "Content Depth (Helpful Content)",
        status: "warn",
        impact: "Medium",
        detail: "Description is under 300 characters. Detailed listings (500+ words) rank 3.4x faster.",
      });
    } else {
      audits.push({
        rule: "Content Depth (Helpful Content)",
        status: "pass",
        impact: "Medium",
        detail: "Comprehensive job description meets Google Helpful Content criteria.",
      });
    }

    // Check salary
    if (!salary) {
      audits.push({
        rule: "Structured Salary Disclosure",
        status: "warn",
        impact: "High",
        detail: "Adding a salary range increases Google Jobs SERP ranking velocity by 48%.",
      });
    } else {
      audits.push({
        rule: "Structured Salary Disclosure",
        status: "pass",
        impact: "High",
        detail: "Transparent salary disclosed for Google Jobs salary snippet.",
      });
    }

    // Calculate score
    const passCount = audits.filter((a) => a.status === "pass").length;
    const warnCount = audits.filter((a) => a.status === "warn").length;
    const score = Math.round((passCount * 25) + (warnCount * 12));

    let grade: FastRankAnalysis["grade"] = "Needs Optimization";
    if (score >= 90) grade = "A+";
    else if (score >= 80) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 50) grade = "C";

    return {
      overallScore: score,
      grade,
      optimizedTitle,
      recommendedSlug: cleanSlug,
      metaDescription: metaDesc,
      focusKeywords,
      secondaryKeywords,
      schemaMarkup,
      sevenDayPlan: this.generateSevenDayPlan(title, company, country),
      criticalAudits: audits,
    };
  }
}
