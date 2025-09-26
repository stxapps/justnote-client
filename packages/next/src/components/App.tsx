'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Url from 'url-parse';

import { useSelector } from '../store';
import {
  HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY, HASH_PRICING,
  HASH_SUPPORT, APP_RENDER_LOADING, APP_RENDER_LANDING, APP_RENDER_ABOUT,
  APP_RENDER_TERMS, APP_RENDER_PRIVACY, APP_RENDER_PRICING, APP_RENDER_SUPPORT,
  APP_RENDER_MAIN,
} from '../types/const';
import { isFldStr } from '../utils';

import Loading from './Loading';
import Landing from './Landing';

const AppChunk = dynamic(
  () => import('./AppChunk'),
  { ssr: false, loading: () => <Loading /> },
);

const getType = (isUserSignedIn, href, isHandlingSignIn) => {
  if (
    ![true, false].includes(isUserSignedIn) ||
    !isFldStr(href) ||
    isHandlingSignIn
  ) {
    return APP_RENDER_LOADING;
  }

  const hrefObj = new Url(href);
  if (
    hrefObj.hash.startsWith(HASH_LANDING) ||
    hrefObj.hash.startsWith(HASH_LANDING_MOBILE)
  ) return APP_RENDER_LANDING;
  if (hrefObj.hash.startsWith(HASH_ABOUT)) return APP_RENDER_ABOUT;
  if (hrefObj.hash.startsWith(HASH_TERMS)) return APP_RENDER_TERMS;
  if (hrefObj.hash.startsWith(HASH_PRIVACY)) return APP_RENDER_PRIVACY;
  if (hrefObj.hash.startsWith(HASH_PRICING)) return APP_RENDER_PRICING;
  if (hrefObj.hash.startsWith(HASH_SUPPORT)) return APP_RENDER_SUPPORT;

  if (isUserSignedIn === true) return APP_RENDER_MAIN;

  return APP_RENDER_LANDING;
};

const App = () => {
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);
  const isHandlingSignIn = useSelector(state => state.display.isHandlingSignIn);

  const type = getType(isUserSignedIn, href, isHandlingSignIn);

  if (type === APP_RENDER_LOADING) return <Loading />;
  else if (type === APP_RENDER_LANDING) return <Landing />;

  return <AppChunk type={type} />;
};

export default React.memo(App);
