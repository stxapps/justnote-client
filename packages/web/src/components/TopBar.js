import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { signIn } from '../actions';

import logoShort from '../images/logo-short.svg';

const TopBar = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const dispatch = useDispatch();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <nav className="relative flex items-center justify-between sm:h-10 md:justify-center" aria-label="Global">
        <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <span className="sr-only">Justnote</span>
              <img className="h-8 w-auto sm:h-10" src={logoShort} alt="" />
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              {!isUserSignedIn && <button onClick={() => dispatch(signIn())} type="button" className="bg-white rounded-md shadow px-4 py-2 border border-transparent text-base font-medium text-green-600 hover:text-green-500 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" id="main-menu" aria-haspopup="true">
                Sign in
              </button>}
            </div>
          </div>
        </div>
        <div className="hidden md:absolute md:flex md:items-center md:justify-end md:inset-y-0 md:right-0">
          {!isUserSignedIn && <button onClick={() => dispatch(signIn())} type="button" className="bg-white rounded-md shadow px-4 py-2 border border-transparent text-base font-medium text-green-600 hover:text-green-500 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" id="main-menu" aria-haspopup="true">
            Sign in
          </button>}
        </div>
      </nav>
    </div>
  );
};

export default React.memo(TopBar);
