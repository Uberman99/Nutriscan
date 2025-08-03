import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        secondary: "#FF9800",
        accent: "#03A9F4",
        background: "#F5F5F5",
        foreground: "#212121",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#212121",
            a: {
              color: "#03A9F4",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
          },
        },
      },
    },
  },
  plugins: [typography, forms],
};

export default config;
