/**
 * Free Company Logo & Brand Favicon Enrichment Service
 * Leverages Google S2 High-Res API + Clearbit Free Logo API + DuckDuckGo Favicon
 * 100% Free, Zero API Keys, Unlimited Bandwidth.
 */

export class CompanyEnrichmentService {
  /**
   * Resolves the best available high-resolution company logo URL for any company name or domain
   */
  static getCompanyLogoUrl(companyName: string, websiteUrl?: string | null): string {
    const domain = this.extractDomain(websiteUrl) || this.inferDomain(companyName);

    if (domain) {
      // 1. Google High-Res 128px Corporate Favicon / Brand Icon
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    }

    // Fallback placeholder via UI initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0284c7&color=ffffff&bold=true&size=128`;
  }

  /**
   * Generates a set of logo candidates for resilient fallback
   */
  static getLogoCandidates(companyName: string, websiteUrl?: string | null): string[] {
    const domain = this.extractDomain(websiteUrl) || this.inferDomain(companyName);
    if (!domain) {
      return [
        `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0284c7&color=ffffff&bold=true&size=128`
      ];
    }

    return [
      `https://logo.clearbit.com/${domain}`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0284c7&color=ffffff&bold=true&size=128`,
    ];
  }

  private static extractDomain(url?: string | null): string | null {
    if (!url) return null;
    try {
      let clean = url.trim();
      if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
        clean = "https://" + clean;
      }
      const parsed = new URL(clean);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }

  private static inferDomain(name: string): string | null {
    if (!name) return null;
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean.length < 2) return null;
    return `${clean}.com`;
  }
}
