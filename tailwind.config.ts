import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — follow the section palette (see globals.css).
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-alt": "rgb(var(--surface-alt) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        // Fixed brand colours.
        noir: "#0B0B0B",
        ivory: "#F7F4EE",
        gold: {
          DEFAULT: "#C9A55C",
          light: "#DCC08A",
          deep: "#7A5C24",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
      },
      letterSpacing: {
        display: "-0.03em",
        serif: "-0.01em",
        ui: "0.15em",
      },
      backgroundImage: {
        "gradient-gold":
          "linear-gradient(135deg, #E6CF9C 0%, #C9A55C 50%, #9C7A3C 100%)",
      },
      boxShadow: {
        soft: "0 18px 40px -24px rgba(24, 21, 18, 0.28)",
        lift: "0 30px 60px -28px rgba(24, 21, 18, 0.4)",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      fontSize: {
        // Fluid display sizes, tuned for the serif display face.
        "display-sm": "clamp(2.25rem, 4.6vw, 3.75rem)",
        display: "clamp(2.75rem, 6.4vw, 5.5rem)",
        "display-xl": "clamp(3rem, 10vw, 10rem)",
      },
    },
  },
  plugins: [],
};

export default config;
