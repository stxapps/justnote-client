//import './wdyr';

import React, { useEffect, useRef } from 'react';
import { Text, TextInput, Platform, StatusBar, Keyboard } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { createStore, compose } from 'redux';
import { install as installReduxLoop } from 'redux-loop';
import {
  SafeAreaProvider, initialWindowMetrics, SafeAreaView,
} from 'react-native-safe-area-context';
import KeyboardManager from 'react-native-keyboard-manager';

import reducers from './reducers';
import { BLK_MODE } from './types/const';
import { getThemeMode } from './selectors';
import cache from './utils/cache';
import vars from './vars';

import App from './components/App';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

vars.syncMode.doSyncMode = true;

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

const _Root = () => {
  const themeMode = useSelector(state => getThemeMode(state));
  const backgroundColor = themeMode === BLK_MODE ? 'rgb(17, 24, 39)' : 'white';

  const themeModeRef = useRef(themeMode);
  const backgroundColorRef = useRef(backgroundColor);

  const updateStatusBar = () => {
    StatusBar.setBarStyle(themeModeRef.current === BLK_MODE ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') StatusBar.setBackgroundColor(backgroundColorRef.current);
  };

  useEffect(() => {
    themeModeRef.current = themeMode;
    backgroundColorRef.current = backgroundColor;
    updateStatusBar();
  }, [themeMode, backgroundColor]);

  useEffect(() => {
    const willShowSub = Keyboard.addListener('keyboardWillShow', updateStatusBar);
    const didHideSub = Keyboard.addListener('keyboardDidHide', updateStatusBar);

    return () => {
      willShowSub.remove();
      didHideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView style={cache('SI_safeAreaView', { flex: 1, backgroundColor }, [themeMode])}>
      <App />
    </SafeAreaView>
  );
};

const Root = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <_Root />
      </SafeAreaProvider>
    </Provider>
  );
};

export default Root;
