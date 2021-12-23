import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

import { updatePopup, signOut } from '../actions';
import { CONFIRM_EXIT_DUMMY_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { dialogFMV } from '../types/animConfigs';

const ConfirmExitDummyPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isConfirmExitDummyPopupShown);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(CONFIRM_EXIT_DUMMY_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onOkBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(signOut());
    didClick.current = true;
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onCancelBtnClick();
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
  }, [onCancelBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...dialogFMV.visible }).start();
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...dialogFMV.hidden }).start(() => {
        if (didMount) setDidCloseAnimEnd(true);
      });
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

  const canvasStyle = { paddingLeft: 16 + insets.left, paddingRight: 16 + insets.right };
  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  const bgStyle = { opacity: popupAnim };

  return (
    <View style={[tailwind('absolute inset-0 items-center justify-end pt-4 px-4 pb-20 elevation-xl sm:justify-center sm:p-0', safeAreaWidth), canvasStyle]}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[tailwind('w-full max-w-lg bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl sm:my-8 sm:p-6', safeAreaWidth), popupStyle]}>
        <View style={tailwind('items-center sm:flex-row sm:items-start', safeAreaWidth)}>
          <View style={tailwind('flex-grow-0 flex-shrink-0 items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:h-10 sm:w-10', safeAreaWidth)}>
            <Svg width={24} height={24} style={tailwind('text-red-600 font-normal')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </Svg>
          </View>
          <View style={tailwind('flex-grow flex-shrink mt-3 sm:mt-0 sm:ml-4', safeAreaWidth)}>
            <Text style={tailwind('text-lg leading-6 font-medium text-gray-900 text-center sm:text-left', safeAreaWidth)}>Delete everything and exit?</Text>
            <View style={tailwind('mt-2')}>
              <Text style={tailwind('text-sm text-gray-500 font-normal text-center sm:text-left', safeAreaWidth)}>Without an account, when exit, everything will be deleted forver. You can sign up first to encrypt and sync all your notes to server.</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex-row', safeAreaWidth)}>
          <TouchableOpacity onPress={onOkBtnClick} style={tailwind('w-full rounded-md border border-red-600 shadow-sm px-4 py-2 bg-red-600 sm:w-auto', safeAreaWidth)}>
            <Text style={tailwind('text-base font-medium text-white text-center sm:text-sm', safeAreaWidth)}>Delete everything and exit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancelBtnClick} style={tailwind('mt-3 w-full rounded-md border border-gray-300 px-4 py-2 bg-white shadow-sm sm:mt-0 sm:ml-3 sm:w-auto', safeAreaWidth)}>
            <Text style={tailwind('text-base font-medium text-gray-700 text-center sm:text-sm', safeAreaWidth)}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(ConfirmExitDummyPopup);
