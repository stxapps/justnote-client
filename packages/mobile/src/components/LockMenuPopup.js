import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup, updateLockAction } from '../actions';
import {
  LOCK_MENU_POPUP, LOCK_EDITOR_POPUP, LOCK_ACTION_REMOVE_LOCK_NOTE, REMOVE_LOCK,
} from '../types/const';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const LockMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isLockMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.lockMenuPopupPosition);
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
    dispatch(updatePopup(LOCK_MENU_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onRemoveBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    dispatch(updateLockAction(LOCK_ACTION_REMOVE_LOCK_NOTE));
    dispatch(updatePopup(LOCK_EDITOR_POPUP, true, null));
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

  const buttons = (
    <View style={tailwind('py-1')}>
      <TouchableOpacity onPress={onRemoveBtnClick} style={tailwind('w-full px-4 py-3')}>
        <Text style={tailwind('text-left text-sm font-normal text-gray-700 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">{REMOVE_LOCK}</Text>
      </TouchableOpacity>
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
    /* @ts-expect-error */
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
    <View style={tailwind('absolute inset-0')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(LockMenuPopup);
