import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup } from '../actions';
import { updateNoteDateFormat } from '../actions/chunk';
import {
  DATE_FORMAT_MENU_POPUP, NOTE_DATE_FORMATS, NOTE_DATE_FORMAT_TEXTS,
} from '../types/const';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const DateFormatMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isDateFormatMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.dateFormatMenuPopupPosition);
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
    dispatch(updatePopup(DATE_FORMAT_MENU_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onMenuPopupBtnClick = (value) => {
    if (!value || didClick.current) return;
    onCancelBtnClick();
    dispatch(updateNoteDateFormat(value));
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
    <ScrollView>
      <View style={tailwind('py-1')}>
        {NOTE_DATE_FORMATS.map((format, i) => {
          return (
            <TouchableOpacity key={format} onPress={() => onMenuPopupBtnClick(format)} style={tailwind('w-full px-4 py-3')}>
              <Text style={tailwind('text-left text-sm font-normal text-gray-700 blk:text-gray-200')} numberOfLines={1} ellipsizeMode="tail">{NOTE_DATE_FORMAT_TEXTS[i]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  let popupClassNames = 'absolute overflow-hidden rounded-md bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800';
  let panel;
  let bgStyle = { opacity: 0 };
  if (popupSize) {

    const maxHeight = Math.min(safeAreaHeight - 16, (44 * 5) + (44 / 2) + 4);
    const layouts = createLayouts(
      derivedAnchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth + insets.left, height: safeAreaHeight + insets.top },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const { startX, startY } = getOriginTranslate(
      topOrigin, leftOrigin, popupSize.width, popupSize.height
    );

    const popupStyle = { top, left, maxHeight, opacity: popupAnim, transform: [] };
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

    if (popupSize.width < derivedAnchorPosition.width) {
      popupStyle.width = derivedAnchorPosition.width;
    }

    /* @ts-expect-error */
    bgStyle = { opacity: popupAnim };

    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { minWidth: 96 }, popupStyle]}>
        {buttons}
      </Animated.View>
    );
  } else {
    panel = (
      <Animated.View onLayout={onPopupLayout} style={[tailwind(popupClassNames), { minWidth: 96 }, { top: safeAreaHeight + 256, left: safeAreaWidth + 256 }]}>
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

export default React.memo(DateFormatMenuPopup);
