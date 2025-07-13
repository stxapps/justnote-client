import { useState, useEffect, useRef } from 'react';
import { Dimensions, AppState, AppStateStatus, Keyboard } from 'react-native';
import {
  useSafeAreaFrame as useWindowFrame, useSafeAreaInsets as useScreenInsets,
} from 'react-native-safe-area-context';

import { useSelector } from '../store';
import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';
import { isObject, isNumber } from '../utils';

export const useSafeAreaFrame = () => {
  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  const safeAreaInsets = getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight,
    screenWidth, screenHeight, screenInsets,
  );

  return getSafeAreaFrame(windowWidth, windowHeight, safeAreaInsets);
};

export const useSafeAreaInsets = () => {
  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  return getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight,
    screenWidth, screenHeight, screenInsets,
  );
};

const getKbHt = () => {
  const kbMtx = Keyboard.metrics();
  if (isObject(kbMtx) && isNumber(kbMtx.height)) return kbMtx.height;
  return 0;
};
export const useKeyboardHeight = (enabled = true) => {
  const [height, setHeight] = useState(enabled ? getKbHt() : 0);
  const heightRef = useRef(height);

  useEffect(() => {
    if (!enabled) return;

    const chkAndSetHeight = (e) => {
      const newHeight = e.endCoordinates.height;
      if (heightRef.current !== newHeight) setHeight(newHeight);
      heightRef.current = newHeight;
    };
    const resetHeight = () => {
      if (heightRef.current !== 0) setHeight(0);
      heightRef.current = 0;
    };

    const willShowSub = Keyboard.addListener('keyboardWillShow', chkAndSetHeight);
    const didShowSub = Keyboard.addListener('keyboardDidShow', chkAndSetHeight);
    const willChgSub = Keyboard.addListener('keyboardWillChangeFrame', chkAndSetHeight);
    const didChgSub = Keyboard.addListener('keyboardDidChangeFrame', chkAndSetHeight);
    const willHideSub = Keyboard.addListener('keyboardWillHide', resetHeight);
    const didHideSub = Keyboard.addListener('keyboardDidHide', resetHeight);

    return () => {
      if (!enabled) return;
      willShowSub.remove();
      didShowSub.remove();
      willChgSub.remove();
      didChgSub.remove();
      willHideSub.remove();
      didHideSub.remove();
    };
  }, [enabled]);

  return height;
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = getTailwind(safeAreaWidth, themeMode);
  return tailwind;
};

export const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });

    return () => {
      sub.remove();
    };
  }, []);

  return appState;
};
