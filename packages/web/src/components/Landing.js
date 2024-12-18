import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Url from 'url-parse';

import { updatePopupUrlHash } from '../actions';
import {
  HASH_FRAGMENT_IDENTIFIER, HASH_LANDING_MOBILE, SIGN_UP_POPUP, SM_WIDTH, MD_WIDTH,
} from '../types/const';
import { extractUrl, urlHashToObj, isNumber, getOffsetTop } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';
import TopBar from './TopBar';
import Footer from './Footer';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';

import logoFull from '../images/logo-full.svg';

import mainDesktopInDarkChrome from '../images/main-desktop-in-dark-chrome.png';
import ubiquitous from '../images/ubiquitous.png';

import availableOnPlayStore from '../images/available-on-play-store.svg';
import availableOnAppStore from '../images/available-on-app-store.svg';

import kindWordsAW from '../images/kind_words_alin_wanderlust.png';
import kindWordsDH from '../images/kind_words_daniel_holenstein.jpg';
import kindWordsII from '../images/kind_words_infinite_insights.jpg';
import kindWordsJW from '../images/kind_words_john_whitham.jpg';
import kindWordsKP from '../images/kind_words_krishna_pandit.jpg';
import kindWordsM from '../images/kind_words_meme.jpg';

import creator from '../images/creator.png';

const Landing = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const href = useSelector(state => state.window.href);
  const ubiquitousSection = useRef(null);
  const safeAreaWidthRef = useRef(safeAreaWidth);
  const tailwind = useTailwind();

  const hashId = useMemo(() => {
    const { hash } = extractUrl(href);
    const obj = urlHashToObj(hash);
    return obj[HASH_FRAGMENT_IDENTIFIER];
  }, [href]);

  const onSignUpBtnClick = () => {
    if (isUserSignedIn) {
      const urlObj = new Url(window.location.href, {});
      urlObj.set('pathname', '/');
      urlObj.set('hash', '');
      window.location.href = urlObj.toString();
      return;
    }

    updatePopupUrlHash(SIGN_UP_POPUP, true);
  };

  useEffect(() => {
    safeAreaWidthRef.current = safeAreaWidth;
  }, [safeAreaWidth]);

  useEffect(() => {
    if (hashId === HASH_LANDING_MOBILE) {
      setTimeout(() => {
        if (ubiquitousSection.current) {
          const top = getOffsetTop(ubiquitousSection.current);
          if (isNumber(top)) {
            let mt = 16;
            if (safeAreaWidthRef.current >= SM_WIDTH) mt = 0;
            if (safeAreaWidthRef.current >= MD_WIDTH) mt = 80;
            window.scrollTo(0, Math.max(top - mt, 0));
          }
        }
      }, 100);
      return;
    }

    window.scrollTo(0, 0);
  }, [hashId]);

  return (
    <React.Fragment>
      <div className={tailwind('bg-gray-50')}>
        <div className={tailwind('relative overflow-hidden')}>
          <div className={tailwind('absolute inset-y-0 h-full w-full')} aria-hidden="true">
            <div className={tailwind('relative h-full')}>
              <svg className={tailwind('absolute right-full translate-y-1/3 translate-x-1/4 transform sm:translate-x-1/2 md:translate-y-1/2 lg:translate-x-full')} width="404" height="784" fill="none" viewBox="0 0 404 784">
                <defs>
                  <pattern id="e229dbec-10e9-49ee-8ec3-0286ca089edf" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className={tailwind('text-gray-200')} fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="784" fill="url(#e229dbec-10e9-49ee-8ec3-0286ca089edf)" />
              </svg>
              <svg className={tailwind('absolute left-full -translate-y-3/4 -translate-x-1/4 transform sm:-translate-x-1/2 md:-translate-y-1/2 lg:-translate-x-3/4')} width="404" height="784" fill="none" viewBox="0 0 404 784">
                <defs>
                  <pattern id="d2a68204-c383-44b1-b99f-42ccff4e5365" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className={tailwind('text-gray-200')} fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="784" fill="url(#d2a68204-c383-44b1-b99f-42ccff4e5365)" />
              </svg>
            </div>
          </div>
          <div className={tailwind('relative pt-6 pb-16 sm:pb-24')}>
            <TopBar />
            <div className={tailwind('mx-auto mt-16 max-w-7xl px-4 sm:mt-24 sm:px-6')}>
              <div className={tailwind('text-center')}>
                <h1 className={tailwind('text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl')}>
                  <span className={tailwind('block')}>A <span className={tailwind('text-green-600')}>privacy-focused</span> note-taking app</span>
                </h1>
                <p className={tailwind('mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl')}>Justnote is a privacy-focused note-taking app that you can use easily, take notes rapidly, and, importantly, truly own your account and data.</p>
                <div className={tailwind('mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8')}>
                  <button onClick={onSignUpBtnClick} className={tailwind('flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-8 py-3 text-base font-medium text-white shadow hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 sm:w-max md:py-4 md:px-10 md:text-lg')}>
                    Get started
                    <svg style={{ marginTop: '0.125rem' }} className={tailwind('ml-2 w-1.5')} viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={tailwind('relative')}>
            <div className={tailwind('absolute inset-0 flex flex-col')} aria-hidden="true">
              <div className={tailwind('flex-1')} />
              <div className={tailwind('w-full flex-1 bg-gray-800')} />
            </div>
            <div className={tailwind('relative mx-auto max-w-4xl px-4 sm:px-6')}>
              <img className={tailwind('mx-auto rounded-lg shadow-lg')} src={mainDesktopInDarkChrome} srcSet={`${mainDesktopInDarkChrome} 1x, https://justnote.cc/static/media/main-desktop-in-dark-chrome@2x.2680806c7ba525189099.png 2x, https://justnote.cc/static/media/main-desktop-in-dark-chrome@3x.a7c1d62c03c69d6d5b13.png 3x`} alt="App screenshot" />
            </div>
          </div>
        </div>
        <div className={tailwind('bg-gray-800')}>
          <div className={tailwind('mx-auto max-w-7xl py-16 px-4 pb-0 sm:py-24 sm:px-6 sm:pb-0 lg:px-8')} />
        </div>
      </div>
      <div className={tailwind('overflow-hidden bg-white')}>
        <div className={tailwind('relative mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:px-8')}>
          <div className={tailwind('relative lg:grid lg:grid-cols-3 lg:gap-x-8')}>
            <div className={tailwind('lg:col-span-1')}>
              <h2 className={tailwind('text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl')}>A better way to take notes</h2>
            </div>
            <div className={tailwind('mt-10 space-y-10 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 sm:space-y-0 lg:col-span-2 lg:mt-0')}>
              <div>
                <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-green-500 text-white')}>
                  <svg className={tailwind('h-6 w-6 text-white')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.59998 4.79998C3.59998 4.48172 3.7264 4.17649 3.95145 3.95145C4.17649 3.7264 4.48172 3.59998 4.79998 3.59998H19.2C19.5182 3.59998 19.8235 3.7264 20.0485 3.95145C20.2735 4.17649 20.4 4.48172 20.4 4.79998V7.19998C20.4 7.51824 20.2735 7.82346 20.0485 8.0485C19.8235 8.27355 19.5182 8.39998 19.2 8.39998H4.79998C4.48172 8.39998 4.17649 8.27355 3.95145 8.0485C3.7264 7.82346 3.59998 7.51824 3.59998 7.19998V4.79998ZM3.59998 12C3.59998 11.6817 3.7264 11.3765 3.95145 11.1514C4.17649 10.9264 4.48172 10.8 4.79998 10.8H12C12.3182 10.8 12.6235 10.9264 12.8485 11.1514C13.0735 11.3765 13.2 11.6817 13.2 12V19.2C13.2 19.5182 13.0735 19.8235 12.8485 20.0485C12.6235 20.2735 12.3182 20.4 12 20.4H4.79998C4.48172 20.4 4.17649 20.2735 3.95145 20.0485C3.7264 19.8235 3.59998 19.5182 3.59998 19.2V12ZM16.8 10.8C16.4817 10.8 16.1765 10.9264 15.9514 11.1514C15.7264 11.3765 15.6 11.6817 15.6 12V19.2C15.6 19.5182 15.7264 19.8235 15.9514 20.0485C16.1765 20.2735 16.4817 20.4 16.8 20.4H19.2C19.5182 20.4 19.8235 20.2735 20.0485 20.0485C20.2735 19.8235 20.4 19.5182 20.4 19.2V12C20.4 11.6817 20.2735 11.3765 20.0485 11.1514C19.8235 10.9264 19.5182 10.8 19.2 10.8H16.8Z" />
                  </svg>
                </div>
                <div className={tailwind('mt-5')}>
                  <h3 className={tailwind('text-lg font-medium leading-6 text-gray-900')}>Simple</h3>
                  <p className={tailwind('mt-2 text-base text-gray-500')}>Justnote is a simple note-taking app, yet powerful enough. Our WYSIWYG-rich text editor has features like bold, underline, font color, and background color.</p>
                </div>
              </div>
              <div>
                <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-green-500 text-white')}>
                  <svg className={tailwind('h-6 w-6')} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.6 8.40002H8.39999V15.6H15.6V8.40002Z" fill="white" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.4 2.39995C8.4 2.08169 8.52643 1.77647 8.75147 1.55142C8.97651 1.32638 9.28174 1.19995 9.6 1.19995C9.91826 1.19995 10.2235 1.32638 10.4485 1.55142C10.6736 1.77647 10.8 2.08169 10.8 2.39995V3.59995H13.2V2.39995C13.2 2.08169 13.3264 1.77647 13.5515 1.55142C13.7765 1.32638 14.0817 1.19995 14.4 1.19995C14.7183 1.19995 15.0235 1.32638 15.2485 1.55142C15.4736 1.77647 15.6 2.08169 15.6 2.39995V3.59995H18C18.6365 3.59995 19.247 3.85281 19.6971 4.30289C20.1471 4.75298 20.4 5.36343 20.4 5.99995V8.39995H21.6C21.9183 8.39995 22.2235 8.52638 22.4485 8.75142C22.6736 8.97647 22.8 9.28169 22.8 9.59995C22.8 9.91821 22.6736 10.2234 22.4485 10.4485C22.2235 10.6735 21.9183 10.8 21.6 10.8H20.4V13.2H21.6C21.9183 13.2 22.2235 13.3264 22.4485 13.5514C22.6736 13.7765 22.8 14.0817 22.8 14.4C22.8 14.7182 22.6736 15.0234 22.4485 15.2485C22.2235 15.4735 21.9183 15.6 21.6 15.6H20.4V18C20.4 18.6365 20.1471 19.2469 19.6971 19.697C19.247 20.1471 18.6365 20.4 18 20.4H15.6V21.6C15.6 21.9182 15.4736 22.2234 15.2485 22.4485C15.0235 22.6735 14.7183 22.8 14.4 22.8C14.0817 22.8 13.7765 22.6735 13.5515 22.4485C13.3264 22.2234 13.2 21.9182 13.2 21.6V20.4H10.8V21.6C10.8 21.9182 10.6736 22.2234 10.4485 22.4485C10.2235 22.6735 9.91826 22.8 9.6 22.8C9.28174 22.8 8.97651 22.6735 8.75147 22.4485C8.52643 22.2234 8.4 21.9182 8.4 21.6V20.4H6C5.36348 20.4 4.75303 20.1471 4.30294 19.697C3.85285 19.2469 3.6 18.6365 3.6 18V15.6H2.4C2.08174 15.6 1.77651 15.4735 1.55147 15.2485C1.32643 15.0234 1.2 14.7182 1.2 14.4C1.2 14.0817 1.32643 13.7765 1.55147 13.5514C1.77651 13.3264 2.08174 13.2 2.4 13.2H3.6V10.8H2.4C2.08174 10.8 1.77651 10.6735 1.55147 10.4485C1.32643 10.2234 1.2 9.91821 1.2 9.59995C1.2 9.28169 1.32643 8.97647 1.55147 8.75142C1.77651 8.52638 2.08174 8.39995 2.4 8.39995H3.6V5.99995C3.6 5.36343 3.85285 4.75298 4.30294 4.30289C4.75303 3.85281 5.36348 3.59995 6 3.59995H8.4V2.39995ZM6 5.99995H18V18H6V5.99995Z" fill="white" />
                  </svg>
                </div>
                <div className={tailwind('mt-5')}>
                  <h3 className={tailwind('text-lg font-medium leading-6 text-gray-900')}>Fast</h3>
                  <p className={tailwind('mt-2 text-base text-gray-500')}>You can take notes easily and quickly. Justnote is your quick note-taking app for your to-do lists, reminders, shopping lists, memos, thoughts, etc.</p>
                </div>
              </div>
              <div>
                <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-green-500 text-white')}>
                  <svg className={tailwind('h-6 w-6')} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.083 9H6.029C6.118 7.454 6.412 6.03 6.866 4.882C6.13501 5.32992 5.50842 5.92919 5.02838 6.6395C4.54834 7.34982 4.22598 8.1547 4.083 9ZM10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2ZM10 4C9.924 4 9.768 4.032 9.535 4.262C9.297 4.496 9.038 4.885 8.798 5.444C8.409 6.351 8.125 7.586 8.032 9H11.968C11.875 7.586 11.591 6.351 11.202 5.444C10.962 4.884 10.702 4.496 10.465 4.262C10.232 4.032 10.076 4 10 4ZM13.971 9C13.882 7.454 13.588 6.03 13.134 4.882C13.865 5.32992 14.4916 5.92919 14.9716 6.6395C15.4517 7.34982 15.774 8.1547 15.917 9H13.971ZM11.968 11H8.032C8.125 12.414 8.409 13.649 8.798 14.556C9.038 15.116 9.298 15.504 9.535 15.738C9.768 15.968 9.924 16 10 16C10.076 16 10.232 15.968 10.465 15.738C10.703 15.504 10.963 15.115 11.202 14.556C11.591 13.649 11.875 12.414 11.968 11ZM13.134 15.118C13.588 13.971 13.882 12.546 13.971 11H15.917C15.774 11.8453 15.4517 12.6502 14.9716 13.3605C14.4916 14.0708 13.865 14.6701 13.134 15.118ZM6.866 15.118C6.412 13.97 6.118 12.546 6.03 11H4.083C4.22598 11.8453 4.54834 12.6502 5.02838 13.3605C5.50842 14.0708 6.13501 14.6701 6.866 15.118Z" fill="white" />
                  </svg>
                </div>
                <div className={tailwind('mt-5')}>
                  <h3 className={tailwind('text-lg font-medium leading-6 text-gray-900')}>Ubiquitous</h3>
                  <p className={tailwind('mt-2 text-base text-gray-500')}>Justnote is available on the web, iOS, and Android. You can use Justnote on any of your devices. All your notes are synced across your devices automatically.</p>
                </div>
              </div>
              <div>
                <div className={tailwind('flex h-12 w-12 items-center justify-center rounded-md bg-green-500 text-white')}>
                  <svg className={tailwind('h-6 w-6')} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.59919 5.99876C6.07336 5.95556 9.41377 4.65292 12 2.33276C14.586 4.65335 17.9265 5.95643 21.4008 5.99996C21.5328 6.77996 21.6 7.58396 21.6 8.40116C21.6 14.6712 17.592 20.0052 12 21.9816C6.40799 20.004 2.39999 14.67 2.39999 8.39996C2.39999 7.58156 2.46839 6.77996 2.59919 5.99876ZM16.4484 10.4484C16.667 10.222 16.7879 9.91892 16.7852 9.60428C16.7825 9.28965 16.6563 8.98867 16.4338 8.76618C16.2113 8.54369 15.9103 8.41749 15.5957 8.41476C15.281 8.41202 14.9779 8.53297 14.7516 8.75156L10.8 12.7032L9.24839 11.1516C9.02207 10.933 8.71895 10.812 8.40431 10.8148C8.08968 10.8175 7.7887 10.9437 7.56621 11.1662C7.34372 11.3887 7.21752 11.6896 7.21479 12.0043C7.21205 12.3189 7.333 12.622 7.55159 12.8484L9.95159 15.2484C10.1766 15.4733 10.4818 15.5997 10.8 15.5997C11.1182 15.5997 11.4234 15.4733 11.6484 15.2484L16.4484 10.4484Z" fill="white" />
                  </svg>
                </div>
                <div className={tailwind('mt-5')}>
                  <h3 className={tailwind('text-lg font-medium leading-6 text-gray-900')}>Privacy focused</h3>
                  <p className={tailwind('mt-2 text-base text-gray-500')}>Your account is cryptographically generated; only you can control it. All your data are encrypted; only you can decrypt them and see the content inside.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={tailwind('relative bg-white py-16 sm:py-24')}>
        <div className={tailwind('mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8')}>
          <h2 className={tailwind('text-base font-semibold uppercase tracking-wider text-indigo-600')}>Safe & Secure</h2>
          <p className={tailwind('mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl')}>With privacy at heart powered by <a className={tailwind('rounded text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500')} href="https://www.hiro.so/stacks-js" target="_blank" rel="noreferrer">Stacks</a></p>
          <p className={tailwind('mx-auto mt-5 max-w-prose text-xl text-gray-500')}>Web3 technology from Stacks empowers Justnote to be a decentralized app, allowing users to truly own their accounts and data.</p>
          <div className={tailwind('mt-12')}>
            <div className={tailwind('grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-5 xl:gap-8')}>
              <div className={tailwind('mx-auto pt-6')}>
                <div className={tailwind('flow-root h-full max-w-sm rounded-lg bg-gray-50 px-6 pb-8')}>
                  <div className={tailwind('-mt-6')}>
                    <div>
                      <span className={tailwind('inline-flex items-center justify-center rounded-md bg-indigo-500 p-3 shadow-lg')}>
                        <svg className={tailwind('h-6 w-6 text-white')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path fillRule="evenodd" clipRule="evenodd" d="M18 8.00001C18.0003 8.93719 17.781 9.86139 17.3598 10.6986C16.9386 11.5357 16.3271 12.2626 15.5744 12.8209C14.8216 13.3792 13.9486 13.7534 13.0252 13.9135C12.1018 14.0737 11.1538 14.0153 10.257 13.743L10 14L9 15L8 16H6V18H2V14L6.257 9.74301C6.00745 8.91803 5.93857 8.04896 6.05504 7.19496C6.17152 6.34096 6.47062 5.52208 6.93199 4.79406C7.39336 4.06604 8.00616 3.44596 8.72869 2.97603C9.45122 2.50611 10.2665 2.19736 11.1191 2.07082C11.9716 1.94427 12.8415 2.0029 13.6693 2.2427C14.4972 2.4825 15.2637 2.89785 15.9166 3.46048C16.5696 4.02311 17.0936 4.71981 17.4531 5.50315C17.8127 6.2865 17.9992 7.13811 18 8.00001ZM12 4.00001C11.7348 4.00001 11.4804 4.10537 11.2929 4.29291C11.1054 4.48044 11 4.7348 11 5.00001C11 5.26523 11.1054 5.51958 11.2929 5.70712C11.4804 5.89466 11.7348 6.00001 12 6.00001C12.5304 6.00001 13.0391 6.21073 13.4142 6.5858C13.7893 6.96087 14 7.46958 14 8.00001C14 8.26523 14.1054 8.51959 14.2929 8.70712C14.4804 8.89466 14.7348 9.00001 15 9.00001C15.2652 9.00001 15.5196 8.89466 15.7071 8.70712C15.8946 8.51959 16 8.26523 16 8.00001C16 6.93915 15.5786 5.92173 14.8284 5.17159C14.0783 4.42144 13.0609 4.00001 12 4.00001Z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className={tailwind('mt-8 text-lg font-medium tracking-tight text-gray-900')}>Account</h3>
                    <p className={tailwind('mt-5 text-left text-base text-gray-500')}><a className={tailwind('rounded font-medium text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500')} href="https://docs.stacks.co/concepts/network-fundamentals/accounts" target="_blank" rel="noreferrer">Your account</a> is cryptographically generated; only you, with your Secret Key, can control it.</p>
                    <h4 className={tailwind('mt-7 text-left text-base font-medium tracking-tight text-gray-900')}>No ban on your owned account</h4>
                    <p className={tailwind('mt-3 text-left text-base text-gray-500')}>Your account cannot be locked, banned, or deleted by anyone, as your Secret Key is required to access and modify your account.</p>
                  </div>
                </div>
              </div>
              <div className={tailwind('mx-auto pt-6')}>
                <div className={tailwind('flow-root h-full max-w-sm rounded-lg bg-gray-50 px-6 pb-8')}>
                  <div className={tailwind('-mt-6')}>
                    <div>
                      <span className={tailwind('inline-flex items-center justify-center rounded-md bg-indigo-500 p-3 shadow-lg')}>
                        <svg className={tailwind('h-6 w-6 text-white')} viewBox="0 0 34 38" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M17 9.27273C12.7392 9.27273 9.27273 12.7392 9.27273 17C9.27273 21.2608 12.7392 24.7273 17 24.7273C21.2608 24.7273 24.7273 21.2608 24.7273 17C24.7273 12.7392 21.2608 9.27273 17 9.27273ZM21.1047 12.3621C21.2917 12.529 21.471 12.7067 21.6364 12.8937L20.7369 13.7947L20.4804 13.5196L20.2037 13.2631L21.1047 12.3621ZM19.0555 11.1566C19.2935 11.2401 19.5268 11.3375 19.7494 11.4487L19.2517 12.6233L18.8499 12.4378L18.5609 12.3312L19.0555 11.1566ZM16.6245 10.8182H17.3755V12.0916L17 12.0777L16.6245 12.0916V10.8182ZM14.9816 11.1412L15.4685 12.3188L15.1485 12.4363L14.7745 12.6063L14.2893 11.4286C14.5118 11.3205 14.7452 11.2246 14.9816 11.1412ZM11.4487 14.2506L12.6233 14.7452L12.4394 15.147L12.3312 15.4375L11.1566 14.943C11.2401 14.7035 11.3375 14.4732 11.4487 14.2506ZM10.8182 16.6214H12.0916L12.0777 16.9969L12.0916 17.3725H10.8182V16.6214ZM11.4302 19.7076C11.322 19.4835 11.2246 19.2517 11.1412 19.0122L12.3204 18.5254L12.4378 18.8468L12.6063 19.2177L11.4302 19.7076ZM12.7886 21.7384L12.257 21.2083L13.2615 20.2006L13.5181 20.4757L13.7947 20.7323L12.7886 21.7384ZM13.5196 13.5196L13.2631 13.7947L12.3636 12.8937C12.529 12.7067 12.7083 12.529 12.8953 12.3621L13.7963 13.2631L13.5196 13.5196ZM14.9445 22.8434C14.7065 22.7599 14.4732 22.6625 14.2506 22.5513L14.7483 21.3767L15.1501 21.5622L15.4406 21.6704L14.9445 22.8434ZM17.3755 23.1818H16.6245V21.9068L17 21.9207L17.3755 21.9068V23.1818ZM19.0168 22.8573L18.5315 21.6781L18.8515 21.5606L19.2255 21.3906L19.7107 22.5683C19.4882 22.678 19.2548 22.7754 19.0168 22.8573ZM17 20.0909C15.2923 20.0909 13.9091 18.7077 13.9091 17C13.9091 16.371 14.0961 15.7884 14.4175 15.3L15.5365 16.4189L16.3432 15.6122L15.2135 14.4794C15.7173 14.1208 16.3324 13.9091 17 13.9091C18.7077 13.9091 20.0909 15.2938 20.0909 17C20.0909 18.7062 18.7077 20.0909 17 20.0909ZM21.1047 21.6317L20.2037 20.7307L20.4804 20.4742L20.7369 20.1991L21.6364 21.1001C21.471 21.2886 21.2917 21.4664 21.1047 21.6317ZM22.5513 19.7447L21.3767 19.2486L21.5606 18.8484L21.6688 18.5563L22.8434 19.0524C22.7599 19.2888 22.6625 19.5222 22.5513 19.7447ZM23.1818 17.3725H21.9084L21.9223 16.9969L21.9084 16.6214H23.1818V17.3725ZM22.8573 14.9801L21.6781 15.4669L21.5606 15.1455L21.3922 14.7715L22.5698 14.2862C22.678 14.5103 22.7738 14.7436 22.8573 14.9801ZM23.1818 34H30.9091V37.0909H23.1818V34ZM3.09091 34H10.8182V37.0909H3.09091V34ZM0 0V32.4545H34V0H0ZM17 26.2727C11.8753 26.2727 7.72727 22.1247 7.72727 17C7.72727 11.8737 11.8753 7.72727 17 7.72727C22.1247 7.72727 26.2727 11.8753 26.2727 17C26.2727 22.1247 22.1247 26.2727 17 26.2727Z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className={tailwind('mt-8 text-lg font-medium tracking-tight text-gray-900')}>Encryption</h3>
                    <p className={tailwind('mt-5 text-left text-base text-gray-500')}>Everything is encrypted; only you, with your Secret Key, can see the content inside.</p>
                    <h4 className={tailwind('mt-7 text-left text-base font-medium tracking-tight text-gray-900')}>No targeted ads and data breach</h4>
                    <p className={tailwind('mt-3 text-left text-base text-gray-500')}>No one can see the content inside your data, so it cannot be used to create targeted ads. If your data is stolen, no information is leaked.</p>
                  </div>
                </div>
              </div>
              <div className={tailwind('mx-auto pt-6')}>
                <div className={tailwind('flow-root h-full max-w-sm rounded-lg bg-gray-50 px-6 pb-8')}>
                  <div className={tailwind('-mt-6')}>
                    <div>
                      <span className={tailwind('inline-flex items-center justify-center rounded-md bg-indigo-500 p-3 shadow-lg')}>
                        <svg className={tailwind('h-6 w-6 text-white')} viewBox="0 0 38 43" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M5.64517 13.7741L19 6.22571M5.64517 13.7741L19 21.3225M5.64517 13.7741V28.8709M19 6.22571L32.3549 13.7741M19 6.22571V21.3225M19 21.3225L32.3549 13.7741M19 21.3225L32.3549 28.8709M19 21.3225V36.4193M19 21.3225L5.64517 28.8709M32.3549 13.7741V28.8709M5.64517 28.8709L19 36.4193M19 36.4193L32.3549 28.8709" strokeWidth="1.69052" />
                          <path d="M27.7097 16.387L32.3548 18.9274L37 16.3145V11.1612M27.7097 16.387V11.1612M27.7097 16.387L32.3548 13.7741M37 11.1612L32.3548 13.7741M37 11.1612L32.3548 8.54834L27.7097 11.1612M27.7097 11.1612L32.3548 13.7741" strokeWidth="1.69052" />
                          <path d="M14.3548 8.83871L19 11.379L23.6452 8.83871V3.6129M14.3548 8.83871V3.6129M14.3548 8.83871L19 6.22581M23.6452 3.6129L19 6.22581M23.6452 3.6129L19 1L14.3548 3.6129M14.3548 3.6129L19 6.22581" strokeWidth="1.69052" />
                          <path d="M10.2903 11.1612V16.387L5.64516 18.9274L1 16.387V11.1612M10.2903 11.1612L5.64516 13.7741L1 11.1612M10.2903 11.1612L5.64516 8.54834L1 11.1612" strokeWidth="1.69052" />
                          <path d="M10.2903 26.2582V31.484L5.64516 34.0243M10.2903 26.2582L5.64516 28.8711M10.2903 26.2582L5.64516 23.6453L1 26.2582M5.64516 34.0243L1 31.484V26.2582M5.64516 34.0243V28.8711M1 26.2582L5.64516 28.8711" strokeWidth="1.69052" />
                          <path d="M23.6452 33.8065V39.0323L19 41.5726M23.6452 33.8065L19 36.4194M23.6452 33.8065L19 31.1936L14.3548 33.8065M19 41.5726L14.3548 39.0323V33.8065M19 41.5726V36.4194M14.3548 33.8065L19 36.4194" strokeWidth="1.69052" />
                          <path d="M37 26.2582V31.484L32.3548 34.0243M37 26.2582L32.3548 28.8711M37 26.2582L32.3548 23.6453L27.7097 26.2582M32.3548 34.0243L27.7097 31.484V26.2582M32.3548 34.0243V28.8711M27.7097 26.2582L32.3548 28.8711" strokeWidth="1.69052" />
                        </svg>
                      </span>
                    </div>
                    <h3 className={tailwind('mt-8 text-lg font-medium tracking-tight text-gray-900')}>Data Storage</h3>
                    <p className={tailwind('mt-5 text-left text-base text-gray-500')}>Your data lives in <a className={tailwind('rounded font-medium text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500')} href="https://docs.stacks.co/concepts/gaia" target="_blank" rel="noreferrer">a data server</a> of your choice; only you, with your Secret Key, can change it.</p>
                    <h4 className={tailwind('mt-7 text-left text-base font-medium tracking-tight text-gray-900')}>No lock out of your own data</h4>
                    <p className={tailwind('mt-3 text-left text-base text-gray-500')}>You can manage your data and set permissions directly, as you can host your own data server or choose any data server provider.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={ubiquitousSection} className={tailwind('relative bg-gray-800')}>
        <div className={tailwind('h-64 bg-gray-800 sm:h-72 md:absolute md:left-0 md:h-full md:w-1/2')}>
          <img className={tailwind('h-full w-full object-cover object-top sm:object-contain sm:object-bottom md:ml-3 md:object-cover lg:ml-0 lg:object-contain')} src={ubiquitous} srcSet={`${ubiquitous} 1x, https://justnote.cc/static/media/ubiquitous@2x.71c0141141e0fa456d7f.png 2x, https://justnote.cc/static/media/ubiquitous@3x.f547ca5abc4dd9ef38e1.png 3x, https://justnote.cc/static/media/ubiquitous@4x.18cacd577760c818a450.png 4x`} alt="" />
        </div>
        <div className={tailwind('relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16')}>
          <div className={tailwind('md:ml-auto md:w-1/2 md:pl-10')}>
            <h2 className={tailwind('text-base font-semibold uppercase tracking-wider text-gray-300')}>Ubiquitous</h2>
            <p className={tailwind('mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl')}>Justnote Mobile</p>
            <p className={tailwind('mt-3 text-lg text-gray-300')}>Take notes on the go. Access your notes, edit them, and create new ones anytime, anywhere, on any device.</p>
            <div className={tailwind('mt-8 flex justify-center md:justify-start')}>
              <a className={tailwind('group block focus:outline-none')} href="https://apps.apple.com/us/app/id1570111019" target="_blank" rel="noreferrer">
                <img className={tailwind('h-12 rounded shadow group-hover:ring group-focus:ring')} src={availableOnAppStore} alt="Available on App Store" />
              </a>
              <a className={tailwind('group ml-4 block focus:outline-none')} href="https://play.google.com/store/apps/details?id=com.justnotecc" target="_blank" rel="noreferrer">
                <img className={tailwind('h-12 rounded shadow group-hover:ring group-focus:ring')} src={availableOnPlayStore} alt="Available on Google Play" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className={tailwind('relative bg-white py-16 sm:py-24')}>
        <div className={tailwind('mx-auto max-w-md px-4 text-left sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8')}>
          <h2 className={tailwind('text-base font-semibold uppercase tracking-wider text-green-600')}>Testimonials</h2>
          <p className={tailwind('mt-2.5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl')}>Some kind words...</p>
          <p className={tailwind('mt-3 text-xl text-gray-500')}>Don't just take our word for it. Hear what real people say about us.</p>
          <ul className={tailwind('mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3')}>
            <li>
              <ul>
                <li>
                  <figure className={tailwind('mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                    <blockquote>
                      <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Just discovered this one. Been looking for a notes app without all the bloat as many end up adding too many functions to be user friendly really. This one has what I need in a good looking app at a decent price.</p>
                    </blockquote>
                    <figcaption className={tailwind('mt-6 flex items-center')}>
                      <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                        <img className={tailwind('h-12 w-12 object-cover')} src={kindWordsJW} alt="" />
                      </div>
                      <div className={tailwind('ml-4')}>
                        <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>john whitham</div>
                        <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://play.google.com/store/apps/details?id=com.justnotecc&hl=en&gl=US" target="_blank" rel="noreferrer">Google Play Reviews</a>
                      </div>
                    </figcaption>
                  </figure>
                </li>
                <li className={tailwind('mt-8')}>
                  <figure className={tailwind('mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                    <blockquote>
                      <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Clean, secure, easy to use and beautifully designed.</p>
                    </blockquote>
                    <figcaption className={tailwind('mt-6 flex items-center')}>
                      <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                        <img className={tailwind('h-12 w-12 object-cover')} src={kindWordsKP} alt="" />
                      </div>
                      <div className={tailwind('ml-4')}>
                        <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Krishna Pandit</div>
                        <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://play.google.com/store/apps/details?id=com.justnotecc&hl=en&gl=US" target="_blank" rel="noreferrer">Google Play Reviews</a>
                      </div>
                    </figcaption>
                  </figure>
                </li>
              </ul>
            </li>
            <li>
              <ul>
                <li className={tailwind('hidden lg:list-item')}>
                  <figure className={tailwind('mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                    <blockquote>
                      <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>The dark theme is beautifully implemented. Thank you <a className={tailwind('rounded hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/justnotecc" target="_blank" rel="noreferrer">@justnotecc</a></p>
                    </blockquote>
                    <figcaption className={tailwind('mt-6 flex items-center')}>
                      <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                        <img className={tailwind('h-12 w-12 object-cover')} src={kindWordsDH} alt="" />
                      </div>
                      <div className={tailwind('ml-4')}>
                        <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Daniel Holenstein</div>
                        <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/DanielHolenste2/status/1582937273754333184" target="_blank" rel="noreferrer">@DanielHolenste2</a>
                      </div>
                    </figcaption>
                  </figure>
                </li>
                <li className={tailwind('lg:mt-8')}>
                  <figure className={tailwind('mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                    <blockquote>
                      <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Hey, quick check out on this secure and privacy-focused notes taking application, where your identity can be controlled safely and everything kept simple and fast + device syncing: <a className={tailwind('rounded hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/justnotecc" target="_blank" rel="noreferrer">@justnotecc</a></p>
                    </blockquote>
                    <figcaption className={tailwind('mt-6 flex items-center')}>
                      <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                        <img className={tailwind('h-12 w-12 object-cover')} src={kindWordsM} alt="" />
                      </div>
                      <div className={tailwind('ml-4')}>
                        <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Meme</div>
                        <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/Mefnat/status/1741634298669596779" target="_blank" rel="noreferrer">@Mefnat</a>
                      </div>
                    </figcaption>
                  </figure>
                </li>
              </ul>
            </li>
            <li className={tailwind('hidden lg:list-item')}>
              <ul>
                <li>
                  <figure className={tailwind('mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                    <blockquote>
                      <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Interface so clean and comfortable to use 💚</p>
                    </blockquote>
                    <figcaption className={tailwind('mt-6 flex items-center')}>
                      <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                        <img className={tailwind('h-12 w-12 object-cover')} src={kindWordsAW} alt="" />
                      </div>
                      <div className={tailwind('ml-4')}>
                        <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>ALIN WANDERLUST</div>
                        <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://play.google.com/store/apps/details?id=com.justnotecc&hl=en&gl=US" target="_blank" rel="noreferrer">Google Play Reviews</a>
                      </div>
                    </figcaption>
                  </figure>
                </li>
                <li className={tailwind('lg:mt-8')}>
                  <figure className={tailwind('mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-900/5')}>
                    <blockquote>
                      <p className={tailwind(`text-lg tracking-tight text-gray-800 before:content-['“'] after:content-['”']`)}>Take your note-taking game to the next level with <a className={tailwind('rounded hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/hashtag/Justnote" target="_blank" rel="noreferrer">#Justnote</a>! Securely and conveniently jot down your ideas on any device. Inspired by Evernote, Google Keep, Joplin, and Notion. Built on <a className={tailwind('rounded hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/hashtag/Stacks" target="_blank" rel="noreferrer">#Stacks</a>.</p>
                    </blockquote>
                    <figcaption className={tailwind('mt-6 flex items-center')}>
                      <div className={tailwind('overflow-hidden rounded-full bg-gray-50')}>
                        <img className={tailwind('h-12 w-12 object-cover')} src={kindWordsII} alt="" />
                      </div>
                      <div className={tailwind('ml-4')}>
                        <div className={tailwind('text-base font-medium leading-6 tracking-tight text-gray-800')}>Infinite Insights</div>
                        <a className={tailwind('mt-1 rounded text-sm text-gray-500 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/Manyonge12/status/1626885376794140672" target="_blank" rel="noreferrer">@Manyonge12</a>
                      </div>
                    </figcaption>
                  </figure>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <section className={tailwind('overflow-hidden bg-white py-12 md:py-20 lg:py-24')}>
        <div className={tailwind('relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8')}>
          <div className={tailwind('relative')}>
            <img className={tailwind('mx-auto h-8')} src={logoFull} alt="Justnote" />
            <blockquote className={tailwind('mt-10')}>
              <div className={tailwind('relative mx-auto max-w-3xl text-left text-lg font-normal leading-9 text-gray-600')}>
                <svg className={tailwind('absolute top-0 left-0 hidden h-36 w-36 -translate-x-8 -translate-y-24 transform text-green-200 opacity-50 sm:block')} stroke="currentColor" fill="none" viewBox="0 0 144 144" aria-hidden="true">
                  <path strokeWidth="2" d="M41.485 15C17.753 31.753 1 59.208 1 89.455c0 24.664 14.891 39.09 32.109 39.09 16.287 0 28.386-13.03 28.386-28.387 0-15.356-10.703-26.524-24.663-26.524-2.792 0-6.515.465-7.446.93 2.327-15.821 17.218-34.435 32.11-43.742L41.485 15zm80.04 0c-23.268 16.753-40.02 44.208-40.02 74.455 0 24.664 14.891 39.09 32.109 39.09 15.822 0 28.386-13.03 28.386-28.387 0-15.356-11.168-26.524-25.129-26.524-2.792 0-6.049.465-6.98.93 2.327-15.821 16.753-34.435 31.644-43.742L121.525 15z" />
                </svg>
                <p>Hi everyone, I want to share with you why I created Justnote. It's a note-taking app I want to have myself. I want a simple, small, and fast one without annoying ads. I want an app to take a quick, small note when I'm on the run and get back to it quickly when I need information in that note. So here I am. I hope that as it's useful to me and I love it, it's also useful to you, and you love it too.</p>
                <p className={tailwind('pt-6')}>You can be sure that I don't be evil, and with Web3 technology from Stacks, I can't. You can use Justnote with peace of mind. Your account and data are always yours. No nightmare that you're banned from your account or you'll lose all your data.</p>
              </div>
              <footer className={tailwind('mt-8')}>
                <div className={tailwind('md:flex md:items-center md:justify-center')}>
                  <div className={tailwind('md:flex-shrink-0')}>
                    <img className={tailwind('mx-auto h-10 w-10 rounded-full')} src={creator} alt="" />
                  </div>
                  <div className={tailwind('mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center')}>
                    <a className={tailwind('rounded text-base font-medium text-gray-500 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/0xc22b" target="_blank" rel="noreferrer">@0xc22b</a>
                    <svg className={tailwind('mx-1 hidden h-5 w-5 text-green-600 md:block')} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 0h3L9 20H6l5-20z" />
                    </svg>
                    <div className={tailwind('text-base font-medium text-gray-500')}>Creator</div>
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
      <div className={tailwind('bg-white')}>
        <div className={tailwind('mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8')}>
          <div className={tailwind('overflow-hidden rounded-lg bg-green-700 shadow-xl lg:grid lg:grid-cols-2 lg:gap-4')}>
            <div className={tailwind('px-6 pt-10 pb-12 sm:px-16 sm:pt-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20')}>
              <div className={tailwind('lg:self-center')}>
                <h2 className={tailwind('text-3xl font-extrabold text-white sm:text-4xl')}>
                  <span className={tailwind('block')}>Ready to dive in?</span>
                </h2>
                <p className={tailwind('mt-4 text-lg leading-6 text-green-200')}>Let's try Justnote - a simple, fast, and privacy-focused note-taking app you will love.</p>
                <button onClick={onSignUpBtnClick} className={tailwind('mt-8 inline-flex items-center rounded-md border border-transparent bg-white px-6 py-3 text-base font-medium text-green-600 shadow hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 focus:ring-offset-2')}>
                  Get started now
                  <svg style={{ marginTop: '0.125rem' }} className={tailwind('ml-2 w-1.5')} viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={tailwind('aspect-w-5 aspect-h-3 -mt-6 md:aspect-w-2 md:aspect-h-1')}>
              <img className={tailwind('translate-x-6 translate-y-6 transform rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20')} src={mainDesktopInDarkChrome} alt="App screenshot" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <SignUpPopup />
      <SignInPopup />
    </React.Fragment>
  );
};

export default React.memo(Landing);
