/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E6F0FF",
          100: "#CCE0FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0F52BA",
          600: "#0C4294",
          700: "#09336F",
          800: "#06234A",
          900: "#031425",
        },
        accent: {
          50: "#E0FAFF",
          100: "#C1F5FF",
          200: "#83EAFF",
          300: "#46E0FF",
          400: "#00B4D8",
          500: "#0096B5",
          600: "#007892",
          700: "#005A6E",
          800: "#003C4B",
          900: "#001E27",
        },
        warning: {
          50: "#FFF1E8",
          100: "#FFE3D1",
          200: "#FFC7A3",
          300: "#FFAB75",
          400: "#FF8F47",
          500: "#FF6B35",
          600: "#E05020",
          700: "#B73D16",
          800: "#8E2D0E",
          900: "#651D07",
        },
        dark: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#DEE2E6",
          300: "#CED4DA",
          400: "#ADB5BD",
          500: "#6C757D",
          600: "#495057",
          700: "#343A40",
          800: "#212529",
          900: "#1A1A2E",
          950: "#0F0F1A",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(15, 82, 186, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
