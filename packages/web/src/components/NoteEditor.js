import React from 'react';
import PropTypes from 'prop-types';

const NoteEditor = (props) => {

  const { isFullScreen, onToggleFullScreen } = props;

  return (
    <div className="bg-red-300 w-full">
      <h3>Note Editor</h3>
      <button onClick={onToggleFullScreen} className="m-4 px-3 py-2 bg-indigo-400 rounded shadow-sm">{isFullScreen ? 'Exit' : 'Full screen'}</button>
    </div>
  );
};

NoteEditor.protoTypes = {
  isFullScreen: PropTypes.bool.isRequired,
  onToggleFullScreen: PropTypes.func.isRequired,
};

export default React.memo(NoteEditor);
