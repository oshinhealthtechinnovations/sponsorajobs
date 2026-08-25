"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-400">Critical Application Error</h2>
          <p className="text-xs text-slate-400">
            A critical system error occurred. Please refresh the page or try again in a few moments.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
