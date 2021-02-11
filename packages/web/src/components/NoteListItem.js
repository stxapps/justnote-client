import React, { } from 'react';

const NoteListItem = (props) => {

  const { title, text } = props.note;

  return (
    <li className="px-4 py-5 sm:px-6 lg:px-8">
      <button className="group w-full text-left rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600">
        <h3 className="text-sm font-semibold text-gray-800 group-hover:underline">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-3">{text}</p>
      </button>
    </li>
  );
};

export default React.memo(NoteListItem);
