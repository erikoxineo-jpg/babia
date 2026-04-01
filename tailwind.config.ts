import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FBF5E8',
          100: '#F5E6C4',
          200: '#EDD49C',
          300: '#E5C274',
          400: '#DCB55E',
          500: '#D4A853',
          600: '#BF9545',
          700: '#A37E3A',
          800: '#7A5F2C',
          900: '#52401E',
        },
        secondary: {
          50:  '#FAF9F7',
          100: '#F0EEEB',
          200: '#E0DDD8',
          300: '#C5C1BA',
          400: '#8A857D',
          500: '#3D3731',
          600: '#302B26',
          700: '#25211D',
          800: '#1A1714',
          900: '#100E0C',
        },
        success: {
          50:  '#FBF5E8',
          100: '#F5E6C4',
          200: '#EDD49C',
          300: '#E5C274',
          400: '#DCB55E',
          500: '#D4A853',
          600: '#BF9545',
          700: '#A37E3A',
          800: '#7A5F2C',
          900: '#52401E',
        },
        warning: {
          50:  '#FBF5E8',
          100: '#F5E6C4',
          200: '#EDD49C',
          300: '#E5C274',
          400: '#DCB55E',
          500: '#D4A853',
          600: '#BF9545',
          700: '#A37E3A',
          800: '#7A5F2C',
          900: '#52401E',
        },
        error: {
          50:  '#FAF9F7',
          100: '#F0EEEB',
          200: '#E0DDD8',
          300: '#C5C1BA',
          400: '#8A857D',
          500: '#3D3731',
          600: '#302B26',
          700: '#25211D',
          800: '#1A1714',
          900: '#100E0C',
        },
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },

      fontFamily: {
        sans: [
          'var(--font-montserrat)',
          'Montserrat',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        heading: [
          'var(--font-montserrat)',
          'Montserrat',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },

      fontSize: {
        xs:   ['0.75rem',   { lineHeight: '1rem' }],
        sm:   ['0.875rem',  { lineHeight: '1.25rem' }],
        base: ['1rem',      { lineHeight: '1.5rem' }],
        lg:   ['1.125rem',  { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',   { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
      },

      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        soft: '0 2px 12px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        up: '0 -4px 12px 0 rgba(0, 0, 0, 0.06)',
        card: '0 1px 8px 0 rgba(0, 0, 0, 0.04)',
      },

      borderRadius: {
        none: '0px',
        sm:   '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },

      screens: {
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
      },

      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },

      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },

      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      animation: {
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'slide-out-right': 'slide-out-right 200ms ease-in',
        'fade-in': 'fade-in 150ms ease-in-out',
        'fade-out': 'fade-out 150ms ease-in-out',
        'scale-in': 'scale-in 200ms ease-out',
      },

      maxWidth: {
        'content': '1280px',
      },

      width: {
        'sidebar': '256px',
      },
    },
  },

  plugins: [],
};

export default config;
