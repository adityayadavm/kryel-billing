import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1730",       // deep blue, matches the Canva mockup palette
        accent: "#14B8A6",    // teal accent
      },
    },
  },
  plugins: [],
};
export default config;
