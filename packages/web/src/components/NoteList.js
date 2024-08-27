import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updateNoteIdUrlHash } from '../actions';
import { fetch } from '../actions/chunk';
import {
  SD_HUB_URL, TRASH, NEW_NOTE, NEW_NOTE_OBJ, MAX_SELECTED_NOTE_IDS,
  SD_MAX_SELECTED_NOTE_IDS, VALID, LOCKED,
} from '../types/const';
import {
  getIsShowingNoteInfosNull, makeGetUnsavedNote, getCurrentLockListStatus,
} from '../selectors';
import { popupFMV } from '../types/animConfigs';

import { useTailwind } from '.';
import NoteListTopBar from './NoteListTopBar';
import NoteListItems from './NoteListItems';
import NoteListLock from './NoteListLock';
import LoadingNoteListItems from './LoadingNoteListItems';

const NoteList = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const getUnsavedNote = useMemo(makeGetUnsavedNote, []);
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const didFetch = useSelector(state => state.display.didFetch);
  const didFetchSettings = useSelector(state => state.display.didFetchSettings);
  const isShowingNoteInfosNull = useSelector(state => getIsShowingNoteInfosNull(state));
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isMaxErrorShown = useSelector(
    state => state.display.isSelectedNoteIdsMaxErrorShown
  );
  const unsavedNote = useSelector(state => getUnsavedNote(state, NEW_NOTE_OBJ));
  const lockStatus = useSelector(state => getCurrentLockListStatus(state));
  const maxSelectedNoteIds = useSelector(state => {
    if (state.user.hubUrl === SD_HUB_URL) return SD_MAX_SELECTED_NOTE_IDS;
    return MAX_SELECTED_NOTE_IDS;
  });
  const prevListName = useRef(null);
  const prevQueryString = useRef(null);
  const prevDidFetch = useRef(null);
  const prevDidFetchSettings = useRef(null);
  const prevIsShowingNoteInfosNull = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const isUnsavedValid = unsavedNote.status === VALID;

  const onAddBtnClick = () => {
    dispatch(updateNoteIdUrlHash(NEW_NOTE, false, true));
  };

  const renderMaxError = () => {
    if (!isMaxErrorShown) return <AnimatePresence key="AP_NL_maxError" />;

    return (
      <AnimatePresence key="AP_NL_maxError">
        <motion.div className={tailwind('absolute inset-x-0 top-0 flex items-start justify-center')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
            <div className={tailwind('flex')}>
              <div className={tailwind('flex-shrink-0')}>
                <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={tailwind('ml-3 mt-0.5')}>
                <h3 className={tailwind('text-left text-sm leading-5 text-red-800')}>To prevent network overload, up to {maxSelectedNoteIds} items can be selected.</h3>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  useEffect(() => {
    if (
      (prevListName.current !== listName) ||
      (prevQueryString.current !== queryString) ||
      (prevDidFetch.current && !didFetch) ||
      (prevDidFetchSettings.current && !didFetchSettings) ||
      (!prevIsShowingNoteInfosNull.current && isShowingNoteInfosNull)
    ) dispatch(fetch());

    prevListName.current = listName;
    prevQueryString.current = queryString;
    prevDidFetch.current = didFetch;
    prevDidFetchSettings.current = didFetchSettings;
    prevIsShowingNoteInfosNull.current = isShowingNoteInfosNull;
  }, [
    listName, queryString, didFetch, didFetchSettings, isShowingNoteInfosNull, dispatch,
  ]);

  let noteListItems = <LoadingNoteListItems />;
  if (!isShowingNoteInfosNull) {
    if (lockStatus === LOCKED) noteListItems = <NoteListLock />;
    else noteListItems = <NoteListItems />;
  }

  return (
    <div className={tailwind('relative flex h-full w-full min-w-64 flex-col')}>
      {/* TopBar */}
      <NoteListTopBar onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Main */}
      {noteListItems}
      {/* Add button */}
      {!isBulkEditing && (listName !== TRASH) && <button onClick={onAddBtnClick} className={tailwind('absolute right-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 lg:hidden')}>
        <svg className={tailwind('h-10 w-10')} viewBox={isUnsavedValid ? '0 0 20 20' : '0 0 40 40'} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          {isUnsavedValid ? <path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97231 16.8756 4.2181C16.9762 4.46389 17.0268 4.72725 17.0245 4.99281C17.0222 5.25837 16.967 5.52081 16.8622 5.76482C16.7574 6.00883 16.605 6.22952 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" /> : <path fillRule="evenodd" clipRule="evenodd" d="M20 10C20.5304 10 21.0391 10.2107 21.4142 10.5858C21.7893 10.9609 22 11.4696 22 12V18H28C28.5304 18 29.0391 18.2107 29.4142 18.5858C29.7893 18.9609 30 19.4696 30 20C30 20.5304 29.7893 21.0391 29.4142 21.4142C29.0391 21.7893 28.5304 22 28 22H22V28C22 28.5304 21.7893 29.0391 21.4142 29.4142C21.0391 29.7893 20.5304 30 20 30C19.4696 30 18.9609 29.7893 18.5858 29.4142C18.2107 29.0391 18 28.5304 18 28V22H12C11.4696 22 10.9609 21.7893 10.5858 21.4142C10.2107 21.0391 10 20.5304 10 20C10 19.4696 10.2107 18.9609 10.5858 18.5858C10.9609 18.2107 11.4696 18 12 18H18V12C18 11.4696 18.2107 10.9609 18.5858 10.5858C18.9609 10.2107 19.4696 10 20 10Z" />}
        </svg>
      </button>}
      {renderMaxError()}
    </div>
  );
};

export default React.memo(NoteList);
