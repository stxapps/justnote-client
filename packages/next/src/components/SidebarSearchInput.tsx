import React from 'react';

import { useSelector, useDispatch } from '../store';
import { updateSearchString } from '../actions';

import { useTailwind } from '.';

const SidebarSearchInput = () => {

  const searchString = useSelector(state => state.display.searchString);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSearchInputChange = (e) => {
    dispatch(updateSearchString(e.target.value));
  };

  const onSearchClearBtnClick = () => {
    dispatch(updateSearchString(''));
  };

  const searchClearBtnClasses = searchString.length === 0 ? 'hidden' : '';

  return (
    <div className={tailwind('mt-6 hidden pl-3 pr-1 lg:block')}>
      <label htmlFor="sidebarSearch" className={tailwind('sr-only')}>Search</label>
      <div className={tailwind('relative mt-1 rounded-md bg-white shadow-xs blk:bg-gray-800')}>
        <input onChange={onSearchInputChange} type="search" name="search" id="sidebarSearch" className={tailwind('block w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-6 text-sm leading-5 text-gray-700 placeholder:text-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 blk:border-gray-600 blk:bg-gray-800 blk:text-gray-200 blk:placeholder:text-gray-400 blk:focus:border-gray-400 blk:focus:ring-gray-400')} placeholder="Search" value={searchString} autoCapitalize="none" />
        <div className={tailwind('pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3')}>
          <svg className={tailwind('mr-3 h-4 w-4 text-gray-400 blk:text-gray-500')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <button onClick={onSearchClearBtnClick} className={tailwind(`group absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none ${searchClearBtnClasses}`)}>
          <svg className={tailwind('h-5 cursor-pointer rounded-full text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300 blk:group-focus:ring-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(SidebarSearchInput);
