import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LazyMotion, domAnimation } from 'framer-motion';

import { init } from '../actions';
import {
  HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY, HASH_PRICING,
  HASH_SUPPORT, APP_RENDER_LOADING, APP_RENDER_LANDING, APP_RENDER_ABOUT,
  APP_RENDER_TERMS, APP_RENDER_PRIVACY, APP_RENDER_PRICING, APP_RENDER_SUPPORT,
  APP_RENDER_MAIN,
} from '../types/const';
import { extractUrl } from '../utils';

import Loading from './Loading';
import Landing from './Landing';
import ErrorBoundary from './ErrorBoundary';

// medium.com/hackernoon/lazy-loading-and-preloading-components-in-react-16-6-804de091c82d
// @ts-expect-error
const _AppChunk = import('./AppChunk');
const AppChunk = React.lazy(() => _AppChunk);

const getType = (isUserSignedIn, href, isHandlingSignIn) => {
  if (isUserSignedIn === null || isHandlingSignIn) return APP_RENDER_LOADING;

  const { pathname, hash } = extractUrl(href);
  if (pathname === '/about') return APP_RENDER_ABOUT;
  if (pathname === '/terms') return APP_RENDER_TERMS;
  if (pathname === '/privacy') return APP_RENDER_PRIVACY;
  if (pathname === '/pricing') return APP_RENDER_PRICING;
  if (pathname === '/support') return APP_RENDER_SUPPORT;

  if (
    hash.startsWith(HASH_LANDING) || hash.startsWith(HASH_LANDING_MOBILE)
  ) return APP_RENDER_LANDING;
  if (hash.startsWith(HASH_ABOUT)) return APP_RENDER_ABOUT;
  if (hash.startsWith(HASH_TERMS)) return APP_RENDER_TERMS;
  if (hash.startsWith(HASH_PRIVACY)) return APP_RENDER_PRIVACY;
  if (hash.startsWith(HASH_PRICING)) return APP_RENDER_PRICING;
  if (hash.startsWith(HASH_SUPPORT)) return APP_RENDER_SUPPORT;

  if (isUserSignedIn === true) return APP_RENDER_MAIN;

  return APP_RENDER_LANDING;
};

const App = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);
  const isHandlingSignIn = useSelector(state => state.display.isHandlingSignIn);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  const type = getType(isUserSignedIn, href, isHandlingSignIn);

  let component;
  if (type === APP_RENDER_LOADING) component = <Loading />;
  else if (type === APP_RENDER_LANDING) component = <Landing />;
  if (component) {
    return (
      <LazyMotion features={domAnimation} strict={true}>
        {component}
      </LazyMotion>
    );
  }

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<Loading />}>
        <AppChunk />
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default React.memo(App);
