"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { Filter, RotateCcw, Calendar, Banknote, MapPin, Briefcase, Building2 } from "lucide-react";

const FEATURED_SPONSORS = [
  { id: "comp_costain_group", name: "Costain Group", tag: "UK Smart Infrastructure & Water (157+)" },
  { id: "comp_kier_group", name: "Kier Group", tag: "UK Infrastructure & Civil (240+)" },
  { id: "comp_laing_orourke", name: "Laing O'Rourke", tag: "UK Major Infrastructure & Civil (256+)" },
  { id: "comp_morgan_sindall", name: "Morgan Sindall", tag: "UK Infrastructure & Construction (165+)" },
  { id: "comp_skanska_uk", name: "Skanska UK", tag: "UK Civil & Infrastructure (100+)" },
  { id: "comp_balfour_beatty", name: "Balfour Beatty", tag: "UK Infrastructure & Engineering (64+)" },
  { id: "comp_mace_group", name: "Mace", tag: "UK Construction & Consultancy (50+)" },
  { id: "comp_wsp", name: "WSP", tag: "Global Engineering & Infrastructure (870+)" },
  { id: "comp_jacobs", name: "Jacobs", tag: "Global Engineering" },
  { id: "comp_monzo_bank", name: "Monzo Bank", tag: "Fintech" },
  { id: "comp_stripe", name: "Stripe", tag: "Payments" },
  { id: "comp_figma", name: "Figma", tag: "Design Tech" },
  { id: "comp_gitlab", name: "GitLab", tag: "DevOps" },
  { id: "comp_wise", name: "Wise", tag: "Global Transfer" },
  { id: "comp_notion", name: "Notion", tag: "Productivity" },
  { id: "comp_linear", name: "Linear", tag: "Software" },
  { id: "comp_spotify", name: "Spotify", tag: "Media Tech" },
  { id: "comp_revolut", name: "Revolut", tag: "Banking" },
  { id: "comp_deliveroo", name: "Deliveroo", tag: "Tech Platform" },
  { id: "comp_canva", name: "Canva", tag: "Design" },
];

export const JobFilterSidebar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const country = searchParams.get("country") || "ALL";
  const company = searchParams.get("company") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const remoteType = searchParams.get("remoteType") || "";
  const employmentType = searchParams.get("employmentType") || "";
  const sponsorship = searchParams.get("sponsorship") || "";
  const minSalary = searchParams.get("minSalary") || "";
  const maxSalary = searchParams.get("maxSalary") || "";
  const datePosted = searchParams.get("datePosted") || "all";
  const sort = searchParams.get("sort") || "newest";

  const [cityInput, setCityInput] = useState(city);
  const [companyInput, setCompanyInput] = useState(company);
  const [minSalaryInput, setMinSalaryInput] = useState(minSalary);
  const [maxSalaryInput, setMaxSalaryInput] = useState(maxSalary);
  const [allCompanies, setAllCompanies] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAllCompanies(data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCityInput(city);
    setCompanyInput(company);
    setMinSalaryInput(minSalary);
    setMaxSalaryInput(maxSalary);
  }, [city, company, minSalary, maxSalary]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value && value !== "ALL" && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    router.push(`/jobs?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/jobs");
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ city: cityInput.trim() });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ company: companyInput.trim() });
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ minSalary: minSalaryInput.trim(), maxSalary: maxSalaryInput.trim() });
  };

  return (
    <aside className="w-full bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Advanced Search</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Filter by Employer / Company */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Select Company</span>
          </span>
          {company && (
            <button
              type="button"
              onClick={() => updateFilters({ company: null })}
              className="text-[11px] font-semibold text-rose-500 hover:underline"
            >
              Clear
            </button>
          )}
        </label>
        
        <select
          value={company}
          onChange={(e) => updateFilters({ company: e.target.value })}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all cursor-pointer mb-2"
        >
          <option value="">All Companies ({allCompanies.length > 0 ? `${allCompanies.length}+` : "472+"})</option>
          <optgroup label="🌟 Featured Verified Sponsors">
            {FEATURED_SPONSORS.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.tag})
              </option>
            ))}
          </optgroup>
          {allCompanies.length > 0 && (
            <optgroup label="All Verified Employers A-Z">
              {allCompanies
                .filter((c) => !FEATURED_SPONSORS.some((f) => f.name.toLowerCase() === c.name.toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          )}
        </select>

        <form onSubmit={handleCompanySubmit} className="flex gap-1.5">
          <input
            type="text"
            placeholder="Or type company name..."
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold"
          >
            Go
          </button>
        </form>
      </div>

      {/* Target Country */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Target Country
        </label>
        <select
          value={country}
          onChange={(e) => updateFilters({ country: e.target.value })}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all cursor-pointer"
        >
          <option value="ALL">All Target Countries (5)</option>
          {INITIAL_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code.toLowerCase()}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sponsorship Signal Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Sponsorship Signal
        </label>
        <div className="space-y-1.5">
          {[
            { label: "All Levels", value: "" },
            { label: "Strong Signal", value: "strong" },
            { label: "Likely", value: "likely" },
            { label: "Possible", value: "possible" },
            { label: "Explicitly Not Offered", value: "explicitly not offered" },
          ].map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-brand-600"
            >
              <input
                type="radio"
                name="sponsorship"
                value={item.value}
                checked={sponsorship === item.value}
                onChange={(e) => updateFilters({ sponsorship: e.target.value })}
                className="text-brand-600 focus:ring-brand-500 rounded-sm"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Freshness (Section 128) */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Date Posted</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "Anytime", value: "all" },
            { label: "Past 24h", value: "24h" },
            { label: "Past 7 days", value: "7d" },
            { label: "Past 30 days", value: "30d" },
          ].map((item) => {
            const isSelected = datePosted === item.value || (item.value === "all" && !datePosted);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => updateFilters({ datePosted: item.value })}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors text-center ${
                  isSelected
                    ? "bg-brand-50 border-brand-500 text-brand-700 font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hierarchical Categories */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all cursor-pointer"
        >
          <option value="">All Categories</option>
          {INITIAL_CATEGORIES.map((cat) => (
            <optgroup key={cat.id} label={cat.name}>
              <option value={cat.slug}>All {cat.name}</option>
              {cat.subcategories?.map((sub) => (
                <option key={sub.id} value={sub.slug}>
                  └ {sub.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* City / Location Search */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>City / Location</span>
        </label>
        <form onSubmit={handleCitySubmit} className="flex gap-1.5">
          <input
            type="text"
            placeholder="e.g. Sydney, London"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Salary Range Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-slate-400" />
          <span>Annual Salary</span>
        </label>
        <form onSubmit={handleSalarySubmit} className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <input
              type="number"
              placeholder="Min"
              value={minSalaryInput}
              onChange={(e) => setMinSalaryInput(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none text-xs"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxSalaryInput}
              onChange={(e) => setMaxSalaryInput(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Filter Salary
          </button>
        </form>
      </div>

      {/* Workplace Type */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Workplace Type
        </label>
        <select
          value={remoteType}
          onChange={(e) => updateFilters({ remoteType: e.target.value })}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all cursor-pointer"
        >
          <option value="">Any Workplace</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">On-site</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Sort Results By
        </label>
        <select
          value={sort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="sponsorship">Sponsorship Confidence</option>
          <option value="salary">Highest Salary</option>
          <option value="relevance">Relevance</option>
        </select>
      </div>
    </aside>
  );
};
