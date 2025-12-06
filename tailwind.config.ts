import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d5b88',
        'primary-accent': '#3a75b3',
        'primary-dark': '#1e3a5f',
        'background-light': '#f5f5f5',
        'content-light': '#ffffff',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'border-light': '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        display: ['var(--font-inter)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
}

export default config
