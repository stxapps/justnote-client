import React from 'react';
import { View } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { randInt, sample } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

const widths = ['20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%', '80%', '85%', '90%', '95%', '100%'];

const LoadingNoteListItem = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const titleWidth = sample(widths);
  const nTexts = 1 + randInt(3);
  const textIndices = [];
  for (let i = 0; i < nTexts; i++) textIndices.push(i);

  return (
    <View style={tailwind('border-b border-gray-200 px-4 py-5 sm:px-6', safeAreaWidth)}>
      <View style={[tailwind('h-5 bg-gray-300 rounded-md'), { width: titleWidth }]} />
      <View style={tailwind('mt-1')}>
        {textIndices.map(i => {
          const textWidth = sample(widths);
          return (
            <View key={i} style={tailwind('h-5 justify-center')}>
              <View style={[tailwind('h-3 bg-gray-200 rounded'), { width: textWidth }]} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const LoadingNoteListItems = () => {
  return (
    <View style={tailwind('flex-grow flex-shrink')}>
      <LoadingNoteListItem />
      <LoadingNoteListItem />
      <LoadingNoteListItem />
      <LoadingNoteListItem />
      <LoadingNoteListItem />
      <LoadingNoteListItem />
      <LoadingNoteListItem />
      <LoadingNoteListItem />
    </View>
  );
};

export default React.memo(LoadingNoteListItems);
