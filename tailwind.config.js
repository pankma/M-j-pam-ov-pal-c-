/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        palace: {
          orange: '#FF6B00',
          black: '#111111',
          bg: '#F7F7F7',
          muted: '#777777',
          border: '#E7E7E7',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17,17,17,0.06)',
      },
      borderRadius: {
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
