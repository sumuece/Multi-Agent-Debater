/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        surface: {
          0: "#070709",
          1: "#0b0c0f",
          2: "#12131a",
          3: "#1a1b24",
          top: "#101119",
        },
        line: "rgba(255, 255, 255, 0.06)",
        "line-strong": "rgba(255, 255, 255, 0.1)",
        accent: {
          DEFAULT: "#a855f7",
          hover: "#c084fc",
          dim: "#7c3aed",
          glow: "rgba(168, 85, 247, 0.12)",
        },
        brand: {
          from: "#7c3aed",
          via: "#a855f7",
          to: "#e879f9",
        },
        muted: "#94a3b8",
      },
      boxShadow: {
        panel:
          "0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px -16px rgba(0, 0, 0, 0.65), 0 0 80px -20px rgba(124, 58, 237, 0.15)",
        lift: "0 8px 32px rgba(0, 0, 0, 0.45)",
        glow: "0 0 40px -8px rgba(168, 85, 247, 0.35)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "mesh-auth":
          "radial-gradient(ellipse 90% 60% at 20% 0%, rgba(124, 58, 237, 0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, rgba(232, 121, 249, 0.18), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(56, 189, 248, 0.08), transparent 45%)",
        "mesh-app":
          "radial-gradient(ellipse 80% 45% at 50% -15%, rgba(124, 58, 237, 0.2), transparent 55%), radial-gradient(ellipse 55% 35% at 100% 10%, rgba(232, 121, 249, 0.1), transparent 50%), radial-gradient(ellipse 45% 30% at 0% 40%, rgba(34, 211, 238, 0.06), transparent 50%)",
        "btn-brand": "linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #e879f9 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        shimmer: "shimmer 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};
