"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Crown, Sparkles, MapPin, Banknote, ShieldCheck, ArrowRight } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { PublicJobDTO } from "@/lib/types/job";

interface VIPVerifiedSponsorsHeaderProps {
  topJobs?: PublicJobDTO[];
}

export function VIPVerifiedSponsorsHeader({ topJobs = [] }: VIPVerifiedSponsorsHeaderProps) {
  const { isPro, isLoggedIn } = useSession();

  const handleVIPClick = (e: React.MouseEvent, jobTitle: string) => {
    if (!isPro) {
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent("open-pro-gate", {
          detail: {
            featureName: `VIP Verified Sponsor Job (${jobTitle})`,
          },
        })
      );
    }
  };

  const sampleVIPJobs = topJobs.length >= 4 ? topJobs.slice(0, 4) : [
    {
      id: "vip_sample_1",
      title: "Senior Civil / Structural Engineer",
      company: { name: "WSP Global" },
      location: { formatted: "London, UK", country: "GB" },
      salary: { min: 65000, max: 85000, currency: "GBP" },
      slug: "senior-civil-structural-engineer-wsp",
    },
    {
      id: "vip_sample_2",
      title: "Staff Nurse / Clinical Specialist (Band 6)",
      company: { name: "NHS Foundation Trust" },
      location: { formatted: "Manchester, UK", country: "GB" },
      salary: { min: 38000, max: 46000, currency: "GBP" },
      slug: "staff-nurse-nhs-trust",
    },
    {
      id: "vip_sample_3",
      title: "Full Stack Software Engineer (Cloud / API)",
      company: { name: "Bloomberg LP" },
      location: { formatted: "London, UK", country: "GB" },
      salary: { min: 95000, max: 130000, currency: "GBP" },
      slug: "full-stack-engineer-bloomberg",
    },
    {
      id: "vip_sample_4",
      title: "Infrastructure & Site Project Manager",
      company: { name: "BAM UK & Ireland" },
      location: { formatted: "Birmingham, UK", country: "GB" },
      salary: { min: 70000, max: 90000, currency: "GBP" },
      slug: "site-project-manager-bam",
    },
  ];

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-cyan-500/10 border border-amber-300/60 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-600 shrink-0">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-display flex items-center gap-1.5">
                <span>VIP Verified Sponsor Jobs</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  NEW
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              High-priority Tier 2 / Skilled Worker licensed employer vacancies
            </p>
          </div>
        </div>

        {!isPro && (
          <button
            type="button"
            onClick={(e) => handleVIPClick(e, "VIP Feed")}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Unlock VIP Feed</span>
          </button>
        )}
      </div>

      {/* 4-Card Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sampleVIPJobs.map((j: any) => (
          <div
            key={j.id}
            onClick={(e) => handleVIPClick(e, j.title)}
            className={`p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-xs flex flex-col justify-between transition-all ${
              !isPro ? "cursor-pointer hover:border-amber-400 hover:shadow-md" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>VERIFIED SPONSOR</span>
                </span>
                {!isPro && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5" />
                    <span>VIP</span>
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                {j.title}
              </h4>

              <div className="mt-2 space-y-1">
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <span className="font-semibold">Employer:</span>
                  {!isPro ? (
                    <span className="blur-[3.5px] select-none font-bold text-slate-800">
                      Tier 2 Licensed Employer
                    </span>
                  ) : (
                    <span className="font-bold text-slate-800">{j.company?.name || "Verified Sponsor"}</span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{j.location?.formatted || j.location?.country || "UK"}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">
                {!isPro ? (
                  <span className="blur-[3px] select-none text-emerald-700 font-bold">
                    £55,000 - £75,000
                  </span>
                ) : j.salary ? (
                  `${j.salary.currency || "£"} ${j.salary.min?.toLocaleString()} - ${j.salary.max?.toLocaleString()}`
                ) : (
                  "Competitive"
                )}
              </span>

              {!isPro ? (
                <span className="text-[10px] font-extrabold text-amber-700 inline-flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Unlock</span>
                </span>
              ) : (
                <Link
                  href={`/job/${j.slug}`}
                  className="text-[10px] font-extrabold text-brand-600 hover:text-brand-800"
                >
                  View Role &rarr;
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
