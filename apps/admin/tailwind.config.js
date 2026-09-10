/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        forest: {
          50: '#f0f7f4',
          100: '#d9ede5',
          200: '#b6ddcf',
          300: '#89c5b2',
          400: '#5ba892',
          500: '#3c8e77',
          600: '#2b715e',
          700: '#245a4c',
          800: '#20493f',
          900: '#1B4D3E',
          950: '#0c261e',
        },
        leaf: {
          50: '#f0f9f1',
          100: '#dcf2df',
          500: '#2E7D32',
          600: '#256929',
          700: '#1e5421',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        surface: {
          cream: '#FBFBEE',
          card: '#FFFFFF',
          sidebar: '#0F1E19',
        },
        primary: {
          DEFAULT: '#1B4D3E',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2E7D32',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F59E0B',
          foreground: '#1B4D3E',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
