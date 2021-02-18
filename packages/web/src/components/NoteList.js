import React from 'react';
import { useSelector } from 'react-redux';

import { updateNoteIdUrlHash } from '../actions';
import { NEW_NOTE } from '../types/const';

import NoteListTopBar from './NoteListTopBar';
import NoteListItem from './NoteListItem';

const NoteList = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  const onAddBtnClick = () => {
    updateNoteIdUrlHash(NEW_NOTE);
  };

  return (
    <div className="relative w-full min-w-64 h-full">
      {/* TopBar */}
      <NoteListTopBar onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Main */}
      <div className="overflow-y-auto">
        <div className="mt-6">
          <ul className="-my-5 divide-y divide-gray-200">
            <NoteListItem note={{ id: '1', title: 'First note', text: 'Tenetur libero voluptatem rerum occaecati qui est molestiae exercitationem. Voluptate quisquam iure assumenda consequatur ex et recusandae. Alias consectetur voluptatibus. Accusamus a ab dicta et. Consequatur quis dignissimos voluptatem nisi.', createdDt: '1882181' }} />
            <NoteListItem note={{ id: '2', title: 'My second note', text: 'This is a test. That is a book.', createdDt: '192882' }} />
            <NoteListItem note={{ id: '3', title: 'Holy Shit! I did it.', text: 'WTF. Why you whining like a girl?', createdDt: '2082181' }} />
          </ul>
        </div>
        <div className="mt-6 px-4 sm:px-6 lg:px-8">
          <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50">More</button>
        </div>
      </div>
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
