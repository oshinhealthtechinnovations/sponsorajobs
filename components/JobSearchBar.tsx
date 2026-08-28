"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, MapPin, Sparkles, ArrowRight, X, Briefcase, UserCheck } from "lucide-react";
import { INITIAL_COUNTRIES } from "@/config/countries";

interface SearchSuggestion {
  type: "role" | "company" | "location";
  label: string;
  sublabel?: string;
  query: string;
  paramKey?: "q" | "company" | "country";
  paramValue?: string;
}

const PRESET_SUGGESTIONS: SearchSuggestion[] = [
  { type: "company", label: "Mace", sublabel: "UK Licensed Sponsor (10 Verified Jobs)", query: "", paramKey: "company", paramValue: "Mace" },
  { type: "company", label: "Monzo Bank", sublabel: "Fintech Leader (25+ Jobs)", query: "", paramKey: "company", paramValue: "Monzo Bank" },
  { type: "company", label: "Google", sublabel: "Tier-1 Global Sponsor", query: "", paramKey: "company", paramValue: "Google" },
  { type: "role", label: "Civil Engineer", sublabel: "Infrastructure & Structural Engineering", query: "Civil Engineer", paramKey: "q", paramValue: "Civil Engineer" },
  { type: "role", label: "Software Engineer", sublabel: "Full Stack, Backend & Cloud", query: "Software Engineer", paramKey: "q", paramValue: "Software Engineer" },
  { type: "role", label: "Registered Nurse", sublabel: "Healthcare & NHS Sponsorship", query: "Nurse", paramKey: "q", paramValue: "Nurse" },
  { type: "role", label: "Data Analyst", sublabel: "BI, Analytics & Machine Learning", query: "Data Analyst", paramKey: "q", paramValue: "Data Analyst" },
  { type: "location", label: "United Kingdom", sublabel: "Skilled Worker Visa (CoS)", query: "", paramKey: "country", paramValue: "gb" },
  { type: "location", label: "United States", sublabel: "H-1B & Tech Sponsorship", query: "", paramKey: "country", paramValue: "us" },
  { type: "location", label: "Australia", sublabel: "TSS 482 & Skilled Visas", query: "", paramKey: "country", paramValue: "au" },
  { type: "location", label: "Canada", sublabel: "Global Talent Stream / LMIA", query: "", paramKey: "country", paramValue: "ca" },
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

  if (variant === "hero") {
    return (
      <div ref={containerRef} className={`w-full max-w-4xl mx-auto relative ${className}`}>
        {/* Floating Search Container */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] border border-slate-200/90 flex flex-col md:flex-row items-stretch gap-2"
        >
          {/* Field 1: What do you do? */}
          <div className="flex-1 relative flex items-center px-4 py-2 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                What do you do?
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Software Engineer, Civil Engineer, Mace..."
                className="w-full bg-transparent text-slate-900 font-bold text-xs sm:text-sm placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
              />
            </div>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden md:block w-px bg-slate-200 my-2" />

          {/* Field 2: Where do you want to go? */}
          <div className="relative flex items-center px-4 py-2 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none min-w-[200px]">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Where do you want to go?
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-xs sm:text-sm focus:outline-none cursor-pointer"
              >
                <option value="ALL">🌍 All Destination Markets</option>
                {INITIAL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:block w-px bg-slate-200 my-2" />

          {/* Field 3: Experience */}
          <div className="relative flex items-center px-4 py-2 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none min-w-[160px]">
            <UserCheck className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <div className="flex-1 min-w-0 text-left">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-xs sm:text-sm focus:outline-none cursor-pointer"
              >
                <option value="all">All Experience Levels</option>
                <option value="junior">1 – 2 Years</option>
                <option value="mid">3 – 5 Years</option>
                <option value="senior">5+ Years (Lead)</option>
              </select>
            </div>
          </div>

          {/* Primary Search CTA */}
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl sm:rounded-2xl bg-[#071421] hover:bg-[#0D1B2A] text-white font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer group shrink-0"
          >
            <span>Find Jobs I Can Actually Apply For</span>
            <ArrowRight className="w-4 h-4 text-[#18D6E5] group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Smart Autocomplete Dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in-50 text-left">
            <div className="p-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span>Sponsorship Intelligence Suggestions</span>
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
                    <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      {s.type === "company" && <Building2 className="w-3.5 h-3.5 text-brand-600" />}
                      {s.type === "role" && <Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
                      {s.type === "location" && <MapPin className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {s.label}
                      </div>
                      {s.sublabel && (
                        <div className="text-[10px] text-slate-500 truncate">{s.sublabel}</div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
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
          className="w-full bg-transparent text-slate-900 text-xs font-semibold focus:outline-none"
        />
      </div>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
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
        className="px-4 py-2 bg-[#071421] hover:bg-[#0D1B2A] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};
