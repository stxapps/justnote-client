import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { SvgXml, Path } from 'react-native-svg';

import { updateNoteId } from '../actions';
import { NEW_NOTE, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';

import { useTailwind } from '.';
import SidebarSearchInput from './SidebarSearchInput';
import SidebarListNames from './SidebarListNames';
import LoadingSidebarListNames from './LoadingSidebarListNames';

import logoFull from '../images/logo-full.svg';
import logoFullBlk from '../images/logo-full-blk.svg';

const Sidebar = () => {

  const didFetch = useSelector(state => state.display.didFetch);
  const themeMode = useSelector(state => getThemeMode(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onAddBtnClick = () => {
    dispatch(updateNoteId(NEW_NOTE, false, true));
  };

  const listNames = didFetch ? <SidebarListNames /> : <LoadingSidebarListNames />;

  return (
    <View style={tailwind('h-full w-full min-w-56 bg-gray-100 pt-5 pb-4 blk:bg-gray-800')}>
      <View style={tailwind('flex-shrink-0 justify-center px-6')}>
        <SvgXml width={135} height={40} xml={themeMode === BLK_MODE ? logoFullBlk : logoFull} />
      </View>
      <View style={tailwind('flex-1')}>
        {/* Sidebar Search */}
        <SidebarSearchInput />
        {/* Add Button */}
        <View style={tailwind('mt-6 hidden pl-3 pr-1 lg:flex')}>
          <TouchableOpacity onPress={onAddBtnClick} style={tailwind('w-full rounded-md border border-green-600 bg-green-600 py-2 shadow-sm')}>
            <View style={tailwind('flex-col')}>
              <View style={tailwind('absolute inset-y-0 left-0 justify-center pl-3')}>
                <Svg width={16} height={16} style={tailwind('mr-3 font-normal text-white')} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V9H14C14.2652 9 14.5196 9.10536 14.7071 9.29289C14.8946 9.48043 15 9.73478 15 10C15 10.2652 14.8946 10.5196 14.7071 10.7071C14.5196 10.8946 14.2652 11 14 11H11V14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14V11H6C5.73478 11 5.48043 10.8946 5.29289 10.7071C5.10536 10.5196 5 10.2652 5 10C5 9.73478 5.10536 9.48043 5.29289 9.29289C5.48043 9.10536 5.73478 9 6 9H9V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5Z" />
                </Svg>
              </View>
              <Text style={tailwind('pl-9 text-sm font-medium text-white')}>New Note</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* List Names */}
        {listNames}
      </View>
    </View>
  );
};

export default React.memo(Sidebar);
