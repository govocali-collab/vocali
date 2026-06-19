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
          50: "#100E17",
          100: "#14111D",
          200: "#1D1929",
          300: "#2A2438",
          400: "#3A3350",
        },
        gold: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6B21A8",
          800: "#581C87",
          900: "#3B0764",
        },
        ink: {
          DEFAULT: "#100E17",
          card: "#1D1929",
          sidebar: "#14111D",
          hover: "#272034",
        },
        "dash-gold": "#A78BFA",
        "dash-green": "#6ed4a4",
        charcoal: {
          50: "#1C1C1E",
          100: "#2A2A30",
          200: "#44444C",
          300: "#6C6C75",
          400: "#9A9AA4",
          500: "#A1A1AA",
          600: "#C4C4CA",
          700: "#E2E2E6",
          800: "#F0F0F2",
          900: "#FAFAFA",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6B21A8 100%)",
        "gold-soft": "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
        "hero-gradient": "radial-gradient(ellipse at 70% 40%, rgba(139,92,246,0.18) 0%, transparent 60%), linear-gradient(180deg, #14111D 0%, #100E17 100%)",
        "dark-warm": "linear-gradient(160deg, #1C1C1E 0%, #221A2E 100%)",
      },
      boxShadow: {
        gold: "0 8px 40px rgba(139, 92, 246, 0.25)",
        "gold-lg": "0 16px 60px rgba(139, 92, 246, 0.35)",
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
