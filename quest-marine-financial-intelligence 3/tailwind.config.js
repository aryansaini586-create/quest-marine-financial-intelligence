/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: { 50: '#e8ecf2', 100: '#c5cfe0', 200: '#9eafcc', 300: '#778fb8', 400: '#5977a8', 500: '#3b5f99', 600: '#2d4d80', 700: '#1e3a66', 800: '#0f274d', 900: '#003366', 950: '#0A1628' },
        teal: { 500: '#007B8A', 600: '#006670', 700: '#005157' },
        gold: { 400: '#E8C36A', 500: '#D4A843', 600: '#B8902F' }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
