import React from 'react';
import { useSelector } from 'react-redux';

import NoteEditorTopBar from './NoteEditorTopBar';
import NoteEditorEditor from './NoteEditorEditor';
import NoteEditorBulkEdit from './NoteEditorBulkEdit';

const NoteEditor = (props) => {

  const { isFullScreen, onToggleFullScreen, onRightPanelCloseBtnClick } = props;
  const noteId = useSelector(state => state.display.noteId);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  if (isBulkEditing) return <NoteEditorBulkEdit />;
  if (!noteId) return (
    <div className="relative w-full h-full bg-white">
      <div style={{ top: '172px' }} className="absolute inset-x-0">
        <div className="mx-auto bg-gray-200 w-32 h-32 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-500" viewBox="0 0 60 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M40.758 10.758C41.3115 10.1849 41.9736 9.72784 42.7056 9.41339C43.4376 9.09894 44.2249 8.93342 45.0216 8.9265C45.8183 8.91957 46.6083 9.07138 47.3457 9.37307C48.0831 9.67475 48.753 10.1203 49.3164 10.6836C49.8797 11.247 50.3252 11.9169 50.6269 12.6543C50.9286 13.3917 51.0804 14.1817 51.0735 14.9784C51.0666 15.7751 50.9011 16.5624 50.5866 17.2944C50.2722 18.0265 49.8151 18.6885 49.242 19.242L46.863 21.621L38.379 13.137L40.758 10.758V10.758ZM34.137 17.379L9 42.516V51H17.484L42.624 25.863L34.134 17.379H34.137Z" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-8">
        <p className="text-sm text-gray-600 text-center">Click "+ New Note" button or select your note</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-white">
      <NoteEditorTopBar isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} onRightPanelCloseBtnClick={onRightPanelCloseBtnClick} />
      <NoteEditorEditor />
    </div>
  );
};

export default React.memo(NoteEditor);
