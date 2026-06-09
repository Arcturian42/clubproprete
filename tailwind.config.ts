import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        pine: "#0f172a",
        mint: "#ecfdf5",
        cloud: "#f8fafc",
        amber: "#fbbf24",
        bento: {
          bg: "#f8fafc",
          primary: "#0f172a",
          muted: "#64748b",
          light: "#e2e8f0",
          accent: "#6366f1",
          green: "#34d399",
          red: "#f87171",
          amber: "#fbbf24"
        }
      },
      boxShadow: {
        panel: "4px 4px 0px #0f172a",
        "panel-hover": "7px 7px 0px #0f172a",
        "panel-active": "2px 2px 0px #0f172a"
      }
    }
  },
  plugins: []
};

export default config;
