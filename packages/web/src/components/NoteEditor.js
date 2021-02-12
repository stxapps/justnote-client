import React from 'react';
import { useSelector } from 'react-redux'

import NoteEditorCommands from './NoteEditorCommands';
import NoteEditorEditor from './NoteEditorEditor';
import NoteEditorBulkEditCommands from './NoteEditorBulkEditCommands';

const NoteEditor = (props) => {

  const { isFullScreen, onToggleFullScreen } = props;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  if (isBulkEditing) return <NoteEditorBulkEditCommands />;

  return (
    <div className="w-full h-full">
      <NoteEditorCommands isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} />
      <NoteEditorEditor />
    </div>
  );
};

export default React.memo(NoteEditor);
