'use client';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { useSelector, useDispatch } from '../store';
import { updatePopup, linkTo } from '../actions';
import { updateSettingsPopup, updateSettingsViewId } from '../actions/chunk';
import { SIGN_UP_POPUP, SETTINGS_VIEW_IAP } from '../types/const';
import { getValidPurchase } from '../selectors';
import { isObject } from '../utils';

import { useTailwind } from '.';
import TopBar from './TopBar';
import Footer from './Footer';
import Link from './CustomLink';

const SignUpPopup = dynamic(() => import('./SignUpPopup'), { ssr: false });
const SignInPopup = dynamic(() => import('./SignInPopup'), { ssr: false });

const Pricing = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const purchase = useSelector(state => getValidPurchase(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();
  const router = useRouter();

  const onGetStartedBtnClick = () => {
    if (isUserSignedIn) {
      dispatch(linkTo(router, '/'));
      dispatch(updateSettingsViewId(SETTINGS_VIEW_IAP, false));
      dispatch(updateSettingsPopup(true));
      return;
    }

    dispatch(updatePopup(SIGN_UP_POPUP, true));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  let btnText = 'Get Started';
  if (isUserSignedIn) btnText = isObject(purchase) ? 'View' : 'Subscribe';

  return (
    <React.Fragment>
      <div className={tailwind('bg-white pt-6')}>
        <TopBar />
        <div className={tailwind('mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8')}>
          <div className={tailwind('')}>
            <h1 className={tailwind('mt-2 text-center text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl')}>Pricing</h1>
            <p className={tailwind('mt-5 text-center text-base text-gray-500')}>One simple no-tricks subscription plan to unlock all extra features</p>
          </div>
          <div className={tailwind('pt-12 md:flex md:items-center')}>
            <div className={tailwind('')}>
              <p className={tailwind('leading-7 text-gray-500')}>Justnote is free, and we offer a paid subscription for using extra features. It&apos;s our intention to never show advertisements, and we don&apos;t rent, sell, or share your information with other companies. Our optional paid subscription is the only way we make money.</p>
              <p className={tailwind('pt-6 leading-7 text-gray-500')}>Please support us and unlock all extra features:</p>
              <div className={tailwind('pt-3 lg:flex lg:justify-between lg:pt-5')}>
                <div className={tailwind('flex lg:w-44')}>
                  <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                  </svg>
                  <span className={tailwind('ml-3 font-medium text-gray-500')}>Tags</span>
                </div>
                <div className={tailwind('flex pt-2 lg:w-48 lg:pt-0')}>
                  <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                  </svg>
                  <span className={tailwind('ml-3 font-medium text-gray-500')}>Lock lists & notes</span>
                </div>
                <div className={tailwind('flex pt-2 lg:w-44 lg:pt-0')}>
                  <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                  </svg>
                  <span className={tailwind('ml-3 font-medium text-gray-500')}>More font sizes</span>
                </div>
              </div>
              <div className={tailwind('lg:flex lg:justify-between lg:pt-5')}>
                <div className={tailwind('flex pt-2 lg:w-44 lg:pt-0')}>
                  <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                  </svg>
                  <span className={tailwind('ml-3 font-medium text-gray-500')}>Dark appearance</span>
                </div>
                <div className={tailwind('flex pt-2 lg:w-48 lg:pt-0')}>
                  <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                  </svg>
                  <span className={tailwind('ml-3 font-medium text-gray-500')}>Custom date format</span>
                </div>
                <div className={tailwind('flex pt-2 lg:w-44 lg:pt-0')}>
                  <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                  </svg>
                  <span className={tailwind('ml-3 font-medium text-gray-500')}>Section by month</span>
                </div>
              </div>
              <div className={tailwind('lg:flex lg:justify-start lg:pt-5')}>
                <div className={tailwind('flex pt-2 lg:pt-0')}>
                  <svg className={tailwind('h-6 w-5 flex-none text-green-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"></path>
                  </svg>
                  <span className={tailwind('ml-3 font-medium text-gray-500')}>Pin to the top</span>
                </div>
              </div>
            </div>
            <div style={{ borderRadius: '0.75rem' }} className={tailwind('mx-auto mt-10 max-w-sm bg-gray-100 p-4 md:mt-0 md:ml-8 md:max-w-xs md:flex-shrink-0')}>
              <p className={tailwind('text-center text-gray-500')}>Start with a 14-day free trial.</p>
              <p className={tailwind('mt-6 flex items-baseline justify-center gap-x-2')}>
                <span className={tailwind('text-5xl font-bold tracking-tight text-gray-900')}>$4.99</span>
                <span className={tailwind('text-xl font-semibold leading-6 tracking-wide text-gray-600')}>/ year</span>
              </p>
              <div className={tailwind('flex items-center justify-center')}>
                <button onClick={onGetStartedBtnClick} className={tailwind('mt-6 flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 md:text-lg')}>
                  {btnText}
                  <svg className={tailwind('ml-2 w-1.5')} viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
                  </svg>
                </button>
              </div>
              <p className={tailwind('mt-6 text-center text-sm leading-relaxed text-gray-500')}>Final price may vary based on current exchange rates and taxes at checkout.</p>
            </div>
          </div>
          <div className={tailwind('pt-12 text-right text-gray-500')}>
            <Link className={tailwind('group mt-2 inline-block rounded-xs hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1')} href="/">
              <span className={tailwind('pl-0.5')}>Go home</span>
              <svg className={tailwind('mb-1 ml-1 inline-block w-5')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.7071 2.29289C10.3166 1.90237 9.68342 1.90237 9.29289 2.29289L2.29289 9.29289C1.90237 9.68342 1.90237 10.3166 2.29289 10.7071C2.68342 11.0976 3.31658 11.0976 3.70711 10.7071L4 10.4142V17C4 17.5523 4.44772 18 5 18H7C7.55228 18 8 17.5523 8 17V15C8 14.4477 8.44772 14 9 14H11C11.5523 14 12 14.4477 12 15V17C12 17.5523 12.4477 18 13 18H15C15.5523 18 16 17.5523 16 17V10.4142L16.2929 10.7071C16.6834 11.0976 17.3166 11.0976 17.7071 10.7071C18.0976 10.3166 18.0976 9.68342 17.7071 9.29289L10.7071 2.29289Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <SignUpPopup />
      <SignInPopup />
    </React.Fragment>
  );
};

export default React.memo(Pricing);
