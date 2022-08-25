import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopup, updateTheme } from '../actions';
import { TIME_PICK_POPUP, CUSTOM_MODE } from '../types/const';
import { isString, getFormattedTime, get24HFormattedTime } from '../utils';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import { computePosition, createLayouts, getOriginTranslate } from './MenuPopupRenderer';

const TimePickPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isTimePickPopupShown);
  const anchorPosition = useSelector(state => state.display.timePickPopupPosition);
  const updatingThemeMode = useSelector(state => state.display.updatingThemeMode);
  const customOptions = useSelector(state => state.localSettings.themeCustomOptions);
  const is24HFormat = useSelector(state => state.window.is24HFormat);
  const [popupSize, setPopupSize] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const hourScrollView = useRef(null);
  const minuteScrollView = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const value = useMemo(() => {
    const option = customOptions.filter(opt => opt.mode === updatingThemeMode)[0];
    if (!option) return { hour: '', minute: '', period: null };

    return getFormattedTime(option.startTime, is24HFormat);
  }, [updatingThemeMode, customOptions, is24HFormat]);

  const is24HFormatRef = useRef(is24HFormat);
  const valueRef = useRef(value);

  const onCancelBtnClick = useCallback(() => {
    dispatch(updatePopup(TIME_PICK_POPUP, false, null));
  }, [dispatch]);

  const onTimeBtnClick = useCallback((hour, minute, period) => {
    const _themeMode = CUSTOM_MODE;
    const _customOptions = customOptions.filter(opt => {
      return opt.mode !== updatingThemeMode;
    }).map(opt => {
      return { ...opt };
    });

    const updatingOption = customOptions.filter(opt => {
      return opt.mode === updatingThemeMode;
    })[0];
    const timeObj = getFormattedTime(updatingOption.startTime, is24HFormat);

    if (isString(hour) && hour.length > 0) timeObj.hour = hour;
    if (isString(minute) && minute.length > 0) timeObj.minute = minute;
    if (['AM', 'PM'].includes(period)) timeObj.period = period;

    const newStartTime = get24HFormattedTime(
      timeObj.hour, timeObj.minute, timeObj.period
    );
    _customOptions.push({ ...updatingOption, startTime: newStartTime });

    dispatch(updateTheme(_themeMode, _customOptions));
  }, [customOptions, is24HFormat, updatingThemeMode, dispatch]);

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

  const scrollToValue = useCallback(() => {
    const ITEM_HEIGHT = 48;

    const hNum = parseInt(valueRef.current.hour, 10);
    const mNum = parseInt(valueRef.current.minute, 10);

    let offsetTop;

    if (is24HFormatRef.current) offsetTop = hNum * ITEM_HEIGHT;
    else offsetTop = hNum === 12 ? 0 : hNum * ITEM_HEIGHT;

    if (offsetTop > popupSize.height - ITEM_HEIGHT) {
      offsetTop -= (popupSize.height / 2);
    } else {
      offsetTop = 0;
    }
    hourScrollView.current.scrollTo({ x: 0, y: offsetTop, animated: false });

    offsetTop = mNum * ITEM_HEIGHT;
    if (offsetTop > popupSize.height - ITEM_HEIGHT) {
      offsetTop -= (popupSize.height / 2);
    } else {
      offsetTop = 0;
    }
    minuteScrollView.current.scrollTo({ x: 0, y: offsetTop, animated: false });
  }, [popupSize]);

  useEffect(() => {
    is24HFormatRef.current = is24HFormat;
    valueRef.current = value;
  }, [is24HFormat, value]);

  useEffect(() => {
    if (isShown && popupSize) {
      scrollToValue();
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    }
  }, [isShown, popupSize, popupAnim, scrollToValue]);

  useEffect(() => {
    let didMount = true;
    if (!isShown) {
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

  const hours = [];
  if (is24HFormat) {
    for (let i = 0; i < 24; i++) hours.push(String(i).padStart(2, '0'));
  } else {
    hours.push(String(12).padStart(2, '0'));
    for (let i = 1; i < 12; i++) hours.push(String(i).padStart(2, '0'));
  }
  const minutes = [];
  for (let i = 0; i < 60; i++) minutes.push(String(i).padStart(2, '0'));

  const buttons = (
    <View style={[tailwind('max-h-80 flex-row py-1 pl-1')]}>
      <ScrollView ref={hourScrollView}>
        <View style={tailwind('pr-1')}>
          {hours.map(hour => {
            return (
              <TouchableOpacity key={hour} onPress={() => onTimeBtnClick(hour)} style={tailwind(`px-5 py-3.5 ${hour === value.hour ? 'bg-gray-100' : ''}`)}>
                <Text style={tailwind('text-sm font-normal text-gray-700')}>{hour}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <ScrollView ref={minuteScrollView}>
        <View style={tailwind('pr-1')}>
          {minutes.map(minute => {
            return (
              <TouchableOpacity key={minute} onPress={() => onTimeBtnClick(null, minute)} style={tailwind(`px-5 py-3.5 ${minute === value.minute ? 'bg-gray-100' : ''}`)}>
                <Text style={tailwind('text-sm font-normal text-gray-700')}>{minute}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {!is24HFormat && <View style={tailwind('pr-1')}>
        <TouchableOpacity onPress={() => onTimeBtnClick(null, null, 'AM')} style={tailwind(`px-5 py-3.5 ${value.period === 'AM' ? 'bg-gray-100' : ''}`)}>
          <Text style={tailwind('text-sm font-normal text-gray-700')}>AM</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTimeBtnClick(null, null, 'PM')} style={tailwind(`px-5 py-3.5 ${value.period === 'PM' ? 'bg-gray-100' : ''}`)}>
          <Text style={tailwind('text-sm font-normal text-gray-700')}>PM</Text>
        </TouchableOpacity>
      </View>}
    </View>
  );

  let popupClassNames = 'absolute rounded-md border border-gray-100 bg-white shadow-xl';
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
    <View style={tailwind('absolute inset-0 bg-transparent shadow-xl')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(TimePickPopup);
