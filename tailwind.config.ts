import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        secondary: {
          500: '#0f766e',
          600: '#115e59',
          700: '#134e4a',
        },
        accent: {
          500: '#dc2626',
          600: '#b91c1c',
        },
        background: {
          50: '#fffdf9',
          100: '#f5f5f5',
          200: '#e5e7eb',
        },
        foreground: {
          600: '#4b5563',
          700: '#374151',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
