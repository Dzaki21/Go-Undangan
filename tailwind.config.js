/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5ecd6',
          300: '#eedcb4',
          400: '#e3c380',
          500: '#d4a853',
          600: '#b88939',
          700: '#94662c',
          800: '#795027',
          900: '#644223',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e5ede7',
          200: '#ceddd2',
          300: '#abc5b3',
          400: '#81a68f',
          500: '#628a71',
          600: '#4c6f58',
          700: '#3d5847',
          800: '#34473b',
          900: '#2c3c32',
        }
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'spin-slow': 'spin-slow 12s linear infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
