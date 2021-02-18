import React from 'react';

import { randInt, sample } from '../utils';

const titleWidths = [144, 152, 160, 168, 172, 180];
const textWidths = [232, 240, 248, 256, 264, 272, 280, 288, 296, 304];

const LoadingNoteListItem = () => {

  const titleWidth = sample(titleWidths);
  const nTexts = 1 + randInt(3);
  const textIndices = [];
  for (let i = 0; i < nTexts; i++) textIndices.push(i);

  return (
    <li className="px-4 py-5 sm:px-6 lg:px-8">
      <div style={{ width: titleWidth }} className="h-5 bg-gray-300 rounded-md"></div>
      <div className="mt-1">
        {textIndices.map(i => {
          const textWidth = sample(textWidths);
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
