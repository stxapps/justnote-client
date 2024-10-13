//import './wdyr';

import React, { useState, useEffect } from 'react';
import { Text, TextInput, Platform, StatusBar } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { legacy_createStore as createStore, compose } from 'redux';
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
  enhancers = compose(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
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

/**
 * @return {'light-content'|'dark-content'}
 */
const getStBarStyle = (themeMode) => {
  return themeMode === BLK_MODE ? 'light-content' : 'dark-content';
};

const getNavBarStyle = (themeMode) => {
  return themeMode === BLK_MODE ? 'light' : 'dark';
};

const getBgColor = (themeMode) => {
  return themeMode === BLK_MODE ? 'rgb(17, 24, 39)' : 'white';
};

const updateAndroidStyle = async (themeMode) => {
  if (Platform.OS !== 'android') return;

  const navBarStyle = getNavBarStyle(themeMode);
  const navBgColor = getBgColor(themeMode);
  const appBgColor = getBgColor(themeMode);

  try {
    await SystemNavigationBar.setNavigationColor(
      navBgColor, navBarStyle, 'navigation'
    );
    await setAppBackground(appBgColor);
  } catch (error) {
    console.log('In src/index.js, updateAndroidStyle error:', error);
  }
};

const _Root = () => {
  const themeMode = useSelector(state => getThemeMode(state));
  const [stBarStyle, setStBarStyle] = useState(getStBarStyle(themeMode));
  const [bgColor, setBgColor] = useState(getBgColor(themeMode));

  useEffect(() => {
    setStBarStyle(getStBarStyle(themeMode));
    setBgColor(getBgColor(themeMode));

    updateAndroidStyle(themeMode);
  }, [themeMode]);

  return (
    <SafeAreaView style={cache('SI_safeAreaView', { flex: 1, backgroundColor: bgColor }, [bgColor])}>
      <StatusBar barStyle={stBarStyle} backgroundColor={bgColor} />
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
