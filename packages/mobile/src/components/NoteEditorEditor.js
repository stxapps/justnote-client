import React from 'react';
import { View } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { tailwind } from '../stylesheets/tailwind';

const NoteEditorEditor = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();

  return (
    <View style={tailwind('')}>
      <View style={tailwind('h-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:px-8', safeAreaWidth)}></View>
    </View>
  );
};

export default React.memo(NoteEditorEditor);
