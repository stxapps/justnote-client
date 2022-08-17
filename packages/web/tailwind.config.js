const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      minWidth: {
        '32': '8rem',
        '56': '14rem',
        '64': '16rem',
      },
      minHeight: {
        'xl': '36rem',
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
    require('tailwindcss-labeled-groups')(['s'])
  ],
};
