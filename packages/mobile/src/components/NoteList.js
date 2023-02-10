import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, BackHandler } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateBulkEdit, updateNoteId, fetch, sync } from '../actions';
import {
  TRASH, NEW_NOTE, NEW_NOTE_OBJ, MAX_SELECTED_NOTE_IDS, VALID,
} from '../types/const';
import { makeGetUnsavedNote } from '../selectors';
import { popupFMV } from '../types/animConfigs';

import { useTailwind } from '.';
import NoteListTopBar from './NoteListTopBar';
import NoteListItems from './NoteListItems';
import LoadingNoteListItems from './LoadingNoteListItems';

const NoteList = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const getUnsavedNote = useMemo(makeGetUnsavedNote, []);
  const listName = useSelector(state => state.display.listName);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isMaxErrorShown = useSelector(state => state.display.isSelectedNoteIdsMaxErrorShown);
  const fetchedListNames = useSelector(state => state.display.fetchedListNames);
  const unsavedNote = useSelector(state => getUnsavedNote(state, NEW_NOTE_OBJ));
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const isUserDummy = useSelector(state => state.user.isUserDummy);
  const maxErrorAnim = useRef(new Animated.Value(0)).current;
  const bulkEditBackHandler = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const isUnsavedValid = unsavedNote.status === VALID;

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
      <View style={tailwind('absolute inset-x-0 top-0 items-center justify-center')}>
        <Animated.View style={[tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg'), maxErrorStyle]}>
          <View style={tailwind('w-full flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow')}>
              <Text style={tailwind('text-left text-sm font-normal leading-5 text-red-800')}>To prevent network overload, up to {MAX_SELECTED_NOTE_IDS} items can be selected.</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  useEffect(() => {
    if (!fetchedListNames.includes(listName)) dispatch(fetch());
  }, [listName, fetchedListNames, dispatch]);

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
    <View style={[tailwind('h-full w-full min-w-64'), { elevation: 0 }]}>
      {/* TopBar */}
      <NoteListTopBar onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Main */}
      {noteListItems}
      {/* Add button */}
      {!isBulkEditing && (listName !== TRASH) && <TouchableOpacity onPress={onAddBtnClick} style={tailwind('absolute right-4 bottom-4 h-16 w-16 items-center justify-center rounded-full bg-green-600 shadow-md lg:relative lg:hidden')}>
        <Svg width={40} height={40} style={tailwind('font-normal text-white')} viewBox={isUnsavedValid ? '0 0 20 20' : '0 0 40 40'} fill="currentColor">
          {isUnsavedValid ? <Path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97231 16.8756 4.2181C16.9762 4.46389 17.0268 4.72725 17.0245 4.99281C17.0222 5.25837 16.967 5.52081 16.8622 5.76482C16.7574 6.00883 16.605 6.22952 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" /> : <Path fillRule="evenodd" clipRule="evenodd" d="M20 10C20.5304 10 21.0391 10.2107 21.4142 10.5858C21.7893 10.9609 22 11.4696 22 12V18H28C28.5304 18 29.0391 18.2107 29.4142 18.5858C29.7893 18.9609 30 19.4696 30 20C30 20.5304 29.7893 21.0391 29.4142 21.4142C29.0391 21.7893 28.5304 22 28 22H22V28C22 28.5304 21.7893 29.0391 21.4142 29.4142C21.0391 29.7893 20.5304 30 20 30C19.4696 30 18.9609 29.7893 18.5858 29.4142C18.2107 29.0391 18 28.5304 18 28V22H12C11.4696 22 10.9609 21.7893 10.5858 21.4142C10.2107 21.0391 10 20.5304 10 20C10 19.4696 10.2107 18.9609 10.5858 18.5858C10.9609 18.2107 11.4696 18 12 18H18V12C18 11.4696 18.2107 10.9609 18.5858 10.5858C18.9609 10.2107 19.4696 10 20 10Z" />}
        </Svg>
      </TouchableOpacity>}
      {renderMaxError()}
    </View>
  );
};

export default React.memo(NoteList);
