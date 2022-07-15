const colors = require('tailwindcss/colors');

module.exports = {
  purge: false,
  darkMode: false,
  theme: {
    extend: {
      colors: {
        green: colors.green,
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
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
