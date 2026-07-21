import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        surface: "#2A2A2A",
        cream: "#F5F5F0",
        signal: "#C41E3A",
        brass: "#B08D57",
        line: "#3A3A3A",
        muted: "#8A8A8A",
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
        "press-in": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
        "stamp-in": "stamp-in 0.5s ease both",
        "press-in": "press-in 0.2s ease",
      },
    },
  },
  plugins: [],
};
export default config;
