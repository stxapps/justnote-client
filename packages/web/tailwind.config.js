const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      minWidth: {
        '32': '8rem',
        '36': '9rem',
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
      lineHeight: {
        '6.5': '1.625rem',
      },
      cursor: {
        resize: 'col-resize',
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('tailwindcss-labeled-groups')(['s']),
    plugin(function ({ addVariant }) {
      addVariant('blk', '&');
    }),
  ],
};
