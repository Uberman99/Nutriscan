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
      // Keep extend empty unless specific, unique customizations are needed.
      // The previous color palette can be replaced with standard Tailwind utilities
      // e.g., bg-green-500, bg-amber-500, bg-sky-500, etc.
    },
  },
  plugins: [typography, forms],
};

export default config;