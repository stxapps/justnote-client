import React from 'react';
import Image from 'next/image';

import { useSelector } from '../store';
import { updatePopupUrlHash } from '../actions';
import { SIGN_IN_POPUP } from '../types/const';

import { useTailwind } from '.';
import Link from './CustomLink';

import logoShort from '../images/logo-short.svg';

const TopBar = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const tailwind = useTailwind();

  const onSignInBtnClick = () => {
    updatePopupUrlHash(SIGN_IN_POPUP, true);
  };

  return (
    <div className={tailwind('mx-auto max-w-7xl px-4 sm:px-6')}>
      <nav className={tailwind('relative flex items-center justify-between sm:h-10 md:justify-center')} aria-label="Global">
        <div className={tailwind('flex flex-1 items-center md:absolute md:inset-y-0 md:left-0')}>
          <div className={tailwind('flex w-full items-center justify-between md:w-auto')}>
            <Link className={tailwind('rounded-xs focus:outline-none focus:ring-2 focus:ring-gray-400')} href="/">
              <span className={tailwind('sr-only')}>Justnote</span>
              <Image className={tailwind('h-8 w-auto sm:h-10')} src={logoShort} alt="" />
            </Link>
            <div className={tailwind('-mr-2 flex items-center md:hidden')}>
              {!isUserSignedIn && <button onClick={onSignInBtnClick} type="button" className={tailwind('inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-green-600 shadow hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500')} aria-haspopup="true">
                Sign in
              </button>}
            </div>
          </div>
        </div>
        <div className={tailwind('hidden md:absolute md:inset-y-0 md:right-0 md:flex md:items-center md:justify-end')}>
          {!isUserSignedIn && <button onClick={onSignInBtnClick} type="button" className={tailwind('inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-green-600 shadow hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500')} aria-haspopup="true">
            Sign in
          </button>}
        </div>
      </nav>
    </div>
  );
};

export default React.memo(TopBar);
