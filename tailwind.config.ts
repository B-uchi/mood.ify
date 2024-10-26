import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mood: {
          default: {
            primary: {
              from: "#4C1D95", // purple-900
              via: "#7E22CE", // purple-700
              to: "#4C1D95", // purple-900
              secondary: "#2DD4BF", // teal-400
              text: "#E9D5FF", // purple-200
            },
          },
          happy: {
            primary: {
              from: "#f59e0b",
              via: "#fb923c",
              to: "#f87171",
              secondary: "#F472B6", // pink-400
              text: "#FEF08A", // yellow-200
            },
          },
          chill: {
            primary: {
              from: "#2563EB", // blue-600
              via: "#14B8A6", // teal-500
              to: "#22C55E", // green-500
              secondary: "#2DD4BF", // teal-400
              text: "#BFDBFE", // blue-200
            },
          },
          energetic: {
            primary: {
              from: "#DC2626", // red-600
              via: "#F97316", // orange-500
              to: "#EAB308", // yellow-500
              secondary: "#FB923C", // orange-400
              text: "#FEF08A", // yellow-200
            },
          },
          melancholic: {
            primary: {
              from: "#1E3A8A", // blue-900
              via: "#4338CA", // indigo-700
              to: "#6B21A8", // purple-800
              secondary: "#6366F1", // indigo-500
              text: "#E9D5FF", // purple-200
            },
          },
          focused: {
            primary: {
              from: "#1F2937", // gray-800
              via: "#15803D", // green-700
              to: "#1F2937", // gray-800
              secondary: "#22C55E", // green-500
              text: "#E5E7EB", // gray-200
            },
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        "josefin-sans": ["Josefin Sans", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
