/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Every color below resolves to a SEMANTIC CSS variable, never a raw hex.
      // The variables are re-bound per theme in tokens.css → this is the whole
      // Brand-in-a-Box mechanism (Ideation §1.8 / PRD §11.2).
      colors: {
        bg: 'rgb(var(--surface-bg) / <alpha-value>)',
        'bg-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        card: 'rgb(var(--surface-card) / <alpha-value>)',
        ink: 'rgb(var(--text-primary) / <alpha-value>)',
        'ink-muted': 'rgb(var(--text-secondary) / <alpha-value>)',
        'ink-faint': 'rgb(var(--text-tertiary) / <alpha-value>)',
        brand: 'rgb(var(--accent-brand) / <alpha-value>)',
        'brand-alt': 'rgb(var(--accent-brand-alt) / <alpha-value>)',
        positive: 'rgb(var(--accent-positive) / <alpha-value>)',
        warning: 'rgb(var(--accent-warning) / <alpha-value>)',
        hairline: 'rgb(var(--border-subtle) / <alpha-value>)',
      },
      // TWK Lausanne (Weltkern) is the brand face. It's a licensed font and is
      // deliberately NOT bundled: it renders wherever it's installed locally,
      // and everyone else gets the open fallbacks listed after it.
      fontFamily: {
        display: ['"TWK Lausanne"', 'Quicksand', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"TWK Lausanne"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: '0 18px 48px -12px rgb(0 0 0 / 0.55)',
        lift: '0 8px 28px -8px rgb(0 0 0 / 0.45)',
      },
      letterSpacing: { eyebrow: '0.14em' },
    },
  },
  plugins: [],
}
