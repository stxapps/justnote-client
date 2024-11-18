import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { updatePopupUrlHash } from '../actions';
import { deleteNotes, deleteListNames, deleteTagNames } from '../actions/chunk';
import {
  CONFIRM_DELETE_POPUP, DELETE_ACTION_LIST_NAME, DELETE_ACTION_TAG_NAME, SM_WIDTH,
} from '../types/const';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';

const ConfirmDeletePopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isConfirmDeletePopupShown);
  const deleteAction = useSelector(state => state.display.deleteAction);
  const selectingListName = useSelector(state => state.display.selectingListName);
  const selectingTagName = useSelector(state => state.display.selectingTagName);
  const cancelBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onConfirmDeleteCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(CONFIRM_DELETE_POPUP, false, null);
    didClick.current = true;
  };

  const onConfirmDeleteOkBtnClick = () => {
    if (didClick.current) return;

    if (deleteAction === DELETE_ACTION_LIST_NAME) {
      dispatch(deleteListNames([selectingListName]));
    } else if (deleteAction === DELETE_ACTION_TAG_NAME) {
      dispatch(deleteTagNames([selectingTagName]));
    } else {
      // As this and closing confirmDelete popup both call window.history.back(),
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(deleteNotes()), 100);
    }
    onConfirmDeleteCancelBtnClick();

    didClick.current = true;
  };

  useEffect(() => {
    if (isShown) {
      cancelBtn.current.focus();
      didClick.current = false;
    }
  }, [isShown]);

  if (!isShown) return (
    <AnimatePresence key="AP_CDP" />
  );

  const spanStyle = {};
  if (safeAreaWidth >= SM_WIDTH) spanStyle.height = safeAreaHeight;

  return (
    <AnimatePresence key="AP_CDP">
      <div className={tailwind('fixed inset-0 overflow-y-auto')} aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div style={{ minHeight: safeAreaHeight }} className={tailwind('flex items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0')}>
          <div className={tailwind('fixed inset-0')}>
            <motion.button ref={cancelBtn} onClick={onConfirmDeleteCancelBtnClick} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <span style={spanStyle} className={tailwind('hidden sm:inline-block sm:align-middle')} aria-hidden="true">&#8203;</span>
          <motion.div className={tailwind('relative inline-block overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl blk:bg-gray-800 blk:ring-1 blk:ring-white blk:ring-opacity-25 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden">
            <div className={tailwind('sm:flex sm:items-start')}>
              <div className={tailwind('mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10')}>
                <svg className={tailwind('h-6 w-6 text-red-600')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className={tailwind('mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left')}>
                <h3 className={tailwind('text-lg font-medium leading-6 text-gray-900 blk:text-white')} id="modal-title">Confirm delete?</h3>
                <div className={tailwind('mt-2')}>
                  <p className={tailwind('text-sm text-gray-500 blk:text-gray-400')}>Are you sure you want to permanently delete? This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className={tailwind('mt-5 sm:mt-4 sm:ml-10 sm:flex sm:pl-4')}>
              <button onClick={onConfirmDeleteOkBtnClick} type="button" className={tailwind('inline-flex w-full justify-center rounded-md border border-red-600 bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 blk:border-red-500 blk:bg-red-500 blk:hover:bg-red-600 blk:focus:ring-red-600 blk:focus:ring-offset-gray-800 sm:w-auto sm:text-sm')}>Delete</button>
              <button onClick={onConfirmDeleteCancelBtnClick} type="button" className={tailwind('mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:border-gray-400 hover:text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-300 blk:hover:border-gray-400 blk:hover:text-gray-200 blk:focus:border-gray-400 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm')}>Cancel</button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(ConfirmDeletePopup);
