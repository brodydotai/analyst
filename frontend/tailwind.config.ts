import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brodus: {
          background: "#0B0F1A",
          panel: "#121826",
          surface: "#1A2035",
          border: "#1F2A44",
          hover: "#253052",
          text: "#E6EAF2",
          muted: "#8C96A9",
          accent: "#3B82F6",
          green: "#22C55E",
          red: "#EF4444",
          amber: "#F59E0B",
          success: "#22C55E",
          danger: "#EF4444",
          warning: "#F59E0B",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
