/** @type {import('tailwindcss').Config} */
// Theme tokens merged from sprints/sprint-01/ui-style-outputs/tailwind.theme.json
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A3A6B',
          blue: '#1E40AF',
          blueActive: '#2563EB',
          green: '#2D6A2D',
          greenHover: '#1E4D1E',
          greenLight: '#4CAF50',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F5F5',
          sidebar: '#F2F4F7',
        },
        border: {
          DEFAULT: '#D1D5DB',
          focus: '#2563EB',
          subtle: '#E5E7EB',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          placeholder: '#9CA3AF',
          'on-dark': '#FFFFFF',
        },
        semantic: {
          error: '#DC2626',
          warning: '#D97706',
          success: '#16A34A',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'Cascadia Code',
          'Source Code Pro',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.375' }],
        xl: ['1.25rem', { lineHeight: '1.25' }],
        '2xl': ['1.5rem', { lineHeight: '1.25' }],
        '3xl': ['1.75rem', { lineHeight: '1.25' }],
      },
      spacing: {
        18: '4.5rem',
        sidebar: '280px',
        header: '56px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        modal: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      zIndex: {
        dropdown: '100',
        sticky: '200',
        modal: '300',
        toast: '400',
      },
      screens: {
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
};
