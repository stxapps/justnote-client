import React, { } from 'react';
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from "framer-motion"

import { updatePopupUrlHash, updateBulkEditUrlHash } from '../actions';
import { NOTE_LIST_MENU_POPUP } from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

const NoteListMenuPopup = () => {

  const isShown = useSelector(state => state.display.isNoteListMenuPopupShown);
  const anchorPosition = useSelector(state => state.display.noteListMenuPopupPosition);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  if (!isShown) return (
    <AnimatePresence key="AP_NL_MenuPopup"></AnimatePresence>
  );

  const onNoteListMenuCancelBtnClick = () => {
    updatePopupUrlHash(NOTE_LIST_MENU_POPUP, false, null);
  };

  const onSelectBtnClick = () => {
    updateBulkEditUrlHash(true, true);
  };

  const onExitBtnClick = () => {
    onNoteListMenuCancelBtnClick();
    updateBulkEditUrlHash(false);
  };

  const menuPopupStyle = {
    top: anchorPosition.top + anchorPosition.height,
    left: anchorPosition.left + 16,
  };

  let buttons;
  if (isBulkEditing) {
    buttons = (
      <button onClick={onExitBtnClick} className="group w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18ZM8.707 7.293C8.5184 7.11084 8.2658 7.01005 8.0036 7.01233C7.7414 7.0146 7.49059 7.11977 7.30518 7.30518C7.11977 7.49059 7.0146 7.7414 7.01233 8.0036C7.01005 8.2658 7.11084 8.5184 7.293 8.707L8.586 10L7.293 11.293C7.19749 11.3852 7.12131 11.4956 7.0689 11.6176C7.01649 11.7396 6.9889 11.8708 6.98775 12.0036C6.9866 12.1364 7.0119 12.2681 7.06218 12.391C7.11246 12.5139 7.18671 12.6255 7.2806 12.7194C7.3745 12.8133 7.48615 12.8875 7.60905 12.9378C7.73194 12.9881 7.86362 13.0134 7.9964 13.0123C8.12918 13.0111 8.2604 12.9835 8.3824 12.9311C8.50441 12.8787 8.61475 12.8025 8.707 12.707L10 11.414L11.293 12.707C11.4816 12.8892 11.7342 12.99 11.9964 12.9877C12.2586 12.9854 12.5094 12.8802 12.6948 12.6948C12.8802 12.5094 12.9854 12.2586 12.9877 11.9964C12.99 11.7342 12.8892 11.4816 12.707 11.293L11.414 10L12.707 8.707C12.8892 8.5184 12.99 8.2658 12.9877 8.0036C12.9854 7.7414 12.8802 7.49059 12.6948 7.30518C12.5094 7.11977 12.2586 7.0146 11.9964 7.01233C11.7342 7.01005 11.4816 7.11084 11.293 7.293L10 8.586L8.707 7.293Z" />
        </svg>
        Exit
      </button>
    );
  } else {
    buttons = (
      <button onClick={onSelectBtnClick} className="group w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17.414 2.586C17.0389 2.21106 16.5303 2.00043 16 2.00043C15.4697 2.00043 14.9611 2.21106 14.586 2.586L7 10.172V13H9.828L17.414 5.414C17.7889 5.03894 17.9996 4.53033 17.9996 4C17.9996 3.46967 17.7889 2.96106 17.414 2.586Z" />
          <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H8C8.26522 4 8.51957 4.10536 8.70711 4.29289C8.89464 4.48043 9 4.73478 9 5C9 5.26522 8.89464 5.51957 8.70711 5.70711C8.51957 5.89464 8.26522 6 8 6H4V16H14V12C14 11.7348 14.1054 11.4804 14.2929 11.2929C14.4804 11.1054 14.7348 11 15 11C15.2652 11 15.5196 11.1054 15.7071 11.2929C15.8946 11.4804 16 11.7348 16 12V16C16 16.5304 15.7893 17.0391 15.4142 17.4142C15.0391 17.7893 14.5304 18 14 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V6Z" />
        </svg>
        Select Notes
      </button>
    );
  }

  return (
    <AnimatePresence key="AP_NL_MenuPopup">
      <motion.button key="NL_MenuPopup_cancelBtn" onClick={onNoteListMenuCancelBtnClick} tabIndex={-1} className="fixed inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
      <motion.div key="NL_MenuPopup_menuPopup" style={menuPopupStyle} className="absolute origin-top-left mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <div className="py-1">
          {buttons}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(NoteListMenuPopup);
