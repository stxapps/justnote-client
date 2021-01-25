const colors = require('tailwindcss/colors');

module.exports = {
  purge: false,
  darkMode: false,
  theme: {
    extend: {
      colors: {
        green: colors.green,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
