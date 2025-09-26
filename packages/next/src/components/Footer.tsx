import React from 'react';

import {
  PATH_ABOUT, PATH_TERMS, PATH_PRIVACY, PATH_PRICING, PATH_SUPPORT,
} from '../types/const';

import { useTailwind } from '.';
import Link from './CustomLink';

const Footer = () => {
  const tailwind = useTailwind();

  return (
    <footer className={tailwind('bg-white')}>
      <div className={tailwind('mx-auto max-w-7xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8')}>
        <nav className={tailwind('-mx-5 -my-2 md:flex md:flex-wrap md:justify-center')} aria-label="Footer">
          <div className={tailwind('px-3 py-1')}>
            <Link className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href={PATH_ABOUT}>About</Link>
          </div>
          <div className={tailwind('mt-2 px-3 py-1 md:mt-0')}>
            <Link className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href={PATH_TERMS}>Terms</Link>
          </div>
          <div className={tailwind('mt-2 px-3 py-1 md:mt-0')}>
            <Link className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href={PATH_PRIVACY}>Privacy</Link>
          </div>
          <div className={tailwind('mt-2 px-3 py-1 md:mt-0')}>
            <Link className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href={PATH_PRICING}>Pricing</Link>
          </div>
          <div className={tailwind('mt-2 px-3 py-1 md:mt-0')}>
            <Link className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href={PATH_SUPPORT}>Support</Link>
          </div>
          <div className={tailwind('mt-2 px-3 py-1 md:mt-0')}>
            <a className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://docs.justnote.cc" target="_blank" rel="noreferrer">Docs</a>
          </div>
          <div className={tailwind('mt-2 px-3 py-1 md:mt-0')}>
            <a className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://medium.com/@stxapps" target="_blank" rel="noreferrer">Blog</a>
          </div>
          <div className={tailwind('mt-2 px-3 py-1 md:mt-0')}>
            <a className={tailwind('block rounded-xs px-2 py-1 text-base text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://status.justnote.cc" target="_blank" rel="noreferrer">Status</a>
          </div>
        </nav>
        <div className={tailwind('mt-8 flex items-center justify-center space-x-6')}>
          <a className={tailwind('rounded-xs text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://x.com/justnotecc" target="_blank" rel="noreferrer">
            <span className={tailwind('sr-only')}>Twitter</span>
            <svg className={tailwind('h-[1.625rem] w-[1.625rem]')} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a className={tailwind('rounded-xs text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1')} href="https://www.threads.net/@justnote.cc" target="_blank" rel="noreferrer">
            <span className={tailwind('sr-only')}>Threads</span>
            <div className={tailwind('flex h-6 w-6 items-center justify-center')}>
              <svg className={tailwind('h-5 w-5')} fill="currentColor" viewBox="0 0 192 192" aria-hidden="true">
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
              </svg>
            </div>
          </a>
          <a className={tailwind('rounded-xs text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1')} href="https://github.com/stxapps/justnote-client" target="_blank" rel="noreferrer">
            <span className={tailwind('sr-only')}>GitHub</span>
            <svg className={tailwind('h-6 w-6')} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        <p className={tailwind('mt-8 text-center text-base text-gray-400')}>
          &copy; {(new Date()).getFullYear()} <a className={tailwind('rounded-xs text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400')} href="https://www.stxapps.com" target="_blank" rel="noreferrer">STX Apps Co., Ltd.</a>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
