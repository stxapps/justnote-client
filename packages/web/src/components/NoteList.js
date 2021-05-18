import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import { updateNoteIdUrlHash, fetch } from '../actions';
import { NEW_NOTE, MAX_SELECTED_NOTE_IDS } from '../types/const';
import { popupFMV } from '../types/animConfigs';

import NoteListTopBar from './NoteListTopBar';
import NoteListItems from './NoteListItems';
import LoadingNoteListItems from './LoadingNoteListItems';

const NoteList = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const listName = useSelector(state => state.display.listName);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isMaxErrorShown = useSelector(state => state.display.isSelectedNoteIdsMaxErrorShown);
  const didFetch = useSelector(state => state.display.didFetch);
  const fetchedListNames = useSelector(state => state.display.fetchedListNames);
  const dispatch = useDispatch();

  const onAddBtnClick = () => {
    updateNoteIdUrlHash(NEW_NOTE);
  };

  const renderMaxError = () => {
    if (!isMaxErrorShown) return <AnimatePresence key="AP_NL_maxError" />;

    return (
      <AnimatePresence key="AP_NL_maxError">
        <motion.div className="absolute top-0 inset-x-0 flex justify-center items-start" variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className="m-4 p-4 bg-red-50 rounded-md shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm text-red-800 font-medium text-left leading-5">To prevent network overload, up to {MAX_SELECTED_NOTE_IDS} items can be selected.</h3>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  useEffect(() => {
    if (!fetchedListNames.includes(listName)) {
      dispatch(fetch(didFetch ? false : null, !didFetch));
    }
  }, [listName, fetchedListNames, didFetch, dispatch]);

  const noteListItems = fetchedListNames.includes(listName) ? <NoteListItems /> : <LoadingNoteListItems />;

  return (
    <div className="relative w-full min-w-64 h-full flex flex-col">
      {/* TopBar */}
      <NoteListTopBar onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Main */}
      {noteListItems}
      {/* Add button */}
      {!isBulkEditing && <button onClick={onAddBtnClick} className="absolute right-4 bottom-4 rounded-full bg-green-600 text-white w-16 h-16 shadow-md flex items-center justify-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 lg:hidden">
        <svg className="w-10 h-10" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M20 10C20.5304 10 21.0391 10.2107 21.4142 10.5858C21.7893 10.9609 22 11.4696 22 12V18H28C28.5304 18 29.0391 18.2107 29.4142 18.5858C29.7893 18.9609 30 19.4696 30 20C30 20.5304 29.7893 21.0391 29.4142 21.4142C29.0391 21.7893 28.5304 22 28 22H22V28C22 28.5304 21.7893 29.0391 21.4142 29.4142C21.0391 29.7893 20.5304 30 20 30C19.4696 30 18.9609 29.7893 18.5858 29.4142C18.2107 29.0391 18 28.5304 18 28V22H12C11.4696 22 10.9609 21.7893 10.5858 21.4142C10.2107 21.0391 10 20.5304 10 20C10 19.4696 10.2107 18.9609 10.5858 18.5858C10.9609 18.2107 11.4696 18 12 18H18V12C18 11.4696 18.2107 10.9609 18.5858 10.5858C18.9609 10.2107 19.4696 10 20 10Z" />
        </svg>
      </button>}
      {renderMaxError()}
    </div>
  );
};

export default React.memo(NoteList);
