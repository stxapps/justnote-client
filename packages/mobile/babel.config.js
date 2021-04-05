module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'react-native-platform-specific-extensions',
      {
        extensions: ['css', 'scss', 'sass'],
      },
    ],
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
  ],
  overrides: [
    {
      // Transforms JSX into JS function calls and use `createElement` instead of the default `React.createElement`
      plugins: [
        [
          '@babel/plugin-transform-react-jsx',
          {
            pragma: 'createElement',
            pragmaFrag: 'Fragment',
          },
        ],
      ],
      include: /node_modules\/@wordpress/,
    },
    {
      // Auto-add `import { createElement } from '@wordpress/element';` when JSX is found
      plugins: [
        [
          '@wordpress/babel-plugin-import-jsx-pragma',
          {
            scopeVariable: 'createElement',
            scopeVariableFrag: 'Fragment',
            source: '@wordpress/element',
            isDefault: false,
          },
        ],
      ],
      include: /node_modules\/@wordpress/,
    },
  ],
};
