module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/fonts/Inter/'],
  dependencies: {
    '@wordpress/react-native-bridge': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    '@wordpress/react-native-aztec': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    'react-native-gesture-handler': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
