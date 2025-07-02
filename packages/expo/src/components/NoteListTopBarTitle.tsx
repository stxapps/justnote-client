import React from 'react';
import { View, Text } from 'react-native';

import { useSelector } from '../store';
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
      <View style={tailwind('h-6 w-20 rounded-md bg-gray-300 blk:bg-gray-700')} />
    );
  }

  const displayName = getListNameDisplayName(listName, listNameMap);

  return (
    <Text style={tailwind('text-lg font-medium leading-6 text-gray-900 blk:text-gray-100')} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
  );
};

const TopBarTitleQueryString = () => {
  const queryString = useSelector(state => state.display.queryString);
  const didFetch = useSelector(state => state.display.didFetch);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const tailwind = useTailwind();

  if (!didFetch) {
    return (
      <View style={tailwind('h-6 w-20 rounded-md bg-gray-300 blk:bg-gray-700')} />
    );
  }

  // Only tag name for now
  const tagName = queryString.trim();
  const displayName = getTagNameDisplayName(tagName, tagNameMap);

  return (
    <Text style={tailwind('text-lg font-medium leading-6 text-gray-900 blk:text-gray-100')} numberOfLines={1} ellipsizeMode="tail">{`#${displayName}`}</Text>
  );
};

export default React.memo(NoteListTopBarTitle);
