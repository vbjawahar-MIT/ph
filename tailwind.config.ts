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
        bg: "transparent",
        ink: "#FFFFFF",
        muted: "rgba(255,255,255,0.65)",
        line: "rgba(255,255,255,0.16)",
        blue: {
          brand: "#3554FF",
        },
        purple: {
          brand: "#A14DFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        display: "-0.03em",
        ui: "0.15em",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #3554FF 0%, #A14DFF 100%)",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      fontSize: {
        // Fluid display sizes.
        //
        // `display-xl` is the "vbphotographe" wordmark on the hero + footer.
        // Previously clamp(4rem, 14vw, 12rem) — that pushed to 12rem on
        // 1600px+ screens which felt oversized and pushed content around.
        // New clamp gives ~3rem on 375px mobile, ~5rem on ~800px tablet,
        // and caps at 10rem on wide desktops — same authority, less bulk.
        "display-sm": "clamp(2.5rem, 6vw, 5rem)",
        "display": "clamp(3rem, 8vw, 7rem)",
        "display-xl": "clamp(3rem, 10vw, 10rem)",
      },
    },
  },
  plugins: [],
};

export default config;
