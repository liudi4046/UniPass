import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5A54F7",
          foreground: "#F5F4FF",
          dark: "#1C1A4F"
        }
      },
      boxShadow: {
        card: "0 20px 45px rgba(14, 14, 44, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;

