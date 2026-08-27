import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, '..', 'public', 'images', 'blog');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const posts = [
  { id: 'uk-sponsorship-2026', title: 'UK Visa Sponsorship 2026', subtitle: '100+ Verified Licensed Sponsors', tag: 'UK IMMIGRATION', color1: '#0284c7', color2: '#1e3a8a', flag: '🇬🇧' },
  { id: 'ats-resume-checker-guide', title: 'ATS Resume Checker Guide', subtitle: 'How to Score 90%+ for Visa Jobs', tag: 'ATS OPTIMIZATION', color1: '#4f46e5', color2: '#312e81', flag: '🎯' },
  { id: 'us-h1b-tech-companies', title: 'US Tech H-1B Sponsors 2026', subtitle: 'Top 50 Companies & Cap-Exempt Roles', tag: 'USA TECH JOBS', color1: '#dc2626', color2: '#1e1b4b', flag: '🇺🇸' },
  { id: 'canada-global-talent-stream', title: 'Canada Global Talent Stream', subtitle: '2-Week Fast-Track Work Permit', tag: 'CANADA IMMIGRATION', color1: '#e11d48', color2: '#881337', flag: '🇨🇦' },
  { id: 'australia-tss-482-pr', title: 'Australia Visa Sponsorship', subtitle: 'TSS 482 & PR 186 Complete Guide', tag: 'AUSTRALIA JOBS', color1: '#0d9488', color2: '#134e4a', flag: '🇦🇺' },
  { id: 'germany-eu-blue-card', title: 'Germany EU Blue Card (English)', subtitle: 'Fast-Track EU PR & Shortage Roles', tag: 'GERMANY JOBS', color1: '#d97706', color2: '#78350f', flag: '🇩🇪' },
  { id: 'executive-cv-format', title: 'Executive CV Format & Metrics', subtitle: 'Pass Executive ATS & Leadership Screen', tag: 'EXECUTIVE CAREERS', color1: '#7c3aed', color2: '#4c1d95', flag: '👔' },
  { id: 'remote-jobs-visa-sponsorship', title: 'Remote Jobs with Sponsorship', subtitle: 'Work Anywhere & Relocate Later', tag: 'GLOBAL REMOTE', color1: '#2563eb', color2: '#0f172a', flag: '🌐' },
  { id: 'cv-job-match-technology', title: 'Deterministic CV-to-Job Match', subtitle: 'Find Jobs Matching Your Skills Automatically', tag: 'MATCHING ENGINE', color1: '#059669', color2: '#064e3b', flag: '⚡' },
  { id: 'visa-sponsorship-playbook-2026', title: 'Visa Sponsorship Playbook 2026', subtitle: 'Step-by-Step Global Career Strategy', tag: 'ULTIMATE GUIDE', color1: '#0284c7', color2: '#4338ca', flag: '🚀' },
];

posts.forEach((p) => {
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="url(#grad_${p.id})"/>
    <circle cx="1050" cy="150" r="280" fill="white" fill-opacity="0.05"/>
    <circle cx="150" cy="500" r="350" fill="white" fill-opacity="0.04"/>
    
    <defs>
      <linearGradient id="grad_${p.id}" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${p.color1}"/>
        <stop offset="100%" stop-color="${p.color2}"/>
      </linearGradient>
    </defs>

    <!-- Tag Badge -->
    <rect x="80" y="80" width="300" height="44" rx="22" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.3" stroke-width="1"/>
    <text x="105" y="108" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="1.5">${p.flag}  ${p.tag}</text>

    <!-- Title & Subtitle -->
    <text x="80" y="260" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">${p.title}</text>
    <text x="80" y="330" fill="white" fill-opacity="0.85" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="500">${p.subtitle}</text>

    <!-- Bottom Bar -->
    <line x1="80" y1="480" x2="1120" y2="480" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
    <text x="80" y="540" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800">SponsorAJobs</text>
    <text x="250" y="540" fill="white" fill-opacity="0.7" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500">• Verified Visa Sponsorship Database &amp; ATS Engine</text>
    <text x="980" y="540" fill="white" fill-opacity="0.9" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700">Read Guide →</text>
  </svg>`;

  fs.writeFileSync(path.join(dir, `${p.id}.svg`), svg, 'utf8');
});

console.log('Successfully generated 10 high-resolution branded SVG blog banners in public/images/blog/');
