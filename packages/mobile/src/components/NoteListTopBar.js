import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

import { updatePopup } from '../actions';
import { SYNC, SYNC_ROLLBACK } from '../types/actionTypes';
import {
  NOTE_LIST_MENU_POPUP, SEARCH_POPUP, LG_WIDTH, SHOW_SYNCED,
} from '../types/const';
import { getListNameMap } from '../selectors';
import { getListNameDisplayName } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { rotateAnimConfig } from '../types/animConfigs';

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
    }

    return () => {
      if (menuBtnAnimObj.current) {
        menuBtnAnimObj.current.stop();
        menuBtnAnimObj.current = null;
      }
    };
  }, [syncProgress, menuBtnAnim]);

  if (safeAreaWidth < LG_WIDTH && isBulkEditing) return <NoteListTopBarBulkEdit />;

  let title;
  if (didFetch) title = <Text style={tailwind('text-lg font-medium leading-6 text-gray-900')} numberOfLines={1} ellipsizeMode="tail">{getListNameDisplayName(listName, listNameMap)}</Text>;
  else title = <View style={tailwind('bg-gray-300 w-20 h-6 rounded-md')} />;

  const menuBtnSvg = (
    <Svg width={20} height={20} style={tailwind('py-2 rounded-full text-gray-500 font-normal')} viewBox="0 0 20 20" fill="currentColor">
      <Path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
    </Svg>
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
        <Animated.View style={[tailwind('absolute top-0 left-0 h-full justify-center'), innerMenuBtnStyle]}>
          <Svg width={36} height={36} style={tailwind('text-green-600 font-normal')} viewBox="0 0 100 100" fill="none" stroke="currentColor" preserveAspectRatio="xMidYMid">
            <Circle cx="50" cy="50" strokeWidth="4" r="44" strokeDasharray="226.1946710584651 77.39822368615503" />
          </Svg>
        </Animated.View>
        {menuBtnSvg}
      </React.Fragment>
    );
  } else if (syncProgress && syncProgress.status === SYNC_ROLLBACK) {
    innerMenuBtn = (
      <React.Fragment>
        <View style={tailwind('absolute top-1 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full')} />
        {menuBtnSvg}
      </React.Fragment>
    );
  } else if (syncProgress && syncProgress.status === SHOW_SYNCED) {
    innerMenuBtn = (
      <React.Fragment>
        <View style={tailwind('absolute top-1 right-2.5 w-1.5 h-1.5 bg-green-600 rounded-full')} />
        {menuBtnSvg}
      </React.Fragment>
    );
  } else {
    innerMenuBtn = menuBtnSvg;
  }

  return (
    <View style={tailwind('flex-grow-0 flex-shrink-0')}>
      <View style={tailwind('h-16 border-b border-gray-200 flex-row items-center justify-between')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('h-full px-4 border-r border-gray-200 justify-center sm:px-6 lg:hidden', safeAreaWidth)}>
          <Svg width={24} height={24} style={tailwind('text-gray-500 font-normal')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
          </Svg>
        </TouchableOpacity>
        <View style={tailwind('pl-4 flex-1 flex-row items-center justify-between sm:pl-6 lg:pl-8', safeAreaWidth)}>
          <View style={tailwind('flex-1')}>{title}</View>
          <View style={tailwind('ml-4 flex-row')}>
            <TouchableOpacity onPress={onSearchBtnClick} style={tailwind('items-center justify-center px-1 border border-white bg-white lg:hidden', safeAreaWidth)}>
              <View style={tailwind('p-2 rounded')}>
                <Svg width={20} height={20} style={tailwind('text-gray-400 font-normal')} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M8 4.00003C6.93913 4.00003 5.92172 4.42146 5.17157 5.17161C4.42143 5.92175 4 6.93917 4 8.00003C4 9.0609 4.42143 10.0783 5.17157 10.8285C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8285C11.5786 10.0783 12 9.0609 12 8.00003C12 6.93917 11.5786 5.92175 10.8284 5.17161C10.0783 4.42146 9.06087 4.00003 8 4.00003ZM2 8.00003C1.99988 7.05574 2.22264 6.12475 2.65017 5.28278C3.0777 4.4408 3.69792 3.71163 4.4604 3.15456C5.22287 2.59749 6.10606 2.22825 7.03815 2.07687C7.97023 1.92549 8.92488 1.99625 9.82446 2.28338C10.724 2.57052 11.5432 3.06594 12.2152 3.72933C12.8872 4.39272 13.3931 5.20537 13.6919 6.10117C13.9906 6.99697 14.0737 7.95063 13.9343 8.88459C13.795 9.81855 13.4372 10.7064 12.89 11.476L17.707 16.293C17.8892 16.4816 17.99 16.7342 17.9877 16.9964C17.9854 17.2586 17.8802 17.5094 17.6948 17.6949C17.5094 17.8803 17.2586 17.9854 16.9964 17.9877C16.7342 17.99 16.4816 17.8892 16.293 17.707L11.477 12.891C10.5794 13.5293 9.52335 13.9082 8.42468 13.9862C7.326 14.0641 6.22707 13.8381 5.2483 13.333C4.26953 12.8279 3.44869 12.0631 2.87572 11.1224C2.30276 10.1817 1.99979 9.10147 2 8.00003Z" />
                </Svg>
              </View>
            </TouchableOpacity>
            <TouchableOpacity ref={menuBtn} onPress={onMenuBtnClick} style={tailwind('items-center justify-center pl-2 pr-4 border border-white h-10 bg-white')}>
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
