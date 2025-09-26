import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import { updatePopupUrlHash } from '../actions';
import { updateLockAction } from '../actions/chunk';
import {
  LOCK_MENU_POPUP, LOCK_EDITOR_POPUP, LOCK_ACTION_REMOVE_LOCK_NOTE, REMOVE_LOCK,
} from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const LockMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isLockMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.lockMenuPopupPosition);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(LOCK_MENU_POPUP, false, null);
    didClick.current = true;
  };

  const onRemoveBtnClick = () => {
    if (didClick.current) return;
    dispatch(updateLockAction(LOCK_ACTION_REMOVE_LOCK_NOTE));
    updatePopupUrlHash(LOCK_EDITOR_POPUP, true, null, true);
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
    <AnimatePresence key="AP_lockMenuPopup" />
  );

  const buttons = (
    <div className={tailwind('py-1')}>
      <button onClick={onRemoveBtnClick} className={tailwind('block w-full truncate rounded-xs px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">{REMOVE_LOCK}</button>
    </div>
  );

  const popupClassNames = 'fixed min-w-32 max-w-64 overflow-auto rounded-md bg-white shadow-xl ring-1 ring-black/5 blk:bg-gray-800 blk:ring-white/25';

  let panel;
  if (popupSize) {
    const maxHeight = safeAreaHeight - 16;
    const posStyle = computePositionStyle(
      anchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );
    const popupStyle = { ...posStyle, maxHeight };

    panel = (
      <motion.div key="LockMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="LockMP_popup" ref={popup} style={{ top: safeAreaHeight + 256, left: safeAreaWidth + 256 }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_lockMenuPopup">
      <motion.button key="LockMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 h-full w-full cursor-default bg-black/25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(LockMenuPopup);
