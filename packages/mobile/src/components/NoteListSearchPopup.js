import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Animated, BackHandler, Keyboard,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { updateSearchString, updatePopup } from '../actions';
import { SEARCH_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { popupFMV } from '../types/animConfigs';

const NoteListSearchPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isSearchPopupShown);
  const searchString = useSelector(state => state.display.searchString);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const searchInput = useRef(null);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const dispatch = useDispatch();

  const onSearchInputChange = (e) => {
    dispatch(updateSearchString(e.nativeEvent.text));
  };

  const onSearchClearBtnClick = () => {
    dispatch(updateSearchString(''));
    searchInput.current.focus();
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
        if (searchInput.current) searchInput.current.focus();
      });
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        if (didMount) setDidCloseAnimEnd(true);
      });
      if (searchInput.current) searchInput.current.blur();
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

  return (
    <Animated.View style={[tailwind('h-14 border-b border-gray-200 flex-row items-center justify-between px-4 sm:px-6 lg:hidden', safeAreaWidth), popupStyle]}>
      <View style={tailwind('flex-1 rounded-md bg-white shadow-sm')}>
        <View style={tailwind('absolute inset-y-0 left-0 pl-3 justify-center')}>
          <Svg width={16} height={16} style={tailwind('mr-3 text-gray-400 font-normal')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </Svg>
        </View>
        <TextInput ref={searchInput} onChange={onSearchInputChange} style={tailwind('w-full pl-9 pr-6 py-1.5 text-base font-normal leading-5 text-gray-700 border border-gray-300 rounded-md')} placeholder="Search" placeholderTextColor="rgba(113, 128, 150, 1)" value={searchString} autoCapitalize="none" autoCompleteType="off" autoCorrect={false} />
        <TouchableOpacity onPress={onSearchClearBtnClick} style={tailwind(`pr-2 ${searchClearBtnClasses} inset-y-0 right-0 justify-center`)}>
          <Svg width={20} height={20} style={tailwind('text-gray-400 font-normal rounded-full')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
          </Svg>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onSearchCancelBtnClick} style={tailwind('ml-2 px-1 py-1 flex-grow-0 flex-shrink-0 rounded-md')}>
        <Text style={tailwind('text-sm font-normal text-gray-500')}>Cancel</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default React.memo(NoteListSearchPopup);
