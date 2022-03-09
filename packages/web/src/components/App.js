import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Url from 'url-parse';

import { init } from '../actions';
import {
  HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY, HASH_SUPPORT,
} from '../types/const';
import { extractUrl } from '../utils';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';
import About from './About';
import Terms from './Terms';
import Privacy from './Privacy';
import Support from './Support';

const App = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);
  const isHandlingSignIn = useSelector(state => state.display.isHandlingSignIn);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  if (isUserSignedIn === null || isHandlingSignIn) return <Loading />;

  const { pathname } = extractUrl(href);
  if (pathname === '/about') return <About />;
  if (pathname === '/terms') return <Terms />;
  if (pathname === '/privacy') return <Privacy />;
  if (pathname === '/support') return <Support />;

  const hrefObj = new Url(href, {});
  if (
    hrefObj.hash === HASH_LANDING || hrefObj.hash === HASH_LANDING_MOBILE
  ) return <Landing />;
  if (hrefObj.hash === HASH_ABOUT) return <About />;
  if (hrefObj.hash === HASH_TERMS) return <Terms />;
  if (hrefObj.hash === HASH_PRIVACY) return <Privacy />;
  if (hrefObj.hash === HASH_SUPPORT) return <Support />;

  if (isUserSignedIn === true) return <Main />;

  return <Landing />;
};

export default React.memo(App);
