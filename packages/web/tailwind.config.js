const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        green: colors.green,
      },
      cursor: {
        resize: 'col-resize',
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
    extend: {
      textColor: ['group-focus', 'focus-visible'],
      ringColor: ['group-focus', 'focus-visible'],
      ringOffsetColor: ['group-focus', 'focus-visible'],
      ringOffsetWidth: ['group-focus', 'focus-visible'],
      ringOpacity: ['group-focus', 'focus-visible'],
      ringWidth: ['group-focus', 'focus-visible'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
}
