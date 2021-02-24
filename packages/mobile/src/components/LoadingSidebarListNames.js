import React from 'react';
import { View } from 'react-native';

import { sample } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

const textWidths = [32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192];

const LoadingSidebarListName = () => {

  const textWidth = sample(textWidths);

  return (
    <View style={tailwind('px-2 py-2 mb-1 flex-row items-center')}>
      <View style={tailwind('w-5 h-5 bg-gray-300 rounded mr-3')}></View>
      <View style={[tailwind('h-4 bg-gray-300 rounded'), { width: textWidth }]}></View>
    </View>
  );
};

const LoadingSidebarListNames = () => {
  return (
    <View style={tailwind('pl-3 pr-1 mt-6')}>
      <LoadingSidebarListName />
      <LoadingSidebarListName />
      <LoadingSidebarListName />
    </View>
  );
};

export default React.memo(LoadingSidebarListNames);
