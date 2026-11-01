/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sanskrit: ['"Tiro Devanagari Sanskrit"', 'serif'],
      },
      colors: {
        gold: {
          light: '#f7d27a',
          DEFAULT: '#c9962b',
          dark: '#a8721a'
        }
      }
    },
  },
  plugins: [],
}
