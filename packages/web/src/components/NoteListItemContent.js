import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux'

import {
  updateNoteIdUrlHash, updateBulkEditUrlHash, addSelectedNoteIds,
} from '../actions';

const NoteListItemContent = (props) => {

  const { title, text } = props.note;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  const clickPressTimer = useRef(null);
  const touchPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const onClickPress = (event) => {
    clickPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      updateBulkEditUrlHash(true);
      addSelectedNoteIds([props.note.id]);
    }, 500);
  }

  const onClickPressRelease = (event) => {
    clearTimeout(clickPressTimer.current);
    if (!isLongPress.current) {
      updateNoteIdUrlHash(props.note.id);
    }
    isLongPress.current = false;
  }

  const onTouchPress = (event) => {
    touchPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      updateBulkEditUrlHash(true);
      addSelectedNoteIds([props.note.id]);
    }, 500);
  }

  const onTouchPressRelease = (event) => {
    clearTimeout(touchPressTimer.current);
    if (isLongPress.current) {
      updateNoteIdUrlHash(props.note.id);
    }
    isLongPress.current = false;
  }

  useEffect(() => {
    return () => {
      clearTimeout(clickPressTimer.current);
      clearTimeout(touchPressTimer.current);
    };
  }, []);

  return (
    <button onTouchStart={onTouchPress} onTouchMove={onTouchPressRelease} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchPressRelease} onMouseDown={onClickPress} onMouseMove={onClickPressRelease} onMouseUp={onClickPressRelease} onMouseLeave={onClickPressRelease} className="group w-full text-left rounded-sm flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600">
      {isBulkEditing && <div className="w-10 h-10 bg-gray-200 border border-gray-300 mr-3 rounded-full"></div>}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-800 group-hover:underline">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-3">{text}</p>
      </div>
    </button>
  );
};

export default React.memo(NoteListItemContent);
