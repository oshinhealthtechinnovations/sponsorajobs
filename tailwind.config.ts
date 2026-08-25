import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        sponsor: {
          strong:   "#10b981",
          likely:   "#06b6d4",
          possible: "#f59e0b",
          weak:     "#9ca3af",
          none:     "#64748b",
          negative: "#ef4444",
        },
      },
      backgroundImage: {
        "brand-gradient":      "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #075985 100%)",
        "hero-gradient":       "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(14,165,233,0.18) 0%, transparent 70%), #f8fafc",
        "shimmer-gradient":    "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%)",
        "dark-gradient":       "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        "card-hover-gradient": "linear-gradient(135deg, rgba(14,165,233,0.05), rgba(99,102,241,0.05))",
      },
      boxShadow: {
        "brand":    "0 20px 60px -10px rgba(2,132,199,0.25)",
        "brand-sm": "0 4px 20px -4px rgba(2,132,199,0.2)",
        "card":     "0 4px 24px -4px rgba(15,23,42,0.08)",
        "card-hover": "0 12px 40px -8px rgba(2,132,199,0.18), 0 4px 16px -4px rgba(0,0,0,0.08)",
        "glass":    "0 8px 32px -4px rgba(15,23,42,0.12)",
        "glow":     "0 0 20px rgba(2,132,199,0.4)",
        "2xs":      "0 1px 2px rgba(0,0,0,0.05)",
      },
      animation: {
        "fade-in-up":   "fadeInUp 0.6s ease-out both",
        "fade-in-down": "fadeInDown 0.5s ease-out both",
        "slide-in-right": "slideInRight 0.5s ease-out both",
        "float":        "float 4s ease-in-out infinite",
        "pulse-glow":   "pulseGlow 2s ease-in-out infinite",
        "shimmer":      "shimmer 1.4s ease infinite",
        "scale-in":     "scaleIn 0.4s ease-out both",
        "live-blip":    "liveBlip 1.5s ease-in-out infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(2,132,199,0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(2,132,199,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        liveBlip: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.6" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
