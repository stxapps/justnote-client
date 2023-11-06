import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { MY_NOTES, TRASH, ARCHIVE } from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName, getTagNameDisplayName } from '../utils';

import { useTailwind } from '.';

const EmptyContent = () => {

  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(getListNameMap);
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const searchString = useSelector(state => state.display.searchString);
  const tailwind = useTailwind();

  let displayName = getListNameDisplayName(listName, listNameMap);
  let textName = `"Move to -> ${displayName}"`;
  if (listName === ARCHIVE) textName = `"${displayName}"`;
  if (queryString) {
    // Only tag name for now
    const tagName = queryString.trim();
    displayName = getTagNameDisplayName(tagName, tagNameMap);
    textName = '"Add tags"';
  }

  if (searchString !== '') {
    return (
      <View style={tailwind('px-4 py-4 sm:px-6 sm:py-6')}>
        <Text style={tailwind('text-base font-normal text-gray-600 blk:text-gray-300')}>Your search - <Text style={tailwind('text-lg font-medium text-gray-800 blk:text-gray-100')}>{searchString}</Text> - did not match any notes.</Text>
        <Text style={tailwind('pt-4 text-base font-normal text-gray-500 blk:text-gray-400 sm:pt-6')}>Suggestion:</Text>
        <View style={tailwind('pt-2 pl-2')}>
          <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{'\u2022'}  Make sure all words are spelled correctly.</Text>
          <Text style={tailwind('pt-1 text-base font-normal text-gray-500 blk:text-gray-400')}>{'\u2022'}  Try different keywords.</Text>
          <Text style={tailwind('pt-1 text-base font-normal text-gray-500 blk:text-gray-400')}>{'\u2022'}  Try more general keywords.</Text>
        </View>
      </View>
    );
  }

  if (queryString) {
    return (
      <View style={tailwind('mt-32 mb-24 w-full items-center px-4 sm:px-6')}>
        <View style={tailwind('h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
          <Svg width={40} height={40} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 40 40" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M4 12C4 10.9391 4.42143 9.92172 5.17157 9.17157C5.92172 8.42143 6.93913 8 8 8H16L20 12H28C29.0609 12 30.0783 12.4214 30.8284 13.1716C31.5786 13.9217 32 14.9391 32 16V18H16C14.4087 18 12.8826 18.6321 11.7574 19.7574C10.6321 20.8826 10 22.4087 10 24V27C10 27.7956 9.68393 28.5587 9.12132 29.1213C8.55871 29.6839 7.79565 30 7 30C6.20435 30 5.44129 29.6839 4.87868 29.1213C4.31607 28.5587 4 27.7956 4 27V12Z" />
            <Path d="M12 24C12 22.9391 12.4214 21.9217 13.1716 21.1716C13.9217 20.4214 14.9391 20 16 20H32C33.0609 20 34.0783 20.4214 34.8284 21.1716C35.5786 21.9217 36 22.9391 36 24V28C36 29.0609 35.5786 30.0783 34.8284 30.8284C34.0783 31.5786 33.0609 32 32 32H4H8C9.06087 32 10.0783 31.5786 10.8284 30.8284C11.5786 30.0783 12 29.0609 12 28V24Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-6 text-center text-base font-semibold tracking-wide text-gray-800 blk:text-gray-200 lg:text-sm')}>No notes in {displayName}</Text>
        <Text style={[tailwind('mt-4 text-center text-sm font-normal tracking-wide text-gray-500 blk:text-gray-400'), { lineHeight: 22 }]}>Tap <Text style={tailwind('text-sm font-semibold text-gray-600 blk:text-gray-300')}>{textName}</Text> from the menu to show notes here.</Text>
      </View>
    );
  }

  if (listName === MY_NOTES) {
    return (
      <View style={tailwind('mt-32 mb-24 w-full items-center px-4 sm:px-6')}>
        <View style={tailwind('h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
          <Svg width={40} height={40} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 40 40" fill="currentColor">
            <Path d="M21.414 4.58606C21.0389 4.21112 20.5303 4.00049 20 4.00049C19.4696 4.00049 18.961 4.21112 18.586 4.58606L4.58596 18.5861C4.22164 18.9633 4.02005 19.4685 4.02461 19.9929C4.02917 20.5173 4.23951 21.0189 4.61032 21.3897C4.98114 21.7605 5.48276 21.9709 6.00716 21.9754C6.53155 21.98 7.03676 21.7784 7.41396 21.4141L7.99996 20.8281V34.0001C7.99996 34.5305 8.21067 35.0392 8.58575 35.4143C8.96082 35.7893 9.46953 36.0001 9.99996 36.0001H14C14.5304 36.0001 15.0391 35.7893 15.4142 35.4143C15.7892 35.0392 16 34.5305 16 34.0001V30.0001C16 29.4696 16.2107 28.9609 16.5857 28.5858C16.9608 28.2108 17.4695 28.0001 18 28.0001H22C22.5304 28.0001 23.0391 28.2108 23.4142 28.5858C23.7892 28.9609 24 29.4696 24 30.0001V34.0001C24 34.5305 24.2107 35.0392 24.5857 35.4143C24.9608 35.7893 25.4695 36.0001 26 36.0001H30C30.5304 36.0001 31.0391 35.7893 31.4142 35.4143C31.7892 35.0392 32 34.5305 32 34.0001V20.8281L32.586 21.4141C32.9632 21.7784 33.4684 21.98 33.9928 21.9754C34.5172 21.9709 35.0188 21.7605 35.3896 21.3897C35.7604 21.0189 35.9708 20.5173 35.9753 19.9929C35.9799 19.4685 35.7783 18.9633 35.414 18.5861L21.414 4.58606V4.58606Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-6 text-center text-base font-semibold tracking-wide text-gray-800 blk:text-gray-200 lg:text-sm')}>No notes in {displayName}</Text>
        <Text style={[tailwind('mt-4 text-center text-sm font-normal tracking-wide text-gray-500 blk:text-gray-400'), { lineHeight: 22 }]}>Tap <Text style={tailwind('text-sm font-semibold text-gray-600 blk:text-gray-300')}>"+ New Note"</Text> button to add a new note.</Text>
      </View>
    );
  }

  if (listName === TRASH) {
    return (
      <View style={tailwind('mt-32 mb-24 w-full items-center px-4 sm:px-6')}>
        <View style={tailwind('h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
          <Svg width={40} height={40} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-6 text-center text-base font-semibold tracking-wide text-gray-800 blk:text-gray-200 lg:text-sm')}>No notes in {displayName}</Text>
        <Text style={[tailwind('mt-4 text-center text-sm font-normal tracking-wide text-gray-500 blk:text-gray-400'), { lineHeight: 22 }]}>Tap <Text style={tailwind('text-sm font-semibold text-gray-600 blk:text-gray-300')}>"Remove"</Text> from the menu to move notes you don't need anymore here.</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('mt-32 mb-24 w-full items-center px-4 sm:px-6')}>
      <View style={tailwind('h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
        <Svg width={40} height={40} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 40 40" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M4 12C4 10.9391 4.42143 9.92172 5.17157 9.17157C5.92172 8.42143 6.93913 8 8 8H16L20 12H28C29.0609 12 30.0783 12.4214 30.8284 13.1716C31.5786 13.9217 32 14.9391 32 16V18H16C14.4087 18 12.8826 18.6321 11.7574 19.7574C10.6321 20.8826 10 22.4087 10 24V27C10 27.7956 9.68393 28.5587 9.12132 29.1213C8.55871 29.6839 7.79565 30 7 30C6.20435 30 5.44129 29.6839 4.87868 29.1213C4.31607 28.5587 4 27.7956 4 27V12Z" />
          <Path d="M12 24C12 22.9391 12.4214 21.9217 13.1716 21.1716C13.9217 20.4214 14.9391 20 16 20H32C33.0609 20 34.0783 20.4214 34.8284 21.1716C35.5786 21.9217 36 22.9391 36 24V28C36 29.0609 35.5786 30.0783 34.8284 30.8284C34.0783 31.5786 33.0609 32 32 32H4H8C9.06087 32 10.0783 31.5786 10.8284 30.8284C11.5786 30.0783 12 29.0609 12 28V24Z" />
        </Svg>
      </View>
      <Text style={tailwind('mt-6 text-center text-base font-semibold tracking-wide text-gray-800 blk:text-gray-200 lg:text-sm')}>No notes in {displayName}</Text>
      <Text style={[tailwind('mt-4 text-center text-sm font-normal tracking-wide text-gray-500 blk:text-gray-400'), { lineHeight: 22 }]}>Tap <Text style={tailwind('text-sm font-semibold text-gray-600 blk:text-gray-300')}>{textName}</Text> from the menu to move notes here.</Text>
    </View>
  );
};

export default React.memo(EmptyContent);
