import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { SvgXml, Path } from 'react-native-svg';
import FastImage from 'react-native-fast-image';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { updateNoteId, updatePopup } from '../actions';
import { NEW_NOTE, PROFILE_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import SidebarSearchInput from './SidebarSearchInput';
import SidebarListNames from './SidebarListNames';
import LoadingSidebarListNames from './LoadingSidebarListNames';

import logoFull from '../images/logo-full.svg';

const Sidebar = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const didFetch = useSelector(state => state.display.didFetch);
  const profileBtn = useRef(null);
  const dispatch = useDispatch();

  const onProfileBtnClick = () => {
    profileBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = {
        x, y, width, height, top: y, right: x + width, bottom: y + height, left: x,
      };
      dispatch(updatePopup(PROFILE_POPUP, true, rect));
    });
  };

  const onAddBtnClick = () => {
    dispatch(updateNoteId(NEW_NOTE));
  };

  const listNames = didFetch ? <SidebarListNames /> : <LoadingSidebarListNames />;

  return (
    <View style={tailwind('w-full min-w-56 h-full pt-5 pb-4 bg-gray-100')}>
      <View style={tailwind('justify-center flex-shrink-0 px-6')}>
        <SvgXml width={135} height={40} xml={logoFull} />
      </View>
      <View style={tailwind('flex-1')}>
        {/* User account dropdown */}
        <View style={tailwind('hidden pl-3 pr-1 mt-6 lg:flex', safeAreaWidth)}>
          <TouchableOpacity ref={profileBtn} onPress={onProfileBtnClick} style={tailwind('w-full bg-gray-100 rounded-md px-3.5 py-2 text-sm font-medium text-gray-700')}>
            <View style={tailwind('flex-row w-full justify-between items-center')}>
              <View style={tailwind('flex-1 flex-row items-center justify-between')}>
                <FastImage style={tailwind('w-10 h-10 bg-gray-300 rounded-full flex-shrink-0')} source={{ uri: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixqx=c2MT4LynBj&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80' }} />
                <View style={tailwind('ml-3 flex-1')}>
                  <Text style={tailwind('text-gray-900 text-sm font-medium text-center')} numberOfLines={1} ellipsizeMode="tail">Jessy Schwarz</Text>
                </View>
              </View>
              <Svg width={20} height={20} style={tailwind('flex-shrink-0 text-gray-400 font-normal')} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </Svg>
            </View>
          </TouchableOpacity>
        </View>
        {/* Sidebar Search */}
        <SidebarSearchInput />
        {/* Add Button */}
        <View style={tailwind('hidden pl-3 pr-1 mt-6 lg:flex', safeAreaWidth)}>
          <TouchableOpacity onPress={onAddBtnClick} style={tailwind('py-2 w-full bg-green-600 border border-green-600 rounded-md shadow-sm')}>
            <View style={tailwind('flex-col')}>
              <View style={tailwind('absolute inset-y-0 left-0 pl-3 justify-center')}>
                <Svg width={16} height={16} style={tailwind('mr-3 text-white font-normal')} viewBox="0 0 20 20" fill="currentColor">
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
