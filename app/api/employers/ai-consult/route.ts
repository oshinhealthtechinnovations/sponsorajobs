import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Sumit Raj, the Chief SEO & Growth Strategist for SponsorAJobs.
You are a world-class programmatic SEO expert with deep algorithmic knowledge of how to rank job boards, visa sponsorship directories, and employer postings on Page 1 of Google Search within 7 days.

Your Core 7-Day Ranking Protocol:
- Day 1: Technical Schema & Core Web Vitals (JobPosting JSON-LD, BreadcrumbList, canonicals, 100/100 mobile speed, validThrough dates, hiringOrganization tags).
- Day 2: High-Intent Visa Keyword Clustering (Targeting long-tail high-intent terms like 'Tier 2 visa sponsor UK', 'H-1B tech jobs USA', '482 TSS Australia', 'LMIA Canada', 'EU Blue Card Germany').
- Day 3: Instant Google Indexing API & IndexNow Push (Bypassing normal 2-4 week crawl queues to get Googlebot indexing in 2-6 hours).
- Day 4: Deep Internal Linking & Semantic Topic Silos (Country hub -> Category hub -> Company directory -> Single Job page equity distribution).
- Day 5: High-CTR SERP Hook Titles & Rich Snippets (CTR amplification >15% using verified visa badges and structured salary data).
- Day 6: FAQPage Structured Data & Google Helpful Content Optimization (Addressing candidate relocation and eligibility questions directly in the SERP).
- Day 7: SERP Verification, Google Search Console CTR refinement, and ranking lock-in.

Tone: Confident, tactical, executive, laser-focused on actionable ROI, speed, and real algorithmic ranking mechanics. Always provide clear, step-by-step instructions.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, jobContext } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Consultation query message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://sponsorajobs.com",
            "X-Title": "SponsorAJobs SEO Expert",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...(jobContext ? [{ role: "user", content: `Context of our current job / portal: ${JSON.stringify(jobContext)}` }] : []),
              { role: "user", content: message },
            ],
            temperature: 0.3,
            max_tokens: 1200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              success: true,
              consultant: {
                name: "Sumit Raj",
                title: "Chief SEO & Fast-Rank Growth Strategist",
                specialization: "7-Day Google Page 1 Job Portal Acceleration",
              },
              reply,
            });
          }
        }
      } catch (err) {
        console.warn("[SEOConsult:OpenRouter] Failed calling LLM, using deterministic playbook:", err);
      }
    }

    // High-quality deterministic fallback response if AI API key is unavailable or timed out
    const cleanMsg = message.toLowerCase();
    let fallbackReply = "";

    if (cleanMsg.includes("7 day") || cleanMsg.includes("rank") || cleanMsg.includes("first page") || cleanMsg.includes("google")) {
      fallbackReply = `### 🚀 Sumit Raj's 7-Day Fast-Rank Blueprint for Job Portals

To rank your job listing on **Page 1 of Google within 7 Days**, execute this exact tactical sequence:

1. **Day 1 (Schema & Technical Precision):** Ensure your \`JobPosting\` JSON-LD schema has valid \`validThrough\` (60 days out), exact \`hiringOrganization\`, and \`jobLocation\` with country code. Google Jobs uses this schema to bypass standard indexing.
2. **Day 2 (Keyword Clustering):** Target high-intent intent modifiers: *"Tier 2 Visa Sponsorship"*, *"H-1B Eligible"*, or *"Relocation Package Included"*. These long-tail keywords have 1/10th the competition and 5x the conversion rate.
3. **Day 3 (Zero-Latency Crawl Push):** Submit the exact URL to the **Google Indexing API** and **IndexNow protocol**. This triggers Googlebot within 2 to 6 hours instead of waiting weeks.
4. **Day 4 (Internal Linking Equity):** Link this job directly from the Country Hub (\`/jobs/uk\`) and the Employer Profile page using exact-match anchor text.
5. **Day 5 (SERP CTR Optimization):** Craft your title tag as: \`[Job Title] (Visa Sponsorship Verified) – [Company] | Apply Direct\`. This boosts SERP Click-Through Rate above 14%.
6. **Day 6 (FAQ & Salary Snippets):** Add structured \`FAQPage\` and \`baseSalary\` properties to claim 2x more visual space on the Google results page.
7. **Day 7 (Position Lock-In):** Verify indexation via \`site:sponsorajobs.com [job-slug]\` and review Google Search Console search queries.`;
    } else if (cleanMsg.includes("schema") || cleanMsg.includes("json-ld") || cleanMsg.includes("google jobs")) {
      fallbackReply = `### 📋 Google Jobs Schema Compliance Guide
By **Sumit Raj (Chief SEO Officer)**:

To guarantee your jobs appear in the **Google Jobs 3-Pack Rich Widget**:
- Must include **\`@type: "JobPosting"\`** with **\`title\`**, **\`description\`**, **\`datePosted\`**, and **\`validThrough\`**.
- Always declare **\`applicantLocationRequirements\`** (set to \`Country: Worldwide\` if international candidates are eligible).
- Always include **\`baseSalary\`** with \`currency\` and \`unitText: "YEAR"\`. Google prioritizes listings with salary data by up to **48% higher ranking visibility**.`;
    } else {
      fallbackReply = `### 🎯 Strategic SEO Recommendation
By **Sumit Raj (Chief SEO & Growth Strategist)**:

To maximize the search visibility and candidate acquisition for your sponsored roles:
1. **Target Specific Visa Categories:** International candidates search with high intent (e.g. *"civil engineer tier 2 visa sponsorship uk"*). Make sure your job titles mirror their exact query.
2. **Fast-Index Immediately:** Use our built-in **IndexNow Push** button on the dashboard to trigger instant Googlebot and Bingbot crawls.
3. **Structured Content Depth:** Keep job descriptions over 500 words with clear bullet points for Responsibilities, Visa Eligibility Criteria, and Sponsorship Costs covered.`;
    }

    return NextResponse.json({
      success: true,
      consultant: {
        name: "Sumit Raj",
        title: "Chief SEO & Fast-Rank Growth Strategist",
        specialization: "7-Day Google Page 1 Job Portal Acceleration",
      },
      reply: fallbackReply,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process SEO consultation." },
      { status: 500 }
    );
  }
}
