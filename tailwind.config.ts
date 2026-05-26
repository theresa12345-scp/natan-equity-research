import type { Config } from "tailwindcss";

// Note: @theme block in app/globals.css is the source of truth for design
// tokens. This file defines content paths and is kept for Magic-generated
// component compatibility.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mag: "#ff2e88",
        green: "#00d97e",
        red: "#ff4d4f",
        amber: "#f5a623",
        surface: {
          0: "#000000",
          1: "#050505",
          2: "#0a0a0a",
          3: "#111111",
          4: "#1d1d1d",
          5: "#2a2a2a",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
