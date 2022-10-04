import React from 'react';
import { View } from 'react-native';

import { sample } from '../utils';

import { useTailwind } from '.';

const textWidths = [32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192];

const LoadingSidebarListName = () => {
  const tailwind = useTailwind();
  const textWidth = sample(textWidths);

  return (
    <View style={tailwind('mb-1 flex-row items-center px-2 py-2')}>
      <View style={tailwind('mr-3 h-5 w-5 rounded bg-gray-300 blk:bg-gray-700')} />
      <View style={[tailwind('h-4 rounded bg-gray-300 blk:bg-gray-700'), { width: textWidth }]} />
    </View>
  );
};

const LoadingSidebarListNames = () => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind('mt-6 pl-3 pr-1')}>
      <LoadingSidebarListName />
      <LoadingSidebarListName />
      <LoadingSidebarListName />
    </View>
  );
};

export default React.memo(LoadingSidebarListNames);
