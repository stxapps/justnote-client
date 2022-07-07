import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  updatePopupUrlHash, updateNoteIdUrlHash, updateNoteId, updateBulkEditUrlHash,
  addSelectedNoteIds, deleteSelectedNoteIds, updateSelectingNoteId,
} from '../actions';
import { NOTE_LIST_ITEM_MENU_POPUP, LG_WIDTH } from '../types/const';
import { makeIsNoteIdSelected, makeGetPinStatus, makeGetNoteDate } from '../selectors';
import { isBusyStatus, isPinningStatus, stripHtml } from '../utils';

import { useSafeAreaFrame } from '.';

const NoteListItemContent = (props) => {

  const { note } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getIsNoteIdSelected = useMemo(makeIsNoteIdSelected, []);
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const getNoteDate = useMemo(makeGetNoteDate, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsNoteIdSelected(state, note.id));
  const pinStatus = useSelector(state => getPinStatus(state, note.id));
  const noteDate = useSelector(state => getNoteDate(state, note));
  const body = useMemo(() => stripHtml(note.body), [note.body]);
  const isBusy = useMemo(() => {
    return isBusyStatus(note.status) || isPinningStatus(pinStatus);
  }, [note.status, pinStatus]);
  const clickPressTimer = useRef(null);
  const touchPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const dispatch = useDispatch();

  const onClickPress = () => {
    clickPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (!isBulkEditing) {
        updateBulkEditUrlHash(true);
        if (!isBusy) dispatch(addSelectedNoteIds([note.id]));
      }
    }, 500);
  };

  const onClickCancel = () => {
    if (clickPressTimer.current) {
      clearTimeout(clickPressTimer.current);
      clickPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onClickPressRelease = () => {
    if (clickPressTimer.current) {
      clearTimeout(clickPressTimer.current);
      if (!isLongPress.current) {
        if (isBulkEditing) {
          if (!isBusy) {
            if (isSelected) dispatch(deleteSelectedNoteIds([note.id]));
            else dispatch(addSelectedNoteIds([note.id]));
          }
        } else {
          if (safeAreaWidth < LG_WIDTH) updateNoteIdUrlHash(note.id);
          else dispatch(updateNoteId(note.id, false, true));
        }
      }
      clickPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onTouchPress = () => {
    touchPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (!isBulkEditing) {
        updateBulkEditUrlHash(true);
        if (!isBusy) dispatch(addSelectedNoteIds([note.id]));
      }
    }, 500);
  };

  const onTouchCancel = () => {
    if (touchPressTimer.current) {
      clearTimeout(touchPressTimer.current);
      touchPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onTouchPressRelease = (e) => {
    if (e.cancelable) e.preventDefault();
    if (touchPressTimer.current) {
      clearTimeout(touchPressTimer.current);
      if (!isLongPress.current) {
        if (isBulkEditing) {
          if (!isBusy) {
            if (isSelected) dispatch(deleteSelectedNoteIds([note.id]));
            else dispatch(addSelectedNoteIds([note.id]));
          }
        } else {
          if (safeAreaWidth < LG_WIDTH) updateNoteIdUrlHash(note.id);
          else dispatch(updateNoteId(note.id, false, true));
        }
      }
      touchPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onMenuBtnClick = (e) => {
    dispatch(updateSelectingNoteId(note.id));

    const _rect = e.currentTarget.getBoundingClientRect();
    const newX = _rect.x + 12;
    const newY = _rect.y + 4;
    const newWidth = _rect.width - 12 - 8;
    const newHeight = _rect.height - 4 - 4;
    const rect = {
      x: newX, y: newY, width: newWidth, height: newHeight,
      top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
    };
    updatePopupUrlHash(NOTE_LIST_ITEM_MENU_POPUP, true, rect);
  };

  useEffect(() => {
    return () => {
      clearTimeout(clickPressTimer.current);
      clearTimeout(touchPressTimer.current);
    };
  }, []);

  const circleClassNames = isSelected ? 'bg-green-600 border-green-700' : 'bg-gray-200 border-gray-300';
  const checkClassNames = isSelected ? 'text-white' : 'text-gray-400';

  const titleTabIndex = note.title ? 0 : -1;
  const bodyTabIndex = note.title ? -1 : 0;

  return (
    <div className="rounded-sm flex items-center pl-3 py-4 group sm:pl-5">
      {(isBulkEditing && !isBusy) && <button onTouchStart={onTouchPress} onTouchMove={onTouchCancel} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchCancel} onMouseDown={onClickPress} onMouseUp={onClickPressRelease} onMouseLeave={onClickCancel} className={`w-10 h-10 border mr-3 rounded-full flex justify-center items-center ${circleClassNames} focus:outline-none`}>
        <svg className={`w-6 h-6 ${checkClassNames}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
        </svg>
      </button>}
      <div className="flex-1 min-w-0">
        <div className="pr-3">
          <button tabIndex={titleTabIndex} onTouchStart={onTouchPress} onTouchMove={onTouchCancel} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchCancel} onMouseDown={onClickPress} onMouseUp={onClickPressRelease} onMouseLeave={onClickCancel} className="w-full flex justify-between items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400">
            <h3 className="flex-1 min-w-0 text-base font-semibold text-gray-800 text-left truncate group-hover:underline lg:text-sm">{note.title}</h3>
            <p className="ml-3 flex-grow-0 flex-shrink-0 whitespace-nowrap text-xs text-gray-400 text-left">{noteDate}</p>
          </button>
        </div>
        <div className={`flex justify-between items-center ${isBulkEditing ? 'pr-3' : ''}`}>
          <button tabIndex={bodyTabIndex} onTouchStart={onTouchPress} onTouchMove={onTouchCancel} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchCancel} onMouseDown={onClickPress} onMouseUp={onClickPressRelease} onMouseLeave={onClickCancel} className="flex-1 min-w-0 min-h-[2.625rem] w-full rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400">
            <p className="text-sm text-gray-500 text-left line-clamp-3">{body}</p>
          </button>
          {!isBulkEditing && <button onClick={onMenuBtnClick} className="flex-grow-0 flex-shrink-0 text-gray-400 pl-4 pr-2 py-1 group-s focus:outline-none" disabled={isBusy}>
            <svg className="w-[1.125rem] py-2 rounded-full group-s-hover:bg-gray-200 group-s-focus-visible:bg-gray-200" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
            </svg>
          </button>}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NoteListItemContent);
