import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

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
