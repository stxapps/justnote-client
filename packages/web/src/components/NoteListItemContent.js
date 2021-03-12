import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateNoteIdUrlHash, updateNoteId, updateBulkEditUrlHash,
  addSelectedNoteIds, deleteSelectedNoteIds,
} from '../actions';
import { LG_WIDTH } from '../types/const';
import { makeIsNoteIdSelected } from '../selectors';

import { useSafeAreaFrame } from '.';

const NoteListItemContent = (props) => {

  const { note } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();

  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  const getIsNoteIdSelected = useMemo(makeIsNoteIdSelected, []);
  const isNoteIdSelected = useSelector(state => getIsNoteIdSelected(state, note.id));

  const clickPressTimer = useRef(null);
  const touchPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const dispatch = useDispatch();

  const onClickPress = (event) => {
    if (isBulkEditing) return;
    clickPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      updateBulkEditUrlHash(true);
      addSelectedNoteIds([note.id]);
    }, 500);
  }

  const onClickPressRelease = (event) => {
    if (clickPressTimer.current) {
      clearTimeout(clickPressTimer.current);
      if (!isLongPress.current) {
        if (safeAreaWidth < LG_WIDTH) updateNoteIdUrlHash(note.id);
        else dispatch(updateNoteId(note.id));
      }
      clickPressTimer.current = null;
      isLongPress.current = false;
    }
  }

  const onTouchPress = (event) => {
    if (isBulkEditing) return;
    touchPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      updateBulkEditUrlHash(true);
      addSelectedNoteIds([note.id]);
    }, 500);
  }

  const onTouchPressRelease = (event) => {
    if (touchPressTimer.current) {
      clearTimeout(touchPressTimer.current);
      if (isLongPress.current) {
        if (safeAreaWidth < LG_WIDTH) updateNoteIdUrlHash(note.id);
        else dispatch(updateNoteId(note.id));
      }
      touchPressTimer.current = null;
      isLongPress.current = false;
    }
  }

  const onContentBtnClick = () => {
    if (isBulkEditing) {
      if (isNoteIdSelected) dispatch(deleteSelectedNoteIds([note.id]));
      else dispatch(addSelectedNoteIds([note.id]))
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(clickPressTimer.current);
      clearTimeout(touchPressTimer.current);
    };
  }, []);

  return (
    <button onTouchStart={onTouchPress} onTouchMove={onTouchPressRelease} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchPressRelease} onMouseDown={onClickPress} onMouseMove={onClickPressRelease} onMouseUp={onClickPressRelease} onMouseLeave={onClickPressRelease} onClick={onContentBtnClick} className="group w-full text-left rounded-sm flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600">
      {isBulkEditing && <div className="w-10 h-10 bg-gray-200 border border-gray-300 mr-3 rounded-full"></div>}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:underline">{note.title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-3">{note.body}</p>
      </div>
    </button>
  );
};

export default React.memo(NoteListItemContent);
