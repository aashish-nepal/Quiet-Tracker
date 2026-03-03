/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  safelist: ['animate-gradient'],
  theme: {
    extend: {
      colors: {
        // Dark surfaces
        base: '#09090b',
        surface: '#111113',
        elevated: '#1a1a1e',
        card: '#16161a',

        // Brand
        brand: {
          50: '#eef4ff',
          100: '#dbeafe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },

        // Text
        primary: '#f4f4f5',
        secondary: '#a1a1aa',
        tertiary: '#71717a',

        // Borders
        subtle: 'rgba(255,255,255,0.06)',
        default: 'rgba(255,255,255,0.10)',
        strong: 'rgba(255,255,255,0.18)',

        // Semantic
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',

        // Backward compat
        ink: '#f4f4f5',
        muted: '#a1a1aa',
        slateBlue: '#60a5fa',
        cloud: 'rgba(255,255,255,0.10)',
        mist: 'rgba(255,255,255,0.04)',
        layer: '#1a1a1e',
        line: 'rgba(255,255,255,0.10)',
        canvas: '#09090b',
        blush: 'rgba(239,68,68,0.10)',
        mint: 'rgba(34,197,94,0.10)',
        accent: {
          300: '#93c5fd',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        display: ['Inter', '-apple-system', 'sans-serif'],
        body: ['Inter', '-apple-system', 'sans-serif']
      },
      maxWidth: {
        container: '1280px'
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        ds6: '6px',
        ds10: '10px',
        ds16: '16px',
        ds24: '24px'
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' }
        },
        shiftGradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(59,130,246,0.35)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        rise: 'rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
        shiftGradient: 'shiftGradient 10s ease infinite',
        glow: 'glow 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite'
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        md: '0 4px 16px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
        lg: '0 12px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
        brand: '0 0 40px rgba(59,130,246,0.2), 0 4px 16px rgba(0,0,0,0.5)',
        elevation1: '0 1px 3px rgba(0,0,0,0.4)',
        elevation2: '0 4px 16px rgba(0,0,0,0.5)',
        elevation3: '0 12px 48px rgba(0,0,0,0.6)',
        soft: '0 4px 16px rgba(0,0,0,0.4)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.15) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)'
      }
    }
  },
  plugins: []
};
