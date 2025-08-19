/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
    },
    extend: {
      colors: {
        primary: {
          main: "#0FEF9E",
          secondary: "#28AFFF",
        },
        subTitle: "#D1D1D1",
        inputBg: "#171717",
        cardCreator: "#E8E8E8",
        border: {
          primary: "#EBF9F4",
        },
        skeleton: "#B0B0B0",
      },
      fontFamily: {
        primary: ["Manrope", "sans-serif"],
        secondary: [
          "Noto Sans",
          "Noto Sans SC",
          "Noto Sans Thai",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
