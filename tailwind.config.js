/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fire: {
          400: 'rgb(246,0,0)',
        },
        wind: {
          400: 'rgb(35,220,31)',
        },
        water: {
          400: 'rgb(19,113,255)',
        },
        earth: {
          400: 'rgb(253,169,10)',
        },
      },
      keyframes: {
        antispin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'anti-spin': 'antispin 1s linear infinite',
      },
    },
    screens: {
      xs: '390px',
      xm: '512px', // galaxy fold
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}
