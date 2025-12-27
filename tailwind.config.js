/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    colors: {
      
      primary: "#3EB489",
      secondary: "#1E1E1E",
      accent: "#F5F7F4",
      text: "#101108",
      bg: "#ffffff",

      
      "primary-dark": "#4CC297",
      "secondary-dark": "#E0E0E0",
      "accent-dark": "#0A0C09",
      "text-dark": "#F6F7EE",
      "bg-dark": "#000000",
    },
  },
},
  plugins: [],
};
