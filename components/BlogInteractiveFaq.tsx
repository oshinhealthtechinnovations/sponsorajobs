"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface BlogInteractiveFaqProps {
  faqs: FaqItem[];
}

export function BlogInteractiveFaq({ faqs }: BlogInteractiveFaqProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const toggleFaq = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-4">
        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500">Official statutory rules & candidate guidelines</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.has(idx);
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen ? "bg-slate-50/80 border-brand-200" : "bg-slate-50/40 border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 cursor-pointer select-none"
              >
                <span className="flex items-center gap-2">
                  <span className="text-brand-600 font-black">Q{idx + 1}.</span>
                  <span>{faq.question}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 animate-fadeIn">
                  <div className="pl-6">{faq.answer}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
