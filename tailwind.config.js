/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        deepNavyBlue: '#001f3f',
        goldenYellow: '#FFD700',
        'navy-primary': 'var(--navy-primary)',
        'navy-secondary': 'var(--navy-secondary)',
        'navy-dark': 'var(--navy-dark)',
        'navy-light': 'var(--navy-light)',
        'gold-primary': 'var(--gold-primary)',
        'gold-secondary': 'var(--gold-secondary)',
        'gold-light': 'var(--gold-light)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        'info': 'var(--info)',
        black: '#000000',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
