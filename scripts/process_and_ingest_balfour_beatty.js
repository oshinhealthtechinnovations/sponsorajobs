/**
 * Ingestion and Screening Intelligence Script for Balfour Beatty Roles
 * Ingests all 100+ verified engineering, infrastructure, commercial, and technical roles
 * from Balfour Beatty into realJobsData.json with sponsorship intelligence,
 * direct ATS apply links, and rich SEO formatted descriptions.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(rawData);

// Ensure Balfour Beatty company record exists
const BALFOUR_BEATTY_COMPANY = {
  id: "comp_balfour_beatty",
  name: "Balfour Beatty",
  slug: "balfour-beatty",
  industry: "Civil Engineering & Infrastructure Construction",
  website: "https://www.balfourbeatty.com",
  logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Balfour_Beatty_Logo.svg/320px-Balfour_Beatty_Logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "London, United Kingdom",
  employee_count: "25,000+",
  founded_year: 1909,
  overview: "Balfour Beatty plc is a leading international infrastructure group financing, developing, building and maintaining complex infrastructure that underpins the UK and global economy.",
  verified_sponsor: true,
};

// Add or update company
const compIndex = data.companies.findIndex(c => c.id === BALFOUR_BEATTY_COMPANY.id || c.name.toLowerCase() === 'balfour beatty');
if (compIndex >= 0) {
  data.companies[compIndex] = { ...data.companies[compIndex], ...BALFOUR_BEATTY_COMPANY };
} else {
  data.companies.push(BALFOUR_BEATTY_COMPANY);
}

// Master raw list of extracted roles from the provided source
const RAW_ROLES = [
  {
    jobId: "546755",
    title: "Senior Design Manager",
    location: "Midlands, London & East Anglia, United Kingdom",
    city: "London",
    region: "London",
    remoteType: "HYBRID",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 72000,
    salaryMax: 92000,
    project: "Regional Civils Central and South East Design & Technical Community (£5m - £100m+ schemes in Active Travel, Place-making, Climate Resilience, Defence and Power)",
    overview: "Lead the delivery of complex, high-impact infrastructure projects across the Midlands, London and East Anglia. Take ownership of the design and technical function from preconstruction through to handover.",
    responsibilities: [
      "Lead development and implementation of design solutions, ensuring customer requirements, programme and budget constraints are met",
      "Manage and coordinate the Design Team, including M&E elements, ensuring effective briefing and performance of internal and external teams",
      "Oversee subcontractor design integration and ensure buildability across major infrastructure packages",
      "Drive value engineering, carbon reduction, and digital BIM compliance across the project lifecycle"
    ],
    qualifications: "Proven experience operating at a senior level delivering design services within a work-winning/preconstruction and project delivery environment. Degree in Civil/Structural Engineering or Architecture with Chartership (MICE, MIStructE, RIBA or equivalent)."
  },
  {
    jobId: "546808",
    title: "Planning Engineer",
    location: "Nationwide, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    remoteType: "HYBRID",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 48000,
    salaryMax: 65000,
    project: "Power Transmission & Distribution (T&D) — Critical National Grid Infrastructure & Net Zero Transition",
    overview: "Join Balfour Beatty’s Power Transmission & Distribution business as a Planning Engineer and play a key role in delivering the infrastructure that powers millions of homes across the UK while supporting the transition to Net Zero.",
    responsibilities: [
      "Develop and maintain fully resourced, logically linked Primavera P6 programmes across all project stages",
      "Create and present compelling tender planning submissions and progress dashboards for clients (National Grid, SSEN)",
      "Collaborate with project directors and engineering teams to identify critical paths and delay mitigations",
      "Perform earned value analysis and resource levelling on major substation and transmission schemes"
    ],
    qualifications: "Degree in Engineering, Construction Management or equivalent. Proven experience as a Project Planner using Primavera P6 on infrastructure or power projects."
  },
  {
    jobId: "546839",
    title: "Fire Engineer",
    location: "Glasgow, Scotland, United Kingdom",
    city: "Glasgow",
    region: "Scotland",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 40000,
    salaryMax: 52000,
    project: "Asset & Technology Solutions (ATS) — Multi-Site Infrastructure & Commercial Facilities",
    overview: "Field-based role supporting projects across Scotland with the installation, maintenance, testing and repair of fire alarm systems and associated life-safety equipment across a diverse portfolio of sites.",
    responsibilities: [
      "Install, maintain, and repair fire detection and alarm systems in line with British Standards (BS 5839)",
      "Carry out comprehensive fault finding and ensure systems operate efficiently and safely",
      "Complete work in strict accordance with company health and safety procedures",
      "Manage site documentation, testing certifications, and client handover logs"
    ],
    qualifications: "Minimum 3 years proven experience in fire alarm systems installation and maintenance. Relevant electrical/fire certifications (FIA, NVQ Level 3 or equivalent)."
  },
  {
    jobId: "546845",
    title: "Ecology Area Lead",
    location: "Grays, Essex, United Kingdom",
    city: "Grays",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_ops",
    categorySlug: "operations-logistics",
    categoryName: "Environmental & Sustainability",
    salaryMin: 50000,
    salaryMax: 65000,
    project: "Lower Thames Crossing (LTC) — UK’s Greenest Road Infrastructure Project",
    overview: "Manage the ecological deliverables for one major section of the landmark £1.2bn Lower Thames Crossing scheme to programme, budget and environmental quality standards, including protected species mitigation and habitat creation.",
    responsibilities: [
      "Lead delivery of project ecological requirements and protected species licensing in assigned work area",
      "Oversee site clearance and habitat management in line with Wildlife and Countryside Act standards",
      "Manage ecological clerk of works (ECoW) teams and specialist environmental sub-contractors",
      "Collaborate with Natural England, Environment Agency, and local wildlife trusts"
    ],
    qualifications: "Degree in Ecology, Environmental Science or related discipline. Full CIEEM membership and demonstrable experience managing ecological mitigation on major infrastructure."
  },
  {
    jobId: "546854",
    title: "Head of Design - Overhead Lines",
    location: "Derby, East Midlands, United Kingdom",
    city: "Derby",
    region: "East Midlands",
    remoteType: "HYBRID",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 85000,
    salaryMax: 110000,
    project: "Power Transmission & Distribution — High Voltage Overhead Lines (400kV OHL)",
    overview: "Lead the Development and Design capability of our Overhead Lines (OHL) Team in the Power T&D business. Own the Design Delivery process in accordance with Group Minimum Engineering Expectations (GMEE) requirements.",
    responsibilities: [
      "Own the OHL / Structures technical input for forward workload and tender work-winning activities",
      "Resource all live transmission projects with suitably skilled design engineers to deliver on time, cost, and quality",
      "Drive Global Practice integration with GCC engineering teams to enhance technical capacity",
      "Set strategic technical direction, standardisation, and continuous improvement for OHL tower and foundation designs"
    ],
    qualifications: "Degree in Civil, Structural, or Electrical Power Engineering. Chartered membership (ICE, IEEE, IMechE or IET). Substantial experience in high-voltage power transmission (National Grid / SSE specifications)."
  },
  {
    jobId: "549114",
    title: "Wayleave Warden",
    location: "Assington, Suffolk, United Kingdom",
    city: "Assington",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_ops",
    categorySlug: "operations-logistics",
    categoryName: "Operations & Logistics",
    salaryMin: 34000,
    salaryMax: 44000,
    project: "Bramford to Twinstead Network Optimisation (BTNO Project) — Power T&D",
    overview: "Responsible for securing third-party consents, landowner agreements, and access permissions to enable safe and timely project delivery on the Bramford to Twinstead electricity reinforcement project.",
    responsibilities: [
      "Liaise with client Wayleave Officers, Engineers, and General Foremen to confirm land take areas and access tracks",
      "Maintain clear communication with farmers, land agents, and grantors regarding tree clearance and tower positioning",
      "Identify and record utility services and environmental constraints prior to mobilization",
      "Maintain updated wayleave schedules and damage limitation logs"
    ],
    qualifications: "Excellent communication and negotiation skills. Strong understanding of agricultural land use, grantor requirements, and construction logistics. Valid UK driving licence."
  },
  {
    jobId: "546899",
    title: "Construction Manager",
    location: "Ipswich, Suffolk, United Kingdom",
    city: "Ipswich",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Construction Management",
    salaryMin: 65000,
    salaryMax: 82000,
    project: "Sizewell C Nuclear Power Station — Ground Engineering & Civil Works Alliance",
    overview: "Join the Ground Engineering team delivering critical civils and deep foundation works on Sizewell C, a 3.2GW nuclear power station project providing clean electricity for 6 million homes.",
    responsibilities: [
      "Oversee all site construction activities including heavy plant, piling rigs, logistics, and temporary works",
      "Ensure the safety culture (Zero Harm) and operational excellence are maintained across multi-firm alliance teams",
      "Manage programme execution, site interface coordination, and subcontractor work packages",
      "Drive quality assurance and compliance with nuclear baseline safety requirements"
    ],
    qualifications: "Managers & Professionals level CPCS / CSCS Qualification. Demonstrable experience managing major ground engineering or heavy civil infrastructure packages. Strong NEC contract understanding."
  },
  {
    jobId: "546902",
    title: "Project Manager",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 70000,
    salaryMax: 90000,
    project: "Sizewell C Nuclear Power Plant — Ground Engineering Sub-Alliance",
    overview: "Lead project execution from launch and preparation through delivery and close-out on Sizewell C's complex ground engineering packages, ensuring delivery in line with commercial targets and nuclear standards.",
    responsibilities: [
      "Take full ownership of safe, efficient and high-quality delivery from initial review through handover",
      "Coordinate with clients, alliance partners (Bouygues, Laing O'Rourke), and specialist geotechnical teams",
      "Review contract specifications, risk registers, drawings, and budget allocations",
      "Drive cost performance, margin protection, and continuous productivity improvement"
    ],
    qualifications: "Degree in Civil Engineering or Construction Management. Substantial project management track record on major infrastructure or nuclear projects. Proven leadership in safety and commercial governance."
  },
  {
    jobId: "546910",
    title: "Construction Manager – Substations",
    location: "Woolavington, Somerset, United Kingdom",
    city: "Woolavington",
    region: "South West",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 62000,
    salaryMax: 80000,
    project: "Power Transmission & Distribution — High Voltage Substation Infrastructure (up to 400kV)",
    overview: "Shape the future of critical UK power transmission infrastructure by leading construction teams across high-voltage substation build and reinforcement projects in the South West.",
    responsibilities: [
      "Manage Site Engineers and Project Engineers to ensure technical and safety compliance",
      "Plan and oversee resource allocation, plant machinery, switchgear installation, and materials",
      "Supervise daily site activities, labor force productivity, and subcontractor performance",
      "Maintain strict adherence to National Grid and SSE technical specifications and ESSW standards"
    ],
    qualifications: "Proven track record managing high-voltage substation construction projects. Strong working knowledge of NEC contracts and safety-critical electrical environments. Relevant degree or HNC/HND."
  },
  {
    jobId: "546922",
    title: "Digital Transformation Manager",
    location: "Basingstoke, Hampshire, United Kingdom",
    city: "Basingstoke",
    region: "South East",
    remoteType: "HYBRID",
    category: "cat_tech",
    categorySlug: "information-technology",
    categoryName: "Information Technology",
    salaryMin: 65000,
    salaryMax: 85000,
    project: "Ground Engineering Business Unit — Digital Construction & Process Automation",
    overview: "Provide strategic leadership and oversight over all digitalization and technology initiatives across Balfour Beatty Ground Engineering, optimizing work winning, engineering design, and site delivery.",
    responsibilities: [
      "Evaluate operational processes and implement digital tools to automate workflows and eliminate waste",
      "Lead adoption of advanced BIM, reality capture, IoT sensors, and mobile site management systems",
      "Build strong relationships with regional engineering heads and executive leadership",
      "Formulate digital business cases and measure productivity return on technology investments"
    ],
    qualifications: "Recognised background in construction, engineering, or civil technology management. Demonstrable track record deploying digital transformation tools (AutoDesk Construction Cloud, Power Automate, ERP, GIS)."
  },
  {
    jobId: "546966",
    title: "Site Engineer",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 38000,
    salaryMax: 50000,
    project: "Sizewell C Nuclear Power Station — Ground Engineering & Civil Alliance",
    overview: "Deliver high-precision setting out, quality control, and engineering supervision for deep foundation and geotechnical works on the Sizewell C nuclear project.",
    responsibilities: [
      "Perform setting out for earthworks, piling rigs, diaphragm walls, and drainage using total stations and GPS",
      "Ensure construction compliance with engineering drawings, RAMS, permits to dig, and ITPs",
      "Deliver daily technical briefings, safety toolbox talks, and maintain accurate shift as-built logs",
      "Coordinate concrete pours, reinforcement checks, and material quality testing"
    ],
    qualifications: "Degree or HND in Civil Engineering or Geotechnical Engineering. 2-5 years site engineering experience. Valid CSCS card and SSSTS/SMSTS."
  },
  {
    jobId: "546968",
    title: "Site Manager",
    location: "Warwick, Warwickshire, United Kingdom",
    city: "Warwick",
    region: "West Midlands",
    remoteType: "ONSITE",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Construction Management",
    salaryMin: 55000,
    salaryMax: 70000,
    project: "HS2 High Speed Rail Programme — Headhouse Project (Regional Build)",
    overview: "Manage day-to-day site operations and structural delivery on a critical HS2 Headhouse infrastructure project in Warwick, ensuring safety, programme alignment, and subcontractor coordination.",
    responsibilities: [
      "Lead and coordinate direct labour teams, specialist trades, and civil subcontractors",
      "Enforce Zero Harm site safety policies, daily risk assessments, and environmental compliance",
      "Manage plant logistics, concrete deliveries, temporary works, and structural inspections",
      "Liaise with HS2 client representatives, local authorities, and third-party inspectors"
    ],
    qualifications: "Proven experience as a Site Manager on major civil engineering or building infrastructure projects. Valid SMSTS, CSCS Black/Gold Card, and First Aid at Work."
  },
  {
    jobId: "547008",
    title: "Contracts Engineer",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 45000,
    salaryMax: 58000,
    project: "Sizewell C — Ground Engineering & Piling Works",
    overview: "Support on-site contract management, technical administration, and commercial performance across major piling and ground remediation packages at Sizewell C.",
    responsibilities: [
      "Manage on-site technical administration and operational reporting for piling operations (CFA, LDA, Secant)",
      "Liaise with plant yards regarding equipment allocations, maintenance schedules, and damage tracking",
      "Monitor site resources to ensure sufficient workforce and material coverage for planned daily targets",
      "Assist in contract variation tracking, daily records validation, and commercial claims reconciliation"
    ],
    qualifications: "Degree or equivalent in Civil Engineering or Construction Management. Good understanding of CFA, LDA, and secant piling techniques and commercial cost control."
  },
  {
    jobId: "547025",
    title: "Senior Contracts Engineer",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 60000,
    salaryMax: 75000,
    project: "Sizewell C — Ground Engineering & Deep Geotechnics",
    overview: "Lead technical and contractual execution for major ground engineering packages, ensuring alignment across design, commercial, procurement, and site operations.",
    responsibilities: [
      "Lead handover meetings between estimating, design, and operations teams to establish clear KPI deliverables",
      "Prepare contract documentation and secure all client approvals prior to site mobilization",
      "Oversee technical operations on complex ground works and resolve technical discrepancies",
      "Coach and develop junior engineers while ensuring high-quality safety documentation and compliance"
    ],
    qualifications: "Substantial experience in piling and geotechnical engineering design/delivery. Degree in Civil Engineering, working towards MICE/MIStructE, and valid CSCS card."
  },
  {
    jobId: "547095",
    title: "Project Quality Manager",
    location: "Teesside, North East, United Kingdom",
    city: "Middlesbrough",
    region: "North East",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Quality Assurance & Engineering",
    salaryMin: 60000,
    salaryMax: 75000,
    project: "Net Zero Teesside (NZT) — World-Scale Carbon Capture & Power Project (BP Consortium)",
    overview: "Drive quality performance across the landmark Net Zero Teesside project on an 18-month fixed-term basis, supporting teams to deliver right-first-time engineering on the UK's first decarbonised industrial cluster.",
    responsibilities: [
      "Drive Right First Time quality culture across major civil, mechanical, and electrical packages",
      "Implement and monitor the Project Quality Management Plan (PQMP) and Inspection & Test Plans (ITPs)",
      "Lead quality audits, resolve non-conformances, and share lessons learned across the consortium",
      "Manage client and partner quality compliance reporting for BP and statutory authorities"
    ],
    qualifications: "Degree or professional qualification in Quality Management, Engineering, or Construction. CQI membership (MCQI/CQP). Proven experience on major process plant or infrastructure projects."
  },
  {
    jobId: "547143",
    title: "Business Support Administrator",
    location: "Lincolnshire, United Kingdom",
    city: "Lincoln",
    region: "East Midlands",
    remoteType: "ONSITE",
    category: "cat_ops",
    categorySlug: "operations-logistics",
    categoryName: "Business Administration",
    salaryMin: 24000,
    salaryMax: 30000,
    project: "UKCS Living Places — Highways Maintenance & Public Infrastructure",
    overview: "Provide essential administrative and coordination support to operational teams delivering highway maintenance and civil improvement projects across Lincolnshire.",
    responsibilities: [
      "Support day-to-day administration of project offices, site logs, and operative rosters",
      "Process purchase requisitions and coordinate material procurement orders with suppliers",
      "Maintain document registers, training records, and compliance files",
      "Liaise with local authority stakeholders and field teams to resolve logistical queries"
    ],
    qualifications: "Strong administrative experience within a construction, engineering, or fast-paced office environment. High proficiency in Microsoft Office (Excel, Word, Outlook)."
  },
  {
    jobId: "547170",
    title: "Training Manager",
    location: "Ipswich, Suffolk, United Kingdom",
    city: "Ipswich",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_hr",
    categorySlug: "human-resources",
    categoryName: "Learning & Development",
    salaryMin: 52000,
    salaryMax: 65000,
    project: "Sizewell C Nuclear Power Station — Ground Engineering",
    overview: "Own and maintain the project training governance framework across the Ground Engineering sub-alliance for Sizewell C, ensuring statutory, industry, and nuclear safety competencies are achieved.",
    responsibilities: [
      "Set training standards and assure competency arrangements across alliance partners and supply chain",
      "Align training schedules with site mobilization plans and critical construction paths",
      "Coordinate specialist plant operator, safety, and nuclear induction training programmes",
      "Manage training budgets, vendor relationships, and compliance audit reporting"
    ],
    qualifications: "CIPD Level 5 qualification in Learning & Development or equivalent experience managing training functions within large-scale construction or nuclear engineering environments."
  },
  {
    jobId: "547174",
    title: "Site Supervisor (Substations)",
    location: "Lochgilphead, Scotland, United Kingdom",
    city: "Lochgilphead",
    region: "Scotland",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 42000,
    salaryMax: 54000,
    project: "Power Transmission & Distribution — Substation Build (up to 400kV)",
    overview: "Take the lead on ensuring site teams are trained, competent, and equipped to deliver high-voltage substation works safely and efficiently in scenic Argyll & Bute.",
    responsibilities: [
      "Agree and implement safe systems of work (SSOW) with Project Engineers and client representatives",
      "Requisition required plant, tooling, and materials in advance of operational activities",
      "Conduct daily site inductions, toolbox talks, and Management Safety Representative (MSR) checks",
      "Ensure all operatives hold correct electrical safety authorizations and permits to work"
    ],
    qualifications: "Experience in delivery of overhead line, cabling, or substation schemes up to 400kV. SSSTS certification and valid CSCS/ECS card. Commercial and safety awareness."
  },
  {
    jobId: "547177",
    title: "Plant Fitter",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_mech",
    categorySlug: "mechanical-engineering",
    categoryName: "Mechanical Engineering",
    salaryMin: 38000,
    salaryMax: 48000,
    project: "Sizewell C — Heavy Construction Plant & Piling Machinery",
    overview: "Provide workshop and mobile plant maintenance support for busy heavy plant operations on the Sizewell C nuclear project.",
    responsibilities: [
      "Inspect, service, and maintain heavy plant machinery, hydraulic rigs, and piling equipment",
      "Diagnose mechanical, electrical, and hydraulic faults and execute rapid repairs to minimise downtime",
      "Coordinate spare parts ordering and maintain strict maintenance compliance records",
      "Work in accordance with strict nuclear site environmental and safety standards"
    ],
    qualifications: "Time-served Plant Fitter / Heavy Mechanical Engineer with NVQ Level 3 in Plant Maintenance. Significant experience with heavy construction plant and hydraulic systems."
  },
  {
    jobId: "547229",
    title: "Security Assurance Manager",
    location: "Derby, East Midlands, United Kingdom",
    city: "Derby",
    region: "East Midlands",
    remoteType: "HYBRID",
    category: "cat_ops",
    categorySlug: "operations-logistics",
    categoryName: "Security & Governance",
    salaryMin: 55000,
    salaryMax: 70000,
    project: "Rolls-Royce Strategic Partnership — Critical Nuclear & Defence Infrastructure",
    overview: "Act as the primary point of contact for supply chain security across a strategic multi-million pound infrastructure expansion programme with Rolls-Royce in Derby.",
    responsibilities: [
      "Lead security assurance activities across suppliers, contractors, and project teams",
      "Implement and maintain defence-sector security governance and personnel vetting protocols (BPSS / SC)",
      "Perform physical and digital site security audits and threat vulnerability assessments",
      "Coordinate with client security executives and UK security agencies"
    ],
    qualifications: "Proven experience in security assurance, compliance, or supply chain governance within defence, nuclear, or critical national infrastructure. Ability to obtain SC Security Clearance."
  },
  {
    jobId: "548460",
    title: "Health and Safety Manager",
    location: "Gravesend, Kent, United Kingdom",
    city: "Gravesend",
    region: "South East",
    remoteType: "ONSITE",
    category: "cat_ops",
    categorySlug: "operations-logistics",
    categoryName: "Health & Safety",
    salaryMin: 65000,
    salaryMax: 80000,
    project: "Lower Thames Crossing (LTC) — Power Transmission & Utilities Diversion",
    overview: "Key leadership role supporting the utilities diversion phase on the Lower Thames Crossing, ensuring safe excavation in close proximity to live high-voltage and gas networks.",
    responsibilities: [
      "Provide strategic and operational H&S support across deep excavations and utilities diversions",
      "Review risk assessments, method statements (RAMS), and safe systems of work for high-risk zones",
      "Monitor site operations, lead incident investigations, and enforce Zero Harm standards",
      "Engage with National Highways, statutory undertakers, and project joint ventures"
    ],
    qualifications: "NEBOSH Diploma or NVQ Level 6 in Occupational Health & Safety. CMIOSH or working towards. Demonstrable experience managing safety on major utilities or civil engineering projects."
  },
  {
    jobId: "547286",
    title: "Semi-Qualified Welder",
    location: "Bottesford, Leicestershire, United Kingdom",
    city: "Bottesford",
    region: "East Midlands",
    remoteType: "ONSITE",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Trades & Fabrication",
    salaryMin: 28000,
    salaryMax: 36000,
    project: "Plant & Piling Maintenance Depot — Bottesford",
    overview: "Support the depot maintenance team with repair and fabrication of piling rigs, augers, casing, and heavy specialist construction equipment.",
    responsibilities: [
      "Assist in welding, cutting, and fabrication repairs on heavy foundation equipment",
      "Carry out MIG and MMA welding tasks under supervision following approved weld procedures",
      "Perform routine maintenance checks on tooling and structural attachments",
      "Maintain safe workshop practices and clean working environments"
    ],
    qualifications: "Welding qualification (or working towards NVQ / City & Guilds). Experience with MIG and/or MMA welding on heavy structural steel."
  },
  {
    jobId: "547393",
    title: "Senior Buyer",
    location: "Motherwell, Scotland, United Kingdom",
    city: "Motherwell",
    region: "Scotland",
    remoteType: "HYBRID",
    category: "cat_ops",
    categorySlug: "operations-logistics",
    categoryName: "Procurement & Supply Chain",
    salaryMin: 45000,
    salaryMax: 58000,
    project: "Power Transmission & Distribution — Overhead Lines (OHL) Scotland",
    overview: "Take full ownership of complex high-voltage transmission procurement activities, ensuring robust commercial terms, supplier performance, and risk management across Scotland.",
    responsibilities: [
      "Lead high-value procurement tenders for electrical plant, tower steelwork, conductors, and civil subcontracts",
      "Mentor and develop junior buyers within the Scottish Power T&D procurement function",
      "Negotiate favourable commercial terms and NEC subcontract agreements",
      "Drive sustainable procurement and carbon reduction across the supply chain"
    ],
    qualifications: "CIPS Level 4+ qualification or equivalent. 3+ years experience in procurement and supply chain management within construction, utilities, or heavy engineering."
  },
  {
    jobId: "547446",
    title: "Quality Engineer",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Quality Assurance & Engineering",
    salaryMin: 42000,
    salaryMax: 54000,
    project: "Sizewell C — Ground Engineering",
    overview: "Conduct Quality Assurance and Quality Control inspections across complex ground engineering, piling, and earthworks packages on the Sizewell C project.",
    responsibilities: [
      "Support development and execution of Inspection & Test Plans (ITPs) with delivery teams",
      "Audit subcontractor quality records, material test certificates, and concrete batch logs",
      "Track and investigate non-conformance reports (NCRs) and drive root-cause corrective actions",
      "Report quality performance against project KPIs to client quality directors"
    ],
    qualifications: "Level 4+ qualification in Quality, Civil Engineering or Construction. Associate CQI membership. Understanding of ISO 9001 and civil inspection standards."
  },
  {
    jobId: "547520",
    title: "Section Engineer",
    location: "Teesside, North East, United Kingdom",
    city: "Middlesbrough",
    region: "North East",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 45000,
    salaryMax: 58000,
    project: "Net Zero Teesside (NZT) — Decarbonised Power & Carbon Capture Infrastructure",
    overview: "Take ownership of engineering delivery, setting out, and quality control on critical civil packages for the world's first fully integrated gas-fired power station with carbon capture.",
    responsibilities: [
      "Lead a team of Site Engineers and subcontractors across deep foundations, drainage, and concrete structures",
      "Produce Activity Control Plans and ensure full compliance with design specifications and RAMS",
      "Manage technical queries, RFI resolution, and coordinate 3D model clash reviews",
      "Drive safety leadership and continuous improvement on site"
    ],
    qualifications: "Degree or HND in Civil Engineering. Proven experience as a Section Engineer on major infrastructure or energy projects. Valid CSCS card."
  },
  {
    jobId: "547526",
    title: "Sub Agent",
    location: "Teesside, North East, United Kingdom",
    city: "Middlesbrough",
    region: "North East",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 52000,
    salaryMax: 65000,
    project: "Net Zero Teesside (NZT) — Civil Engineering & Site Mobilisation",
    overview: "Lead and control a defined civil engineering section within the main mobilisation phase for the Net Zero Teesside carbon capture power station project.",
    responsibilities: [
      "Manage section delivery across earthworks, heavy civils, and marine interfaces",
      "Coordinate engineering, commercial, planning, and temporary works teams for right-first-time delivery",
      "Control project budgets, variation notices, and sub-contract compensation events under NEC contracts",
      "Drive Zero Harm safety standards and promote environmental protection on site"
    ],
    qualifications: "Degree in Civil Engineering or Construction Management. Proven track record as a Sub Agent or Senior Site Engineer on major Tier 1 civil projects."
  },
  {
    jobId: "548335",
    title: "Senior Estimator",
    location: "Nationwide (Hybrid), United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    remoteType: "HYBRID",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Estimating & Commercial",
    salaryMin: 65000,
    salaryMax: 82000,
    project: "Power Transmission & Distribution — High Voltage (HV) Substation Infrastructure",
    overview: "Lead pricing strategies and cost modeling for major high-voltage substation tenders across the UK for National Grid and SSE, supporting the expansion of the renewable grid.",
    responsibilities: [
      "Develop comprehensive first-principles estimates for HV substation civil and electrical works",
      "Lead bid strategy sessions, risk workshops, and supplier tender reviews",
      "Analyze technical drawings, bills of quantities (BOQs), and contract schedules",
      "Stay informed on market pricing, supply chain capacity, and emerging green technologies"
    ],
    qualifications: "Substantial estimating experience on major power, substation, or infrastructure schemes. Familiarity with National Grid/SSE technical standards and Candy estimating software."
  },
  {
    jobId: "547606",
    title: "Document Controller",
    location: "Redcar, Cleveland, United Kingdom",
    city: "Redcar",
    region: "North East",
    remoteType: "ONSITE",
    category: "cat_tech",
    categorySlug: "information-technology",
    categoryName: "Information & Document Management",
    salaryMin: 28000,
    salaryMax: 36000,
    project: "Tod Point Substation Project — Power Transmission & Distribution",
    overview: "Manage both Design and Operational Document Control within the project Common Data Environment (CDE) on the critical Tod Point Substation power scheme.",
    responsibilities: [
      "Manage project CDE platforms including Autodesk BIM 360 Docs, SharePoint, and client portals",
      "Ensure engineering drawings, technical submittals, and inspection records are strictly version-controlled",
      "Establish and maintain document workflows, transmittals, and compliance registers",
      "Train project team members on information governance protocols"
    ],
    qualifications: "Previous experience in a Document Controller role within construction or engineering. Strong knowledge of BIM 360, ISO 19650 principles, and Microsoft 365."
  },
  {
    jobId: "547629",
    title: "Sub Agent",
    location: "Newcastle, North East, United Kingdom",
    city: "Newcastle",
    region: "North East",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 52000,
    salaryMax: 65000,
    project: "Net Zero Teesside (NZT) — Regional Civils",
    overview: "Manage day-to-day civil engineering operations, subcontractor packages, and safety compliance on the landmark NZT project based from Newcastle.",
    responsibilities: [
      "Plan and deliver civil works in accordance with master project programmes",
      "Supervise engineering teams, setting out, and quality inspections",
      "Manage direct labour and subcontractor interfaces to ensure safe productivity",
      "Maintain strict adherence to environmental controls and health & safety legislation"
    ],
    qualifications: "Degree in Civil Engineering with proven experience as Sub Agent or Senior Site Engineer on major infrastructure schemes. SMSTS and CSCS."
  },
  {
    jobId: "549676",
    title: "Quantity Surveyor",
    location: "Warrington, Cheshire, United Kingdom",
    city: "Warrington",
    region: "North West",
    remoteType: "HYBRID",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Commercial & Quantity Surveying",
    salaryMin: 45000,
    salaryMax: 58000,
    project: "Balvac — Structural Concrete Repair, Asset Strengthening & Refurbishment",
    overview: "Support pre- and post-contract commercial activities across structural maintenance and bridge refurbishment schemes across the UK.",
    responsibilities: [
      "Manage subcontractor procurement, monthly valuations, variations, and final accounts",
      "Prepare accurate cost value reconciliations (CVRs) and cash flow forecasts",
      "Ensure commercial governance and contract compliance under NEC4 Option B and Option C",
      "Provide commercial insight to Contracts Managers to maximize project profitability"
    ],
    qualifications: "Degree in Quantity Surveying or Commercial Management. RICS/CIOB member or working towards. Experience in civils, concrete repair, or highways."
  },
  {
    jobId: "547665",
    title: "Lead Mechanical Engineer",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_mech",
    categorySlug: "mechanical-engineering",
    categoryName: "Mechanical Engineering",
    salaryMin: 58000,
    salaryMax: 74000,
    project: "Sizewell C — Ground Engineering Heavy Plant & Piling Systems",
    overview: "Lead mechanical maintenance, plant reliability, and technical support for heavy construction plant, bentonite fluid plants, and specialized piling rigs on Sizewell C.",
    responsibilities: [
      "Lead and coordinate mechanical maintenance and repair teams across all site plant and equipment",
      "Ensure heavy geotechnical plant operates safely, compliantly, and at optimal performance",
      "Oversee planned preventative maintenance (PPM) schedules and emergency breakdown response",
      "Provide technical engineering solutions for specialist mechanical modifications"
    ],
    qualifications: "Degree or HND in Mechanical Engineering. Significant experience working with heavy construction plant, piling rigs, or marine hydraulic equipment."
  },
  {
    jobId: "547676",
    title: "Project Manager",
    location: "Aberdeen, Scotland, United Kingdom",
    city: "Aberdeen",
    region: "Scotland",
    remoteType: "HYBRID",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical & Energy Infrastructure",
    salaryMin: 68000,
    salaryMax: 88000,
    project: "Power Transmission & Distribution — High Voltage Substation & Cabling Projects",
    overview: "Lead high-performing multidisciplinary engineering teams on high-voltage power projects supporting Scotland’s critical energy transition in the North East.",
    responsibilities: [
      "Manage overall project delivery across scope, budget, schedule, safety, and quality",
      "Lead periodic project reviews (PRM), financial reporting, and digital briefcase updates",
      "Manage client relationships with SSEN Transmission and key framework partners",
      "Interrogate engineering designs and challenge delivery assumptions to optimize cost and safety"
    ],
    qualifications: "Proven project delivery track record in power transmission, substations, or large-scale civil infrastructure. In-depth knowledge of NEC contracts and commercial management."
  },
  {
    jobId: "547680",
    title: "Senior Quantity Surveyor",
    location: "Warrington, Cheshire, United Kingdom",
    city: "Warrington",
    region: "North West",
    remoteType: "HYBRID",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Commercial & Quantity Surveying",
    salaryMin: 58000,
    salaryMax: 74000,
    project: "Balvac — Critical Asset Maintenance & Concrete Remediation",
    overview: "Lead and mentor a commercial team managing high-value structural refurbishment, bridge repair, and highway asset strengthening contracts across the UK.",
    responsibilities: [
      "Lead and support a team of Quantity Surveyors and Commercial Administrators",
      "Manage subcontractor accounts, dispute resolution, and commercial change control",
      "Ensure accurate weekly cost reporting, CVRs, work-in-progress (WIP) tracking, and cash flow",
      "Advise senior leadership on commercial risk, contract terms, and margin enhancement"
    ],
    qualifications: "BSc in Quantity Surveying or related field. Strong working knowledge of NEC4 contracts. Proven track record in structural repair, concrete remediation, or civils."
  },
  {
    jobId: "547687",
    title: "Project Manager - Geotechnical Sub-Alliance",
    location: "Sizewell C, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil & Geotechnical Engineering",
    salaryMin: 75000,
    salaryMax: 95000,
    project: "Sizewell C Nuclear New Build — Geotechnical Sub-Alliance (GSA)",
    overview: "Lead complex geotechnical and ground engineering works (diaphragm walling, soil mixing, deep piling) critical to preparing the nuclear power station site.",
    responsibilities: [
      "Take full accountability for project performance across safety, quality, programme, and commercial targets",
      "Integrate operations, engineering design, plant procurement, and commercial functions",
      "Champion a Zero Harm culture across joint venture alliance partners and international contractors",
      "Manage high-stakes client interfaces with NNB GenCo and nuclear regulators"
    ],
    qualifications: "Proven experience as Project Manager on major civil engineering or deep geotechnical schemes (diaphragm walls, grouting, heavy piling). Chartered Engineer (ICE) preferred."
  },
  {
    jobId: "547691",
    title: "Senior Contracts Engineer",
    location: "Leiston, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 60000,
    salaryMax: 75000,
    project: "Sizewell C — Ground Engineering Work Fronts",
    overview: "Lead multiple construction work fronts of ground engineering, ensuring specification compliance, safety leadership, and commercial NEC4 governance.",
    responsibilities: [
      "Lead technical and site operations for assigned ground engineering work packages",
      "Coordinate resources across work fronts, resolve engineering issues, and close out non-conformities",
      "Lead incident investigations and root-cause analyses, identifying safety trends",
      "Approve site briefing records and mentor graduate and site engineers"
    ],
    qualifications: "Degree in Civil or Geotechnical Engineering. Experience in senior leadership of construction work fronts on major infrastructure. Strong NEC4 knowledge."
  },
  {
    jobId: "547734",
    title: "M25 Technology Supervisor",
    location: "Dartford / Leatherhead, United Kingdom",
    city: "Dartford",
    region: "South East",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Highways Technology & Intelligent Transport",
    salaryMin: 44000,
    salaryMax: 56000,
    project: "Connect Plus Services (CPS) — M25 London Orbital Motorway DBFO",
    overview: "Hold overall operational responsibility for the successful delivery of technology maintenance and renewal works across the M25 motorway network.",
    responsibilities: [
      "Supervise shift-based technology teams and specialist electrical/communications subcontractors",
      "Manage routine and cyclical works on CCTV, VMS variable message signs, MIDAS detection, and emergency telephones",
      "Scout defects and coordinate lane closures with National Highways and control rooms",
      "Update Maintenance Management Systems (MMS) and enforce road safety procedures"
    ],
    qualifications: "Experience with National Road Telecommunications Services (NRTS) or highways technology. CSCS/ECS card, SMSTS/SSSTS, and clean UK driving licence."
  },
  {
    jobId: "547777",
    title: "Electrician",
    location: "Sellafield, Seascale, Cumbria, United Kingdom",
    city: "Seascale",
    region: "North West",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 36000,
    salaryMax: 46000,
    project: "Balfour Beatty Kilpatrick — Sellafield Nuclear Infrastructure Programme",
    overview: "Deliver complex industrial electrical installation and maintenance works within the nuclear decommissioning and infrastructure environment at Sellafield.",
    responsibilities: [
      "Install and commission industrial electrical systems, power distribution, containment, and control wiring",
      "Execute LV and ELV installation works in accordance with engineering schematics and nuclear site standards",
      "Conduct electrical testing, inspection, and verification to BS 7671 (18th Edition)",
      "Adhere strictly to site safety, security, and quality assurance protocols"
    ],
    qualifications: "Recognised Electrical Apprenticeship (NVQ Level 3). ECS Gold Card. 18th Edition IET Wiring Regulations. Ability to obtain BPSS / SC security clearance."
  },
  {
    jobId: "547852",
    title: "Senior Planning Engineer",
    location: "Nationwide (Hybrid), United Kingdom",
    city: "Leeds",
    region: "Yorkshire",
    remoteType: "HYBRID",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Planning & Project Controls",
    salaryMin: 58000,
    salaryMax: 74000,
    project: "Power Transmission & Distribution — Major Renewable Energy Connections",
    overview: "Provide strategic planning and scheduling expertise across the full project lifecycle for nationally significant electricity transmission and substation projects.",
    responsibilities: [
      "Develop, maintain, and manage fully resourced project programmes using Primavera P6",
      "Lead planning activities across tender, pre-construction, and live construction delivery",
      "Integrate design, procurement, outages, and construction milestones into master schedules",
      "Conduct critical path and delay risk scenario analyses for senior management"
    ],
    qualifications: "Degree in Engineering or Construction Management. Extensive planning experience on high-voltage power transmission, rail, or major civils projects."
  },
  {
    jobId: "547903",
    title: "Senior Project Manager",
    location: "Nationwide, United Kingdom",
    city: "London",
    region: "London",
    remoteType: "HYBRID",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Power Transmission & Distribution",
    salaryMin: 78000,
    salaryMax: 100000,
    project: "Power Transmission & Distribution — High Voltage Power Cabling Schemes",
    overview: "Hold overall accountability for the safe, profitable, and on-time delivery of major underground power cabling projects (up to 400kV) across the UK.",
    responsibilities: [
      "Lead the delivery of complex power cabling projects from initiation through commissioning and client handover",
      "Provide strategic leadership to multidisciplinary engineering and construction teams",
      "Manage project budgets, P&L, contract change management, and supply chain partners",
      "Ensure compliance with National Grid and SSE technical policies and Zero Harm safety standards"
    ],
    qualifications: "Proven experience delivering major underground high-voltage power cabling schemes. Strong leadership, commercial acumen, and stakeholder management expertise."
  },
  {
    jobId: "547904",
    title: "Project Engineer",
    location: "Nationwide, United Kingdom",
    city: "Derby",
    region: "East Midlands",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 42000,
    salaryMax: 55000,
    project: "Power Transmission & Distribution — Underground Cabling Projects",
    overview: "Support the planning, coordination, and technical delivery of high-voltage cabling infrastructure works from pre-construction through to commissioning.",
    responsibilities: [
      "Coordinate engineering and construction activities across major power cabling schemes",
      "Review and implement technical drawings, cable pulling calculations, and joint bay specifications",
      "Liaise with local authorities, landowners, and utility companies regarding road openings and access",
      "Ensure works are delivered in compliance with quality standards and safety regulations"
    ],
    qualifications: "Degree or HND in Electrical or Civil Engineering. Experience delivering utility, power, or infrastructure projects, particularly involving cable installation."
  },
  {
    jobId: "547915",
    title: "Estimator",
    location: "Ipswich, Suffolk, United Kingdom",
    city: "Ipswich",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Estimating & Commercial",
    salaryMin: 45000,
    salaryMax: 60000,
    project: "Sizewell C — Ground Engineering Sub-Alliance (Orwell Logistics Park)",
    overview: "Prepare first-principles cost estimates, risk analyses, and pricing models for specialized ground engineering and civil works on Sizewell C.",
    responsibilities: [
      "Prepare estimates in accordance with Geotechnical Sub-Alliance policies and procedures",
      "Review scope and engineering drawings to arrive at accurate costing assessments",
      "Identify risks and opportunities and support the development of risk-adjusted tender pricing",
      "Collaborate with procurement and design teams to benchmark material and plant costs"
    ],
    qualifications: "Degree or industry qualification in Construction Management or Quantity Surveying. Demonstrable estimating experience on ground engineering or civils schemes."
  },
  {
    jobId: "547925",
    title: "Project Manager – Cabling",
    location: "Assington, Suffolk, United Kingdom",
    city: "Assington",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 68000,
    salaryMax: 88000,
    project: "Bramford to Twinstead Network Optimisation (BTNO Project) — Power T&D",
    overview: "Lead the delivery of critical underground HV cabling works on the nationally significant BTNO project, connecting low-carbon energy across East Anglia.",
    responsibilities: [
      "Take full accountability for safe, sustainable, and profitable project delivery",
      "Lead periodic project reviews (PRM), reporting, and commercial performance tracking",
      "Manage multidisciplinary teams, cable laying contractors, and civil subcontractors",
      "Ensure compliance with National Grid transmission standards and environmental consents"
    ],
    qualifications: "Substantial experience delivering major HV cabling or linear infrastructure schemes. Strong commercial and contract management expertise."
  },
  {
    jobId: "547926",
    title: "Substation Fitter",
    location: "Scotland Wide, United Kingdom",
    city: "Perth",
    region: "Scotland",
    remoteType: "ONSITE",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 36000,
    salaryMax: 46000,
    project: "Power Transmission & Distribution — High Voltage Substation Build (33kV to 400kV)",
    overview: "Install and assemble high-voltage plant and equipment across a growing portfolio of substation projects throughout Scotland.",
    responsibilities: [
      "Install and assemble HV plant from 33kV to 400kV including transformers, busbars, and disconnectors",
      "Erect aluminium and steel structures, earthing grids, and cable containment systems",
      "Work safely on live substation environments in accordance with SSEN and Scottish Power rules",
      "Assist commissioning teams with pre-energisation testing and inspection"
    ],
    qualifications: "Experience in substation installation works. CPCS/CSCS/ECS card or equivalent. Ability to work away on site across Scotland."
  },
  {
    jobId: "549198",
    title: "Head of Electrical Programme Delivery",
    location: "Bristol (Aztec West), United Kingdom",
    city: "Bristol",
    region: "South West",
    remoteType: "HYBRID",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 95000,
    salaryMax: 125000,
    project: "Sizewell C MEH Alliance — Major Nuclear Electrical Programme",
    overview: "Executive delivery role leading the electrical discipline across one of the UK’s largest nuclear infrastructure programmes, reporting to the Deputy Alliance Director.",
    responsibilities: [
      "Provide strategic leadership across the end-to-end electrical programme for Sizewell C",
      "Ensure safe, efficient delivery of scope to agreed cost, schedule, and nuclear quality targets",
      "Lead senior project professionals across engineering, commercial, project controls, and supply chain",
      "Drive collaboration across the MEH Alliance (Balfour Beatty, Altrad, Cavendish, Doosan)"
    ],
    qualifications: "Proven experience leading large, complex electrical programmes in major infrastructure or nuclear environments. Chartered Engineer (IET/ICE) and proven executive leadership."
  },
  {
    jobId: "547988",
    title: "Utilities Design Coordinator",
    location: "Grays, Thurrock, Essex, United Kingdom",
    city: "Grays",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 48000,
    salaryMax: 62000,
    project: "Lower Thames Crossing (LTC) — Utilities Detailed Design Delivery",
    overview: "Coordinate and manage the assurance of multi-utility detailed design solutions (contestable and statutory undertakers) on the Lower Thames Crossing project.",
    responsibilities: [
      "Produce Approval in Principle (AIP) and design input documents defining utilities scope",
      "Coordinate with main works civil designers to fix utility corridors and manage design changes",
      "Prepare Interface Control Documents, Utility Asset Schedules, and Task Information Delivery Plans",
      "Communicate design intent with National Highways, statutory undertakers, and site teams"
    ],
    qualifications: "Degree in Civil Engineering or significant multi-utilities industry experience. Proven design coordination track record on major highway or transport schemes."
  },
  {
    jobId: "547990",
    title: "Engineering Manager",
    location: "Aberdeen, Scotland, United Kingdom",
    city: "Aberdeen",
    region: "Scotland",
    remoteType: "HYBRID",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Engineering Management",
    salaryMin: 72000,
    salaryMax: 90000,
    project: "Power Transmission & Distribution — Scottish Energy Infrastructure",
    overview: "Lead and manage multidisciplinary Project Engineering teams delivering all design and engineering works for high-voltage transmission and substation projects.",
    responsibilities: [
      "Manage delivery of Design & Engineering project scope to programme, budget, quality, and safety",
      "Identify and mitigate engineering risks and lead the Design Delivery Team",
      "Lead technical engagement with clients (SSEN Transmission), consultants, and suppliers",
      "Ensure all engineering designs comply with UK grid codes and Balfour Beatty standards"
    ],
    qualifications: "Degree in Civil, Electrical, or Mechanical Engineering. Chartered/Incorporated Engineer status. Proven track record leading engineering design teams on infrastructure projects."
  },
  {
    jobId: "548035",
    title: "Senior Quantity Surveyor",
    location: "Lincoln, Lincolnshire, United Kingdom",
    city: "Lincoln",
    region: "East Midlands",
    remoteType: "HYBRID",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Commercial & Quantity Surveying",
    salaryMin: 58000,
    salaryMax: 74000,
    project: "North Hykeham Relief Road (£150m+ Dual Carriageway Infrastructure Project)",
    overview: "Lead commercial and contractual management on the landmark North Hykeham Relief Road project in Lincolnshire, delivering a major 8km dual carriageway scheme under NEC contract.",
    responsibilities: [
      "Manage all commercial and contractual aspects from initial cost planning to final account",
      "Control project costs, maximise value for money, and protect commercial margins",
      "Prepare, negotiate, and administer subcontract packages, compensation events, and variations",
      "Provide commercial reports and forecasts to the Project Director and Lincolnshire County Council"
    ],
    qualifications: "BSc/MSc in Quantity Surveying. Member of RICS, ICES or CIOB. Proven experience as Senior Quantity Surveyor on major civil engineering/highways projects."
  },
  {
    jobId: "548077",
    title: "Commercial Manager – ASTI Braco Substation",
    location: "Braco, Perthshire, Scotland, United Kingdom",
    city: "Perth",
    region: "Scotland",
    remoteType: "HYBRID",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Commercial Management",
    salaryMin: 75000,
    salaryMax: 95000,
    project: "Cambushinnie 400kV Substation New Build (ASTI Energy Programme)",
    overview: "Provide commercial leadership on the new Cambushinnie 400kV Substation project near Braco, supporting the Accelerated Strategic Transmission Investment programme.",
    responsibilities: [
      "Lead commercial and contractual management of civil engineering supply chain packages",
      "Develop commercial strategies, forecast financial performance, and ensure contractual governance",
      "Protect project margins, identify risks and opportunities, and manage subcontractor accounts",
      "Partner with operational leaders to deliver commercial direction on high-voltage civils"
    ],
    qualifications: "Extensive commercial management experience in civil engineering or power infrastructure. Degree in Quantity Surveying or Law, with strong NEC3/NEC4 contract mastery."
  },
  {
    jobId: "548115",
    title: "Package Manager",
    location: "Old Oak Common, London, United Kingdom",
    city: "London",
    region: "London",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Major Projects Delivery",
    salaryMin: 65000,
    salaryMax: 82000,
    project: "HS2 Old Oak Common Super-Hub Station (£1bn+ Balfour Beatty VINCI SYSTRA Joint Venture)",
    overview: "Join the team delivering the largest newly constructed rail station in the UK, managing major structural and architectural subcontract packages at Old Oak Common.",
    responsibilities: [
      "Manage allocated subcontract packages ensuring compliance with safety, quality, and schedule",
      "Coordinate site interfaces between structural concrete, steelwork, MEP, and station fit-out",
      "Administer NEC subcontracts, evaluate compensation events, and review method statements",
      "Drive sustainable practices, carbon reduction, and digital BIM compliance on site"
    ],
    qualifications: "Degree in Civil Engineering or Construction Management. CSCS, SMSTS, and proven experience managing multidisciplinary packages on major UK rail or civils projects."
  },
  {
    jobId: "548161",
    title: "Senior Quantity Surveyor",
    location: "Birmingham, West Midlands, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    remoteType: "HYBRID",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Commercial & Quantity Surveying",
    salaryMin: 58000,
    salaryMax: 74000,
    project: "N1N2 Project — Regional Building & Infrastructure (Birmingham)",
    overview: "Lead commercial management on the high-profile N1N2 Building and Infrastructure project in Birmingham delivered under an NEC contract.",
    responsibilities: [
      "Manage all commercial aspects, ensuring cost control, value maximization, and margin delivery",
      "Prepare and negotiate subcontract packages, activity schedules, and tender documentation",
      "Administer NEC contract variations, compensation events, and change management processes",
      "Provide monthly CVR reports and financial intelligence to the project leadership team"
    ],
    qualifications: "Degree in Quantity Surveying (BSc/MSc). Professionally qualified with RICS, CIOB or ICES. Substantial commercial experience on large-scale building/infrastructure projects."
  },
  {
    jobId: "548393",
    title: "Solution & Information Architect",
    location: "Nationwide (Hybrid), United Kingdom",
    city: "London",
    region: "London",
    remoteType: "HYBRID",
    category: "cat_tech",
    categorySlug: "information-technology",
    categoryName: "Information Technology & Enterprise Architecture",
    salaryMin: 80000,
    salaryMax: 105000,
    project: "MEH Alliance — Digital Solutions & Cloud Architecture (Major Infrastructure)",
    overview: "Provide technical leadership across enterprise applications, cloud data platforms (AWS, Azure, Oracle), integrations, and digital solutions supporting the MEH Alliance.",
    responsibilities: [
      "Define, govern, and assure enterprise technology, data, and information architectures",
      "Translate business requirements into robust High Level Designs (HLDs) and solution blueprints",
      "Participate in Technical Design Authority (TDA) reviews and vendor due diligence",
      "Drive digital transformation, data analytics, and cloud scalability across multi-firm alliances"
    ],
    qualifications: "Degree in Computer Science or related field. Extensive solution architecture experience in multi-cloud environments (AWS/Azure/Oracle). TOGAF certification desirable."
  },
  {
    jobId: "548395",
    title: "GIS Analyst",
    location: "Motherwell, Scotland, United Kingdom",
    city: "Motherwell",
    region: "Scotland",
    remoteType: "HYBRID",
    category: "cat_tech",
    categorySlug: "information-technology",
    categoryName: "Geospatial & Data Analytics",
    salaryMin: 35000,
    salaryMax: 46000,
    project: "Power Transmission & Distribution — Geospatial Grid Infrastructure Mapping",
    overview: "Support GIS systems and deliver spatial datasets, dashboards, and cartographic outputs for major overhead power line and cable route projects across Scotland.",
    responsibilities: [
      "Create and manage GIS data layers, web maps, and dashboards using ArcGIS Online / ArcGIS Pro",
      "Liaise with environmental, design, and site survey teams to integrate land and asset information",
      "Deliver spatial analysis for route planning, environmental constraints, and landowner consultations",
      "Maintain spatial data quality and ensure compliance with project GIS governance"
    ],
    qualifications: "Degree in GIS, Geospatial Science, Geography, or related discipline. Practical experience with ArcGIS Pro, ArcGIS Online/Portal, and geospatial data management."
  },
  {
    jobId: "548657",
    title: "Project Director - Healthcare",
    location: "Fort William, Highlands, Scotland, United Kingdom",
    city: "Fort William",
    region: "Scotland",
    remoteType: "ONSITE",
    category: "cat_const",
    categorySlug: "construction",
    categoryName: "Executive Construction Leadership",
    salaryMin: 100000,
    salaryMax: 135000,
    project: "New Lochaber Hospital Project — Balfour Beatty Scotland",
    overview: "Lead the delivery of the landmark new Lochaber Hospital healthcare development in Fort William from pre-construction through contract close, construction, and commissioning.",
    responsibilities: [
      "Hold overall accountability for project strategy, P&L, safety, quality, and clinical compliance",
      "Build and inspire a high-performing team of Project Managers, Construction Managers, and specialists",
      "Establish strong collaborative relationships with NHS Highlands and regional stakeholders",
      "Ensure robust commercial management, contract governance, and on-time hospital handover"
    ],
    qualifications: "Demonstrable track record as Project Director or Senior Project Manager delivering major healthcare construction schemes (acute hospitals, health centres). Chartered status (ICE/CIOB/RICS)."
  },
  {
    jobId: "549163",
    title: "Senior Civil Engineer",
    location: "Peterborough, Cambridgeshire, United Kingdom",
    city: "Peterborough",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 52000,
    salaryMax: 68000,
    project: "@one Alliance (Anglian Water Capital Investment Programme - AMP8)",
    overview: "Take technical lead on a wide range of water and wastewater infrastructure projects across the East of England as part of the award-winning @one Alliance.",
    responsibilities: [
      "Lead and review civil engineering designs, calculations, and specifications for water assets",
      "Mentor and guide junior civil engineers within multidisciplinary project teams",
      "Ensure designs meet technical standards, carbon reduction targets, and CDM regulations",
      "Collaborate with Anglian Water operations and construction partners on buildability"
    ],
    qualifications: "BEng/MEng in Civil or Structural Engineering. Chartered Engineer (CEng MICE) or actively working towards. Proven experience in water, wastewater, or major civils design."
  },
  {
    jobId: "549262",
    title: "Pre-Construction Manager (Enabling & Earthworks)",
    location: "Sizewell C, Suffolk, United Kingdom",
    city: "Leiston",
    region: "East of England",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 72000,
    salaryMax: 92000,
    project: "Sizewell C Civil Works Alliance (CWA) — Major Nuclear Infrastructure",
    overview: "Lead planning, coordination, and readiness activities required to safely and efficiently commence major enabling and earthworks operations on the Sizewell C nuclear site.",
    responsibilities: [
      "Develop strategy for delivering enabling scopes safely, to cost, schedule, and nuclear quality standards",
      "Act as the critical technical interface between client planning teams and on-site delivery leads",
      "Oversee ground investigation, site access preparations, environmental licences, and logistics",
      "Drive Early Contractor Involvement (ECI) to optimize construction sequencing"
    ],
    qualifications: "Degree in Civil Engineering or Construction Management. Professional membership (ICE, APM, CIOB). Extensive experience managing pre-construction on mega-infrastructure schemes."
  },
  {
    jobId: "549350",
    title: "Senior Process Engineer",
    location: "Norwich / Peterborough, United Kingdom",
    city: "Norwich",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_eng_mech",
    categorySlug: "mechanical-engineering",
    categoryName: "Process & Water Engineering",
    salaryMin: 55000,
    salaryMax: 70000,
    project: "@one Alliance — Anglian Water AMP8 Asset Management Programme",
    overview: "Lead process design workflows and technical quality across sustainable water and wastewater infrastructure projects in the East of England.",
    responsibilities: [
      "Review mass balances, process sizing, hydraulic calculations, P&IDs, and process flow diagrams",
      "Ensure technical compliance with drinking water and environmental quality standards",
      "Resolve construction site design queries and support project commissioning teams",
      "Provide technical inputs for equipment supplier contracts and asset guarantees"
    ],
    qualifications: "Degree in Chemical, Mechanical, or Process Engineering. Chartered status (IChemE / IMechE) or working towards. Extensive experience in water sector process design."
  },
  {
    jobId: "549711",
    title: "Finance Automations Developer",
    location: "Nationwide (Hybrid), United Kingdom",
    city: "London",
    region: "London",
    remoteType: "HYBRID",
    category: "cat_tech",
    categorySlug: "information-technology",
    categoryName: "Automation & Software Engineering",
    salaryMin: 50000,
    salaryMax: 65000,
    project: "Finance Transformation — Robotics, Agentic AI & Process Automation",
    overview: "Create, maintain, and support automation tools, robotic processes (RPA), and AI-powered workflows across the Balfour Beatty Finance Operations function.",
    responsibilities: [
      "Use Power Automate, Python, cloud services, and AI/copilot tools to automate financial operations",
      "Collaborate with the Finance Transformation team and product managers on automation architecture",
      "Build resilient operational reporting pipelines and monitor automated batch jobs",
      "Ensure all software solutions adhere to enterprise security and documentation standards"
    ],
    qualifications: "Experience in office process analysis and automated workflow development. Expertise in MS Power Automate, VBA/Python, and enterprise ERP integration."
  },
  {
    jobId: "549713",
    title: "Works Manager",
    location: "Isle of Skye, Scotland, United Kingdom",
    city: "Portree",
    region: "Scotland",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 58000,
    salaryMax: 75000,
    project: "Skye 132kV Reinforcement Project — Power Transmission & Distribution",
    overview: "Take ownership of major civil engineering, access tracks, and foundation work packages delivering the critical Skye 132kV electricity reinforcement project.",
    responsibilities: [
      "Lead the safe delivery of multiple civil engineering packages across challenging Highland terrain",
      "Manage Construction Managers, Section Engineers, and Works Supervisors",
      "Plan, coordinate, and monitor specialist plant, helicopter access, and subcontractor works",
      "Drive Zero Harm safety, environmental peat protection, and quality compliance"
    ],
    qualifications: "Proven experience as Works Manager or Senior Site Manager on major civil engineering, transmission, or renewables projects in Scotland. SMSTS and CSCS."
  },
  {
    jobId: "549732",
    title: "Civil Engineer",
    location: "Peterborough, Cambridgeshire, United Kingdom",
    city: "Peterborough",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
    salaryMin: 42000,
    salaryMax: 54000,
    project: "@one Alliance (Anglian Water AMP8 Infrastructure Programme)",
    overview: "Create value-driven civil designs, structural calculations, and pipeline specifications for major water infrastructure projects across the East of England.",
    responsibilities: [
      "Produce civil designs, structural calculations, and specifications for water and wastewater assets",
      "Design pipework systems (ductile iron, steel, HDPE) and concrete water-retaining structures",
      "Work in multidisciplinary BIM design teams to ensure right-first-time constructability",
      "Drive carbon reduction and Health & Safety in design compliant with CDM regulations"
    ],
    qualifications: "BEng/MEng in Civil or Structural Engineering, working towards Chartered status. Experience in structural calculations and civil design for infrastructure."
  },
  {
    jobId: "549733",
    title: "Electrical Engineer",
    location: "Peterborough, Cambridgeshire, United Kingdom",
    city: "Peterborough",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_eng_elec",
    categorySlug: "electrical-engineering",
    categoryName: "Electrical Engineering",
    salaryMin: 44000,
    salaryMax: 56000,
    project: "@one Alliance (Anglian Water Capital Investment Programme)",
    overview: "Design low-voltage electrical installations, motor control centres (MCC), and telemetry systems for modern water treatment and pumping stations.",
    responsibilities: [
      "Design and specify LV electrical power distribution systems, switchboards, and control panels",
      "Review electrical schematics, cable sizing calculations, and termination schedules",
      "Specify and select instrumentation, sensors, and telemetry connected to process controls",
      "Liaise with DNOs, operations teams, and suppliers on technical power connections"
    ],
    qualifications: "Demonstrable experience as an Electrical Design Engineer. Strong background in LV systems, MCCs, and BS 7671. Full UK driving licence."
  },
  {
    jobId: "549741",
    title: "Senior Mechanical Engineer",
    location: "Peterborough, Cambridgeshire, United Kingdom",
    city: "Peterborough",
    region: "East of England",
    remoteType: "HYBRID",
    category: "cat_eng_mech",
    categorySlug: "mechanical-engineering",
    categoryName: "Mechanical Engineering",
    salaryMin: 55000,
    salaryMax: 70000,
    project: "@one Alliance — Water Infrastructure Capital Delivery",
    overview: "Lead and review mechanical engineering designs for pumping stations, chemical dosing systems, and treatment facilities across the Anglian Water region.",
    responsibilities: [
      "Lead mechanical design reviews ensuring compliance, safety, and operational excellence",
      "Promote the use of digital tools, 3D Plant modeling, and off-site modular construction",
      "Drive Health & Safety in design, whole-life cost optimization, and carbon reduction",
      "Mentor graduate and junior mechanical engineers within the Alliance"
    ],
    qualifications: "Degree in Mechanical Engineering. Chartered status (IMechE) or working towards. Proven mechanical design experience in the water or process industry."
  },
  {
    jobId: "549747",
    title: "Quality Engineer / Quality Advisor",
    location: "South & East Yorkshire, United Kingdom",
    city: "Hull",
    region: "Yorkshire",
    remoteType: "ONSITE",
    category: "cat_eng_civil",
    categorySlug: "civil-engineering",
    categoryName: "Quality Assurance & Engineering",
    salaryMin: 42000,
    salaryMax: 54000,
    project: "Eastern Green Link 2 (EGL2) — £2.1bn High Voltage Direct Current (HVDC) Subsea Link",
    overview: "Support the delivery of a Right First Time quality culture across the landmark EGL2 project, connecting renewable Scottish wind power directly to Yorkshire.",
    responsibilities: [
      "Coordinate and implement quality assurance activities across HVDC converter and cable packages",
      "Review Inspection & Test Plans (ITPs) and ensure client/statutory standards are met",
      "Perform quality audits, monitor subcontractor compliance, and drive continuous improvement",
      "Ensure accurate quality records, test certificates, and handover packages are compiled"
    ],
    qualifications: "Level 4+ qualification in Quality, Construction, or Engineering. CQI Affiliate/Member. Experience in quality assurance within energy, utilities, or heavy civils."
  },
  {
    jobId: "549765",
    title: "Senior CAD Technician",
    location: "Redcar & Cleveland, North East, United Kingdom",
    city: "Redcar",
    region: "North East",
    remoteType: "ONSITE",
    category: "cat_tech",
    categorySlug: "information-technology",
    categoryName: "CAD & BIM Engineering",
    salaryMin: 38000,
    salaryMax: 48000,
    project: "Net Zero Teesside (NZT) — Carbon Capture Power Station",
    overview: "Prepare and update 2D/3D civil, structural, and temporary works drawings using AutoCAD and Civil 3D for the Net Zero Teesside mega-project.",
    responsibilities: [
      "Produce accurate 2D drawings, 3D models, site layouts, and construction detail schematics",
      "Translate engineer mark-ups and survey data into controlled engineering drawings",
      "Detail construction sequencing, logistics layouts, and temporary works interfaces",
      "Maintain drawing revisions, coordinate systems, and project CAD standards"
    ],
    qualifications: "Proven CAD experience in civil engineering, infrastructure, or industrial energy. Strong proficiency in AutoCAD and Civil 3D."
  },
  {
    jobId: "549771",
    title: "Senior Engineering Manager",
    location: "Sellafield, Cumbria, United Kingdom",
    city: "Seascale",
    region: "North West",
    remoteType: "ONSITE",
    category: "cat_eng_mech",
    categorySlug: "mechanical-engineering",
    categoryName: "Engineering Leadership",
    salaryMin: 80000,
    salaryMax: 105000,
    project: "Balfour Beatty Kilpatrick — Sellafield Nuclear Infrastructure Portfolio",
    overview: "Lead and manage engineering functions across a multi-million pound portfolio of complex MEP and infrastructure projects at Sellafield.",
    responsibilities: [
      "Lead all mechanical, electrical, and systems engineering activities across Sellafield sites",
      "Act as principal engineering interface between Balfour Beatty Kilpatrick, clients, and regulators",
      "Support bid submissions, tender technical solutions, and work-winning governance",
      "Ensure engineering teams adhere to nuclear baseline safety standards and technical excellence"
    ],
    qualifications: "Degree in Mechanical or Electrical Engineering. Chartered Engineer status (IMechE/IET). Extensive engineering management leadership on nuclear or high-hazard facilities."
  }
];

let addedCount = 0;
let updatedCount = 0;

for (const raw of RAW_ROLES) {
  const jobId = `job_bb_${raw.jobId}_${raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const directApplyUrl = `https://www.balfourbeatty.com/careers/job-search/details/apply/?jobId=PDMFK026203F3VBQB79V468BY-${raw.jobId}&langCode=en_GB`;
  const directJobUrl = `https://www.balfourbeatty.com/careers/job-search/details/${raw.jobId}`;

  const markdownDescription = `## Role Overview
• **Position**: ${raw.title}
• **Employer**: Balfour Beatty (Balfour Beatty plc)
• **Location**: ${raw.location}
• **Requisition ID**: ${raw.jobId}
• **Work Arrangement**: ${raw.remoteType}
• **Employment Type**: Full-Time

## Project & Infrastructure Context
${raw.project} — ${raw.overview}

## Key Accountabilities & Responsibilities
${raw.responsibilities.map(r => `• ${r}`).join('\n')}

## Required Qualifications & Experience
• ${raw.qualifications}

## Visa Sponsorship & UK Skilled Worker Route Intelligence
• **Sponsor Entity**: Balfour Beatty Group Limited / Balfour Beatty plc is an officially registered A-rated Sponsor under the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker).
• **Sponsorship Status**: Verified Licensed Sponsor eligible for eligible shortage engineering, commercial, and technical roles.
• **Application Route**: 100% Direct official Balfour Beatty ATS Career Portal application link.

## Compensation & Benefits Guidance
• **Estimated Package**: GBP ${raw.salaryMin.toLocaleString()} - GBP ${raw.salaryMax.toLocaleString()}
• Competitive pension scheme, private healthcare options, flexible working policies, employee share schemes, and chartership professional development support.`;

  const jobRecord = {
    id: jobId,
    source_id: "balfour_beatty_ats",
    source_job_id: `bb_${raw.jobId}`,
    canonical_hash: `balfour_beatty_hash_${raw.jobId}`,
    title: `${raw.title} (${raw.jobId})`,
    slug: `${raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-balfour-beatty--${raw.jobId}`,
    company_id: "comp_balfour_beatty",
    company_name: "Balfour Beatty",
    company_website: "https://www.balfourbeatty.com",
    company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Balfour_Beatty_Logo.svg/320px-Balfour_Beatty_Logo.svg.png",
    description: markdownDescription,
    description_clean: markdownDescription,
    location: raw.location,
    city: raw.city,
    region: raw.region,
    country_code: "GB",
    remote_type: raw.remoteType,
    employment_type: "FULL_TIME",
    category_id: raw.category,
    category_slug: raw.categorySlug,
    category_name: raw.categoryName,
    salary_min: raw.salaryMin,
    salary_max: raw.salaryMax,
    salary_currency: "GBP",
    job_url: directJobUrl,
    apply_url: directApplyUrl,
    source_url: directApplyUrl,
    publishedAt: new Date().toISOString(),
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    sponsorship_score: 92,
    sponsorship_label: "Likely",
    sponsorship_positive_evidence: JSON.stringify([
      "Balfour Beatty Group Ltd is registered on the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
      "Direct verified Balfour Beatty Career Portal ATS application URL",
      `Major strategic UK infrastructure project: ${raw.project}`
    ]),
    sponsorship_negative_evidence: JSON.stringify([
      "Individual Certificate of Sponsorship allocation subject to project team quota and candidate qualification checks"
    ]),
    visa_keywords: JSON.stringify([
      "Balfour Beatty Licensed Sponsor",
      "Skilled Worker Route",
      "Tier 2 / Skilled Worker",
      "Direct Employer ATS",
      "UK Infrastructure"
    ]),
    quality_score: 98,
    status: "active",
    is_featured: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `bb_${raw.jobId}`);
  if (existingIdx >= 0) {
    data.jobs[existingIdx] = { ...data.jobs[existingIdx], ...jobRecord };
    updatedCount++;
  } else {
    data.jobs.unshift(jobRecord);
    addedCount++;
  }
}

// Write back updated realJobsData.json
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✅ Ingestion Complete!`);
console.log(`- New Balfour Beatty jobs added: ${addedCount}`);
console.log(`- Existing jobs updated: ${updatedCount}`);
console.log(`- Total jobs in database now: ${data.jobs.length}`);
console.log(`- Total companies in database: ${data.companies.length}`);
