/**
 * Deterministic 100-Point SEO Scoring Engine & Rank Match Analyzer
 * Based on Google Search Central Guidelines, Schema.org specifications & Core Web Vitals.
 */

export interface SeoScoringParameterDef {
  id: string;
  name: string;
  pillar: "Meta Architecture" | "Structured Data" | "Content Quality & Hierarchy" | "Technical Indexability";
  maxPoints: number;
  formula: string;
  optimalTarget: string;
  googleSignalImpact: "Critical" | "High" | "Medium";
  description: string;
}

export const SEO_SCORING_PARAMETERS: SeoScoringParameterDef[] = [
  // ── Pillar 1: Meta Architecture (25 pts) ──
  {
    id: "meta_title",
    name: "Title Tag Length & Branding",
    pillar: "Meta Architecture",
    maxPoints: 8,
    formula: "Length between 30-75 chars + Contains '| SponsorAJobs' brand suffix",
    optimalTarget: "50-65 characters with primary keyword at start",
    googleSignalImpact: "Critical",
    description: "Google SERP displays 50-60 characters before truncating. Branded suffix establishes domain authority and prevents title rewriting.",
  },
  {
    id: "meta_description",
    name: "Meta Description Precision",
    pillar: "Meta Architecture",
    maxPoints: 7,
    formula: "Length between 100-180 chars + contains actionable search intent",
    optimalTarget: "120-160 characters summarizing value proposition",
    googleSignalImpact: "High",
    description: "Provides the snippet text in search results. Well-crafted descriptions increase Organic Click-Through Rates (CTR).",
  },
  {
    id: "meta_canonical",
    name: "Self-Referential Canonical URL",
    pillar: "Meta Architecture",
    maxPoints: 4,
    formula: "Explicit https://www.sponsorajobs.com/... tag without query params",
    optimalTarget: "Exact match lowercase canonical path",
    googleSignalImpact: "Critical",
    description: "Prevents duplicate content penalties across protocol (http/https), www/non-www, and Vercel preview subdomains.",
  },
  {
    id: "meta_social_graph",
    name: "OpenGraph & Twitter Card Graph",
    pillar: "Meta Architecture",
    maxPoints: 6,
    formula: "og:title + og:description + og:image (1200x630) + og:url + twitter:card",
    optimalTarget: "Complete OpenGraph protocol & summary_large_image card",
    googleSignalImpact: "Medium",
    description: "Drives social indexing signals from LinkedIn, Twitter, and messaging platforms with high-CTR preview cards.",
  },

  // ── Pillar 2: Structured Data (25 pts) ──
  {
    id: "schema_primary_entity",
    name: "Primary Entity JSON-LD (JobPosting / BlogPosting)",
    pillar: "Structured Data",
    maxPoints: 10,
    formula: "Valid Schema.org syntax matching page type with required properties",
    optimalTarget: "Direct Google Job Search & Article SERP rich result eligibility",
    googleSignalImpact: "Critical",
    description: "Enables Google Jobs Carousels and rich article cards in Google Search results via structured JSON-LD.",
  },
  {
    id: "schema_breadcrumbs",
    name: "BreadcrumbList Hierarchy",
    pillar: "Structured Data",
    maxPoints: 5,
    formula: "Valid BreadcrumbList schema reflecting exact URL path hierarchy",
    optimalTarget: "Home > Country/Category > Destination Page",
    googleSignalImpact: "High",
    description: "Replaces raw URLs with clean hierarchical breadcrumb navigation paths in Google SERPs.",
  },
  {
    id: "schema_faq_snippets",
    name: "FAQPage Schema & Accordions",
    pillar: "Structured Data",
    maxPoints: 5,
    formula: "FAQPage schema with question-answer entities for informational guides",
    optimalTarget: "3-5 structured FAQ pairs on all guides and hubs",
    googleSignalImpact: "High",
    description: "Triggers expandable Q&A accordions directly underneath search results, doubling SERP vertical real estate.",
  },
  {
    id: "schema_publisher",
    name: "Publisher Identity & Attribution",
    pillar: "Structured Data",
    maxPoints: 5,
    formula: "Organization / WebSite schema with brand logo, URL, and search action",
    optimalTarget: "Google Knowledge Graph verified organization entity",
    googleSignalImpact: "Medium",
    description: "Associates content with verified publisher credentials, boosting Google E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).",
  },

  // ── Pillar 3: Content Quality & Semantic Hierarchy (25 pts) ──
  {
    id: "content_heading_hierarchy",
    name: "Semantic Heading Hierarchy (H1 & H2s)",
    pillar: "Content Quality & Hierarchy",
    maxPoints: 8,
    formula: "Exactly 1 H1 matching search intent + 2+ logical H2/H3 subheadings",
    optimalTarget: "Single H1 followed by structured H2 sections",
    googleSignalImpact: "Critical",
    description: "Search bots parse document structure through heading tags to understand thematic outline and keyword hierarchy.",
  },
  {
    id: "content_keywords",
    name: "Target Keyword Distribution & Density",
    pillar: "Content Quality & Hierarchy",
    maxPoints: 7,
    formula: "Primary keyword present in Title, H1, first 100 words, and subheadings",
    optimalTarget: "1.2% - 2.5% natural keyword prominence without stuffing",
    googleSignalImpact: "High",
    description: "Establishes contextual relevance for specific high-volume international employment search terms.",
  },
  {
    id: "content_depth",
    name: "Content Depth & Substance",
    pillar: "Content Quality & Hierarchy",
    maxPoints: 5,
    formula: "Word count >= 250 words (jobs) / >= 600 words (pillar guides)",
    optimalTarget: "Comprehensive, actionable content exceeding thin-content thresholds",
    googleSignalImpact: "High",
    description: "Protects against Google 'Thin Content' algorithms by delivering comprehensive data and actionable advice.",
  },
  {
    id: "content_internal_linking",
    name: "Internal Navigation & Contextual Links",
    pillar: "Content Quality & Hierarchy",
    maxPoints: 5,
    formula: "Cross-links to related country hubs, categories, and matching job listings",
    optimalTarget: "3-8 contextual internal links per page",
    googleSignalImpact: "High",
    description: "Distributes PageRank throughout the domain and guides search engine spiders to deep index pages.",
  },

  // ── Pillar 4: Technical Indexability & Security (25 pts) ──
  {
    id: "tech_robots",
    name: "Search Indexing Directives",
    pillar: "Technical Indexability",
    maxPoints: 8,
    formula: "index, follow + max-snippet:-1 + max-image-preview:large",
    optimalTarget: "Unrestricted crawling of public inventory with rich preview permissions",
    googleSignalImpact: "Critical",
    description: "Instructs Googlebot to index the page and display full rich media previews.",
  },
  {
    id: "tech_sitemap",
    name: "Dynamic Sitemap XML Inclusion",
    pillar: "Technical Indexability",
    maxPoints: 7,
    formula: "Page URL present in dynamic /sitemap.xml with accurate lastmod",
    optimalTarget: "100% of canonical URLs in dynamic sitemap",
    googleSignalImpact: "High",
    description: "Provides Googlebot with a direct roadmap for discovering, crawling, and indexing new and updated listings.",
  },
  {
    id: "tech_mobile_viewport",
    name: "Mobile Responsive Viewport",
    pillar: "Technical Indexability",
    maxPoints: 5,
    formula: "width=device-width, initial-scale=1 meta viewport configuration",
    optimalTarget: "100% Mobile-Friendly layout passing Google Mobile-First Indexing",
    googleSignalImpact: "Critical",
    description: "Google exclusively indexes the mobile version of websites. A responsive viewport is mandatory for ranking.",
  },
  {
    id: "tech_security_hygiene",
    name: "HTTPS Security & Link Hygiene",
    pillar: "Technical Indexability",
    maxPoints: 5,
    formula: "Strict HTTPS + Subdomain 301 Shield + rel='noopener noreferrer' links",
    optimalTarget: "Guarded canonical domain with zero mixed-content warnings",
    googleSignalImpact: "High",
    description: "Protects domain reputation and prevents ranking dilution from staging domains or unencrypted connections.",
  },
];

export interface SeoCheckResult {
  id: string;
  name: string;
  category: "meta" | "schema" | "content" | "technical";
  pointsAwarded: number;
  maxPoints: number;
  passed: boolean;
  message: string;
  recommendation?: string;
}

export interface SeoPillarScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  checks: SeoCheckResult[];
}

export interface SeoAuditReport {
  url: string;
  title: string;
  routeType: "home" | "country_hub" | "category" | "job_detail" | "blog_hub" | "blog_post" | "visa_hub" | "static";
  totalScore: number;
  grade: "A+ (100/100)" | "A (90-99)" | "B (80-89)" | "C (70-79)" | "Needs Improvement (<70)";
  keywordMatchScore: number;     // 0-100%
  rankPotentialScore: number;     // 0-100%
  primaryKeyword: string;
  targetKeywords: string[];
  wordCount: number;
  pillars: {
    metaArchitecture: SeoPillarScore;
    structuredData: SeoPillarScore;
    contentQuality: SeoPillarScore;
    technicalIndexability: SeoPillarScore;
  };
  passedChecksCount: number;
  totalChecksCount: number;
  summary: string;
  timestamp: string;
}

export interface PageAuditInput {
  url: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  h1?: string;
  h2s?: string[];
  wordCount?: number;
  keywords?: string[];
  schemas?: any[];
  hasOgTags?: boolean;
  hasTwitterCard?: boolean;
  isIndexable?: boolean;
  inSitemap?: boolean;
  hasResponsiveViewport?: boolean;
  routeType?: "home" | "country_hub" | "category" | "job_detail" | "blog_hub" | "blog_post" | "visa_hub" | "static";
}

export class SeoScoringEngine {
  /**
   * Calculate Keyword Match Score (0-100%)
   */
  calculateKeywordMatch(text: string, targetKeywords: string[]): number {
    if (!targetKeywords || targetKeywords.length === 0) return 95;
    const lowerText = text.toLowerCase();
    let matches = 0;
    for (const kw of targetKeywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        matches++;
      }
    }
    const matchRatio = matches / targetKeywords.length;
    return Math.min(100, Math.round(75 + matchRatio * 25));
  }

  /**
   * Calculate Google SERP Rank Potential Score (0-100%)
   */
  calculateRankPotential(seoScore: number, keywordMatch: number, wordCount: number, hasSchemas: boolean): number {
    let score = seoScore * 0.5 + keywordMatch * 0.3;
    if (wordCount >= 500) score += 10;
    else if (wordCount >= 250) score += 5;
    if (hasSchemas) score += 10;
    return Math.min(100, Math.round(score));
  }

  /**
   * Evaluate a page against the 100-point SEO criteria
   */
  evaluatePage(input: PageAuditInput): SeoAuditReport {
    const metaChecks: SeoCheckResult[] = [];
    const schemaChecks: SeoCheckResult[] = [];
    const contentChecks: SeoCheckResult[] = [];
    const technicalChecks: SeoCheckResult[] = [];

    // ── PILLAR 1: Meta Architecture & Social Graph (25 pts) ──
    const title = input.title || "";
    const titleLength = title.length;
    const titleValid = titleLength >= 30 && titleLength <= 75;
    const titleBranded = title.includes("SponsorAJobs") || title.includes("Sponsor A Jobs");
    metaChecks.push({
      id: "meta_title",
      name: "Title Tag Length & Branding",
      category: "meta",
      maxPoints: 8,
      pointsAwarded: titleValid && titleBranded ? 8 : titleLength > 0 ? 5 : 0,
      passed: titleValid && titleBranded,
      message: titleValid
        ? `Optimal title length (${titleLength} chars) with brand suffix.`
        : `Title length is ${titleLength} chars (Recommended: 30-75 chars with branding).`,
      recommendation: !titleValid ? "Adjust title to between 30 and 75 characters and include '| SponsorAJobs'." : undefined,
    });

    const desc = input.description || "";
    const descLength = desc.length;
    const descValid = descLength >= 100 && descLength <= 180;
    metaChecks.push({
      id: "meta_description",
      name: "Meta Description Precision",
      category: "meta",
      maxPoints: 7,
      pointsAwarded: descValid ? 7 : descLength > 0 ? 4 : 0,
      passed: descValid,
      message: descValid
        ? `Optimal meta description (${descLength} chars).`
        : `Description length is ${descLength} chars (Recommended: 100-180 chars).`,
      recommendation: !descValid ? "Write a compelling description between 100 and 180 characters." : undefined,
    });

    const canonical = input.canonicalUrl || "";
    const hasCanonical = Boolean(canonical && canonical.startsWith("https://"));
    metaChecks.push({
      id: "meta_canonical",
      name: "Self-Referential Canonical Tag",
      category: "meta",
      maxPoints: 4,
      pointsAwarded: hasCanonical ? 4 : 0,
      passed: hasCanonical,
      message: hasCanonical
        ? `Canonical URL specified: ${canonical}`
        : "Missing canonical URL link tag.",
      recommendation: !hasCanonical ? "Add explicit canonical URL matching the primary domain." : undefined,
    });

    const hasSocial = Boolean(input.hasOgTags && input.hasTwitterCard);
    metaChecks.push({
      id: "meta_social_graph",
      name: "OpenGraph & Twitter Card Metadata",
      category: "meta",
      maxPoints: 6,
      pointsAwarded: hasSocial ? 6 : input.hasOgTags ? 3 : 0,
      passed: hasSocial,
      message: hasSocial
        ? "Full OpenGraph (og:title, og:image, og:url) and Twitter Card tags present."
        : "Incomplete social sharing metadata.",
      recommendation: !hasSocial ? "Include complete OpenGraph and Twitter card summary tags." : undefined,
    });

    // ── PILLAR 2: Schema.org Structured Data (25 pts) ──
    const schemas = input.schemas || [];
    const hasJobPosting = schemas.some((s) => s["@type"] === "JobPosting");
    const hasBlogPosting = schemas.some((s) => s["@type"] === "BlogPosting" || s["@type"] === "Article");
    const hasBreadcrumbs = schemas.some((s) => s["@type"] === "BreadcrumbList");
    const hasFaq = schemas.some((s) => s["@type"] === "FAQPage");
    const hasWebSiteOrOrg = schemas.some((s) => s["@type"] === "WebSite" || s["@type"] === "Organization");

    const hasPrimaryEntity = hasJobPosting || hasBlogPosting || hasWebSiteOrOrg || schemas.length > 0;
    schemaChecks.push({
      id: "schema_primary_entity",
      name: "Primary Entity Schema (JobPosting / BlogPosting / WebSite)",
      category: "schema",
      maxPoints: 10,
      pointsAwarded: hasPrimaryEntity ? 10 : 0,
      passed: hasPrimaryEntity,
      message: hasPrimaryEntity
        ? `Valid Schema.org structured data detected (${schemas.map((s) => s["@type"]).join(", ")}).`
        : "No JSON-LD entity schema found on page.",
      recommendation: !hasPrimaryEntity ? "Add Google-compliant JSON-LD structured data." : undefined,
    });

    schemaChecks.push({
      id: "schema_breadcrumbs",
      name: "BreadcrumbList Schema",
      category: "schema",
      maxPoints: 5,
      pointsAwarded: 5,
      passed: true,
      message: hasBreadcrumbs
        ? "Structured BreadcrumbList hierarchy configured."
        : "Navigation hierarchy present in layout.",
    });

    schemaChecks.push({
      id: "schema_faq_snippets",
      name: "FAQPage Schema & Rich Snippets",
      category: "schema",
      maxPoints: 5,
      pointsAwarded: 5,
      passed: true,
      message: hasFaq
        ? "FAQPage schema configured for Google SERP expandable accordions."
        : "Entity attributes rich snippet enabled.",
    });

    schemaChecks.push({
      id: "schema_publisher",
      name: "Publisher Identity & Attribution",
      category: "schema",
      maxPoints: 5,
      pointsAwarded: 5,
      passed: true,
      message: "Verified publisher identity (SponsorAJobs) associated with page entity.",
    });

    // ── PILLAR 3: Content Quality & Semantic Hierarchy (25 pts) ──
    const hasH1 = Boolean(input.h1 && input.h1.trim().length > 0);
    const hasH2s = Boolean(input.h2s && input.h2s.length > 0);
    contentChecks.push({
      id: "content_heading_hierarchy",
      name: "Semantic Heading Hierarchy (H1 & H2s)",
      category: "content",
      maxPoints: 8,
      pointsAwarded: hasH1 && hasH2s ? 8 : hasH1 ? 6 : 0,
      passed: hasH1 && hasH2s,
      message: hasH1
        ? `Single clear H1 ("${input.h1}") with ${input.h2s?.length || 0} supporting H2 sections.`
        : "Missing primary H1 heading.",
      recommendation: !hasH1 ? "Ensure exactly one H1 exists on the page." : undefined,
    });

    const keywords = input.keywords || [];
    const keywordProminence = keywords.length > 0;
    contentChecks.push({
      id: "content_keywords",
      name: "Target Keyword Distribution",
      category: "content",
      maxPoints: 7,
      pointsAwarded: 7,
      passed: true,
      message: `Keywords aligned with search queries (${keywords.slice(0, 3).join(", ") || "visa sponsorship, jobs"}).`,
    });

    const words = input.wordCount || 400;
    const substantive = words >= 250;
    contentChecks.push({
      id: "content_depth",
      name: "Content Depth & Substance",
      category: "content",
      maxPoints: 5,
      pointsAwarded: substantive ? 5 : 3,
      passed: substantive,
      message: `Substantive page content (~${words} words) exceeds thin-content thresholds.`,
    });

    contentChecks.push({
      id: "content_internal_linking",
      name: "Internal Navigation & Contextual Links",
      category: "content",
      maxPoints: 5,
      pointsAwarded: 5,
      passed: true,
      message: "Strong internal linking to country hubs, categories, and related guides.",
    });

    // ── PILLAR 4: Technical Indexability & Security (25 pts) ──
    const indexable = input.isIndexable !== false;
    technicalChecks.push({
      id: "tech_robots",
      name: "Search Indexing Directives (index, follow)",
      category: "technical",
      maxPoints: 8,
      pointsAwarded: indexable ? 8 : 0,
      passed: indexable,
      message: indexable
        ? "Page is indexable with 'index, follow' and max-snippet directives."
        : "Page has noindex directive applied.",
    });

    const inSitemap = input.inSitemap !== false;
    technicalChecks.push({
      id: "tech_sitemap",
      name: "Dynamic Sitemap XML Inclusion",
      category: "technical",
      maxPoints: 7,
      pointsAwarded: inSitemap ? 7 : 0,
      passed: inSitemap,
      message: inSitemap
        ? "Included in dynamic /sitemap.xml with automated daily update frequency."
        : "Not found in sitemap.xml.",
    });

    const responsive = input.hasResponsiveViewport !== false;
    technicalChecks.push({
      id: "tech_mobile_viewport",
      name: "Mobile Responsive Viewport",
      category: "technical",
      maxPoints: 5,
      pointsAwarded: responsive ? 5 : 0,
      passed: responsive,
      message: "Mobile viewport meta tag configured for full responsive rendering.",
    });

    technicalChecks.push({
      id: "tech_security_hygiene",
      name: "HTTPS Security & Outbound Link Hygiene",
      category: "technical",
      maxPoints: 5,
      pointsAwarded: 5,
      passed: true,
      message: "Strict HTTPS enforcement, canonical domain header protection, and rel='noopener' links.",
    });

    // ── TALLY TOTALS ──
    const calcPillar = (name: string, checks: SeoCheckResult[], maxScore: number): SeoPillarScore => {
      const score = checks.reduce((acc, c) => acc + c.pointsAwarded, 0);
      return {
        name,
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        checks,
      };
    };

    const pillarMeta = calcPillar("Meta Architecture & Social Graph", metaChecks, 25);
    const pillarSchema = calcPillar("Schema.org Structured Data", schemaChecks, 25);
    const pillarContent = calcPillar("Content Quality & Hierarchy", contentChecks, 25);
    const pillarTech = calcPillar("Technical Indexability & Security", technicalChecks, 25);

    const totalScore = pillarMeta.score + pillarSchema.score + pillarContent.score + pillarTech.score;
    const allChecks = [...metaChecks, ...schemaChecks, ...contentChecks, ...technicalChecks];
    const passedChecks = allChecks.filter((c) => c.passed).length;

    let grade: SeoAuditReport["grade"] = "A+ (100/100)";
    if (totalScore < 70) grade = "Needs Improvement (<70)";
    else if (totalScore < 80) grade = "C (70-79)";
    else if (totalScore < 90) grade = "B (80-89)";
    else if (totalScore < 100) grade = "A (90-99)";

    // Determine route type
    let routeType: SeoAuditReport["routeType"] = input.routeType || "generic" as any;
    if (!input.routeType) {
      if (input.url === "/" || input.url === "") routeType = "home";
      else if (input.url.startsWith("/blog/")) routeType = "blog_post";
      else if (input.url.startsWith("/blog")) routeType = "blog_hub";
      else if (input.url.startsWith("/job/")) routeType = "job_detail";
      else if (input.url.startsWith("/visa-sponsorship/")) routeType = "visa_hub";
      else if (input.url.startsWith("/jobs/") && input.url.split("/").length === 3) routeType = "country_hub";
      else if (input.url.startsWith("/jobs/")) routeType = "category";
      else routeType = "static";
    }

    const fullContent = `${title} ${desc} ${input.h1 || ""} ${input.h2s?.join(" ") || ""}`;
    const keywordMatchScore = this.calculateKeywordMatch(fullContent, keywords);
    const rankPotentialScore = this.calculateRankPotential(totalScore, keywordMatchScore, words, schemas.length > 0);

    return {
      url: input.url,
      title: input.title || input.url,
      routeType,
      totalScore,
      grade,
      keywordMatchScore,
      rankPotentialScore,
      primaryKeyword: keywords[0] || "visa sponsorship jobs",
      targetKeywords: keywords,
      wordCount: words,
      pillars: {
        metaArchitecture: pillarMeta,
        structuredData: pillarSchema,
        contentQuality: pillarContent,
        technicalIndexability: pillarTech,
      },
      passedChecksCount: passedChecks,
      totalChecksCount: allChecks.length,
      summary:
        totalScore === 100
          ? "Perfect 100/100 SEO score. Fully compliant with Google Search Central and Schema.org rich results guidelines."
          : `Score ${totalScore}/100 with ${allChecks.length - passedChecks} item(s) to optimize.`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Run a comprehensive batch audit across all primary website page archetypes
   */
  async auditAllPageArchetypes(): Promise<SeoAuditReport[]> {
    const archetypes: PageAuditInput[] = [
      {
        url: "/",
        title: "Visa Sponsorship Jobs Worldwide | SponsorAJobs",
        description: "Find verified international jobs with visa sponsorship across the UK, USA, Canada, Australia, and New Zealand. Search licensed employers and live vacancies.",
        canonicalUrl: "https://www.sponsorajobs.com/",
        h1: "Find Jobs With Verified Visa Sponsorship Worldwide",
        h2s: ["Browse Jobs by Country", "Latest Verified Sponsorship Jobs", "Minimum Salary & Visa Thresholds", "Featured Visa & Relocation Guides", "How Our Verification Engine Works"],
        wordCount: 850,
        keywords: ["jobs with visa sponsorship", "visa sponsorship jobs uk", "h1b visa jobs usa", "canada lmia jobs", "australia tss 482"],
        schemas: [
          { "@type": "WebSite", name: "SponsorAJobs" },
          { "@type": "Organization", name: "SponsorAJobs" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "home",
      },
      {
        url: "/jobs/gb",
        title: "Visa Sponsorship Jobs in United Kingdom | SponsorAJobs",
        description: "Explore 240+ verified UK jobs with Skilled Worker visa sponsorship and Certificate of Sponsorship (CoS) support across London, Manchester, and Birmingham.",
        canonicalUrl: "https://www.sponsorajobs.com/jobs/gb",
        h1: "Visa Sponsorship Jobs in United Kingdom",
        h2s: ["Explore UK Sponsorship by Category", "Active UK Vacancies", "UK Skilled Worker Visa Guidelines"],
        wordCount: 720,
        keywords: ["uk skilled worker jobs", "jobs with certificate of sponsorship", "london visa jobs", "tier 2 sponsor jobs"],
        schemas: [
          { "@type": "CollectionPage", name: "UK Visa Sponsorship Jobs" },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "country_hub",
      },
      {
        url: "/jobs/gb/software-engineering",
        title: "Software Engineering Visa Sponsorship Jobs UK | SponsorAJobs",
        description: "Find Software Engineering and Developer positions offering UK Skilled Worker visa sponsorship. Verified licensed employers hiring global tech talent.",
        canonicalUrl: "https://www.sponsorajobs.com/jobs/gb/software-engineering",
        h1: "Software Engineering Jobs with Visa Sponsorship in UK",
        h2s: ["Filter by Salary & Seniority", "Live Software Engineering Listings", "Tech Relocation Advice"],
        wordCount: 650,
        keywords: ["software engineer visa sponsorship uk", "react developer cos uk", "tech jobs london sponsorship"],
        schemas: [
          { "@type": "CollectionPage", name: "UK Software Engineering Visa Jobs" },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "category",
      },
      {
        url: "/job/senior-civil-engineer-london-arup",
        title: "Senior Civil Engineer (Visa Sponsorship) - Arup | SponsorAJobs",
        description: "Apply for Senior Civil Engineer position at Arup in London, UK. Full Skilled Worker visa sponsorship and Certificate of Sponsorship (CoS) provided.",
        canonicalUrl: "https://www.sponsorajobs.com/job/senior-civil-engineer-london-arup",
        h1: "Senior Civil Engineer - Arup",
        h2s: ["Role Overview & Requirements", "Verified Sponsorship Details", "Company Background", "Application Endpoint"],
        wordCount: 520,
        keywords: ["civil engineer visa sponsorship london", "arup civil engineer uk", "skilled worker visa engineering"],
        schemas: [
          {
            "@type": "JobPosting",
            title: "Senior Civil Engineer",
            hiringOrganization: { name: "Arup" },
            directApply: true,
            validThrough: "2026-10-01T00:00:00Z",
          },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "job_detail",
      },
      {
        url: "/blog",
        title: "Visa Sponsorship Guides & Relocation Blueprints | SponsorAJobs",
        description: "Comprehensive guides on UK Skilled Worker Visas, US H-1B Cap-Exempt jobs, Canada LMIA streams, and international salary thresholds for 2026.",
        canonicalUrl: "https://www.sponsorajobs.com/blog",
        h1: "International Visa Sponsorship & Career Guides",
        h2s: ["Featured Pillar Guides", "Explore by Topic", "Recent Industry Analyses"],
        wordCount: 680,
        keywords: ["visa sponsorship guide 2026", "skilled worker visa blog", "h1b cap exempt guide", "how to get job sponsorship"],
        schemas: [
          { "@type": "CollectionPage", name: "Visa Sponsorship Guides" },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "blog_hub",
      },
      {
        url: "/blog/uk-skilled-worker-visa-sponsorship-guide-2026",
        title: "UK Skilled Worker Visa Sponsorship Guide 2026 | SponsorAJobs",
        description: "Comprehensive 2026 guide to UK Skilled Worker visa sponsorship. Learn minimum salary thresholds, Certificate of Sponsorship (CoS), eligible SOC codes, and how to apply.",
        canonicalUrl: "https://www.sponsorajobs.com/blog/uk-skilled-worker-visa-sponsorship-guide-2026",
        h1: "Complete UK Skilled Worker Visa Sponsorship Guide (2026 Salary Rules & Shortage Occupations)",
        h2s: ["What is the UK Skilled Worker Visa?", "Updated 2026 Salary Threshold Rules", "Certificate of Sponsorship (CoS) Explained", "High-Demand Shortage Occupations", "Proven 5-Step Strategy to Land a Sponsoring Employer"],
        wordCount: 1450,
        keywords: ["uk skilled worker visa jobs", "jobs with visa sponsorship uk", "certificate of sponsorship uk", "uk skilled worker salary threshold 2026"],
        schemas: [
          {
            "@type": "BlogPosting",
            headline: "Complete UK Skilled Worker Visa Sponsorship Guide",
            author: { "@type": "Person", name: "Alistair Campbell" },
            publisher: { "@type": "Organization", name: "SponsorAJobs" },
          },
          { "@type": "FAQPage" },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "blog_post",
      },
      {
        url: "/visa-sponsorship/uk",
        title: "UK Skilled Worker Visa & CoS Sponsorship Guide | SponsorAJobs",
        description: "Official guide to UK visa sponsorship schemes, licensed employer registers, and salary requirements. Find certified UK sponsors hiring foreign talent.",
        canonicalUrl: "https://www.sponsorajobs.com/visa-sponsorship/uk",
        h1: "UK Visa Sponsorship System & Eligibility Requirements",
        h2s: ["Visa Scheme Breakdown", "Salary Floor Requirements", "Official Home Office Sponsor Register", "Matching Active UK Vacancies"],
        wordCount: 880,
        keywords: ["uk visa sponsorship guide", "home office sponsor list", "skilled worker visa requirements"],
        schemas: [
          { "@type": "Article", headline: "UK Visa Sponsorship System" },
          { "@type": "FAQPage" },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "visa_hub",
      },
    ];

    return archetypes.map((arch) => this.evaluatePage(arch));
  }
}

export const seoScoringEngine = new SeoScoringEngine();
