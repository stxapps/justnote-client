import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup, refreshFetched } from '../actions';
import { HASH_SUPPORT, STALE_ERROR_POPUP } from '../types/const';

import { useTailwind } from '.';

const StaleErrorPopup = () => {

  const isShown = useSelector(state => state.display.isStaleErrorPopupShown);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onRefreshBtnClick = () => {
    if (didClick.current) return;
    dispatch(refreshFetched());
    didClick.current = true;
  };

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(STALE_ERROR_POPUP, false));
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [isShown]);

  if (!isShown) return null;

  return (
    <div className={tailwind('fixed inset-x-0 top-14 flex items-start justify-center md:top-0')}>
      <div className={tailwind('relative m-4 max-w-[26rem] rounded-md bg-red-50 p-4 shadow-lg')}>
        <div className={tailwind('flex')}>
          <div className={tailwind('flex-shrink-0')}>
            <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={tailwind('ml-3 lg:mt-0.5')}>
            <h3 className={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Your notes are out of date!</h3>
            <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please refresh to update your notes to the latest version. Save your changes before. And if the problem persists, please <a className={tailwind('rounded underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
            <div className={tailwind('mt-4')}>
              <div className={tailwind('-mx-2 -my-1.5 flex')}>
                <button onClick={onRefreshBtnClick} className={tailwind('rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 transition duration-150 ease-in-out hover:bg-red-100 focus:bg-red-100 focus:outline-none')}>Refresh</button>
              </div>
            </div>
          </div>
        </div>
        <button onClick={onCloseBtnClick} className={tailwind('absolute top-1 right-1 rounded-md bg-red-50 p-1 hover:bg-red-100 focus:bg-red-100 focus:outline-none')} type="button">
          <span className={tailwind('sr-only')}>Dismiss</span>
          <svg className={tailwind('h-5 w-5 text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(StaleErrorPopup);
