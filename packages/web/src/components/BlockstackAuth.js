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
    <div className="mx-auto px-4 pt-20 w-full max-w-md min-h-screen md:px-6 lg:px-8">
      <h1 className="text-lg text-gray-800 font-medium text-center">Justnote is processing...</h1>
      <div className={`mt-6 text-gray-500 text-left ${hasTimeout ? '' : 'hidden'} sm:text-center`}>
        <p>Normally, it would take just a few seconds to process your sign up/sign in request.</p>
        <p className="mt-4">If this page is still showing, please click <a className="text-gray-900 font-medium underline rounded-sm focus:outline-none focus:ring" href={blockstackAuthUrl}>here</a>.</p>
      </div>
    </div>
  );
};

export default React.memo(BlockstackAuth);
