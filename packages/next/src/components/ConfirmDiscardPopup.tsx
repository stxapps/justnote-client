import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useSelector, useDispatch } from '../store';
import {
  updatePopupUrlHash, updateNoteIdUrlHash, updateNoteId, updateBulkEditUrlHash,
} from '../actions';
import {
  discardNote, changeListName, showNoteListMenuPopup, showNLIMPopup,
  updateSettingsPopup,
} from '../actions/chunk';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, DISCARD_ACTION_UPDATE_BULK_EDIT_URL_HASH,
  DISCARD_ACTION_SHOW_NOTE_LIST_MENU_POPUP, DISCARD_ACTION_SHOW_NLIM_POPUP,
  DISCARD_ACTION_UPDATE_LIST_NAME, DISCARD_ACTION_UPDATE_TAG_NAME, SM_WIDTH,
} from '../types/const';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const ConfirmDiscardPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isConfirmDiscardPopupShown);
  const discardAction = useSelector(state => state.display.discardAction);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onConfirmDiscardCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(CONFIRM_DISCARD_POPUP, false, null);
    didClick.current = true;
  };

  const onConfirmDiscardOkBtnClick = () => {
    if (didClick.current) return;

    if (discardAction === DISCARD_ACTION_CANCEL_EDIT) {
      // As this and closing confirmDiscard popup both change url hash,
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(discardNote(false)), 100);
    } else if (discardAction === DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH) {
      // As this and closing confirmDiscard popup both call window.history.back(),
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(updateNoteIdUrlHash(null, true, false)), 100);
    } else if (discardAction === DISCARD_ACTION_UPDATE_NOTE_ID) {
      dispatch(updateNoteId(null, true, false));
    } else if (discardAction === DISCARD_ACTION_CHANGE_LIST_NAME) {
      dispatch(changeListName(null, false));
    } else if (discardAction === DISCARD_ACTION_UPDATE_BULK_EDIT_URL_HASH) {
      // As this and closing confirmDiscard popup both change url hash,
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(updateBulkEditUrlHash(true, null, true, false)), 100);
    } else if (discardAction === DISCARD_ACTION_SHOW_NOTE_LIST_MENU_POPUP) {
      // As this and closing confirmDiscard popup both change url hash,
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(showNoteListMenuPopup(null, false)), 100);
    } else if (discardAction === DISCARD_ACTION_SHOW_NLIM_POPUP) {
      // As this and closing confirmDiscard popup both change url hash,
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(showNLIMPopup(null, null, false)), 100);
    } else if (
      discardAction === DISCARD_ACTION_UPDATE_LIST_NAME ||
      discardAction === DISCARD_ACTION_UPDATE_TAG_NAME
    ) {
      // As this and closing confirmDiscard popup both change url hash,
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(updateSettingsPopup(false, false)), 100);
    } else {
      console.log(`Invalid discard action: ${discardAction}`);
    }

    onConfirmDiscardCancelBtnClick();
    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      cancelBtn.current.focus();
      didClick.current = false;
    }
  }, [isShown]);

  if (!isShown) return (
    <AnimatePresence key="AP_CDiscardP" />
  );

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };

  const spanStyle: any = {};
  if (safeAreaWidth >= SM_WIDTH) spanStyle.height = safeAreaHeight;

  let msg = 'Are you sure you want to discard your unsaved changes to your note? All of your changes will be permanently deleted. This action cannot be undone.';
  if (discardAction === DISCARD_ACTION_UPDATE_LIST_NAME) {
    msg = 'There are some lists still in editing mode. Are you sure you want to discard them?';
  } else if (discardAction === DISCARD_ACTION_UPDATE_TAG_NAME) {
    msg = 'There are some tags still in editing mode. Are you sure you want to discard them?';
  }

  return (
    <AnimatePresence key="AP_CDiscardP">
      <div style={canvasStyle} className={tailwind('fixed inset-0 overflow-y-auto')} aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div style={{ minHeight: safeAreaHeight }} className={tailwind('flex items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0')}>
          <div className={tailwind('fixed inset-0')}>
            <motion.button ref={cancelBtn} onClick={onConfirmDiscardCancelBtnClick} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black/25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <span style={spanStyle} className={tailwind('hidden sm:inline-block sm:align-middle')} aria-hidden="true">&#8203;</span>
          <motion.div className={tailwind('relative inline-block overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl blk:bg-gray-800 blk:ring-1 blk:ring-white/25 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden">
            <div className={tailwind('sm:flex sm:items-start')}>
              <div className={tailwind('mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10')}>
                <svg className={tailwind('h-6 w-6 text-red-600')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className={tailwind('mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left')}>
                <h3 className={tailwind('text-lg font-medium leading-6 text-gray-900 blk:text-white')} id="modal-title">Discard unsaved changes?</h3>
                <div className={tailwind('mt-2')}>
                  <p className={tailwind('text-sm text-gray-500 blk:text-gray-400')}>
                    {msg}
                  </p>
                </div>
              </div>
            </div>
            <div className={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:flex sm:pl-4')}>
              <button onClick={onConfirmDiscardOkBtnClick} type="button" className={tailwind('inline-flex w-full justify-center rounded-md border border-red-600 bg-red-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 blk:border-red-500 blk:bg-red-500 blk:hover:bg-red-600 blk:focus:ring-red-600 blk:focus:ring-offset-gray-800 sm:w-auto sm:text-sm')}>Discard</button>
              <button onClick={onConfirmDiscardCancelBtnClick} type="button" className={tailwind('mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-xs hover:border-gray-400 hover:text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-300 blk:hover:border-gray-400 blk:hover:text-gray-200 blk:focus:border-gray-400 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm')}>Cancel</button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(ConfirmDiscardPopup);
