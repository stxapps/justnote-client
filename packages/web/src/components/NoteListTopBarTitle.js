import React from 'react';
import { useSelector } from 'react-redux';

import { getListNameMap } from '../selectors';
import { getListNameDisplayName, getTagNameDisplayName } from '../utils';

import { useTailwind } from '.';

const NoteListTopBarTitle = () => {
  const queryString = useSelector(state => state.display.queryString);

  if (queryString) return <TopBarTitleQueryString />;
  return <TopBarTitleListName />;
};

const TopBarTitleListName = () => {
  const listName = useSelector(state => state.display.listName);
  const didFetch = useSelector(state => state.display.didFetch);
  const listNameMap = useSelector(getListNameMap);
  const tailwind = useTailwind();

  if (!didFetch) {
    return (
      <div className={tailwind('h-6 w-20 animate-pulse rounded-md bg-gray-300 blk:bg-gray-700')} />
    );
  }

  const displayName = getListNameDisplayName(listName, listNameMap);

  return (
    <h1 className={tailwind('truncate text-lg font-medium leading-6 text-gray-900 blk:text-gray-100')}>{displayName}</h1>
  );
};

const TopBarTitleQueryString = () => {
  const queryString = useSelector(state => state.display.queryString);
  const didFetch = useSelector(state => state.display.didFetch);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const tailwind = useTailwind();

  if (!didFetch) {
    return (
      <div className={tailwind('h-6 w-20 animate-pulse rounded-md bg-gray-300 blk:bg-gray-700')} />
    );
  }

  // Only tag name for now
  const tagName = queryString.trim();
  const displayName = getTagNameDisplayName(tagName, tagNameMap);

  return (
    <h1 className={tailwind('truncate text-lg font-medium leading-6 text-gray-900 blk:text-gray-100')}>{`#${displayName}`}</h1>
  );
};

export default React.memo(NoteListTopBarTitle);
