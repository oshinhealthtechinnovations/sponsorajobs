"use client";

import React, { useEffect, useState } from "react";
import { CountryIntelligenceProfile } from "@/lib/services/countryIntelligenceService";
import { Globe, MapPin, Users, Clock, Compass, ShieldCheck } from "lucide-react";

interface CountryRelocationCardProps {
  countryCode: string;
}

export const CountryRelocationCard: React.FC<CountryRelocationCardProps> = ({ countryCode }) => {
  const [profile, setProfile] = useState<CountryIntelligenceProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCountry() {
      try {
        const res = await fetch(`/api/tools/country-info?country=${countryCode}`);
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          setProfile(data.data);
        }
      } catch {
        // graceful
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCountry();
    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-5 animate-pulse space-y-3">
        <div className="h-4 bg-slate-100 rounded-md w-1/3" />
        <div className="h-10 bg-slate-100 rounded-md w-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{profile.flagEmoji}</span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 leading-none">
              {profile.name} Relocation Overview
            </h3>
            <span className="text-[11px] text-slate-500">{profile.officialName}</span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          {profile.region}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            Capital
          </div>
          <div className="font-extrabold text-slate-800 mt-0.5">{profile.capital}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            Population
          </div>
          <div className="font-extrabold text-slate-800 mt-0.5">{profile.formattedPopulation}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            Language(s)
          </div>
          <div className="font-extrabold text-slate-800 mt-0.5">{profile.languages.join(", ")}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Processing Time
          </div>
          <div className="font-extrabold text-slate-800 mt-0.5">{profile.visaHighlights.processingTime}</div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Visa Pathway: {profile.visaHighlights.workPermitType}</span>
        </div>
        <div className="text-[11px] text-emerald-700 leading-relaxed">
          <strong>Settlement / PR:</strong> {profile.visaHighlights.prPathway}
        </div>
      </div>
    </div>
  );
};
