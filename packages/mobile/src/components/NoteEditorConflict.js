import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Animated, Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import { updateNoteId, mergeNotes } from '../actions';
import {
  DOMAIN_NAME, HASH_SUPPORT, MERGING, DIED_MERGING, LG_WIDTH, BLK_MODE,
} from '../types/const';
import { getListNameMap, getThemeMode } from '../selectors';
import { getListNameDisplayName, getFormattedDT } from '../utils';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';

const NoteEditorConflict = (props) => {

  const { note: conflictedNote, width } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const themeMode = useSelector(state => getThemeMode(state));
  const mergeErrorAnim = useRef(new Animated.Value(0)).current;
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onRightPanelCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updateNoteId(null));
    didClick.current = true;
  };

  const renderLoading = () => {
    if (!(conflictedNote.status === MERGING)) return null;

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 bg-white bg-opacity-25 blk:bg-gray-900 blk:bg-opacity-25')} />
        <View style={[tailwind('absolute top-1/3 left-1/2 items-center justify-center'), { transform: [{ translateX: -10 }, { translateY: -10 }] }]}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
        </View>
      </React.Fragment>
    );
  };

  const renderMergeError = () => {
    if (!(conflictedNote.status === DIED_MERGING)) return null;

    const mergeErrorStyle = {
      transform: [{
        scale: mergeErrorAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
      }],
    };

    return (
      <View style={tailwind('absolute inset-x-0 top-10 flex-row items-start justify-center lg:top-0')}>
        <Animated.View style={[tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg'), mergeErrorStyle]}>
          <View style={tailwind('flex-row')}>
            <View style={tailwind('flex-shrink-0')}>
              <Svg width={24} height={24} style={tailwind('font-normal text-red-400')} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 lg:mt-0.5')}>
              <Text style={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Oops..., something went wrong!</Text>
              <Text style={tailwind('mt-2.5 text-sm font-normal text-red-700')}>Please wait a moment and try again.{'\n'}If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-sm font-normal text-red-700 underline')}>contact us</Text>.</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  useEffect(() => {
    didClick.current = false;
  }, [conflictedNote]);

  useEffect(() => {
    if (conflictedNote.status === MERGING) {
      Animated.timing(mergeErrorAnim, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(mergeErrorAnim, { toValue: 0, ...popupFMV.visible }).start();
    }
  }, [conflictedNote.status, mergeErrorAnim]);

  const style = {
    width: safeAreaWidth < LG_WIDTH ? width : Math.max(442, width),
  };

  return (
    <View style={tailwind('h-full w-full bg-white blk:bg-gray-900')}>
      <ScrollView>
        <View style={[tailwind('px-4 pb-4 sm:px-6 sm:pb-6'), style]}>
          <View style={tailwind('h-16 w-full')} />
          <Text style={tailwind('pt-5 text-lg font-medium text-gray-800 blk:text-gray-200')}>{conflictedNote.notes.length} Versions found</Text>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Please choose the correct version of this note.</Text>
          {conflictedNote.notes.map((note, i) => <ConflictItem key={note.id} listName={conflictedNote.listNames[i]} note={note} status={conflictedNote.status} />)}
          <View style={tailwind('absolute top-0 left-0 lg:hidden')}>
            <TouchableOpacity onPress={onRightPanelCloseBtnClick} style={tailwind('bg-white px-4 py-4 blk:bg-gray-900')}>
              <Svg width={20} height={20} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" clipRule="evenodd" d="M7.70703 14.707C7.5195 14.8945 7.26519 14.9998 7.00003 14.9998C6.73487 14.9998 6.48056 14.8945 6.29303 14.707L2.29303 10.707C2.10556 10.5195 2.00024 10.2652 2.00024 10C2.00024 9.73488 2.10556 9.48057 2.29303 9.29304L6.29303 5.29304C6.48163 5.11088 6.73423 5.01009 6.99643 5.01237C7.25863 5.01465 7.50944 5.11981 7.69485 5.30522C7.88026 5.49063 7.98543 5.74144 7.9877 6.00364C7.98998 6.26584 7.88919 6.51844 7.70703 6.70704L5.41403 9.00004H17C17.2652 9.00004 17.5196 9.1054 17.7071 9.29293C17.8947 9.48047 18 9.73482 18 10C18 10.2653 17.8947 10.5196 17.7071 10.7071C17.5196 10.8947 17.2652 11 17 11H5.41403L7.70703 13.293C7.8945 13.4806 7.99982 13.7349 7.99982 14C7.99982 14.2652 7.8945 14.5195 7.70703 14.707Z" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {renderLoading()}
      {renderMergeError()}
    </View>
  );
};

const _ConflictItem = (props) => {

  const { listName, note, status } = props;
  const listNameMap = useSelector(getListNameMap);
  const [isOpen, setIsOpen] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onOpenBtnClick = () => {
    setIsOpen(!isOpen);
  };

  const onChooseBtnClick = () => {
    if (didClick.current) return;
    dispatch(mergeNotes(note.id));
    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [status]);

  const updatedDTStr = useMemo(() => getFormattedDT(note.updatedDT), [note.updatedDT]);

  let arrowSvg;
  if (isOpen) {
    arrowSvg = (
      <Svg width={20} height={20} style={tailwind('font-normal text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor">
        <Path fillRule="evenodd" clipRule="evenodd" d="M5.29303 7.29302C5.48056 7.10555 5.73487 7.00023 6.00003 7.00023C6.26519 7.00023 6.5195 7.10555 6.70703 7.29302L10 10.586L13.293 7.29302C13.3853 7.19751 13.4956 7.12133 13.6176 7.06892C13.7396 7.01651 13.8709 6.98892 14.0036 6.98777C14.1364 6.98662 14.2681 7.01192 14.391 7.0622C14.5139 7.11248 14.6255 7.18673 14.7194 7.28062C14.8133 7.37452 14.8876 7.48617 14.9379 7.60907C14.9881 7.73196 15.0134 7.86364 15.0123 7.99642C15.0111 8.1292 14.9835 8.26042 14.9311 8.38242C14.8787 8.50443 14.8025 8.61477 14.707 8.70702L10.707 12.707C10.5195 12.8945 10.2652 12.9998 10 12.9998C9.73487 12.9998 9.48056 12.8945 9.29303 12.707L5.29303 8.70702C5.10556 8.51949 5.00024 8.26518 5.00024 8.00002C5.00024 7.73486 5.10556 7.48055 5.29303 7.29302V7.29302Z" />
      </Svg>
    );
  } else {
    arrowSvg = (
      <Svg width={20} height={20} style={tailwind('font-normal text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor">
        <Path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.707C7.10556 14.5195 7.00024 14.2651 7.00024 14C7.00024 13.7348 7.10556 13.4805 7.29303 13.293L10.586 9.99998L7.29303 6.70698C7.11087 6.51838 7.01008 6.26578 7.01236 6.00358C7.01463 5.74138 7.1198 5.49057 7.30521 5.30516C7.49062 5.11975 7.74143 5.01458 8.00363 5.01231C8.26583 5.01003 8.51843 5.11082 8.70703 5.29298L12.707 9.29298C12.8945 9.48051 12.9998 9.73482 12.9998 9.99998C12.9998 10.2651 12.8945 10.5195 12.707 10.707L8.70703 14.707C8.5195 14.8945 8.26519 14.9998 8.00003 14.9998C7.73487 14.9998 7.48056 14.8945 7.29303 14.707Z" />
      </Svg>
    );
  }

  return (
    <View style={tailwind('mt-6 rounded-lg border border-gray-200 blk:border-gray-700')}>
      <View style={tailwind(`rounded-t-lg bg-gray-50 blk:bg-gray-800 sm:flex-row sm:items-start sm:justify-between ${!isOpen ? 'rounded-b-lg' : ''}`)}>
        <View style={tailwind('sm:flex-shrink sm:flex-grow')}>
          <TouchableOpacity onPress={onOpenBtnClick} style={tailwind('w-full flex-row rounded-lg pt-3 pl-2')}>
            {arrowSvg}
            <View style={tailwind('ml-1')}>
              <Text style={tailwind('text-left text-base font-medium text-gray-800 blk:text-gray-200 lg:text-sm')}>Last update on {updatedDTStr}</Text>
              <Text style={tailwind('mt-1 text-left text-sm font-normal text-gray-600 blk:text-gray-300')}>In {getListNameDisplayName(listName, listNameMap)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={tailwind('py-3 pl-2.5 sm:flex-shrink-0 sm:flex-grow-0 sm:pl-6 sm:pr-4')}>
          <TouchableOpacity onPress={onChooseBtnClick} style={tailwind('flex-row items-center self-start rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm blk:border-gray-500 blk:bg-gray-800')}>
            <Svg width={20} height={20} style={tailwind('mr-1 font-normal text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M16.7069 5.29303C16.8944 5.48056 16.9997 5.73487 16.9997 6.00003C16.9997 6.26519 16.8944 6.5195 16.7069 6.70703L8.70692 14.707C8.51939 14.8945 8.26508 14.9998 7.99992 14.9998C7.73475 14.9998 7.48045 14.8945 7.29292 14.707L3.29292 10.707C3.11076 10.5184 3.00997 10.2658 3.01224 10.0036C3.01452 9.74143 3.11969 9.49062 3.3051 9.30521C3.49051 9.1198 3.74132 9.01464 4.00352 9.01236C4.26571 9.01008 4.51832 9.11087 4.70692 9.29303L7.99992 12.586L15.2929 5.29303C15.4804 5.10556 15.7348 5.00024 15.9999 5.00024C16.2651 5.00024 16.5194 5.10556 16.7069 5.29303Z" />
            </Svg>
            <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Choose</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isOpen && <View style={tailwind('px-4 py-5')}>
        <Text style={tailwind('text-lg font-medium text-gray-800 blk:text-gray-200')}>{note.title}</Text>
        <Text style={tailwind('mt-3 text-base font-normal text-gray-600 blk:text-gray-300')}>{note.body}</Text>
      </View>}
    </View>
  );
};

const ConflictItem = React.memo(_ConflictItem);

export default React.memo(NoteEditorConflict);
