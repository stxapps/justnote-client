import { Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import {
  useSafeAreaFrame as useWindowFrame, useSafeAreaInsets as useScreenInsets,
} from 'react-native-safe-area-context';

import { getThemeMode, getTailwind } from '../selectors';

const getSafeAreaInsets = (
  windowX, windowY, windowWidth, windowHeight, screenWidth, screenHeight, screenInsets,
) => {
  const left = Math.max(screenInsets.left - windowX, 0);
  const top = Math.max(screenInsets.top - windowY, 0);
  const right = Math.max(
    (windowX + windowWidth) - (screenWidth - screenInsets.right), 0
  );
  const bottom = Math.max(
    (windowY + windowHeight) - (screenHeight - screenInsets.bottom), 0
  );
  return { left, top, right, bottom };
};

export const useSafeAreaFrame = () => {
  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  const safeAreaInsets = getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight, screenWidth, screenHeight, screenInsets,
  );

  const safeAreaX = windowX + safeAreaInsets.left;
  const safeAreaY = windowY + safeAreaInsets.top;
  const safeAreaWidth = windowWidth - safeAreaInsets.left - safeAreaInsets.right;
  const safeAreaHeight = windowHeight - safeAreaInsets.top - safeAreaInsets.bottom;

  return { x: safeAreaX, y: safeAreaY, width: safeAreaWidth, height: safeAreaHeight };
};

export const useSafeAreaInsets = () => {

  const {
    x: windowX, y: windowY, width: windowWidth, height: windowHeight,
  } = useWindowFrame();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
  const screenInsets = useScreenInsets();

  return getSafeAreaInsets(
    windowX, windowY, windowWidth, windowHeight, screenWidth, screenHeight, screenInsets,
  );
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = getTailwind(safeAreaWidth, themeMode);
  return tailwind;
};
