// BuildTwin 360 design tokens.
// Palette follows the construction-intelligence brand: deep navy for
// authority/structure, a working blue for interactive elements, and a
// status set used consistently across DPR, quality, material and cost modules.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#0A1F3A',
          900: '#0F2A4A', // primary navy - topbar, headers, primary text on light
          800: '#173A63',
          700: '#1F4B80',
          600: '#2A5FA0',
          500: '#2F6FED', // interactive / links / primary buttons
          400: '#5B8DF2',
          300: '#8FB0F5',
          200: '#C4D6FA',
          100: '#E4ECFD',
          50: '#F3F7FE',
        },
        status: {
          success: '#1E9E64',
          successBg: '#E7F7EF',
          warning: '#C77700',
          warningBg: '#FFF4E0',
          danger: '#D64545',
          dangerBg: '#FCE9E9',
          critical: '#9B1C1C',
          criticalBg: '#F8DADA',
          info: '#2F6FED',
          infoBg: '#E4ECFD',
          neutral: '#64748B',
          neutralBg: '#F1F5F9',
        },
        surface: {
          base: '#FFFFFF',
          subtle: '#F7F9FC',
          muted: '#EDF1F7',
          border: '#E2E8F0',
        },
        ink: {
          900: '#0F172A',
          700: '#334155',
          500: '#64748B',
          300: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'], // used for report/document headers only
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.625rem' }],
        '2xl': ['1.375rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.125rem' }],
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        15: '3.75rem',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 42, 74, 0.06), 0 1px 3px rgba(15, 42, 74, 0.08)',
        popover: '0 8px 24px rgba(15, 42, 74, 0.16)',
      },
    },
  },
  plugins: [],
};
