/** Colors are Material 3 roles backed by CSS variables (src/styles/index.css). Never use raw hex in components. */
const role = (name) => `var(--${name})`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: role('primary'),
        'on-primary': role('on-primary'),
        'primary-container': role('primary-container'),
        'on-primary-container': role('on-primary-container'),
        secondary: role('secondary'),
        'on-secondary': role('on-secondary'),
        'secondary-container': role('secondary-container'),
        'on-secondary-container': role('on-secondary-container'),
        tertiary: role('tertiary'),
        'tertiary-container': role('tertiary-container'),
        surface: role('surface'),
        'surface-container': role('surface-container'),
        'surface-container-high': role('surface-container-high'),
        'on-surface': role('on-surface'),
        'on-surface-variant': role('on-surface-variant'),
        outline: role('outline'),
        'outline-variant': role('outline-variant'),
        error: role('error'),
        'on-error': role('on-error'),
        'error-container': role('error-container'),
      },
      fontFamily: { sans: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'] },
      transitionTimingFunction: { standard: 'cubic-bezier(0.2, 0, 0, 1)' },
      transitionDuration: { 250: '250ms' },
    },
  },
};
