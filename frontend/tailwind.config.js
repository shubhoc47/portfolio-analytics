/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 25px -12px rgba(15, 23, 42, 0.35)",
        panel: "0 16px 40px -20px rgba(2, 6, 23, 0.55)",
        glow: "0 0 0 1px rgba(6, 182, 212, 0.12), 0 12px 40px -16px rgba(99, 102, 241, 0.25)",
        "card-lift":
          "0 24px 48px -28px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "hero-float":
          "0 32px 64px -32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 80px -20px rgba(99, 102, 241, 0.15)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        "gradient-primary-soft":
          "linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.18) 100%)",
        "landing-page": "linear-gradient(180deg, #0F172A 0%, #020617 100%)",
        "card-dashboard": "linear-gradient(180deg, #0B1220 0%, #0F1A2F 100%)",
        "app-shell-dark":
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(99, 102, 241, 0.14), transparent 50%), radial-gradient(ellipse 80% 50% at 100% 0%, rgba(139, 92, 246, 0.1), transparent 45%), linear-gradient(180deg, #0F172A 0%, #0F172A 100%)",
        "app-shell-light":
          "radial-gradient(ellipse 100% 70% at 50% -15%, rgba(99, 102, 241, 0.08), transparent 50%), linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
      },
      colors: {
        piq: {
          canvas: "#0F172A",
          accent: "#06B6D4",
          profit: "#22C55E",
          loss: "#F43F5E",
          surface: "#1e293b",
          "surface-elevated": "#334155",
          "text-primary": "#F8FAFC",
          "text-muted": "#94A3B8",
          "card-surface": "#0F1A2F",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366F1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        marketing: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8B5CF6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
      },
    },
  },
  plugins: [],
};
