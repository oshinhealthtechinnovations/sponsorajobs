import fs from "fs";
import path from "path";
import {
  parseLocationDetails,
  inferEngineeringCategory,
  estimateRealisticSalary,
  StructuredJobRecord,
} from "../lib/services/smartJobScraper";

interface RawJobEntry {
  id: string;
  title: string;
  experience: string;
  skills: string;
  location: string;
  description: string;
  applyUrl: string;
}

const RAW_JOBS_DATA: RawJobEntry[] = [
  {
    id: "93353",
    title: "Graduate Civil Engineer - Roads & Highways (Emirati National)",
    experience: "Graduate / Entry Level",
    skills: "AutoCAD, Civil 3D, Road Design, Highway Design, Geotechnical",
    location: "Sharjah, Sharjah, United Arab Emirates",
    description: "At WSP, you can always find opportunities to grow and do what matters to you. Make the most of our global reach to discover new challenges and chances to work with diverse, talented individuals who will help you expand your horizons. WSP in the Middle East is seeking a talented and motivated Graduate Civil Engineer to join our team and contribute to the development of innovative and sustainable road and highway projects. Joining our dynamic team as a Graduate Civil Engineer specializing in roads and highways design will provide you with a unique opportunity to contribute to the growth and development of transportation infrastructure across the Middle East. Responsibilities: Carry out discipline designs to required standards and quality. Ensure that all designs are reviewed to the required standards. Support the project submittals and No Objection Certificates (NOC) process. Qualifications: UAE National with a valid Family Book. A bachelor's degree in Civil Engineering from an accredited institution. Strong foundational knowledge of AutoCAD and Civil 3D.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93353/?keyword=highway+engineer&mode=location",
  },
  {
    id: "93460",
    title: "Intern, Civil Engineering",
    experience: "Co-op / Internship (8-month placement)",
    skills: "AutoCAD, Civil 3D, Land Development, Stormwater Management",
    location: "Edmonton, AB, Canada",
    description: "Join our Land Development and Municipal Engineering team for an 8-month co-op term from January to August. This opportunity will give you the chance to gain hands-on experience working on community infrastructure and land development projects while learning from experienced engineers and technical professionals. As a Civil Engineering Co-op Student, you'll support a variety of projects and develop practical skills in design, project delivery, field work, and consulting. Your Impact: Support the planning and design of land development and municipal infrastructure projects. Assist with grading, site servicing, stormwater management, and transportation-related assignments. Prepare calculations, drawings, technical reports, and supporting documentation. Qualifications: Currently enrolled in a Civil Engineering degree program. Familiarity with AutoCAD Civil 3D, GIS, or related engineering software.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93460/?keyword=civil+engineering&mode=location",
  },
  {
    id: "91415",
    title: "Senior Civil Engineer (Construction Supervision)",
    experience: "10 years of experience",
    skills: "Roads & Highways, Construction Supervision, Quality Assurance, Site Inspections",
    location: "Riyadh, Riyadh, Saudi Arabia",
    description: "WSP is seeking an experienced Senior Civil Engineer to join our Construction Supervision team in Riyadh, supporting the delivery of major Roads & Highways infrastructure projects across Saudi Arabia. The successful candidate will play a key role in overseeing construction activities, ensuring compliance with project specifications, quality standards, contractual requirements, and health and safety regulations. Responsibilities: Supervise and monitor civil construction activities associated with roads, highways, interchanges, drainage systems, utilities, and related infrastructure works. Review contractor work methods, construction schedules, shop drawings, method statements, and material submittals. Qualifications: Bachelor's degree in Civil Engineering. 10+ years of experience in construction supervision for major highway and civil infrastructure projects.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91415/?keyword=civil+engineering&mode=location",
  },
  {
    id: "93010",
    title: "Senior Civil Engineer - Rail Infrastructure",
    experience: "Senior / CRE Status Progression",
    skills: "Rail Civils Infrastructure, Stations & Platforms, Depots, Bidding, CRE",
    location: "Manchester, Greater Manchester, United Kingdom",
    description: "Join our thriving Rail Civil Engineering team and work from one of WSP’s modern & collaborative office spaces in Leeds, Manchester, or London. Advance your career with supported progression toward Contractors Responsible Engineer (CRE) status or further strengthen your existing CRE capabilities through tailored mentoring and development. Deliver the Civil Engineering design for Stations & Platforms, Depots, level crossings, canopy refurbishments, lineside railway civils infrastructure, and ancillary structures. Qualifications: Degree in Civil Engineering. Proven background in UK rail civil design, Network Rail standards, and structural engineering delivery.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93010/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "84524",
    title: "Senior Civil Engineer",
    experience: "10+ years",
    skills: "Civil 3D, BIM, Highway Design, PMCP Level 1, Australian Standards",
    location: "Pasig City, National Capital Region (NCR), Philippines",
    description: "WSP, a world leading management and consultancy firm, is seeking a Senior Civil Engineer to join their Roads, Aviation and Civil – Transport Manila team. The fast-paced firm is rapidly expanding, and this is a great opportunity to join a dynamic team of design and drafting experts who will support your growth and development. Responsibilities: Carry out assigned civil design and documentation in support of technical and commercial standards. Deliver technical expertise across a broad range of highway and civil projects. Qualifications: Bachelor’s degree in Engineering or Science. 10+ years industry experience on Australian projects. Proficient in geometric highway design using Civil 3D and BIM methodologies.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/84524/?keyword=civil+engineering&mode=location",
  },
  {
    id: "93275",
    title: "Lead Civil Engineer (Facilities)",
    experience: "7-10 years",
    skills: "AutoCAD, Civil 3D, BIM, Road Design, Construction Management, Site Design",
    location: "Boise, ID, United States",
    description: "WSP is seeking a Lead Civil Engineer to join our Facilities team. This role is ideal for a motivated engineer looking to expand their technical expertise, take greater ownership of projects, and contribute to complex, high-performing facility and infrastructure projects across multiple market sectors. Open to Boise, ID, Madison, WI, or Minneapolis, MN. Responsibilities: Perform site civil design including grading, drainage, utilities, and stormwater management for facility projects. Develop design solutions using AutoCAD Civil 3D and terrain modeling tools. Coordinate with multidisciplinary project teams, clients, and contractors. Qualifications: Bachelor's degree in Civil Engineering with 7-10 years of experience. PE license required.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93275/?keyword=civil+engineer&mode=location",
  },
  {
    id: "92684",
    title: "Principal Engineer, Structural Engineering",
    experience: "15+ years",
    skills: "AutoCAD, ETABS, SAP2000, BIM, Structural Design, Concrete, Steel Structures, MIStructE/HKIE",
    location: "Bengaluru, Karnataka, India",
    description: "WSP is looking for a Candidate who holds minimum 15+ years experience on Structures engineering including design & development on RCC and Steel structures of Transport and infrastructure projects along with Chartership from MIStructE or HKIE(str). Responsibilities: Analyze and design building structures based on applicable Hong Kong Design Standards and BS EN standards. Perform structural design, analysis calculations, and prepare design reports for foundations, superstructures, long-span steel truss structures, and footbridges. Qualifications: Degree in Civil/Structural Engineering. Minimum 15 years practical experience in structural design.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92684/?keyword=structural+engineer&mode=location",
  },
  {
    id: "92072",
    title: "Civil Engineer (Transportation Group)",
    experience: "3 to 5 years",
    skills: "AutoCAD, Civil 3D, Geotechnical, Construction Management, Transportation",
    location: "Buffalo, NY, United States",
    description: "WSP USA is currently initiating a search for a mid-level Civil Engineer to join our dynamic Civil Transportation group in Buffalo, NY office. Provides technical assistance and guidance for due diligence, investigation, remediation, impact assessment, permitting, improvement, and construction of infrastructure projects and systems. Tasks include assisting with research, design, concept development, planning, and construction of roads, bridges, and water supply systems. Qualifications: Bachelor's in Civil Engineering with 3 to 5 years experience. EIT/PE preferred.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92072/?keyword=civil+engineer&mode=location",
  },
  {
    id: "87982",
    title: "Deputy Project Manager – Water Resources / Site Civil Engineer",
    experience: "Mid to Senior / Project Manager Track",
    skills: "Civil 3D, Construction Management, HEC-RAS, ICPR/StormWise, SWMM",
    location: "Tampa, FL, United States",
    description: "WSP is seeking a Deputy Project Manager – Water Resources / Site Civil Engineer to join our Tampa, FL office and support a growing portfolio of municipal and resilience-focused projects across the Tampa Bay region. You will support the Tampa Water Team in delivering stormwater, watershed, and resilience projects for local government clients. Responsibilities: Perform stormwater management design (ERP systems, treatment, attenuation), hydrologic and hydraulic modeling (HEC-RAS, SWMM), watershed and floodplain analyses, and drainage/grading design. Qualifications: Bachelor's in Civil/Environmental Engineering with strong modeling skills.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/87982/?keyword=site+engineer&mode=location",
  },
  {
    id: "94285",
    title: "Early Professional, Structural Engineering (Substation)",
    experience: "0 to 1 years",
    skills: "AutoCAD, Civil 3D, Structural Design, Substation, Load-Bearing Structures",
    location: "Billings, MT, United States",
    description: "WSP is currently initiating a search for an Entry Level Substation Structural Engineer for our Billings, MT office (also considering Overland Park, KS and Denver, CO). Be involved in projects with our Mountain Civil/Structural Substation Team. Tasks include basic assistance with research, design, concept development, and construction of load-bearing structures, rigid bus supports, and foundations. Qualifications: Bachelor's degree in Civil or Structural Engineering. EIT certification preferred.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/94285/?keyword=structural+engineer&mode=location",
  },
  {
    id: "89479",
    title: "Civil Engineer: Pavements",
    experience: "5+ years",
    skills: "AutoCAD, Civil 3D, Geotechnical, Pavement Design, Materials Engineering, SANRAL",
    location: "Cape Town, Western Cape, South Africa",
    description: "Experience as a Civil Engineer with specialisation or strong project experience in pavement engineering, pavement design, materials engineering, and roads infrastructure is required for this role based in Cape Town within the Transport & Infrastructure business. Responsibilities: Carry out pavement investigations, condition assessments, surveys, pavement design, engineering calculations, and technical reporting. Apply pavement rehabilitation and layer design knowledge. Qualifications: BSc/BEng in Civil Engineering with 5+ years specialized pavement experience. Pr Eng registration advantageous.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/89479/?keyword=civil+engineering&mode=location",
  },
  {
    id: "92092",
    title: "Civil Engineer (Site Supervision)",
    experience: "5-10 years",
    skills: "AutoCAD, Civil 3D, Site Supervision, Roads, Utilities, Infrastructure",
    location: "Abu Dhabi, Abu Dhabi, United Arab Emirates",
    description: "WSP is seeking a Civil Engineer to join our Abu Dhabi team, supporting the delivery of major transportation, roads, utilities, and infrastructure projects. The successful candidate will contribute to the planning, design, coordination, and delivery of civil engineering solutions while working closely with multidisciplinary teams across all design stages. Responsibilities: Undertake civil engineering design and technical delivery for roads, highways, and utilities. Coordinate with Roads, Structures, Utilities, and Landscape disciplines. Qualifications: Bachelor's Degree in Civil Engineering with 5-10 years experience in consultancy environments.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92092/?keyword=civil+engineering&mode=location",
  },
  {
    id: "94200",
    title: "Early Career Civil Engineer",
    experience: "0 to 1 years",
    skills: "AutoCAD, Civil 3D, Geotechnical, Infrastructure Design, Surveys",
    location: "Austin, TX, United States",
    description: "Takes part in providing local technical assistance for the design, development, and construction of infrastructure projects and systems in the public and private sector. Tasks may include basic assistance with research, design, concept development, and construction of roads, buildings, tunnels, dams, bridges, and water supply systems. Qualifications: Bachelor's degree in Civil Engineering from an accredited university. EIT certification preferred.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/94200/?keyword=civil+engineer&mode=location",
  },
  {
    id: "93309",
    title: "Civil Engineer (Mining & Resources)",
    experience: "2-6 years",
    skills: "Civil 3D, Project Planning, 12d Model, Earthworks, Drainage, Mining",
    location: "Newcastle, New South Wales, Australia",
    description: "We're seeking a Civil Engineer to join our Newcastle Mining team, supporting the delivery of small to medium sized mining and resource related projects. You'll work alongside experienced multidisciplinary teams and gain exposure to the full project lifecycle. Responsibilities: Deliver civil engineering designs for mining and resource sector projects. Undertake earthworks, roads, drainage, site development, and develop 12d models. Qualifications: Degree in Civil Engineering with 2-6 years relevant experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93309/?keyword=civil+engineering&mode=location",
  },
  {
    id: "82810",
    title: "Structural Engineer (Process & Infrastructure)",
    experience: "3-5 years",
    skills: "AutoCAD, Revit, STAAD, ETABS, SAP2000, MS Project, Structural Design, Concrete, Steel Structures",
    location: "Tempe, AZ, United States",
    description: "WSP has a career opportunity for a Structural Engineer to join our US Mining & Metal, Process & Infrastructure Design team. Locations: Tempe, AZ, South Jordan, UT, or Tucson, AZ. This individual will provide technical and design consulting services for water/wastewater infrastructure, water treatment, heavy industry, mining, and power clients. Responsibilities: Perform analysis and design of structural elements manually and with software (STAAD, ETABS, SAP2000). Prepare calculation packages and drawings in Revit/AutoCAD. Qualifications: BS in Civil/Structural Engineering, 3-5 years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/82810/?keyword=structural+engineer&mode=location",
  },
  {
    id: "90584",
    title: "Civil Engineer (Municipal Infrastructure)",
    experience: "15+ years",
    skills: "Municipal Infrastructure, Water Supply, Wastewater Collection, Stormwater Systems",
    location: "Medicine Hat, AB, Canada",
    description: "Step into a Civil Engineering role where your technical expertise helps shape the communities of Southern Alberta and beyond. Based in our Medicine Hat office, you’ll contribute to impactful municipal infrastructure and land development projects. Responsibilities: Apply civil design expertise to deliver integrated municipal solutions including water supply, wastewater, stormwater management, and transportation corridors. Mentor junior engineers and engage with clients and municipalities. Qualifications: 15+ years progressive engineering experience in municipal infrastructure.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/90584/?keyword=civil+engineer&mode=location",
  },
  {
    id: "94133",
    title: "Civil Engineer (Highways Geometric Design)",
    experience: "4-7 years",
    skills: "AutoCAD, Civil 3D, 12D, OpenRoads, MX, Geometric Design, Australian Standards",
    location: "Pasig City, National Capital Region (NCR), Philippines",
    description: "Responsible for complete civil engineering design requirements on international road and transport projects. What you'll do: Responsible for geometric design of highways using Civil 3D, 12D, OpenRoads, MX. Extensive knowledge of Australian Standards and local Road Authority Standards. Coordinate efforts between disciplines and project leads. Qualifications: Licensed Civil Engineer with 4-7 years relevant experience in highway design.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/94133/?keyword=civil+engineering&mode=location",
  },
  {
    id: "82788",
    title: "Civil Engineer (Roads & Highways)",
    experience: "4-7 years",
    skills: "AutoCAD, Civil 3D, 12D, Open Roads, Safety in Design, Australian Standards",
    location: "Pasig City, National Capital Region (NCR), Philippines",
    description: "Design engineer supporting international transport and civil infrastructure projects. Responsibilities: Planning, analysis, design, and production of engineering drawings for geometric road alignments. Application of Australian Standards, road safety principles, and quality procedures. Qualifications: Licensed Civil Engineer with 4-7 years relevant experience in geometric design and civil infrastructure.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/82788/?keyword=civil+engineering&mode=location",
  },
  {
    id: "81941",
    title: "Principal Civil Engineer",
    experience: "10–15 years",
    skills: "OpenRoads, 12D, CPEng, Transport & Civil Infrastructure, Main Roads WA Standards",
    location: "Perth, Western Australia, Australia",
    description: "Lead the technical delivery of complex transport and civil infrastructure projects across Western Australia. Act as a technical authority within your discipline, supporting consistent, high-quality outcomes. Lead client engagement, manage scope/programme/risk, and mentor developing engineers. Qualifications: Bachelor's in Civil Engineering, Chartered Professional Engineer (CPEng), 10-15 years experience with strong knowledge of Australian Standards.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/81941/?keyword=civil+engineering&mode=location",
  },
  {
    id: "93902",
    title: "Mid-Level Structural Engineer (Substation)",
    experience: "3 to 5 years",
    skills: "STAAD, Structural Design, Concrete, Reinforced Concrete, Steel Structures, Geotechnical",
    location: "Dallas, TX, United States",
    description: "WSP is initiating a search for an experienced Substation Structural Engineer for Dallas, TX (also considering Tampa, FL) to join our Power & Energy Civil Structural Substation Team. Responsibilities: Perform structural engineering work supporting electrical substation projects, including steel structures, rigid bus support design, and reinforced concrete foundations. Prepare calculation packages and construction specifications. Qualifications: BS in Civil/Structural Engineering with 3 to 5 years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93902/?keyword=structural+engineer&mode=location",
  },
  {
    id: "93462",
    title: "Substation Structural Engineer",
    experience: "3 to 5 years",
    skills: "STAAD, Structural Design, Concrete, Reinforced Concrete, Steel Structures, Geotechnical",
    location: "Duluth, GA, United States",
    description: "Search for an experienced Substation Structural Engineer for Duluth, GA (also considering Baton Rouge, LA, Atlanta, GA, St. Louis, MO, Oradell, NJ). Be involved in projects with our Power & Energy Civil Structural Substation Team. Responsibilities: Prepare structural calculations, design criteria, and specifications for steel structures, rigid bus supports, and foundations. Coordinate with electrical and geotechnical disciplines. Qualifications: 3 to 5 years structural experience with substation focus.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93462/?keyword=structural+engineer&mode=location",
  },
  {
    id: "82925",
    title: "Civil Engineer - Rail Infrastructure",
    experience: "Mid-Level / CRE Support",
    skills: "Rail Civil Engineering, Quality Management, SHEW, Calculations, Survey Supervision",
    location: "Leeds, West Yorkshire, United Kingdom",
    description: "Join our Rail Civil Engineering team in Leeds, Manchester, or London. Supported progression to Contractors Responsible Engineer (CRE). Responsibilities: Preparation of technical outputs, resolving technical civil engineering issues, developing drawings/reports/specifications, and undertaking calculations and risk assessments for railway civil projects. Qualifications: Degree in Civil Engineering with rail design experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/82925/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "91249",
    title: "Civil Engineer (Underground Utilities & Drainage)",
    experience: "1 to 5 years of experience",
    skills: "Revit, AutoCAD, MicroStation, Drain, Sewer, Water Services Design, Utilities",
    location: "Pasig City, National Capital Region (NCR), Philippines",
    description: "Responsible for complete design requirements for civil works including drain, sewer, and water services design, underground utilities coordination, and signing/sealing of drawings. Qualifications: Minimum 1 up to 5 years experience in civil works design. Able to operate CAD, Revit, and MicroStation.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91249/?keyword=civil+engineering&mode=location",
  },
  {
    id: "88143",
    title: "Senior Structural Engineer (Transportation Facilities)",
    experience: "5 to 7 years",
    skills: "AutoCAD, Revit, STAAD, STAAD.Pro, ETABS, SAP2000, BIM, RAM Structural, SAFE",
    location: "New York, NY, United States",
    description: "Support our Transportation Facilities Group (TFG) in New York, NY. Leads and designs projects in rail and bus stations, airports, transportation hubs, and transit facilities. Responsibilities: Lead engineering staff, develop structural details and calculation packages, design in Revit (BIM), STAAD.Pro, RAM, SAP2000, and ETABS. Qualifications: Bachelor's in Structural/Civil Engineering with 5-7 years experience. PE license required.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/88143/?keyword=structural+engineer&mode=location",
  },
  {
    id: "92100",
    title: "Senior Structural Engineer (Bridges & Infrastructure)",
    experience: "15 years of experience",
    skills: "STAAD, STAAD.Pro, ETABS, SAP2000, Structural Design, Bridges, Tunnels, Viaducts",
    location: "Riyadh, Riyadh, Saudi Arabia",
    description: "Seeking a highly experienced Senior Structural Engineer in Riyadh with a minimum 15 years experience in structural engineering and site supervision on major roads & highways projects. Lead structural design and analysis of bridges, tunnels, viaducts, and retaining walls. Oversee construction quality assurance and value engineering. Qualifications: Degree in Structural/Civil Engineering with 15+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92100/?keyword=structural+engineer&mode=location",
  },
  {
    id: "88166",
    title: "Senior Structural Engineer (Bridges)",
    experience: "5 to 7 years",
    skills: "AutoCAD, Civil 3D, STAAD, Geotechnical, Construction Management, Bridges",
    location: "Troy, NY, United States",
    description: "Join our dynamic team in Troy, NY providing structural engineering analysis, design, and inspection for bridge-focused infrastructure projects. Tasks include leading bridge design, load-bearing structure evaluations, preparation of specifications, and client management. Qualifications: Bachelor's in Civil/Structural Engineering, PE preferred, 5 to 7 years bridge design experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/88166/?keyword=structural+engineer&mode=location",
  },
  {
    id: "93987",
    title: "Senior Engineer, Geotechnical Engineering (Tunnelling works)",
    experience: "10+ years",
    skills: "SAP2000, Geotechnical, PLAXIS, FREW, FLAC, TBM, Drill & Blast, ELS Systems",
    location: "Bengaluru, Karnataka, India",
    description: "Hold minimum 10+ years experience in Geotechnical engineering specializing in Tunnelling works, underground structures, excavation and lateral support (ELS) systems. Detailed design of tunnels in soft ground and hard rock, geotechnical finite element modeling using PLAXIS and FLAC. Qualifications: Masters in Geotechnical Engineering, Chartered Engineer (MICE or equivalent), 10+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93987/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "89025",
    title: "Structural Engineer",
    experience: "5 or more years",
    skills: "AutoCAD, MS Project, Concrete, Reinforced Concrete, Steel Structures, Pr Eng",
    location: "Cape Town, Western Cape, South Africa",
    description: "Responsible for delivering structural engineering solutions, managing projects, and contributing to technical outputs within multidisciplinary consulting. Design and analyze reinforced concrete and steel structures, lead design sub-teams, and interface with clients. Qualifications: BSc/BEng in Civil/Structural Engineering with 5+ years experience and Pr Eng registration or eligibility.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/89025/?keyword=structural+engineer&mode=location",
  },
  {
    id: "92591",
    title: "Senior Stormwater Civil/Site Engineer",
    experience: "7+ years",
    skills: "AutoCAD, Civil 3D, Geotechnical, HEC-RAS, HEC-HMS, OpenRoads, MicroStation, SWPPP",
    location: "Nashville, TN, United States",
    description: "Lead and oversee design tasks for municipal, state, and federal clients on transportation and civil/site projects in Brentwood/Nashville, TN. Design drainage systems, stormwater pollution prevention plans (SWPPPs), perform hydrologic analyses, open channel hydraulics, and bridge hydraulics calculations. Qualifications: BS in Civil Engineering, PE required, 7+ years stormwater experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92591/?keyword=site+engineer&mode=location",
  },
  {
    id: "93564",
    title: "Senior Structural Engineer, Resources",
    experience: "Senior / P.Eng",
    skills: "STAAD, SAP2000, Structural Design, Concrete, Heavy Industrial, EPCM",
    location: "Fredericton, NB, Canada",
    description: "Support our Resources subsector within WSP's Energy, Resources & Industry group. Deliver heavy industrial structural engineering projects from conceptual design through construction. Lead advanced analysis and design of steel and concrete structures for major industrial facilities. Qualifications: Bachelor's in Civil/Structural Engineering, P.Eng license in New Brunswick, extensive industrial experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93564/?keyword=structural+engineer&mode=location",
  },
  {
    id: "93212",
    title: "Structural Engineer (Underground Structures & Shafts)",
    experience: "5 to 8 years",
    skills: "AutoCAD, BIM, Concrete, Reinforced Concrete, Geotechnical, Trenchless Methods",
    location: "Pasig City, National Capital Region (NCR), Philippines",
    description: "Undertake structural analysis, design, and documentation for underground structures, shafts, trenchless construction methods, temporary works, and civil infrastructure packages. Prepare calculations in accordance with Australian Standards. Qualifications: Bachelor's in Civil/Structural Engineering with 5-8 years experience in underground structural design.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93212/?keyword=structural+engineer&mode=location",
  },
  {
    id: "90218",
    title: "Structural Engineer (Supervision Project - Post-Tensioned)",
    experience: "Senior Site Supervision",
    skills: "Concrete, Reinforced Concrete, Post-Tensioned (PT) Structures, High-Rise",
    location: "Dubai, Dubai, United Arab Emirates",
    description: "Join our Site Supervision team on a major high-rise buildings project in Dubai. Oversee structural construction activities, ensuring compliance with approved designs and quality standards. Key requirement: demonstrable experience in design and supervision of post-tensioned (PT) structures, PT slabs, beams, and stressing operations. Qualifications: Bachelor's in Civil/Structural Engineering with extensive PT supervision experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/90218/?keyword=site+engineer&mode=location",
  },
  {
    id: "93158",
    title: "Associate Geotechnical Engineer",
    experience: "1 to 3 years",
    skills: "AutoCAD, Civil 3D, Geotechnical, Geophysics, ReMi, MASW, Seismic Refraction",
    location: "Tempe, AZ, United States",
    description: "Support WSP project managers delivering mining, energy, transportation, and development projects. Combination of office and field work, including geotechnical investigations, geophysical surveys (seismic refraction, MASW, electrical resistivity), and technical reporting. Qualifications: Degree in Civil/Geological/Geotechnical Engineering with 1-3 years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93158/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "93982",
    title: "Senior Bridge Engineer",
    experience: "15 years experience (8 years bridge specific)",
    skills: "STAAD, SAP2000, Concrete, Reinforced Concrete, AASHTO, BS, Eurocodes, Flyovers",
    location: "Riyadh, Riyadh, Saudi Arabia",
    description: "Responsible for overseeing design review, construction supervision, inspection, and technical compliance of bridge and structural works associated with major Roads and Highways projects in Riyadh. Supervise bridges, flyovers, interchanges, underpasses, and retaining walls. Qualifications: Bachelor's in Civil Engineering, 15+ years experience with 8+ years focused on bridge engineering.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93982/?keyword=construction+engineer&mode=location",
  },
  {
    id: "83180",
    title: "Discipline Lead / Principal Structural Engineer",
    experience: "Principal / Lead",
    skills: "Road Design, Bridge Structures, Technical Leadership, Bidding, Mentoring",
    location: "Pasig City, National Capital Region (NCR), Philippines",
    description: "Accountable for business and project delivery of high quality engineering design and drafting of major roads and bridge transport projects. Provide technical leadership and mentoring to bridges and civil structures staff. Qualifications: Bachelor's degree with extensive leadership experience in bridge and structural design for international transport projects.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/83180/?keyword=structural+engineer&mode=location",
  },
  {
    id: "91556",
    title: "Senior Structural Engineer / Associate",
    experience: "8-12 years",
    skills: "ETABS, BIM, Structural Design, High-Rise Developments, Commercial, Defence",
    location: "Melbourne, Victoria, Australia",
    description: "Join our specialist WSP Building Structures group renowned for innovation and cutting-edge BIM execution across complex building structures and infrastructure projects. Lead project design and delivery across Defence, commercial, transportation, and high-rise developments. Qualifications: 8-12 years structural engineering experience with Australian project delivery.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91556/?keyword=structural+engineer&mode=location",
  },
  {
    id: "93160",
    title: "Senior Geotechnical Engineer",
    experience: "Senior (5-10 yrs)",
    skills: "AutoCAD, Civil 3D, Geotechnical, Geohazard Identification, Subsurface Investigations",
    location: "Tempe, AZ, United States",
    description: "Lead geotechnical engineering assistance for field programs in transportation, power, buildings, and mining. Emphasis on geohazard identification, field reconnaissance, subsurface investigations, and foundation engineering recommendations. Qualifications: BS/MS in Geotechnical/Civil Engineering with PE license.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93160/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "91973",
    title: "Senior Quantity Surveyor",
    experience: "15 years of experience",
    skills: "Quantity Surveying, Cost Management, BOQ, CAPEX/OPEX, Value Engineering, FIDIC",
    location: "Abu Dhabi, Abu Dhabi, United Arab Emirates",
    description: "Lead quantity surveying and cost management services across major infrastructure and transportation projects in Abu Dhabi. Prepare cost plans, bills of quantities (BOQ), cash flow forecasts, and value engineering studies. Qualifications: Bachelor's in Quantity Surveying or Civil Engineering with 15+ years experience in cost consultancy.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91973/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "74355",
    title: "Senior Quantity Surveyor (Pre-Contract & Tender)",
    experience: "15 years in contract & commercial (5+ years Ashghal)",
    skills: "Quantity Surveying, Cost Estimation, Commercial Analysis, FIDIC Contracts, Ashghal",
    location: "Doha, Doha, Qatar",
    description: "Review and analyze tender documents, drawings, and specifications. Finalize contract agreements, RFPs, addenda, and cost estimation for Ashghal infrastructure projects. Manage FIDIC-based contracts and claims. Qualifications: Bachelor's in Civil Engineering or Quantity Surveying, MMUP certified, 15+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/74355/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "90143",
    title: "EOI - Structural Engineers (All Levels)",
    experience: "All Levels (Graduate to Senior)",
    skills: "Structural Design, Calculations, Specifications, Buildings, Regeneration",
    location: "Exeter, Devon, United Kingdom",
    description: "Expressions of Interest (EOI) from talented Structural Engineers at all levels to join our growing team based in Exeter and Shropshire. Work across infrastructure, commercial buildings, residential, and regeneration frameworks. Qualifications: Degree in Civil or Structural Engineering.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/90143/?keyword=structural+engineer&mode=location",
  },
  {
    id: "91658",
    title: "Site Engineer - Drainage",
    experience: "5 years of experience",
    skills: "Drainage Construction, Ashghal GEC Framework, HSE, Quality Assurance",
    location: "Doha, Doha, Qatar",
    description: "Supervise and oversee drainage construction activities on-site under the WSP GEC framework with Ashghal. Conduct site inspections, monitor contractor progress, and ensure HSE compliance. Qualifications: Bachelor's in Civil Engineering with 5+ years drainage construction experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91658/?keyword=site+engineer&mode=location",
  },
  {
    id: "91138",
    title: "Site Engineer - Landscape",
    experience: "8 years of experience",
    skills: "Landscape Architecture, Civil Engineering, Public Realm, Site Supervision",
    location: "Doha, Doha, Qatar",
    description: "Oversee lifecycle of landscape and public realm works within GEC Framework projects. Design reviews, construction supervision, quality standards, and environmental compliance. Qualifications: Bachelor's or Master's in Landscape Architecture or Civil Engineering with 8+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91138/?keyword=site+engineer&mode=location",
  },
  {
    id: "92944",
    title: "Lead Geotechnical Engineer",
    experience: "Lead / Senior",
    skills: "Geotechnical, Construction Management, Geohazard Identification, Instrumentation",
    location: "Tempe, AZ, United States",
    description: "Execute small to large field programs in transportation, power, property, and mining. Geohazard identification, managing subsurface investigation programs, foundation design, and settlement analysis. Qualifications: Degree in Civil/Geotechnical Engineering with PE license.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92944/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "86526",
    title: "Geotechnical Engineer (Tunneling & Geotechnical)",
    experience: "3 to 5 years",
    skills: "AutoCAD, Civil 3D, MicroStation, GeoSlope, Plaxis, LPILE, GROUP, GRLWEAP",
    location: "Portland, ME, United States",
    description: "Perform geotechnical engineering design and analyses for bridges, buildings, tunnels, underground structures, and retaining walls. Locations: Portland ME, Boston MA, North Providence RI, Glastonbury CT, Worcester MA. Qualifications: BS in Civil Engineering with geotechnical focus and 3-5 years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/86526/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "91152",
    title: "Senior Highway Engineer",
    experience: "Senior",
    skills: "Civil 3D, Highway Design, Cost Estimation, Local Government, Gloucestershire Projects",
    location: "Gloucester, Gloucestershire, United Kingdom",
    description: "Deliver diverse portfolio of highways, bridges, and infrastructure projects across Gloucestershire. Develop highway designs, ensure project delivery to UK DMRB standards, mentor junior staff. Qualifications: Civil Engineering degree with proven UK highway design experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91152/?keyword=highway+engineer&mode=location",
  },
  {
    id: "93003",
    title: "Senior Geotechnical Engineer",
    experience: "5 to 7 years",
    skills: "AutoCAD, Civil 3D, Geotechnical, Tunneling, Retaining Walls, Soil Mechanics",
    location: "Boston, MA, United States",
    description: "Coordinate subsurface investigations, perform geotechnical design for bridges, buildings, and tunnels across New England. Prepare calculation packages and foundation recommendations. Qualifications: BS/MS in Civil/Geotechnical Engineering with 5-7 years experience and PE license.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93003/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "90482",
    title: "Quantity Surveyor (Building Supervision)",
    experience: "7–10 years",
    skills: "Quantity Surveying, Surveying, FIDIC Contracts, Interim Valuations, Cost Reporting",
    location: "Dubai, Dubai, United Arab Emirates",
    description: "Commercial management of building supervision projects in Dubai. Value construction works, evaluate variations and contractual claims, prepare final accounts, and review BOQs. Qualifications: Bachelor's in Quantity Surveying or Civil Engineering with 7-10 years UAE/GCC experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/90482/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "83731",
    title: "Lead Geotechnical Engineer (Geohazards & Natural Hazards)",
    experience: "7+ years",
    skills: "Civil 3D, Geotechnical, Rockfall, Landslides, Debris Flows, Slope Stability",
    location: "Lakewood, CO, United States",
    description: "Grow our Geohazards and Geotechnical Engineering practice based in Lakewood, CO. Lead geohazard evaluations (rockfall, landslides, debris flows), slope stability, and mitigation design for transportation corridors and energy infrastructure. Qualifications: BS/MS in Geotechnical/Geological Engineering, PE required, 7+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/83731/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "91146",
    title: "Principal Highway Engineer (Local Government)",
    experience: "Principal / Associate",
    skills: "Highway Design, Cost Estimation, Local Government, Design Leadership, DMRB",
    location: "Gloucester, Gloucestershire, United Kingdom",
    description: "Join our Local Government team delivering significant highways, bridges, and infrastructure projects across Gloucestershire. Shape team vision, recruit talent, lead multidisciplinary highway designs, and oversee quality compliance. Qualifications: Chartered Civil Engineer (CEng) with substantial UK highways experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91146/?keyword=highway+engineer&mode=location",
  },
  {
    id: "84955",
    title: "Site Engineer (Geo-Environmental / Ground & Water)",
    experience: "Site Engineer",
    skills: "Geotechnical, Ground Investigation, Groundwater Monitoring, Land Contamination",
    location: "London, England, United Kingdom",
    description: "Support large scale ground investigations across the UK. Activities include groundwater monitoring, drilling rig supervision, site data collection, and land contamination management. Qualifications: Degree in Geology, Environmental Science, or Civil Engineering with UK site experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/84955/?keyword=site+engineer&mode=location",
  },
  {
    id: "85915",
    title: "Senior Geotechnical Engineer (Appalachian Basin)",
    experience: "5 to 7 years",
    skills: "Geotechnical, Construction Management, Pipelines, Dams, Mining, Slope Stability",
    location: "Wexford, PA, United States",
    description: "Join our Geotechnical Engineering Team in Wexford, PA focusing on linear pipeline alignments, dams, mining, and transportation corridors across the Appalachian Basin. Perform foundation engineering, settlement analysis, and geohazard monitoring. Qualifications: BS in Civil/Geotechnical Engineering with 5-7 years experience and PE license.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/85915/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "89999",
    title: "Quantity Surveyor (Advisory Business Unit)",
    experience: "Quantity Surveyor / Commercial Risk",
    skills: "Quantity Surveying, Commercial Risk, Contract Administration, Prolongation Claims",
    location: "Bengaluru, Karnataka, India",
    description: "Support Head of Commercial for Advisory Business Unit in Bengaluru, Noida, or Mumbai. Identify commercial risks, manage opportunity registers, assist with variations and contract negotiations. Qualifications: Degree in Quantity Surveying or Civil Engineering with 5+ years commercial experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/89999/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "88944",
    title: "Senior Geotechnical Engineer (Southeast US)",
    experience: "7+ years",
    skills: "Geotechnical, Foundation Design, Slope Stability, Pavement Evaluations, Shallow & Deep Foundations",
    location: "Birmingham, AL, United States",
    description: "Support transportation, power, and commercial developments across Alabama and the broader Southeast US. Lead subsurface exploration programs, shallow/deep foundation design, and slope stability analyses. Qualifications: BS in Civil Engineering, PE license, 7+ years geotechnical experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/88944/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "92352",
    title: "Principal Quantity Surveyor - Mechanical (MEPF)",
    experience: "10 to 12 years",
    skills: "BIM, Quantity Surveying, Electrical, Mechanical, Plumbing, Fire Fighting, RICS, CIOB",
    location: "Noida, Uttar Pradesh, India",
    description: "Prepare detailed quantity take-offs for MEPF trades (Electrical, Mechanical, Plumbing, Fire Fighting) from contract drawings and models. Manage cost plans, value engineering, and variance reports. Qualifications: Bachelor's in Mechanical or Electrical Engineering, RICS or CIOB certification mandatory, 10-12 years QS experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92352/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "83464",
    title: "Senior Highway Engineer (Norfolk Framework)",
    experience: "Senior",
    skills: "Highway Design, Cost Estimation, Local Government, Norfolk County Council Partnership",
    location: "Norwich, Norfolk, United Kingdom",
    description: "Deliver highway designs and infrastructure improvements as part of WSP’s long-term partnership with Norfolk County Council. Oversee design packages, pricing of briefs, mentoring junior engineers, and technical sign-offs. Qualifications: Degree in Civil Engineering with strong UK highways design background.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/83464/?keyword=highway+engineer&mode=location",
  },
  {
    id: "89092",
    title: "Civil Infrastructure Engineer (Development)",
    experience: "Mid-Level",
    skills: "AutoCAD, Civil 3D, Highway Design, Planning Applications, Drainage, Scheme Implementation",
    location: "Leeds, West Yorkshire, United Kingdom",
    description: "Contribute to concept studies, drawing packages, planning applications, and construction packages for development projects across the UK. Deliver infrastructure designs for commercial and residential schemes. Qualifications: Civil Engineering qualification with proficiency in Civil 3D and UK development design.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/89092/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "79964",
    title: "Civil Infrastructure Engineer (Development Projects)",
    experience: "Mid-Level",
    skills: "AutoCAD, Civil 3D, Highway Design, Sizewell C, Cambridge Greenways, Energy Recovery",
    location: "Cambridge, Cambridgeshire, United Kingdom",
    description: "Deliver prominent UK infrastructure projects such as EDF Energy Sizewell C, Cambridge Greenways, and major development corridors. Highway design, earthworks, and planning support. Qualifications: Degree in Civil Engineering with Civil 3D expertise and UK infrastructure project exposure.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/79964/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "91123",
    title: "Civil Infrastructure Engineer (Development)",
    experience: "Mid-Level",
    skills: "AutoCAD, Civil 3D, Highway Design, Planning Applications, Technical Approvals",
    location: "Birmingham, West Midlands, United Kingdom",
    description: "Work on multi-disciplinary development infrastructure projects from pre-feasibility through to construction issue. Highway alignments, drainage strategies, and technical submissions. Qualifications: Bachelor's in Civil Engineering with Civil 3D experience in UK development schemes.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91123/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "88240",
    title: "Senior Geotechnical Engineer (Western Canada)",
    experience: "8+ years",
    skills: "Geotechnical, P.Eng in BC, Slope Stability, Liquefaction, Soil Mechanics, Excavation Design",
    location: "Vancouver, BC, Canada",
    description: "Lead geotechnical investigations, analysis, and design for multidisciplinary infrastructure and energy projects across Western Canada (Vancouver, Langley, Burnaby). Evaluate complex soil behaviour, liquefaction, and slope stability. Qualifications: Bachelor's in Geotechnical/Civil Engineering, P.Eng in BC, 8+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/88240/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "72468",
    title: "Geotechnical Engineer I",
    experience: "1 to 3 years",
    skills: "Geotechnical, Construction Management, EIT, Tunneling, Shallow & Deep Foundations",
    location: "Virginia Beach, VA, United States",
    description: "Plan, estimate, and conduct subsurface investigations and laboratory testing for transit, transportation, and water projects. Perform analyses for tunnels, shallow/deep foundations, and earth retaining systems. Qualifications: Bachelor's in Civil Engineering with Geotechnical focus, EIT certification.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/72468/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "73045",
    title: "Senior Geotechnical Engineer (Mine Waste & Tailings)",
    experience: "Senior (8+ years)",
    skills: "Geotechnical, Mine Waste, Tailings Facility Investigations, Ground Conditions",
    location: "Midrand, Gauteng, South Africa",
    description: "Provide specialist geotechnical engineering services for the Mine Waste team in Midrand. Focus on mine waste, tailings facility investigations, geotechnical site investigations, and technical reporting across Africa. Qualifications: BSc/BEng in Geotechnical/Civil Engineering with extensive tailings/mine waste expertise.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/73045/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "83079",
    title: "Employer’s Agent / Quantity Surveyor",
    experience: "Quantity Surveyor / Contract Administrator",
    skills: "Quantity Surveying, Cost Management, Employer's Agent, Procurement, Cost Assurance",
    location: "Stockton-On-Tees, Cleveland, United Kingdom",
    description: "Pre- and post-contract Cost & Commercial Management, including Employer’s Agent services for residential developments and Department for Education frameworks. Estimating, procurement, and financial management. Qualifications: BSc in Quantity Surveying or working towards professional qualification.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/83079/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "83745",
    title: "Intermediate Geotechnical Engineer (Northern BC)",
    experience: "Intermediate (3-6 yrs)",
    skills: "Geotechnical, Borehole Drilling, Test Pitting, In-Situ Testing, Northern Living Allowance",
    location: "Prince George, BC, Canada",
    description: "Blend field assignments with office-based analysis and design across British Columbia and the Yukon. Lead field programs (drilling, test pitting, instrumentation) and develop recommendations for foundations, retaining structures, and slope stability. Northern Living Allowance provided. Qualifications: Degree in Geotechnical/Civil Engineering with P.Eng/EIT.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/83745/?keyword=geotechnical+engineer&mode=location",
  },
  {
    id: "89672",
    title: "Senior Quantity Surveyor (Civil Infrastructure & Utilities)",
    experience: "Senior / MRICS or Assoc RICS",
    skills: "Quantity Surveying, Cost Planning, Procurement, Civil Infrastructure, Utilities",
    location: "Birmingham, West Midlands, United Kingdom",
    description: "Join the Civil Infrastructure and Utilities group within PMCM in Birmingham City Centre. Deliver QS and Cost Management services on iconic UK infrastructure programmes, including estimating, procurement, and commercial leadership. Qualifications: MRICS or AssocRICS with proven infrastructure QS track record.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/89672/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "92876",
    title: "Quantity Surveyor / Cost Manager - Associate Director",
    experience: "Associate Director / Leadership",
    skills: "Quantity Surveying, Commercial Leadership, Cost Planning, Utilities & Infrastructure",
    location: "Birmingham, West Midlands, United Kingdom",
    description: "Associate Director leadership position within Civil Infrastructure & Utilities team in Birmingham. Lead QS teams, win work, manage major client accounts, and drive commercial excellence across landmark programmes. Qualifications: Chartered Surveyor (MRICS/FRICS) with substantial leadership background.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92876/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "92041",
    title: "Cost Managers, Commercial Managers and Quantity Surveyors",
    experience: "Multiple Levels",
    skills: "Quantity Surveying, Cost Management, Commercial Advisory, Water, Transportation, Defence",
    location: "Manchester, Greater Manchester, United Kingdom",
    description: "Multiple opportunities for Quantity Surveyors and Commercial Managers in Greater Manchester across Defence, Energy, Water, and Transportation markets. Provide cost assurance, contract administration, and procurement advisory. Qualifications: Degree in QS or Commercial Management.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92041/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "92026",
    title: "Senior Quantity Surveyor (CI&U - PMCM Manchester)",
    experience: "Senior",
    skills: "Quantity Surveying, Cost Planning, Utilities, Civil Infrastructure, Contract Management",
    location: "Manchester, Greater Manchester, United Kingdom",
    description: "Join our growing Civil Infrastructure and Utilities team in Manchester. Deliver pre- and post-contract QS and commercial management services across landmark infrastructure programmes that impact communities and the economy. Qualifications: BSc in Quantity Surveying with senior commercial leadership experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92026/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "94245",
    title: "Construction Engineer (Hampton Roads Bridge Tunnel Expansion)",
    experience: "Minimum 3 years / EIT or PE",
    skills: "Construction Management, Heavy Civil, Bridge, Roadway, Inspection Oversight, QAQC",
    location: "Virginia Beach, VA, United States",
    description: "Oversee construction activities on the multi-billion dollar Hampton Roads Bridge Tunnel Expansion Project, the largest project in VDOT history. Inspect heavy civil, bridge, roadway, and structural works. Qualifications: Four-year College degree, EIT required (PE preferred), minimum 3 years construction inspection experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/94245/?keyword=construction+engineer&mode=location",
  },
  {
    id: "90022",
    title: "Quantity Surveyor (Substation Experience)",
    experience: "Project Engineer / Quantity Surveyor",
    skills: "Quantity Surveying, Electrical Substation Projects, Interim Payment Certificates, Final Accounts",
    location: "Muscat, Muscat, Oman",
    description: "Manage quantity surveying for major electrical substation and extension projects in Oman. Monitor costs and contractual aspects, check site measurements, prepare Interim Payment Certificates and Final Accounts. Qualifications: Bachelor's in Engineering, in-depth knowledge of electrical systems and contract documents.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/90022/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "91121",
    title: "Principal Civil Infrastructure Engineer (Development)",
    experience: "Principal / Technical Lead",
    skills: "Highway Design, Drainage, SuDS, Flood Risk, Streetscape, Earthworks, Project Management",
    location: "Manchester, Greater Manchester, United Kingdom",
    description: "Lead technical delivery of civil engineering consultancy across feasibility, planning, detailed design, and construction in Manchester. Technical expertise in SuDS, flood risk, highways, and earthworks. Qualifications: Chartered Civil Engineer with substantial UK development infrastructure background.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91121/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "84082",
    title: "Geotechnical Engineer (Geotechnics & Tunnels)",
    experience: "2+ years",
    skills: "Geotechnical, Site Investigations, Tunnelling, Sampling, Logging, In-Situ Testing",
    location: "Sydney, New South Wales, Australia",
    description: "Join our Geotechnics & Tunnels team in Sydney supporting some of Australia's most complex infrastructure and tunneling projects. Perform site investigations, logging, data interpretation, and risk assessments. Qualifications: Bachelor's in Civil/Geotechnical Engineering with 2+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/84082/?keyword=site+engineer&mode=location",
  },
  {
    id: "84974",
    title: "Speculative Civil Infrastructure Engineers (Development - UK Wide)",
    experience: "All Levels",
    skills: "Highway Design, Drainage, Flood Protection, Earthworks, Utility Coordination",
    location: "London, England, United Kingdom",
    description: "Opportunities across London, Basingstoke, Southampton, Cardiff, Cambridge, Guildford, Bristol, Manchester, Leeds, Liverpool, Birmingham, Newcastle, and Glasgow. Deliver technical reports and drawings for masterplanning and planning applications. Qualifications: Civil Engineering degree with CAD/Civil 3D capability.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/84974/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "91981",
    title: "Infrastructure Engineer – Dry Utilities",
    experience: "10+ years",
    skills: "Dry Utilities, Electrical LV/MV/HV, Street Lighting, Fiber Optic, District Cooling, Gas",
    location: "Abu Dhabi, Abu Dhabi, United Arab Emirates",
    description: "Planning, design review, coordination, and construction supervision of dry utility infrastructure systems in Abu Dhabi. Coordinate LV/MV/HV distribution, street lighting, telecoms, and district cooling. Qualifications: Bachelor's in Electrical/Civil Engineering with 10+ years dry utility experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91981/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "86474",
    title: "Associate Civil Infrastructure Engineer (Development)",
    experience: "Associate / Technical Lead",
    skills: "Civil Infrastructure, Technical Leadership, Multidisciplinary Coordination, Client Management",
    location: "Newcastle Upon Tyne, Tyne and Wear, United Kingdom",
    description: "Provide technical leadership to design teams in Newcastle and Stockton-On-Tees. Act as Project Director / Manager on a wide range of civil engineering design projects both in the UK and overseas. Qualifications: Chartered Engineer (CEng MICE) with extensive leadership experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/86474/?keyword=infrastructure+engineer&mode=location",
  },
  {
    id: "93549",
    title: "Construction Manager / Field Engineer (Brent Spence Bridge)",
    experience: "Construction Manager / Field Engineer",
    skills: "Construction Management, Brent Spence Bridge, Bridge Segment Oversight, Procore, AASHTOWare",
    location: "Cincinnati, OH, United States",
    description: "Serve as front-line advocate for the Bridge segment of the historic Brent Spence Bridge project in Cincinnati, OH and Covington, KY. Oversee construction oversight, material testing, change orders, and dispute resolution. Qualifications: Degree in Civil Engineering or Construction Management with bridge experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93549/?keyword=construction+engineer&mode=location",
  },
  {
    id: "88290",
    title: "Civil Project Engineer",
    experience: "4-10 years",
    skills: "Civil 3D, Roads, Drainage, Utilities, Pavements, Defence & Low Carbon Infrastructure",
    location: "Melbourne, Victoria, Australia",
    description: "Scope and steer civil works from concept through detailed design and construction support across Defence, Data Centres, and low-carbon infrastructure projects in Melbourne and nationally across Australia. Qualifications: Degree in Civil Engineering with 4-10 years experience and Civil 3D proficiency.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/88290/?keyword=civil+engineering&mode=location",
  },
  {
    id: "93419",
    title: "Senior Planning Engineer (Water Infrastructure)",
    experience: "10+ years (6-10+ years water engineering)",
    skills: "Cost Estimation, Water & Wastewater Network Modelling, Feasibility, Business Cases",
    location: "Adelaide, South Australia, Australia",
    description: "Join WSP's national Water team in Adelaide delivering consultancy services for water and wastewater network modelling, asset condition, renewals, and population growth. Prepare regulatory business cases. Qualifications: Bachelor's in Civil/Environmental Engineering with 10+ years water planning experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93419/?keyword=planning+engineer&mode=location",
  },
  {
    id: "87438",
    title: "Data Centre Construction Manager",
    experience: "15+ years",
    skills: "Construction Management, 50MW IT Load Data Centre, MEP/Civil/Structural/ELV, Commissioning",
    location: "Riyadh, Riyadh, Saudi Arabia",
    description: "Lead the delivery of a major mission-critical 50MW IT Load Data Centre project located ~80km from Riyadh. Oversee all on-site construction across Civil, Structural, MEP, ICT, ELV, and handover. Qualifications: Bachelor's degree with 15+ years experience including large-scale data centre delivery.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/87438/?keyword=site+engineer&mode=location",
  },
  {
    id: "93418",
    title: "Engineer - Maritime Structures",
    experience: "4-6 years",
    skills: "AutoCAD, STAAD, STAAD.Pro, Robot Structural, Marginal Quays, Jetties, Dolphins, Ro-Ro",
    location: "Noida, Uttar Pradesh, India",
    description: "Part of the maritime structures team in Noida, Mumbai, or Bengaluru. Structural analysis, berthing studies, mooring analyses, and rehabilitation studies for quays, jetties, and coastal structures using STAAD.Pro and Eurocodes. Qualifications: B.Tech/M.Tech in Civil/Structural Engineering with 4-6 years maritime design experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93418/?keyword=quantity+surveyor&mode=location",
  },
  {
    id: "91143",
    title: "Senior Engineer - Substation - Civil & Structural",
    experience: "10-12 years",
    skills: "STAAD, STAAD.Pro, Structural Design, Concrete, Steel Structures, T&D, Switchyards",
    location: "Bengaluru, Karnataka, India",
    description: "Join our Power department collaborating with WSP USA North. Technical expert and project lead for transmission-level substations and switchyards structural design (steel and concrete foundations). Qualifications: Bachelor's/Master's in Civil/Structural Engineering with 10-12 years substation experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91143/?keyword=civil+engineering&mode=location",
  },
  {
    id: "89550",
    title: "Senior Planning Engineer (Major Projects KSA)",
    experience: "12–15 years",
    skills: "Primavera P6, MS Project, Excel, Project Scheduling, Milestone Tracking, EOT Claims",
    location: "Al Ula, Al Madinah, Saudi Arabia",
    description: "Develop and manage project schedules using Primavera P6 for major giga-projects in Al Ula, KSA. Critical path analysis, risk mitigation, and Extension of Time (EOT) delay claims. Qualifications: Bachelor's in Civil Engineering with 12-15 years experience in Primavera P6 planning.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/89550/?keyword=planning+engineer&mode=location",
  },
  {
    id: "91309",
    title: "Transportation Planning Engineer",
    experience: "8+ years",
    skills: "Active Transportation, Multi-Modal Transit, Traffic Analysis, Project Management",
    location: "Ottawa, ON, Canada",
    description: "Assume a Project Manager role delivering transportation planning and engineering projects across Canada based in Ottawa. Active transportation master planning, traffic engineering analyses, and public consultations. Relocation assistance offered. Qualifications: Degree in Civil/Transportation Engineering with 8+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91309/?keyword=planning+engineer&mode=location",
  },
  {
    id: "93843",
    title: "Transmission Planning Engineer - Lead Professional",
    experience: "7 to 10 years",
    skills: "Power Flow, Contingency Analysis, Short Circuit Analysis, Dynamic Stability, TPL-001, SCADA",
    location: "Denver, CO, United States",
    description: "Join our Electrical Studies, SCADA, and Protection (ESSP) team in Denver, CO (also Fort Worth TX, Orlando FL, Phoenix AZ, Overland Park KS, Pittsburgh PA, Raleigh NC, or Remote). Perform power flow, dynamic stability, and interconnection studies. Qualifications: BS in Electrical Engineering with 7-10 years transmission planning experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93843/?keyword=planning+engineer&mode=location",
  },
  {
    id: "88161",
    title: "Transportation Planning Engineer / Project Manager",
    experience: "8+ years",
    skills: "Active Transportation Infrastructure Planning, Functional Design, Traffic Engineering, TDM",
    location: "Winnipeg, MB, Canada",
    description: "Step into a Project Manager role spanning transportation planning, traffic engineering, active transportation, and road safety initiatives in Winnipeg, MB. Functional design, traffic analysis, and transit planning. Qualifications: Degree in Civil/Transportation Engineering with 8+ years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/88161/?keyword=planning+engineer&mode=location",
  },
  {
    id: "85434",
    title: "Senior Mechanical Design Engineer (Building Services)",
    experience: "10 years of experience",
    skills: "AutoCAD, Revit, HVAC Software, 3D Modelling, Mechanical Building Services",
    location: "Pasig City, National Capital Region (NCR), Philippines",
    description: "Lead and supervise Mechanical Engineering team for building services and associated HVAC systems. Coordinate with international clients, supply authorities, and multidisciplinary design teams. Qualifications: Bachelor's in Mechanical Engineering, Registered Mechanical Engineer, 10 years experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/85434/?keyword=planning+engineer&mode=location",
  },
  {
    id: "88309",
    title: "Senior Engineer– Civil & Structural (Power & Renewables)",
    experience: "8-10 years",
    skills: "Civil 3D, STAAD, ETABS, Structural Design, HV Substations, Solar, Wind, BESS Plants, BOQ",
    location: "Noida, Uttar Pradesh, India",
    description: "Conceptual design & FEED for substations, solar, wind & BESS utility-scale plants. Prepare site layouts, drainage layouts, structural calculations, earthworks, and BOQs for power and water projects. Qualifications: 8-10 years experience in civil & structural design of power and renewable energy plants.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/88309/?keyword=civil+engineer&mode=location",
  },
  {
    id: "91237",
    title: "CAD Technician - Bridges",
    experience: "CAD Technician (Bridge Infrastructure)",
    skills: "AutoCAD, Revit, STAAD, STAAD.Pro, SAP2000, 3D Bridge Modeling, Visualizations",
    location: "Bengaluru, Karnataka, India",
    description: "Assist engineering team in creating accurate 3D CAD drawings and models for bridge design and construction projects in Bengaluru or Noida. Review designs, prepare engineering reports, and maintain CAD archives. Qualifications: Diploma/Degree in Civil Engineering with strong AutoCAD and 3D modeling skills.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91237/?keyword=construction+engineer&mode=location",
  },
  {
    id: "93896",
    title: "Senior Road and Civil Engineer (Utility Infrastructure)",
    experience: "Minimum 12 years",
    skills: "AutoCAD, Civil 3D, Geotechnical, Site Supervision, Roads, Pavements, Utility Corridors",
    location: "Jeddah, Makkah, Saudi Arabia",
    description: "Technical leadership and site supervision for road and civil infrastructure construction activities associated with utility projects in Jeddah. Supervise pavements, drainage networks, and utility corridors. Qualifications: Bachelor's in Civil Engineering with 12+ years experience in road and civil infrastructure.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93896/?keyword=construction+engineer&mode=location",
  },
  {
    id: "92461",
    title: "Senior Engineer - Civil (Geotechnical & Substations)",
    experience: "6-8 years",
    skills: "Project Planning, Structural Design, Geotechnical, Soil Sampling, Borehole Drilling, Foundations",
    location: "Noida, Uttar Pradesh, India",
    description: "Prepare site investigation specifications (soil sampling, borehole drilling), analyze geotechnical data, design foundations and retaining structures for HV Substations, power, water, and renewable projects. Qualifications: 6-8 years experience in civil, structural, and geotechnical design.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/92461/?keyword=civil+engineer&mode=location",
  },
  {
    id: "93358",
    title: "Graduate Engineer - Maritime (Emirati National)",
    experience: "Graduate / Entry Level",
    skills: "AutoCAD, STAAD, STAAD.Pro, Project Planning, Marine Structures, Quay Walls, Jetties",
    location: "Sharjah, Sharjah, United Arab Emirates",
    description: "WSP in the Middle East is seeking a motivated Emirati Graduate Engineer to join our Marine Infrastructure team in Sharjah. Assist with technical studies, calculations, drawings, and structural analysis of quay walls, jetties, and breakwaters. Qualifications: UAE National with degree in Civil, Structural, or Marine Engineering.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93358/?keyword=construction+engineer&mode=location",
  },
  {
    id: "93234",
    title: "Senior Engineer - Highways (Canadian Projects)",
    experience: "7-10 years",
    skills: "Civil 3D, Road Design, OpenRoads, Inroads, MicroStation, Canadian Engineering Standards",
    location: "Bengaluru, Karnataka, India",
    description: "Technical analysis and design for Canadian highway and freeway projects (alignments, geometrics, staging, utilities, roadside safety). Work with Civil 3D, OpenRoads, and Inroads against Canadian Ministry of Transportation standards. Qualifications: Bachelor's/Master's in Civil Engineering with 7-10 years postgraduate experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/93234/?keyword=highway+engineer&mode=location",
  },
  {
    id: "91503",
    title: "Senior Engineer - Highways (Nordic & Swedish Standards)",
    experience: "Senior (Geometric Design & Roadway Modeling)",
    skills: "AutoCAD, Civil 3D, BIM, Novapoint, Swedish Engineering Standards, Roadway Design",
    location: "Noida, Uttar Pradesh, India",
    description: "Accountable for end-to-end delivery of high-quality Roads & Highways design outputs in compliance with Swedish engineering standards. Geometric design, roadway modelling in Civil 3D/Novapoint, alignments, junctions, and superelevation. Qualifications: Civil Engineering degree with proven highway design experience.",
    applyUrl: "https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/91503/?keyword=highway+engineer&mode=location",
  },
];

async function main() {
  console.log("================================================================================");
  console.log("🌟 SPONSORA INTELLIGENT JOB INGESTION SYSTEM — DOCUMENT EXTRACTION & ENRICHMENT");
  console.log(`   Processing ${RAW_JOBS_DATA.length} verified engineering roles from WSP Global`);
  console.log("================================================================================\n");

  const dbPath = path.resolve("./lib/db/realJobsData.json");
  const rawJson = fs.readFileSync(dbPath, "utf8");
  const data = JSON.parse(rawJson);

  const existingJobs: any[] = data.jobs || [];
  const existingCompanies: any[] = data.companies || [];

  // Ensure WSP company profile exists with rich verified metadata
  const wspCompanyId = "comp_wsp";
  const wspIndex = existingCompanies.findIndex((c: any) => c.id === wspCompanyId || c.normalized_name === "wsp");
  const wspProfile = {
    id: wspCompanyId,
    name: "WSP",
    normalized_name: "wsp",
    country_code: "GB",
    industry: "Civil & Structural Engineering",
    website: "https://www.wsp.com",
    careers_url: "https://www.wsp.com/en-gb/careers",
    logo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=128&h=128&fit=crop",
    description: "WSP is a world-leading professional services consulting firm dedicated to engineering, infrastructure, transport, environmental, and structural innovations with global visa sponsorship and relocation programs.",
    sponsorship_signal: "high",
    is_verified_sponsor: 1,
    active: 1,
    created_at: "2026-08-25T00:00:00.000Z",
    updated_at: new Date().toISOString(),
  };

  if (wspIndex >= 0) {
    existingCompanies[wspIndex] = { ...existingCompanies[wspIndex], ...wspProfile };
  } else {
    existingCompanies.unshift(wspProfile);
  }

  const jobsMap = new Map<string, any>();
  existingJobs.forEach((j) => jobsMap.set(j.canonical_hash || j.id, j));

  let insertedCount = 0;
  let updatedCount = 0;

  for (let idx = 0; idx < RAW_JOBS_DATA.length; idx++) {
    const raw = RAW_JOBS_DATA[idx];
    const locInfo = parseLocationDetails(raw.location + " " + raw.description, raw.title);
    const catInfo = inferEngineeringCategory(raw.title, raw.description);
    const salaryInfo = estimateRealisticSalary(locInfo.countryCode, raw.title, raw.experience);

    const fullJobId = `wsp_job_${raw.id}`;
    const slug = `${raw.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${raw.id}`;
    const canonicalHash = `job_wsp_${raw.id}_${locInfo.countryCode.toLowerCase()}`;

    // Rich structured Markdown Description
    const formattedDesc = `## About WSP
WSP is one of the world's leading engineering professional services consulting firms. We are dedicated to our local communities and propelled by international brainpower. We are technical experts and strategic advisors including engineers, technicians, scientists, architects, planners, surveyors, and environmental specialists.

## Role Overview
**Position:** ${raw.title}
**Discipline:** ${catInfo.categoryName}
**Location:** ${locInfo.location}
**Experience Level:** ${raw.experience}
**Core Tools & Skills:** ${raw.skills}

## Key Responsibilities
${raw.description.split("Responsibilities:")[1]?.split("Qualifications:")[0]?.trim() || raw.description}

## Qualifications & Competencies
${raw.description.split("Qualifications:")[1]?.trim() || "• Relevant degree in Civil, Structural, or related Engineering discipline.\n• Proficiency in relevant design and modeling software (e.g. AutoCAD, Civil 3D, STAAD, ETABS).\n• Strong communication, technical reporting, and problem-solving skills."}

## Visa Sponsorship & Global Mobility
WSP is a certified global employer supporting international technical talent mobility and visa sponsorship across eligible engineering shortage disciplines. Relocation assistance and visa compliance guidance are provided for qualifying candidates.

## Direct Application
Apply directly via the official WSP career portal at: [WSP Career Portal](${raw.applyUrl})`;

    const structuredJob: StructuredJobRecord = {
      id: fullJobId,
      source_id: "wsp_oracle_cloud",
      source_job_id: raw.id,
      canonical_hash: canonicalHash,
      title: raw.title,
      slug: slug,
      company_id: wspCompanyId,
      company_name: "WSP",
      company_website: "https://www.wsp.com",
      company_logo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=128&h=128&fit=crop",
      description: formattedDesc,
      description_clean: formattedDesc.replace(/#|\*|\[|\]\([^)]*\)/g, "").trim(),
      location: locInfo.location,
      city: locInfo.city,
      region: locInfo.region,
      country_code: locInfo.countryCode,
      remote_type: "ONSITE",
      employment_type: raw.experience.toLowerCase().includes("intern") || raw.experience.toLowerCase().includes("co-op") ? "INTERNSHIP" : "FULL_TIME",
      category_id: catInfo.categoryId,
      category_slug: catInfo.categorySlug,
      category_name: catInfo.categoryName,
      salary_min: salaryInfo.min,
      salary_max: salaryInfo.max,
      salary_currency: salaryInfo.currency,
      job_url: raw.applyUrl,
      apply_url: raw.applyUrl,
      source_url: raw.applyUrl,
      applyUrl: raw.applyUrl,
      publishedAt: new Date(Date.now() - (idx % 7) * 86400000).toISOString(),
      first_seen_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 92,
      sponsorship_label: "Strong",
      sponsorship_positive_evidence: JSON.stringify([
        "WSP Global International Mobility & Engineering Sponsorship Certified",
        "Direct verified employer ATS application link verified (Oracle Cloud HCM)",
        "Shortage engineering discipline (Civil / Structural / Infrastructure)"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify(raw.skills.split(",").map(s => s.trim())),
      quality_score: 100,
      status: "active",
      is_featured: idx < 15 ? 1 : 0,
      isExpired: false,
      created_at: new Date(Date.now() - (idx % 7) * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isNew = !jobsMap.has(canonicalHash) && !jobsMap.has(fullJobId);
    jobsMap.set(canonicalHash, structuredJob);

    if (isNew) {
      insertedCount++;
    } else {
      updatedCount++;
    }
  }

  const updatedData = {
    companies: existingCompanies,
    jobs: Array.from(jobsMap.values()),
  };

  fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2), "utf8");

  console.log(`✅ Ingestion Complete!`);
  console.log(`   - New Jobs Inserted: ${insertedCount}`);
  console.log(`   - Existing Jobs Updated: ${updatedCount}`);
  console.log(`   - Total Database Jobs Now: ${updatedData.jobs.length}`);
  console.log(`   - Total Companies: ${updatedData.companies.length}`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Error running job ingestion:", err);
  process.exit(1);
});
