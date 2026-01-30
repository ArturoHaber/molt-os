/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        molt: {
          orange: '#f97316',
          dark: '#111827',
          darker: '#0a0f1a',
        }
      }
    },
  },
  plugins: [],
}
