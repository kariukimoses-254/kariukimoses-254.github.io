/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: { 500: '#3b9df6', 600: '#1e7fd0', 800: '#124a7a' },
      },
    },
  },
  plugins: [],
};