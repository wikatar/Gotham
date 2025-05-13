/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#202020',
          light: '#2D2D2D',
          dark: '#101010',
        },
        secondary: {
          DEFAULT: '#505050',
          light: '#707070',
          dark: '#404040',
        },
        accent: {
          DEFAULT: '#909090',
          light: '#C0C0C0',
          dark: '#707070',
        },
        background: {
          DEFAULT: '#121212',
          paper: '#1C1C1C',
          elevated: '#242424',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          disabled: '#606060',
        },
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#2196F3',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      gridTemplateColumns: {
        sidebar: '240px auto',
        'sidebar-collapsed': '64px auto',
      },
    },
  },
  plugins: [],
}; 