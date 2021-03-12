import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopupUrlHash, moveNotes } from '../actions';
import { MOVE_TO_POPUP, ARCHIVE, TRASH, LG_WIDTH } from '../types/const';
import { getListNameMap } from '../selectors';
import { getLastHalfHeight } from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';

import { useSafeAreaFrame } from '.';

const MoveToPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isMoveToPopupShown);
  const anchorPosition = useSelector(state => state.display.moveToPopupPosition);
  const listName = useSelector(state => state.display.listName);
  const listNameMap = useSelector(getListNameMap);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onMoveToCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(MOVE_TO_POPUP, false, null);
    didClick.current = true;
  };

  const onMoveToItemBtnClick = (listName) => {
    if (didClick.current) return;
    dispatch(moveNotes(listName, safeAreaWidth));
    onMoveToCancelBtnClick();
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
    <AnimatePresence key="AP_moveToPopup"></AnimatePresence>
  );

  const moveTo = [];
  for (const listNameObj of listNameMap) {
    if ([TRASH, ARCHIVE].includes(listNameObj.listName)) continue;
    if (listName === listNameObj.listName) continue;

    moveTo.push(listNameObj);
  }

  const buttons = (
    <div className="py-1">
      {moveTo.map(listNameObj => {
        return (
          <button key={listNameObj.listName} onClick={() => onMoveToItemBtnClick(listNameObj.listName)} className="block w-full px-4 py-3 text-sm text-left text-gray-700 truncate hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-inset" role="menuitem">
            {listNameObj.displayName}
          </button>
        );
      })}
    </div>
  );

  let popupClassNames = 'absolute min-w-28 max-w-64 mt-1 rounded-md shadow-lg bg-white overflow-auto ring-1 ring-black ring-opacity-5';
  let panel;
  if (popupSize) {

    const maxHeight = getLastHalfHeight(Math.min(256, safeAreaHeight - 16), 44, 4, 4);
    const layouts = createLayouts(anchorPosition, {
      width: popupSize.width, height: Math.min(popupSize.height, maxHeight)
    });
    const triggerOffsetX = safeAreaWidth < LG_WIDTH ? 0 : 25;
    const triggerOffsetY = safeAreaWidth < LG_WIDTH ? 52 : anchorPosition.height;
    const triggerOffsetWidth = safeAreaWidth < LG_WIDTH ? -8 : -25;
    const triggerOffsets = {
      x: triggerOffsetX, y: triggerOffsetY, width: triggerOffsetWidth, height: 0
    };
    const popupPosition = computePosition(layouts, triggerOffsets, 8);

    const { top, left, topOrigin, leftOrigin } = popupPosition;
    const popupStyle = { top, left, maxHeight };
    popupClassNames += ' ' + getOriginClassName(topOrigin, leftOrigin);

    panel = (
      <motion.div key="MTP_popup" ref={popup} style={popupStyle} className={popupClassNames} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="MTP_popup" ref={popup} style={{ top: 0, left: 0 }} className={popupClassNames} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    )
  }

  return (
    <AnimatePresence key="AP_moveToPopup">
      <motion.button key="MTP_cancelBtn" ref={cancelBtn} onClick={onMoveToCancelBtnClick} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(MoveToPopup);
