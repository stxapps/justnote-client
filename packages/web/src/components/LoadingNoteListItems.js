import React from 'react';

import { randInt, sample } from '../utils';

const widths = ['20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%', '80%', '85%', '90%', '95%', '100%'];

const LoadingNoteListItem = () => {

  const titleWidth = sample(widths);
  const nTexts = 1 + randInt(3);
  const textIndices = [];
  for (let i = 0; i < nTexts; i++) textIndices.push(i);

  return (
    <li className="px-4 py-5 sm:px-6 lg:px-8">
      <div style={{ width: titleWidth }} className="h-5 bg-gray-300 rounded-md"></div>
      <div className="mt-1">
        {textIndices.map(i => {
          const textWidth = sample(widths);
          return (
            <div key={i} className="h-5 flex items-center">
              <div style={{ width: textWidth }} className="h-3 bg-gray-200 rounded"></div>
            </div>
          );
        })}
      </div>
    </li>
  );
};

const LoadingNoteListItems = () => {
  return (
    <div className="flex-grow flex-shrink overflow-hidden">
      <div className="mt-6">
        <ul className="-my-5 divide-y divide-gray-200 animate-pulse">
          <LoadingNoteListItem />
          <LoadingNoteListItem />
          <LoadingNoteListItem />
          <LoadingNoteListItem />
          <LoadingNoteListItem />
          <LoadingNoteListItem />
          <LoadingNoteListItem />
          <LoadingNoteListItem />
        </ul>
      </div>
    </div>
  );
};

export default React.memo(LoadingNoteListItems);
