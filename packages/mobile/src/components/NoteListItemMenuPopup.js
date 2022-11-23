import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
  updatePopup, moveNotesWithAction, pinNotes, updateMoveAction,
  updateDeleteAction, updateListNamesMode, shareNote, exportNoteAsPdf,
} from '../actions';
import {
  MY_NOTES, TRASH, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO, PIN, MANAGE_PIN, PINNED,
  SHARE, EXPORT_AS_PDF, NOTE_ITEM_POPUP_MENU,
  NOTE_LIST_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, CONFIRM_DELETE_POPUP,
  MOVE_ACTION_NOTE_ITEM_MENU, DELETE_ACTION_NOTE_ITEM_MENU, LIST_NAMES_MODE_MOVE_NOTES,
} from '../types/const';
import { getListNameMap, makeGetPinStatus } from '../selectors';
import { getListNameDisplayName, getAllListNames } from '../utils';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const NoteListItemMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const isShown = useSelector(state => state.display.isNoteListItemMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.noteListItemMenuPopupPosition
  );
  const listName = useSelector(state => state.display.listName);
  const listNameMap = useSelector(state => getListNameMap(state));
  const selectingNoteId = useSelector(state => state.display.selectingNoteId);
  const pinStatus = useSelector(state => getPinStatus(state, selectingNoteId));
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
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
    dispatch(updatePopup(NOTE_LIST_ITEM_MENU_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMenuPopupBtnClick = (text) => {
    if (!text || didClick.current) return;

    if (text === ARCHIVE) {
      onCancelBtnClick();
      dispatch(moveNotesWithAction(ARCHIVE, MOVE_ACTION_NOTE_ITEM_MENU));
    } else if (text === REMOVE) {
      onCancelBtnClick();
      dispatch(moveNotesWithAction(TRASH, MOVE_ACTION_NOTE_ITEM_MENU));
    } else if (text === RESTORE) {
      onCancelBtnClick();
      dispatch(moveNotesWithAction(MY_NOTES, MOVE_ACTION_NOTE_ITEM_MENU));
    } else if (text === DELETE) {
      dispatch(updateDeleteAction(DELETE_ACTION_NOTE_ITEM_MENU));
      dispatch(updatePopup(CONFIRM_DELETE_POPUP, true, null));
      return; // Don't set didClick to true
    } else if (text === MOVE_TO) {
      dispatch(updateMoveAction(MOVE_ACTION_NOTE_ITEM_MENU));
      dispatch(updateListNamesMode(LIST_NAMES_MODE_MOVE_NOTES));

      onCancelBtnClick();
      dispatch(updatePopup(LIST_NAMES_POPUP, true, anchorPosition));
    } else if (text === PIN) {
      onCancelBtnClick();
      dispatch(pinNotes([selectingNoteId]));
    } else if (text === MANAGE_PIN) {
      onCancelBtnClick();
      dispatch(updatePopup(PIN_MENU_POPUP, true, anchorPosition));
    } else if (text === SHARE) {
      onCancelBtnClick();
      dispatch(shareNote());
    } else if (text === EXPORT_AS_PDF) {
      onCancelBtnClick();
      dispatch(exportNoteAsPdf());
    } else {
      console.log(`In NoteListItemMenuPopup, invalid text: ${text}`);
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

  const populateMenu = () => {
    let menu = null;
    if (listName in NOTE_ITEM_POPUP_MENU) {
      menu = NOTE_ITEM_POPUP_MENU[listName];
    } else {
      menu = NOTE_ITEM_POPUP_MENU[MY_NOTES];
    }

    if (listName === MY_NOTES && getAllListNames(listNameMap).length === 3) {
      menu = menu.slice(0, -1);
    }

    if (listName !== TRASH) {
      // Only when no other pending actions and list name is not TRASH.
      // If busy, the menuBtn will be disabled.
      if (pinStatus === PINNED) menu = [...menu, MANAGE_PIN];
      else if (isUserSignedIn && pinStatus === null) menu = [...menu, PIN];

      menu = [...menu, SHARE, EXPORT_AS_PDF];
    }

    return menu;
  };

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

  const menu = populateMenu();
  const buttons = (
    <View style={tailwind('py-1')}>
      {menu.map(text => {
        let displayText = text;
        if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
        return (
          <TouchableOpacity key={text} onPress={() => onMenuPopupBtnClick(text)} style={tailwind('w-full px-4 py-3')}>
            <Text style={tailwind('text-left text-sm font-normal text-gray-700 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">{displayText}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  let popupClassNames = 'absolute rounded-md bg-white shadow-lg blk:border blk:border-gray-700 blk:bg-gray-800';
  let panel;
  let bgStyle = { opacity: 0 };
  if (popupSize) {

    const layouts = createLayouts(
      derivedAnchorPosition,
      { width: popupSize.width, height: popupSize.height },
      { width: safeAreaWidth + insets.left, height: safeAreaHeight + insets.top },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const { startX, startY } = getOriginTranslate(
      topOrigin, leftOrigin, popupSize.width, popupSize.height
    );

    const popupStyle = { top, left, opacity: popupAnim, transform: [] };
    popupStyle.transform.push({
      translateX: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [startX, 0],
      }),
    });
    popupStyle.transform.push({
      translateY: popupAnim.interpolate({
        inputRange: [0, 1], outputRange: [startY, 0],
      }),
    });
    popupStyle.transform.push({
      scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
    });
    /* @ts-ignore */
    bgStyle = { opacity: popupAnim };

    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { minWidth: 128 }, popupStyle]}>
        {buttons}
      </Animated.View>
    );
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { minWidth: 128 }, { top: safeAreaHeight + 256, left: safeAreaWidth + 256 }]}>
        {buttons}
      </Animated.View>
    );
  }

  return (
    <View style={tailwind('absolute inset-0 bg-transparent shadow-lg')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(NoteListItemMenuPopup);
