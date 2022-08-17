import React from 'react';
import { View, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateSearchString } from '../actions';

import { useTailwind } from '.';

const SidebarSearchInput = () => {

  const searchString = useSelector(state => state.display.searchString);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSearchInputChange = (e) => {
    dispatch(updateSearchString(e.nativeEvent.text));
  };

  const onSearchClearBtnClick = () => {
    dispatch(updateSearchString(''));
  };

  const searchClearBtnClasses = searchString.length === 0 ? 'hidden relative' : 'flex absolute';
  const searchInputClasses = Platform.OS === 'ios' ? 'py-2.5' : 'py-1';

  return (
    <View style={tailwind('mt-6 hidden pl-3 pr-1 lg:flex')}>
      <View style={tailwind('mt-1 rounded-md bg-white shadow-sm')}>
        <View style={tailwind('absolute inset-y-0 left-0 justify-center pl-3')}>
          <Svg width={16} height={16} style={tailwind('mr-3 font-normal text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </Svg>
        </View>
        <TextInput onChange={onSearchInputChange} style={tailwind(`w-full rounded-md border border-gray-300 pl-9 pr-6 text-sm font-normal leading-4 text-gray-700 ${searchInputClasses}`)} placeholder="Search" placeholderTextColor="rgba(113, 128, 150, 1)" value={searchString} autoCapitalize="none" />
        <TouchableOpacity onPress={onSearchClearBtnClick} style={tailwind(`inset-y-0 right-0 justify-center pr-2 ${searchClearBtnClasses}`)}>
          <Svg width={20} height={20} style={tailwind('rounded-full font-normal text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(SidebarSearchInput);
