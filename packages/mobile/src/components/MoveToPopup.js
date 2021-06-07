import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { updatePopup, moveNotes } from '../actions';
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
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onMoveToCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(MOVE_TO_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMoveToItemBtnClick = (selectedListName) => {
    if (didClick.current) return;
    dispatch(moveNotes(selectedListName));
    onMoveToCancelBtnClick();
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
  }, [onMoveToCancelBtnClick]);

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
      derivedAnchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight }
    );
    const triggerOffsetX = safeAreaWidth < LG_WIDTH ? 0 : 25;
    const triggerOffsetY = safeAreaWidth < LG_WIDTH ? 52 : derivedAnchorPosition.height;
    const triggerOffsetWidth = safeAreaWidth < LG_WIDTH ? -8 : -25;
    const triggerOffsets = {
      x: triggerOffsetX, y: triggerOffsetY, width: triggerOffsetWidth, height: 0,
    };
    const popupPosition = computePosition(layouts, triggerOffsets, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const originClassName = getOriginClassName(topOrigin, leftOrigin);

    const popupStyle = { top, left, maxHeight, opacity: popupAnim, transform: [] };
    if (originClassName === 'origin-top-left') {
      popupStyle.transform.push({
        translateX: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * popupSize.width, 0],
        }),
      });
      popupStyle.transform.push({
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * popupSize.height, 0],
        }),
      });
    } else if (originClassName === 'origin-top-right') {
      popupStyle.transform.push({
        translateX: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [0.05 * popupSize.width, 0],
        }),
      });
      popupStyle.transform.push({
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * popupSize.height, 0],
        }),
      });
    }
    popupStyle.transform.push({
      scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
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
        <View style={tailwind('absolute inset-0 opacity-25 bg-black')} />
      </TouchableWithoutFeedback>
      { panel}
    </React.Fragment >
  );
};

export default React.memo(MoveToPopup);
