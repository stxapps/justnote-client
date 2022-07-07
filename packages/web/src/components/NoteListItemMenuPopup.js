import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopupUrlHash, moveNotesWithAction, pinNotes, updateMoveAction,
  updateDeleteAction, updateListNamesMode,
} from '../actions';
import {
  MY_NOTES, TRASH, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO,
  PIN, MANAGE_PIN, PINNED, NOTE_ITEM_POPUP_MENU,
  NOTE_LIST_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, CONFIRM_DELETE_POPUP,
  MOVE_ACTION_NOTE_ITEM_MENU, DELETE_ACTION_NOTE_ITEM_MENU, LIST_NAMES_MODE_MOVE_NOTES,
} from '../types/const';
import {
  getListNameMap, getDoEnableExtraFeatures, makeGetPinStatus,
} from '../selectors';
import { getListNameDisplayName, getAllListNames } from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';

const NoteListItemMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const isShown = useSelector(state => state.display.isNoteListItemMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.noteListItemMenuPopupPosition
  );
  const listName = useSelector(state => state.display.listName);
  const listNameMap = useSelector(state => getListNameMap(state));
  const selectingNoteId = useSelector(state => state.display.selectingNoteId);
  const pinStatus = useSelector(state => getPinStatus(state, selectingNoteId));
  const doEnableExtraFeatures = useSelector(state => getDoEnableExtraFeatures(state));
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(NOTE_LIST_ITEM_MENU_POPUP, false, null);
    didClick.current = true;
  };

  const onMenuPopupBtnClick = (text) => {
    if (!text || didClick.current) return;

    if (text === ARCHIVE) {
      onCancelBtnClick();
      dispatch(moveNotesWithAction(ARCHIVE, MOVE_ACTION_NOTE_ITEM_MENU));
    } else if (text === REMOVE) {
      onCancelBtnClick();
      dispatch(moveNotesWithAction(TRASH, MOVE_ACTION_NOTE_ITEM_MENU));
    } else if (text === RESTORE) {
      onCancelBtnClick();
      dispatch(moveNotesWithAction(MY_NOTES, MOVE_ACTION_NOTE_ITEM_MENU));
    } else if (text === DELETE) {
      dispatch(updateDeleteAction(DELETE_ACTION_NOTE_ITEM_MENU));
      updatePopupUrlHash(CONFIRM_DELETE_POPUP, true, null);
      return; // Don't set didClick to true
    } else if (text === MOVE_TO) {
      dispatch(updateMoveAction(MOVE_ACTION_NOTE_ITEM_MENU));
      dispatch(updateListNamesMode(LIST_NAMES_MODE_MOVE_NOTES));
      updatePopupUrlHash(LIST_NAMES_POPUP, true, anchorPosition, true);
    } else if (text === PIN) {
      onCancelBtnClick();
      dispatch(pinNotes([selectingNoteId]));
    } else if (text === MANAGE_PIN) {
      updatePopupUrlHash(PIN_MENU_POPUP, true, anchorPosition, true);
    } else {
      console.log(`In NoteListItemMenuPopup, invalid text: ${text}`);
    }

    didClick.current = true;
  };

  const populateMenu = () => {
    let menu = null;
    if (listName in NOTE_ITEM_POPUP_MENU) {
      menu = NOTE_ITEM_POPUP_MENU[listName];
    } else {
      menu = NOTE_ITEM_POPUP_MENU[MY_NOTES];
    }

    if (listName === MY_NOTES && getAllListNames(listNameMap).length === 3) {
      menu = menu.slice(0, -1);
    }

    if (listName !== TRASH) {
      // Only when no other pending actions and list name is not TRASH
      if (pinStatus === PINNED) menu = [...menu, MANAGE_PIN];
      else if (doEnableExtraFeatures && pinStatus === null) menu = [...menu, PIN];
    }

    return menu;
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
    <AnimatePresence key="AP_NLI_MenuPopup" />
  );

  const menu = populateMenu();
  const buttons = (
    <div className="py-1">
      {menu.map(text => {
        let displayText = text;
        if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
        return (
          <button key={text} onClick={() => onMenuPopupBtnClick(text)} className="block w-full px-4 py-3 text-sm text-gray-700 text-left truncate rounded-sm hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">{displayText}</button>
        );
      })}

    </div>
  );

  let popupClassNames = 'fixed min-w-[8rem] rounded-md shadow-xl bg-white overflow-auto ring-1 ring-black ring-opacity-5';
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
      <motion.div key="NLI_MenuPopup_popup" ref={popup} style={popupStyle} className={popupClassNames} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="NLI_MenuPopup_popup" ref={popup} style={{ top: safeAreaHeight, left: safeAreaWidth }} className={popupClassNames} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_NLI_MenuPopup">
      <motion.button key="NLI_MenuPopup_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className="fixed inset-0 w-full h-full bg-black bg-opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(NoteListItemMenuPopup);
