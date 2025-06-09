import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopupUrlHash } from '../actions';
import { updateNoteDateFormat } from '../actions/chunk';
import {
  DATE_FORMAT_MENU_POPUP, NOTE_DATE_FORMATS, NOTE_DATE_FORMAT_TEXTS,
} from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const DateFormatMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isDateFormatMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.dateFormatMenuPopupPosition);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(DATE_FORMAT_MENU_POPUP, false, null);
    didClick.current = true;
  };

  const onMenuPopupBtnClick = (value) => {
    if (!value || didClick.current) return;
    onCancelBtnClick();
    dispatch(updateNoteDateFormat(value));
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
    <AnimatePresence key="AP_dfmPopup" />
  );

  const buttons = (
    <div className={tailwind('py-1')}>
      {NOTE_DATE_FORMATS.map((format, i) => {
        return (
          <button key={format} onClick={() => onMenuPopupBtnClick(format)} className={tailwind('block w-full truncate rounded-sm px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">{NOTE_DATE_FORMAT_TEXTS[i]}</button>
        );
      })}
    </div>
  );

  const popupClassNames = 'fixed min-w-[6rem] overflow-auto rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';

  let panel;
  if (popupSize) {
    const maxHeight = Math.min(safeAreaHeight - 16, (44 * 5) + (44 / 2) + 4);
    const posStyle = computePositionStyle(
      anchorPosition,
      { width: popupSize.width, height: Math.min(popupSize.height, maxHeight) },
      { width: safeAreaWidth, height: safeAreaHeight },
      null,
      insets,
      8,
    );
    const popupStyle = /** @type any */({ ...posStyle, maxHeight });
    if (popupSize.width < anchorPosition.width) popupStyle.width = anchorPosition.width;

    panel = (
      <motion.div key="DFMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="DFMP_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_dfmPopup">
      <motion.button key="DFMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(DateFormatMenuPopup);
