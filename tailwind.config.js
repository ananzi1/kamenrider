/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3ee',
          100: '#fde4d7',
          200: '#fac5ae',
          300: '#f69d7b',
          400: '#f26b46',
          500: '#ef4221',
          600: '#e02a17',
          700: '#ba1c15',
          800: '#941919',
          900: '#781818',
        }
      },
      fontFamily: {
        sans: ['"Microsoft YaHei"', '"PingFang SC"', 'sans-serif']
      }
    }
  },
  plugins: []
}
