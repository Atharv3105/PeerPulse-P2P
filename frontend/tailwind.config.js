/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gold: {
          DEFAULT: '#C5A059',
          light: '#F7F0E3',
          dark: '#9A7B38',
          bright: '#D4AF37',
        },
        parchment: {
          50: '#FAF6F0',
          100: '#F5EFEB',
          200: '#ECE4DC',
          300: '#DFD5C8',
          400: '#C8BAA8',
          900: '#1A1D1A',
        },
        obsidian: {
          800: '#181D26',
          900: '#14181F',
          950: '#0C0F12',
        },
        approve: {
          DEFAULT: '#15803D',
          hover: '#166534',
          light: '#dcfce7',
        },
        reject: {
          DEFAULT: '#B91C1C',
          hover: '#991B1B',
          light: '#fee2e2',
        },
      },
      boxShadow: {
        'gold-glow': '0 0 25px -4px rgba(197, 160, 89, 0.35)',
        'dossier': '0 20px 40px -15px rgba(60, 45, 30, 0.15)',
        'dossier-dark': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      }
    },
  },

  plugins: [],
}


