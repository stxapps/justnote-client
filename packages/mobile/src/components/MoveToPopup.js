import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { updatePopup, updateBulkEdit, clearSelectedNoteIds } from '../actions';
import { MOVE_TO_POPUP, ARCHIVE, TRASH, LG_WIDTH } from '../types/const';
import { getListNameMap } from '../selectors';
import { getLastHalfHeight } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';
import { popupFMV } from '../types/animConfigs';

const MoveToPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isMoveToPopupShown);
  const anchorPosition = useSelector(state => state.display.moveToPopupPosition);
  const listName = useSelector(state => state.display.listName);
  const listNameMap = useSelector(getListNameMap);
  //const noteId = useSelector(state => state.display.noteId);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  //const selectedNoteIds = useSelector(state => state.display.selectedNoteIds);
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const derivedIsShown = useRef(isShown);
  const derivedAnchorPosition = useRef(anchorPosition);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onMoveToCancelBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(MOVE_TO_POPUP, false, null));
    didClick.current = true;
  };

  const onMoveToItemBtnClick = (listName) => {
    if (didClick.current) return;

    if (isBulkEditing) {
      //dispatch(moveNotes(listName, selectedNoteIds));
      dispatch(clearSelectedNoteIds());
      onMoveToCancelBtnClick();
      dispatch(updateBulkEdit(false));
    } else {
      //dispatch(moveNotes(listName, [noteId]));
      onMoveToCancelBtnClick();
    }

    didClick.current = true;
  };

  const onPopupLayout = (e) => {
    if (!popupSize) {
      setPopupSize(e.nativeEvent.layout);
    }
  };

  const registerPopupBackHandler = (isShown) => {
    if (isShown) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            onMoveToCancelBtnClick();
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
    if (isShown && popupSize) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    }
  }, [isShown, popupSize]);

  useEffect(() => {
    if (isShown) {
      didClick.current = false;
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        setPopupSize(null);
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

  if (anchorPosition && anchorPosition !== derivedAnchorPosition.current) {
    derivedAnchorPosition.current = anchorPosition;
  }

  const moveTo = [];
  for (const listNameObj of listNameMap) {
    if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
    if (listName === listNameObj.listName) continue;

    moveTo.push(listNameObj);
  }

  const buttons = (
    <View style={tailwind('py-1')}>
      {moveTo.map(listNameObj => {
        return (
          <TouchableOpacity key={listNameObj.listName} onPress={() => onMoveToItemBtnClick(listNameObj.listName)} style={tailwind('w-full px-4 py-3')}>
            <Text style={tailwind('text-sm font-normal text-gray-700')} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  let popupClassNames = 'absolute min-w-28 max-w-64 mt-1 rounded-md shadow-lg bg-white';
  let panel;
  if (popupSize) {

    const maxHeight = getLastHalfHeight(Math.min(256, safeAreaHeight - 16), 44, 4, 4);
    const layouts = createLayouts(
      derivedAnchorPosition.current,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight }
    );
    const triggerOffsetX = safeAreaWidth < LG_WIDTH ? 0 : 25;
    const triggerOffsetY = safeAreaWidth < LG_WIDTH ? 52 : derivedAnchorPosition.current.height;
    const triggerOffsetWidth = safeAreaWidth < LG_WIDTH ? -8 : 0;
    const triggerOffsets = {
      x: triggerOffsetX, y: triggerOffsetY, width: triggerOffsetWidth, height: 0
    };
    const popupPosition = computePosition(layouts, triggerOffsets, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const originClassName = getOriginClassName(topOrigin, leftOrigin);

    const popupStyle = { top, left, maxHeight, opacity: popupAnim, transform: [] };
    if (originClassName === 'origin-top-left') {
      popupStyle.transform.push({
        translateX: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * popupSize.width, 0]
        })
      });
      popupStyle.transform.push({
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * popupSize.height, 0]
        })
      });
    } else if (originClassName === 'origin-top-right') {
      popupStyle.transform.push({
        translateX: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [0.05 * popupSize.width, 0]
        })
      });
      popupStyle.transform.push({
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * popupSize.height, 0]
        })
      });
    }
    popupStyle.transform.push({
      scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] })
    });

    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), popupStyle]}>
        <ScrollView>
          {buttons}
        </ScrollView>
      </Animated.View>
    );
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { top: safeAreaHeight, left: safeAreaWidth }]}>
        {buttons}
      </Animated.View>
    );
  }

  return (
    <React.Fragment>
      <TouchableWithoutFeedback onPress={onMoveToCancelBtnClick}>
        <View style={tailwind('absolute inset-0 opacity-25 bg-black')}></View>
      </TouchableWithoutFeedback>
      { panel}
    </React.Fragment >
  );
};

export default React.memo(MoveToPopup);
