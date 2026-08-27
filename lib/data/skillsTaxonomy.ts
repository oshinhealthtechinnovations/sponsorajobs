/**
 * Comprehensive Skills Taxonomy & Alias Dictionary (ESCO / O*NET Aligned)
 * Zero-LLM Deterministic Normalization & Match Weights
 */

export interface CanonicalSkill {
  name: string;
  category: "Language" | "Framework" | "Cloud & DevOps" | "Database" | "AI & Data" | "Architecture & Tools" | "Domain";
  aliases: string[];
  relatedSkills: { skill: string; weight: number }[]; // 0.40 to 0.85
  isTechnical: boolean;
}

export const SKILLS_TAXONOMY: Record<string, CanonicalSkill> = {
  // Languages
  "typescript": {
    name: "TypeScript",
    category: "Language",
    aliases: ["ts", "typescript.js", "type script"],
    relatedSkills: [{ skill: "javascript", weight: 0.80 }, { skill: "node.js", weight: 0.70 }],
    isTechnical: true,
  },
  "javascript": {
    name: "JavaScript",
    category: "Language",
    aliases: ["js", "es6", "es6+", "ecmascript", "vanilla js"],
    relatedSkills: [{ skill: "typescript", weight: 0.80 }, { skill: "node.js", weight: 0.75 }],
    isTechnical: true,
  },
  "python": {
    name: "Python",
    category: "Language",
    aliases: ["python3", "py", "python 3.x", "cpython"],
    relatedSkills: [{ skill: "django", weight: 0.75 }, { skill: "fastapi", weight: 0.75 }, { skill: "data science", weight: 0.70 }],
    isTechnical: true,
  },
  "golang": {
    name: "Go (Golang)",
    category: "Language",
    aliases: ["go", "golang", "go-lang"],
    relatedSkills: [{ skill: "docker", weight: 0.65 }, { skill: "kubernetes", weight: 0.65 }, { skill: "microservices", weight: 0.75 }],
    isTechnical: true,
  },
  "java": {
    name: "Java",
    category: "Language",
    aliases: ["java 8", "java 11", "java 17", "java 21", "core java", "j2ee"],
    relatedSkills: [{ skill: "spring boot", weight: 0.85 }, { skill: "kotlin", weight: 0.75 }, { skill: "microservices", weight: 0.70 }],
    isTechnical: true,
  },
  "csharp": {
    name: "C# (.NET)",
    category: "Language",
    aliases: ["c#", "c sharp", ".net", ".net core", "asp.net", "dotnet", "dotnet core"],
    relatedSkills: [{ skill: "azure", weight: 0.70 }, { skill: "sql server", weight: 0.75 }],
    isTechnical: true,
  },
  "cpp": {
    name: "C++",
    category: "Language",
    aliases: ["c++", "c/c++", "cpp", "c plus plus"],
    relatedSkills: [{ skill: "c", weight: 0.80 }, { skill: "systems programming", weight: 0.75 }],
    isTechnical: true,
  },
  "rust": {
    name: "Rust",
    category: "Language",
    aliases: ["rustlang", "rust-lang"],
    relatedSkills: [{ skill: "systems programming", weight: 0.80 }, { skill: "webassembly", weight: 0.70 }],
    isTechnical: true,
  },
  "ruby": {
    name: "Ruby",
    category: "Language",
    aliases: ["ruby on rails", "rails", "ror"],
    relatedSkills: [{ skill: "postgresql", weight: 0.65 }],
    isTechnical: true,
  },
  "php": {
    name: "PHP",
    category: "Language",
    aliases: ["php7", "php8", "laravel", "symfony"],
    relatedSkills: [{ skill: "mysql", weight: 0.70 }],
    isTechnical: true,
  },

  // Frontend & Full Stack Frameworks
  "react": {
    name: "React.js",
    category: "Framework",
    aliases: ["react", "react.js", "reactjs"],
    relatedSkills: [{ skill: "next.js", weight: 0.85 }, { skill: "typescript", weight: 0.75 }, { skill: "redux", weight: 0.75 }, { skill: "vue.js", weight: 0.65 }],
    isTechnical: true,
  },
  "next.js": {
    name: "Next.js",
    category: "Framework",
    aliases: ["nextjs", "next.js", "next 13", "next 14", "next 15"],
    relatedSkills: [{ skill: "react", weight: 0.90 }, { skill: "typescript", weight: 0.80 }, { skill: "tailwind css", weight: 0.70 }],
    isTechnical: true,
  },
  "vue.js": {
    name: "Vue.js",
    category: "Framework",
    aliases: ["vue", "vuejs", "vue 3", "nuxt", "nuxtjs", "nuxt.js"],
    relatedSkills: [{ skill: "react", weight: 0.70 }, { skill: "javascript", weight: 0.80 }],
    isTechnical: true,
  },
  "angular": {
    name: "Angular",
    category: "Framework",
    aliases: ["angular", "angularjs", "angular 2+", "angular 16"],
    relatedSkills: [{ skill: "typescript", weight: 0.85 }, { skill: "rxjs", weight: 0.80 }],
    isTechnical: true,
  },
  "node.js": {
    name: "Node.js",
    category: "Framework",
    aliases: ["node", "nodejs", "node.js", "express", "express.js", "nestjs", "nest.js"],
    relatedSkills: [{ skill: "typescript", weight: 0.80 }, { skill: "javascript", weight: 0.85 }, { skill: "backend engineering", weight: 0.80 }],
    isTechnical: true,
  },
  "django": {
    name: "Django",
    category: "Framework",
    aliases: ["django rest framework", "drf"],
    relatedSkills: [{ skill: "python", weight: 0.90 }, { skill: "fastapi", weight: 0.75 }],
    isTechnical: true,
  },
  "fastapi": {
    name: "FastAPI",
    category: "Framework",
    aliases: ["fast api", "fastapi"],
    relatedSkills: [{ skill: "python", weight: 0.90 }, { skill: "pydantic", weight: 0.80 }, { skill: "microservices", weight: 0.75 }],
    isTechnical: true,
  },
  "spring boot": {
    name: "Spring Boot",
    category: "Framework",
    aliases: ["spring", "spring framework", "spring cloud"],
    relatedSkills: [{ skill: "java", weight: 0.90 }, { skill: "microservices", weight: 0.80 }],
    isTechnical: true,
  },

  // Cloud & DevOps
  "aws": {
    name: "Amazon Web Services (AWS)",
    category: "Cloud & DevOps",
    aliases: ["amazon web services", "aws cloud", "ec2", "s3", "lambda", "ecs", "eks", "fargate", "dynamodb", "cloudformation"],
    relatedSkills: [{ skill: "cloud computing", weight: 0.85 }, { skill: "terraform", weight: 0.75 }, { skill: "docker", weight: 0.70 }, { skill: "gcp", weight: 0.70 }],
    isTechnical: true,
  },
  "gcp": {
    name: "Google Cloud Platform (GCP)",
    category: "Cloud & DevOps",
    aliases: ["google cloud", "google cloud platform", "bigquery", "cloud run", "gke", "compute engine"],
    relatedSkills: [{ skill: "cloud computing", weight: 0.85 }, { skill: "aws", weight: 0.75 }, { skill: "kubernetes", weight: 0.75 }],
    isTechnical: true,
  },
  "azure": {
    name: "Microsoft Azure",
    category: "Cloud & DevOps",
    aliases: ["microsoft azure", "azure cloud", "azure devops", "aks"],
    relatedSkills: [{ skill: "cloud computing", weight: 0.85 }, { skill: "aws", weight: 0.75 }, { skill: "csharp", weight: 0.70 }],
    isTechnical: true,
  },
  "docker": {
    name: "Docker (Containers)",
    category: "Cloud & DevOps",
    aliases: ["containerization", "containers", "docker-compose", "dockerfile"],
    relatedSkills: [{ skill: "kubernetes", weight: 0.85 }, { skill: "ci/cd", weight: 0.75 }, { skill: "devops", weight: 0.80 }],
    isTechnical: true,
  },
  "kubernetes": {
    name: "Kubernetes (K8s)",
    category: "Cloud & DevOps",
    aliases: ["k8s", "helm", "k8s cluster", "kubectl", "openshift"],
    relatedSkills: [{ skill: "docker", weight: 0.90 }, { skill: "devops", weight: 0.85 }, { skill: "terraform", weight: 0.75 }],
    isTechnical: true,
  },
  "terraform": {
    name: "Terraform (IaC)",
    category: "Cloud & DevOps",
    aliases: ["iac", "infrastructure as code", "terragrunt", "hcl"],
    relatedSkills: [{ skill: "aws", weight: 0.80 }, { skill: "cloud computing", weight: 0.80 }, { skill: "devops", weight: 0.85 }],
    isTechnical: true,
  },
  "ci/cd": {
    name: "CI/CD Pipelines",
    category: "Cloud & DevOps",
    aliases: ["cicd", "continuous integration", "continuous deployment", "github actions", "gitlab ci", "jenkins", "circleci", "argo cd"],
    relatedSkills: [{ skill: "docker", weight: 0.75 }, { skill: "devops", weight: 0.85 }, { skill: "git", weight: 0.80 }],
    isTechnical: true,
  },
  "linux": {
    name: "Linux / Unix Administration",
    category: "Cloud & DevOps",
    aliases: ["unix", "ubuntu", "debian", "redhat", "centos", "bash", "shell scripting"],
    relatedSkills: [{ skill: "devops", weight: 0.80 }, { skill: "docker", weight: 0.70 }],
    isTechnical: true,
  },

  // Databases & Storage
  "postgresql": {
    name: "PostgreSQL",
    category: "Database",
    aliases: ["postgres", "pgsql", "postgre sql"],
    relatedSkills: [{ skill: "sql", weight: 0.90 }, { skill: "mysql", weight: 0.80 }, { skill: "database design", weight: 0.80 }],
    isTechnical: true,
  },
  "mysql": {
    name: "MySQL",
    category: "Database",
    aliases: ["mariadb"],
    relatedSkills: [{ skill: "sql", weight: 0.90 }, { skill: "postgresql", weight: 0.80 }],
    isTechnical: true,
  },
  "mongodb": {
    name: "MongoDB (NoSQL)",
    category: "Database",
    aliases: ["mongo", "nosql", "documentdb"],
    relatedSkills: [{ skill: "redis", weight: 0.70 }, { skill: "node.js", weight: 0.75 }],
    isTechnical: true,
  },
  "redis": {
    name: "Redis (Caching)",
    category: "Database",
    aliases: ["in-memory cache", "memcached", "redis cache"],
    relatedSkills: [{ skill: "microservices", weight: 0.75 }, { skill: "system design", weight: 0.80 }],
    isTechnical: true,
  },
  "kafka": {
    name: "Apache Kafka",
    category: "Architecture & Tools",
    aliases: ["event streaming", "rabbitmq", "message queues", "sqs", "pubsub"],
    relatedSkills: [{ skill: "microservices", weight: 0.85 }, { skill: "distributed systems", weight: 0.85 }],
    isTechnical: true,
  },
  "graphql": {
    name: "GraphQL",
    category: "Architecture & Tools",
    aliases: ["apollo", "apollo graphql", "relay"],
    relatedSkills: [{ skill: "rest api", weight: 0.80 }, { skill: "react", weight: 0.70 }, { skill: "typescript", weight: 0.75 }],
    isTechnical: true,
  },

  // AI, ML & Data
  "machine learning": {
    name: "Machine Learning (ML)",
    category: "AI & Data",
    aliases: ["ml", "deep learning", "ai", "artificial intelligence", "pytorch", "tensorflow", "scikit-learn", "keras", "llm", "generative ai", "langchain"],
    relatedSkills: [{ skill: "python", weight: 0.85 }, { skill: "data science", weight: 0.90 }, { skill: "data engineering", weight: 0.75 }],
    isTechnical: true,
  },
  "data engineering": {
    name: "Data Engineering",
    category: "AI & Data",
    aliases: ["etl", "elt", "spark", "apache spark", "airflow", "dbt", "databricks", "snowflake", "bigquery"],
    relatedSkills: [{ skill: "sql", weight: 0.90 }, { skill: "python", weight: 0.85 }, { skill: "cloud computing", weight: 0.80 }],
    isTechnical: true,
  },

  // Domain & Methodologies
  "microservices": {
    name: "Microservices Architecture",
    category: "Architecture & Tools",
    aliases: ["distributed systems", "service-oriented architecture", "soa", "restful api", "rest api"],
    relatedSkills: [{ skill: "docker", weight: 0.75 }, { skill: "system design", weight: 0.85 }, { skill: "cloud computing", weight: 0.80 }],
    isTechnical: true,
  },
  "agile": {
    name: "Agile / Scrum",
    category: "Domain",
    aliases: ["scrum", "kanban", "sprints", "jira", "ci/cd"],
    relatedSkills: [{ skill: "leadership", weight: 0.65 }],
    isTechnical: false,
  },
};

/**
 * Normalizes input text into standard canonical skills
 */
export function normalizeSkill(input: string): { canonicalKey: string; name: string } | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase();

  // 1. Exact match against canonical keys
  if (SKILLS_TAXONOMY[clean]) {
    return { canonicalKey: clean, name: SKILLS_TAXONOMY[clean].name };
  }

  // 2. Alias dictionary lookup
  for (const [key, skill] of Object.entries(SKILLS_TAXONOMY)) {
    if (skill.name.toLowerCase() === clean) {
      return { canonicalKey: key, name: skill.name };
    }
    for (const alias of skill.aliases) {
      if (alias.toLowerCase() === clean) {
        return { canonicalKey: key, name: skill.name };
      }
    }
  }

  return null;
}

/**
 * Calculates skill compatibility weight between a candidate skill and a job skill
 * Returns: 1.0 (Exact/Alias), 0.7-0.85 (Strong related), 0.4 (Moderate related), 0.0 (Unrelated)
 */
export function getSkillMatchWeight(candidateSkillKey: string, jobSkillKey: string): number {
  if (candidateSkillKey === jobSkillKey) return 1.0;

  const candidateDef = SKILLS_TAXONOMY[candidateSkillKey];
  if (!candidateDef) return 0.0;

  const related = candidateDef.relatedSkills.find((r) => r.skill === jobSkillKey);
  if (related) {
    return related.weight;
  }

  // Reciprocal relationship check
  const jobDef = SKILLS_TAXONOMY[jobSkillKey];
  if (jobDef) {
    const reciprocal = jobDef.relatedSkills.find((r) => r.skill === candidateSkillKey);
    if (reciprocal) return reciprocal.weight * 0.9;
  }

  return 0.0;
}
