import React from "react";
import Link from "next/link";
import { SearchX, ArrowRight, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  query?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ query }) => {
  return (
    <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs max-w-2xl mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">No matching jobs found</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        We couldn&apos;t find any active listings matching {query ? `"${query}"` : "your current filter criteria"}.
      </p>

      {/* Actionable suggestions per Section 73 */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left mb-6 space-y-2">
        <p className="font-semibold text-slate-800">Suggestions:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li>Try selecting another target country (UK, USA, Australia, Canada, NZ)</li>
          <li>Use broader keywords (e.g. &ldquo;Engineer&rdquo; instead of &ldquo;Senior Staff Subsea Engineer&rdquo;)</li>
          <li>Clear specific workplace or sponsorship filters to see all available roles</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </Link>
        <Link
          href="/countries"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
        >
          <span>Browse By Country</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
