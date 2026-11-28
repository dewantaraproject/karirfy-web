/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        obsidian: {
          950: '#09090c',
          900: '#0e0e10',
          800: '#18181c',
          700: '#222228',
          600: '#2e2e36',
        },
      },
      boxShadow: {
        'glass-card': '0 12px 36px 0 rgba(0, 0, 0, 0.25)',
        'glass-card-light': '0 12px 36px 0 rgba(0, 0, 0, 0.05)',
        'glow-white': '0 0 40px -10px rgba(255, 255, 255, 0.12)',
      },
    },
  },
  plugins: [],
}
