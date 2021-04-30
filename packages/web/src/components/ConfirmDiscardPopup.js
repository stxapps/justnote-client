import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopupUrlHash, increaseConfirmDiscardNoteCount, updateNoteIdUrlHash, updateNoteId,
  changeListName,
} from '../actions';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME,
} from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';

const ConfirmDiscardPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
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
      dispatch(updateNoteIdUrlHash(null, true, false));
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

  const msg = useMemo(() => {
    if (discardAction === DISCARD_ACTION_CANCEL_EDIT) {
      return 'Your note hasn\'t been saved. Confirm discard your changes?';
    }

    return 'It looks like your note hasn\'t been saved. Confirm discard your changes?';
  }, [discardAction]);

  if (!isShown) return (
    <AnimatePresence key="AP_CDiscardP" />
  );

  return (
    <AnimatePresence key="AP_CDiscardP">
      <div className="fixed inset-0 overflow-hidden">
        <div className="p-4 flex items-center justify-center" style={{ minHeight: safeAreaHeight }}>
          <div className="fixed inset-0">
            <motion.button ref={cancelBtn} onClick={onConfirmDiscardCancelBtnClick} className="absolute inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className="relative w-full sm:w-96 -mt-8 pt-4 pb-2 px-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <p className="text-base text-gray-600 text-center">{msg}</p>
            <div className="pt-1 text-center">
              <button onClick={onConfirmDiscardOkBtnClick} className="group inline-flex items-center p-2 focus:outline-none">
                <span className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm rounded-md text-gray-600 bg-white group-hover:bg-gray-100 group-hover:text-gray-700 group-focus:ring-2 group-focus:ring-green-600">Yes</span>
              </button>
              <button onClick={onConfirmDiscardCancelBtnClick} className="group inline-flex items-center p-2 focus:outline-none">
                <span className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm rounded-md text-gray-600 bg-white group-hover:bg-gray-100 group-hover:text-gray-700 group-focus:ring-2 group-focus:ring-green-600">No</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(ConfirmDiscardPopup);
