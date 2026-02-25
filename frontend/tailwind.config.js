/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ═══ COLORS — Guarda360° DS v1.0 ═══ */
      colors: {
        /* Primary — Azul Institucional */
        primary: {
          DEFAULT: '#1D4ED8',   /* 9.3:1 WCAG AAA on white */
          hover:   '#2563EB',
          active:  '#1E40AF',
          muted:   'rgba(29,78,216,0.08)',
          border:  'rgba(29,78,216,0.25)',
        },
        /* Surfaces */
        bg:          '#F8FAFC',
        surface:     '#FFFFFF',
        'surface-alt': '#F1F5F9',
        border:      '#E2E8F0',
        'border-dark': '#CBD5E1',
        /* Text */
        'text-primary':   '#0F172A',
        'text-secondary': '#374151',
        'text-tertiary':  '#64748B',
        'text-disabled':  '#94A3B8',
        'text-inverse':   '#FFFFFF',
        /* Guardian Colors — Calendário de Convivência */
        guardian: {
          a:          '#2563EB',
          'a-bg':     '#EFF6FF',          /* blue-50 — DS spec */
          'a-border': 'rgba(37,99,235,0.30)',
          b:          '#DB2777',
          'b-bg':     'rgba(219,39,119,0.08)',
          'b-border': 'rgba(219,39,119,0.30)',
          shared:     '#7C3AED',
          'shared-bg': 'rgba(124,58,237,0.08)',
        },
        /* Status de Visita */
        confirmado: '#16A34A',
        pendente:   '#D97706',
        cancelado:  '#DC2626',
        falta:      '#DC2626',
        atraso:     '#D97706',
        cumprido:   '#16A34A',
        /* Severity de Ocorrências */
        severity: {
          low:      '#16A34A',
          medium:   '#D97706',
          high:     '#DC2626',
          critical: '#7C3AED',   /* Alienação Parental — 7.4:1 WCAG */
        },
        /* Hash/Integridade SHA-256 */
        hash: {
          valid:  '#0EA5E9',
          'valid-bg': 'rgba(14,165,233,0.08)',
        },
        /* Semantic */
        success: '#16A34A',
        warning: '#D97706',
        error:   '#DC2626',
        info:    '#0EA5E9',
      },

      /* ═══ TYPOGRAPHY ═══ */
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.25', fontWeight: '800', letterSpacing: '-0.01em' }],
      },

      /* ═══ SPACING (8pt grid) ═══ */
      /* Tailwind default already covers 1-16 in 4px increments */

      /* ═══ BORDER RADIUS — Foursys Aligned ═══ */
      borderRadius: {
        'sm':    '0.25rem',  /*  4px  — badges menores */
        'md':    '0.5rem',   /*  8px  — ícones, elementos internos */
        'lg':    '1rem',      /* 16px  — cards, modais (Foursys LG) */
        'xl':    '1rem',     /* 16px  — bottom sheets */
        '2xl':   '1.5rem',   /* 24px  — hero cards */
        'input': '1.25rem',  /* 20px  — inputs, selects (Foursys LG) */
        'pill':  '9999px',   /* Pill  — botões Foursys padrão */
        'full':  '9999px',   /* Alias — avatares, badges */
      },

      /* ═══ BOX SHADOW — Foursys Aligned ═══ */
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'hover':      '0 4px 12px rgba(29,78,216,0.12)',
        'md':         '0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'lg':         '0 10px 25px rgba(0,0,0,0.12)',
        'xl':         '0 20px 40px rgba(0,0,0,0.15)',
        'focus':      '0 0 0 3px rgba(29,78,216,0.25)',
        'hash':       '0 0 0 1px rgba(14,165,233,0.40)',
        'inset':      'inset 0 1px 2px rgba(0,0,0,0.06)',
        'soft':       '0 10px 25px rgba(15,23,42,0.06)',   /* Foursys soft */
        'soft-hover': '0 18px 45px rgba(15,23,42,0.10)',  /* Foursys hover */
      },

      /* ═══ SIZING ═══ */
      minHeight: {
        'touch': '44px',    /* WCAG 2.5.5 */
        'touch-lg': '48px',
      },
      width: {
        'fab': '56px',
      },
      height: {
        'fab': '56px',
        'touch': '44px',
        'touch-lg': '48px',
        'avatar-sm': '28px',
        'avatar-md': '36px',
        'avatar-lg': '48px',
        'avatar-xl': '64px',
      },

      /* ═══ ANIMATION ═══ */
      transitionDuration: {
        'fast':   '120ms',
        'normal': '220ms',
        'slow':   '380ms',
      },
      transitionTimingFunction: {
        'ds':       'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-ds': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'out-ds':   'cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.55', transform: 'scale(1.4)' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(4px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'fade-in':   'fade-in 220ms cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
