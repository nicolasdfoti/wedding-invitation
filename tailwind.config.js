/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        fondo: '#FAF9F6',
        peach: '#F6CCAC',
        coral: '#ED9E99',
        cream: '#FCE2AD',
        sky: '#CDE0F8',
        blue: '#B0C4DD',
        sage: '#D1E6B4',
        gold: '#FFDE77',
        accent: '#FA9C5F',
      },
      fontFamily: {
        title: ['Cormorant Garamond', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}