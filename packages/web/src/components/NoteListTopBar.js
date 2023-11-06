import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopupUrlHash, showNoteListMenuPopup } from '../actions';
import { SYNC, SYNC_ROLLBACK } from '../types/actionTypes';
import { SEARCH_POPUP, LG_WIDTH, UPDATING, SHOW_SYNCED } from '../types/const';

import { useSafeAreaFrame, useTailwind } from '.';

import NoteListSearchPopup from './NoteListSearchPopup';
import NoteListTopBarBulkEdit from './NoteListTopBarBulkEdit';
import NoteListTopBarTitle from './NoteListTopBarTitle';

const NoteListTopBar = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const settingsStatus = useSelector(state => state.display.settingsStatus);
  const syncProgress = useSelector(state => state.display.syncProgress);
  const menuBtn = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onMenuBtnClick = () => {
    const rect = menuBtn.current.getBoundingClientRect();
    dispatch(showNoteListMenuPopup(rect, true));
  };

  const onSearchBtnClick = () => {
    updatePopupUrlHash(SEARCH_POPUP, true, null);
  };

  if (safeAreaWidth < LG_WIDTH && isBulkEditing) return <NoteListTopBarBulkEdit />;

  const menuBtnSvg = (
    <svg className={tailwind('w-10 rounded-full p-2 group-focus:bg-gray-200 blk:group-focus:bg-gray-700')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 10C6 10.5304 5.78929 11.0391 5.41421 11.4142C5.03914 11.7893 4.53043 12 4 12C3.46957 12 2.96086 11.7893 2.58579 11.4142C2.21071 11.0391 2 10.5304 2 10C2 9.46957 2.21071 8.96086 2.58579 8.58579C2.96086 8.21071 3.46957 8 4 8C4.53043 8 5.03914 8.21071 5.41421 8.58579C5.78929 8.96086 6 9.46957 6 10ZM12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10ZM16 12C16.5304 12 17.0391 11.7893 17.4142 11.4142C17.7893 11.0391 18 10.5304 18 10C18 9.46957 17.7893 8.96086 17.4142 8.58579C17.0391 8.21071 16.5304 8 16 8C15.4696 8 14.9609 8.21071 14.5858 8.58579C14.2107 8.96086 14 9.46957 14 10C14 10.5304 14.2107 11.0391 14.5858 11.4142C14.9609 11.7893 15.4696 12 16 12Z" />
    </svg>
  );

  let innerMenuBtn;
  if (settingsStatus === UPDATING || (syncProgress && syncProgress.status === SYNC)) {
    innerMenuBtn = (
      <React.Fragment>
        {menuBtnSvg}
        <div className={tailwind('absolute top-0 left-0 flex h-full items-center justify-start lds-rotate')}>
          <svg className={tailwind('h-10 w-10 text-green-600 blk:text-green-500')} viewBox="0 0 100 100" fill="none" stroke="currentColor" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" strokeWidth="4" r="44" strokeDasharray="226.1946710584651 77.39822368615503" />
          </svg>
        </div>
      </React.Fragment>
    );
  } else if (syncProgress && syncProgress.status === SYNC_ROLLBACK) {
    innerMenuBtn = (
      <React.Fragment>
        {menuBtnSvg}
        <div className={tailwind('absolute top-1 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 blk:bg-red-500')} />
      </React.Fragment>
    );
  } else if (syncProgress && syncProgress.status === SHOW_SYNCED) {
    innerMenuBtn = (
      <React.Fragment>
        {menuBtnSvg}
        <div className={tailwind('absolute top-1 right-2.5 h-1.5 w-1.5 rounded-full bg-green-600 blk:bg-green-500')} />
      </React.Fragment>
    );
  } else {
    innerMenuBtn = menuBtnSvg;
  }

  return (
    <div className={tailwind('flex-shrink-0 flex-grow-0')}>
      <div className={tailwind('flex h-16 items-center justify-between border-b border-gray-200 blk:border-gray-700')}>
        <button onClick={onSidebarOpenBtnClick} className={tailwind('h-full border-r border-gray-200 px-4 text-gray-500 hover:text-gray-700 focus:bg-gray-200 focus:text-gray-700 focus:outline-none blk:border-gray-700 blk:text-gray-400 blk:hover:text-gray-200 blk:focus:bg-gray-700 blk:focus:text-gray-200 sm:px-6 lg:hidden')}>
          <span className={tailwind('sr-only')}>Open sidebar</span>
          <svg className={tailwind('h-6 w-6')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </button>
        <div className={tailwind('flex min-w-0 flex-1 items-center justify-between pl-4 sm:pl-6')}>
          <div className={tailwind('min-w-0 flex-1')}>
            <NoteListTopBarTitle />
          </div>
          <div className={tailwind('ml-4 flex')}>
            <button onClick={onSearchBtnClick} type="button" className={tailwind('group inline-flex items-center border border-white bg-white px-1 text-sm text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none blk:border-gray-900 blk:bg-gray-900 blk:text-gray-400 blk:hover:text-gray-200 blk:focus:text-gray-200 lg:hidden')}>
              <div className={tailwind('rounded p-2.5 group-focus:bg-gray-200 blk:group-focus:bg-gray-700')}>
                <svg className={tailwind('h-5 w-5')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8 4.00003C6.93913 4.00003 5.92172 4.42146 5.17157 5.17161C4.42143 5.92175 4 6.93917 4 8.00003C4 9.0609 4.42143 10.0783 5.17157 10.8285C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8285C11.5786 10.0783 12 9.0609 12 8.00003C12 6.93917 11.5786 5.92175 10.8284 5.17161C10.0783 4.42146 9.06087 4.00003 8 4.00003ZM2 8.00003C1.99988 7.05574 2.22264 6.12475 2.65017 5.28278C3.0777 4.4408 3.69792 3.71163 4.4604 3.15456C5.22287 2.59749 6.10606 2.22825 7.03815 2.07687C7.97023 1.92549 8.92488 1.99625 9.82446 2.28338C10.724 2.57052 11.5432 3.06594 12.2152 3.72933C12.8872 4.39272 13.3931 5.20537 13.6919 6.10117C13.9906 6.99697 14.0737 7.95063 13.9343 8.88459C13.795 9.81855 13.4372 10.7064 12.89 11.476L17.707 16.293C17.8892 16.4816 17.99 16.7342 17.9877 16.9964C17.9854 17.2586 17.8802 17.5094 17.6948 17.6949C17.5094 17.8803 17.2586 17.9854 16.9964 17.9877C16.7342 17.99 16.4816 17.8892 16.293 17.707L11.477 12.891C10.5794 13.5293 9.52335 13.9082 8.42468 13.9862C7.326 14.0641 6.22707 13.8381 5.2483 13.333C4.26953 12.8279 3.44869 12.0631 2.87572 11.1224C2.30276 10.1817 1.99979 9.10147 2 8.00003Z" />
                </svg>
              </div>
            </button>
            <button ref={menuBtn} onClick={onMenuBtnClick} type="button" className={tailwind('group relative inline-flex items-center border border-white bg-white pr-2 text-sm text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none blk:border-gray-900 blk:bg-gray-900 blk:text-gray-400 blk:hover:text-gray-200 blk:focus:text-gray-200')}>
              {innerMenuBtn}
            </button>
          </div>
        </div>
      </div>
      <NoteListSearchPopup />
    </div>
  );
};

export default React.memo(NoteListTopBar);
