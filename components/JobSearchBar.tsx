"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  MapPin,
  ArrowRight,
  X,
  Briefcase,
  Sparkles,
  ChevronDown,
  Code2,
  HardHat,
  BarChart3,
} from "lucide-react";
import { INITIAL_COUNTRIES } from "@/config/countries";

// SVG mini-flags for cross-platform compatibility (Windows, Mac, iOS, Android)
const MiniFlags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-2xs inline-block mr-1.5 shrink-0 overflow-hidden shadow-2xs">
      <clipPath id="sf_gb"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="sf_gbt"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#sf_gb)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#sf_gbt)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-2xs inline-block mr-1.5 shrink-0 overflow-hidden shadow-2xs">
      <rect width="60" height="30" fill="#00008B" />
      <circle cx="45" cy="8" r="2" fill="#fff" />
      <circle cx="50" cy="14" r="1.5" fill="#fff" />
      <circle cx="42" cy="18" r="2" fill="#fff" />
      <circle cx="48" cy="24" r="2" fill="#fff" />
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-2xs inline-block mr-1.5 shrink-0 overflow-hidden shadow-2xs">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,2.3h60M0,6.9h60M0,11.5h60M0,16.1h60M0,20.7h60M0,25.3h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
      <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.9" />
    </svg>
  ),
  ca: (
    <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-2xs inline-block mr-1.5 shrink-0 overflow-hidden shadow-2xs">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,7 L32,13 L38,12 L34,16 L37,21 L31,19 L30,23 L29,19 L23,21 L26,16 L22,12 L28,13 Z" fill="#D80027" />
    </svg>
  ),
  nz: (
    <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-2xs inline-block mr-1.5 shrink-0 overflow-hidden shadow-2xs">
      <rect width="60" height="30" fill="#00247D" />
      <circle cx="45" cy="7" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="50" cy="13" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="42" cy="18" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="47" cy="24" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
    </svg>
  ),
};

interface SearchSuggestion {
  type: "role" | "company" | "location";
  label: string;
  sublabel?: string;
  query: string;
  paramKey?: "q" | "company" | "country";
  paramValue?: string;
}

const PRESET_SUGGESTIONS: SearchSuggestion[] = [
  { type: "role", label: "Software Engineer", sublabel: "Full Stack, Backend, Cloud", query: "Software Engineer", paramKey: "q", paramValue: "Software Engineer" },
  { type: "role", label: "Civil & Structural Engineer", sublabel: "Infrastructure & Design", query: "Civil Engineer", paramKey: "q", paramValue: "Civil Engineer" },
  { type: "role", label: "Data Analyst", sublabel: "BI, Analytics & Machine Learning", query: "Data Analyst", paramKey: "q", paramValue: "Data Analyst" },
  { type: "role", label: "Registered Nurse", sublabel: "Healthcare & NHS", query: "Nurse", paramKey: "q", paramValue: "Nurse" },
  { type: "company", label: "Mace Group", sublabel: "Licensed Sponsor · 10+ Live Roles", query: "", paramKey: "company", paramValue: "Mace" },
  { type: "company", label: "Monzo Bank", sublabel: "Fintech Leader · 25+ Live Roles", query: "", paramKey: "company", paramValue: "Monzo Bank" },
  { type: "location", label: "United Kingdom", sublabel: "Skilled Worker Visa (CoS)", query: "", paramKey: "country", paramValue: "gb" },
  { type: "location", label: "Australia", sublabel: "TSS 482 & Core Skills", query: "", paramKey: "country", paramValue: "au" },
  { type: "location", label: "United States", sublabel: "H-1B & Specialty Occupation", query: "", paramKey: "country", paramValue: "us" },
  { type: "location", label: "Canada", sublabel: "Global Talent Stream / LMIA", query: "", paramKey: "country", paramValue: "ca" },
];

const POPULAR_TAGS = [
  { label: "Software Engineer", icon: <Code2 className="w-3.5 h-3.5 text-[#19CBE0]" />, type: "q", value: "Software Engineer" },
  { label: "Civil Engineer", icon: <HardHat className="w-3.5 h-3.5 text-amber-400" />, type: "q", value: "Civil Engineer" },
  { label: "Data Analyst", icon: <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />, type: "q", value: "Data Analyst" },
  { label: "UK Vacancies", flagKey: "gb", type: "country", value: "gb" },
  { label: "Australia Roles", flagKey: "au", type: "country", value: "au" },
  { label: "USA Jobs", flagKey: "us", type: "country", value: "us" },
];

interface JobSearchBarProps {
  initialQuery?: string;
  initialCountry?: string;
  variant?: "hero" | "compact";
  className?: string;
}

export const JobSearchBar: React.FC<JobSearchBarProps> = ({
  initialQuery = "",
  initialCountry = "ALL",
  variant = "compact",
  className = "",
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [experience, setExperience] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>(PRESET_SUGGESTIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCountry(initialCountry);
  }, [initialCountry]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredSuggestions(PRESET_SUGGESTIONS);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = PRESET_SUGGESTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        (s.sublabel && s.sublabel.toLowerCase().includes(q)) ||
        (s.paramValue && s.paramValue.toLowerCase().includes(q))
    );

    const customRole: SearchSuggestion = {
      type: "role",
      label: query.trim(),
      sublabel: `Search all opportunities matching "${query.trim()}"`,
      query: query.trim(),
      paramKey: "q",
      paramValue: query.trim(),
    };

    setFilteredSuggestions([customRole, ...matches.filter((m) => m.label.toLowerCase() !== q)]);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (s: SearchSuggestion) => {
    setIsOpen(false);
    const params = new URLSearchParams();
    if (s.paramKey === "country" && s.paramValue) {
      router.push(`/jobs/${s.paramValue}`);
      return;
    }
    if (s.paramKey === "company" && s.paramValue) {
      router.push(`/company/${s.paramValue.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
      return;
    }
    if (s.paramValue) params.set("q", s.paramValue);
    if (country && country !== "ALL") params.set("country", country);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country && country !== "ALL") params.set("country", country);
    if (experience && experience !== "all") params.set("experience", experience);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleTagClick = (tag: typeof POPULAR_TAGS[0]) => {
    if (tag.type === "country") {
      router.push(`/jobs/${tag.value}`);
    } else {
      const params = new URLSearchParams();
      params.set("q", tag.value);
      router.push(`/jobs?${params.toString()}`);
    }
  };

  if (variant === "hero") {
    return (
      <div ref={containerRef} className={`w-full max-w-4xl mx-auto relative ${className}`}>
        {/* Luminous Solid White Floating Search Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white text-slate-900 p-2 sm:p-2.5 rounded-2xl md:rounded-full shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-slate-200/90 ring-4 ring-white/10 flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-0 relative z-20"
        >
          {/* Field 1: Keyword */}
          <div className="flex-1 relative flex items-center px-4 py-3 md:py-2.5 rounded-xl md:rounded-full hover:bg-slate-50 transition-colors">
            <Search className="w-5 h-5 text-slate-700 shrink-0 mr-3" />
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Role or Keyword
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Software Engineer, Civil Engineer..."
                className="w-full bg-transparent text-slate-900 font-bold text-sm placeholder:text-slate-400 placeholder:font-normal focus:outline-none truncate"
              />
            </div>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer ml-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200 mx-1 shrink-0" />

          {/* Field 2: Destination */}
          <div className="relative flex items-center px-4 py-3 md:py-2.5 rounded-xl md:rounded-full hover:bg-slate-50 transition-colors md:w-[220px] shrink-0">
            <MapPin className="w-5 h-5 text-[#087F8C] shrink-0 mr-3" />
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Destination
              </label>
              <div className="relative flex items-center">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-sm focus:outline-none cursor-pointer pr-5 truncate appearance-none"
                >
                  <option value="ALL" className="bg-white text-slate-900 py-1">🌍 All Countries</option>
                  <option value="GB" className="bg-white text-slate-900 py-1">🇬🇧 United Kingdom</option>
                  <option value="US" className="bg-white text-slate-900 py-1">🇺🇸 United States</option>
                  <option value="AU" className="bg-white text-slate-900 py-1">🇦🇺 Australia</option>
                  <option value="CA" className="bg-white text-slate-900 py-1">🇨🇦 Canada</option>
                  <option value="NZ" className="bg-white text-slate-900 py-1">🇳🇿 New Zealand</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-0 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200 mx-1 shrink-0" />

          {/* Field 3: Experience */}
          <div className="relative flex items-center px-4 py-3 md:py-2.5 rounded-xl md:rounded-full hover:bg-slate-50 transition-colors md:w-[170px] shrink-0">
            <Briefcase className="w-5 h-5 text-indigo-600 shrink-0 mr-3" />
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Experience
              </label>
              <div className="relative flex items-center">
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-sm focus:outline-none cursor-pointer pr-5 truncate appearance-none"
                >
                  <option value="all" className="bg-white text-slate-900 py-1">Any Level</option>
                  <option value="entry" className="bg-white text-slate-900 py-1">Entry (0–2y)</option>
                  <option value="mid" className="bg-white text-slate-900 py-1">Mid (3–5y)</option>
                  <option value="senior" className="bg-white text-slate-900 py-1">Senior (5+y)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-0 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="mt-1 md:mt-0 px-8 py-3.5 md:py-3.5 rounded-xl md:rounded-full bg-[#071522] hover:bg-slate-900 text-white font-extrabold text-sm tracking-tight transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer group shrink-0"
          >
            <span>Search Jobs</span>
            <ArrowRight className="w-4 h-4 text-[#19CBE0] group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* High-Contrast Popular Search Tags */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 font-bold text-slate-300 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#19CBE0]" />
            <span>Popular:</span>
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 hover:border-[#19CBE0]/70 transition-all cursor-pointer backdrop-blur-md shadow-xs"
            >
              {tag.icon}
              {tag.flagKey && MiniFlags[tag.flagKey]}
              <span>{tag.label}</span>
            </button>
          ))}
        </div>

        {/* Smart Autocomplete Dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-left">
            <div className="p-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span>Suggested Searches</span>
              <span className="text-slate-400 font-normal">ESC to close</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {filteredSuggestions.map((s, idx) => (
                <button
                  key={`${s.label}-${idx}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      {s.type === "company" && <Building2 className="w-4 h-4 text-brand-600" />}
                      {s.type === "role" && <Briefcase className="w-4 h-4 text-indigo-600" />}
                      {s.type === "location" && <MapPin className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#071522] transition-colors">
                        {s.label}
                      </div>
                      {s.sublabel && (
                        <div className="text-[10px] text-slate-500 truncate">{s.sublabel}</div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#19CBE0] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact variant for secondary pages
  return (
    <form
      onSubmit={handleSearch}
      className={`flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs ${className}`}
    >
      <div className="flex-1 flex items-center px-3 gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, skills, companies..."
          className="w-full bg-transparent text-slate-900 text-xs font-bold focus:outline-none"
        />
      </div>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
      >
        <option value="ALL">All Countries</option>
        {INITIAL_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-[#071522] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};
