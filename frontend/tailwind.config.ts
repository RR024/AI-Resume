import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void:    "#02020a",
        surface: "rgba(255,255,255,0.03)",
        border:  "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      animation: {
        aurora:     "aurora 12s ease infinite",
        float:      "float 6s ease-in-out infinite",
        shimmer:    "shimmer 2.4s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        spin3d:     "spin3d 1.2s linear infinite",
        "count-up": "countUp 0.6s ease-out forwards",
        blob:       "blob 8s ease-in-out infinite",
      },
      keyframes: {
        aurora: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%":     { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.6" },
          "50%":     { opacity: "1" },
        },
        spin3d: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        blob: {
          "0%,100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", transform: "rotate(0deg) scale(1)" },
          "33%":     { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%", transform: "rotate(120deg) scale(1.05)" },
          "66%":     { borderRadius: "40% 60% 40% 60% / 30% 40% 60% 50%", transform: "rotate(240deg) scale(0.97)" },
        },
      },
      backdropBlur: {
        "4xl": "72px",
      },
    },
  },
  plugins: [],
};

export default config;
