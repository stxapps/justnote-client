//import './wdyr';

import React from 'react';
import { Text, TextInput, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { install as installReduxLoop } from 'redux-loop';
import {
  SafeAreaProvider, initialWindowMetrics, SafeAreaView,
} from 'react-native-safe-area-context';
import KeyboardManager from 'react-native-keyboard-manager';

import reducers from './reducers';
import cache from './utils/cache';

import App from './components/App';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

/** @ts-ignore */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  /** @type {any} */(reducers),
  composeEnhancers(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
  )
);

if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(false);
  KeyboardManager.setEnableDebugging(false);
  KeyboardManager.setEnableAutoToolbar(false);
}

const Root = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SafeAreaView style={cache('SI_safeAreaView', { flex: 1, backgroundColor: 'white' })}>
          <App />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
};

export default Root;
