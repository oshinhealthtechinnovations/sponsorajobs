"use client";

import React, { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { JobFilterSidebar } from "./JobFilterSidebar";

interface MobileFilterDrawerProps {
  activeFilterCount?: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({ activeFilterCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-2xs hover:bg-slate-50 transition-colors touch-manipulation relative"
      >
        <SlidersHorizontal className="w-4 h-4 text-brand-600" />
        <span>Filters & Sort</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-black">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Bottom Sheet Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "88vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            Filters & Sort
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors touch-manipulation"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pb-4" style={{ maxHeight: "calc(88vh - 140px)" }}>
          <div className="px-4 pt-2 pb-2">
            {/* Override sidebar to remove border/shadow for drawer look */}
            <style>{`
              .mobile-filter-wrapper aside {
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
              }
            `}</style>
            <div className="mobile-filter-wrapper">
              <JobFilterSidebar />
            </div>
          </div>
        </div>

        {/* Drawer Bottom Action */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-2xl text-sm shadow-md transition-colors touch-manipulation cursor-pointer"
          >
            Apply & View Results
          </button>
        </div>
      </div>
    </>
  );
};
