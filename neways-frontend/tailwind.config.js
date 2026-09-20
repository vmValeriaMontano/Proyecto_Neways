/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neways: {
          purple: {
            DEFAULT: '#8B5CF6',
            hover: '#7C3AED',
            light: '#F3E8FF'
          },
          blue: {
            DEFAULT: '#3B82F6',
            hover: '#2563EB',
            light: '#EFF6FF'
          },
          cyan: {
            DEFAULT: '#38BDF8',
            dark: '#0EA5E9'
          },
          pink: {
            DEFAULT: '#EC4899',
            light: '#FCE7F3'
          },
          dark: {
            DEFAULT: '#18181B',
            heavy: '#09090B',
            surface: '#27272A'
          },
          gray: {
            bg: '#F8FAFC',
            card: '#FFFFFF',
            border: '#E2E8F0',
            subtext: '#64748B'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}