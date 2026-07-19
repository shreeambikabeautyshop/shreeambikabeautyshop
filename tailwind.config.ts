import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#8B0000",    // Deep Maroon/Crimson
          secondary: "#C41E3A",  // Rose Red
          accent: "#FFB6C1",     // Light Pink
          gold: "#D4AF37",       // Gold
          light: "#FFF0F3",      // Very Light Pink
          dark: "#5C0011",       // Dark Maroon
        },
      },
      fontFamily: {
        sans:    ["var(--font-poppins)", "sans-serif"],
        serif:   ["var(--font-playfair)", "Georgia", "serif"],
        elegant: ["var(--font-cormorant)", "Georgia", "serif"],
        script:  ["var(--font-dancing)", "cursive"],
        heading: ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      animation: {
        "slide-in": "slideIn 0.5s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
