import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateNoteId, updateBulkEdit } from '../actions';
import {
  discardNote, changeListName, showNoteListMenuPopup, showNLIMPopup,
  updateSettingsPopup,
} from '../actions/chunk';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, DISCARD_ACTION_UPDATE_BULK_EDIT,
  DISCARD_ACTION_SHOW_NOTE_LIST_MENU_POPUP, DISCARD_ACTION_SHOW_NLIM_POPUP,
  DISCARD_ACTION_UPDATE_LIST_NAME, DISCARD_ACTION_UPDATE_TAG_NAME,
} from '../types/const';
import { dialogFMV } from '../types/animConfigs';

import { useSafeAreaInsets, useTailwind } from '.';

const ConfirmDiscardPopup = () => {

  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isConfirmDiscardPopupShown);
  const discardAction = useSelector(state => state.display.discardAction);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onConfirmDiscardCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onConfirmDiscardOkBtnClick = () => {
    if (didClick.current) return;

    if (discardAction === DISCARD_ACTION_CANCEL_EDIT) {
      dispatch(discardNote(false));
    } else if (discardAction === DISCARD_ACTION_UPDATE_NOTE_ID) {
      dispatch(updateNoteId(null, true, false));
    } else if (discardAction === DISCARD_ACTION_CHANGE_LIST_NAME) {
      dispatch(changeListName(null, false));
    } else if (discardAction === DISCARD_ACTION_UPDATE_BULK_EDIT) {
      dispatch(updateBulkEdit(true, null, true, false));
    } else if (discardAction === DISCARD_ACTION_SHOW_NOTE_LIST_MENU_POPUP) {
      dispatch(showNoteListMenuPopup(null, false));
    } else if (discardAction === DISCARD_ACTION_SHOW_NLIM_POPUP) {
      dispatch(showNLIMPopup(null, null, false));
    } else if (
      discardAction === DISCARD_ACTION_UPDATE_LIST_NAME ||
      discardAction === DISCARD_ACTION_UPDATE_TAG_NAME
    ) {
      dispatch(updateSettingsPopup(false, false));
    } else {
      console.log(`Invalid discard action: ${discardAction}`);
    }

    onConfirmDiscardCancelBtnClick();
    didClick.current = true;
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onConfirmDiscardCancelBtnClick();
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
  }, [onConfirmDiscardCancelBtnClick]);

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

  let msg = 'Are you sure you want to discard your unsaved changes to your note? All of your changes will be permanently deleted. This action cannot be undone.';
  if (discardAction === DISCARD_ACTION_UPDATE_LIST_NAME) {
    msg = 'There are some lists still in editing mode. Are you sure you want to discard them?';
  } else if (discardAction === DISCARD_ACTION_UPDATE_TAG_NAME) {
    msg = 'There are some tags still in editing mode. Are you sure you want to discard them?';
  }

  return (
    <View style={[tailwind('absolute inset-0 items-center justify-end px-4 pt-4 pb-20 sm:justify-center sm:p-0'), canvasStyle]}>
      <TouchableWithoutFeedback onPress={onConfirmDiscardCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[tailwind('w-full max-w-lg rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800 sm:my-8 sm:p-6'), popupStyle]}>
        <View style={tailwind('items-center sm:flex-row sm:items-start')}>
          <View style={tailwind('h-12 w-12 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10')}>
            <Svg width={24} height={24} style={tailwind('font-normal text-red-600')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </Svg>
          </View>
          <View style={tailwind('mt-3 flex-shrink flex-grow sm:mt-0 sm:ml-4')}>
            <Text style={tailwind('text-center text-lg font-medium leading-6 text-gray-900 blk:text-white sm:text-left')}>Discard unsaved changes?</Text>
            <View style={tailwind('mt-2')}>
              <Text style={tailwind('text-center text-sm font-normal text-gray-500 blk:text-gray-400 sm:text-left')}>{msg}</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:flex-row sm:pl-4')}>
          <TouchableOpacity onPress={onConfirmDiscardOkBtnClick} style={tailwind('w-full rounded-md border border-red-600 bg-red-600 px-4 py-2 shadow-sm blk:border-red-500 blk:bg-red-500 sm:w-auto')}>
            <Text style={tailwind('text-center text-base font-medium text-white sm:text-sm')}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirmDiscardCancelBtnClick} style={tailwind('mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm blk:border-gray-400 blk:bg-gray-800 sm:mt-0 sm:ml-3 sm:w-auto')}>
            <Text style={tailwind('text-center text-base font-medium text-gray-700 blk:text-gray-300 sm:text-sm')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(ConfirmDiscardPopup);
