import React, { useEffect, useRef } from 'react';
import { Text, TextInput, Appearance, Keyboard } from 'react-native';
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
import vars from '@/vars';

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
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);
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

  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', (e) => {
      vars.keyboard.height = e.endCoordinates.height;
    });
    keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', () => {
      vars.keyboard.height = 0;
    });

    return () => {
      keyboardDidShowListener.current.remove();
      keyboardDidHideListener.current.remove();
    };
  }, []);

  return null;
}

const getBgColor = (themeMode) => {
  return themeMode === BLK_MODE ? 'rgb(17, 24, 39)' : 'white';
};

const InnerRoot = () => {
  const themeMode = useSelector(state => getThemeMode(state));
  const bgColor = getBgColor(themeMode);

  useEffect(() => {
    // TODO: Check esp. on iOS
    //   Do need to force when app state is active, keyboard show and hide?
    //   also when share, pick a file.
    //   still need increaseUpdateStatusBarStyleCount?
    Appearance.setColorScheme(themeMode === BLK_MODE ? 'dark' : 'light');
    NavigationBar.setStyle('auto');
  }, [themeMode]);

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
        debug: true,
        resetOnBackground: true,
        onResetShareIntent: () =>
          // used when app going in background and when the reset button is pressed
          router.replace('/' as ExternalPathString),
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
