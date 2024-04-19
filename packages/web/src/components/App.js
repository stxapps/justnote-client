import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { init } from '../actions';
import {
  HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY, HASH_PRICING,
  HASH_SUPPORT,
} from '../types/const';
import { extractUrl } from '../utils';

import Loading from './Loading';
import Landing from './Landing';
import About from './About';
import Terms from './Terms';
import Privacy from './Privacy';
import Pricing from './Pricing';
import Support from './Support';
import ErrorBoundary from './ErrorBoundary';

// medium.com/hackernoon/lazy-loading-and-preloading-components-in-react-16-6-804de091c82d
// @ts-expect-error
const _Main = import('./Main');
const Main = React.lazy(() => _Main);

const App = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);
  const isHandlingSignIn = useSelector(state => state.display.isHandlingSignIn);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  if (isUserSignedIn === null || isHandlingSignIn) return <Loading />;

  const { pathname, hash } = extractUrl(href);
  if (pathname === '/about') return <About />;
  if (pathname === '/terms') return <Terms />;
  if (pathname === '/privacy') return <Privacy />;
  if (pathname === '/pricing') return <Pricing />;
  if (pathname === '/support') return <Support />;

  if (
    hash.startsWith(HASH_LANDING) || hash.startsWith(HASH_LANDING_MOBILE)
  ) return <Landing />;
  if (hash.startsWith(HASH_ABOUT)) return <About />;
  if (hash.startsWith(HASH_TERMS)) return <Terms />;
  if (hash.startsWith(HASH_PRIVACY)) return <Privacy />;
  if (hash.startsWith(HASH_PRICING)) return <Pricing />;
  if (hash.startsWith(HASH_SUPPORT)) return <Support />;

  if (isUserSignedIn === true) {
    return (
      <ErrorBoundary>
        <React.Suspense fallback={<Loading />}>
          <Main />
        </React.Suspense>
      </ErrorBoundary>
    );
  }

  return <Landing />;
};

export default React.memo(App);
