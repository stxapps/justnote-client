import React from 'react';
import { View, Text } from 'react-native';

import { tailwind } from '../stylesheets/tailwind';

const NoteListItemContent = () => {
  return (
    <View style={tailwind('flex-1 bg-yellow-400')}>
      <Text style={tailwind('text-gray-600 text-sm font-normal')}>NoteListItemContent</Text>
    </View>
  );
};

export default React.memo(NoteListItemContent);
