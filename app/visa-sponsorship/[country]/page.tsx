import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCountryBySlug } from "@/config/countries";
import Link from "next/link";
import { ShieldCheck, ExternalLink, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface CountryVisaGuidePageProps {
  params: {
    country: string;
  };
}

const COUNTRY_VISA_DATA: Record<
  string,
  {
    visaName: string;
    officialGovName: string;
    officialGovUrl: string;
    overview: string;
    keyRequirements: string[];
    howToVerifyEmployer: string;
  }
> = {
  uk: {
    visaName: "UK Skilled Worker & Health/Care Worker Visa",
    officialGovName: "UK Visas and Immigration (GOV.UK)",
    officialGovUrl: "https://www.gov.uk/skilled-worker-visa",
    overview: "In the United Kingdom, foreign professionals require a Certificate of Sponsorship (CoS) issued by an approved Home Office sponsor licence holder.",
    keyRequirements: [
      "Employer must possess an active UK Home Office Sponsor Licence.",
      "Job must meet eligible Standard Occupational Classification (SOC) code.",
      "Salary must meet the general threshold or going rate for the role.",
      "English language proficiency (B1 level minimum)."
    ],
    howToVerifyEmployer: "You can cross-reference the company name against the official UK Register of Licensed Sponsors published on GOV.UK."
  },
  usa: {
    visaName: "US H-1B, O-1, & Employment-Based Green Cards",
    officialGovName: "US Citizenship and Immigration Services (USCIS)",
    officialGovUrl: "https://www.uscis.gov/working-in-the-united-states",
    overview: "In the United States, employers sponsor specialty occupation workers through the H-1B lottery/cap-exempt petitions, O-1 extraordinary ability visas, or PERM Labor Certification for permanent residency.",
    keyRequirements: [
      "Role must require at least a Bachelor's degree in a specific specialty.",
      "Employer submits Labor Condition Application (LCA) to Department of Labor.",
      "Prevailing wage requirements established by DOL must be met.",
      "Form I-129 petition approval from USCIS."
    ],
    howToVerifyEmployer: "Review historical Labor Condition Applications (LCAs) and USCIS H-1B Employer Data Hub."
  },
  australia: {
    visaName: "Australia Subclass 482 (TSS / Skills in Demand) & 186 ENS",
    officialGovName: "Department of Home Affairs (Australia)",
    officialGovUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482",
    overview: "Australia allows approved Standard Business Sponsors (SBS) to nominate skilled overseas workers under the Temporary Skill Shortage (Subclass 482) or Employer Nomination Scheme (Subclass 186).",
    keyRequirements: [
      "Occupation must be on the Short-term, Medium/Long-term (MLTSSL) or Regional list.",
      "Employer must be an approved Standard Business Sponsor.",
      "Salary must meet the Temporary Skilled Migration Income Threshold (TSMIT).",
      "Relevant skills assessment where mandated."
    ],
    howToVerifyEmployer: "Confirm employer's Standard Business Sponsor status and accreditation with Home Affairs."
  },
  canada: {
    visaName: "Canada LMIA Work Permits & Express Entry PNP",
    officialGovName: "Immigration, Refugees and Citizenship Canada (IRCC)",
    officialGovUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html",
    overview: "In Canada, employer sponsorship usually requires a positive Labour Market Impact Assessment (LMIA) from ESDC or an LMIA-exempt intra-company / international mobility pathway.",
    keyRequirements: [
      "Employer obtains positive Labour Market Impact Assessment (LMIA).",
      "Valid job offer matching TEER / NOC skill categories.",
      "Adherence to provincial prevailing wages.",
      "Work permit issued by IRCC."
    ],
    howToVerifyEmployer: "Check that the employer has obtained an approved LMIA number from Employment and Social Development Canada (ESDC)."
  },
  "new-zealand": {
    visaName: "New Zealand Accredited Employer Work Visa (AEWV)",
    officialGovName: "Immigration New Zealand",
    officialGovUrl: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa",
    overview: "In New Zealand, employers must be formally accredited with Immigration New Zealand before they can issue a Job Check to hire international workers on the AEWV.",
    keyRequirements: [
      "Employer must hold active INZ Employer Accreditation.",
      "Approved Job Check completed with genuine local market test.",
      "Salary meets minimum median wage rate or Green List exemption.",
      "English proficiency and character requirements."
    ],
    howToVerifyEmployer: "Verify the employer's status in the Immigration New Zealand Accredited Employer Directory."
  }
};

export default function CountryVisaGuidePage({ params }: CountryVisaGuidePageProps) {
  const country = getCountryBySlug(params.country);
  const canonicalSlug = country?.slug || params.country.toLowerCase();
  const visaData = COUNTRY_VISA_DATA[canonicalSlug] || (country ? COUNTRY_VISA_DATA[country.slug] : undefined);

  if (!country || !visaData) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/visa-sponsorship"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all Visa Guides</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{country.flag}</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Official Visa Guide</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {country.name} Visa Sponsorship
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {visaData.overview}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <a
              href={visaData.officialGovUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{visaData.officialGovName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              href={`/jobs/${country.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Browse {country.name} Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Key Sponsorship Requirements */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs mb-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Key Sponsorship Requirements</h2>
          <div className="space-y-2.5">
            {visaData.keyRequirements.map((req, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Verify Employers */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs mb-8 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">How to Verify an Employer in {country.name}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {visaData.howToVerifyEmployer}
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Informational Notice — Not Legal Advice</p>
            <p className="leading-relaxed text-amber-800">
              SponsorAJobs is an informational discovery engine and is not affiliated with any government agency or law firm. Immigration laws and minimum salary rates are subject to change. Always refer directly to the official {visaData.officialGovName} website.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
