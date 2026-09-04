export interface ChatFaqItem {
  id: string;
  category: "apply" | "visa" | "vip" | "cv" | "pricing";
  categoryLabel: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  promoBadge?: string;
  promoTitle: string;
  promoDescription: string;
  promoCtaText: string;
  actionType: "open-pro-gate" | "browse-jobs" | "pricing";
}

export const CHAT_FAQ_DATABASE: ChatFaqItem[] = [
  {
    id: "unlock-apply-links",
    category: "apply",
    categoryLabel: "Apply Links",
    question: "How do I unlock direct employer apply links?",
    shortAnswer: "VIP Candidate Pass members get instant 1-click access to direct application portals across all 7,800+ verified sponsors.",
    detailedAnswer:
      "Direct employer apply links connect you straight to the hiring company's internal career portal (Workday, Greenhouse, Lever, Taleo) with zero recruitment agencies or middlemen. Free accounts can preview job descriptions, while active VIP Candidate Pass members unlock direct application URLs to all 7,800+ verified sponsor jobs.",
    promoBadge: "Most Popular",
    promoTitle: "Unlock Direct Apply Links (7,800+ Jobs)",
    promoDescription: "Skip the middlemen and apply directly to licensed visa sponsors in the UK, USA, Australia, and Canada.",
    promoCtaText: "⚡ Unlock VIP Pass — ₹199 / Month",
    actionType: "open-pro-gate",
  },
  {
    id: "licensed-sponsors-verification",
    category: "visa",
    categoryLabel: "Visa Sponsorship",
    question: "Are these companies verified to sponsor international visas?",
    shortAnswer: "Yes. Every company is verified against official government sponsor registers (UK Home Office, US USCIS, Australia Subclass 482).",
    detailedAnswer:
      "Unlike generic job boards where 95% of jobs cannot sponsor, SponsorAJobs exclusively tracks companies licensed by government authorities (e.g. UK Home Office Register of Licensed Sponsors, US USCIS H-1B Hub, and Australian TSS registers). We filter out jobs with 'no sponsorship' clauses.",
    promoBadge: "Verified Database",
    promoTitle: "Stop Wasting Time on Fake Sponsor Jobs",
    promoDescription: "Access 800+ vetted enterprise and tech employers actively recruiting foreign talent right now.",
    promoCtaText: "⚡ Access Verified Sponsors — ₹199",
    actionType: "open-pro-gate",
  },
  {
    id: "overseas-hiring-feasibility",
    category: "visa",
    categoryLabel: "Overseas Candidates",
    question: "Can I apply from outside the UK, US, or Australia?",
    shortAnswer: "Yes! Over 65% of our candidates apply overseas from India, the Middle East, Africa, and Southeast Asia.",
    detailedAnswer:
      "Because the employers on SponsorAJobs are officially licensed sponsors, they have the statutory authority to issue Certificates of Sponsorship (CoS), H-1B petitions, or Subclass 482 nominations to hire qualified professionals from abroad. Many also provide relocation packages and visa fee reimbursements.",
    promoBadge: "Global Relocation",
    promoTitle: "Target Employers Ready to Relocate You",
    promoDescription: "Get direct company career links, hiring managers, and AI cover letter generators tailored for overseas applicants.",
    promoCtaText: "⚡ Get VIP Relocation Pass — ₹199",
    actionType: "open-pro-gate",
  },
  {
    id: "vip-pass-benefits",
    category: "vip",
    categoryLabel: "VIP Pass",
    question: "What is included with the VIP Candidate Pass (₹199)?",
    shortAnswer: "Full unblurred apply links, AI CV ATS Scorer, Visa Cover Letter Generator, Salary Calculator & Priority Alerts.",
    detailedAnswer:
      "The VIP Candidate Pass is our all-in-one career accelerator. For just ₹199 (₹6.6/day), you receive: 1) Instant direct apply link unlocks on all 7,800+ jobs; 2) AI CV ATS Match Scorer; 3) Custom Visa Sponsorship Cover Letter Generator; 4) Eligibility & Salary Matrix; 5) Daily Priority Job Alerts sent right to your email.",
    promoBadge: "Best Value",
    promoTitle: "1-Month VIP Candidate Pass (₹199)",
    promoDescription: "Instant activation, zero commitments, and an end-to-end suite of AI tools to land your visa-sponsored job.",
    promoCtaText: "⚡ Activate VIP Pass for ₹199",
    actionType: "open-pro-gate",
  },
  {
    id: "ai-cv-ats-score",
    category: "cv",
    categoryLabel: "CV & ATS",
    question: "How does the AI CV ATS Match Scorer help me?",
    shortAnswer: "It optimizes your resume for western employer ATS algorithms, increasing interview callbacks by up to 3x.",
    detailedAnswer:
      "Over 75% of international job applications are automatically rejected by Applicant Tracking Systems (ATS) before a hiring manager ever sees them. Our AI analyzes your CV against the exact requirements of any sponsor job, pinpointing missing keywords, formatting errors, and skill gaps to ensure you pass screening.",
    promoBadge: "3x Higher Callbacks",
    promoTitle: "AI CV → ATS Match Optimization",
    promoDescription: "Score your CV against any live job description and generate tailored bullet points in seconds.",
    promoCtaText: "⚡ Unlock AI CV Tools — ₹199",
    actionType: "open-pro-gate",
  },
  {
    id: "payment-methods-accepted",
    category: "pricing",
    categoryLabel: "Payments",
    question: "What payment methods are accepted for VIP Pass?",
    shortAnswer: "UPI (Google Pay, PhonePe, Paytm, BHIM), all Debit & Credit Cards, NetBanking, and international cards via Razorpay.",
    detailedAnswer:
      "We use official Razorpay integration with 256-bit bank-grade encryption. Indian candidates can pay via instant UPI QR code, PhonePe, Google Pay, or RuPay/Visa/Mastercard cards. Activation is 100% instant upon payment confirmation.",
    promoBadge: "Instant Unlock",
    promoTitle: "Instant VIP Activation via UPI / Cards",
    promoDescription: "Pay securely in seconds and immediately unlock all features on your candidate dashboard.",
    promoCtaText: "⚡ Pay ₹199 via UPI / Card",
    actionType: "open-pro-gate",
  },
  {
    id: "salary-thresholds",
    category: "visa",
    categoryLabel: "Salary Rules",
    question: "What are the minimum salary thresholds for UK & US visa sponsorship?",
    shortAnswer: "UK Skilled Worker is £38,700/yr (with lower rates for New Entrants / Health); US H-1B follows DOL prevailing wages.",
    detailedAnswer:
      "For the UK, the general minimum salary threshold is £38,700/year (or £30,960 for 'New Entrants' under 26 or recent graduates). For the US, H-1B wages vary by SOC occupation and metropolitan area (typically $70,000 - $130,000+). SponsorAJobs automatically highlights salary packages on eligible jobs so you know if you qualify before applying.",
    promoBadge: "Salary Insights",
    promoTitle: "Filter Jobs Above Visa Salary Thresholds",
    promoDescription: "View salary ranges on unblurred job postings and check statutory visa compliance before submitting your CV.",
    promoCtaText: "⚡ Unlock Salary Intelligence — ₹199",
    actionType: "open-pro-gate",
  },
];
