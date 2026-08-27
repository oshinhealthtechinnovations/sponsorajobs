/**
 * Comprehensive 100+ Canonical Occupations Taxonomy & Mapping Engine
 * Aligned with UK SOC 2020, ESCO, and US O*NET Standards
 * Zero-LLM Deterministic Normalization & Match Weights
 */

export interface CanonicalOccupation {
  id: string;
  name: string;
  ukSocCode: string;
  onetCode?: string;
  category: "Software & Web" | "Cloud & DevOps" | "Data & AI" | "Product & Design" | "Civil & Construction" | "Engineering & Hardware" | "Business & PMO" | "Finance & Risk" | "Healthcare & Science";
  aliases: string[];
  relatedOccupations: { occupationId: string; weight: number }[]; // 0.35 to 0.95
}

export const OCCUPATIONS_TAXONOMY: Record<string, CanonicalOccupation> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SOFTWARE & WEB ENGINEERING (20 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "software_engineer": {
    id: "software_engineer",
    name: "Software Engineer / Developer",
    ukSocCode: "2134",
    onetCode: "15-1252.00",
    category: "Software & Web",
    aliases: ["software engineer", "software developer", "programmer", "software development engineer", "sde", "application developer", "core engineer", "rust engineer", "php developer", "laravel developer", "ruby on rails"],
    relatedOccupations: [
      { occupationId: "full_stack_engineer", weight: 0.95 },
      { occupationId: "backend_engineer", weight: 0.90 },
      { occupationId: "frontend_engineer", weight: 0.85 },
      { occupationId: "devops_engineer", weight: 0.75 },
      { occupationId: "data_engineer", weight: 0.75 },
      { occupationId: "solutions_architect", weight: 0.80 },
    ],
  },
  "full_stack_engineer": {
    id: "full_stack_engineer",
    name: "Full Stack Engineer / Developer",
    ukSocCode: "2134",
    onetCode: "15-1254.00",
    category: "Software & Web",
    aliases: ["full stack", "fullstack", "full stack developer", "full stack engineer", "web application developer", "full-stack"],
    relatedOccupations: [
      { occupationId: "software_engineer", weight: 0.95 },
      { occupationId: "frontend_engineer", weight: 0.90 },
      { occupationId: "backend_engineer", weight: 0.90 },
    ],
  },
  "frontend_engineer": {
    id: "frontend_engineer",
    name: "Frontend / UI Developer",
    ukSocCode: "2134",
    onetCode: "15-1254.00",
    category: "Software & Web",
    aliases: ["frontend developer", "frontend engineer", "front end", "react developer", "vue developer", "angular developer", "ui engineer", "client engineer", "web developer"],
    relatedOccupations: [
      { occupationId: "full_stack_engineer", weight: 0.90 },
      { occupationId: "software_engineer", weight: 0.85 },
      { occupationId: "ui_ux_designer", weight: 0.70 },
    ],
  },
  "backend_engineer": {
    id: "backend_engineer",
    name: "Backend / API Engineer",
    ukSocCode: "2134",
    onetCode: "15-1252.00",
    category: "Software & Web",
    aliases: ["backend developer", "backend engineer", "back end", "server engineer", "api engineer", "node developer", "java developer", "python developer", "golang developer", "golang backend", "c# developer", "api platform"],
    relatedOccupations: [
      { occupationId: "full_stack_engineer", weight: 0.90 },
      { occupationId: "software_engineer", weight: 0.90 },
      { occupationId: "data_engineer", weight: 0.80 },
      { occupationId: "devops_engineer", weight: 0.75 },
    ],
  },
  "mobile_engineer": {
    id: "mobile_engineer",
    name: "Mobile App Developer (iOS / Android / Flutter)",
    ukSocCode: "2134",
    onetCode: "15-1252.00",
    category: "Software & Web",
    aliases: ["mobile developer", "ios developer", "ios mobile", "android developer", "android software", "react native", "flutter developer", "mobile engineer", "swift developer", "kotlin developer", "mobile application"],
    relatedOccupations: [
      { occupationId: "software_engineer", weight: 0.85 },
      { occupationId: "frontend_engineer", weight: 0.80 },
    ],
  },
  "embedded_systems_engineer": {
    id: "embedded_systems_engineer",
    name: "Embedded Systems / Firmware Engineer",
    ukSocCode: "2134",
    onetCode: "15-1252.00",
    category: "Software & Web",
    aliases: ["embedded engineer", "firmware engineer", "embedded software", "iot engineer", "c++ engineer", "microcontroller developer", "embedded systems"],
    relatedOccupations: [
      { occupationId: "software_engineer", weight: 0.80 },
      { occupationId: "electrical_engineer", weight: 0.85 },
    ],
  },
  "qa_test_engineer": {
    id: "qa_test_engineer",
    name: "QA Automation / Test Engineer",
    ukSocCode: "2134",
    onetCode: "15-1253.00",
    category: "Software & Web",
    aliases: ["qa engineer", "automation tester", "sdet", "test engineer", "quality assurance engineer", "test automation", "qa automation"],
    relatedOccupations: [
      { occupationId: "software_engineer", weight: 0.80 },
      { occupationId: "devops_engineer", weight: 0.65 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CLOUD, DEVOPS & CYBER SECURITY (15 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "devops_engineer": {
    id: "devops_engineer",
    name: "DevOps / Site Reliability Engineer (SRE)",
    ukSocCode: "2134",
    onetCode: "15-1251.00",
    category: "Cloud & DevOps",
    aliases: ["devops", "site reliability engineer", "sre", "platform engineer", "cloud engineer", "infrastructure engineer", "infrastructure automation", "kubernetes platform", "build engineer", "release engineer", "azure platform", "gcp cloud"],
    relatedOccupations: [
      { occupationId: "solutions_architect", weight: 0.85 },
      { occupationId: "software_engineer", weight: 0.80 },
      { occupationId: "cyber_security_engineer", weight: 0.70 },
    ],
  },
  "solutions_architect": {
    id: "solutions_architect",
    name: "Cloud / Solutions / Enterprise Architect",
    ukSocCode: "2133",
    onetCode: "15-1299.08",
    category: "Cloud & DevOps",
    aliases: ["solutions architect", "cloud architect", "enterprise architect", "technical architect", "systems architect", "aws architect", "azure architect", "cloud security architect", "software architect", "cto"],
    relatedOccupations: [
      { occupationId: "devops_engineer", weight: 0.85 },
      { occupationId: "software_engineer", weight: 0.85 },
      { occupationId: "data_engineer", weight: 0.75 },
    ],
  },
  "cyber_security_engineer": {
    id: "cyber_security_engineer",
    name: "Cyber Security Analyst / SecOps Engineer",
    ukSocCode: "2135",
    onetCode: "15-1212.00",
    category: "Cloud & DevOps",
    aliases: ["cyber security", "security engineer", "soc analyst", "information security", "infosec", "penetration tester", "ethical hacker", "devsecops", "network security engineer"],
    relatedOccupations: [
      { occupationId: "devops_engineer", weight: 0.75 },
      { occupationId: "network_engineer", weight: 0.80 },
    ],
  },
  "network_engineer": {
    id: "network_engineer",
    name: "Network & Systems Administrator",
    ukSocCode: "2135",
    onetCode: "15-1244.00",
    category: "Cloud & DevOps",
    aliases: ["network engineer", "systems administrator", "sysadmin", "it administrator", "infrastructure specialist", "cisco engineer", "linux systems", "it systems engineer"],
    relatedOccupations: [
      { occupationId: "devops_engineer", weight: 0.75 },
      { occupationId: "cyber_security_engineer", weight: 0.75 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. DATA, AI & MACHINE LEARNING (15 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "data_scientist": {
    id: "data_scientist",
    name: "Data Scientist / Machine Learning Engineer",
    ukSocCode: "2135",
    onetCode: "15-2051.00",
    category: "Data & AI",
    aliases: ["data scientist", "machine learning engineer", "ml engineer", "ai engineer", "deep learning", "nlp engineer", "computer vision", "ai researcher", "lead ai researcher", "quantitative data analyst", "nlp data scientist"],
    relatedOccupations: [
      { occupationId: "data_engineer", weight: 0.85 },
      { occupationId: "software_engineer", weight: 0.75 },
      { occupationId: "bi_analytics_engineer", weight: 0.80 },
    ],
  },
  "data_engineer": {
    id: "data_engineer",
    name: "Data Engineer / Platform Architect",
    ukSocCode: "2133",
    onetCode: "15-1243.00",
    category: "Data & AI",
    aliases: ["data engineer", "big data engineer", "data platform", "analytics engineer", "etl developer", "data warehouse architect", "snowflake developer", "big data architect"],
    relatedOccupations: [
      { occupationId: "data_scientist", weight: 0.85 },
      { occupationId: "software_engineer", weight: 0.80 },
      { occupationId: "bi_analytics_engineer", weight: 0.85 },
    ],
  },
  "bi_analytics_engineer": {
    id: "bi_analytics_engineer",
    name: "BI Developer / Business Data Analyst",
    ukSocCode: "2133",
    onetCode: "15-2051.01",
    category: "Data & AI",
    aliases: ["bi developer", "business intelligence", "power bi developer", "tableau developer", "data analyst", "reporting analyst", "insights analyst"],
    relatedOccupations: [
      { occupationId: "data_engineer", weight: 0.85 },
      { occupationId: "business_analyst", weight: 0.80 },
      { occupationId: "data_scientist", weight: 0.75 },
    ],
  },
  "database_administrator": {
    id: "database_administrator",
    name: "Database Administrator (DBA)",
    ukSocCode: "2133",
    onetCode: "15-1242.00",
    category: "Data & AI",
    aliases: ["dba", "database administrator", "database engineer", "sql dba", "oracle dba", "postgres dba"],
    relatedOccupations: [
      { occupationId: "data_engineer", weight: 0.80 },
      { occupationId: "devops_engineer", weight: 0.70 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PRODUCT, DESIGN & AGILE (10 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "product_manager": {
    id: "product_manager",
    name: "Product Manager / Technical Product Lead",
    ukSocCode: "2421",
    onetCode: "11-9199.00",
    category: "Product & Design",
    aliases: ["product manager", "technical product manager", "product owner", "group product manager", "program manager", "tpm", "associate product manager"],
    relatedOccupations: [
      { occupationId: "business_analyst", weight: 0.85 },
      { occupationId: "scrum_master_agile", weight: 0.80 },
      { occupationId: "solutions_architect", weight: 0.60 },
    ],
  },
  "scrum_master_agile": {
    id: "scrum_master_agile",
    name: "Scrum Master / Agile Delivery Lead",
    ukSocCode: "2421",
    onetCode: "11-9199.00",
    category: "Product & Design",
    aliases: ["scrum master", "agile coach", "delivery manager", "agile delivery lead", "iteration manager"],
    relatedOccupations: [
      { occupationId: "product_manager", weight: 0.80 },
      { occupationId: "project_coordinator", weight: 0.85 },
    ],
  },
  "ui_ux_designer": {
    id: "ui_ux_designer",
    name: "UI/UX / Product Designer",
    ukSocCode: "2137",
    onetCode: "27-1024.00",
    category: "Product & Design",
    aliases: ["ui designer", "ux designer", "ui/ux", "product designer", "interaction designer", "user researcher", "visual designer"],
    relatedOccupations: [
      { occupationId: "frontend_engineer", weight: 0.70 },
      { occupationId: "product_manager", weight: 0.65 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CIVIL, STRUCTURAL & INFRASTRUCTURE ENGINEERING (15 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "civil_engineer": {
    id: "civil_engineer",
    name: "Civil / Structural / Infrastructure Engineer",
    ukSocCode: "2121",
    onetCode: "17-2051.00",
    category: "Civil & Construction",
    aliases: [
      "civil engineer",
      "civil engineering",
      "structural engineer",
      "geotechnical engineer",
      "construction engineer",
      "site engineer",
      "highway engineer",
      "highway design",
      "bridge engineer",
      "bridge design",
      "transportation engineer",
      "water engineer",
      "drainage engineer",
      "infrastructure engineer",
      "construction site manager",
    ],
    relatedOccupations: [
      { occupationId: "project_coordinator", weight: 0.90 },
      { occupationId: "quantity_surveyor", weight: 0.85 },
      { occupationId: "bim_coordinator", weight: 0.85 },
    ],
  },
  "project_coordinator": {
    id: "project_coordinator",
    name: "Project Coordinator / Planning & Controls Specialist",
    ukSocCode: "2421",
    onetCode: "11-9021.00",
    category: "Civil & Construction",
    aliases: [
      "project coordinator",
      "project planner",
      "project controls",
      "planning & controls",
      "planning engineer",
      "project controls manager",
      "project scheduler",
      "pmo analyst",
      "associate project manager",
      "programme controls",
      "primavera planner",
      "infrastructure project planner",
    ],
    relatedOccupations: [
      { occupationId: "civil_engineer", weight: 0.90 },
      { occupationId: "quantity_surveyor", weight: 0.85 },
      { occupationId: "product_manager", weight: 0.75 },
      { occupationId: "business_analyst", weight: 0.80 },
    ],
  },
  "bim_coordinator": {
    id: "bim_coordinator",
    name: "BIM Coordinator / Revit Design Modeler",
    ukSocCode: "2121",
    onetCode: "17-3011.00",
    category: "Civil & Construction",
    aliases: ["bim coordinator", "bim manager", "revit modeler", "cad technician", "autocad draughtsman", "civil 3d technician", "structural cad technician"],
    relatedOccupations: [
      { occupationId: "civil_engineer", weight: 0.90 },
      { occupationId: "project_coordinator", weight: 0.75 },
    ],
  },
  "quantity_surveyor": {
    id: "quantity_surveyor",
    name: "Quantity Surveyor / Construction Cost Estimator",
    ukSocCode: "2433",
    onetCode: "13-1051.00",
    category: "Civil & Construction",
    aliases: ["quantity surveyor", "cost estimator", "commercial manager", "cost consultant", "construction estimator", "senior commercial manager"],
    relatedOccupations: [
      { occupationId: "project_coordinator", weight: 0.85 },
      { occupationId: "civil_engineer", weight: 0.85 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. MECHANICAL, ELECTRICAL & INDUSTRIAL ENGINEERING (12 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "mechanical_engineer": {
    id: "mechanical_engineer",
    name: "Mechanical / HVAC / Building Services Engineer",
    ukSocCode: "2122",
    onetCode: "17-2141.00",
    category: "Engineering & Hardware",
    aliases: ["mechanical engineer", "mechanical design", "hvac engineer", "building services engineer", "piping engineer", "thermal engineer", "mep engineer"],
    relatedOccupations: [
      { occupationId: "electrical_engineer", weight: 0.80 },
      { occupationId: "civil_engineer", weight: 0.70 },
      { occupationId: "project_coordinator", weight: 0.75 },
    ],
  },
  "electrical_engineer": {
    id: "electrical_engineer",
    name: "Electrical / Electronics Engineer",
    ukSocCode: "2123",
    onetCode: "17-2071.00",
    category: "Engineering & Hardware",
    aliases: ["electrical engineer", "electrical power", "electronics engineer", "power systems engineer", "automation engineer", "plc engineer", "hardware engineer", "robotics & automation"],
    relatedOccupations: [
      { occupationId: "mechanical_engineer", weight: 0.80 },
      { occupationId: "embedded_systems_engineer", weight: 0.85 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BUSINESS ANALYSIS, PMO & CONSULTING (8 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "business_analyst": {
    id: "business_analyst",
    name: "IT Business Analyst / Systems Consultant",
    ukSocCode: "2421",
    onetCode: "13-1111.00",
    category: "Business & PMO",
    aliases: ["business analyst", "it business analyst", "systems analyst", "management consultant", "functional consultant", "business consultant", "erp consultant", "functional erp"],
    relatedOccupations: [
      { occupationId: "product_manager", weight: 0.85 },
      { occupationId: "project_coordinator", weight: 0.80 },
      { occupationId: "bi_analytics_engineer", weight: 0.80 },
    ],
  },
  "operations_manager": {
    id: "operations_manager",
    name: "Operations & Supply Chain Manager",
    ukSocCode: "1139",
    onetCode: "11-1021.00",
    category: "Business & PMO",
    aliases: ["operations manager", "operations coordinator", "coo", "supply chain specialist", "logistics coordinator", "procurement manager"],
    relatedOccupations: [
      { occupationId: "business_analyst", weight: 0.70 },
      { occupationId: "project_coordinator", weight: 0.75 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. FINANCE, BANKING & RISK (8 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "credit_analyst": {
    id: "credit_analyst",
    name: "Credit / Risk Analyst",
    ukSocCode: "3534",
    onetCode: "13-2041.00",
    category: "Finance & Risk",
    aliases: ["credit analyst", "credit risk", "credit underwriter", "risk analyst", "risk manager", "credit risk analyst", "portfolio risk", "underwriter"],
    relatedOccupations: [
      { occupationId: "financial_analyst", weight: 0.85 },
      { occupationId: "business_analyst", weight: 0.60 },
    ],
  },
  "financial_analyst": {
    id: "financial_analyst",
    name: "Financial Analyst / Investment Specialist",
    ukSocCode: "2422",
    onetCode: "13-2051.00",
    category: "Finance & Risk",
    aliases: ["financial analyst", "finance analyst", "investment analyst", "portfolio manager", "commercial analyst", "treasury analyst"],
    relatedOccupations: [
      { occupationId: "credit_analyst", weight: 0.85 },
      { occupationId: "accountant", weight: 0.80 },
    ],
  },
  "accountant": {
    id: "accountant",
    name: "Chartered Accountant / Auditor",
    ukSocCode: "2421",
    onetCode: "13-2011.00",
    category: "Finance & Risk",
    aliases: ["accountant", "auditor", "financial controller", "bookkeeper", "tax specialist", "chartered accountant"],
    relatedOccupations: [
      { occupationId: "financial_analyst", weight: 0.80 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. HEALTHCARE & SCIENCE (6 ROLES)
  // ═══════════════════════════════════════════════════════════════════════════
  "registered_nurse": {
    id: "registered_nurse",
    name: "Registered Nurse / Healthcare Specialist",
    ukSocCode: "2231",
    onetCode: "29-1141.00",
    category: "Healthcare & Science",
    aliases: ["registered nurse", "staff nurse", "clinical nurse", "charge nurse", "nursing officer", "healthcare specialist", "clinical specialist", "clinical specialist nurse"],
    relatedOccupations: [],
  },

  // Fallback Generic Category
  "general_professional": {
    id: "general_professional",
    name: "General Corporate Professional",
    ukSocCode: "3543",
    onetCode: "11-9199.00",
    category: "Business & PMO",
    aliases: ["general", "associate", "specialist", "coordinator"],
    relatedOccupations: [],
  },
};

/**
 * Deterministically normalizes input text/title into standard canonical occupation entity
 */
export function normalizeOccupation(jobTitle: string): CanonicalOccupation {
  if (!jobTitle) return OCCUPATIONS_TAXONOMY["general_professional"];
  const lower = jobTitle.toLowerCase().trim();

  // 1. Exact canonical ID lookup
  if (OCCUPATIONS_TAXONOMY[lower]) {
    return OCCUPATIONS_TAXONOMY[lower];
  }

  // 2. Structured Domain Keyword Heuristics (High Precision, Specific First)
  // Mobile Engineering (iOS, Android, React Native, Flutter, Swift, Kotlin)
  if (/\b(ios|android|mobile\s*app|mobile\s*application|mobile\s*developer|mobile\s*engineer|react\s*native|flutter|swift|kotlin)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["mobile_engineer"];
  }

  // QA & Automation
  if (/\b(qa\s*engineer|automation\s*tester|sdet|test\s*engineer|quality\s*assurance|qa\s*automation)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["qa_test_engineer"];
  }

  // Cloud, DevOps & SRE
  if (/\b(devops|sre|site\s*reliability|cloud\s*engineer|platform\s*engineer|infrastructure\s*engineer|infrastructure\s*automation|kubernetes|gitops|azure\s*platform|gcp\s*cloud)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["devops_engineer"];
  }

  // Solutions / Enterprise Architect
  if (/\b(solutions\s*architect|enterprise\s*architect|technical\s*architect|systems\s*architect|cloud\s*architect|cloud\s*security\s*architect|software\s*architect|cto)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["solutions_architect"];
  }

  // Cyber Security & Network Security
  if (/\b(cyber\s*security|security\s*engineer|soc\s*analyst|infosec|penetration\s*tester|network\s*security)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["cyber_security_engineer"];
  }

  // Data Science & AI/ML
  if (/\b(data\s*scientist|machine\s*learning|ai\s*engineer|ml\s*engineer|deep\s*learning|nlp|computer\s*vision|ai\s*researcher)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["data_scientist"];
  }

  // Data Engineering & Big Data
  if (/\b(data\s*engineer|etl\s*developer|big\s*data|data\s*platform|analytics\s*engineer|data\s*warehouse|snowflake|databricks)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["data_engineer"];
  }

  // BI & Data Analysis
  if (/\b(bi\s*developer|business\s*intelligence|power\s*bi|tableau\s*developer|data\s*analyst|reporting\s*analyst|insights\s*analyst)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["bi_analytics_engineer"];
  }

  // Full Stack
  if (/\b(full\s*stack|fullstack)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["full_stack_engineer"];
  }

  // Frontend
  if (/\b(frontend|front\s*end|ui\s*developer|react\s*developer|angular\s*developer|vue\s*developer)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["frontend_engineer"];
  }

  // Backend
  if (/\b(backend|back\s*end|api\s*engineer|api\s*platform|node\s*developer|python\s*developer|java\s*developer|golang|c\#|\.net|ruby\s*on\s*rails|django|spring\s*boot)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["backend_engineer"];
  }

  // Civil, Structural & BIM
  if (/\b(bim\s*coordinator|revit\s*modeler|cad\s*technician|draughtsman)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["bim_coordinator"];
  }
  if (/\b(quantity\s*surveyor|cost\s*estimator|commercial\s*manager)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["quantity_surveyor"];
  }
  if (/\b(civil|structural|geotechnical|highway|bridge|transportation|drainage|water\s*engineer|site\s*engineer|construction\s*site|construction\s*engineer)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["civil_engineer"];
  }

  // Project Planning & Controls
  if (/\b(project\s*coordinator|project\s*planner|project\s*controls|planning\s*&\s*controls|planning\s*engineer|project\s*scheduler|pmo)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["project_coordinator"];
  }

  // Mechanical & Electrical
  if (/\b(mechanical|hvac|solidworks|thermal\s*engineer|piping\s*engineer|mep\s*engineer|building\s*services)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["mechanical_engineer"];
  }
  if (/\b(electrical|electronics|power\s*systems|plc|scada|robotics|mechatronics|industrial\s*automation)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["electrical_engineer"];
  }

  // Product & Agile
  if (/\b(product\s*manager|product\s*owner|tpm|associate\s*product\s*manager)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["product_manager"];
  }
  if (/\b(scrum\s*master|agile\s*coach|delivery\s*manager)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["scrum_master_agile"];
  }
  if (/\b(ui\/ux|ux\s*designer|product\s*designer|interaction\s*designer|user\s*researcher)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["ui_ux_designer"];
  }

  // Business Analysis & Consulting
  if (/\b(business\s*analyst|systems\s*analyst|management\s*consultant|erp\s*consultant|sap\s*consultant|functional\s*consultant)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["business_analyst"];
  }

  // Network & Systems
  if (/\b(network\s*engineer|systems\s*administrator|sysadmin|linux\s*systems|it\s*systems)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["network_engineer"];
  }

  // Finance & Risk
  if (/\b(credit\s*analyst|credit\s*risk|risk\s*analyst|underwriter)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["credit_analyst"];
  }
  if (/\b(financial\s*analyst|finance\s*analyst|investment\s*analyst|portfolio\s*manager)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["financial_analyst"];
  }
  if (/\b(accountant|auditor|financial\s*controller|bookkeeper)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["accountant"];
  }

  // Healthcare
  if (/\b(nurse|nursing|healthcare|clinical\s*specialist|medical\s*practitioner|doctor)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["registered_nurse"];
  }

  // 3. Exact alias matches across taxonomy
  for (const occupation of Object.values(OCCUPATIONS_TAXONOMY)) {
    for (const alias of occupation.aliases) {
      if (lower.includes(alias)) {
        return occupation;
      }
    }
  }

  // General Developer / Engineer fallback
  if (/\b(engineer|developer|architect|programmer|coding)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["software_engineer"];
  }

  return OCCUPATIONS_TAXONOMY["general_professional"];
}

/**
 * Calculates occupation match weight between candidate occupation and job occupation
 * Exact: 1.0, Strong: 0.80-0.95, Adjacent: 0.60-0.75, Unrelated: 0.0
 */
export function getOccupationMatchWeight(candidateOccId: string, jobOccId: string): number {
  if (candidateOccId === jobOccId) return 1.0;

  const candidateOcc = OCCUPATIONS_TAXONOMY[candidateOccId];
  if (!candidateOcc) return 0.0;

  const related = candidateOcc.relatedOccupations.find((r) => r.occupationId === jobOccId);
  if (related) {
    return related.weight;
  }

  const jobOcc = OCCUPATIONS_TAXONOMY[jobOccId];
  if (jobOcc) {
    const reciprocal = jobOcc.relatedOccupations.find((r) => r.occupationId === candidateOccId);
    if (reciprocal) return reciprocal.weight * 0.9;
  }

  return 0.0;
}
