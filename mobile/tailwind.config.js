/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode tokens (primary palette)
        primary: '#3b82f6',
        'primary-container': '#2563eb',
        'on-primary': '#ffffff',
        tertiary: '#10b981',
        'tertiary-fixed': '#6bff8f',
        'tertiary-container': '#064e3b',
        secondary: '#a3a3a3',
        'secondary-container': '#171717',
        surface: '#000000',
        'surface-container': '#171717',
        'surface-container-low': '#0a0a0a',
        'surface-container-high': '#262626',
        'surface-container-highest': '#404040',
        'on-surface': '#ffffff',
        'on-surface-variant': '#a3a3a3',
        background: '#000000',
        outline: '#404040',
        error: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        inter: ['Inter', 'System'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
