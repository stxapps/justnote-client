import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopupUrlHash, unpinNotes, movePinnedNote } from '../actions';
import {
  PIN_MENU_POPUP, PIN_UP, PIN_DOWN, UNPIN, SWAP_LEFT, SWAP_RIGHT,
} from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';
import { useSafeAreaFrame, useTailwind } from '.';

const PinMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isPinMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.pinMenuPopupPosition
  );
  const selectingNoteId = useSelector(state => state.display.selectingNoteId);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(PIN_MENU_POPUP, false, null);
    didClick.current = true;
  };

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current) return;

    onCancelBtnClick();
    if ([PIN_UP].includes(text)) {
      dispatch(movePinnedNote(selectingNoteId, SWAP_LEFT));
    } else if ([PIN_DOWN].includes(text)) {
      dispatch(movePinnedNote(selectingNoteId, SWAP_RIGHT));
    } else if ([UNPIN].includes(text)) {
      dispatch(unpinNotes([selectingNoteId]));
    } else {
      console.log(`In PinMenuPopup, invalid text: ${text}`);
    }

    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      const s = popup.current.getBoundingClientRect();
      setPopupSize(s);

      cancelBtn.current.focus();
      didClick.current = false;
    } else {
      setPopupSize(null);
    }
  }, [isShown]);

  if (!isShown) return (
    <AnimatePresence key="AP_pinMenuPopup" />
  );

  const menu = [PIN_UP, PIN_DOWN, UNPIN];

  const buttons = (
    <React.Fragment>
      <div className={tailwind('flex h-11 items-center justify-start pl-4 pr-4 pt-1')}>
        <p className={tailwind('truncate text-left text-sm font-semibold text-gray-600 blk:text-gray-200')}>Manage pin</p>
      </div>
      {menu.map(text => {
        return <button key={text} onClick={() => onMenuPopupClick(text)} className={tailwind('block w-full truncate rounded-md py-2.5 pl-4 pr-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none focus:ring-inset blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white')} role="menuitem">{text}</button>
      })}
    </React.Fragment>
  );

  let popupClassNames = 'fixed min-w-32 max-w-64 overflow-auto rounded-lg bg-white pb-1 shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';
  let panel;
  if (popupSize) {

    const maxHeight = safeAreaHeight - 16;
    const layouts = createLayouts(
      anchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight },
    );
    const popupPosition = computePosition(layouts, null, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const popupStyle = { top, left, maxHeight };
    popupClassNames += ' ' + getOriginClassName(topOrigin, leftOrigin);

    panel = (
      <motion.div key="PMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="PMP_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_pinMenuPopup">
      <motion.button key="PMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(PinMenuPopup);
