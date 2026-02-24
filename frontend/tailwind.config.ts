import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — mirrors the Streamlit dark theme
        bg: {
          base:  "#0b0f1a",
          card:  "#0e1220",
          muted: "#111827",
        },
        accent: {
          blue:  "#0066ff",
          cyan:  "#00e0ff",
          green: "#0bd97a",
        },
        txt: {
          primary: "#e6eef8",
          muted:   "#87a6c9",
          soft:    "#b9d6ff",
        },
        border: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:   "0 6px 30px rgba(2,78,172,0.12)",
        glow:   "0 0 20px rgba(0,102,255,0.25)",
        "glow-green": "0 0 16px rgba(11,217,122,0.2)",
      },
      backgroundImage: {
        "gradient-banner":
          "linear-gradient(90deg, rgba(7,16,33,1) 0%, rgba(7,16,33,0.9) 50%, rgba(2,78,172,0.18) 100%)",
        "gradient-card":
          "linear-gradient(180deg, rgba(14,18,28,0.85), rgba(7,12,20,0.8))",
        "gradient-score":
          "linear-gradient(90deg, #00e0ff, #0066ff)",
        "gradient-salary":
          "linear-gradient(90deg, #0bd97a, #047a52)",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
