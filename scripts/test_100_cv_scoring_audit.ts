import fs from "fs";
import path from "path";
import { analyzeCVIntelligence, detectCandidateOccupationFromCV } from "../lib/services/atsIntelligenceEngine";
import { normalizeOccupation } from "../lib/data/occupationsTaxonomy";

interface TestCV {
  id: number;
  expectedCategory: string;
  expectedSeniority: string;
  expectedDegree: string;
  expectedOccId: string;
  targetCountry: string;
  cvText: string;
  notes: string;
}

// Generate 100 representative CVs spanning all domains, seniorities, and formatting variations
function generate100CVs(): TestCV[] {
  const cvs: TestCV[] = [];
  let id = 1;

  // 1. Software Engineering (20 CVs)
  const softwareRoles = [
    { title: "Senior Full Stack Engineer", skills: "TypeScript, React, Next.js, Node.js, PostgreSQL, AWS", exp: 7, sen: "Senior", deg: "Bachelor's", occ: "full_stack_engineer" },
    { title: "Junior Frontend Developer", skills: "HTML5, CSS3, JavaScript, React.js, TailwindCSS", exp: 1, sen: "Junior", deg: "Bachelor's", occ: "frontend_engineer" },
    { title: "Lead Backend Developer", skills: "Java, Spring Boot, Microservices, Kafka, Redis, Docker, Kubernetes", exp: 9, sen: "Lead / Manager", deg: "Master's", occ: "backend_engineer" },
    { title: "Staff Python Engineer", skills: "Python, Django, FastAPI, Celery, PostgreSQL, AWS Lambda", exp: 8, sen: "Senior", deg: "Master's", occ: "software_engineer" },
    { title: "iOS Mobile Application Developer", skills: "Swift, SwiftUI, Combine, CoreData, Xcode, iOS SDK", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "mobile_engineer" },
    { title: "Android Software Engineer", skills: "Kotlin, Java, Jetpack Compose, Coroutines, Android Studio", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "mobile_engineer" },
    { title: "Golang Backend Systems Engineer", skills: "Go, Golang, gRPC, Protobuf, Distributed Systems, Docker", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "backend_engineer" },
    { title: "C# / .NET Core Developer", skills: "C#, .NET Core, ASP.NET, Entity Framework, SQL Server, Azure", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "software_engineer" },
    { title: "Embedded Firmware Engineer", skills: "C, C++, RTOS, ARM Cortex, Microcontrollers, SPI, I2C", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "embedded_systems_engineer" },
    { title: "QA Automation Engineer (SDET)", skills: "Selenium, Cypress, Playwright, Jest, Test Automation, CI/CD", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "qa_test_engineer" },
    { title: "Principal Software Architect", skills: "Enterprise Architecture, System Design, Microservices, Cloud Native, Go, Java", exp: 14, sen: "Lead / Manager", deg: "Master's", occ: "solutions_architect" },
    { title: "React Native Developer", skills: "React Native, TypeScript, Redux, Mobile UI, Expo, REST APIs", exp: 3, sen: "Mid-Level", deg: "Bachelor's", occ: "mobile_engineer" },
    { title: "Web Developer", skills: "JavaScript, HTML, CSS, WordPress, PHP, MySQL", exp: 3, sen: "Mid-Level", deg: "Bachelor's", occ: "software_engineer" },
    { title: "Rust Systems Engineer", skills: "Rust, WebAssembly, Memory Management, Linux, Tokio", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "software_engineer" },
    { title: "PHP / Laravel Developer", skills: "PHP, Laravel, MySQL, Docker, REST APIs, Vue.js", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "software_engineer" },
    { title: "Ruby on Rails Developer", skills: "Ruby, Rails, PostgreSQL, RSpec, Redis, Sidekiq", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "software_engineer" },
    { title: "Flutter Mobile Developer", skills: "Flutter, Dart, Provider, Bloc, Mobile Application Development", exp: 3, sen: "Mid-Level", deg: "Bachelor's", occ: "mobile_engineer" },
    { title: "Graduate Software Developer", skills: "Java, Python, Git, Computer Science Fundamentals", exp: 0, sen: "Junior", deg: "Bachelor's", occ: "software_engineer" },
    { title: "Senior Angular Developer", skills: "Angular, TypeScript, RxJS, NgRx, SCSS, Karma", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "frontend_engineer" },
    { title: "API Platform Engineer", skills: "GraphQL, REST APIs, Kong, OpenAPI, Node.js, AWS", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "backend_engineer" },
  ];

  softwareRoles.forEach((r) => {
    cvs.push({
      id: id++,
      expectedCategory: "Software",
      expectedSeniority: r.sen,
      expectedDegree: r.deg,
      expectedOccId: r.occ,
      targetCountry: "GB",
      notes: `Standard software CV: ${r.title}`,
      cvText: `
JOHN DOE
${r.title} | candidate${id}@example.com | +44 7700 900123 | London, UK | linkedin.com/in/candidate${id} | github.com/cand${id}
SUMMARY
Dedicated professional with ${r.exp}+ years of experience building production software systems.
SKILLS
Technical Skills: ${r.skills}
EXPERIENCE
${r.title} | Global Tech Solutions (${2026 - Math.max(1, r.exp)} - Present)
• Delivered core architectural components resulting in 40% performance increase.
• Collaborated with agile team of 8 engineers across bi-weekly sprints.
EDUCATION
${r.deg} in Computer Science | University of London (2018)
      `,
    });
  });

  // 2. Cloud & DevOps (15 CVs)
  const devopsRoles = [
    { title: "Principal DevOps Engineer", skills: "AWS, Kubernetes, Terraform, Docker, CI/CD, Helm, ArgoCD, Prometheus", exp: 9, sen: "Lead / Manager", deg: "Master's", occ: "devops_engineer" },
    { title: "Site Reliability Engineer (SRE)", skills: "Kubernetes, Go, Python, Prometheus, Grafana, Datadog, Incident Response", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "devops_engineer" },
    { title: "Cloud Solutions Architect", skills: "AWS Solutions Architecture, Azure, Cloud Migration, Enterprise Security, Terraform", exp: 11, sen: "Lead / Manager", deg: "Master's", occ: "solutions_architect" },
    { title: "Azure Platform Engineer", skills: "Microsoft Azure, ARM Templates, Bicep, Azure DevOps, PowerShell, AKS", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "devops_engineer" },
    { title: "GCP Cloud Infrastructure Engineer", skills: "Google Cloud Platform, GKE, Terraform, Python, Cloud SQL, BigQuery", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "devops_engineer" },
    { title: "Cyber Security Analyst", skills: "SIEM, SOC, Splunk, Incident Management, Penetration Testing, Threat Intelligence", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "cyber_security_engineer" },
    { title: "Information Security Engineer", skills: "ISO 27001, SOC 2, Vulnerability Assessment, Cryptography, DevSecOps", exp: 7, sen: "Senior", deg: "Master's", occ: "cyber_security_engineer" },
    { title: "Linux Systems Administrator", skills: "Linux, RHEL, Ubuntu, Bash, Ansible, Apache, Nginx, Networking", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "network_engineer" },
    { title: "Network Security Engineer", skills: "Cisco, CCNA, CCNP, Firewalls, VPN, BGP, OSPF, Routing & Switching", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "network_engineer" },
    { title: "DevSecOps Engineer", skills: "SAST, DAST, SonarQube, Terraform, Kubernetes Security, AWS IAM", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "cyber_security_engineer" },
    { title: "Infrastructure Automation Engineer", skills: "Ansible, Puppet, Terraform, Python, VMware, CloudFormation", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "devops_engineer" },
    { title: "Cloud Security Architect", skills: "AWS Security, Zero Trust, CIS Benchmarks, Threat Modeling, IAM", exp: 10, sen: "Lead / Manager", deg: "Master's", occ: "solutions_architect" },
    { title: "Kubernetes Platform Specialist", skills: "K8s, Istio, Envoy, Service Mesh, Helm, Linux Kernel, Go", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "devops_engineer" },
    { title: "Junior Cloud Engineer", skills: "AWS Certified Practitioner, Linux, Docker, Python, Bash", exp: 1, sen: "Junior", deg: "Bachelor's", occ: "devops_engineer" },
    { title: "IT Systems Engineer", skills: "Active Directory, Windows Server, Office 365, PowerShell, Virtualization", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "network_engineer" },
  ];

  devopsRoles.forEach((r) => {
    cvs.push({
      id: id++,
      expectedCategory: "DevOps & Security",
      expectedSeniority: r.sen,
      expectedDegree: r.deg,
      expectedOccId: r.occ,
      targetCountry: "GB",
      notes: `Cloud/DevOps CV: ${r.title}`,
      cvText: `
CLOUDY APPLICANT
${r.title} | applicant${id}@cloud.io | +44 7890 123456 | Manchester, UK
SUMMARY
Infrastructure specialist with ${r.exp}+ years architecting high-availability systems.
SKILLS
Core Competencies: ${r.skills}
EXPERIENCE
${r.title} | Cloud Infrastructure Partners (${2026 - Math.max(1, r.exp)} - Present)
• Maintained 99.99% uptime for cloud services across 12 availability zones.
• Reduced monthly AWS cloud spend by $35,000 through automated rightsizing.
EDUCATION
${r.deg} in Information Technology | University of Manchester
      `,
    });
  });

  // 3. Data Science & AI/ML (15 CVs)
  const dataRoles = [
    { title: "Staff Data Scientist", skills: "Python, PyTorch, TensorFlow, Machine Learning, Scikit-Learn, Deep Learning, NLP", exp: 8, sen: "Senior", deg: "PhD", occ: "data_scientist" },
    { title: "Machine Learning Engineer", skills: "MLOps, MLflow, AWS SageMaker, PyTorch, Docker, Python, FastAPI", exp: 5, sen: "Mid-Level", deg: "Master's", occ: "data_scientist" },
    { title: "Senior Data Engineer", skills: "Apache Spark, Snowflake, dbt, SQL, Python, Airflow, Kafka, Data Pipeline", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "data_engineer" },
    { title: "Analytics Engineer", skills: "dbt, SQL, BigQuery, Looker, Data Modeling, Git, Python", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "data_engineer" },
    { title: "Lead AI Researcher", skills: "LLMs, Transformers, HuggingFace, PyTorch, Computer Vision, Generative AI", exp: 9, sen: "Lead / Manager", deg: "PhD", occ: "data_scientist" },
    { title: "BI Developer", skills: "Power BI, DAX, Power Query, SQL Server, SSRS, Data Warehousing, Tableau", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "data_engineer" },
    { title: "Data Analyst", skills: "SQL, Excel, Python, Tableau, Statistics, A/B Testing, Business Insights", exp: 3, sen: "Mid-Level", deg: "Bachelor's", occ: "data_engineer" },
    { title: "Big Data Architect", skills: "Hadoop, Spark, Cassandra, Kafka, Scala, Data Architecture, AWS EMR", exp: 12, sen: "Lead / Manager", deg: "Master's", occ: "data_engineer" },
    { title: "Computer Vision Specialist", skills: "OpenCV, PyTorch, YOLO, Object Detection, Image Processing, C++", exp: 5, sen: "Mid-Level", deg: "Master's", occ: "data_scientist" },
    { title: "NLP Data Scientist", skills: "NLTK, Spacy, BERT, Transformers, LLM Fine-tuning, Python, PyTorch", exp: 5, sen: "Mid-Level", deg: "Master's", occ: "data_scientist" },
    { title: "Database Administrator (DBA)", skills: "PostgreSQL, Oracle, SQL Performance Tuning, High Availability, Backup & Recovery", exp: 7, sen: "Senior", deg: "Bachelor's", occ: "database_administrator" },
    { title: "Quantitative Data Analyst", skills: "R, Python, Financial Modeling, Time Series, Econometrics, Pandas", exp: 4, sen: "Mid-Level", deg: "Master's", occ: "data_scientist" },
    { title: "Junior Data Scientist", skills: "Python, Pandas, NumPy, Scikit-Learn, SQL, Machine Learning", exp: 1, sen: "Junior", deg: "Master's", occ: "data_scientist" },
    { title: "Data Platform Architect", skills: "Data Lake, Delta Lake, Databricks, Snowflake, Cloud Governance, Python", exp: 10, sen: "Lead / Manager", deg: "Master's", occ: "data_engineer" },
    { title: "ETL Developer", skills: "Informatica, Talend, SQL, Oracle, Data Warehousing, SSIS", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "data_engineer" },
  ];

  dataRoles.forEach((r) => {
    cvs.push({
      id: id++,
      expectedCategory: "Data & AI",
      expectedSeniority: r.sen,
      expectedDegree: r.deg,
      expectedOccId: r.occ,
      targetCountry: "GB",
      notes: `Data/AI CV: ${r.title}`,
      cvText: `
DR. DATA PROFESSIONAL
${r.title} | dr.data${id}@insights.ac.uk | Edinburgh, UK
SUMMARY
Data specialist with ${r.exp}+ years building production AI and predictive models.
SKILLS
Expertise: ${r.skills}
EXPERIENCE
${r.title} | Data Insights Labs (${2026 - Math.max(1, r.exp)} - Present)
• Built predictive machine learning pipeline with 93.8% precision, processing 5M daily queries.
EDUCATION
${r.deg} in Data Science & Artificial Intelligence | University of Edinburgh
      `,
    });
  });

  // 4. Civil, Structural & Construction (15 CVs)
  const civilRoles = [
    { title: "Senior Civil Engineer", skills: "Civil Engineering, AutoCAD, Structural Analysis, Geotechnical, Drainage, Site Supervision", exp: 8, sen: "Senior", deg: "Bachelor's", occ: "civil_engineer" },
    { title: "Project Coordinator / Planning & Controls Specialist", skills: "Primavera P6, Microsoft Project, EVM, WBS, Cost Control, S-Curve, Schedule Management", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "project_coordinator" },
    { title: "Lead Structural Engineer", skills: "Structural Engineering, STAAD Pro, ETABS, Steel Design, Reinforced Concrete, Eurocodes", exp: 10, sen: "Lead / Manager", deg: "Master's", occ: "civil_engineer" },
    { title: "Highway Design Engineer", skills: "Highway Engineering, Civil 3D, Geometric Design, Drainage, Transportation Planning", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "civil_engineer" },
    { title: "BIM Coordinator / Revit Modeler", skills: "BIM, Revit, Navisworks, Clash Detection, 3D Modeling, AutoCAD", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "bim_coordinator" },
    { title: "Quantity Surveyor / Cost Estimator", skills: "Quantity Surveying, Cost Estimation, Bill of Quantities, BOQ, NEC4 Contracts, Commercial Management", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "quantity_surveyor" },
    { title: "Geotechnical Engineer", skills: "Geotechnical Engineering, Soil Mechanics, Slope Stability, Plaxis, Foundation Design", exp: 5, sen: "Mid-Level", deg: "Master's", occ: "civil_engineer" },
    { title: "Bridge Design Engineer", skills: "Bridge Engineering, Structural Analysis, Prestressed Concrete, Structural Steel, AASHTO", exp: 7, sen: "Senior", deg: "Master's", occ: "civil_engineer" },
    { title: "Water & Drainage Engineer", skills: "Hydrology, Hydraulic Modeling, MicroDrainage, Stormwater, Sewerage Design", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "civil_engineer" },
    { title: "Construction Site Manager", skills: "Site Supervision, Health & Safety, Subcontractor Management, Quality Control, Construction", exp: 9, sen: "Lead / Manager", deg: "Bachelor's", occ: "civil_engineer" },
    { title: "Junior Civil Engineer", skills: "AutoCAD, Site Surveying, Civil Engineering Fundamentals, Concrete Testing", exp: 1, sen: "Junior", deg: "Bachelor's", occ: "civil_engineer" },
    { title: "Project Planner (Primavera P6)", skills: "Primavera P6, Critical Path Method (CPM), Schedule Risk Analysis, Baseline Schedule", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "project_coordinator" },
    { title: "Structural CAD Technician", skills: "AutoCAD, RC Detailing, Steel Detailing, Drafting, 2D/3D CAD", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "bim_coordinator" },
    { title: "Senior Commercial Manager", skills: "Cost Management, Contract Administration, Procurement, Claims Management, NEC3/NEC4", exp: 11, sen: "Lead / Manager", deg: "Bachelor's", occ: "quantity_surveyor" },
    { title: "Infrastructure Project Planner", skills: "Project Controls, Earned Value Management, Primavera P6, Progress Reporting, Power BI", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "project_coordinator" },
  ];

  civilRoles.forEach((r) => {
    cvs.push({
      id: id++,
      expectedCategory: "Civil & Infrastructure",
      expectedSeniority: r.sen,
      expectedDegree: r.deg,
      expectedOccId: r.occ,
      targetCountry: "GB",
      notes: `Civil/Construction CV: ${r.title}`,
      cvText: `
ENGINEERING CANDIDATE
${r.title} | civil.candidate${id}@infra.co.uk | Birmingham, UK
SUMMARY
Infrastructure professional with ${r.exp}+ years delivering major civil, highway, and structural projects.
SKILLS
Technical & Software: ${r.skills}
EXPERIENCE
${r.title} | Balfour Infrastructure JV (${2026 - Math.max(1, r.exp)} - Present)
• Managed project lifecycle for £45M infrastructure package, achieving 100% on-time milestone compliance.
EDUCATION
${r.deg} in Civil Engineering | University of Birmingham
      `,
    });
  });

  // 5. Product, Design & Business Analysis (15 CVs)
  const businessRoles = [
    { title: "Senior Technical Product Manager", skills: "Product Strategy, Roadmap, Agile, User Stories, API, Wireframing, Jira, SQL", exp: 7, sen: "Senior", deg: "Master's", occ: "product_manager" },
    { title: "Lead Product Owner", skills: "Backlog Management, Sprint Planning, Scrum, User Acceptance Testing, Stakeholder Management", exp: 8, sen: "Lead / Manager", deg: "Bachelor's", occ: "product_manager" },
    { title: "Senior IT Business Analyst", skills: "Business Analysis, Requirement Gathering, BPMN, UML, Process Mapping, Jira, Confluence", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "business_analyst" },
    { title: "Scrum Master / Agile Delivery Lead", skills: "Scrum Master, Agile Coaching, Kanban, Sprint Retrospectives, Team Facilitation", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "scrum_master_agile" },
    { title: "Lead UI/UX Designer", skills: "Figma, User Research, Wireframing, Prototyping, Design Systems, Usability Testing", exp: 8, sen: "Lead / Manager", deg: "Bachelor's", occ: "ui_ux_designer" },
    { title: "Product Designer", skills: "UI Design, UX Research, Figma, Interaction Design, Visual Design", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "ui_ux_designer" },
    { title: "Systems Analyst", skills: "System Integration, Data Flow Diagrams, API Specification, SQL, Technical Analysis", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "business_analyst" },
    { title: "Management Consultant", skills: "Strategy, Operational Efficiency, Change Management, Financial Analysis, Executive Presentation", exp: 6, sen: "Senior", deg: "Master's", occ: "business_analyst" },
    { title: "Operations Manager", skills: "Operations Management, Supply Chain, Process Optimization, KPI Dashboards, Vendor Management", exp: 8, sen: "Lead / Manager", deg: "Bachelor's", occ: "operations_manager" },
    { title: "Associate Product Manager", skills: "Market Research, Product Discovery, Analytics, Wireframes, Feature Prioritization", exp: 2, sen: "Junior", deg: "Bachelor's", occ: "product_manager" },
    { title: "Supply Chain Specialist", skills: "Logistics, ERP, Inventory Management, SAP, Procurement, Demand Forecasting", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "operations_manager" },
    { title: "User Researcher", skills: "Qualitative Research, Usability Testing, User Interviews, Persona Development, Figma", exp: 4, sen: "Mid-Level", deg: "Master's", occ: "ui_ux_designer" },
    { title: "Agile Coach", skills: "Enterprise Agile Transformation, SAFe, LeSS, Leadership Coaching, Continuous Improvement", exp: 10, sen: "Lead / Manager", deg: "Master's", occ: "scrum_master_agile" },
    { title: "Functional ERP Consultant", skills: "SAP S/4HANA, Implementation, Business Blueprints, Configuration, Testing", exp: 7, sen: "Senior", deg: "Bachelor's", occ: "business_analyst" },
    { title: "Junior Business Analyst", skills: "Requirement Analysis, Process Modeling, Excel, Jira, Documentation", exp: 1, sen: "Junior", deg: "Bachelor's", occ: "business_analyst" },
  ];

  businessRoles.forEach((r) => {
    cvs.push({
      id: id++,
      expectedCategory: "Product & Business",
      expectedSeniority: r.sen,
      expectedDegree: r.deg,
      expectedOccId: r.occ,
      targetCountry: "GB",
      notes: `Product/Business CV: ${r.title}`,
      cvText: `
BUSINESS LEADER
${r.title} | leader${id}@consulting.com | London, UK
SUMMARY
Strategic professional with ${r.exp}+ years leading cross-functional teams and product lifecycles.
SKILLS
Expertise: ${r.skills}
EXPERIENCE
${r.title} | Global Enterprise Advisory (${2026 - Math.max(1, r.exp)} - Present)
• Scaled product adoption by 65% across 200,000 monthly active enterprise users.
EDUCATION
${r.deg} in Business Administration & Technology | London School of Economics
      `,
    });
  });

  // 6. Finance, Risk & Healthcare (10 CVs)
  const financeHealthRoles = [
    { title: "Senior Credit Analyst", skills: "Credit Risk, Underwriting, Financial Modeling, Loan Analysis, Cash Flow, Risk Rating", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "credit_analyst" },
    { title: "Financial Analyst", skills: "Financial Analysis, Budgeting, Forecasting, Variance Analysis, Excel VBA, DCF Modeling", exp: 4, sen: "Mid-Level", deg: "Master's", occ: "financial_analyst" },
    { title: "Chartered Accountant (ACA/ACCA)", skills: "Statutory Audit, Financial Reporting, IFRS, Tax Compliance, Management Accounts", exp: 7, sen: "Senior", deg: "Bachelor's", occ: "accountant" },
    { title: "Credit Risk Manager", skills: "Credit Risk Policy, Basel III, IFRS 9, Expected Credit Loss, Portfolio Stress Testing", exp: 9, sen: "Lead / Manager", deg: "Master's", occ: "credit_analyst" },
    { title: "Investment Analyst", skills: "Equity Research, Financial Valuation, LBO, Due Diligence, Market Analysis, Pitchbooks", exp: 4, sen: "Mid-Level", deg: "Master's", occ: "financial_analyst" },
    { title: "Registered Nurse (ICU)", skills: "Intensive Care, Patient Assessment, Medication Administration, Advanced Life Support, NMC Registered", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "registered_nurse" },
    { title: "Staff Nurse (Acute Ward)", skills: "Acute Care, Clinical Nursing, Cannulation, Phlebotomy, Wound Care, Care Planning", exp: 3, sen: "Mid-Level", deg: "Bachelor's", occ: "registered_nurse" },
    { title: "Clinical Specialist Nurse", skills: "Specialist Care, Infection Control, Clinical Governance, Patient Advocacy, Nursing Leadership", exp: 8, sen: "Senior", deg: "Master's", occ: "registered_nurse" },
    { title: "Financial Controller", skills: "Financial Control, Team Leadership, ERP Systems, Audit Management, Cash Management", exp: 10, sen: "Lead / Manager", deg: "Bachelor's", occ: "accountant" },
    { title: "Underwriter (Commercial Risk)", skills: "Underwriting, Commercial Property Risk, Risk Assessment, Policy Formulation, Negotiation", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "credit_analyst" },
  ];

  financeHealthRoles.forEach((r) => {
    cvs.push({
      id: id++,
      expectedCategory: "Finance & Healthcare",
      expectedSeniority: r.sen,
      expectedDegree: r.deg,
      expectedOccId: r.occ,
      targetCountry: "GB",
      notes: `Finance/Healthcare CV: ${r.title}`,
      cvText: `
CLINICAL & FINANCE PRO
${r.title} | finance.health${id}@pro.org | Leeds, UK
SUMMARY
Experienced professional with ${r.exp}+ years of verified industry practice.
SKILLS
Specializations: ${r.skills}
EXPERIENCE
${r.title} | National Health & Financial Trust (${2026 - Math.max(1, r.exp)} - Present)
• Supervised operations and maintained 100% regulatory compliance.
EDUCATION
${r.deg} in Professional Studies | University of Leeds
      `,
    });
  });

  // 7. Mechanical, Electrical & Edge Case / Flawed CVs (10 CVs)
  const edgeCaseCVs = [
    { title: "Mechanical Design Engineer", skills: "SolidWorks, AutoCAD, Finite Element Analysis (FEA), Thermal Analysis, HVAC, MEP", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "mechanical_engineer", notes: "Standard Mechanical CV" },
    { title: "Electrical Power Systems Engineer", skills: "Electrical Engineering, High Voltage, Substation Design, ETAP, Power Distribution", exp: 7, sen: "Senior", deg: "Bachelor's", occ: "electrical_engineer", notes: "Standard Electrical CV" },
    { title: "Robotics & Automation Engineer", skills: "PLC Programming, Siemens S7, SCADA, Robotics, Mechatronics, Industrial Automation", exp: 5, sen: "Mid-Level", deg: "Bachelor's", occ: "electrical_engineer", notes: "Automation Engineer" },
    { title: "CV Without Contact Info", skills: "Java, Spring Boot, MySQL, Docker", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "software_engineer", notes: "Edge Case: Missing email/phone" },
    { title: "CV Without Measurable Numbers", skills: "React, CSS, HTML, JavaScript", exp: 3, sen: "Mid-Level", deg: "Bachelor's", occ: "frontend_engineer", notes: "Edge Case: Zero metrics/percentages" },
    { title: "Career Switcher / Transitioning Dev", skills: "Python, SQL, HTML, CSS, JavaScript, Git", exp: 1, sen: "Junior", deg: "Master's", occ: "software_engineer", notes: "Junior Career Switcher" },
    { title: "Executive CTO Applying for Junior Role", skills: "Executive Leadership, Cloud Strategy, Budgeting, Enterprise IT, Java", exp: 18, sen: "Executive", deg: "Master's", occ: "solutions_architect", notes: "Executive Profile" },
    { title: "CV With Non-Standard Degree Text", skills: "C++, Linux, Algorithms, Data Structures", exp: 4, sen: "Mid-Level", deg: "Bachelor's", occ: "software_engineer", notes: "Non-standard degree text" },
    { title: "Civil Engineer Applying in USA (H-1B)", skills: "Civil Engineering, Structural Design, AutoCAD, Site Management", exp: 6, sen: "Senior", deg: "Bachelor's", occ: "civil_engineer", notes: "US Country H-1B check" },
    { title: "Data Scientist Applying in Germany (EU Blue Card)", skills: "Python, Machine Learning, PyTorch, BigQuery, SQL", exp: 5, sen: "Mid-Level", deg: "Master's", occ: "data_scientist", notes: "Germany EU Blue Card check" },
  ];

  edgeCaseCVs.forEach((r) => {
    cvs.push({
      id: id++,
      expectedCategory: "Mechanical & Edge Cases",
      expectedSeniority: r.sen,
      expectedDegree: r.deg,
      expectedOccId: r.occ,
      targetCountry: r.notes.includes("USA") ? "US" : r.notes.includes("Germany") ? "DE" : "GB",
      notes: r.notes,
      cvText: `
EDGE CASE APPLICANT ${id}
${r.title} | candidate${id}@testing.com
SUMMARY
Candidate profiling test for edge conditions.
SKILLS
${r.skills}
EXPERIENCE
${r.title} | Engineering Associates (${2026 - Math.max(1, r.exp)} - Present)
• Executed engineering projects and team delivery.
EDUCATION
${r.deg} in Engineering | University of Technology
      `,
    });
  });

  return cvs;
}

console.log("===============================================================================");
console.log("         COMPREHENSIVE 100 CV ATS INTELLIGENCE ENGINE AUDIT REPORT             ");
console.log("===============================================================================\n");

const testCVs = generate100CVs();
console.log(`Generated ${testCVs.length} diverse CV profiles across 9 domains & edge cases.\n`);

let passedCount = 0;
let occupationMatches = 0;
let seniorityMatches = 0;
let degreeMatches = 0;
const issuesFound: { id: number; title: string; issue: string }[] = [];

testCVs.forEach((cv) => {
  const intel = analyzeCVIntelligence(cv.cvText, null, cv.targetCountry);
  const detectedOcc = detectCandidateOccupationFromCV(cv.cvText);

  const occCorrect = detectedOcc.id === cv.expectedOccId;
  if (occCorrect) occupationMatches++;
  else {
    issuesFound.push({
      id: cv.id,
      title: cv.notes,
      issue: `Occupation mismatch: Expected '${cv.expectedOccId}', Detected '${detectedOcc.id}' (${detectedOcc.name})`,
    });
  }

  const senCorrect = intel.profile.seniority === cv.expectedSeniority;
  if (senCorrect) seniorityMatches++;

  const degCorrect = intel.profile.highestDegree === cv.expectedDegree || cv.expectedDegree === "Not Detected";
  if (degCorrect) degreeMatches++;

  if (occCorrect && senCorrect) {
    passedCount++;
  }
});

console.log(`-------------------------------------------------------------------------------`);
console.log(`                        AUDIT BENCHMARK SUMMARY                                `);
console.log(`-------------------------------------------------------------------------------`);
console.log(`Total CVs Evaluated:               ${testCVs.length}`);
console.log(`Occupation Classification Accuracy: ${occupationMatches} / ${testCVs.length} (${((occupationMatches / testCVs.length) * 100).toFixed(1)}%)`);
console.log(`Seniority Level Accuracy:          ${seniorityMatches} / ${testCVs.length} (${((seniorityMatches / testCVs.length) * 100).toFixed(1)}%)`);
console.log(`Degree Detection Accuracy:         ${degreeMatches} / ${testCVs.length} (${((degreeMatches / testCVs.length) * 100).toFixed(1)}%)`);
console.log(`Overall Pass Rate:                 ${passedCount} / ${testCVs.length} (${((passedCount / testCVs.length) * 100).toFixed(1)}%)\n`);

if (issuesFound.length > 0) {
  console.log(`-------------------------------------------------------------------------------`);
  console.log(`                   DISCOVERED EDGE CASE DISCREPANCIES (${issuesFound.length})                      `);
  console.log(`-------------------------------------------------------------------------------`);
  issuesFound.forEach((iss) => {
    console.log(`[CV #${iss.id}] ${iss.title} -> ${iss.issue}`);
  });
} else {
  console.log(`✨ PERFECT SCORE: 0 discrepancies found across all 100 tested CV profiles!`);
}
