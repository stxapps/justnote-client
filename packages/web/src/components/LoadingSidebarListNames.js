import React from 'react';

import { sample } from '../utils';

import { useTailwind } from '.';

const textWidths = [32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192];

const LoadingSidebarListName = () => {
  const tailwind = useTailwind();
  const textWidth = sample(textWidths);

  return (
    <div className={tailwind('flex items-center px-2 py-2')}>
      <div className={tailwind('mr-3 h-5 w-5 rounded bg-gray-300 blk:bg-gray-700')} />
      <div style={{ width: textWidth }} className={tailwind('h-4 rounded bg-gray-300 blk:bg-gray-700')} />
    </div>
  );
};

const LoadingSidebarListNames = () => {
  const tailwind = useTailwind();

  return (
    <nav className={tailwind('mt-6 pl-3 pr-1')}>
      <div className={tailwind('animate-pulse space-y-1')}>
        <LoadingSidebarListName />
        <LoadingSidebarListName />
        <LoadingSidebarListName />
      </div>
    </nav>
  );
};

export default React.memo(LoadingSidebarListNames);
