import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Animated, BackHandler, Keyboard, Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { updateSearchString, updatePopup } from '../actions';
import { SEARCH_POPUP, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';
import { popupFMV } from '../types/animConfigs';

import { useTailwind } from '.';

const NoteListSearchPopup = () => {

  const isShown = useSelector(state => state.display.isSearchPopupShown);
  const searchString = useSelector(state => state.display.searchString);
  const themeMode = useSelector(state => getThemeMode(state));
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const searchInput = useRef(null);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const prevIsShown = useRef(isShown);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSearchInputChange = (e) => {
    dispatch(updateSearchString(e.nativeEvent.text));
  };

  const onSearchClearBtnClick = () => {
    dispatch(updateSearchString(''));
    if (searchInput.current) searchInput.current.focus();
  };

  const onSearchCancelBtnClick = useCallback(() => {
    dispatch(updatePopup(SEARCH_POPUP, false, null));
    Keyboard.dismiss();
  }, [dispatch]);

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onSearchCancelBtnClick();
            return true;
          }
        );
      }
    } else {
      if (popupBackHandler.current) {
        popupBackHandler.current.remove();
        popupBackHandler.current = null;
      }
    }
  }, [onSearchCancelBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start(() => {
        if (!prevIsShown.current && searchInput.current) searchInput.current.focus();
        prevIsShown.current = isShown;
      });
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        requestAnimationFrame(() => {
          if (didMount) setDidCloseAnimEnd(true);
        });
      });
      if (prevIsShown.current && searchInput.current) searchInput.current.blur();
      prevIsShown.current = isShown;
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  const popupStyle = {
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
      {
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * 56, 0],
        }),
      },
    ],
  };
  const searchClearBtnClasses = searchString.length === 0 ? 'hidden relative' : 'flex absolute';
  const searchInputClasses = Platform.OS === 'ios' ? 'leading-5 py-1.5' : 'py-1';

  return (
    <Animated.View style={[tailwind('h-14 flex-row items-center justify-between border-b border-gray-200 pl-4 pr-2 blk:border-gray-700 sm:pl-6 sm:pr-4 lg:hidden'), popupStyle]}>
      <View style={tailwind('flex-1 rounded-md bg-white shadow-sm blk:bg-gray-900')}>
        <TextInput ref={searchInput} onChange={onSearchInputChange} style={tailwind(`w-full rounded-md border border-gray-300 bg-white pl-9 pr-6 text-base font-normal text-gray-700 blk:border-gray-600 blk:bg-gray-900 blk:text-gray-200 ${searchInputClasses}`)} placeholder="Search" placeholderTextColor={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} value={searchString} autoCapitalize="none" />
        <View style={tailwind('absolute inset-y-0 left-0 justify-center pl-3')}>
          <Svg width={16} height={16} style={tailwind('mr-3 font-normal text-gray-400 blk:text-gray-500')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </Svg>
        </View>
        <TouchableOpacity onPress={onSearchClearBtnClick} style={tailwind(`inset-y-0 right-0 justify-center pr-2 ${searchClearBtnClasses}`)}>
          <Svg width={20} height={20} style={tailwind('font-normal text-gray-400 blk:text-gray-500')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
          </Svg>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onSearchCancelBtnClick} style={tailwind('ml-2 flex-shrink-0 flex-grow-0 rounded-md px-2 py-1.5')}>
        <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Cancel</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default React.memo(NoteListSearchPopup);
