import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateNoteId } from '../actions';
import { NEW_NOTE, NEW_NOTE_OBJ, BLK_MODE, VALID } from '../types/const';
import { getThemeMode, makeGetUnsavedNote } from '../selectors';

import { useTailwind } from '.';
import SidebarSearchInput from './SidebarSearchInput';
import SidebarListNames from './SidebarListNames';
import LoadingSidebarListNames from './LoadingSidebarListNames';

import Logo from '../images/logo-full.svg';
import LogoBlk from '../images/logo-full-blk.svg';

const Sidebar = () => {

  const getUnsavedNote = useMemo(makeGetUnsavedNote, []);
  const didFetch = useSelector(state => state.display.didFetch);
  const themeMode = useSelector(state => getThemeMode(state));
  const unsavedNote = useSelector(state => getUnsavedNote(state, NEW_NOTE_OBJ));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const isUnsavedValid = unsavedNote.status === VALID;

  const onAddBtnClick = () => {
    dispatch(updateNoteId(NEW_NOTE, false, true));
  };

  const listNames = didFetch ? <SidebarListNames /> : <LoadingSidebarListNames />;

  return (
    <View style={tailwind('h-full w-full min-w-56 bg-gray-100 pt-5 pb-4 blk:bg-gray-800')}>
      <View style={tailwind('flex-shrink-0 justify-center px-6')}>
        {themeMode === BLK_MODE ? <LogoBlk width={108} height={32} /> : <Logo width={108} height={32} />}
      </View>
      <View style={tailwind('flex-1')}>
        {/* Sidebar Search */}
        <SidebarSearchInput />
        {/* Add Button */}
        <View style={tailwind('mt-6 hidden pl-3 pr-1 lg:flex')}>
          <TouchableOpacity onPress={onAddBtnClick} style={tailwind('w-full rounded-md border border-green-600 bg-green-600 py-2 shadow-sm')}>
            <View style={tailwind('flex-col')}>
              <Text style={tailwind('pl-9 text-sm font-medium text-white')}>{isUnsavedValid ? 'Edit Note' : 'New Note'}</Text>
              <View style={tailwind('absolute inset-y-0 left-0 justify-center pl-3')}>
                <Svg width={16} height={16} style={tailwind('mr-3 font-normal text-white')} viewBox="0 0 20 20" fill="currentColor">
                  {isUnsavedValid ? <Path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97231 16.8756 4.2181C16.9762 4.46389 17.0268 4.72725 17.0245 4.99281C17.0222 5.25837 16.967 5.52081 16.8622 5.76482C16.7574 6.00883 16.605 6.22952 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" /> : <Path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V9H14C14.2652 9 14.5196 9.10536 14.7071 9.29289C14.8946 9.48043 15 9.73478 15 10C15 10.2652 14.8946 10.5196 14.7071 10.7071C14.5196 10.8946 14.2652 11 14 11H11V14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14V11H6C5.73478 11 5.48043 10.8946 5.29289 10.7071C5.10536 10.5196 5 10.2652 5 10C5 9.73478 5.10536 9.48043 5.29289 9.29289C5.48043 9.10536 5.73478 9 6 9H9V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5Z" />}
                </Svg>
              </View>
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
