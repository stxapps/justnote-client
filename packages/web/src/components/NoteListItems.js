import React from 'react';

import NoteListItem from './NoteListItem';

const NoteListItems = () => {
  return (
    <div className="flex-grow flex-shrink overflow-y-auto">
      <div className="mt-6">
        <ul className="-my-5 divide-y divide-gray-200">
          <NoteListItem note={{ id: '1', title: 'First note', text: 'Tenetur libero voluptatem rerum occaecati qui est molestiae exercitationem. Voluptate quisquam iure assumenda consequatur ex et recusandae. Alias consectetur voluptatibus. Accusamus a ab dicta et. Consequatur quis dignissimos voluptatem nisi.', createdDt: '1882181' }} />
          <NoteListItem note={{ id: '2', title: 'My second note', text: 'This is a test. That is a book.', createdDt: '192882' }} />
          <NoteListItem note={{ id: '3', title: 'Holy Shit! I did it.', text: 'WTF. Why you whining like a girl?', createdDt: '2082181' }} />
          <NoteListItem note={{ id: '1', title: 'First note', text: 'Tenetur libero voluptatem rerum occaecati qui est molestiae exercitationem. Voluptate quisquam iure assumenda consequatur ex et recusandae. Alias consectetur voluptatibus. Accusamus a ab dicta et. Consequatur quis dignissimos voluptatem nisi.', createdDt: '1882181' }} />
          <NoteListItem note={{ id: '2', title: 'My second note', text: 'This is a test. That is a book.', createdDt: '192882' }} />
          <NoteListItem note={{ id: '3', title: 'Holy Shit! I did it.', text: 'WTF. Why you whining like a girl?', createdDt: '2082181' }} />
          <NoteListItem note={{ id: '1', title: 'First note', text: 'Tenetur libero voluptatem rerum occaecati qui est molestiae exercitationem. Voluptate quisquam iure assumenda consequatur ex et recusandae. Alias consectetur voluptatibus. Accusamus a ab dicta et. Consequatur quis dignissimos voluptatem nisi.', createdDt: '1882181' }} />
          <NoteListItem note={{ id: '2', title: 'My second note', text: 'This is a test. That is a book.', createdDt: '192882' }} />
          <NoteListItem note={{ id: '3', title: 'Holy Shit! I did it.', text: 'WTF. Why you whining like a girl?', createdDt: '2082181' }} />
        </ul>
      </div>
      <div className="my-6 px-4 sm:px-6 lg:px-8">
        <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50">More</button>
      </div>
    </div>
  );
};

export default React.memo(NoteListItems);
