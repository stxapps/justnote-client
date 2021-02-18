import React from 'react';
import { useSelector } from 'react-redux';

import { updateNoteIdUrlHash } from '../actions';
import { NEW_NOTE } from '../types/const';

import NoteListTopBar from './NoteListTopBar';
import NoteListItems from './NoteListItems';
//import LoadingNoteListItems from './LoadingNoteListItems';

const NoteList = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  const onAddBtnClick = () => {
    updateNoteIdUrlHash(NEW_NOTE);
  };

  const noteListItems = <NoteListItems />;
  //const noteListItems = <LoadingNoteListItems />;

  return (
    <div className="relative w-full min-w-64 h-full flex flex-col">
      {/* TopBar */}
      <NoteListTopBar onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Main */}
      {noteListItems}
      {/* Add button */}
      {!isBulkEditing && <button onClick={onAddBtnClick} className="absolute right-4 bottom-4 rounded-full bg-green-600 text-white w-16 h-16 shadow-md flex items-center justify-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 lg:hidden">
        <svg className="w-10 h-10" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M20 10C20.5304 10 21.0391 10.2107 21.4142 10.5858C21.7893 10.9609 22 11.4696 22 12V18H28C28.5304 18 29.0391 18.2107 29.4142 18.5858C29.7893 18.9609 30 19.4696 30 20C30 20.5304 29.7893 21.0391 29.4142 21.4142C29.0391 21.7893 28.5304 22 28 22H22V28C22 28.5304 21.7893 29.0391 21.4142 29.4142C21.0391 29.7893 20.5304 30 20 30C19.4696 30 18.9609 29.7893 18.5858 29.4142C18.2107 29.0391 18 28.5304 18 28V22H12C11.4696 22 10.9609 21.7893 10.5858 21.4142C10.2107 21.0391 10 20.5304 10 20C10 19.4696 10.2107 18.9609 10.5858 18.5858C10.9609 18.2107 11.4696 18 12 18H18V12C18 11.4696 18.2107 10.9609 18.5858 10.5858C18.9609 10.2107 19.4696 10 20 10Z" />
        </svg>
      </button>}
    </div>
  );
};

export default React.memo(NoteList);
