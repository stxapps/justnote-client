import React from 'react';
import { useSelector } from 'react-redux';

import ConflictedNoteListItemContent from './ConflictedNoteListItemContent';

const ConflictedNoteListItem = (props) => {

  const { note } = props;
  const { id } = note;
  const noteId = useSelector(state => state.display.noteId);

  return (
    <li className="relative px-4 py-5 sm:px-6">
      <ConflictedNoteListItemContent note={note} />
      {id === noteId && <div className="absolute top-0 right-0 inset-y-0 w-1 bg-red-100"></div>}
    </li>
  );
};

export default React.memo(ConflictedNoteListItem);
