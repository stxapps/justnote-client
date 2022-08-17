import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { updatePopupUrlHash } from '../actions';
import { SIDEBAR_POPUP, NEW_NOTE, NEW_NOTE_OBJ } from '../types/const';
import {
  canvasFMV, sideBarOverlayFMV, sideBarFMV, rightPanelFMV,
} from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';

const NavPanel = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isSidebarPopupShown = useSelector(state => state.display.isSidebarPopupShown);
  const note = useSelector(state => {
    const { listName, noteId } = state.display;

    if (!noteId) return null;
    if (noteId === NEW_NOTE) return NEW_NOTE_OBJ;
    if (noteId.startsWith('conflict')) return state.conflictedNotes[listName][noteId];
    return state.notes[listName][noteId];
  });
  const [derivedNote, setDerivedNote] = useState(note);
  const tailwind = useTailwind();

  const onSidebarOpenBtnClick = () => {
    updatePopupUrlHash(SIDEBAR_POPUP, true, null);
  };

  const onSidebarCloseBtnClick = () => {
    updatePopupUrlHash(SIDEBAR_POPUP, false, null);
  };

  const onRightPanelAnimEnd = () => {
    if (!note && note !== derivedNote) setDerivedNote(note);
  };

  if (note && note !== derivedNote) {
    setDerivedNote(note);
  }

  return (
    <div style={{ height: safeAreaHeight }} className={tailwind('relative w-full bg-white')}>
      {/* Main panel */}
      <NoteList onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Sidebar */}
      <motion.div className={tailwind('absolute inset-0 flex overflow-hidden')} variants={canvasFMV} initial={false} animate={isSidebarPopupShown ? 'visible' : 'hidden'}>
        <motion.button onClick={onSidebarCloseBtnClick} className={tailwind('absolute inset-0 h-full w-full')} variants={sideBarOverlayFMV}>
          <div className={tailwind('absolute inset-0 bg-white')} />
        </motion.button>
        <div className={tailwind('absolute top-0 right-0 p-1')}>
          <button onClick={onSidebarCloseBtnClick} className={tailwind('group flex h-7 w-7 items-center justify-center focus:outline-none')} aria-label="Close sidebar popup">
            <svg className={tailwind('h-5 w-5 rounded text-gray-400 group-hover:text-gray-500 group-focus:ring-2 group-focus:ring-gray-400')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <motion.div className={tailwind('max-w-64 flex-1 bg-gray-100 pr-2')} variants={sideBarFMV}>
          <Sidebar />
        </motion.div>
        <div className={tailwind('w-14 flex-shrink-0')}>
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </motion.div>
      {/* Right panel */}
      <motion.div className={tailwind('absolute inset-0 overflow-hidden')} variants={canvasFMV} initial={false} animate={note ? 'visible' : 'hidden'} onAnimationComplete={onRightPanelAnimEnd}>
        <motion.div className={tailwind('h-full w-full')} variants={rightPanelFMV}>
          <NoteEditor note={derivedNote} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(NavPanel);
