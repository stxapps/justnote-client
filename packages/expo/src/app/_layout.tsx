import React, { useEffect, useRef } from 'react';
import {
  Text, TextInput, Appearance, Platform, StatusBar as NativeStatusBar,
} from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Slot, useRouter, usePathname, ExternalPathString } from 'expo-router';
import { ShareIntentProvider } from 'expo-share-intent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'expo-dev-client';

import {
  makeStore, AppStore, useDispatch, useSelector,
} from '@/store';
import { bindAddNextActionRef } from '@/store-next';
import { init } from '@/actions';
import { handleAppStateChange } from '@/actions/piece';
import { useAppState } from '@/components';
import { BLK_MODE } from '@/types/const';
import { getThemeMode } from '@/selectors';
import cache from '@/utils/cache';

// @ts-expect-error
Text.defaultProps = Text.defaultProps || {};
// @ts-expect-error
Text.defaultProps.allowFontScaling = false;
// @ts-expect-error
TextInput.defaultProps = TextInput.defaultProps || {};
// @ts-expect-error
TextInput.defaultProps.allowFontScaling = false;

function Initializer() {
  const appState = useAppState();
  const pathname = usePathname();
  const prevAppState = useRef(null);
  const prevPathname = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  useEffect(() => {
    if (prevAppState.current === null || prevPathname.current === null) {
      prevAppState.current = appState;
      prevPathname.current = pathname;
      return;
    }
    if (appState !== prevAppState.current || pathname !== prevPathname.current) {
      dispatch(handleAppStateChange(appState, pathname));
    }
    prevAppState.current = appState;
    prevPathname.current = pathname;
  }, [appState, pathname, dispatch]);

  return null;
}

const InnerRoot = () => {
  const statusBarStyleCount = useSelector(
    state => state.display.updateStatusBarStyleCount
  );
  const themeMode = useSelector(state => getThemeMode(state));

  useEffect(() => {
    Appearance.setColorScheme(themeMode === BLK_MODE ? 'dark' : 'light');
    if (Platform.OS === 'ios') {
      const barStyle = themeMode === BLK_MODE ? 'light-content' : 'dark-content';
      NativeStatusBar.setBarStyle(barStyle);
    }
    if (Platform.OS === 'android') NavigationBar.setStyle('auto');
  }, [statusBarStyleCount, themeMode]);

  const bgColor = themeMode === BLK_MODE ? 'rgb(17, 24, 39)' : 'white';

  return (
    <SafeAreaView style={cache('SI_safeAreaView', { flex: 1, backgroundColor: bgColor }, [bgColor])}>
      <Slot />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default function Root() {
  const router = useRouter();
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    const { store, addNextAction } = makeStore();
    storeRef.current = store;
    bindAddNextActionRef(addNextAction);
  }

  return (
    <ShareIntentProvider
      options={{
        debug: false,
        resetOnBackground: false,
        onResetShareIntent: () => router.replace('/' as ExternalPathString),
      }}
    >
      <ReduxProvider store={storeRef.current}>
        <Initializer />
        <KeyboardProvider>
          <InnerRoot />
        </KeyboardProvider>
      </ReduxProvider>
    </ShareIntentProvider>
  );
}
