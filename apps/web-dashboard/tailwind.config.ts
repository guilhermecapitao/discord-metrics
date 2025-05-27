import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    container: { center: true, padding: "2rem" },
    extend: {
      fontFamily: { sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans] }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;