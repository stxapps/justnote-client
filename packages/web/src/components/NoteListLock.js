import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePopupUrlHash } from '../actions';
import { updateSelectingListName, updateLockAction } from '../actions/chunk';
import { LOCK_EDITOR_POPUP, LOCK_ACTION_UNLOCK_LIST, LOCKED } from '../types/const';
import { getCurrentLockListStatus } from '../selectors';

import { useTailwind } from '.';

const NoteListLock = () => {

  const listName = useSelector(state => state.display.listName);
  const lockStatus = useSelector(state => getCurrentLockListStatus(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onLockBtnClick = () => {
    dispatch(updateSelectingListName(listName));
    dispatch(updateLockAction(LOCK_ACTION_UNLOCK_LIST));
    updatePopupUrlHash(LOCK_EDITOR_POPUP, true);
  };

  if (lockStatus !== LOCKED) return null;

  return (
    <div className={tailwind('absolute inset-0 bg-white overflow-y-auto pb-[5.5rem] lg:pb-0 blk:bg-gray-900')}>
      <div className={tailwind('mt-32 mb-24 px-4 sm:px-6')}>
        <button onClick={onLockBtnClick} className={tailwind('group block w-full focus:outline-none')}>
          <div className={tailwind('mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
            <svg className={tailwind('h-10 w-10 text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
            </svg>
          </div>
          <p className={tailwind('mt-6 text-center text-base font-semibold tracking-wide text-gray-800 blk:text-gray-200 lg:text-sm')}>This list is locked</p>
          <div className={tailwind('mt-4 flex items-center justify-center')}>
            <div className={tailwind('rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-500 shadow-sm hover:border-gray-400 hover:text-gray-600 group-focus-visible:border-gray-400 group-focus-visible:ring-2 group-focus-visible:ring-gray-400 group-focus-visible:ring-offset-2 blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200 blk:group-focus-visible:border-gray-300 blk:group-focus-visible:ring-gray-500 blk:group-focus-visible:ring-offset-gray-900')}>Unlock</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default React.memo(NoteListLock);
