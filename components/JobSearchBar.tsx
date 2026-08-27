"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, MapPin, Sparkles, ArrowRight, X, Briefcase } from "lucide-react";
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
  { type: "company", label: "Stripe", sublabel: "Payments & Global Infrastructure", query: "", paramKey: "company", paramValue: "Stripe" },
  { type: "role", label: "Project Manager", sublabel: "Construction & Tech Roles", query: "Project Manager", paramKey: "q", paramValue: "Project Manager" },
  { type: "role", label: "Civil Engineer", sublabel: "Infrastructure & Site Engineering", query: "Civil Engineer", paramKey: "q", paramValue: "Civil Engineer" },
  { type: "role", label: "Software Engineer", sublabel: "Full Stack, Backend & Frontend", query: "Software Engineer", paramKey: "q", paramValue: "Software Engineer" },
  { type: "role", label: "Design Manager", sublabel: "Technical Services & Architecture", query: "Design Manager", paramKey: "q", paramValue: "Design Manager" },
  { type: "role", label: "Data Analyst", sublabel: "Analytics, BI & Machine Learning", query: "Data Analyst", paramKey: "q", paramValue: "Data Analyst" },
  { type: "role", label: "Registered Nurse", sublabel: "Healthcare & NHS Sponsorship", query: "Nurse", paramKey: "q", paramValue: "Nurse" },
  { type: "location", label: "United Kingdom", sublabel: "Skilled Worker Visa (CoS)", query: "", paramKey: "country", paramValue: "gb" },
  { type: "location", label: "United States", sublabel: "H-1B & Tech Sponsorship", query: "", paramKey: "country", paramValue: "us" },
  { type: "location", label: "Australia", sublabel: "TSS 482 & Skilled Visas", query: "", paramKey: "country", paramValue: "au" },
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

    // If query is custom, also add as a direct role suggestion at top
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
    if (s.paramKey === "company" && s.paramValue) {
      params.set("company", s.paramValue);
    } else if (s.paramKey === "country" && s.paramValue) {
      params.set("country", s.paramValue);
    } else if (s.paramValue) {
      params.set("q", s.paramValue);
    }
    if (country && country !== "ALL" && s.paramKey !== "country") {
      params.set("country", country);
    }
    router.push(`/jobs?${params.toString()}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country && country !== "ALL") params.set("country", country);
    router.push(`/jobs?${params.toString()}`);
  };

  if (variant === "hero") {
    return (
      <div ref={containerRef} className={`w-full relative ${className}`}>
        <form
          onSubmit={handleFormSubmit}
          className="w-full p-2 sm:p-2.5 bg-slate-800/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-slate-700/80 flex flex-col md:flex-row gap-2 text-left relative z-30"
        >
          <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-700/70 py-3 md:py-0">
            <Search className="w-5 h-5 text-brand-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Job title, skill, or company (e.g. Civil Engineer, Mace, React)"
              className="w-full outline-none text-white placeholder:text-slate-400 text-sm bg-transparent font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center px-4 gap-3 py-3 md:py-0 md:w-56">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full outline-none text-slate-200 bg-transparent text-sm font-medium cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Countries (5)</option>
              {INITIAL_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()} className="bg-slate-900 text-white">
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white rounded-xl sm:rounded-2xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Search Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-40 text-left divide-y divide-slate-800 animate-fadeInDown">
            <div className="p-3 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 px-4 font-semibold">
              <span className="flex items-center gap-1.5 text-brand-400">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Search Suggestions
              </span>
              <span>Press Enter to search</span>
            </div>

            <div className="max-h-72 overflow-y-auto py-1.5">
              {filteredSuggestions.slice(0, 8).map((s, idx) => (
                <button
                  key={`${s.label}-${idx}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full px-4 py-2.5 hover:bg-brand-600/20 text-left flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      {s.type === "company" ? (
                        <Building2 className="w-4 h-4 text-amber-400 group-hover:text-white" />
                      ) : s.type === "location" ? (
                        <MapPin className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-sky-400 group-hover:text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-300 truncate">
                        {s.label}
                      </div>
                      {s.sublabel && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {s.sublabel}
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact Variant (Jobs Page & Headers)
  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Role, skill, or company (e.g. Civil Engineer, Mace, Monzo)..."
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 shadow-2xs text-slate-800"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0 touch-manipulation flex items-center gap-1.5"
        >
          <span>Search</span>
        </button>
      </form>

      {/* Live Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40 text-left divide-y divide-slate-100 animate-fadeInDown">
          <div className="p-2.5 bg-slate-50 flex items-center justify-between text-xs text-slate-500 px-3.5 font-semibold">
            <span className="flex items-center gap-1.5 text-brand-600">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Suggestions
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filteredSuggestions.slice(0, 7).map((s, idx) => (
              <button
                key={`${s.label}-${idx}`}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full px-3.5 py-2.5 hover:bg-slate-50 text-left flex items-center justify-between gap-3 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-brand-50 transition-colors">
                    {s.type === "company" ? (
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    ) : s.type === "location" ? (
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-brand-600 truncate">
                      {s.label}
                    </div>
                    {s.sublabel && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {s.sublabel}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
