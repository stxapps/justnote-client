import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { updatePopupUrlHash, updateNoteIdUrlHash } from '../actions';
import { SIDEBAR_POPUP } from '../types/const';
import {
  canvasFMV, sideBarOverlayFMV, sideBarFMV, rightPanelFMV,
} from '../types/animConfigs';

import { useSafeAreaFrame } from '.';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';

const NavPanel = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isSidebarPopupShown = useSelector(state => state.display.isSidebarPopupShown);
  const noteId = useSelector(state => state.display.noteId);

  const onSidebarOpenBtnClick = () => {
    updatePopupUrlHash(SIDEBAR_POPUP, true, null);
  };

  const onSidebarCloseBtnClick = () => {
    updatePopupUrlHash(SIDEBAR_POPUP, false, null);
  };

  const onRightPanelCloseBtnClick = () => {
    updateNoteIdUrlHash(null);
  };

  return (
    <div style={{ height: safeAreaHeight }} className="relative w-full bg-white">
      {/* Main panel */}
      <NoteList onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Sidebar */}
      <motion.div className="absolute inset-0 flex overflow-hidden" variants={canvasFMV} initial={false} animate={isSidebarPopupShown ? 'visible' : 'hidden'}>
        <motion.button onClick={onSidebarCloseBtnClick} className="absolute inset-0 w-full h-full" variants={sideBarOverlayFMV}>
          <div className="absolute inset-0 bg-white"></div>
        </motion.button>
        <div className="absolute top-0 right-0 p-1">
          <button onClick={onSidebarCloseBtnClick} className="flex items-center justify-center h-7 w-7 rounded-full group focus:outline-none focus:ring-2 focus:ring-green-600" aria-label="Close settings popup">
            <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-700" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <motion.div className="flex-1 max-w-64 bg-gray-100 pr-2" variants={sideBarFMV}>
          <Sidebar />
        </motion.div>
        <div className="flex-shrink-0 w-14">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </motion.div>
      {/* Right panel */}
      <motion.div className="absolute inset-0 overflow-hidden" variants={canvasFMV} initial={false} animate={noteId ? 'visible' : 'hidden'}>
        <motion.div className="w-full h-full" variants={rightPanelFMV}>
          <NoteEditor onRightPanelCloseBtnClick={onRightPanelCloseBtnClick} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(NavPanel);
