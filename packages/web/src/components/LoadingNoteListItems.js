import React from 'react';

import { randInt, sample } from '../utils';

import { useTailwind } from '.';

const widths = ['20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%', '80%', '85%', '90%', '95%', '100%'];

const LoadingNoteListItem = () => {
  const tailwind = useTailwind();

  const titleWidth = sample(widths);
  const nTexts = 1 + randInt(3);
  const textIndices = [];
  for (let i = 0; i < nTexts; i++) textIndices.push(i);

  return (
    <li className={tailwind('px-4 py-5 sm:px-6')}>
      <div style={{ width: titleWidth }} className={tailwind('h-5 rounded-md bg-gray-300')} />
      <div className={tailwind('mt-1')}>
        {textIndices.map(i => {
          const textWidth = sample(widths);
          return (
            <div key={i} className={tailwind('flex h-5 items-center')}>
              <div style={{ width: textWidth }} className={tailwind('h-3 rounded bg-gray-200')} />
            </div>
          );
        })}
      </div>
    </li>
  );
};

const LoadingNoteListItems = () => {
  const tailwind = useTailwind();

  return (
    <div className={tailwind('flex-shrink flex-grow overflow-hidden')}>
      <div className={tailwind('mt-5')}>
        <ul className={tailwind('-my-5 animate-pulse divide-y divide-gray-200')}>
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
