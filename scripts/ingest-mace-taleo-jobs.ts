import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runSeed } from "./seed";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface MaceTaleoJob {
  reqId: string;
  title: string;
  url: string;
  location: string;
  city: string;
  region: string;
  country_code: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  remote_type: "ONSITE" | "HYBRID" | "REMOTE";
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  project: string;
  description_points: string[];
  qualifications: string[];
  sponsorship_note: string;
}

export const MACE_TALEO_JOBS: MaceTaleoJob[] = [
  {
    reqId: "45104",
    title: "Senior Commercial Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=45104&lang=en",
    location: "Birmingham, West Midlands, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Curzon Street station is a new £800m HS2 project in Birmingham city centre providing a catalyst for regional development and a centre of excellence for best practice reporting.",
    description_points: [
      "Administer contractual terms and conditions for suppliers and sub-contractors",
      "Oversee the assessment of Early Warning Notices (EWNs) and compensation events",
      "Provide regular cash flow forecasts of expenditure and report expenditure against Incentive Target monthly",
      "Manage the change management process and consult with other functions to assess risks to overall project out-turn",
      "Produce monthly consolidated project-wide cost/expenditure reports and manage monthly valuation processes",
      "Manage adjudication of claims, contractor accounts finalisation, and contract close-out"
    ],
    qualifications: [
      "Extensive commercial management experience on major infrastructure/rail projects",
      "Strong NEC3/NEC4 contract administration expertise",
      "Degree in Quantity Surveying, Commercial Management or RICS/CIOB accreditation"
    ],
    sponsorship_note: "Mace Ltd is a registered UK Home Office Licensed Sponsor (Skilled Worker Route) eligible for eligible engineering and commercial candidates."
  },
  {
    reqId: "41321",
    title: "Senior Cost Controller",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=41321&lang=en",
    location: "Birmingham, West Midlands, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 60000,
    salary_max: 78000,
    salary_currency: "GBP",
    project: "Curzon Street station £800m HS2 project in Birmingham city centre within the Project Controls team.",
    description_points: [
      "Collaborate with disciplines to establish, monitor, and update project budgets throughout the lifecycle",
      "Monitor actual quantities and costs against forecast and budgets, identifying variances and reporting findings",
      "Implement and maintain Earned Value Management (EVM) systems integrating cost, schedule, and scope",
      "Prepare regular cost and quantity forecasts highlighting potential overruns and recommending corrective actions",
      "Review, analyse, and process change orders ensuring all cost impacts are captured"
    ],
    qualifications: [
      "Solid background in construction financial management and EVM principles",
      "Experience on mega-infrastructure or rail projects",
      "Degree in Quantity Surveying, Construction Management, or relevant financial discipline"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor (Skilled Worker route available for qualified professionals)."
  },
  {
    reqId: "45151",
    title: "Operations Director - Project Management (M5)",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=45151&lang=en",
    location: "Oxford, Oxfordshire, United Kingdom",
    city: "Oxford",
    region: "Oxfordshire",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 110000,
    salary_max: 140000,
    salary_currency: "GBP",
    project: "Major Life Sciences Project in Oxford.",
    description_points: [
      "Leads the delivery of key assignments and oversees the implementation of Major Project strategies",
      "Provides strategic direction and monitors delivery aligned with overall vision and objectives",
      "Determines and assembles project team resources including specialist appointments and recruitment",
      "Converts client vision into a deliverable plan exploiting Construction to Production (C2P), Net Zero Carbon, and Digital & Data innovation",
      "Acts as primary relationship owner and contact for Mace executive team engagement and client CRM"
    ],
    qualifications: [
      "Proven leadership in major life sciences, healthcare, or high-tech complex construction schemes",
      "Chartered status (RICS, CIOB, APM, or ICE)",
      "Strong executive stakeholder and governance management capability"
    ],
    sponsorship_note: "Eligible for UK Skilled Worker sponsorship under Mace Ltd."
  },
  {
    reqId: "46557",
    title: "Senior Construction Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=46557&lang=en",
    location: "Norwich, Norfolk, United Kingdom",
    city: "Norwich",
    region: "Norfolk",
    country_code: "GB",
    category_id: "cat_eng_struct",
    category_slug: "structural-engineering",
    category_name: "Structural Engineering",
    remote_type: "ONSITE",
    salary_min: 65000,
    salary_max: 82000,
    salary_currency: "GBP",
    project: "Lasdun Wall redevelopment: Phase One refurbishment delivering modern teaching & laboratory spaces towards a net zero campus by 2045.",
    description_points: [
      "Responsible for the delivery of large work packages on the Lasdun Wall project to agreed safety, quality, programme and budget",
      "Make operational decisions on sequencing methodology and develop short/mid/long term plans",
      "Lead lookahead forecast meetings and coordinate trade/sub-contractors",
      "Own Safety, Wellbeing and Quality deliverables for designated project sections"
    ],
    qualifications: [
      "Strong site management track record on structural refurbishment and laboratory facilities",
      "SMSTS, CSCS Black/Gold Card, NVQ Level 6/7 in Construction Management",
      "Proficient in modern construction sequencing and QA processes"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "44570",
    title: "Senior Project Manager (M3)",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=44570&lang=en",
    location: "West London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Hyperscale Data Centre in West London.",
    description_points: [
      "Lead projects to deliver agreed outcomes within time, cost, and quality requirements",
      "Guide and coordinate with client, design teams, and contractors to deliver project objectives and KPIs",
      "Manage technical services and external resources required for complex data centre infrastructure",
      "Procure and manage design consultants and ensure risk mitigation and change management"
    ],
    qualifications: [
      "Demonstrated experience delivering mission-critical facilities or hyperscale data centres",
      "Degree in Civil/Structural/Building Engineering or Project Management",
      "Professional chartership or APM/CIOB accreditation"
    ],
    sponsorship_note: "Eligible for UK Skilled Worker sponsorship under Mace Ltd."
  },
  {
    reqId: "39291",
    title: "Associate Construction Director - Infrastructure, Civil and Build",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=39291&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 100000,
    salary_max: 130000,
    salary_currency: "GBP",
    project: "Infrastructure, Civil and Build portfolio delivering major UK and international capital programmes.",
    description_points: [
      "Champion safety first and be accountable for safety, quality, cost, programme, and sustainability compliance",
      "Oversee delivery from project inception/brief, through design development, planning, contractor procurement to construction",
      "Oversee project management on an individual and team basis from inception to post-completion",
      "Manage project budgets and ensure operations are fiscally and ethically viable"
    ],
    qualifications: [
      "Senior director-level track record across major civil engineering and building infrastructure",
      "Degree in Civil Engineering, Construction Management or Chartered status (ICE/CIOB)",
      "High-level client relationship and commercial governance expertise"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed employer."
  },
  {
    reqId: "43725",
    title: "Skills, Employment and Education Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=43725&lang=en",
    location: "Birmingham, West Midlands, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 50000,
    salary_max: 65000,
    salary_currency: "GBP",
    project: "Curzon Street station £800m HS2 project in Birmingham city centre.",
    description_points: [
      "Develop and implement the project Employment and Education Strategy in full compliance with contractual requirements",
      "Make effective use of client Brokerage Service to maximise local employment, apprenticeship and skills outcomes",
      "Ensure SEE and EDI objectives and KPIs are embedded across project teams and supply chains",
      "Oversee subcontractors' training and workforce development arrangements"
    ],
    qualifications: [
      "Experience managing social value, apprenticeships, and skills development on UK public infrastructure",
      "Strong stakeholder engagement with local authorities and educational bodies"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45672",
    title: "Lawyer (Construction)",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=45672&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Mace Legal Department supporting construction business units and major contracts.",
    description_points: [
      "Review construction contracts received with client tenders to identify risks to Mace",
      "Negotiate and draft construction contracts and supply chain step-down contracts",
      "Advise commercial teams on contract review, execution, and ad hoc project issues",
      "Assist in managing and mitigating potential dispute situations and insurance notifications"
    ],
    qualifications: [
      "2-3 years PQE qualified lawyer in England & Wales or recognized jurisdiction",
      "Strong knowledge of JCT, NEC and bespoke forms of construction contract"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "45783",
    title: "Senior Digital Engineering and BIM Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=45783&lang=en",
    location: "Nottingham, Nottinghamshire, United Kingdom",
    city: "Nottingham",
    region: "Nottinghamshire",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Large scale construction project in Nottingham within Public, Science & Technology Business Unit.",
    description_points: [
      "Lead BIM Manager on a large scale construction project in Nottingham",
      "Support clients and project teams with information requirements, standards, and Common Data Environment (CDE) management",
      "Develop and update BIM Execution Plans (BEP) and client digital handover strategies per ISO 19650",
      "Produce information requirements (OIR, AIR, PIR, EIR) and oversee assurance and checking of information models"
    ],
    qualifications: [
      "Extensive experience in BIM management and digital engineering under ISO 19650",
      "Proficient in Autodesk Construction Cloud, Revit, Navisworks, and Solibri",
      "Degree in Architecture, Engineering, or Digital Construction"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor (Skilled Worker Route)."
  },
  {
    reqId: "38440",
    title: "MEP Project Director - Hyperscale Data Centres",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=38440&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 110000,
    salary_max: 145000,
    salary_currency: "GBP",
    project: "Hyperscale Data Centre in London (Public, Science & Technology Business Unit).",
    description_points: [
      "Accountable for delivery of MEP services on a hyperscale data centre project to agreed outcomes for time, budget, safety, and quality",
      "Lead Technical and Construction MEP teams ensuring compliance, governance, and assurance",
      "Lead MEP tendering process and provide technical and commercial support to bid teams",
      "Establish procurement strategies and manage commissioning and QA of complex electrical/mechanical plant"
    ],
    qualifications: [
      "Extensive senior leadership in hyperscale data centre MEP design and commissioning",
      "Chartered Electrical/Mechanical Engineer (CENG/IET/CIBSE)",
      "Deep understanding of mission-critical power, cooling, and resilience architectures"
    ],
    sponsorship_note: "Eligible for UK Skilled Worker sponsorship."
  },
  {
    reqId: "36388",
    title: "MEP Lead - Hyperscale Data Centre",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=36388&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 80000,
    salary_max: 105000,
    salary_currency: "GBP",
    project: "Hyperscale Data Centre in London.",
    description_points: [
      "Drive the MEP construction and site delivery team, ensuring compliance with Mace standards",
      "Hold full accountability for construction aspects of MEP services, site health, safety, quality, and commissioning",
      "Deploy project strategic plans such as Prefabrication (C2P), Commissioning, and digital monitoring",
      "Oversee programme review processes with trade specialists, checking for productivity and trade-to-trade coordination"
    ],
    qualifications: [
      "Proven MEP package management on data centres or complex mission-critical facilities",
      "Degree or HND in Electrical, Mechanical or Building Services Engineering",
      "Strong understanding of commissioning and C2P offsite prefabrication"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "44997",
    title: "Senior Project Manager - MEP Mechanical Project Lead",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=44997&lang=en",
    location: "Central London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_mech",
    category_slug: "mechanical-engineering",
    category_name: "Mechanical Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "£250m+ project in Central London in early stages (Commercial Business Unit).",
    description_points: [
      "Act as Mechanical Lead on a £250m+ commercial development in Central London",
      "Accountable for delivery of MEP mechanical building services to time, budget, safety, and quality",
      "Manage programme, QA, testing, and commissioning of HVAC, public health, and mechanical packages",
      "Assist in budget preparation, value engineering, trade contracts, and procurement strategies"
    ],
    qualifications: [
      "Extensive experience leading mechanical building services on major commercial developments",
      "Degree in Mechanical Engineering or Building Services Engineering (BSc/BEng/MSc)",
      "CIBSE or IMechE membership preferred"
    ],
    sponsorship_note: "Eligible for UK Skilled Worker sponsorship."
  },
  {
    reqId: "41203",
    title: "Operations Director Project Management - MEP / Commissioning Lead",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=41203&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 110000,
    salary_max: 140000,
    salary_currency: "GBP",
    project: "Major MEP Commissioning and Project Management programmes across UK Construct business.",
    description_points: [
      "Act as Commissioning Lead and strategic MEP Operations Director across complex build programmes",
      "Accountable for leading safety, quality, cost, programme, sustainability, and project compliance",
      "Implement programme delivery environments across People, Organisation, Process, and Technology",
      "Support long-term development of strategy for MEP business units"
    ],
    qualifications: [
      "Extensive leadership in building services commissioning management for major infrastructure",
      "Chartered Engineer status (CIBSE/IET/IMechE)",
      "Exceptional commercial and client relationship management skills"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "40727",
    title: "Associate Project Director - MEP",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=40727&lang=en",
    location: "Nottingham, Nottinghamshire, United Kingdom",
    city: "Nottingham",
    region: "Nottinghamshire",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 90000,
    salary_max: 115000,
    salary_currency: "GBP",
    project: "Large scale construction project in Nottingham within Public, Science & Technology Business Unit.",
    description_points: [
      "Accountable for delivery of MEP services to agreed outcomes for time, budget, safety, and quality",
      "Manage technical and construction staff and foster strong relationships with client and consultants",
      "Drive tendering process, procurement strategies, and contract review",
      "Input into delivery strategies ensuring key milestones and commissioning outcomes are achieved"
    ],
    qualifications: [
      "Senior MEP project delivery leadership experience on major science or public schemes",
      "Degree in Electrical, Mechanical or Building Services Engineering",
      "Chartered status or professional membership preferred"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "40307",
    title: "MEP Commercial Lead - Operations Director (M5)",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=40307&lang=en",
    location: "West London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 105000,
    salary_max: 135000,
    salary_currency: "GBP",
    project: "Hyperscale Data Centre – West London: state-of-the-art high-tech construction project.",
    description_points: [
      "Oversee MEP commercial operations and financial governance across all construction phases",
      "Direct and supervise delivery of key commercial assignments ensuring compliance and cost efficiency",
      "Own executive-level client relationship and convert client vision into deliverable onsite commercial plans",
      "Full budgetary oversight and financial accountability"
    ],
    qualifications: [
      "Senior commercial leadership on hyperscale data centre MEP packages or major industrial schemes",
      "Degree in Quantity Surveying, Commercial Management or MRICS",
      "Extensive experience in high-value MEP subcontract negotiation and dispute avoidance"
    ],
    sponsorship_note: "UK Skilled Worker sponsorship eligible."
  },
  {
    reqId: "46100",
    title: "Senior Commercial Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=46100&lang=en",
    location: "Birmingham, West Midlands, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Curzon Street station £800m HS2 project in Birmingham city centre.",
    description_points: [
      "Oversee and manage cost and contract management aspects from initiation to close-out",
      "Administer contractual terms for suppliers and sub-contractors",
      "Oversee EWN assessments, compensation events, and monthly cash flow expenditure forecasts",
      "Manage monthly valuation processes and adjudication of claims"
    ],
    qualifications: [
      "Extensive commercial and quantity surveying experience on major UK rail/infrastructure",
      "Degree in Quantity Surveying or Commercial Management",
      "Chartered MRICS or MCIOB preferred"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "42903",
    title: "MEP Project Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=42903&lang=en",
    location: "Birmingham, West Midlands, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 82000,
    salary_currency: "GBP",
    project: "Curzon Street HS2 Station £800m station development in Birmingham.",
    description_points: [
      "Manage review and delivery of all aspects of MEP design for Curzon Street HS2 Station",
      "Ensure programme, budget, and compliance of design to HS2 technical standards",
      "Review MEP design consultants and CDP contractors' deliverables against Design Responsibility Matrix",
      "Assist in development and coordination of MEP BIM Model regarding constructability and commissionability"
    ],
    qualifications: [
      "Experience in MEP design management on UK rail or station infrastructure",
      "Degree in Electrical, Mechanical or Building Services Engineering",
      "Familiarity with HS2 standards, BIM workflows, and multidisciplinary design coordination"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46562",
    title: "Construction Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=46562&lang=en",
    location: "Norwich, Norfolk, United Kingdom",
    city: "Norwich",
    region: "Norfolk",
    country_code: "GB",
    category_id: "cat_eng_struct",
    category_slug: "structural-engineering",
    category_name: "Structural Engineering",
    remote_type: "ONSITE",
    salary_min: 55000,
    salary_max: 70000,
    salary_currency: "GBP",
    project: "Lasdun Wall refurbishment in Norwich (university teaching and laboratory facility).",
    description_points: [
      "Manage delivery of specific work packages on Lasdun Wall project to agreed Safety, Quality, Cost, and Programme KPIs",
      "Responsible for Structure and/or Fit Out of specific area/package including site conditions and safe working standards",
      "Lead lookahead meetings and provide planned vs actual data for works in designated area",
      "Coordinate trade/sub-contractors and implement project digital strategy"
    ],
    qualifications: [
      "Proven site construction management experience on building structures and fit-out",
      "SMSTS, CSCS Black/Gold, NVQ Level 6",
      "Strong coordination and problem-solving skills"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "42739",
    title: "HR Business Partner",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=42739&lang=en",
    location: "Oxford, Oxfordshire, United Kingdom",
    city: "Oxford",
    region: "Oxfordshire",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 55000,
    salary_max: 72000,
    salary_currency: "GBP",
    project: "Major laboratory project with a build value in excess of £1bn in Oxford.",
    description_points: [
      "Act as HR manager driving operational HR delivery for a £1bn+ laboratory build project",
      "Support line managers with resource management, employee relations, and talent attraction",
      "Facilitate annual reward reviews, career framework alignment, and employee retention plans",
      "Partner with the wider business to enable smooth onboarding and career growth"
    ],
    qualifications: [
      "CIPD qualified HR Business Partner with experience on major construction or engineering programmes",
      "Strong background in employee relations, recruitment, and organizational development"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46840",
    title: "Senior Commercial Manager - MEP",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=46840&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 80000,
    salary_max: 100000,
    salary_currency: "GBP",
    project: "Multi-million pound project in Central London within in-house Mechanical & Electrical Subcontractor (Mace MEP).",
    description_points: [
      "Lead Senior Commercial Manager on a multi-million pound Central London MEP project",
      "Cost management of complex MEP works packages, risk management, and profit optimization",
      "Administer monthly commercial procedures including Cost Value Reports (CVR) and client applications",
      "Address subcontractor claims, approve invoices, issue IPCs, and manage MEP specialist fees"
    ],
    qualifications: [
      "Degree in Quantity Surveying or Commercial Management with valid CSCS card",
      "Proven track record leading MEP commercial packages from a specialist subcontractor or tier-1 perspective",
      "Expert knowledge of contract law, variations measurement, and commercial risk mitigation"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed employer."
  },
  {
    reqId: "40945",
    title: "Information Security Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=40945&lang=en",
    location: "Birmingham / London, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    country_code: "GB",
    category_id: "cat_tech_sec",
    category_slug: "cybersecurity",
    category_name: "Cybersecurity",
    remote_type: "HYBRID",
    salary_min: 70000,
    salary_max: 90000,
    salary_currency: "GBP",
    project: "Mace Dragados Joint Venture (MDJV) for new HS2 Euston and Curzon Street Stations.",
    description_points: [
      "Maintain and continuously improve Information Security Management System (ISMS) across HS2 Euston and Curzon Street stations",
      "Ensure compliance with client contractual cybersecurity obligations, ISO 27001, and Cyber Essentials Plus",
      "Maintain disaster recovery plans and incident response protocols for critical national infrastructure",
      "Lead ICT Security team in implementing and maintaining secure IT systems and Data Protection compliance"
    ],
    qualifications: [
      "Proven experience as an Information Security Manager on major infrastructure or JV programmes",
      "Certifications: CISSP, CISM, ISO 27001 Lead Auditor/Implementer, or equivalent",
      "Deep understanding of UK CNI cybersecurity standards and GDPR compliance"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor (Skilled Worker Route)."
  },
  {
    reqId: "44490",
    title: "Environmental and Sustainability Lead",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=44490&lang=en",
    location: "Birmingham, West Midlands, United Kingdom",
    city: "Birmingham",
    region: "West Midlands",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 82000,
    salary_currency: "GBP",
    project: "Curzon Street station £800m HS2 project in Birmingham city centre.",
    description_points: [
      "Establish and oversee project sustainability and environmental strategy and implementation",
      "Lead production, maintenance, and compliance of Environmental Management Plans (EMPs) and EMS",
      "Ensure compliance with HS2 Environmental Minimum Requirements (EMR): Code of Construction Practice, Heritage, Planning, and Environmental Memorandums",
      "Lead environmental incident and complaints investigations"
    ],
    qualifications: [
      "Degree in Environmental Science, Sustainability, or Civil/Environmental Engineering",
      "IEMA Full Membership / Chartered Environmentalist (CEnv)",
      "Extensive experience with UK major infrastructure environmental compliance and HS2 EMR"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed employer."
  },
  {
    reqId: "45425",
    title: "Procurement Manager (M2)",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=45425&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 60000,
    salary_max: 75000,
    salary_currency: "GBP",
    project: "Mace Construct Limited commercial procurement operations across London capital developments.",
    description_points: [
      "Engage with internal and external stakeholders to deliver workstream procurement on time and to KPI targets",
      "Deliver procurement plans, market due diligence, and commercial value creation",
      "Coordinate team activities and support proactive management of carbon reduction in supply chains",
      "Lead supplier negotiations and contract package formation"
    ],
    qualifications: [
      "MCIPS or CIPS qualified / underway",
      "Proven procurement experience in UK construction and subcontract package management",
      "Strong commercial acumen and negotiation capabilities"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "43539",
    title: "Senior Health and Safety Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=43539&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 70000,
    salary_max: 88000,
    salary_currency: "GBP",
    project: "Mace Dragados Joint Venture (MDJV) for new HS2 Euston Station delivering new platforms, concourse structures, and rail interchange links.",
    description_points: [
      "Act as H&S advisor across the HS2 Euston Station project, ensuring best practice professional standards",
      "Define local strategies and methods to initiate and implement change to improve project H&S performance",
      "Provide technical H&S advice to MDJV leadership to achieve project safety targets",
      "Advise on and interpret project contractual and statutory health & safety requirements"
    ],
    qualifications: [
      "NEBOSH Diploma or equivalent Level 6 safety qualification (GradIOSH/CMIOSH)",
      "Extensive experience in mega-scale civils, rail, or deep station construction safety management",
      "Strong leadership and contractor auditing capability"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47061",
    title: "Senior Health and Safety Manager - Heathrow Airport",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=47061&lang=en",
    location: "Heathrow Airport, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 70000,
    salary_max: 88000,
    salary_currency: "GBP",
    project: "Infrastructure Business Unit on an ongoing framework at Heathrow Airport.",
    description_points: [
      "Lead H&S advisory on site on a daily basis at Heathrow Airport aviation infrastructure framework",
      "Maintain core areas of safety expertise and mentor project teams and trade contractors",
      "Implement continuous improvement methods and carry out safety audits in live aviation environment",
      "Ensure compliance with UK statutory requirements and Heathrow Airport airside/landside safety protocols"
    ],
    qualifications: [
      "NEBOSH Diploma / NVQ Level 5/6 with CMIOSH / GradIOSH status",
      "Demonstrated safety leadership on aviation or major operational transport infrastructure",
      "Airside pass eligibility and strong airside safety knowledge"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "42045",
    title: "Project Administration Assistant (S4)",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=42045&lang=en",
    location: "Oxford, Oxfordshire, United Kingdom",
    city: "Oxford",
    region: "Oxfordshire",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "ONSITE",
    salary_min: 28000,
    salary_max: 34000,
    salary_currency: "GBP",
    project: "Major project site in Oxford.",
    description_points: [
      "Provide document management and general administration support to site project team in Oxford full time",
      "Organise internal and external meetings, presentations, documents, equipment, and room bookings",
      "Order office stationery and PPE, ensuring office is maintained within H&S standards",
      "Manage distribution groups and visitor welcoming"
    ],
    qualifications: [
      "Experience in site administration or document control in construction",
      "Proficient in Microsoft Office (Word, Excel, Outlook, PowerPoint)"
    ],
    sponsorship_note: "Direct employer vacancy."
  },
  {
    reqId: "42364",
    title: "Associate Commercial Director - Construction (M4)",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=42364&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 95000,
    salary_max: 125000,
    salary_currency: "GBP",
    project: "Consult & Construct business supporting major global programmes (including social and flood infrastructure programmes).",
    description_points: [
      "Steer Construction Operations and commercial consultancy teams through major periods of growth",
      "Accountable for safety, quality, cost, programme, sustainability, and compliance standards",
      "Oversee project operations to ensure fiscal and ethical viability and legislative compliance",
      "Lead client relationships and deliver large-scale infrastructure consultancy commissions"
    ],
    qualifications: [
      "Senior commercial leadership across complex international infrastructure frameworks",
      "Chartered MRICS or FCIOB qualification",
      "Proven track record managing high-performing commercial consultancy teams"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "39286",
    title: "Senior Construction Manager - Infrastructure, Civil and Build",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=39286&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Major Infrastructure, Civil and Build projects across the Mace Construct portfolio.",
    description_points: [
      "Work as part of senior construction delivery team taking direction from Construction Lead and SLT",
      "Build relationships to manage and influence senior stakeholders and support turning client vision into deliverable onsite plans",
      "Ensure budgets and operations are fiscally viable and meet compliance obligations",
      "Commit to positive impact for people, clients, and planet through sustainable delivery"
    ],
    qualifications: [
      "Degree in Civil Engineering, Structural Engineering, or Construction Management",
      "Extensive site leadership on large civils, earthworks, foundations, and building schemes",
      "SMSTS and CSCS Platinum/Black Card"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed employer."
  },
  {
    reqId: "42937",
    title: "Senior Facades Project Manager",
    url: "https://macecareers.taleo.net/careersection/ext_construct/jobdetail.ftl?job=42937&lang=en",
    location: "Oxford, Oxfordshire, United Kingdom",
    city: "Oxford",
    region: "Oxfordshire",
    country_code: "GB",
    category_id: "cat_eng_struct",
    category_slug: "structural-engineering",
    category_name: "Structural Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Major project in Oxford.",
    description_points: [
      "Responsible for managing teams to deliver reporting on productivity, schedule, and quality for facades/cladding",
      "Manage preconstruction and off-site manufacturing activities including directing installation works on site",
      "Plan and monitor cladding and curtain walling works against programme, managing PPC updates",
      "Coordinate with overall site logistics and resolve interface issues between envelope trades"
    ],
    qualifications: [
      "Proven expertise in complex architectural facades, unitized curtain walling, rainscreens, and structural glazing",
      "Degree in Façade Engineering, Structural Engineering, or Construction Management",
      "Strong QA/QC, CWCT standards, and building envelope testing knowledge"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45646",
    title: "Senior Stakeholder Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45646&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 82000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client directing all workstream leads.",
    description_points: [
      "Accountable for supporting specialist stakeholder management functions on assigned commissions",
      "Design and implement effective Stakeholder Management frameworks and strategies",
      "Manage and direct clients, consultants, contractors, and project teams on stakeholder communications",
      "Provide comprehensive advice on stakeholder standards, risk management, and issue escalation"
    ],
    qualifications: [
      "Extensive stakeholder and communications management experience on high-profile global corporate programmes",
      "Experience within life sciences or major capital works"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45655",
    title: "Senior Scheduler",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45655&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Lead application of planning/scheduling methods, techniques, and tools (Primavera P6)",
      "Apply deep knowledge of scheduling, Earned Value Management (EVM), and project controls methodologies",
      "Communicate effectively with client and stakeholders, analyzing critical paths and corrective measures",
      "Lead and manage a team of professionals delivering planning/schedule management services"
    ],
    qualifications: [
      "Expert knowledge of Primavera P6, EVM, and schedule risk analysis",
      "Experience on complex pharmaceutical, life sciences, or major capital schemes",
      "Degree in Engineering, Construction, or Project Management"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "45649",
    title: "Senior Procurement Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45649&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 70000,
    salary_max: 90000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Category Management and leadership across procurement workstreams",
      "Manage relationship management, market due diligence, and commercial activity",
      "Lead plan development, monitoring, and delivery via procurement specialists",
      "Provide performance management, coaching, and senior stakeholder management"
    ],
    qualifications: [
      "MCIPS qualified with extensive category management and major capital procurement background",
      "Experience in life sciences, cleanrooms, or high-tech facility procurement"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47220",
    title: "Health, Safety and Environment Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47220&lang=en",
    location: "Dubai, United Arab Emirates",
    city: "Dubai",
    region: "Dubai",
    country_code: "AE",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 240000,
    salary_max: 320000,
    salary_currency: "AED",
    project: "Complex large-scale modern smart urban development including villas, townhouses, apartments, retail, and offices.",
    description_points: [
      "Champion delivery and compliance of Health, Safety and Wellbeing standards across assigned mega projects",
      "Lead preparation and readiness for ISO 9001, ISO 14001, ISO 45001 and external audits",
      "Oversee inspection and audit programmes and analyze findings to drive risk mitigation",
      "Manage incident investigations and embed sustainable, low-carbon working practices"
    ],
    qualifications: [
      "Level 3+ safety qualifications and professional membership (NEBOSH Diploma/International Diploma, IOSH)",
      "Extensive HSE management experience on large-scale masterplan or high-end residential developments in UAE/GCC",
      "Strong knowledge of UAE HSE legislation and audit management systems"
    ],
    sponsorship_note: "UAE Employment Visa & Relocation sponsorship provided by Mace Middle East."
  },
  {
    reqId: "46817",
    title: "Delivery Assurance Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46817&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "IMRWR Alliance leadership team establishing ISO-compliant quality assurance models.",
    description_points: [
      "Establish and maintain an ISO principle compliant quality assurance and quality control framework",
      "Accountable for KPI management, document control, quality processes, programme audits, and compliance monitoring",
      "Oversee implementation of Three Line-of-Defence (LoD) assurance model across hub-and-spoke organisation",
      "Assure partner compliance with Alliance governance, performance, and regulatory requirements"
    ],
    qualifications: [
      "Proven leadership in major alliance governance, quality assurance, and Three Lines of Defence models",
      "CQI/IRCA or relevant quality management certifications",
      "Experience in regulated water, rail, or infrastructure sectors"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "43938",
    title: "Control Documental (Document Controller)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=43938&lang=en",
    location: "Bogotá, Colombia",
    city: "Bogotá",
    region: "Cundinamarca",
    country_code: "CO",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 60000000,
    salary_max: 90000000,
    salary_currency: "COP",
    project: "Uno de los proyectos viales más importantes de Colombia con inversión de 8.800 millones de pesos colombianos.",
    description_points: [
      "Gestión y administración de plataformas tecnológicas de control documentario como Aconex",
      "Administración de permisos, flujos de trabajo, trazabilidad de planos y entregables de infraestructura vial",
      "Soporte a herramientas de reporting (Power BI, Tableau) y tableros de gobernanza",
      "Aplicación de estándares ISO 19650 y gestión proactiva de información para reducción de emisiones"
    ],
    qualifications: [
      "Profesional con al menos 5 años de experiencia en gestión de información en infraestructura vial",
      "Dominio experto de plataforma Aconex y manejo deseable de Power BI",
      "Conocimiento de estándares ISO 19650 y arquitectura de información"
    ],
    sponsorship_note: "Contrato local en Colombia con Mace Consult."
  },
  {
    reqId: "45650",
    title: "Senior Project Engineer MEP",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45650&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 82000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Analyse, rectify, and manage completion of MEP design using technical expertise and management processes",
      "Coordinate and collaborate with project subcontractors, suppliers, and design consultants",
      "Accountable for programme, HSW, cost, and quality deliverables of designated MEP systems",
      "Establish and manage package interfaces and technical risk mitigation plans"
    ],
    qualifications: [
      "Degree in Mechanical, Electrical or Building Services Engineering",
      "Proven project engineering on pharmaceutical, cleanroom, or mission-critical facilities",
      "Strong coordination and package delivery skills"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45588",
    title: "Project Controls Lead",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45588&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 80000,
    salary_max: 100000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Manage PMO and Project Controls performance across assigned commissions",
      "Design and implement PMO and Project Controls framework/strategy (cost, schedule, change, risk)",
      "Provide expert advice to project teams on governance, reporting, and escalation of management issues",
      "Accountable for developing and managing project baselines (scope, time, cost, risk, assumptions)"
    ],
    qualifications: [
      "Extensive leadership in project controls and PMO for major capital/pharmaceutical investments",
      "Proficient in Primavera P6, Prism/CostX, Power BI, and risk modelling tools",
      "Degree in Engineering, Construction, or Finance with APM/AACE credentials"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "45590",
    title: "Commissioning Lead",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45590&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_mech",
    category_slug: "mechanical-engineering",
    category_name: "Mechanical Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Lead commissioning, qualification, and validation (CQV) activities across pharmaceutical build projects",
      "Manage external certification audits and internal audit programmes",
      "Lead root cause analysis of non-conformances and recommend preventative measures",
      "Coordinate review of management system content and drive commissioning efficiency"
    ],
    qualifications: [
      "Degree in Mechanical, Electrical, Chemical Engineering or CQV discipline",
      "Deep understanding of GMP, FDA, and MHRA commissioning standards for pharma facilities",
      "Proven track record in IQ/OQ/PQ execution"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47223",
    title: "Commercial Manager - Hinkley Point C (Nuclear)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47223&lang=en",
    location: "Somerset / Bristol, United Kingdom",
    city: "Bristol",
    region: "South West",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Hinkley Point C (HPC) nuclear new build project in the UK delivering low-carbon electricity.",
    description_points: [
      "Provide commercial support to manage Responsible Designer (RD) contract on Hinkley Point C",
      "Act as first line of commercial contact to HPC Project and Engineering community for RD matters",
      "Adopt role of 'Intelligent Customer' ensuring commercial probity and fair supply chain treatment",
      "Manage commercial management of contracts during execution, change control, and final accounting"
    ],
    qualifications: [
      "Extensive commercial and contract management experience in nuclear, energy, or mega-infrastructure",
      "NEC3/NEC4 contract expertise",
      "MRICS or relevant commercial degree"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45645",
    title: "Health & Safety Lead",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45645&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 70000,
    salary_max: 88000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Support implementation of Health, Safety and Wellbeing (HSW) policies and standards",
      "Conduct audits and inspections on behalf of business and resolve third-party audit non-conformities",
      "Analyse results of audits, corrective actions, and KPIs to identify continuous improvement gaps",
      "Lead incident investigations and provide leadership to safety managers and professionals"
    ],
    qualifications: [
      "NEBOSH Diploma or equivalent Level 6 safety accreditation (CMIOSH)",
      "Experience in pharmaceutical, industrial, or complex construction safety governance",
      "Strong leadership and auditor capability"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47221",
    title: "Senior Planning Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47221&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Large scale infrastructure programme involving complex civil, structural, and MEP works across multiple sites (new town development, advanced tech facilities).",
    description_points: [
      "Lead application of advanced planning and scheduling methodologies to drive programme certainty",
      "Apply planning, EVM, and project controls expertise to inform strategic decision-making",
      "Communicate insights and performance analysis clearly to clients and stakeholders",
      "Manage and develop high-performing planning teams delivering best-practice schedules"
    ],
    qualifications: [
      "Expert knowledge of Primavera P6, EVM, and multi-site infrastructure scheduling",
      "Degree in Construction, Civil Engineering, or Project Management",
      "APM, CIOB, or ICE professional membership preferred"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "47217",
    title: "Civil and Structural Engineer",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47217&lang=en",
    location: "London / International, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_struct",
    category_slug: "structural-engineering",
    category_name: "Structural Engineering",
    remote_type: "HYBRID",
    salary_min: 55000,
    salary_max: 75000,
    salary_currency: "GBP",
    project: "Complex large-scale modern smart urban development (villas, townhouses, apartments, retail, offices).",
    description_points: [
      "Establish and maintain secondary control and provide accurate dimensional control for contractor works",
      "Support site inspections and collate quality records for verification of construction activities",
      "Review design information against onsite works to ensure technical alignment",
      "Maintain detailed site diary and contribute to low-carbon delivery practices"
    ],
    qualifications: [
      "Degree in Civil or Structural Engineering with over 5 years experience",
      "Class 1 or Class 2 Supervision Certificate with strong understanding of construction methods",
      "Working toward ICE/IStructE chartership"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45493",
    title: "Project Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45493&lang=en",
    location: "New York, NY, United States",
    city: "New York",
    region: "New York",
    country_code: "US",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 130000,
    salary_max: 130000,
    salary_currency: "USD",
    project: "Global delivery consultancy project management across major US capital programs.",
    description_points: [
      "Manage end-to-end project delivery ensuring quality systems, programme alignment, and milestone completion",
      "Oversee budgets, risks, and functional improvements aligned with Mace standards",
      "Lead and collaborate with project, design, and consultant teams driving innovation and best practice",
      "Champion safety first and stakeholder coordination"
    ],
    qualifications: [
      "Bachelor's degree in Construction Management, Civil Engineering or related field",
      "Proven project management experience in US commercial/infrastructure markets",
      "PMP, CCM or CMAA credential preferred"
    ],
    sponsorship_note: "US Work Authorization / Mace North America direct employment."
  },
  {
    reqId: "45589",
    title: "Senior Design Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45589&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Lead and manage design resources for major pharma projects from inception through delivery",
      "Manage daily operations of design managers and present KPI data to leadership",
      "Act as focal point for design-related matters, developing design management tools and operating processes",
      "Support procurement routes, contractual and technical alignment of design packages"
    ],
    qualifications: [
      "Extensive experience in design management for high-tech, pharmaceutical or complex build schemes",
      "Degree in Architecture, Civil/Structural Engineering, or Building Services",
      "RIBA/ARB/ICE/IStructE or equivalent chartered status"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "44573",
    title: "HSW Senior Manager - Central Government",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=44573&lang=en",
    location: "Weybridge, Surrey, United Kingdom",
    city: "Weybridge",
    region: "Surrey",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 70000,
    salary_max: 88000,
    salary_currency: "GBP",
    project: "Large-scale Central Government programme based in Weybridge, Surrey & London office.",
    description_points: [
      "Support implementation of health, safety, and wellbeing policies across Central Government delivery partner role",
      "Liaise with client counterparts within bounds of common agreements to ensure collaborative HSW management",
      "Carry out site inspections on behalf of Delivery Partner, holding contractors to account",
      "Provide timely HSW reporting to intelligent client functions and Senior Responsible Officers"
    ],
    qualifications: [
      "NEBOSH Diploma or equivalent with CMIOSH status",
      "Experience working in UK central government, public estate, or highly secure operational environments",
      "Eligible for UK Security Clearance (SC)"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47215",
    title: "Civil and Structural Engineer",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47215&lang=en",
    location: "London / International, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_struct",
    category_slug: "structural-engineering",
    category_name: "Structural Engineering",
    remote_type: "HYBRID",
    salary_min: 55000,
    salary_max: 75000,
    salary_currency: "GBP",
    project: "Large scale smart urban development portfolio (villas, townhouses, residential, and commercial).",
    description_points: [
      "Establish and maintain secondary dimensional control for contractor works",
      "Support site QA/QC inspections and collate quality records for verification",
      "Review engineering drawings and technical submittals against onsite construction activities",
      "Maintain detailed site records and support low-carbon construction practices"
    ],
    qualifications: [
      "Degree in Civil or Structural Engineering with 5+ years site engineering experience",
      "Class 1/2 Supervision Certification with thorough knowledge of concrete, steel, and substructure works"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "45492",
    title: "Construction Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45492&lang=en",
    location: "New York, NY, United States",
    city: "New York",
    region: "New York",
    country_code: "US",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 130000,
    salary_max: 130000,
    salary_currency: "USD",
    project: "Mace North America global delivery consultancy operations.",
    description_points: [
      "Support senior construction leadership, guiding teams and coordinating trade contractors to deliver programme",
      "Implement Mace onsite standards and ensure robust QA to final sign-off",
      "Manage multiple large work packages, budgeting, and programme milestones",
      "Contribute to net-zero goals through responsible delivery and proactive carbon reduction"
    ],
    qualifications: [
      "Recognized construction qualification (NVQ/HNC/CIOB/Degree in Construction Management)",
      "OSHA 30, SMSTS or equivalent site safety certifications",
      "5+ years construction management experience managing large multi-trade work packages"
    ],
    sponsorship_note: "US Direct Hire / Mace North America."
  },
  {
    reqId: "45647",
    title: "PMO Lead",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45647&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Manage PMO and Project Controls performance across assigned pharmaceutical commissions",
      "Design and implement PMO frameworks covering cost, schedule, change, risk, and reporting",
      "Accountable for developing and managing project baselines (scope, time, cost, risk, assumptions)",
      "Facilitate and drive periodic reporting and structured governance performance reviews"
    ],
    qualifications: [
      "Proven PMO leadership on multi-million pound capital programmes",
      "Proficient in PMWeb, Power BI, SharePoint, and Primavera P6",
      "APM, PMI, or Prince2 Practitioner accreditation"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45591",
    title: "Senior Construction Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45591&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Work as part of Senior Construction Delivery Team taking direction from Construction Lead and SLT",
      "Promote Construction to Production (C2P), Digital & Data, and short-term delivery plans",
      "Own Safety, Wellbeing, and Quality deliverables for designated project sections",
      "Lead lookahead meetings and manage strong relationships with client and design teams"
    ],
    qualifications: [
      "Proven senior construction site leadership on pharmaceutical or high-spec commercial builds",
      "SMSTS, CSCS Black Card, and relevant construction degree",
      "Thorough understanding of QA/QC and commissioning handovers"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "43316",
    title: "Construction Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=43316&lang=en",
    location: "New York, NY, United States",
    city: "New York",
    region: "New York",
    country_code: "US",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 130000,
    salary_max: 130000,
    salary_currency: "USD",
    project: "Mace North America delivery consultancy schemes.",
    description_points: [
      "Support senior construction leadership coordinating trade contractors to deliver safety and quality",
      "Provide strong technical expertise ensuring robust QA to final sign-off",
      "Manage multiple large work packages, MEP, and commissioning coordination",
      "Drive continuous improvement and proactive carbon reduction"
    ],
    qualifications: [
      "Degree in Construction Management, Civil Engineering, or equivalent",
      "OSHA certification with SMSTS/CSCS or US equivalents",
      "5+ years supervising commercial construction packages"
    ],
    sponsorship_note: "US Direct Hire / Mace North America."
  },
  {
    reqId: "43402",
    title: "CQV Scheduler",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=43402&lang=en",
    location: "New York, NY, United States",
    city: "New York",
    region: "New York",
    country_code: "US",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 110000,
    salary_max: 110000,
    salary_currency: "USD",
    project: "Commissioning, Qualification & Validation (CQV) scheduling on pharmaceutical/biotech facilities.",
    description_points: [
      "Direct key assignments and planning performance ensuring CQV activities and tenders are effectively scheduled",
      "Apply deep planning knowledge of sequencing plans, procurement routes, and validation phases",
      "Produce tailored Primavera P6 schedule outputs for client and CQV stakeholders",
      "Foster collaboration, knowledge sharing, and constructive challenge capability"
    ],
    qualifications: [
      "Degree in Engineering or Project Management with professional accreditation (CIOB, APM, PMI)",
      "Expert knowledge of Primavera P6 applied to CQV pharmaceutical lifecycles",
      "Experience with FDA/GMP qualification stages (IQ/OQ/PQ)"
    ],
    sponsorship_note: "US Direct Hire / Mace North America."
  },
  {
    reqId: "45513",
    title: "Senior Quantity Surveyor",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45513&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 82000,
    salary_currency: "GBP",
    project: "Mace Consult business delivering multidisciplinary complex projects from inception through completion.",
    description_points: [
      "Lead project planning, procurement, cost planning, and contract execution",
      "Manage delivery from project brief through design development, contractor procurement, and construction",
      "Manage tasks and deliverables in support of Associate Directors and client commercial teams",
      "Ensure robust quality systems in line with service excellence"
    ],
    qualifications: [
      "MRICS qualified Quantity Surveyor with 5+ years experience in cost consultancy",
      "Degree in Quantity Surveying or Commercial Management",
      "Strong client-facing and contract administration skills"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45586",
    title: "Project Director",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45586&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 110000,
    salary_max: 140000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Direct coordination and delivery of sub-programmes in alignment with overall vision and strategic objectives",
      "Implement programme delivery environments across People, Organisation, Process, and Technology",
      "Primary contact for Mace Business Unit Director engagement and client leadership",
      "Direct and maintain exceptional safety, quality, cost, programme, and sustainability standards"
    ],
    qualifications: [
      "Senior director-level experience in pharmaceutical or major scientific facility delivery",
      "Chartered professional (RICS, CIOB, APM, ICE)",
      "High-level strategic governance and risk leadership"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "45587",
    title: "Senior Scheduler",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45587&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Owner’s Representative engagement for a global pharmaceutical client.",
    description_points: [
      "Lead application of planning and scheduling tools and Earned Value Management (EVM)",
      "Communicate schedule analysis, critical path trends, and corrective measures to client teams",
      "Manage and develop planning team professionals",
      "Support carbon emission tracking and net zero goals in project scheduling"
    ],
    qualifications: [
      "Advanced planning skills in Primavera P6 and EVM",
      "Experience on complex pharmaceutical capital projects",
      "Degree in Engineering, Construction or related discipline"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47171",
    title: "Senior Risk Manager - Mobility Infrastructure",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47171&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Mace Mobility business: large-scale aviation, rail, highways, ports and transportation programmes across the UK.",
    description_points: [
      "Direct risk management activities across major UK mobility infrastructure programmes",
      "Develop and implement risk management frameworks, governance, and assurance strategies",
      "Facilitate qualitative and quantitative risk analysis (QSRA/QCRA) workshops with clients and delivery teams",
      "Work closely with PMO, planning, and project controls to drive programme performance"
    ],
    qualifications: [
      "Extensive risk management experience using Primavera Risk Analysis (PRA) or @RISK on major transport schemes",
      "Member of IRM, APM, or ICE",
      "Degree in Engineering, Risk Management, or Mathematics"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "46925",
    title: "Senior Planning Manager - Net Zero Energy",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46925&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 80000,
    salary_max: 100000,
    salary_currency: "GBP",
    project: "UK Energy Sector Net Zero capital expenditure programmes (£900bn capital expenditure).",
    description_points: [
      "Ensure consistent application of coding structures, planning standards, and risk-adjusted logic across schedule inputs",
      "Govern schedule updates, baseline control, and reporting cycles",
      "Manage scenario modelling and impact assessments to support decision-making for major changes and emerging risks",
      "Provide clear visibility from short-term lookaheads to key milestones"
    ],
    qualifications: [
      "Membership of APM, RICS, CIOB, ICE, or AACE",
      "Extensive experience planning complex programmes in Energy, Utilities, or Low-Carbon technology",
      "Deep property and infrastructure project management expertise"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "41353",
    title: "Senior Project Controls Manager - Nuclear New Build (Sizewell C)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=41353&lang=en",
    location: "Suffolk / London, United Kingdom",
    city: "Suffolk",
    region: "East of England",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 85000,
    salary_max: 110000,
    salary_currency: "GBP",
    project: "Sizewell C (SZC) 3.2-gigawatt nuclear power station generating clean electricity for 6 million homes.",
    description_points: [
      "Create and design effective PMO and project controls frameworks on Sizewell C nuclear megaproject",
      "Support best-in-class service delivery, governance, and reporting across critical work packages",
      "Lead integration of cost, schedule, change, and risk disciplines",
      "Engage with wider industry and professional bodies to promote Mace PMO excellence"
    ],
    qualifications: [
      "Extensive project controls leadership on nuclear (SZC/HPC), defence, or mega-infrastructure projects",
      "Degree in Engineering, Construction Management or Project Controls",
      "APM, AACE, or ACostE professional accreditation"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47161",
    title: "Senior Manager, Interface and Configuration Management",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47161&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 360000,
    salary_max: 480000,
    salary_currency: "SAR",
    project: "One of the largest programmes in Saudi Arabia: major mixed-use development including sports facilities, entertainment, arts, and transport infrastructure.",
    description_points: [
      "Lead systems engineering approach to interface, integration, and configuration management across portfolio",
      "Ensure critical interfaces are identified, controlled, traceable, and validated throughout lifecycle",
      "Support safe, integrated transport systems aligning with ISO 15288, EN 50126/29, and EN 50716",
      "Coordinate with director of safety and certification to support approvals from regulatory authorities"
    ],
    qualifications: [
      "Degree in Systems Engineering, Civil Engineering, Electrical Engineering, or related field",
      "Extensive experience in Interface & Configuration Management on mega-rail or transit projects",
      "Knowledge of ISO 15288, EN 50126, EN 50128, EN 50129 standards"
    ],
    sponsorship_note: "Saudi Arabia Work Visa & Relocation Package provided by Mace Middle East."
  },
  {
    reqId: "46957",
    title: "Assistant Cost Manager - Saudi National",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46957&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 140000,
    salary_max: 180000,
    salary_currency: "SAR",
    project: "Landmark multipurpose sports, entertainment, and cultural venue in Riyadh.",
    description_points: [
      "Assist with feasibility studies, procurement strategies, and contract selection reports",
      "Support value management, estimating, and cost planning activities for project cost plans",
      "Participate in full procurement process: tender enquiries, bid analysis, contractor selection",
      "Support cost control, financial reporting, and contract administration"
    ],
    qualifications: [
      "Saudi National with Bachelor's degree in Quantity Surveying or Civil/Construction Engineering",
      "2-4 years experience in cost management or estimating",
      "Working towards RICS or SCE accreditation"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "47165",
    title: "Director System Safety and Assurance",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47165&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 480000,
    salary_max: 650000,
    salary_currency: "SAR",
    project: "Major mixed-use gigaproject & integrated transport system in Saudi Arabia.",
    description_points: [
      "Lead portfolio-wide safety assurance across transport systems from design through operations",
      "Define safety assurance lifecycle including V&V, safety risk, governance, evidence, and ALARP compliance",
      "Ensure system safety risks are tolerable and meet recognized standards (EN 50126/28/29, ISO 26262)",
      "Coordinate independent safety assessors (ISA), audits, and technical approval submissions"
    ],
    qualifications: [
      "Director-level system safety engineering leader with extensive railway/transit experience",
      "Chartered Engineer (CEng) with degree in Systems, Electrical, or Mechanical Engineering",
      "Deep expertise in EN 50126, EN 50128, EN 50129 and CSM-RA"
    ],
    sponsorship_note: "Saudi Arabia Work Visa & Expat Relocation Package provided."
  },
  {
    reqId: "47174",
    title: "Operations Director - Planning (Gatwick Northern Runway)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47174&lang=en",
    location: "Gatwick Airport, West Sussex, United Kingdom",
    city: "Gatwick",
    region: "West Sussex",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 110000,
    salary_max: 140000,
    salary_currency: "GBP",
    project: "Gatwick Northern Runway Programme (NPR): generational aviation infrastructure development delivering economic and sustainability benefits.",
    description_points: [
      "Lead simultaneous delivery of multiple integrated projects within Gatwick NPR programme",
      "Manage planning function to achieve strategic outcomes, KPIs, and programme governance",
      "Provide strong leadership to senior teams ensuring projects and tenders are effectively planned",
      "Interface with airport authority, airlines, regulators, and delivery partners"
    ],
    qualifications: [
      "Proven director-level experience managing planning teams on major airport or transport capital programmes",
      "Chartered status (APM, CIOB, ICE) and deep knowledge of aviation operations and airfield construction",
      "Based in Gatwick Airport (4 days per week)"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "46708",
    title: "Planning Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46708&lang=en",
    location: "Dubai, United Arab Emirates",
    city: "Dubai",
    region: "Dubai",
    country_code: "AE",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 300000,
    salary_max: 380000,
    salary_currency: "AED",
    project: "Landmark residential community development in Dubai: nature-led living environment with extensive green spaces and sustainable infrastructure.",
    description_points: [
      "Develop detailed and fully integrated Primavera P6 plans reflecting logistics, site, and project constraints",
      "Interface with project team to support weekly progress reporting and ensure contractual compliance",
      "Review productivity and progress data to capture performance and inform decision-making",
      "Embed sustainable design, procurement, and carbon-reduction principles within programme"
    ],
    qualifications: [
      "Degree in Construction, Civil Engineering, or Project Management",
      "Expert knowledge of Primavera P6 and schedule management tools",
      "Experience working in the United Arab Emirates is essential for client approval"
    ],
    sponsorship_note: "UAE Employment Visa sponsorship provided by Mace Middle East."
  },
  {
    reqId: "47173",
    title: "Procurement Commercial Manager - Defence",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47173&lang=en",
    location: "London / UK-wide, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Defence Business Unit supporting national security infrastructure across major UK MOD programmes.",
    description_points: [
      "Deliver pre-contract procurement activities and commercial responsibilities across major Defence programmes",
      "Prepare commercial strategies, business cases, contract documentation, and tender packages",
      "Manage activities across all stages of MOD commercial lifecycle through to contract execution",
      "Work closely with Crown Commercial Service and defence supply chains"
    ],
    qualifications: [
      "Extensive experience in UK Defence sector / MOD commercial lifecycle",
      "Hold or eligible to obtain UK Security Check (SC) clearance",
      "MCIPS or MRICS qualified"
    ],
    sponsorship_note: "UK National security check clearance required."
  },
  {
    reqId: "47172",
    title: "Senior Risk Manager - Mobility Infrastructure",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47172&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Mobility Business Unit: large-scale aviation, rail, highways, ports and transportation programmes across the UK.",
    description_points: [
      "Direct risk management activities across major infrastructure programmes and projects",
      "Develop and implement effective risk management frameworks, governance, and assurance",
      "Facilitate risk and opportunity workshops and deliver quantitative schedule & cost risk analysis (QSRA/QCRA)",
      "Support growth of risk capability through mentoring and leadership"
    ],
    qualifications: [
      "Proven risk management track record on major UK transport schemes",
      "Proficient in PRA, @Risk, Active Risk Manager (ARM), and EVM",
      "IRM/APM membership and relevant engineering/numerical degree"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "44328",
    title: "Project Controls Manager - Maritime & Ports",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=44328&lang=en",
    location: "Immingham, Lincolnshire, United Kingdom",
    city: "Immingham",
    region: "Lincolnshire",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Capital investment programme in the maritime and ports sector over next 5 years in Immingham.",
    description_points: [
      "Support delivery of nationally significant port infrastructure capital investment programme",
      "Integrate with delivery partners including PMs, commercial, finance, procurement, and supply chain",
      "Deliver project reporting across cost, controls, scheduling, and risk perspectives",
      "Proficient in Primavera P6, SAP, MS Excel, and Power BI"
    ],
    qualifications: [
      "Experience on large-scale infrastructure, marine, ports, transport or heavy civil projects",
      "Strong commercial, financial, and senior stakeholder management capability",
      "Degree in Civil Engineering, Project Management or Quantity Surveying"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47186",
    title: "Assistant Project Manager – Electrical",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47186&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 45000,
    salary_max: 60000,
    salary_currency: "GBP",
    project: "MEP Electrical building services capital delivery programmes across London.",
    description_points: [
      "Provide technical support for electrical building services ensuring compliance with project standards",
      "Support programme delivery, H&S, wellbeing, quality, and commissioning outcomes",
      "Build effective relationships with clients, consultants, contractors, and project teams",
      "Review electrical designs, delivery strategies, and commissioning plans"
    ],
    qualifications: [
      "Degree, HNC/HND, apprenticeship or equivalent Electrical Engineering qualification",
      "Experience delivering MEP electrical packages within construction",
      "Knowledge of IET Wiring Regulations, design, commissioning, and planning principles"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45295",
    title: "Global Maturity Assessment Director",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45295&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 120000,
    salary_max: 155000,
    salary_currency: "GBP",
    project: "Global Operational Excellence Team driving maturity assessments and AI innovation across capital programmes.",
    description_points: [
      "Lead and own the Maturity Assessment service line across the global Mace Consult business",
      "Drive AI innovation leveraging digital tools and data-driven insights to enhance the maturity offering",
      "Deliver actionable insight and lead change initiatives across client capital programmes worldwide",
      "Attend client sites across the globe and collaborate with executive leadership teams"
    ],
    qualifications: [
      "Extensive executive experience leading maturity assessments and operational improvement on mega capital programmes",
      "Pioneering track record in AI/digital transformation for project delivery",
      "Strong business development and international client leadership capability"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "44941",
    title: "Transport Data Science Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=44941&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_tech_data",
    category_slug: "data-analytics",
    category_name: "Data & Analytics",
    remote_type: "ONSITE",
    salary_min: 360000,
    salary_max: 480000,
    salary_currency: "SAR",
    project: "One of the largest mixed-use and mobility gigaprojects in Saudi Arabia.",
    description_points: [
      "Lead development of integrated transport data strategies across all mobility modes",
      "Deliver advanced analytics and AI solutions: predictive modelling for demand, ridership, fleet optimisation, and traffic management",
      "Enable scalable cloud-based data and AI architectures supporting autonomous vehicle (AV) and MaaS platforms",
      "Partner with technology vendors, AV providers, and system integrators"
    ],
    qualifications: [
      "Master's or PhD in Data Science, Computer Science, Transportation Engineering, or Applied Mathematics",
      "Proven track record deploying machine learning, predictive modelling, and cloud data platforms in transportation",
      "Proficient in Python, SQL, Cloud Architectures (AWS/GCP/Azure), and transport simulation models"
    ],
    sponsorship_note: "Saudi Arabia Work Visa & Relocation provided."
  },
  {
    reqId: "47031",
    title: "Regional PMO Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47031&lang=en",
    location: "London / Regional UK, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "D&C PMO Regional Co-Ordinator supporting regional capital projects portfolio.",
    description_points: [
      "Coordinate pipeline lookahead activities and governance timing from intake through approvals",
      "Ensure project data integrity in PMWeb and enable consistent cost, schedule, and scope controls",
      "Partner with Project Managers and regional leadership to drive audit-ready documentation",
      "Support establishment and maintenance of schedule baselines and identify slippage trends"
    ],
    qualifications: [
      "Experience in PMO coordination, project controls, and governance frameworks",
      "Proficient in PMWeb, Power BI, and schedule baseline management",
      "Degree in Construction Management, Business, or Project Controls"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47163",
    title: "Senior Manager, Risk Model and Hazard Log",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47163&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 360000,
    salary_max: 480000,
    salary_currency: "SAR",
    project: "Major mixed-use development & integrated transport gigaproject in Saudi Arabia.",
    description_points: [
      "Lead functional safety, hazard management, and railway risk modelling across portfolio",
      "Develop and implement hazard and risk management strategies aligning with EN 50126/28/29",
      "Define safety targets, maintain traceable hazard records, and report against V&V evidence",
      "Ensure system safety risks are tolerable and reduced ALARP"
    ],
    qualifications: [
      "Degree in Systems Safety, Electrical, Mechanical or Civil Engineering",
      "Extensive experience in Hazard Log management (DOORS, ComplyPro), QRA, and railway safety standards",
      "Chartered status (CEng / SaRS)"
    ],
    sponsorship_note: "Saudi Arabia Work Visa & Relocation Package provided."
  },
  {
    reqId: "47162",
    title: "Senior Manager, Verification and Validation (V&V)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47162&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 360000,
    salary_max: 480000,
    salary_currency: "SAR",
    project: "Major transport infrastructure and built environment gigaproject in Saudi Arabia.",
    description_points: [
      "Lead V&V strategy for transport infrastructure, built environment, and associated assets",
      "Ensure requirements are defined, verified, and evidenced in line with EN 50126, EN 50716, and EN 50129",
      "Define acceptance criteria and maintain robust evidence frameworks before formal handover",
      "Manage integration and assurance risks across requirements, interfaces, RAM, safety, and certification"
    ],
    qualifications: [
      "Degree in Systems Engineering, Rail Engineering, or related technical discipline",
      "Expert knowledge of requirements management (IBM DOORS) and V&V lifecycle",
      "Experience on complex transit, metro, or high-speed rail programmes"
    ],
    sponsorship_note: "Saudi Arabia Work Visa & Relocation Package provided."
  },
  {
    reqId: "47187",
    title: "Assistant Project Manager – ELV & Security",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47187&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 45000,
    salary_max: 60000,
    salary_currency: "GBP",
    project: "MEP ELV, BMS, Access Control and Security systems across major commercial projects.",
    description_points: [
      "Provide technical support for extra-low voltage (ELV), BMS, and security systems",
      "Support programme delivery, quality, commissioning, and project performance outcomes",
      "Review ELV and security designs, delivery strategies, and commissioning plans",
      "Proactively identify risks and support net zero carbon delivery commitments"
    ],
    qualifications: [
      "Degree, HNC/HND, apprenticeship or equivalent Electrical/Electronic Engineering qualification",
      "Experience delivering ELV, BMS, CCTV, and physical security packages within construction",
      "Strong coordination and communication skills"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47164",
    title: "Senior Manager - System Safety",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47164&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 360000,
    salary_max: 480000,
    salary_currency: "SAR",
    project: "Major mixed-use development & integrated transport gigaproject in Saudi Arabia.",
    description_points: [
      "Lead development and delivery of system and functional safety strategies across transport portfolio",
      "Ensure safety targets, risks, and acceptance criteria meet EN 50126, EN 50716, and EN 50129",
      "Provide expert oversight of hazard identification, V&V, and specialist safety studies applying ALARP",
      "Work collaboratively with regulators to secure technical safety approvals"
    ],
    qualifications: [
      "Degree in Systems Engineering, Electrical, Mechanical or Safety Engineering",
      "Extensive experience in safety case development and railway safety engineering",
      "Chartered Engineer status (CEng / MIET / MIMechE / SaRS)"
    ],
    sponsorship_note: "Saudi Arabia Work Visa & Relocation Package provided."
  },
  {
    reqId: "42223",
    title: "Associate Director - Project Controls (Nuclear / Sizewell C)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=42223&lang=en",
    location: "Suffolk / London, United Kingdom",
    city: "Suffolk",
    region: "East of England",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 100000,
    salary_max: 130000,
    salary_currency: "GBP",
    project: "Sizewell C (SZC) nuclear new build project in Suffolk delivering 3.2GW low-carbon electricity.",
    description_points: [
      "Provide assurance, governance, and oversight for business-critical Transformation Portfolio at Sizewell C",
      "Embed best-practice standards, tools, and processes across RAID management and integrated planning",
      "Review and validate programme and project plans, establishing centralised tracking and escalation mechanisms",
      "Manage portfolio-level reporting and updates to Transformation Steering Committee"
    ],
    qualifications: [
      "Senior director-level leadership in project controls on nuclear, energy, or megaproject transformations",
      "Chartered professional with deep expertise in integrated project controls, EVM, and governance",
      "Exceptional executive communication and stakeholder management skills"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46435",
    title: "Construction Manager - Infrastructure, Civil and Build (Affinity Water / HS2)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46435&lang=en",
    location: "London / Hertfordshire / Bedfordshire, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 65000,
    salary_max: 82000,
    salary_currency: "GBP",
    project: "Affinity Water Construction Supervisor on HS2 Programme of Works delivering critical water asset protection and diversions.",
    description_points: [
      "Direct site safety on behalf of Mace and Affinity Water across HS2 Programme of Works",
      "Review, record, and audit ongoing civil and water utility works for compliance with water industry standards",
      "Conduct site surveys, hazard identification, risk assessments, and final walkovers",
      "Utilise Affinity Water EHS system (EcoOnline) for reporting and compliance tracking"
    ],
    qualifications: [
      "Extensive site management experience in water utilities, civil engineering, and major infrastructure",
      "SMSTS, National Water Hygiene (Blue Card), and CSCS Card",
      "Strong understanding of water network diversions and asset protection adjacent to HS2"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "45767",
    title: "Senior Advisory Consultant - Benefits Management",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45767&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 70000,
    salary_max: 90000,
    salary_currency: "GBP",
    project: "Mace Advisory Centre of Excellence (Mace Consult) delivering strategic advisory commissions globally.",
    description_points: [
      "Develop benefits management frameworks and realization approaches for major capital programmes",
      "Lead benefits identification, definition, mapping, and profiling with client leadership and stakeholders",
      "Integrate benefits management into HM Treasury Green Book business cases, programme controls, and risk management",
      "Support clients with benefits realization planning across all project lifecycle stages"
    ],
    qualifications: [
      "Strong advisory experience in benefits management for major infrastructure/public capital programmes",
      "Familiarity with HM Treasury Green Book / 5 Case Model and APM/Managing Successful Programmes (MSP) standards",
      "Degree in Business, Economics, Engineering or certified MSP/APMG Benefits Management Practitioner"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "47185",
    title: "Assistant Project Manager – Mechanical",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47185&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_mech",
    category_slug: "mechanical-engineering",
    category_name: "Mechanical Engineering",
    remote_type: "HYBRID",
    salary_min: 45000,
    salary_max: 60000,
    salary_currency: "GBP",
    project: "MEP Mechanical building services capital schemes across London.",
    description_points: [
      "Provide technical support for mechanical building services (HVAC, piping, public health)",
      "Support programme delivery, H&S, wellbeing, quality, commissioning, and project performance",
      "Contribute to contract, budget, programme, and commercial reviews",
      "Review mechanical designs, delivery strategies, and commissioning plans"
    ],
    qualifications: [
      "Degree, HNC/HND, apprenticeship or equivalent Mechanical Engineering qualification",
      "Experience delivering mechanical/HVAC building services in construction",
      "Knowledge of CIBSE/BSRIA guidelines, commissioning, and safety standards"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46662",
    title: "Senior Document Controller",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46662&lang=en",
    location: "Dubai, United Arab Emirates",
    city: "Dubai",
    region: "Dubai",
    country_code: "AE",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "ONSITE",
    salary_min: 180000,
    salary_max: 240000,
    salary_currency: "AED",
    project: "Prestigious large-scale residential community development in Dubai.",
    description_points: [
      "Manage SharePoint, Aconex, and EDMS system permissions, ensuring accurate quality checks and controlled information flow",
      "Maintain work package matrices, support contract administration, and manage RFIs and submittal workflows",
      "Coordinate meetings, documentation, and office resources while maintaining compliant workplace standards",
      "Drive collaboration, knowledge sharing, and structured project archiving"
    ],
    qualifications: [
      "Degree qualification with expert proficiency in Aconex, SharePoint, and BIM 360/ACC",
      "5+ years document control experience on major construction developments in UAE",
      "Knowledge of ISO 19650 naming conventions and metadata standards"
    ],
    sponsorship_note: "UAE Employment Visa sponsorship provided by Mace Middle East."
  },
  {
    reqId: "47188",
    title: "Construction Manager – MEP",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47188&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Major MEP construction delivery across commercial and infrastructure projects in London.",
    description_points: [
      "Lead MEP construction delivery ensuring compliance with Mace standards, programme, and project requirements",
      "Manage site health, safety, wellbeing, quality, commissioning, and subcontractor performance",
      "Drive programme performance through proactive coordination, digital tools, productivity monitoring, and risk management",
      "Implement quality, commissioning, logistics, and delivery strategies for critical MEP packages"
    ],
    qualifications: [
      "Proven MEP delivery expertise with strong technical, planning, and commissioning knowledge",
      "Relevant engineering or construction qualification (HNC/HND/Degree)",
      "SMSTS and valid CSCS certification"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47137",
    title: "Project Controls Manager - Nationally Significant Infrastructure",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47137&lang=en",
    location: "Immingham, Lincolnshire, United Kingdom",
    city: "Immingham",
    region: "Lincolnshire",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Nationally significant infrastructure project in Immingham (ports, marine, transport, heavy civils).",
    description_points: [
      "Deliver PMO and Project Controls performance on nationally significant infrastructure commission",
      "Guide effective implementation of PMO and Project Controls frameworks (cost, scheduling, EVM, risk)",
      "Deliver monthly reporting and lead performance review meetings with client representatives",
      "Drive integration of PMO and planning disciplines aligning with Mace Control Centre"
    ],
    qualifications: [
      "Experience on large-scale infrastructure, marine, ports, transport, or heavy civil projects",
      "Working knowledge of Primavera P6, SAP, and EVM methodologies",
      "Strong stakeholder and commercial management skills"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46949",
    title: "Senior Planning Manager - Riyadh Megaproject",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46949&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 360000,
    salary_max: 480000,
    salary_currency: "SAR",
    project: "Major mixed-use development in Riyadh consisting of over 200 projects (cultural, heritage, F&B, retail, hotels, commercial, educational).",
    description_points: [
      "Oversee application of planning and scheduling methods, tools, and Earned Value Management across 200+ projects",
      "Communicate effectively with client and PMO stakeholders, analyzing complex critical paths and recommending corrective measures",
      "Manage and develop teams delivering planning and schedule management services",
      "Drive excellence in planning and project controls aligned with Mace standards"
    ],
    qualifications: [
      "Saudi National preferred / Middle East PMO planning leader",
      "Degree with chartered membership or professional certification (APM, RICS, CIOB, ICE, AACE)",
      "Proven experience delivering residential and infrastructure programmes within a PMO environment"
    ],
    sponsorship_note: "Saudi National / Regional direct appointment."
  },
  {
    reqId: "46997",
    title: "Senior Logistics Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46997&lang=en",
    location: "Abha, Saudi Arabia",
    city: "Abha",
    region: "Asir Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 300000,
    salary_max: 400000,
    salary_currency: "SAR",
    project: "Transformative mixed-use development in Abha, Saudi Arabia bringing together residential, commercial, hospitality, leisure, and public realm.",
    description_points: [
      "Lead, develop, and support project delivery team ensuring resources, logistics, and performance align to contractual commitments",
      "Oversee day-to-day project logistics delivery ensuring activities are coordinated safely and efficiently across challenging mountainous terrain",
      "Provide clear oversight of logistics performance, laydown areas, plant management, and traffic management plans",
      "Promote health, safety, wellbeing, and environmental responsibility"
    ],
    qualifications: [
      "Extensive experience in construction site logistics, heavy supply chain, and traffic management on masterplan developments",
      "Degree in Logistics, Civil Engineering, or Construction Management",
      "Proven leadership in managing complex logistics on gigaprojects"
    ],
    sponsorship_note: "Saudi Arabia Work Visa & Expat Relocation Package provided."
  },
  {
    reqId: "47130",
    title: "Senior Project Manager (Employer's Agent)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47130&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 92000,
    salary_currency: "GBP",
    project: "Project Universal: high-profile UK development from RIBA Stage 3 onwards through construction and handover.",
    description_points: [
      "Act as client trusted advisor and Employer's Agent leading multidisciplinary consultant teams",
      "Develop and maintain integrated project plans and delivery strategies ensuring safety, quality, budget, and programme",
      "Lead project from RIBA Stage 3 onwards and manage contract administration during construction and handover",
      "Manage risk registers, stakeholder engagement, and executive governance reporting"
    ],
    qualifications: [
      "Chartered Project Manager (MRICS, MAPM, MCIOB)",
      "Strong track record acting as Employer's Agent on major UK property schemes",
      "Expert knowledge of JCT Design & Build contract administration"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "44860",
    title: "Offshore Project Manager - Electrical (Offshore Wind)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=44860&lang=en",
    location: "South East Ireland / Dublin, Ireland",
    city: "Dublin",
    region: "Leinster",
    country_code: "IE",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 80000,
    salary_max: 105000,
    salary_currency: "EUR",
    project: "Chief infrastructure office of semi-state organisation in Ireland delivering Offshore Wind projects across Ireland.",
    description_points: [
      "Manage offshore wind electrical infrastructure projects from concept, feasibility, statutory planning consent to handover for detailed design and construction",
      "Apply strong technical knowledge of high-voltage offshore transmission, export cables, and grid substations",
      "Maintain quality systems, manage procurement, budgets, stakeholder engagement, and statutory consents",
      "Conduct site visits to offshore wind asset locations in the South East of Ireland"
    ],
    qualifications: [
      "Engineering degree in Electrical Engineering with 4+ years infrastructure and power-systems experience",
      "Strong understanding of offshore wind high-voltage AC/DC systems, grid integration, and statutory consenting in Ireland",
      "Chartered Engineer (Engineers Ireland/IET) preferred"
    ],
    sponsorship_note: "Ireland Critical Skills Employment Permit sponsorship eligible."
  },
  {
    reqId: "46954",
    title: "Estimating Manager - Saudi National",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46954&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 240000,
    salary_max: 320000,
    salary_currency: "SAR",
    project: "Landmark multipurpose sports and entertainment venue in Riyadh.",
    description_points: [
      "Supervise teams in preparing cost plans, estimates, and schedules of quantities across multiple projects",
      "Develop strategic reviews, benchmarking exercises, and prospect assessments to support estimating strategies",
      "Oversee quality assurance for estimates ensuring outputs are robust and cost-competitive",
      "Present estimates and risk modeling to executive stakeholders"
    ],
    qualifications: [
      "Saudi National with Bachelor's in Quantity Surveying or Civil Engineering",
      "6+ years experience in estimating on major commercial/sports infrastructure",
      "Proficient in CostX, Candy (CCS), and benchmarking methodologies"
    ],
    sponsorship_note: "Saudi National direct hire position."
  },
  {
    reqId: "47136",
    title: "Commercial Manager - Rail Infrastructure",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47136&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Mace Rail team supporting delivery of major Network Rail infrastructure programmes.",
    description_points: [
      "Provide commercial leadership across major rail infrastructure projects from pre-contract through final account",
      "Administer contracts, manage compensation events, variations, and change control (NR Suite / NEC)",
      "Monitor project costs, cash flow forecasts, and present commercial metrics to senior stakeholders",
      "Support procurement activities, tender evaluations, and dispute avoidance"
    ],
    qualifications: [
      "Extensive commercial management experience in the UK rail sector with Network Rail standards",
      "Degree in Quantity Surveying, Commercial Management or MRICS",
      "Strong contract administration skills under NR/NEC contracts"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46948",
    title: "Planning Manager - Riyadh Development",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46948&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 260000,
    salary_max: 340000,
    salary_currency: "SAR",
    project: "Major mixed-use development programme in Riyadh with 200+ projects.",
    description_points: [
      "Conduct regular site visits to validate real-time progress and schedule accuracy",
      "Review and analyse schedules including critical paths, float, and change documentation",
      "Develop and maintain integrated master schedules (Level 3 to Level 2) in Primavera P6",
      "Prepare monthly planning reports highlighting risks, delay trends, and mitigation strategies"
    ],
    qualifications: [
      "Saudi National with Degree in Civil Engineering, Construction or Project Management",
      "5+ years planning experience with expert Primavera P6 skills",
      "Experience with PMO standards and master scheduling"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "35525",
    title: "Senior Grant Analyst - Hudson Tunnel Project",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=35525&lang=en",
    location: "New York, NY, United States",
    city: "New York",
    region: "New York",
    country_code: "US",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 120000,
    salary_max: 145000,
    salary_currency: "USD",
    project: "Gateway Program in New York / Hudson Tunnel Project ($12B federal funding under IIJA, largest mass transit project in modern US history).",
    description_points: [
      "Lead grant management process for the $12B Hudson Tunnel Project with Gateway Development Commission (GDC)",
      "Research grant opportunities, prepare federal funding applications, and manage award compliance",
      "Coordinate with project managers and finance teams to develop grant budgets and track federal expenditures",
      "Monitor grant performance and ensure compliance with FTA, FRA, and USDOT guidelines"
    ],
    qualifications: [
      "Extensive experience in federal grant administration for major US transit or megaprojects (FTA/FRA/DOT)",
      "Bachelor's degree in Finance, Public Administration, Economics, or Civil Engineering",
      "Deep knowledge of IIJA federal funding compliance, 2 CFR 200, and reporting"
    ],
    sponsorship_note: "US Direct Hire / Mace North America."
  },
  {
    reqId: "47160",
    title: "Talent Acquisition – Sourcing Consultant",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47160&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 40000,
    salary_max: 52000,
    salary_currency: "GBP",
    project: "Global Talent Acquisition hub supporting recruitment across Mace's four global hubs.",
    description_points: [
      "Proactively source talent through ATS, CRM platforms, and professional networks for global capital programmes",
      "Conduct CV mining, sifting, and shortlisting against specific role criteria",
      "Present shortlisted candidates to recruiters with clear summaries and sourcing insights",
      "Coordinate and schedule interviews for hiring managers"
    ],
    qualifications: [
      "Proven sourcing experience in engineering, construction, or consulting sectors",
      "Expertise in LinkedIn Recruiter, Taleo/Workday/CRM systems, and boolean search techniques"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "47092",
    title: "MEP Design Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47092&lang=en",
    location: "Dubai, United Arab Emirates",
    city: "Dubai",
    region: "Dubai",
    country_code: "AE",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "ONSITE",
    salary_min: 320000,
    salary_max: 420000,
    salary_currency: "AED",
    project: "Landmark residential community development in Dubai (sustainable, nature-led living).",
    description_points: [
      "Manage and coordinate MEP design process across all project stages to achieve programme and quality objectives",
      "Facilitate collaboration between consultants, design teams, and stakeholders for integrated design delivery",
      "Manage mechanical, electrical, public health, fire protection, and specialist systems design",
      "Review MEP deliverables against Dubai Municipality, DEWA, Civil Defence, and international standards"
    ],
    qualifications: [
      "Bachelor's degree in Mechanical or Electrical Engineering",
      "10+ years experience in MEP design management on large-scale masterplanned residential/commercial projects in UAE",
      "Strong knowledge of DEWA, DCD regulations, and sustainability standards"
    ],
    sponsorship_note: "UAE Employment Visa & Relocation provided by Mace Middle East."
  },
  {
    reqId: "46953",
    title: "Risk Manager - Riyadh Gigaproject",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46953&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 240000,
    salary_max: 320000,
    salary_currency: "SAR",
    project: "One of the largest programmes in Saudi Arabia (major mixed-use development).",
    description_points: [
      "Implement and continuously improve risk frameworks, registers, dashboards, and reporting processes",
      "Facilitate risk workshops, reviews, and assessments to identify, evaluate, and mitigate project risks",
      "Partner with project teams to integrate risk controls into plans, schedules, and budgets",
      "Monitor risk exposure changes and effectiveness of controls driving continuous improvement"
    ],
    qualifications: [
      "Saudi National with Degree or Diploma in Risk Management, Engineering, or Construction",
      "4-7 years risk management experience in PMO/gigaproject environments",
      "Proficient in ARM (Active Risk Manager), Excel, and Power BI"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "46956",
    title: "Cost Manager - Saudi National",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46956&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 200000,
    salary_max: 270000,
    salary_currency: "SAR",
    project: "Landmark multipurpose sports and entertainment venue in Riyadh.",
    description_points: [
      "Conduct feasibility studies, procurement strategies, and contract selection recommendations",
      "Oversee value management, cost planning, and estimating activities to develop final cost plans",
      "Measure and value completed works, assess variations, and provide financial reports to clients",
      "Evaluate contractor claims for delays and additional costs, negotiate final accounts"
    ],
    qualifications: [
      "Saudi National with Bachelor's degree in Quantity Surveying or Civil Engineering",
      "5+ years cost management experience on major building projects",
      "RICS membership (or working towards MRICS)"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "46951",
    title: "Senior Reporting Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46951&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_tech_data",
    category_slug: "data-analytics",
    category_name: "Data & Analytics",
    remote_type: "ONSITE",
    salary_min: 280000,
    salary_max: 380000,
    salary_currency: "SAR",
    project: "Major mixed-use development gigaproject in Riyadh.",
    description_points: [
      "Develop and maintain tools and forms to collect programme status from stakeholders",
      "Manage production, validation, and distribution of regular executive and ad-hoc reports",
      "Consolidate, review, and issue executive dashboards in Power BI and SharePoint",
      "Support cost, schedule, change, risk, and performance reporting processes"
    ],
    qualifications: [
      "Saudi National with Bachelor's degree and proven PMO reporting leadership on complex projects",
      "Expert knowledge of Power BI, SharePoint, PMIS, and data modeling",
      "Progressing toward chartership with recognized professional body"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "46320",
    title: "Document Controller / Information Manager",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46320&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 45000,
    salary_max: 58000,
    salary_currency: "GBP",
    project: "Information Management (IM) and ISO 19650 delivery across client projects.",
    description_points: [
      "Define and deliver IM strategies, standards (ISO 19650), and processes for client projects",
      "Establish and manage project IM functions and provide system training to project teams",
      "Manage assurance and quality control of submitted and stored documents",
      "Contribute to setup and management of Common Data Environments (CDE) and Digital Centre of Excellence"
    ],
    qualifications: [
      "Proven experience in document control and information management in construction",
      "In-depth understanding of ISO 19650 standards and CDE platforms (Aconex, ACC, SharePoint)",
      "Strong data quality assurance and team training capabilities"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46955",
    title: "Senior Cost Manager - Saudi National",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46955&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 280000,
    salary_max: 380000,
    salary_currency: "SAR",
    project: "Landmark multipurpose sports and entertainment venue in Riyadh.",
    description_points: [
      "Oversee cost planning, procurement, and commercial management across full project lifecycle",
      "Supervise feasibility studies, procurement strategy, and contract selection",
      "Direct cost planning, estimating, valuation, and financial reporting",
      "Manage contract administration, claims, and final account settlements"
    ],
    qualifications: [
      "Saudi National with Bachelor's in Quantity Surveying or Civil Engineering",
      "8+ years cost management experience on high-profile developments",
      "Chartered MRICS or Saudi Council of Engineers (SCE) certified"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "46977",
    title: "Associate Director - Design Management (Iceland Infrastructure)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46977&lang=en",
    location: "Reykjavik, Iceland",
    city: "Reykjavik",
    region: "Capital Region",
    country_code: "IS",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 12000000,
    salary_max: 16000000,
    salary_currency: "ISK",
    project: "Major infrastructure programme in Iceland supporting mobility and transportation projects.",
    description_points: [
      "Lead Design Management function across portfolio of mobility and transportation infrastructure in Iceland",
      "Establish design management processes, oversee gateway approvals, and support information management",
      "Direct design coordination meetings, chair workshops, and manage issue registers",
      "Support project inception including brief development, planning, programming, and cost alignment"
    ],
    qualifications: [
      "Extensive leadership in design management on major transportation/infrastructure projects",
      "Degree in Architecture, Civil Engineering, or Transportation Engineering",
      "Chartered status (ICE/RIBA/IStructE) and strong international collaborative experience"
    ],
    sponsorship_note: "European / Iceland work permit sponsorship available through Mace Consult."
  },
  {
    reqId: "46950",
    title: "BIM Manager - Riyadh Gigaproject",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46950&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 260000,
    salary_max: 360000,
    salary_currency: "SAR",
    project: "Major mixed-use development in Riyadh (cultural, sports, entertainment, hospitality).",
    description_points: [
      "Support project delivery teams ensuring BIM and digital processes are embedded per ISO 19650",
      "Develop and implement BIM Execution Plans (BEP), information requirements (OIR, AIR, PIR, EIR), and digital handover strategies",
      "Lead development of BIM standards, methods, procedures, shared resources, and object libraries",
      "Oversee Autodesk Construction Cloud and model-based inputs for construction sequencing and cost planning"
    ],
    qualifications: [
      "Saudi National with Degree in Architecture, Civil Engineering, or Digital Construction",
      "5+ years experience as BIM Manager on major building or infrastructure projects",
      "Expert knowledge of Revit, Navisworks, ACC, and ISO 19650 standards"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "43640",
    title: "Project Manager Water",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=43640&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 65000,
    salary_max: 85000,
    salary_currency: "GBP",
    project: "Major water, utilities, and civil infrastructure programmes across the UK.",
    description_points: [
      "Support delivery of water and utility infrastructure project plans from brief to completion",
      "Coordinate design, procurement, technical services, programme, budget, and risks",
      "Ensure quality systems align with the Mace Way and safety/net-zero principles",
      "Manage consultants, contractors, and stakeholders"
    ],
    qualifications: [
      "Degree-qualified with experience in water, utilities, or civil infrastructure project management",
      "Professional membership (RICS, CIOB, APM, ICE) or equivalent development",
      "Understanding of UK water industry regulatory frameworks (AMP cycles) and carbon impacts"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor (Skilled Worker Route)."
  },
  {
    reqId: "45790",
    title: "Associate Director - Project Management (Education Sector)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45790&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 95000,
    salary_max: 125000,
    salary_currency: "GBP",
    project: "Major capital development programmes across higher education and school estates in the UK.",
    description_points: [
      "Oversee development of delivery plans and strategy implementation for major education programmes",
      "Provide strategic direction, fiscal accountability, and compliance across multi-million pound education schemes",
      "Direct sub-programmes ensuring effective delivery frameworks across people, processes, and technology",
      "Drive performance improvement, risk management, and client service excellence"
    ],
    qualifications: [
      "Extensive experience in successful delivery of major education/university capital programmes",
      "Membership of RICS, CIOB, APM, or ICE",
      "Proven leadership of multidisciplinary project teams"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor."
  },
  {
    reqId: "46153",
    title: "Americas Lead Lawyer – Commercial Legal Counsel",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46153&lang=en",
    location: "New York, NY, United States",
    city: "New York",
    region: "New York",
    country_code: "US",
    category_id: "cat_tech",
    category_slug: "information-technology",
    category_name: "Information Technology",
    remote_type: "HYBRID",
    salary_min: 160000,
    salary_max: 210000,
    salary_currency: "USD",
    project: "Mace Consult Americas Hub spanning the US, Canada, and Latin America.",
    description_points: [
      "Review appointment contracts received with client tenders to identify and mitigate risks to Mace",
      "Negotiate and draft appointment contracts, joint venture agreements, and supply chain step-down contracts",
      "Embed Mace Consult global governance programme across the Americas Hub (US, Canada, LATAM)",
      "Work closely with commercial stakeholders and local leadership operating autonomously in commercial law"
    ],
    qualifications: [
      "Juris Doctor (JD) or equivalent legal qualification admitted to practice in NY or US state",
      "7+ years experience in construction/commercial contract law in the built environment",
      "Expertise in AIA, EJCDC, and international bespoke consultancy agreements"
    ],
    sponsorship_note: "US Direct Hire / Mace North America."
  },
  {
    reqId: "46952",
    title: "Senior Planner (Track and Infield) - Riyadh Development",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=46952&lang=en",
    location: "Riyadh, Saudi Arabia",
    city: "Riyadh",
    region: "Riyadh Province",
    country_code: "SA",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "ONSITE",
    salary_min: 280000,
    salary_max: 380000,
    salary_currency: "SAR",
    project: "Major sports, racing, and entertainment venue development in Riyadh.",
    description_points: [
      "Supervise planning and scheduling of delivery for racetrack and infield facilities",
      "Oversee planning, scheduling, EVM, and project controls to drive performance",
      "Develop robust master plans and interpret critical path trends using statistical techniques",
      "Support senior leadership through negotiations, contract development, and due diligence"
    ],
    qualifications: [
      "Saudi National with Degree in Civil Engineering or Construction Management",
      "Expert knowledge of Primavera P6 and schedule management tools on sports/infrastructure",
      "Progressing toward chartership (APM, RICS, CIOB, ICE)"
    ],
    sponsorship_note: "Saudi National direct hire opening."
  },
  {
    reqId: "47086",
    title: "Senior Digital Engineering and BIM Manager (Canary Wharf HQ)",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47086&lang=en",
    location: "Canary Wharf, London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: "GBP",
    project: "Flagship global financial institution new HQ development in Canary Wharf, London (BIM-to-Digital-Twin model).",
    description_points: [
      "Lead Digital Delivery, Information Management, and BIM Governance for a flagship Canary Wharf financial HQ",
      "Establish benchmark BIM-to-Digital-Twin delivery model across real estate portfolio",
      "Drive compliance with BIM Requirements, ISO 19650 processes, and digital twin operational objectives",
      "Work closely with client Design and Construction stakeholders, designers, and specialist trade partners"
    ],
    qualifications: [
      "Extensive experience leading BIM and Digital Engineering on landmark commercial HQ projects",
      "Deep expertise in ISO 19650, Autodesk Construction Cloud, and Digital Twin integration (IoT/BMS)",
      "Degree in Architecture, Engineering, or Digital Construction"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor (Skilled Worker Route)."
  },
  {
    reqId: "45406",
    title: "Senior Project Manager - Power Transmission & Grid",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=45406&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_elec",
    category_slug: "electrical-engineering",
    category_name: "Electrical Engineering",
    remote_type: "HYBRID",
    salary_min: 75000,
    salary_max: 98000,
    salary_currency: "GBP",
    project: "Annual transmission system maintenance plan, asset management, and grid connection capital projects.",
    description_points: [
      "Manage annual transmission system maintenance plan for stations, lines, and cables within outage frameworks",
      "Manage response to equipment plant issues and chair fault investigation groups",
      "Identify assets for refurbishment, initial scoping, and capital approvals",
      "Maintain ISO 55001 asset management system and ensure Grid code compliance during commissioning"
    ],
    qualifications: [
      "Engineering degree with 4 to 6+ years experience in high-voltage power transmission systems and plant maintenance",
      "Knowledge of ISO 55001, National Grid requirements, and substation commissioning",
      "Chartered Electrical Engineer (CEng / IET) preferred"
    ],
    sponsorship_note: "UK Skilled Worker sponsor licensed."
  },
  {
    reqId: "47134",
    title: "Project Controls Manager - Major Rail Programme",
    url: "https://macecareers.taleo.net/careersection/in/jobdetail.ftl?job=47134&lang=en",
    location: "London, Greater London, United Kingdom",
    city: "London",
    region: "Greater London",
    country_code: "GB",
    category_id: "cat_eng_civil",
    category_slug: "civil-engineering",
    category_name: "Civil Engineering",
    remote_type: "HYBRID",
    salary_min: 70000,
    salary_max: 90000,
    salary_currency: "GBP",
    project: "Major rail and transport infrastructure programme in London (Mace Mobility Team).",
    description_points: [
      "Manage implementation and continuous improvement of project controls and PMO frameworks across major rail projects",
      "Provide oversight of project performance across schedule, cost, risk, change, and reporting functions",
      "Manage and mentor project controls teams creating a collaborative high-performing environment",
      "Support programme governance and present accurate performance reporting to senior stakeholders"
    ],
    qualifications: [
      "Experience in project controls on major UK rail or transport programmes (Network Rail / TfL)",
      "Proficient in Primavera P6, CostX/SAP, and EVM reporting",
      "Degree in Civil Engineering, Construction, or Project Controls"
    ],
    sponsorship_note: "UK Home Office Licensed Sponsor (Skilled Worker Route)."
  }
];

const MACE_COMPANY = {
  id: "comp_mace_group",
  name: "Mace",
  normalized_name: "mace",
  country_code: "GB",
  industry: "Construction & Engineering Consultancy",
  website: "https://www.macegroup.com",
  careers_url: "https://careers.macegroup.com",
  logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mace_Group_logo.svg/320px-Mace_Group_logo.svg.png",
  description: "Mace is a global consultancy and construction company with over £2bn in turnover, operating across Europe, the Americas, Middle East, and Asia Pacific. Mace Ltd is an A-rated Licensed Sponsor on the UK Home Office Register of Licensed Sponsors (Worker Route).",
  sponsorship_signal: "high",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: new Date().toISOString()
};

function buildMarkdownDescription(job: MaceTaleoJob): string {
  return `## Role Overview
• **Position**: ${job.title}
• **Employer**: Mace (Mace Group)
• **Location**: ${job.location}
• **Requisition ID**: ${job.reqId}
• **Work Arrangement**: ${job.remote_type}
• **Employment Type**: Full-Time

## Project & Context
${job.project}

## Key Responsibilities
${job.description_points.map(pt => `• ${pt}`).join("\n")}

## Required Qualifications & Experience
${job.qualifications.map(q => `• ${q}`).join("\n")}

## Visa Sponsorship & Eligibility Intelligence
• **Sponsor Entity**: Mace Ltd is an officially registered A-rated Sponsor under the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker).
• **Sponsorship Status**: ${job.sponsorship_note}
• **Application Route**: Direct ATS link to official Mace Taleo recruitment system.

## Compensation & Benefits
• **Estimated Package**: ${job.salary_min ? `${job.salary_currency} ${job.salary_min.toLocaleString()} - ${job.salary_max ? `${job.salary_currency} ${job.salary_max.toLocaleString()}` : ""}` : "Competitive Industry Package + Comprehensive Corporate Benefits"}
• Full pension contribution, private medical cover, life assurance, flexible benefits, and professional chartership support.`;
}

export async function ingestMaceJobs() {
  console.log(`Starting intelligent ingestion of ${MACE_TALEO_JOBS.length} Mace Taleo job postings...`);

  const realJobsPath = path.resolve(__dirname, "../lib/db/realJobsData.json");
  const raw = fs.readFileSync(realJobsPath, "utf-8");
  const data = JSON.parse(raw);

  // 1. Ensure Mace Company is present
  const compIndex = data.companies.findIndex((c: any) => c.id === MACE_COMPANY.id);
  if (compIndex >= 0) {
    data.companies[compIndex] = { ...data.companies[compIndex], ...MACE_COMPANY };
  } else {
    data.companies.unshift(MACE_COMPANY);
  }

  // 2. Format structured job records
  const newJobs = MACE_TALEO_JOBS.map((j, idx) => {
    const slugId = j.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const jobId = `job_mace_taleo_${j.reqId}_${slugId}`;
    const desc = buildMarkdownDescription(j);

    const isUk = j.country_code === "GB";
    const sponsorshipScore = isUk ? 90 : (j.country_code === "AE" || j.country_code === "SA" || j.country_code === "IE" ? 85 : 75);
    const sponsorshipLabel = isUk || j.country_code === "AE" || j.country_code === "SA" ? "Likely" : "Possible";

    return {
      id: jobId,
      source_id: "mace_taleo",
      source_job_id: `mace_${j.reqId}`,
      canonical_hash: `mace_taleo_hash_${j.reqId}`,
      title: `${j.title} (${j.reqId})`,
      slug: `${slugId}-${j.reqId}`,
      company_id: MACE_COMPANY.id,
      company_name: MACE_COMPANY.name,
      company_website: MACE_COMPANY.website,
      company_logo_url: MACE_COMPANY.logo_url,
      description: desc,
      description_clean: desc,
      location: j.location,
      city: j.city,
      region: j.region,
      country_code: j.country_code,
      remote_type: j.remote_type,
      employment_type: "FULL_TIME",
      category_id: j.category_id,
      category_slug: j.category_slug,
      category_name: j.category_name,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      salary_currency: j.salary_currency,
      job_url: j.url,
      apply_url: j.url,
      source_url: j.url,
      publishedAt: new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: sponsorshipScore,
      sponsorship_label: sponsorshipLabel,
      sponsorship_positive_evidence: JSON.stringify([
        "Mace Ltd is registered on the UK Home Office Register of Licensed Sponsors (Worker Route)",
        "Direct verified Taleo ATS application URL",
        `Project context: ${j.project.slice(0, 100)}...`
      ]),
      sponsorship_negative_evidence: JSON.stringify([
        "Specific Certificate of Sponsorship allocation subject to project team confirmation"
      ]),
      visa_keywords: JSON.stringify([
        "Mace Licensed Sponsor",
        "Skilled Worker Route",
        "Direct Employer ATS"
      ]),
      quality_score: 95,
      status: "active",
      is_featured: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  // Remove existing mace_taleo or mace jobs and add newly structured jobs
  data.jobs = data.jobs.filter((j: any) => !j.id.startsWith("job_mace_"));
  data.jobs.unshift(...newJobs);

  fs.writeFileSync(realJobsPath, JSON.stringify(data, null, 2));
  console.log(`Saved ${newJobs.length} structured Mace jobs to realJobsData.json. Total jobs now: ${data.jobs.length}`);

  // Re-seed SQLite database
  console.log("Re-seeding local SQLite database...");
  await runSeed();
  console.log("Database seeded successfully!");
}

ingestMaceJobs().catch(console.error);
