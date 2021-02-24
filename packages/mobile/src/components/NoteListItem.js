import React from 'react';
import { View } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { ADDING, MOVING } from '../types/const';
import { isDiedStatus } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import NoteListItemContent from './NoteListItemContent';

const NoteListItem = (props) => {

  const { note } = props;
  const { status } = note;
  const { width: safeAreaWidth } = useSafeAreaFrame();

  const renderRetry = () => {
    return null;
  };

  const renderBusy = () => {
    return null;
  };

  return (
    <View style={tailwind('border-b border-gray-200 px-4 py-5 sm:px-6 lg:px-8', safeAreaWidth)}>
      <NoteListItemContent note={note} />
      {isDiedStatus(status) && renderRetry()}
      {[ADDING, MOVING].includes(status) && renderBusy()}
    </View>
  );
};

export default React.memo(NoteListItem);
