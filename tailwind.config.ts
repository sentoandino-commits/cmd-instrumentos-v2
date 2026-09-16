import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F6F8",
        paperLight: "#FFFFFF",
        ink: "#1A2733",
        inkSoft: "#5B6B7A",
        line: "#DDE3E8",
        lineStrong: "#C3CDD6",
        clay: "#14507D",
        clayDark: "#0D3A5C",
        clayLight: "#DCEAF4",
        teal: "#B1502F",
        tealLight: "#F0DFD2",
        danger: "#B23A3A",
        dangerLight: "#F8E2E2",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
