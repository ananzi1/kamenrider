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
        sans: ['"Microsoft YaHei"', '"PingFang SC"', 'sans-serif'],
        mono: ['"Cascadia Code"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 24px -6px rgba(239, 66, 33, 0.35)',
        'glow-primary-sm': '0 0 12px -3px rgba(239, 66, 33, 0.25)',
        'glass': 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        'card': '0 1px 2px 0 rgba(0,0,0,0.4), 0 4px 12px -4px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    }
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  }
}
