import React from 'react';
import { useSelector } from 'react-redux';

import { ADDING, UPDATING, MOVING, MERGING } from '../types/const';
import { isDiedStatus } from '../utils';

import NoteListItemContent from './NoteListItemContent';
import NoteListItemError from './NoteListItemError';

const NoteListItem = (props) => {

  const { note } = props;
  const noteId = useSelector(state => state.display.noteId);

  const isConflicted = note.id.startsWith('conflict');
  const isDied = isDiedStatus(note.status);

  const renderBusy = () => {
    const svgStyle = { top: '50px', left: '24px' };

    return (
      <div className="absolute top-0 right-0 w-12 h-12 bg-transparent overflow-hidden">
        <div className={`relative w-12 h-12 overflow-hidden transform rotate-45 translate-x-1/2 -translate-y-1/2 ${isConflicted || isDied ? 'bg-red-100' : 'bg-green-600'}`}>
          <svg style={svgStyle} className={`relative w-5 h-5 transform -rotate-45 -translate-x-1/2 -translate-y-full ${isConflicted || isDied ? 'text-red-400' : 'text-green-100'}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  };

  let content;
  if (isConflicted || isDied) content = <NoteListItemError note={note} />;
  else content = <NoteListItemContent note={note} />;

  return (
    <li className="relative px-4 py-5 sm:px-6">
      {content}
      {[ADDING, UPDATING, MOVING, MERGING].includes(note.status) && renderBusy()}
      {note.id === noteId && <div className={`absolute top-0 right-0 inset-y-0 w-1 ${isConflicted || isDied ? 'bg-red-100' : 'bg-green-600'}`}></div>}
    </li>
  );
};

export default React.memo(NoteListItem);
