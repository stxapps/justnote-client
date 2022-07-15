import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, BackHandler } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateBulkEdit, updateNoteId, fetch, sync } from '../actions';
import { TRASH, NEW_NOTE, MAX_SELECTED_NOTE_IDS } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';
import NoteListTopBar from './NoteListTopBar';
import NoteListItems from './NoteListItems';
import LoadingNoteListItems from './LoadingNoteListItems';

const NoteList = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isMaxErrorShown = useSelector(state => state.display.isSelectedNoteIdsMaxErrorShown);
  const didFetch = useSelector(state => state.display.didFetch);
  const didFetchSettings = useSelector(state => state.display.didFetchSettings);
  const fetchedListNames = useSelector(state => state.display.fetchedListNames);
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const isUserDummy = useSelector(state => state.user.isUserDummy);
  const maxErrorAnim = useRef(new Animated.Value(0)).current;
  const bulkEditBackHandler = useRef(null);
  const dispatch = useDispatch();

  const registerBulkEditBackHandler = useCallback((isShown) => {
    if (isShown) {
      if (!bulkEditBackHandler.current) {
        bulkEditBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            dispatch(updateBulkEdit(false));
            return true;
          }
        );
      }
    } else {
      if (bulkEditBackHandler.current) {
        bulkEditBackHandler.current.remove();
        bulkEditBackHandler.current = null;
      }
    }
  }, [dispatch]);

  const onAddBtnClick = () => {
    dispatch(updateNoteId(NEW_NOTE, false, true));
  };

  const renderMaxError = () => {
    if (!isMaxErrorShown) return null;

    const maxErrorStyle = {
      transform: [{
        scale: maxErrorAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
      }],
    };

    return (
      <View style={tailwind('absolute top-0 inset-x-0 justify-center items-center')}>
        <Animated.View style={[tailwind('m-4 p-4 bg-red-50 rounded-md shadow-lg'), maxErrorStyle]}>
          <View style={tailwind('flex-row w-full')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('text-red-400 font-normal')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow')}>
              <Text style={tailwind('text-sm text-red-800 font-normal leading-5 text-left')}>To prevent network overload, up to {MAX_SELECTED_NOTE_IDS} items can be selected.</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  useEffect(() => {
    if (!fetchedListNames.includes(listName)) {
      dispatch(fetch(didFetch ? false : null, !didFetchSettings));
    }
  }, [listName, didFetch, didFetchSettings, fetchedListNames, dispatch]);

  useEffect(() => {
    // As dummy then signed in, need to sync
    if (isUserSignedIn && isUserDummy) dispatch(sync());
  }, [isUserSignedIn, isUserDummy, dispatch]);

  useEffect(() => {
    registerBulkEditBackHandler(isBulkEditing);
    return () => {
      registerBulkEditBackHandler(false);
    };
  }, [isBulkEditing, registerBulkEditBackHandler]);

  useEffect(() => {
    if (isMaxErrorShown) {
      Animated.timing(maxErrorAnim, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(maxErrorAnim, { toValue: 0, ...popupFMV.visible }).start();
    }
  }, [isMaxErrorShown, maxErrorAnim]);

  const noteListItems = fetchedListNames.includes(listName) ? <NoteListItems /> : <LoadingNoteListItems />;

  return (
    <View style={[tailwind('w-full min-w-64 h-full'), { elevation: 0 }]}>
      {/* TopBar */}
      <NoteListTopBar onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Main */}
      {noteListItems}
      {/* Add button */}
      {!isBulkEditing && (listName !== TRASH) && <TouchableOpacity onPress={onAddBtnClick} style={tailwind('absolute right-4 bottom-4 rounded-full bg-green-600 w-16 h-16 shadow-md items-center justify-center lg:relative lg:hidden', safeAreaWidth)}>
        <Svg width={40} height={40} style={tailwind('text-white font-normal')} viewBox="0 0 40 40" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M20 10C20.5304 10 21.0391 10.2107 21.4142 10.5858C21.7893 10.9609 22 11.4696 22 12V18H28C28.5304 18 29.0391 18.2107 29.4142 18.5858C29.7893 18.9609 30 19.4696 30 20C30 20.5304 29.7893 21.0391 29.4142 21.4142C29.0391 21.7893 28.5304 22 28 22H22V28C22 28.5304 21.7893 29.0391 21.4142 29.4142C21.0391 29.7893 20.5304 30 20 30C19.4696 30 18.9609 29.7893 18.5858 29.4142C18.2107 29.0391 18 28.5304 18 28V22H12C11.4696 22 10.9609 21.7893 10.5858 21.4142C10.2107 21.0391 10 20.5304 10 20C10 19.4696 10.2107 18.9609 10.5858 18.5858C10.9609 18.2107 11.4696 18 12 18H18V12C18 11.4696 18.2107 10.9609 18.5858 10.5858C18.9609 10.2107 19.4696 10 20 10Z" />
        </Svg>
      </TouchableOpacity>}
      {renderMaxError()}
    </View>
  );
};

export default React.memo(NoteList);
