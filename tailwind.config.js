/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#0FEF9E',
          secondary: '#28AFFF',
        },
        subTitle: '#D1D1D1',
      },
      fontFamily: {
        'primary': ['Manrope', 'sans-serif'],
        'secondary': ['Noto Sans', 'Noto Sans SC', 'Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

