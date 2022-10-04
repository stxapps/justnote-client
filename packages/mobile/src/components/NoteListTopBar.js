import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path, Circle } from 'react-native-svg';

import { updatePopup } from '../actions';
import { SYNC, SYNC_ROLLBACK } from '../types/actionTypes';
import {
  NOTE_LIST_MENU_POPUP, SEARCH_POPUP, LG_WIDTH, SHOW_SYNCED,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName } from '../utils';
import { rotateAnimConfig } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';
import NoteListSearchPopup from './NoteListSearchPopup';
import NoteListTopBarBulkEdit from './NoteListTopBarBulkEdit';

const NoteListTopBar = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const listNameMap = useSelector(getListNameMap);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const didFetch = useSelector(state => state.display.didFetch);
  const syncProgress = useSelector(state => state.display.syncProgress);
  const menuBtn = useRef(null);
  const menuBtnAnim = useRef(new Animated.Value(0)).current;
  const menuBtnAnimObj = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onMenuBtnClick = () => {
    menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = {
        x, y, width, height, top: y, right: x + width, bottom: y + height, left: x,
      };
      dispatch(updatePopup(NOTE_LIST_MENU_POPUP, true, rect));
    });
  };

  const onSearchBtnClick = () => {
    dispatch(updatePopup(SEARCH_POPUP, true, null));
  };

  useEffect(() => {
    if (syncProgress && syncProgress.status === SYNC && !menuBtnAnimObj.current) {
      menuBtnAnimObj.current = Animated.loop(
        Animated.timing(menuBtnAnim, { toValue: 1, ...rotateAnimConfig })
      );
      menuBtnAnimObj.current.start();
    }

    if ((!syncProgress || syncProgress.status !== SYNC) && menuBtnAnimObj.current) {
      menuBtnAnimObj.current.stop();
      menuBtnAnimObj.current = null;
      menuBtnAnim.setValue(0);
    }
  }, [syncProgress, menuBtnAnim]);

  if (safeAreaWidth < LG_WIDTH && isBulkEditing) return <NoteListTopBarBulkEdit />;

  let title;
  if (didFetch) title = <Text style={tailwind('text-lg font-medium leading-6 text-gray-900 blk:text-gray-100')} numberOfLines={1} ellipsizeMode="tail">{getListNameDisplayName(listName, listNameMap)}</Text>;
  else title = <View style={tailwind('h-6 w-20 rounded-md bg-gray-300 blk:bg-gray-700')} />;

  const menuBtnSvg = (
    <View style={tailwind('w-10 items-center justify-center rounded-full')}>
      <Svg width={24} height={24} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
        <Path d="M6 10C6 10.5304 5.78929 11.0391 5.41421 11.4142C5.03914 11.7893 4.53043 12 4 12C3.46957 12 2.96086 11.7893 2.58579 11.4142C2.21071 11.0391 2 10.5304 2 10C2 9.46957 2.21071 8.96086 2.58579 8.58579C2.96086 8.21071 3.46957 8 4 8C4.53043 8 5.03914 8.21071 5.41421 8.58579C5.78929 8.96086 6 9.46957 6 10ZM12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10ZM16 12C16.5304 12 17.0391 11.7893 17.4142 11.4142C17.7893 11.0391 18 10.5304 18 10C18 9.46957 17.7893 8.96086 17.4142 8.58579C17.0391 8.21071 16.5304 8 16 8C15.4696 8 14.9609 8.21071 14.5858 8.58579C14.2107 8.96086 14 9.46957 14 10C14 10.5304 14.2107 11.0391 14.5858 11.4142C14.9609 11.7893 15.4696 12 16 12Z" />
      </Svg>
    </View>
  );

  let innerMenuBtn;
  if (syncProgress && syncProgress.status === SYNC) {
    const innerMenuBtnStyle = {
      transform: [{
        rotate: menuBtnAnim.interpolate(
          { inputRange: [0, 1], outputRange: ['0deg', '360deg'] }
        ),
      }],
    };

    innerMenuBtn = (
      <React.Fragment>
        {menuBtnSvg}
        <Animated.View style={[tailwind('absolute top-0 left-0 h-full justify-center'), innerMenuBtnStyle]}>
          <Svg width={40} height={40} style={tailwind('font-normal text-green-600 blk:text-green-500')} viewBox="0 0 100 100" fill="none" stroke="currentColor" preserveAspectRatio="xMidYMid">
            <Circle cx="50" cy="50" strokeWidth="4" r="44" strokeDasharray="226.1946710584651 77.39822368615503" />
          </Svg>
        </Animated.View>
      </React.Fragment>
    );
  } else if (syncProgress && syncProgress.status === SYNC_ROLLBACK) {
    innerMenuBtn = (
      <React.Fragment>
        {menuBtnSvg}
        <View style={tailwind('absolute top-1 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 blk:bg-red-500')} />
      </React.Fragment>
    );
  } else if (syncProgress && syncProgress.status === SHOW_SYNCED) {
    innerMenuBtn = (
      <React.Fragment>
        {menuBtnSvg}
        <View style={tailwind('absolute top-1 right-2.5 h-1.5 w-1.5 rounded-full bg-green-600 blk:bg-green-500')} />
      </React.Fragment>
    );
  } else {
    innerMenuBtn = menuBtnSvg;
  }

  return (
    <View style={tailwind('flex-shrink-0 flex-grow-0')}>
      <View style={tailwind('h-16 flex-row items-center justify-between border-b border-gray-200 blk:border-gray-700')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('h-full justify-center border-r border-gray-200 px-4 blk:border-gray-700 sm:px-6 lg:hidden')}>
          <Svg width={24} height={24} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
          </Svg>
        </TouchableOpacity>
        <View style={tailwind('flex-1 flex-row items-center justify-between pl-4 sm:pl-6')}>
          <View style={tailwind('flex-1')}>{title}</View>
          <View style={tailwind('ml-4 flex-row')}>
            <TouchableOpacity onPress={onSearchBtnClick} style={tailwind('items-center justify-center border border-white bg-white px-1 blk:border-gray-900 blk:bg-gray-900 lg:hidden')}>
              <View style={tailwind('rounded p-2.5')}>
                <Svg width={20} height={20} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M8 4.00003C6.93913 4.00003 5.92172 4.42146 5.17157 5.17161C4.42143 5.92175 4 6.93917 4 8.00003C4 9.0609 4.42143 10.0783 5.17157 10.8285C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8285C11.5786 10.0783 12 9.0609 12 8.00003C12 6.93917 11.5786 5.92175 10.8284 5.17161C10.0783 4.42146 9.06087 4.00003 8 4.00003ZM2 8.00003C1.99988 7.05574 2.22264 6.12475 2.65017 5.28278C3.0777 4.4408 3.69792 3.71163 4.4604 3.15456C5.22287 2.59749 6.10606 2.22825 7.03815 2.07687C7.97023 1.92549 8.92488 1.99625 9.82446 2.28338C10.724 2.57052 11.5432 3.06594 12.2152 3.72933C12.8872 4.39272 13.3931 5.20537 13.6919 6.10117C13.9906 6.99697 14.0737 7.95063 13.9343 8.88459C13.795 9.81855 13.4372 10.7064 12.89 11.476L17.707 16.293C17.8892 16.4816 17.99 16.7342 17.9877 16.9964C17.9854 17.2586 17.8802 17.5094 17.6948 17.6949C17.5094 17.8803 17.2586 17.9854 16.9964 17.9877C16.7342 17.99 16.4816 17.8892 16.293 17.707L11.477 12.891C10.5794 13.5293 9.52335 13.9082 8.42468 13.9862C7.326 14.0641 6.22707 13.8381 5.2483 13.333C4.26953 12.8279 3.44869 12.0631 2.87572 11.1224C2.30276 10.1817 1.99979 9.10147 2 8.00003Z" />
                </Svg>
              </View>
            </TouchableOpacity>
            <TouchableOpacity ref={menuBtn} onPress={onMenuBtnClick} style={tailwind('h-10 items-center justify-center border border-white bg-white pr-2 blk:border-gray-900 blk:bg-gray-900')}>
              {innerMenuBtn}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <NoteListSearchPopup />
    </View>
  );
};

export default React.memo(NoteListTopBar);
