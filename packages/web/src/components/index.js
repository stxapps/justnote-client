import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getThemeMode, getTailwind } from '../selectors';
import { isNumber, isMobile as _isMobile } from '../utils';

export const useSafeAreaFrame = () => {

  let windowWidth = useSelector(state => state.window.width);
  let windowHeight = useSelector(state => state.window.height);
  let visualWidth = useSelector(state => state.window.visualWidth);
  let visualHeight = useSelector(state => state.window.visualHeight);

  const isMobile = useMemo(() => _isMobile(), []);

  [windowWidth, windowHeight] = [Math.round(windowWidth), Math.round(windowHeight)];
  [visualWidth, visualHeight] = [Math.round(visualWidth), Math.round(visualHeight)];

  const width = isMobile && isNumber(visualWidth) ? visualWidth : windowWidth;
  const height = isMobile && isNumber(visualHeight) ? visualHeight : windowHeight;

  return {
    x: 0, y: 0, width, height, windowWidth, windowHeight, visualWidth, visualHeight,
  };
};

export const useStateWithLocalStorage = (defaultValue, localStorageKey) => {

  let item = /** @type {any} */(localStorage.getItem(localStorageKey));
  if (item === undefined || item === null) item = defaultValue;
  else item = JSON.parse(item);
  const [value, setValue] = useState(item);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(value));
  }, [localStorageKey, value]);

  return [value, setValue];
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = getTailwind(safeAreaWidth, themeMode);
  return tailwind;
};
