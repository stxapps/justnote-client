import React from 'react';

import { sample } from '../utils';

const textWidths = [32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192];

const LoadingSidebarListName = () => {

  const textWidth = sample(textWidths);

  return (
    <div className="px-2 py-2 flex items-center">
      <div className="w-5 h-5 bg-gray-300 rounded mr-3" />
      <div style={{ width: textWidth }} className="h-4 bg-gray-300 rounded" />
    </div>
  );
};

const LoadingSidebarListNames = () => {
  return (
    <nav className="pl-3 pr-1 mt-6">
      <div className="space-y-1 animate-pulse">
        <LoadingSidebarListName />
        <LoadingSidebarListName />
        <LoadingSidebarListName />
      </div>
    </nav>
  );
};

export default React.memo(LoadingSidebarListNames);
