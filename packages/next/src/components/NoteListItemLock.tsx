import React, { useMemo } from 'react';

import { useSelector, useDispatch } from '../store';
import { showLockMenuPopup, showUNEPopup } from '../actions/chunk';
import { makeGetDoShowTitle } from '../selectors';
import { adjustRect } from '../utils';

import { useTailwind } from '.';

const NoteListItemLock = (props) => {

  const { note } = props;
  const getDoShowTitle = useMemo(makeGetDoShowTitle, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const doShowTitle = useSelector(state => getDoShowTitle(state, note));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onContentBtnClick = () => {
    if (isBulkEditing) return;
    dispatch(showUNEPopup(note.id, true));
  };

  const onMenuBtnClick = (e) => {
    if (isBulkEditing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const nRect = adjustRect(rect, 12, 4, -20, -8);
    dispatch(showLockMenuPopup(note.id, nRect));
  };

  let title = '';
  if (doShowTitle) {
    if (note.id.startsWith('conflict')) {
      for (const _note of note.notes) {
        if (_note.title) {
          title = _note.title;
          break;
        }
      }
    } else {
      title = note.title;
    }
  }
  const body = 'This note is locked.';

  const titleTabIndex = title ? 0 : -1;
  const bodyTabIndex = title ? -1 : 0;

  return (
    <div className={tailwind('group flex items-center rounded-xs py-4 pl-3 sm:pl-5')}>
      <button tabIndex={-1} onClick={onContentBtnClick} className={tailwind('mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white pb-0.5 focus:outline-none blk:border-gray-600 blk:bg-gray-900')}>
        <svg className={tailwind('h-6 w-6 text-gray-400 blk:text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
        </svg>
      </button>
      <div className={tailwind('min-w-0 flex-1')}>
        <div className={tailwind('pr-3')}>
          <button tabIndex={titleTabIndex} onClick={onContentBtnClick} className={tailwind('flex w-full items-center justify-between rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 blk:focus-visible:ring-gray-500 blk:focus-visible:ring-offset-gray-900')}>
            <h3 className={tailwind('min-w-0 flex-1 truncate text-left text-base font-semibold text-gray-800 group-hover:underline blk:text-gray-100 lg:text-sm')}>{title}</h3>
          </button>
        </div>
        <div className={tailwind('flex items-center justify-between')}>
          <button tabIndex={bodyTabIndex} onClick={onContentBtnClick} className={tailwind('min-h-[2.625rem] w-full min-w-0 flex-1 rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 blk:focus-visible:ring-gray-500 blk:focus-visible:ring-offset-gray-900')}>
            <p className={tailwind('text-left text-sm text-gray-500 line-clamp-3 blk:text-gray-400')}>{body}</p>
          </button>
          <button onClick={onMenuBtnClick} className={tailwind('flex-shrink-0 flex-grow-0 py-1 pl-4 pr-2 text-gray-400 focus:outline-none blk:text-gray-500 group-s')}>
            <svg className={tailwind('w-[1.125rem] rounded-full py-2 group-s-hover:bg-gray-200 group-s-focus-visible:bg-gray-200 blk:group-s-hover:bg-gray-700 blk:group-s-hover:text-gray-400 blk:group-s-focus-visible:bg-gray-700 blk:group-s-focus-visible:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(NoteListItemLock);
