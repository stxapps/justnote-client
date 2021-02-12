import React, { useRef } from 'react';

import { updatePopupUrlHash } from '../actions';
import { NOTE_LIST_MENU_POPUP } from '../types/const';

import NoteListItem from './NoteListItem';

const NoteList = () => {

  const menuBtn = useRef(null);

  const onMenuBtnClick = () => {
    updatePopupUrlHash(
      NOTE_LIST_MENU_POPUP, true, menuBtn.current.getBoundingClientRect()
    );
  };

  return (
    <div className="w-full min-w-64 h-full overflow-y-auto">
      {/* TopBar */}
      <div className="border-b border-gray-200 pl-4 pr-0 py-4 flex items-center justify-between sm:pl-6 lg:pl-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-medium leading-6 text-gray-900 truncate">My Notes</h1>
        </div>
        <button ref={menuBtn} onClick={onMenuBtnClick} type="button" className="group ml-3 inline-flex items-center px-4 border border-white text-sm font-medium text-gray-400 hover:text-gray-600 focus:outline-none-outer">
          <svg className="w-5 py-2 rounded-full group-hover:bg-gray-200 focus:ring-2 focus:ring-green-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
          </svg>
        </button>
      </div>
      {/* Main */}
      <div>
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
    </div>
  );
};

export default React.memo(NoteList);
