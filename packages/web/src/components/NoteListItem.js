import React, { } from 'react';

import { ADDING, MOVING } from '../types/const';
import { isDiedStatus } from '../utils';

import NoteListItemContent from './NoteListItemContent';

const NoteListItem = (props) => {

  const { note } = props;
  const { status } = note;

  const renderRetry = () => {
    return null;
  };

  const renderBusy = () => {
    return null;
  };

  return (
    <li className="px-4 py-5 sm:px-6 lg:px-8">
      <NoteListItemContent note={note} />
      {isDiedStatus(status) && renderRetry()}
      {[ADDING, MOVING].includes(status) && renderBusy()}
    </li>
  );
};

export default React.memo(NoteListItem);
