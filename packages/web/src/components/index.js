import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';

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

export const useSafeAreaFrame = () => {
  return useSelector(state => getSafeAreaFrame(state));
};

export const useSafeAreaInsets = () => {
  return useSelector(state => getSafeAreaInsets(state));
};

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = getTailwind(safeAreaWidth, themeMode);
  return tailwind;
};
