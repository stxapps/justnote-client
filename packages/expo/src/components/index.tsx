import { useState, useEffect } from 'react';
import { Dimensions, AppState, AppStateStatus } from 'react-native';
import {
  useSafeAreaFrame as useWindowFrame, useSafeAreaInsets as useScreenInsets,
} from 'react-native-safe-area-context';

import { useSelector } from '../store';
import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';

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
