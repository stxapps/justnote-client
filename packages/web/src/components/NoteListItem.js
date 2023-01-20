import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { PINNED, VALID, INVALID } from '../types/const';
import { makeGetPinStatus, makeGetUnsavedNote } from '../selectors';
import { isDiedStatus, isBusyStatus, isPinningStatus } from '../utils';

import { useTailwind } from '.';
import NoteListItemContent from './NoteListItemContent';
import NoteListItemError from './NoteListItemError';

const NoteListItem = (props) => {

  const { note } = props;
  const getPinStatus = useMemo(makeGetPinStatus, []);
  const getUnsavedNote = useMemo(makeGetUnsavedNote, []);
  const noteId = useSelector(state => state.display.noteId);
  const pinStatus = useSelector(state => getPinStatus(state, note));
  const unsavedNote = useSelector(state => getUnsavedNote(state, note));
  const tailwind = useTailwind();

  const isConflicted = note.id.startsWith('conflict');
  const isDied = isDiedStatus(note.status);
  const isUnsavedValid = unsavedNote.status === VALID;
  const isUnsavedInvalid = unsavedNote.status === INVALID;
  const isPinning = isPinningStatus(pinStatus);

  const renderBusy = () => {
    const svgStyle = { top: '50px', left: '24px' };

    return (
      <div className={tailwind('absolute top-0 right-0 h-12 w-12 overflow-hidden bg-transparent')}>
        <div className={tailwind(`relative h-12 w-12 translate-x-1/2 -translate-y-1/2 rotate-45 transform overflow-hidden ${isConflicted || isDied ? 'bg-red-100' : 'bg-green-600'}`)}>
          <svg style={svgStyle} className={tailwind(`relative h-5 w-5 -translate-x-1/2 -translate-y-full -rotate-45 transform ${isConflicted || isDied ? 'text-red-400' : 'text-green-100'}`)} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  };

  const renderPinning = () => {
    const svgStyle = { top: '28px', left: '34px' };

    return (
      <div className={tailwind('absolute top-0 left-0 h-10 w-10 overflow-hidden bg-transparent')}>
        <div className={tailwind('relative h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 transform overflow-hidden bg-gray-500 blk:bg-gray-400')}>
          <svg style={svgStyle} className={tailwind('relative h-4 w-4 -translate-x-1/2 -translate-y-full -rotate-45 transform text-gray-100 blk:text-gray-800')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  };

  const renderPin = () => {
    const svgStyle = { top: '27px', left: '32px' };

    return (
      <div className={tailwind('absolute top-0 left-0 h-10 w-10 overflow-hidden bg-transparent')}>
        <div className={tailwind('relative h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 transform overflow-hidden bg-gray-500 blk:bg-gray-400')}>
          <svg style={svgStyle} className={tailwind('relative h-3 w-3 -translate-x-1/2 -translate-y-full -rotate-45 transform text-gray-100 blk:text-gray-600')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.2349 14.61C19.8599 12.865 17.8929 11.104 16.2249 10.485L15.6809 5.53698L17.1759 3.29498C17.3329 3.05898 17.3479 2.75698 17.2129 2.50798C17.0789 2.25798 16.8209 2.10498 16.5379 2.10498H7.39792C7.11392 2.10498 6.85592 2.25898 6.72192 2.50798C6.58792 2.75798 6.60192 3.06098 6.75992 3.29598L8.25792 5.54298L7.77392 10.486C6.10592 11.106 4.14092 12.866 3.76992 14.602C3.72992 14.762 3.75392 15.006 3.90192 15.196C4.00492 15.328 4.20592 15.486 4.58192 15.486H8.63992L11.5439 22.198C11.6219 22.382 11.8039 22.5 12.0019 22.5C12.1999 22.5 12.3819 22.382 12.4619 22.198L15.3649 15.485H19.4219C19.7979 15.485 19.9979 15.329 20.1019 15.199C20.2479 15.011 20.2739 14.765 20.2369 14.609L20.2349 14.61Z" />
          </svg>
        </div>
      </div>
    );
  };

  const renderUnsaved = () => {
    const svgStyle = { top: '50px', left: '24px' };

    return (
      <div className={tailwind('absolute top-0 right-0 bg-transparent pt-0.5 pr-px')} title="This note has an unsaved version.">
        <svg style={svgStyle} className={tailwind('h-4 w-4 text-green-600')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97231 16.8756 4.2181C16.9762 4.46389 17.0268 4.72725 17.0245 4.99281C17.0222 5.25837 16.967 5.52081 16.8622 5.76482C16.7574 6.00883 16.605 6.22952 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" />
        </svg>
      </div>
    );
  };

  let content;
  if (isConflicted || isDied || isUnsavedInvalid) {
    content = <NoteListItemError note={note} unsavedNote={unsavedNote} />;
  } else {
    content = <NoteListItemContent note={note} pinStatus={pinStatus} />;
  }

  return (
    <li className={tailwind('relative px-1 py-1')}>
      {content}
      {(isBusyStatus(note.status) && note.id !== noteId) && renderBusy()}
      {(isUnsavedValid && note.id !== noteId) && renderUnsaved()}
      {isPinning && renderPinning()}
      {[PINNED].includes(pinStatus) && renderPin()}
      {note.id === noteId && <div className={tailwind(`absolute inset-y-0 top-0 right-0 w-1 ${isConflicted || isDied ? 'bg-red-100' : 'bg-green-600'}`)} />}
    </li>
  );
};

export default React.memo(NoteListItem);
