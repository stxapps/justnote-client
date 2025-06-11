import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler, Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateExportNoteAsPdfProgress } from '../actions/chunk';
import {
  DOMAIN_NAME, HASH_SUPPORT, SM_WIDTH, NO_PERMISSION_GRANTED,
} from '../types/const';
import { dialogFMV } from '../types/animConfigs';
import { isObject } from '../utils';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const _ExportNoteAsPdfCompletePopup = () => {

  const insets = useSafeAreaInsets();
  const progress = useSelector(state => state.display.exportNoteAsPdfProgress);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const isShown = useMemo(() => {
    if (isObject(progress) && progress.total === 1 && progress.done === 1) return true;
    return false;
  }, [progress]);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);

  const [derivedFName, setDerivedFName] = useState(
    isObject(progress) ? progress.fname : ''
  );

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updateExportNoteAsPdfProgress(null));
    didClick.current = true;
  }, [dispatch]);

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

  if (isObject(progress) && progress.fname !== derivedFName) {
    setDerivedFName(progress.fname);
  }

  if (!isShown && didCloseAnimEnd) return null;

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const popupStyle = {
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
    ],
  };
  const bgStyle = { opacity: popupAnim };

  return (
    <View style={[tailwind('absolute inset-0'), canvasStyle]}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      <View style={tailwind('flex-1 items-center justify-end px-4 pt-4 pb-20 sm:justify-center sm:p-0')}>
        <Animated.View style={[tailwind('w-full max-w-lg rounded-lg bg-white px-4 py-5 shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800 sm:my-8 sm:p-6 sm:pb-6'), popupStyle]}>
          <View style={tailwind('items-center sm:flex-row sm:items-start')}>
            <View style={tailwind('h-12 w-12 flex-shrink-0 flex-grow-0 items-center justify-center rounded-full bg-green-100 sm:h-10 sm:w-10')}>
              <Svg width={24} height={24} style={tailwind('font-normal text-green-600')} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" clipRule="evenodd" d="M16.7069 5.29303C16.8944 5.48056 16.9997 5.73487 16.9997 6.00003C16.9997 6.26519 16.8944 6.5195 16.7069 6.70703L8.70692 14.707C8.51939 14.8945 8.26508 14.9998 7.99992 14.9998C7.73475 14.9998 7.48045 14.8945 7.29292 14.707L3.29292 10.707C3.11076 10.5184 3.00997 10.2658 3.01224 10.0036C3.01452 9.74143 3.11969 9.49062 3.3051 9.30521C3.49051 9.1198 3.74132 9.01464 4.00352 9.01236C4.26571 9.01008 4.51832 9.11087 4.70692 9.29303L7.99992 12.586L15.2929 5.29303C15.4804 5.10556 15.7348 5.00024 15.9999 5.00024C16.2651 5.00024 16.5194 5.10556 16.7069 5.29303Z" />
              </Svg>
            </View>
            <View style={tailwind('mt-3 flex-shrink flex-grow sm:mt-0 sm:ml-4')}>
              <Text style={tailwind('text-center text-lg font-medium leading-6 text-gray-900 blk:text-white sm:text-left')}>Export completed</Text>
              <View style={tailwind('mt-2')}>
                <Text style={tailwind('text-center text-sm font-normal text-gray-500 blk:text-gray-400 sm:text-left')}>The exported PDF file - {derivedFName} - has been saved in Downloads.</Text>
              </View>
            </View>
          </View>
          <View style={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:flex-row sm:pl-4')}>
            <TouchableOpacity onPress={onCancelBtnClick} style={tailwind('w-full rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm blk:border-gray-400 blk:bg-gray-800 sm:w-auto')}>
              <Text style={tailwind('text-center text-base font-medium text-gray-700 blk:text-gray-300 sm:text-sm')}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const _ExportNoteAsPdfErrorPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const progress = useSelector(state => state.display.exportNoteAsPdfProgress);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updateExportNoteAsPdfProgress(null));
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [progress]);

  if (!isObject(progress) || progress.total !== -1) return null;

  const canvasStyle = {
    paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
  };

  let title, body;
  if (progress.error === NO_PERMISSION_GRANTED) {
    title = 'Permission denied!';
    body = (
      <React.Fragment>
        <Text style={tailwind('mt-2.5 text-sm font-normal leading-6 text-red-700')}>We don't have permission to save the exported PDF file in Downloads.</Text>
        <Text style={tailwind('mt-2 text-sm font-normal leading-6 text-red-700')}>Please grant this permission in Settings -{'>'} Apps -{'>'} Permissions.</Text>
      </React.Fragment>
    );
  } else {
    title = 'Exporting Note Error!';
    body = (
      <React.Fragment>
        <Text style={tailwind('mt-2.5 text-sm font-normal leading-6 text-red-700')}>Please wait a moment and try again. {safeAreaWidth < SM_WIDTH ? '' : '\n'}If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-sm font-normal leading-6 text-red-700 underline')}>contact us</Text>.</Text>
        <Text style={tailwind('mt-2 text-sm font-normal leading-6 text-red-700')} numberOfLines={3} ellipsizeMode="tail">{progress.error}</Text>
      </React.Fragment>
    );
  }

  return (
    <View style={[tailwind('absolute inset-x-0 top-14 flex-row items-start justify-center md:top-0'), canvasStyle]}>
      <View style={tailwind('w-full max-w-md')}>
        <View style={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow lg:mt-0.5')}>
              <Text style={tailwind('mr-4 text-left text-base font-medium text-red-800 lg:text-sm')}>{title}</Text>
              {body}
            </View>
          </View>
          <TouchableOpacity onPress={onCloseBtnClick} style={tailwind('absolute top-1 right-1 rounded-md bg-red-50 p-1.5')}>
            <Svg style={tailwind('font-normal text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const ExportNoteAsPdfCompletePopup = React.memo(_ExportNoteAsPdfCompletePopup);
export const ExportNoteAsPdfErrorPopup = React.memo(_ExportNoteAsPdfErrorPopup);
