/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A2B4A',
          50: '#E8ECF2',
          100: '#C5D0E0',
          200: '#8FA4C2',
          300: '#5978A4',
          400: '#2E4D86',
          500: '#1A2B4A',
          600: '#15233C',
          700: '#101A2E',
          800: '#0B1220',
          900: '#060912',
        },
        gold: {
          DEFAULT: '#C9A84C',
          50: '#FBF5E6',
          100: '#F5E8C0',
          200: '#EDD08A',
          300: '#E4B854',
          400: '#C9A84C',
          500: '#A8853A',
          600: '#87632B',
          700: '#66421C',
          800: '#45210D',
          900: '#240000',
        },
        legal: {
          dark: '#1A2B4A',
          gold: '#C9A84C',
          light: '#F8F9FC',
          gray: '#6B7280',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        serif: ['Lora', 'Georgia'],
      },
    },
  },
  plugins: [],
};
