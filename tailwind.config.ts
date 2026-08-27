import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wisdom: {
          // Channel form enables bg-wisdom-dark/80 etc. with CSS vars
          dark: "rgb(var(--wt-dark-rgb) / <alpha-value>)",
          navy: "rgb(var(--wt-navy-rgb) / <alpha-value>)",
          card: "rgb(var(--wt-card-rgb) / <alpha-value>)",
          cyan: "#00d4ff",
          "cyan-dark": "#00b4d8",
          muted: "rgb(var(--wt-muted-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "card-3d": "0 12px 40px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
        "card-3d-hover":
          "0 28px 60px -16px rgba(0, 212, 255, 0.22), 0 12px 32px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.25)",
        glow: "0 0 40px -8px rgba(0, 212, 255, 0.45)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
