/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          dark: '#3B82F6',
        },
        secondary: '#1D4ED8',
        success: '#22C55E',
        danger: '#EF4444',
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        background: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        text: {
          light: '#0F172A',
          dark: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
