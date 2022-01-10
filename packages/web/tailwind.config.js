const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      minWidth: {
        '28': '7rem',
        '56': '14rem',
        '64': '16rem',
      },
      maxWidth: {
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      cursor: {
        resize: 'col-resize',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};
