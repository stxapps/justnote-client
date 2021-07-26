import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateNoteIdUrlHash, updateNoteId, updateBulkEditUrlHash,
  addSelectedNoteIds, deleteSelectedNoteIds,
} from '../actions';
import { LG_WIDTH } from '../types/const';
import { makeIsNoteIdSelected } from '../selectors';
import { isBusyStatus, stripHtml } from '../utils';

import { useSafeAreaFrame } from '.';

const NoteListItemContent = (props) => {

  const { note } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getIsNoteIdSelected = useMemo(makeIsNoteIdSelected, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsNoteIdSelected(state, note.id));
  const clickPressTimer = useRef(null);
  const touchPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const dispatch = useDispatch();

  const isBusy = isBusyStatus(note.status);

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

  useEffect(() => {
    return () => {
      clearTimeout(clickPressTimer.current);
      clearTimeout(touchPressTimer.current);
    };
  }, []);

  const circleClassNames = isSelected ? 'bg-green-600 border-green-700' : 'bg-gray-200 border-gray-300';
  const checkClassNames = isSelected ? 'text-white' : 'text-gray-400';

  return (
    <button onTouchStart={onTouchPress} onTouchMove={onTouchCancel} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchCancel} onMouseDown={onClickPress} onMouseUp={onClickPressRelease} onMouseLeave={onClickCancel} className="group w-full text-left rounded-sm flex items-center px-3 py-4 focus:outline-none focus-visible:bg-gray-100 sm:px-5">
      {(isBulkEditing && !isBusy) && <div className={`w-10 h-10 border mr-3 rounded-full flex justify-center items-center ${circleClassNames}`}>
        <svg className={`w-6 h-6 ${checkClassNames}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
        </svg>
      </div>}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-800 truncate group-hover:underline lg:text-sm">{note.title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-3">{stripHtml(note.body)}</p>
      </div>
    </button>
  );
};

export default React.memo(NoteListItemContent);
