const colors = require('tailwindcss/colors');

module.exports = {
  purge: false,
  theme: {
    extend: {
      colors: {
        green: colors.green,
      },
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
        '5.5': '1.375rem',
        '6.5': '1.625rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
