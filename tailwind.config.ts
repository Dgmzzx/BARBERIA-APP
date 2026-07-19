import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0a0807",
        surface: "#18120e",
        line: "#2a1f18",
        accent: "#d4893a",
        cream: "#e8d5b7",
        stamp: "#6a2e2e",
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
        "stamp-in": {
          "0%": { opacity: "0", transform: "translateX(24px) rotate(-12deg)" },
          "100%": { opacity: "1", transform: "translateX(0) rotate(6deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
        "stamp-in": "stamp-in 0.5s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
