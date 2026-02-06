import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        atlas: {
          background: "#0B0F1A",
          panel: "#121826",
          border: "#1F2A44",
          text: "#E6EAF2",
          muted: "#8C96A9",
          green: "#22C55E",
          red: "#EF4444",
          amber: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};

export default config;
