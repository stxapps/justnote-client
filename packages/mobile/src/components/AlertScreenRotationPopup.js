import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

import { updatePopup } from '../actions';
import { ALERT_SCREEN_ROTATION_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { dialogFMV } from '../types/animConfigs';

const AlertScreenRotationPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isAlertScreenRotationPopupShown);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = () => {
    // Do nothing
  };

  const onOkBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(ALERT_SCREEN_ROTATION_POPUP, false, null));
    didClick.current = true;
  };

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

    return () => {
      didMount = false;
    };
  }, [isShown, popupAnim]);

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
            <Text style={tailwind('text-lg leading-6 font-medium text-gray-900 text-center sm:text-left', safeAreaWidth)}>Screen rotation</Text>
            <View style={tailwind('mt-2')}>
              <Text style={tailwind('text-sm text-gray-500 font-normal text-center sm:text-left', safeAreaWidth)}>Screen rotation is not fully supported. Please do not rotate your device while editing your note, new changes to your note will be lost. We are sorry for the inconvenience.</Text>
              <Text style={tailwind('text-sm font-normal text-gray-500 mt-3')}>(You can choose to not show this warning again in Settings -&gt; Misc.)</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex-row', safeAreaWidth)}>
          <TouchableOpacity onPress={onOkBtnClick} style={tailwind('w-full rounded-md border border-gray-300 px-4 py-2 bg-white shadow-sm sm:w-auto', safeAreaWidth)}>
            <Text style={tailwind('text-base font-medium text-gray-700 text-center sm:text-sm', safeAreaWidth)}>OK</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(AlertScreenRotationPopup);
