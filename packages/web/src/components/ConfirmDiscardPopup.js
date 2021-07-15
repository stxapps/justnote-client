import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopupUrlHash, increaseConfirmDiscardNoteCount, updateNoteIdUrlHash, updateNoteId,
  changeListName,
} from '../actions';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, SM_WIDTH,
} from '../types/const';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';

const ConfirmDiscardPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isConfirmDiscardPopupShown);
  const discardAction = useSelector(state => state.display.discardAction);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onConfirmDiscardCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(CONFIRM_DISCARD_POPUP, false, null);
    didClick.current = true;
  };

  const onConfirmDiscardOkBtnClick = () => {
    if (didClick.current) return;
    if (discardAction === DISCARD_ACTION_CANCEL_EDIT) {
      dispatch(increaseConfirmDiscardNoteCount());
    } else if (discardAction === DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH) {
      // As this and closing discard popup both call window.history.back(),
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(updateNoteIdUrlHash(null, true, false)), 100);
    } else if (discardAction === DISCARD_ACTION_UPDATE_NOTE_ID) {
      dispatch(updateNoteId(null, true, false));
    } else if (discardAction === DISCARD_ACTION_CHANGE_LIST_NAME) {
      dispatch(changeListName(null, false));
    } else throw new Error(`Invalid discard action: ${discardAction}`);
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

  const spanStyle = {};
  if (safeAreaWidth >= SM_WIDTH) spanStyle.height = safeAreaHeight;

  return (
    <AnimatePresence key="AP_CDiscardP">
      <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div style={{ minHeight: safeAreaHeight }} className="flex items-end justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0" aria-hidden="true">
            <motion.button ref={cancelBtn} onClick={onConfirmDiscardCancelBtnClick} className="absolute inset-0 w-full h-full bg-black bg-opacity-25 cursor-default focus:outline-none" variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <span style={spanStyle} className="hidden sm:inline-block sm:align-middle" aria-hidden="true">&#8203;</span>
          <motion.div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" variants={dialogFMV} initial="hidden" animate="visible" exit="hidden">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Discard unsaved changes?</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to discard your unsaved changes to your note? All of your changes will be permanently deleted. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex">
              <button onClick={onConfirmDiscardOkBtnClick} type="button" className="inline-flex justify-center w-full rounded-md border border-red-600 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm">Discard</button>
              <button onClick={onConfirmDiscardCancelBtnClick} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:text-gray-900 hover:border-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(ConfirmDiscardPopup);
