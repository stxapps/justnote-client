import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import { updatePopupUrlHash } from '../actions';
import {
  moveNotesWithAction, pinNotes, updateMoveAction,
  updateDeleteAction, updateListNamesMode, viewNoteAsWebpage, showAddLockEditorPopup,
  lockNote, updateTagEditorPopup,
} from '../actions/chunk';
import {
  MY_NOTES, TRASH, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO, PIN, MANAGE_PIN, PINNED,
  VIEW_AS_WEBPAGE, NOTE_LIST_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP,
  CONFIRM_DELETE_POPUP, MOVE_ACTION_NOTE_ITEM_MENU, DELETE_ACTION_NOTE_ITEM_MENU,
  LIST_NAMES_MODE_MOVE_NOTES, LOCK_ACTION_ADD_LOCK_NOTE, LOCK, UNLOCKED, ADD_TAGS,
  MANAGE_TAGS, TAGGED,
} from '../types/const';
import {
  makeGetPinStatus, makeGetTagStatus, makeGetLockNoteStatus,
} from '../selectors';
import { getListNameDisplayName } from '../utils';
import { popupBgFMV, popupFMV } from '../types/animConfigs';
import { computePositionStyle } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

export const NOTE_ITEM_POPUP_MENU = {
  [MY_NOTES]: [ARCHIVE, REMOVE, MOVE_TO],
  [TRASH]: [RESTORE, DELETE],
  [ARCHIVE]: [REMOVE, MOVE_TO],
};
const QUERY_STRING_MENU = [REMOVE];

const NoteListItemMenuPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const getTagStatus = useMemo(makeGetTagStatus, []);
  const getLockNoteStatus = useMemo(makeGetLockNoteStatus, []);
  const isShown = useSelector(state => state.display.isNoteListItemMenuPopupShown);
  const anchorPosition = useSelector(
    state => state.display.noteListItemMenuPopupPosition
  );
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const selectingNoteId = useSelector(state => state.display.selectingNoteId);
  const pinStatus = useSelector(state => getPinStatus(state, selectingNoteId));
  const tagStatus = useSelector(state => getTagStatus(state, selectingNoteId));
  const lockStatus = useSelector(state => getLockNoteStatus(state, selectingNoteId));
  const [popupSize, setPopupSize] = useState(null);
  const popup = useRef(null);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

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
    } else if (text === ADD_TAGS || text === MANAGE_TAGS) {
      dispatch(updateTagEditorPopup(true, text === ADD_TAGS));
    } else if (text === VIEW_AS_WEBPAGE) {
      onCancelBtnClick();
      dispatch(viewNoteAsWebpage());
    } else if (text === LOCK) {
      if (lockStatus === null) {
        dispatch(showAddLockEditorPopup(LOCK_ACTION_ADD_LOCK_NOTE));
      } else if (lockStatus === UNLOCKED) {
        onCancelBtnClick();
        dispatch(lockNote(selectingNoteId));
      }
    } else {
      console.log(`In NoteListItemMenuPopup, invalid text: ${text}`);
      return; // Don't set didClick to true
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
    if (queryString) menu = QUERY_STRING_MENU;

    if (listName !== TRASH || queryString) {
      // Only when no other pending actions and list name is not TRASH.
      // If busy, the menuBtn will be disabled.
      if (tagStatus === TAGGED) menu = [...menu, MANAGE_TAGS];
      else if (tagStatus === null) menu = [...menu, ADD_TAGS];

      if (pinStatus === PINNED) menu = [...menu, MANAGE_PIN];
      else if (pinStatus === null) menu = [...menu, PIN];

      menu = [...menu, VIEW_AS_WEBPAGE];
    }

    menu = [...menu, LOCK];

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
    <div className={tailwind('py-1')}>
      {menu.map(text => {
        let displayText = text;
        if (text === ARCHIVE) displayText = getListNameDisplayName(text, listNameMap);
        return (
          <button key={text} onClick={() => onMenuPopupBtnClick(text)} className={tailwind('block w-full truncate rounded-xs px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">{displayText}</button>
        );
      })}
    </div>
  );

  const popupClassNames = 'fixed min-w-[8rem] overflow-auto rounded-md bg-white shadow-xl ring-1 ring-black/5 blk:bg-gray-800 blk:ring-white/25';

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
      <motion.div key="NLI_MenuPopup_popup" ref={popup} style={popupStyle} className={tailwind(popupClassNames)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </motion.div>
    );
  } else {
    panel = (
      <div key="NLI_MenuPopup_popup" ref={popup} style={{ top: safeAreaHeight + 256, left: safeAreaWidth + 256 }} className={tailwind(popupClassNames)} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {buttons}
      </div>
    );
  }

  return (
    <AnimatePresence key="AP_NLI_MenuPopup">
      <motion.button key="NLI_MenuPopup_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 h-full w-full cursor-default bg-black/25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(NoteListItemMenuPopup);
