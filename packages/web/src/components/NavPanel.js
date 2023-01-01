import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { updatePopupUrlHash } from '../actions';
import { SIDEBAR_POPUP, NEW_NOTE, NEW_NOTE_OBJ } from '../types/const';
import {
  canvasFMV, sideBarOverlayFMV, sideBarFMV, rightPanelFMV,
} from '../types/animConfigs';
import { isMobile as _isMobile } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';

const NavPanel = () => {

  const { height: safeAreaHeight, windowHeight } = useSafeAreaFrame();
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

  const isMobile = useMemo(() => _isMobile(), []);
  const preventScrollClassNames = useMemo(() => {
    // When overscroll-none is fixed, no need the empty space to have the scroll.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=813094
    // https://github.com/whatwg/html/issues/7732
    if (isMobile && safeAreaHeight < windowHeight) {
      return 'overflow-y-scroll overscroll-contain hide-scrollbar';
    }
    return '';
  }, [safeAreaHeight, windowHeight, isMobile]);

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
    <div style={{ height: safeAreaHeight }} className={tailwind(`relative w-full bg-white blk:bg-gray-900 ${preventScrollClassNames}`)}>
      {/* Main panel */}
      <NoteList onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Empty space to have scroll to prevent scroll in layout viewport */}
      {preventScrollClassNames.length > 0 && <div className={tailwind('h-px')} />}
      {/* Sidebar */}
      <motion.div className={tailwind('absolute inset-0 flex overflow-hidden')} variants={canvasFMV} initial={false} animate={isSidebarPopupShown ? 'visible' : 'hidden'}>
        <motion.button onClick={onSidebarCloseBtnClick} className={tailwind('absolute inset-0 h-full w-full')} variants={sideBarOverlayFMV}>
          <div className={tailwind('absolute inset-0 bg-white blk:bg-gray-900')} />
        </motion.button>
        <div className={tailwind('absolute top-0 right-0 p-1')}>
          <button onClick={onSidebarCloseBtnClick} className={tailwind('group flex h-7 w-7 items-center justify-center focus:outline-none')} aria-label="Close sidebar popup">
            <svg className={tailwind('h-5 w-5 rounded text-gray-400 group-hover:text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:ring-gray-500')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <motion.div className={tailwind('max-w-64 flex-1 bg-gray-100 pr-2 blk:bg-gray-800')} variants={sideBarFMV}>
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
