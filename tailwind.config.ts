import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'green-krnd': '#7EAF45',
        'lightgrey-krnd': '#848484',
        'darkgrey-krnd': '#323033',
      },
    },
  },
  plugins: [],
};
export default config;
