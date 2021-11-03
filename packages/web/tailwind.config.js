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
  variants: {
    extend: {
      textColor: ['group-focus', 'focus-visible'],
      backgroundColor: ['group-focus', 'focus-visible'],
      borderColor: ['group-focus', 'focus-visible'],
      ringColor: ['group-hover', 'group-focus', 'hover', 'focus-visible'],
      ringOffsetColor: ['group-hover', 'group-focus', 'hover', 'focus-visible'],
      ringOffsetWidth: ['group-hover', 'group-focus', 'hover', 'focus-visible'],
      ringOpacity: ['group-hover', 'group-focus', 'hover', 'focus-visible'],
      ringWidth: ['group-hover', 'group-focus', 'hover', 'focus-visible'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};
