import React, { useState, useEffect, useMemo } from 'react';

import { APP_DOMAIN_NAME, BLOCKSTACK_AUTH } from '../types/const';
import { separateUrlAndParam } from '../utils';

const genAppBlockstackAuthUrl = () => {
  const url = window.location.href;
  const { param: { authResponse } } = separateUrlAndParam(url, 'authResponse');
  return APP_DOMAIN_NAME + BLOCKSTACK_AUTH + '?authResponse=' + authResponse;
}

const BlockstackAuth = () => {

  const [hasTimeout, setHasTimeout] = useState(false);
  const blockstackAuthUrl = useMemo(() => genAppBlockstackAuthUrl(), []);

  useEffect(() => {
    window.location.replace(blockstackAuthUrl);
    setTimeout(() => setHasTimeout(true), 3000);
  }, [blockstackAuthUrl]);

  return (
    <div className="px-4 bg-gray-200 min-h-screen md:px-6 lg:px-8">
      <section className="pt-12 pb-4">
        <div style={{ borderRadius: '1.5rem' }} className="mx-auto px-4 pt-8 pb-8 w-full max-w-md bg-white">
          <h1 className="text-2xl text-gray-900 font-semibold text-left sm:text-center">Justnote is processing...</h1>
          <div className={`mt-6 text-gray-700 text-left ${hasTimeout ? '' : 'hidden'}`}>
            <p>Normally, Justnote app should be open and process your authentication token automatically. If this page is still showing, please try manually <a className="underline focus:outline-none focus:ring-2 focus:ring-green-600" href={blockstackAuthUrl}>send the token to the app</a>.</p>
            <p className="mt-6">If the app still not open, please <span className="whitespace-nowrap">
              <a className="underline hover:text-black focus:outline-none focus:ring-2 focus:ring-green-600" href="/support">
                contact us
                <svg className="mb-2 inline-block w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
                  <path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
                </svg>
              </a>.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(BlockstackAuth);
