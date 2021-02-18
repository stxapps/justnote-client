import React from 'react';
import { useSelector } from 'react-redux'

import NoteEditorTopBar from './NoteEditorTopBar';
import NoteEditorEditor from './NoteEditorEditor';
import NoteEditorBulkEdit from './NoteEditorBulkEdit';

const NoteEditor = (props) => {

  const { isFullScreen, onToggleFullScreen, onRightPanelCloseBtnClick } = props;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  if (isBulkEditing) return <NoteEditorBulkEdit />;

  return (
    <div className="w-full h-full bg-white">
      <NoteEditorTopBar isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} onRightPanelCloseBtnClick={onRightPanelCloseBtnClick} />
      <NoteEditorEditor />
    </div>
  );
};

export default React.memo(NoteEditor);
