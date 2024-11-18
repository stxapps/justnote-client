import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopupUrlHash } from '../actions';
import {
  updateMoveAction, updateListNamesMode, bulkPinNotes, bulkUnpinNotes,
  updateTagEditorPopup,
} from '../actions/chunk';
import {
  BULK_EDIT_MENU_POPUP, LIST_NAMES_POPUP, MOVE_TO, PIN, UNPIN, MANAGE_TAGS, MY_NOTES,
  ARCHIVE, TRASH, MOVE_ACTION_NOTE_COMMANDS, LIST_NAMES_MODE_MOVE_NOTES,
} from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';
import { useSafeAreaFrame, useTailwind } from '.';

const BulkEditMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isBulkEditMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.bulkEditMenuPopupPosition);
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const selectedNoteIds = useSelector(state => state.display.selectedNoteIds);
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(BULK_EDIT_MENU_POPUP, false, null);
    didClick.current = true;
  };

  const onMenuPopupClick = (text) => {
    if (!text || didClick.current) return;

    if (text === MOVE_TO) {
      dispatch(updateMoveAction(MOVE_ACTION_NOTE_COMMANDS));
      dispatch(updateListNamesMode(LIST_NAMES_MODE_MOVE_NOTES));
      updatePopupUrlHash(LIST_NAMES_POPUP, true, anchorPosition, true);
    } else if (text === PIN) {
      onCancelBtnClick();
      // As this and closing the popup both might call window.history.back(),
      //   if bulkEditing is true, need to be in different js clock cycle.
      setTimeout(() => dispatch(bulkPinNotes(selectedNoteIds)), 100);
    } else if (text === UNPIN) {
      onCancelBtnClick();
      // As this and closing the popup both might call window.history.back(),
      //   if bulkEditing is true, need to be in different js clock cycle.
      setTimeout(() => dispatch(bulkUnpinNotes(selectedNoteIds)), 100);
    } else if (text === MANAGE_TAGS) {
      dispatch(updateTagEditorPopup(true, true));
    } else {
      console.log(`In BulkEditMenuPopup, invalid text: ${text}`);
      return; // Don't set didClick to true
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
    <AnimatePresence key="AP_bulkEditMenuPopup" />
  );

  let menu = [];
  const rListName = [MY_NOTES, ARCHIVE, TRASH].includes(listName) ? listName : MY_NOTES;
  if (queryString === '') {
    if (rListName === MY_NOTES) menu.push(MOVE_TO);
  }
  menu = [...menu, MANAGE_TAGS, PIN, UNPIN];

  const buttons = (
    <div className={tailwind('pb-1')}>
      <div className={tailwind('flex h-11 items-center justify-start pl-4 pr-4 pt-1')}>
        <p className={tailwind('truncate text-left text-sm font-semibold text-gray-600 blk:text-gray-200')}>Actions</p>
      </div>
      {menu.map((text, i) => {
        let btnClassNames = 'py-2.5';
        if (i === 0) btnClassNames += ' -mt-0.5';
        return (
          <button key={text} onClick={() => onMenuPopupClick(text)} className={tailwind(`block w-full truncate rounded-md pl-4 pr-4 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-white blk:focus:bg-gray-700 blk:focus:text-white ${btnClassNames}`)} role="menuitem">{text}</button>
        );
      })}
    </div>
  );

  let popupClassNames = 'fixed min-w-36 overflow-auto rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25';
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
      <motion.div key="BEMP_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="BEMP_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_bulkEditMenuPopup">
      <motion.button key="BEMP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(BulkEditMenuPopup);
