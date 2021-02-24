import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  updatePopup, updateBulkEdit, clearSelectedNoteIds,
} from '../actions';
import { CONFIRM_DELETE_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { popupFMV } from '../types/animConfigs';

const ConfirmDeletePopup = () => {

  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isConfirmDeletePopupShown);
  //const listName = useSelector(state => state.display.listName);
  //const noteId = useSelector(state => state.display.noteId);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  //const selectedNoteIds = useSelector(state => state.display.selectedNoteIds);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const derivedIsShown = useRef(isShown);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onConfirmDeleteCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(CONFIRM_DELETE_POPUP, false, null));
    didClick.current = true;
  };

  const onConfirmDeleteOkBtnClick = () => {
    if (didClick.current) return;

    if (isBulkEditing) {
      //dispatch(deleteNotes(listName, selectedNoteIds));
      dispatch(clearSelectedNoteIds());
      onConfirmDeleteCancelBtnClick();
      dispatch(updateBulkEdit(false));
    } else {
      //dispatch(deleteNotes(listName, [noteId]));
      onConfirmDeleteCancelBtnClick();
    }

    didClick.current = true;
  };

  const registerPopupBackHandler = (isShown) => {
    if (isShown) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            onConfirmDeleteCancelBtnClick();
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
  };

  useEffect(() => {
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        setDidCloseAnimEnd(true);
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      registerPopupBackHandler(false);
    };
  }, [isShown]);

  if (derivedIsShown.current !== isShown) {
    if (derivedIsShown.current && !isShown) setDidCloseAnimEnd(false);
    derivedIsShown.current = isShown;
  }

  if (!isShown && didCloseAnimEnd) return null;

  const canvasStyle = { paddingLeft: 16 + insets.left, paddingRight: 16 + insets.right };
  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ]
  };

  return (
    <View style={[tailwind('absolute inset-0 items-center justify-center'), canvasStyle]}>
      <TouchableWithoutFeedback onPress={onConfirmDeleteCancelBtnClick}>
        <View style={tailwind('absolute inset-0 opacity-25 bg-black')}></View>
      </TouchableWithoutFeedback>
      <Animated.View style={[tailwind('w-full max-w-48 -mt-8 pt-4 pb-2 rounded-md shadow-lg bg-white'), popupStyle]}>
        <Text style={tailwind('text-base font-normal text-gray-600 text-center')}>Confirm delete?</Text>
        <View style={tailwind('pt-1 flex-row justify-center')}>
          <TouchableOpacity onPress={onConfirmDeleteOkBtnClick} style={tailwind('bg-white m-2 px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm')}>
            <Text style={tailwind('text-sm font-normal text-gray-600')}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirmDeleteCancelBtnClick} style={tailwind('bg-white m-2 px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm')}>
            <Text style={tailwind('text-sm font-normal text-gray-600')}>No</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(ConfirmDeletePopup);
