/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff7ff',
          100: '#dbeefe',
          500: '#3b9df6',
          600: '#1e7fd0',
          800: '#124a7a',
        },
      },
    },
  },
  plugins: [],
};