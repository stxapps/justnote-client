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
        '56': '14rem',
        '64': '16rem',
      },
      maxWidth: {
        '56': '14rem',
        '64': '16rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
