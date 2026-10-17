import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        ink: "#141110",
        surface: "#1c1917",
        "surface-hover": "#241f1b",
        cream: "#efe7dc",
        paper: "#f2ead9",
        signal: "#C41E3A",
        brass: "#c8752c",
        line: "#2e2822",
        muted: "#8a7f72",
        midnight: {
          surface: "#051424",
          "surface-dim": "#051424",
          "surface-bright": "#2c3a4c",
          "surface-container-lowest": "#010f1f",
          "surface-container-low": "#0d1c2d",
          "surface-container": "#122131",
          "surface-container-high": "#1c2b3c",
          "surface-container-highest": "#273647",
          "on-surface": "#d4e4fa",
          "on-surface-variant": "#c6c6cd",
          outline: "#909097",
          "outline-variant": "#45464d",
          primary: "#bec6e0",
          "on-primary": "#283044",
          "primary-container": "#0f172a",
          "on-primary-container": "#798098",
          secondary: "#ffb77b",
          "on-secondary": "#4d2700",
          "secondary-container": "#7a4100",
          "on-secondary-container": "#ffb270",
          tertiary: "#bcc7de",
          error: "#ffb4ab",
          "on-error": "#690005",
          "error-container": "#93000a",
          "on-error-container": "#ffdad6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        ui: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
