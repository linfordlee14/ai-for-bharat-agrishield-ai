/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#1b3a1a',
        'forest-light': '#2d5a27',
        'forest-hover': '#3a7a33',
        'warning-red': '#cc3300',
        'warning-orange': '#ff9900',
        'warning-yellow': '#ffcc00',
      }
    },
  },
  plugins: [],
}
