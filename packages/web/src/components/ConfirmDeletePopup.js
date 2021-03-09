import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  updatePopupUrlHash, updateBulkEditUrlHash, deleteNotes,
  deleteListNames, updateDeletingListName,
} from '../actions';
import { CONFIRM_DELETE_POPUP } from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';

const ConfirmDeletePopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isConfirmDeletePopupShown);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const deletingListName = useSelector(state => state.display.deletingListName);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onConfirmDeleteCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(CONFIRM_DELETE_POPUP, false, null);
    dispatch(updateDeletingListName(null));
    didClick.current = true;
  };

  const onConfirmDeleteOkBtnClick = () => {
    if (didClick.current) return;

    if (deletingListName) dispatch(deleteListNames([deletingListName]));
    else dispatch(deleteNotes());

    onConfirmDeleteCancelBtnClick();
    if (isBulkEditing) updateBulkEditUrlHash(false);

    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      cancelBtn.current.focus();
      didClick.current = false;
    }
  }, [isShown]);

  if (!isShown) return (
    <AnimatePresence key="AP_CDP"></AnimatePresence>
  );

  return (
    <AnimatePresence key="AP_CDP">
      <div className="fixed inset-0 overflow-hidden">
        <div className="p-4 flex items-center justify-center" style={{ minHeight: safeAreaHeight }}>
          <div className={'fixed inset-0'}>
            <motion.button ref={cancelBtn} onClick={onConfirmDeleteCancelBtnClick} className="absolute inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
          </div>
          <motion.div className="relative w-48 -mt-8 pt-4 pb-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <p className="text-base text-gray-600 text-center">Confirm delete?</p>
            <div className="pt-1 text-center">
              <button onClick={onConfirmDeleteOkBtnClick} className="group inline-flex items-center p-2 focus:outline-none">
                <span className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm rounded-md text-gray-600 bg-white group-hover:bg-gray-100 group-hover:text-gray-700 group-focus:ring-2 group-focus:ring-green-600">Yes</span>
              </button>
              <button onClick={onConfirmDeleteCancelBtnClick} className="group inline-flex items-center p-2 focus:outline-none">
                <span className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm rounded-md text-gray-600 bg-white group-hover:bg-gray-100 group-hover:text-gray-700 group-focus:ring-2 group-focus:ring-green-600">No</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(ConfirmDeletePopup);
