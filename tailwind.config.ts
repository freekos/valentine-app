import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        PlayfairDisplay: ["Playfair Display", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
