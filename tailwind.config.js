/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d6e0ea',
          200: '#adc2d6',
          300: '#7f9fbd',
          400: '#4f759d',
          500: '#325a80',
          600: '#234868',
          700: '#1b3a5c',
          800: '#132a44',
          900: '#0c1c2e',
        },
        emeraldx: {
          50: '#e9f7ef',
          100: '#c8ecd7',
          500: '#2e7d4f',
          600: '#25653f',
          700: '#1c4d30',
        },
        amberx: {
          50: '#fef6e7',
          100: '#fce8bf',
          500: '#d97706',
          600: '#b45f04',
        },
        alarm: {
          500: '#dc2626',
          600: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
