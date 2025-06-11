import React from 'react';
import { View } from 'react-native';

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
    <View style={tailwind('border-b border-gray-200 px-4 py-5 blk:border-gray-700 sm:px-6')}>
      <View style={[tailwind('h-5 rounded-md bg-gray-300 blk:bg-gray-700'), { width: titleWidth }]} />
      <View style={tailwind('mt-1')}>
        {textIndices.map(i => {
          const textWidth = sample(widths);
          return (
            <View key={i} style={tailwind('h-5 justify-center')}>
              <View style={[tailwind('h-3 rounded bg-gray-200 blk:bg-gray-800'), { width: textWidth }]} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const LoadingNoteListItems = () => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind('flex-1 overflow-hidden')}>
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
