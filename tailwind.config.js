// tailwind.config.js
module.exports = {
  darkMode: "class", // enables dark mode via class="dark"
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scan all your source files
  ],
  theme: {
    extend: {
      colors: {
        sand: { 100: "#fdf6e3" },
        ink: { 900: "#1a1a1a" },
        terracotta: { 500: "#e2725b" },
      },
    },
  },
  plugins: [],
};
