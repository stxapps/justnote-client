/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  resolver: {
    sourceExts: ['js', 'json', 'css', 'scss', 'sass', 'ts', 'tsx'],
    platforms: ['native', 'android', 'ios'],
  },
  transformer: {
    babelTransformerPath: require.resolve('./sass-transformer.js'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
