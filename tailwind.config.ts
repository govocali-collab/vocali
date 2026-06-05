import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FEFDFB",
          100: "#FAF7F2",
          200: "#F5EFE6",
          300: "#EDE3D4",
          400: "#E1D2BC",
        },
        gold: {
          50: "#FDF9EE",
          100: "#F8EDD4",
          200: "#F0D9A0",
          300: "#E4C060",
          400: "#D4A840",
          500: "#C9A864",
          600: "#A88840",
          700: "#7D6430",
          800: "#5C4820",
          900: "#3D3018",
        },
        charcoal: {
          50: "#F7F7F8",
          100: "#EDEDEE",
          200: "#D4D4D6",
          300: "#B0B0B3",
          400: "#8C8C90",
          500: "#6C6C70",
          600: "#4C4C50",
          700: "#3C3C3E",
          800: "#2C2C2E",
          900: "#1C1C1E",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A864 0%, #A88840 50%, #8A6E2F 100%)",
        "gold-soft": "linear-gradient(135deg, #F8EDD4 0%, #F0D9A0 100%)",
        "hero-gradient": "radial-gradient(ellipse at 70% 40%, rgba(201,168,100,0.10) 0%, transparent 65%), linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 100%)",
        "dark-warm": "linear-gradient(160deg, #1C1C1E 0%, #2A2218 100%)",
      },
      boxShadow: {
        gold: "0 8px 40px rgba(201, 168, 100, 0.25)",
        "gold-lg": "0 16px 60px rgba(201, 168, 100, 0.35)",
        card: "0 4px 32px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 12px 48px rgba(0, 0, 0, 0.10)",
        luxury: "0 20px 80px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "pulse-ring": "pulseRing 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.15)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}

export default config
