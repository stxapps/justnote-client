import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Url from 'url-parse';

import {
  sync, updateSynced, signOut, updatePopupUrlHash, updateSettingsPopup,
  updateSettingsViewId, updateBulkEditUrlHash, lockCurrentList,
} from '../actions';
import { SYNC, SYNC_ROLLBACK } from '../types/actionTypes';
import {
  HASH_SUPPORT, NOTE_LIST_MENU_POPUP, SETTINGS_VIEW_ACCOUNT, LG_WIDTH, SHOW_SYNCED,
  LOCK, UNLOCKED,
} from '../types/const';
import { getCurrentLockListStatus, getCanChangeListNames } from '../selectors';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';

const NoteListMenuPopup = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isNoteListMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.noteListMenuPopupPosition);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const syncProgress = useSelector(state => state.display.syncProgress);
  const doSyncMode = useSelector(state => state.localSettings.doSyncMode);
  const lockStatus = useSelector(state => getCurrentLockListStatus(state));
  const canChangeListNames = useSelector(state => getCanChangeListNames(state));
  const cancelBtn = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onNoteListMenuCancelBtnClick = () => {
    updatePopupUrlHash(NOTE_LIST_MENU_POPUP, false, null);
  };

  const onSyncBtnClick = () => {
    onNoteListMenuCancelBtnClick();
    if (syncProgress && syncProgress.status === SHOW_SYNCED) {
      dispatch(updateSynced());
    } else {
      dispatch(sync(true));
    }
  };

  const onSelectBtnClick = () => {
    onNoteListMenuCancelBtnClick();

    // As this and showing settings popup both change url hash,
    //   need to be in different js clock cycle.
    setTimeout(() => {
      dispatch(updateBulkEditUrlHash(true, null, false, true));
    }, 100);
  };

  const onSettingsBtnClick = () => {
    onNoteListMenuCancelBtnClick();

    // As this and showing settings popup both change url hash,
    //   need to be in different js clock cycle.
    setTimeout(() => {
      dispatch(updateSettingsViewId(SETTINGS_VIEW_ACCOUNT, true));
      dispatch(updateSettingsPopup(true));
    }, 100);
  };

  const onSupportBtnClick = () => {
    const urlObj = new Url(window.location.href, {});
    urlObj.set('pathname', '/');
    urlObj.set('hash', HASH_SUPPORT);
    window.location.replace(urlObj.toString());
  };

  const onSignOutBtnClick = () => {
    onNoteListMenuCancelBtnClick();
    dispatch(signOut())
  };

  const onExitBtnClick = () => {
    onNoteListMenuCancelBtnClick();

    // As this and closing menu popup both call window.history.back(),
    //   need to be in different js clock cycle.
    setTimeout(() => updateBulkEditUrlHash(false), 100);
  };

  const onLockBtnClick = () => {
    onNoteListMenuCancelBtnClick();
    // Wait for the close animation to finish first
    setTimeout(() => dispatch(lockCurrentList()), 100);
  };

  const renderSyncBtn = () => {
    if (!doSyncMode) return null;

    if (syncProgress && syncProgress.status === SYNC) {
      return (
        <div className={tailwind('group flex w-full cursor-default items-center px-4 py-3 text-sm text-gray-700 blk:text-gray-200')} role="menuitem">
          <div className={tailwind('mr-3 h-5 w-5')}>
            <svg className={tailwind('h-5 w-5 text-gray-400 blk:text-gray-400 lds-rotate')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M4 2C4.26522 2 4.51957 2.10536 4.70711 2.29289C4.89464 2.48043 5 2.73478 5 3V5.101C5.83204 4.25227 6.86643 3.62931 8.00574 3.29078C9.14506 2.95226 10.3518 2.90932 11.5123 3.16601C12.6728 3.42269 13.7488 3.97056 14.6391 4.758C15.5294 5.54544 16.2045 6.54654 16.601 7.667C16.6491 7.79176 16.6717 7.92489 16.6674 8.05854C16.6632 8.19218 16.6322 8.32361 16.5763 8.44506C16.5203 8.56651 16.4406 8.67551 16.3418 8.76561C16.243 8.85571 16.1272 8.92508 16.0011 8.96963C15.875 9.01417 15.7413 9.03298 15.6078 9.02494C15.4744 9.0169 15.3439 8.98217 15.224 8.92282C15.1042 8.86346 14.9975 8.78068 14.9103 8.67937C14.823 8.57806 14.7569 8.46029 14.716 8.333C14.4141 7.47982 13.8865 6.72451 13.1892 6.14758C12.4919 5.57064 11.6512 5.19369 10.7566 5.05688C9.86195 4.92008 8.94698 5.02855 8.10916 5.37074C7.27133 5.71293 6.54204 6.27602 5.999 7H9C9.26522 7 9.51957 7.10536 9.70711 7.29289C9.89464 7.48043 10 7.73478 10 8C10 8.26522 9.89464 8.51957 9.70711 8.70711C9.51957 8.89464 9.26522 9 9 9H4C3.73478 9 3.48043 8.89464 3.29289 8.70711C3.10536 8.51957 3 8.26522 3 8V3C3 2.73478 3.10536 2.48043 3.29289 2.29289C3.48043 2.10536 3.73478 2 4 2ZM4.008 11.057C4.13184 11.0133 4.26308 10.9943 4.39422 11.0013C4.52537 11.0083 4.65386 11.0411 4.77235 11.0977C4.89084 11.1544 4.99701 11.2338 5.0848 11.3315C5.17259 11.4291 5.24028 11.5432 5.284 11.667C5.58586 12.5202 6.11355 13.2755 6.81082 13.8524C7.50809 14.4294 8.34883 14.8063 9.24344 14.9431C10.138 15.0799 11.053 14.9714 11.8908 14.6293C12.7287 14.2871 13.458 13.724 14.001 13H11C10.7348 13 10.4804 12.8946 10.2929 12.7071C10.1054 12.5196 10 12.2652 10 12C10 11.7348 10.1054 11.4804 10.2929 11.2929C10.4804 11.1054 10.7348 11 11 11H16C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12V17C17 17.2652 16.8946 17.5196 16.7071 17.7071C16.5196 17.8946 16.2652 18 16 18C15.7348 18 15.4804 17.8946 15.2929 17.7071C15.1054 17.5196 15 17.2652 15 17V14.899C14.168 15.7477 13.1336 16.3707 11.9943 16.7092C10.8549 17.0477 9.64821 17.0907 8.48772 16.834C7.32723 16.5773 6.25117 16.0294 5.36091 15.242C4.47065 14.4546 3.79548 13.4535 3.399 12.333C3.35526 12.2092 3.33634 12.0779 3.34333 11.9468C3.35031 11.8156 3.38306 11.6871 3.43971 11.5687C3.49635 11.4502 3.57578 11.344 3.67346 11.2562C3.77114 11.1684 3.88516 11.1007 4.009 11.057H4.008Z" />
            </svg>
          </div>
          Syncing...
        </div>
      );
    }

    if (syncProgress && syncProgress.status === SYNC_ROLLBACK) {
      return (
        <button onClick={onSyncBtnClick} className={tailwind('group relative flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-100 hover:text-red-700 focus:bg-red-100 focus:text-red-700 focus:outline-none blk:text-red-500 blk:hover:bg-gray-700 blk:hover:text-red-600 blk:focus:bg-gray-700 blk:focus:text-red-600')} role="menuitem">
          <svg className={tailwind('mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 group-focus:text-red-600 blk:text-red-500 blk:group-hover:text-red-600 blk:group-focus:text-red-600')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM11 14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14C9 13.7348 9.10536 13.4804 9.29289 13.2929C9.48043 13.1054 9.73478 13 10 13C10.2652 13 10.5196 13.1054 10.7071 13.2929C10.8946 13.4804 11 13.7348 11 14ZM10 5C9.73478 5 9.48043 5.10536 9.29289 5.29289C9.10536 5.48043 9 5.73478 9 6V10C9 10.2652 9.10536 10.5196 9.29289 10.7071C9.48043 10.8946 9.73478 11 10 11C10.2652 11 10.5196 10.8946 10.7071 10.7071C10.8946 10.5196 11 10.2652 11 10V6C11 5.73478 10.8946 5.48043 10.7071 5.29289C10.5196 5.10536 10.2652 5 10 5Z" />
          </svg>
          Retry sync
          <div className={tailwind('absolute top-2 right-4 h-1.5 w-1.5 rounded-full bg-red-500 group-hover:bg-red-600 group-focus:bg-red-600 blk:bg-red-500 blk:group-hover:bg-red-600 blk:group-focus:bg-red-600')} />
        </button>
      );
    }

    if (syncProgress && syncProgress.status === SHOW_SYNCED) {
      return (
        <button onClick={onSyncBtnClick} className={tailwind('group relative flex w-full items-center px-4 py-3 text-sm text-green-600 hover:bg-green-100 hover:text-green-700 focus:bg-green-100 focus:text-green-700 focus:outline-none blk:text-green-500 blk:hover:bg-gray-700 blk:hover:text-green-400 blk:focus:bg-gray-700 blk:focus:text-green-400')} role="menuitem">
          <svg className={tailwind('mr-3 h-5 w-5 text-green-500 group-hover:text-green-600 group-focus:text-green-600 blk:text-green-500 blk:group-hover:text-green-400 blk:group-focus:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M4 2C4.26522 2 4.51957 2.10536 4.70711 2.29289C4.89464 2.48043 5 2.73478 5 3V5.101C5.83204 4.25227 6.86643 3.62931 8.00574 3.29078C9.14506 2.95226 10.3518 2.90932 11.5123 3.16601C12.6728 3.42269 13.7488 3.97056 14.6391 4.758C15.5294 5.54544 16.2045 6.54654 16.601 7.667C16.6491 7.79176 16.6717 7.92489 16.6674 8.05854C16.6632 8.19218 16.6322 8.32361 16.5763 8.44506C16.5203 8.56651 16.4406 8.67551 16.3418 8.76561C16.243 8.85571 16.1272 8.92508 16.0011 8.96963C15.875 9.01417 15.7413 9.03298 15.6078 9.02494C15.4744 9.0169 15.3439 8.98217 15.224 8.92282C15.1042 8.86346 14.9975 8.78068 14.9103 8.67937C14.823 8.57806 14.7569 8.46029 14.716 8.333C14.4141 7.47982 13.8865 6.72451 13.1892 6.14758C12.4919 5.57064 11.6512 5.19369 10.7566 5.05688C9.86195 4.92008 8.94698 5.02855 8.10916 5.37074C7.27133 5.71293 6.54204 6.27602 5.999 7H9C9.26522 7 9.51957 7.10536 9.70711 7.29289C9.89464 7.48043 10 7.73478 10 8C10 8.26522 9.89464 8.51957 9.70711 8.70711C9.51957 8.89464 9.26522 9 9 9H4C3.73478 9 3.48043 8.89464 3.29289 8.70711C3.10536 8.51957 3 8.26522 3 8V3C3 2.73478 3.10536 2.48043 3.29289 2.29289C3.48043 2.10536 3.73478 2 4 2ZM4.008 11.057C4.13184 11.0133 4.26308 10.9943 4.39422 11.0013C4.52537 11.0083 4.65386 11.0411 4.77235 11.0977C4.89084 11.1544 4.99701 11.2338 5.0848 11.3315C5.17259 11.4291 5.24028 11.5432 5.284 11.667C5.58586 12.5202 6.11355 13.2755 6.81082 13.8524C7.50809 14.4294 8.34883 14.8063 9.24344 14.9431C10.138 15.0799 11.053 14.9714 11.8908 14.6293C12.7287 14.2871 13.458 13.724 14.001 13H11C10.7348 13 10.4804 12.8946 10.2929 12.7071C10.1054 12.5196 10 12.2652 10 12C10 11.7348 10.1054 11.4804 10.2929 11.2929C10.4804 11.1054 10.7348 11 11 11H16C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12V17C17 17.2652 16.8946 17.5196 16.7071 17.7071C16.5196 17.8946 16.2652 18 16 18C15.7348 18 15.4804 17.8946 15.2929 17.7071C15.1054 17.5196 15 17.2652 15 17V14.899C14.168 15.7477 13.1336 16.3707 11.9943 16.7092C10.8549 17.0477 9.64821 17.0907 8.48772 16.834C7.32723 16.5773 6.25117 16.0294 5.36091 15.242C4.47065 14.4546 3.79548 13.4535 3.399 12.333C3.35526 12.2092 3.33634 12.0779 3.34333 11.9468C3.35031 11.8156 3.38306 11.6871 3.43971 11.5687C3.49635 11.4502 3.57578 11.344 3.67346 11.2562C3.77114 11.1684 3.88516 11.1007 4.009 11.057H4.008Z" />
          </svg>
          Refresh
          <div className={tailwind('absolute top-3 right-9 h-1.5 w-1.5 rounded-full bg-green-500 group-hover:bg-green-600 group-focus:bg-green-600 blk:bg-green-500 blk:group-hover:bg-green-400 blk:group-focus:bg-green-400')} />
        </button>
      );
    }

    return (
      <button onClick={onSyncBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M4 2C4.26522 2 4.51957 2.10536 4.70711 2.29289C4.89464 2.48043 5 2.73478 5 3V5.101C5.83204 4.25227 6.86643 3.62931 8.00574 3.29078C9.14506 2.95226 10.3518 2.90932 11.5123 3.16601C12.6728 3.42269 13.7488 3.97056 14.6391 4.758C15.5294 5.54544 16.2045 6.54654 16.601 7.667C16.6491 7.79176 16.6717 7.92489 16.6674 8.05854C16.6632 8.19218 16.6322 8.32361 16.5763 8.44506C16.5203 8.56651 16.4406 8.67551 16.3418 8.76561C16.243 8.85571 16.1272 8.92508 16.0011 8.96963C15.875 9.01417 15.7413 9.03298 15.6078 9.02494C15.4744 9.0169 15.3439 8.98217 15.224 8.92282C15.1042 8.86346 14.9975 8.78068 14.9103 8.67937C14.823 8.57806 14.7569 8.46029 14.716 8.333C14.4141 7.47982 13.8865 6.72451 13.1892 6.14758C12.4919 5.57064 11.6512 5.19369 10.7566 5.05688C9.86195 4.92008 8.94698 5.02855 8.10916 5.37074C7.27133 5.71293 6.54204 6.27602 5.999 7H9C9.26522 7 9.51957 7.10536 9.70711 7.29289C9.89464 7.48043 10 7.73478 10 8C10 8.26522 9.89464 8.51957 9.70711 8.70711C9.51957 8.89464 9.26522 9 9 9H4C3.73478 9 3.48043 8.89464 3.29289 8.70711C3.10536 8.51957 3 8.26522 3 8V3C3 2.73478 3.10536 2.48043 3.29289 2.29289C3.48043 2.10536 3.73478 2 4 2ZM4.008 11.057C4.13184 11.0133 4.26308 10.9943 4.39422 11.0013C4.52537 11.0083 4.65386 11.0411 4.77235 11.0977C4.89084 11.1544 4.99701 11.2338 5.0848 11.3315C5.17259 11.4291 5.24028 11.5432 5.284 11.667C5.58586 12.5202 6.11355 13.2755 6.81082 13.8524C7.50809 14.4294 8.34883 14.8063 9.24344 14.9431C10.138 15.0799 11.053 14.9714 11.8908 14.6293C12.7287 14.2871 13.458 13.724 14.001 13H11C10.7348 13 10.4804 12.8946 10.2929 12.7071C10.1054 12.5196 10 12.2652 10 12C10 11.7348 10.1054 11.4804 10.2929 11.2929C10.4804 11.1054 10.7348 11 11 11H16C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12V17C17 17.2652 16.8946 17.5196 16.7071 17.7071C16.5196 17.8946 16.2652 18 16 18C15.7348 18 15.4804 17.8946 15.2929 17.7071C15.1054 17.5196 15 17.2652 15 17V14.899C14.168 15.7477 13.1336 16.3707 11.9943 16.7092C10.8549 17.0477 9.64821 17.0907 8.48772 16.834C7.32723 16.5773 6.25117 16.0294 5.36091 15.242C4.47065 14.4546 3.79548 13.4535 3.399 12.333C3.35526 12.2092 3.33634 12.0779 3.34333 11.9468C3.35031 11.8156 3.38306 11.6871 3.43971 11.5687C3.49635 11.4502 3.57578 11.344 3.67346 11.2562C3.77114 11.1684 3.88516 11.1007 4.009 11.057H4.008Z" />
        </svg>
        Sync
      </button>
    );
  };

  useEffect(() => {
    if (isShown) cancelBtn.current.focus();
  }, [isShown]);

  if (!isShown) return (
    <AnimatePresence key="AP_NL_MenuPopup" />
  );

  const popupStyle = { top: anchorPosition.top + 4 };
  if (safeAreaWidth < LG_WIDTH) {
    popupStyle.right = safeAreaWidth - anchorPosition.right + 12;
    popupStyle.transformOrigin = 'top right';
  } else {
    popupStyle.left = anchorPosition.left + 4;
    popupStyle.transformOrigin = 'top left';
  }

  const supportAndSignOutButtons = (
    <React.Fragment>
      <button onClick={onSupportBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM16 10C16 10.993 15.759 11.929 15.332 12.754L13.808 11.229C14.0362 10.5227 14.0632 9.76679 13.886 9.046L15.448 7.484C15.802 8.249 16 9.1 16 10ZM10.835 13.913L12.415 15.493C11.654 15.8281 10.8315 16.0007 10 16C9.13118 16.0011 8.27257 15.8127 7.484 15.448L9.046 13.886C9.63267 14.0298 10.2443 14.039 10.835 13.913ZM6.158 11.117C5.96121 10.4394 5.94707 9.72182 6.117 9.037L6.037 9.117L4.507 7.584C4.1718 8.34531 3.99913 9.16817 4 10C4 10.954 4.223 11.856 4.619 12.657L6.159 11.117H6.158ZM7.246 4.667C8.09722 4.22702 9.04179 3.99825 10 4C10.954 4 11.856 4.223 12.657 4.619L11.117 6.159C10.3493 5.93538 9.53214 5.94687 8.771 6.192L7.246 4.668V4.667ZM12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10Z" />
        </svg>
        Support
      </button>
      <button onClick={onSignOutBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M3 3C2.73478 3 2.48043 3.10536 2.29289 3.29289C2.10536 3.48043 2 3.73478 2 4V16C2 16.2652 2.10536 16.5196 2.29289 16.7071C2.48043 16.8946 2.73478 17 3 17C3.26522 17 3.51957 16.8946 3.70711 16.7071C3.89464 16.5196 4 16.2652 4 16V4C4 3.73478 3.89464 3.48043 3.70711 3.29289C3.51957 3.10536 3.26522 3 3 3ZM13.293 12.293C13.1108 12.4816 13.01 12.7342 13.0123 12.9964C13.0146 13.2586 13.1198 13.5094 13.3052 13.6948C13.4906 13.8802 13.7414 13.9854 14.0036 13.9877C14.2658 13.99 14.5184 13.8892 14.707 13.707L17.707 10.707C17.8945 10.5195 17.9998 10.2652 17.9998 10C17.9998 9.73484 17.8945 9.48053 17.707 9.293L14.707 6.293C14.6148 6.19749 14.5044 6.12131 14.3824 6.0689C14.2604 6.01649 14.1292 5.9889 13.9964 5.98775C13.8636 5.9866 13.7319 6.0119 13.609 6.06218C13.4861 6.11246 13.3745 6.18671 13.2806 6.2806C13.1867 6.3745 13.1125 6.48615 13.0622 6.60905C13.0119 6.73194 12.9866 6.86362 12.9877 6.9964C12.9889 7.12918 13.0165 7.2604 13.0689 7.3824C13.1213 7.50441 13.1975 7.61475 13.293 7.707L14.586 9H7C6.73478 9 6.48043 9.10536 6.29289 9.29289C6.10536 9.48043 6 9.73478 6 10C6 10.2652 6.10536 10.5196 6.29289 10.7071C6.48043 10.8946 6.73478 11 7 11H14.586L13.293 12.293Z" />
        </svg>
        Sign out
      </button>
    </React.Fragment>
  );

  let buttons;
  if (!canChangeListNames) {
    buttons = supportAndSignOutButtons;
  } else if (isBulkEditing) {
    buttons = (
      <button onClick={onExitBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
        <svg className={tailwind('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18ZM8.707 7.293C8.5184 7.11084 8.2658 7.01005 8.0036 7.01233C7.7414 7.0146 7.49059 7.11977 7.30518 7.30518C7.11977 7.49059 7.0146 7.7414 7.01233 8.0036C7.01005 8.2658 7.11084 8.5184 7.293 8.707L8.586 10L7.293 11.293C7.19749 11.3852 7.12131 11.4956 7.0689 11.6176C7.01649 11.7396 6.9889 11.8708 6.98775 12.0036C6.9866 12.1364 7.0119 12.2681 7.06218 12.391C7.11246 12.5139 7.18671 12.6255 7.2806 12.7194C7.3745 12.8133 7.48615 12.8875 7.60905 12.9378C7.73194 12.9881 7.86362 13.0134 7.9964 13.0123C8.12918 13.0111 8.2604 12.9835 8.3824 12.9311C8.50441 12.8787 8.61475 12.8025 8.707 12.707L10 11.414L11.293 12.707C11.4816 12.8892 11.7342 12.99 11.9964 12.9877C12.2586 12.9854 12.5094 12.8802 12.6948 12.6948C12.8802 12.5094 12.9854 12.2586 12.9877 11.9964C12.99 11.7342 12.8892 11.4816 12.707 11.293L11.414 10L12.707 8.707C12.8892 8.5184 12.99 8.2658 12.9877 8.0036C12.9854 7.7414 12.8802 7.49059 12.6948 7.30518C12.5094 7.11977 12.2586 7.0146 11.9964 7.01233C11.7342 7.01005 11.4816 7.11084 11.293 7.293L10 8.586L8.707 7.293Z" />
        </svg>
        Exit
      </button>
    );
  } else {
    buttons = (
      <React.Fragment>
        {lockStatus === UNLOCKED && <button onClick={onLockBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
          <svg className={tailwind('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
          </svg>
          {LOCK}
        </button>}
        {renderSyncBtn()}
        <button onClick={onSelectBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
          <svg className={tailwind('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M17.414 2.586C17.0389 2.21106 16.5303 2.00043 16 2.00043C15.4697 2.00043 14.9611 2.21106 14.586 2.586L7 10.172V13H9.828L17.414 5.414C17.7889 5.03894 17.9996 4.53033 17.9996 4C17.9996 3.46967 17.7889 2.96106 17.414 2.586Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H8C8.26522 4 8.51957 4.10536 8.70711 4.29289C8.89464 4.48043 9 4.73478 9 5C9 5.26522 8.89464 5.51957 8.70711 5.70711C8.51957 5.89464 8.26522 6 8 6H4V16H14V12C14 11.7348 14.1054 11.4804 14.2929 11.2929C14.4804 11.1054 14.7348 11 15 11C15.2652 11 15.5196 11.1054 15.7071 11.2929C15.8946 11.4804 16 11.7348 16 12V16C16 16.5304 15.7893 17.0391 15.4142 17.4142C15.0391 17.7893 14.5304 18 14 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V6Z" />
          </svg>
          Select notes
        </button>
        <button onClick={onSettingsBtnClick} className={tailwind('group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none blk:text-gray-200 blk:hover:bg-gray-700 blk:hover:text-gray-50 blk:focus:bg-gray-700 blk:focus:text-white')} role="menuitem">
          <svg className={tailwind('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300 blk:group-focus:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17C11.11 1.61 8.88999 1.61 8.50999 3.17C8.45326 3.40442 8.34198 3.62213 8.18522 3.80541C8.02845 3.9887 7.83063 4.13238 7.60784 4.22477C7.38505 4.31716 7.1436 4.35564 6.90313 4.33709C6.66266 4.31854 6.42997 4.24347 6.22399 4.118C4.85199 3.282 3.28199 4.852 4.11799 6.224C4.65799 7.11 4.17899 8.266 3.17099 8.511C1.60999 8.89 1.60999 11.111 3.17099 11.489C3.40547 11.5458 3.62322 11.6572 3.80651 11.8141C3.98979 11.971 4.13343 12.1689 4.22573 12.3918C4.31803 12.6147 4.35639 12.8563 4.33766 13.0968C4.31894 13.3373 4.24367 13.5701 4.11799 13.776C3.28199 15.148 4.85199 16.718 6.22399 15.882C6.42993 15.7563 6.66265 15.6811 6.90318 15.6623C7.14371 15.6436 7.38527 15.682 7.60817 15.7743C7.83108 15.8666 8.02904 16.0102 8.18592 16.1935C8.34281 16.3768 8.45419 16.5945 8.51099 16.829C8.88999 18.39 11.111 18.39 11.489 16.829C11.546 16.5946 11.6575 16.377 11.8144 16.1939C11.9713 16.0107 12.1692 15.8672 12.3921 15.7749C12.6149 15.6826 12.8564 15.6442 13.0969 15.6628C13.3373 15.6815 13.57 15.7565 13.776 15.882C15.148 16.718 16.718 15.148 15.882 13.776C15.7565 13.57 15.6815 13.3373 15.6628 13.0969C15.6442 12.8564 15.6826 12.6149 15.7749 12.3921C15.8672 12.1692 16.0107 11.9713 16.1939 11.8144C16.377 11.6575 16.5946 11.546 16.829 11.489C18.39 11.11 18.39 8.889 16.829 8.511C16.5945 8.45419 16.3768 8.34281 16.1935 8.18593C16.0102 8.02904 15.8666 7.83109 15.7743 7.60818C15.682 7.38527 15.6436 7.14372 15.6623 6.90318C15.681 6.66265 15.7563 6.42994 15.882 6.224C16.718 4.852 15.148 3.282 13.776 4.118C13.5701 4.24368 13.3373 4.31895 13.0968 4.33767C12.8563 4.35639 12.6147 4.31804 12.3918 4.22574C12.1689 4.13344 11.971 3.9898 11.8141 3.80651C11.6572 3.62323 11.5458 3.40548 11.489 3.171L11.49 3.17ZM9.99999 13C10.7956 13 11.5587 12.6839 12.1213 12.1213C12.6839 11.5587 13 10.7956 13 10C13 9.20435 12.6839 8.44129 12.1213 7.87868C11.5587 7.31607 10.7956 7 9.99999 7C9.20434 7 8.44128 7.31607 7.87867 7.87868C7.31606 8.44129 6.99999 9.20435 6.99999 10C6.99999 10.7956 7.31606 11.5587 7.87867 12.1213C8.44128 12.6839 9.20434 13 9.99999 13Z" />
          </svg>
          Settings
        </button>
        {supportAndSignOutButtons}
      </React.Fragment>
    );
  }

  return (
    <AnimatePresence key="AP_NL_MenuPopup">
      <motion.button key="NL_MenuPopup_cancelBtn" ref={cancelBtn} onClick={onNoteListMenuCancelBtnClick} className={tailwind('fixed inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      <motion.div key="NL_MenuPopup_popup" style={popupStyle} className={tailwind('absolute rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <div className={tailwind('py-1')}>
          {buttons}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(NoteListMenuPopup);
