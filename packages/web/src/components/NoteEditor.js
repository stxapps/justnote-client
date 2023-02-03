import React from 'react';
import { useSelector } from 'react-redux';

import { INVALID } from '../types/const';
import { isDiedStatus } from '../utils';

import { useTailwind } from '.';
import NoteEditorTopBar from './NoteEditorTopBar';
import NoteEditorEditor from './NoteEditorEditor';
import NoteEditorBulkEdit from './NoteEditorBulkEdit';
import { NoteEditorSavedConflict, NoteEditorUnsavedConflict } from './NoteEditorConflict';
import NoteEditorRetry from './NoteEditorRetry';

const NoteEditor = (props) => {

  const { note, unsavedNote, isFullScreen, onToggleFullScreen } = props;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const tailwind = useTailwind();

  const isUnsavedInvalid = unsavedNote.status === INVALID;

  if (isBulkEditing) return <NoteEditorBulkEdit />;
  if (!note) {
    return (
      <div className={tailwind('relative h-full w-full bg-white blk:bg-gray-900')}>
        <div style={{ top: '172px' }} className={tailwind('absolute inset-x-0')}>
          <div className={tailwind('mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
            <svg className={tailwind('h-16 w-16 text-gray-500 blk:text-gray-400')} viewBox="0 0 60 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M40.758 10.758C41.3115 10.1849 41.9736 9.72784 42.7056 9.41339C43.4376 9.09894 44.2249 8.93342 45.0216 8.9265C45.8183 8.91957 46.6083 9.07138 47.3457 9.37307C48.0831 9.67475 48.753 10.1203 49.3164 10.6836C49.8797 11.247 50.3252 11.9169 50.6269 12.6543C50.9286 13.3917 51.0804 14.1817 51.0735 14.9784C51.0666 15.7751 50.9011 16.5624 50.5866 17.2944C50.2722 18.0265 49.8151 18.6885 49.242 19.242L46.863 21.621L38.379 13.137L40.758 10.758V10.758ZM34.137 17.379L9 42.516V51H17.484L42.624 25.863L34.134 17.379H34.137Z" />
            </svg>
          </div>
        </div>
        <div className={tailwind('absolute inset-x-0 bottom-8')}>
          <p className={tailwind('text-center text-sm text-gray-500 blk:text-gray-400')}>Click "+ New Note" button or select your note</p>
        </div>
      </div>
    );
  }
  if (note.id.startsWith('conflict')) return <NoteEditorSavedConflict note={note} />;
  if (isDiedStatus(note.status)) return <NoteEditorRetry note={note} />;
  if (isUnsavedInvalid) {
    return <NoteEditorUnsavedConflict note={note} unsavedNote={unsavedNote} />;
  }

  return (
    <div className={tailwind('flex h-full w-full flex-col bg-white blk:bg-gray-900')}>
      <NoteEditorTopBar note={note} isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} />
      <NoteEditorEditor note={note} unsavedNote={unsavedNote} />
    </div>
  );
};

export default React.memo(NoteEditor);
