import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { tailwind } from '../stylesheets/tailwind';

export const useSafeAreaFrame = () => {

  const width = useSelector(state => state.window.width);
  const height = useSelector(state => state.window.height);

  return { x: 0, y: 0, width, height };
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

const getTwWrapper = createSelector(
  safeAreaWidth => safeAreaWidth,
  safeAreaWidth => {
    return (classStr) => {
      return tailwind(classStr, safeAreaWidth);
    };
  },
);

export const useTailwind = () => {
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const twWrapper = getTwWrapper(safeAreaWidth);
  return twWrapper;
};
