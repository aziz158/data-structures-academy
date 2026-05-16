/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        chalk: ['Caveat', 'cursive'],
        hand: ['Patrick Hand', 'cursive'],
      },
      colors: {
        chalkboard: {
          dark: '#0D0D0D',
          DEFAULT: '#161616',
          light: '#242424',
        },
        chalk: {
          white: '#F5F0E8',
          yellow: '#F5D76E',
          blue: '#87CEEB',
          red: '#FF6B6B',
          green: '#90EE90',
        },
      },
    },
  },
  plugins: [],
}
