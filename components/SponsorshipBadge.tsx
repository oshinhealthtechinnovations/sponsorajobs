import React from "react";
import { SponsorshipLabel } from "@/lib/types/database";
import { ShieldCheck, CheckCircle2, HelpCircle, AlertTriangle, XCircle } from "lucide-react";

interface SponsorshipBadgeProps {
  label: SponsorshipLabel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const SponsorshipBadge: React.FC<SponsorshipBadgeProps> = ({
  label,
  size = "md",
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs font-semibold px-2.5 py-1 gap-1.5",
    lg: "text-sm font-semibold px-3 py-1.5 gap-2",
  };

  switch (label) {
    case "Strong":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${sizeClasses[size]}`}
          title="Strong visa sponsorship evidence detected"
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          <span>Sponsorship: Strong</span>
        </span>
      );

    case "Likely":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 ${sizeClasses[size]}`}
          title="Likely visa support based on job description"
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
          <span>Sponsorship: Likely</span>
        </span>
      );

    case "Possible":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses[size]}`}
          title="Sponsorship may be considered; confirm directly with employer"
        >
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Sponsorship: Possible</span>
        </span>
      );

    case "Explicitly Not Offered":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 ${sizeClasses[size]}`}
          title="Work authorization or existing right to work required"
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span>Right to Work Required</span>
        </span>
      );

    case "REVIEW_REQUIRED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 ${sizeClasses[size]}`}
          title="Conflicting signals found in job listing; manual review recommended"
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
          <span>Review Required</span>
        </span>
      );

    case "Weak":
    case "No Sponsorship Signal":
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}
          title="Direct employer listing"
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span>Direct Employer</span>
        </span>
      );
  }
};
