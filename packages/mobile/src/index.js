//import './wdyr';

import React, { useEffect, useRef } from 'react';
import { Text, TextInput, Platform, StatusBar, Keyboard } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { legacy_createStore as createStore, compose, applyMiddleware } from 'redux';
import { install as installReduxLoop } from 'redux-loop';
import {
  SafeAreaProvider, initialWindowMetrics, SafeAreaView,
} from 'react-native-safe-area-context';
import KeyboardManager from 'react-native-keyboard-manager';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { setAppBackground } from '@vonovak/react-native-theme-control';

import reducers from './reducers';
import { BLK_MODE } from './types/const';
import { getThemeMode } from './selectors';
import cache from './utils/cache';

import App from './components/App';
import Share from './components/Share';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

let enhancers;
if (__DEV__) {
  const createDebugger = require('redux-flipper').default;
  enhancers = compose(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
    applyMiddleware(createDebugger()),
  );
} else {
  enhancers = compose(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
  );
}
const store = createStore(/** @type {any} */(reducers), enhancers);

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

  const updateStatusBar = async () => {
    const statusBarStyle = (
      themeModeRef.current === BLK_MODE ? 'light-content' : 'dark-content'
    );
    const statusBgColor = backgroundColorRef.current;
    const navBarStyle = themeModeRef.current === BLK_MODE ? 'light' : 'dark';
    const navBgColor = backgroundColorRef.current;
    const appBgColor = backgroundColorRef.current;

    try {
      if (Platform.OS === 'ios') {
        StatusBar.setBarStyle(statusBarStyle);
      } else if (Platform.OS === 'android') {
        await SystemNavigationBar.setNavigationColor(
          statusBgColor, navBarStyle, 'status'
        );
        await SystemNavigationBar.setNavigationColor(
          navBgColor, navBarStyle, 'navigation'
        );
        await setAppBackground(appBgColor);

        StatusBar.setBarStyle(statusBarStyle);
        StatusBar.setBackgroundColor(statusBgColor);
      }
    } catch (error) {
      console.log('In src/index.js, updateStatusBar error:', error);
    }
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

export const ShareRoot = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SafeAreaView style={cache('SI_shareSafeAreaView', { flex: 1, backgroundColor: 'transparent' })}>
          <Share />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
};

export default Root;
