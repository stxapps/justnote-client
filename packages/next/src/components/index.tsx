import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useSelector } from '../store';
import {
  getSafeAreaFrame, getSafeAreaInsets, getThemeMode, getTailwind,
} from '../selectors';
import { isFldStr } from '../utils';

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

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);

  // Make SSR and loading state have the same width to prevent rehydration error.
  let twWidth = 9999;
  if ([true, false].includes(isUserSignedIn) && isFldStr(href)) twWidth = safeAreaWidth;

  const tailwind = getTailwind(twWidth, themeMode);
  return tailwind;
};

export const useHash = () => {
  const pathname = usePathname();
  const [hash, setHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  useEffect(() => {
    setHash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return hash;
};
