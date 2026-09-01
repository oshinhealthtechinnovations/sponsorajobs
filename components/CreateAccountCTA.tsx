"use client";
import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * Small client-only button that opens the AuthGateModal.
 * Extracted so the parent (app/page.tsx) can remain a Server Component.
 */
export function CreateAccountCTA() {
  return (
    <div className="text-center mt-8">
      <button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("open-auth-gate", {
              detail: { defaultTab: "register" },
            })
          )
        }
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#071522] hover:bg-slate-800 text-white font-extrabold text-sm shadow-lg transition-all cursor-pointer"
      >
        <span>Create Your Free Account</span>
        <ArrowRight className="w-4 h-4 text-[#19CBE0]" />
      </button>
      <p className="text-xs text-slate-400 mt-3">
        Takes 60 seconds · No credit card · Cancel anytime
      </p>
    </div>
  );
}
