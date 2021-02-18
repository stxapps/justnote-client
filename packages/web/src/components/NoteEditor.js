import React from 'react';
import { useSelector } from 'react-redux'

import logo from '../images/logo-short.svg';

import NoteEditorTopBar from './NoteEditorTopBar';
import NoteEditorEditor from './NoteEditorEditor';
import NoteEditorBulkEdit from './NoteEditorBulkEdit';

const NoteEditor = (props) => {

  const { isFullScreen, onToggleFullScreen, onRightPanelCloseBtnClick } = props;
  const noteId = useSelector(state => state.display.noteId);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  if (isBulkEditing) return <NoteEditorBulkEdit />;
  if (!noteId) return (
    <div className="w-full h-full bg-white p-4 flex items-center justify-center">
      <div className="-mt-16 max-w-sm">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12">
            <img src={logo} alt="" />
          </div>
        </div>
        <p className="mt-2 text-gray-400 text-base text-center">Click "+ New Note" button or select your note</p>
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
