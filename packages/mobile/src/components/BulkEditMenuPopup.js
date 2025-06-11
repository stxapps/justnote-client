import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup } from '../actions';
import {
  updateMoveAction, updateListNamesMode, bulkPinNotes, bulkUnpinNotes,
  updateTagEditorPopup,
} from '../actions/chunk';
import {
  BULK_EDIT_MENU_POPUP, LIST_NAMES_POPUP, MOVE_TO, PIN, UNPIN, MANAGE_TAGS, MY_NOTES,
  ARCHIVE, TRASH, MOVE_ACTION_NOTE_COMMANDS, LIST_NAMES_MODE_MOVE_NOTES,
} from '../types/const';
import { popupFMV } from '../types/animConfigs';
import { computePositionTranslate } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const BulkEditMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isBulkEditMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.bulkEditMenuPopupPosition
  );
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const selectedNoteIds = useSelector(state => state.display.selectedNoteIds);
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(BULK_EDIT_MENU_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current) return;

    if (text === MOVE_TO) {
      onCancelBtnClick();
      dispatch(updateMoveAction(MOVE_ACTION_NOTE_COMMANDS));
      dispatch(updateListNamesMode(LIST_NAMES_MODE_MOVE_NOTES));
      dispatch(updatePopup(LIST_NAMES_POPUP, true, anchorPosition));
    } else if (text === PIN) {
      onCancelBtnClick();
      dispatch(bulkPinNotes(selectedNoteIds));
    } else if (text === UNPIN) {
      onCancelBtnClick();
      dispatch(bulkUnpinNotes(selectedNoteIds));
    } else if (text === MANAGE_TAGS) {
      onCancelBtnClick();
      dispatch(updateTagEditorPopup(true, true));
    } else {
      console.log(`In BulkEditMenuPopup, invalid text: ${text}`);
      return; // Don't set didClick to true
    }

    didClick.current = true;
  };

  const onPopupLayout = (e) => {
    if (!popupSize) {
      setPopupSize(e.nativeEvent.layout);
    }
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
    if (isShown && popupSize) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    }
  }, [isShown, popupSize, popupAnim]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        if (didMount) {
          setPopupSize(null);
          setDidCloseAnimEnd(true);
        }
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

  if (anchorPosition && anchorPosition !== derivedAnchorPosition) {
    setDerivedAnchorPosition(anchorPosition);
  }

  if (!derivedAnchorPosition) return null;

  let menu = [];
  const rListName = [MY_NOTES, ARCHIVE, TRASH].includes(listName) ? listName : MY_NOTES;
  if (queryString === '') {
    if (rListName === MY_NOTES) menu.push(MOVE_TO);
  }
  menu = [...menu, MANAGE_TAGS, PIN, UNPIN];

  const buttons = (
    <View style={tailwind('pb-1')}>
      <View style={tailwind('h-11 flex-row items-center justify-start pl-4 pr-4 pt-1')}>
        <Text style={tailwind('text-left text-sm font-semibold text-gray-600 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">Actions</Text>
      </View>
      {menu.map((text, i) => {
        let btnClassNames = 'py-2.5';
        if (i === 0) btnClassNames += ' -mt-0.5';
        return (
          <TouchableOpacity key={text} onPress={() => onMenuPopupClick(text)} style={tailwind(`w-full pl-4 pr-4 ${btnClassNames}`)}>
            <Text style={tailwind('text-left text-sm font-normal text-gray-700 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">{text}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const popupClassNames = 'absolute min-w-36 rounded-md bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800';

  let panel, bgStyle = { opacity: 0 };
  if (popupSize) {
    const posTrn = computePositionTranslate(
      derivedAnchorPosition,
      { width: popupSize.width, height: popupSize.height },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );

    const popupStyle = {
      top: posTrn.top, left: posTrn.left, opacity: popupAnim, transform: [],
    };
    popupStyle.transform.push({
      translateX: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [posTrn.startX, 0],
      }),
    });
    popupStyle.transform.push({
      translateY: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [posTrn.startY, 0],
      }),
    });
    popupStyle.transform.push({
      scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
    });

    /* @ts-expect-error */
    bgStyle = { opacity: popupAnim };

    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), popupStyle]}>
        {buttons}
      </Animated.View>
    );
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { top: safeAreaHeight + 256, left: safeAreaWidth + 256 }]}>
        {buttons}
      </Animated.View>
    );
  }

  return (
    <View style={tailwind('absolute inset-0')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(BulkEditMenuPopup);
