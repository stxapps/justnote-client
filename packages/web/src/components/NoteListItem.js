import React from 'react';
import { useSelector } from 'react-redux';

import { ADDING, MOVING } from '../types/const';
import { isDiedStatus } from '../utils';

import NoteListItemContent from './NoteListItemContent';

const NoteListItem = (props) => {

  const { note } = props;
  const { id, status } = note;
  const noteId = useSelector(state => state.display.noteId);

  const renderRetry = () => {
    return null;
  };

  const renderBusy = () => {
    return null;
  };

  return (
    <li className="relative px-4 py-5 sm:px-6">
      <NoteListItemContent note={note} />
      {isDiedStatus(status) && renderRetry()}
      {[ADDING, MOVING].includes(status) && renderBusy()}
      {id === noteId && <div className="absolute top-0 right-0 inset-y-0 w-1 bg-green-600"></div>}
    </li>
  );
};

export default React.memo(NoteListItem);
