import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateBulkEdit } from '../actions';
import { NOTE_COMMANDS_MODE_NLTBBE } from '../types/const';
import { getSelectedNoteIdsLength } from '../selectors';

import { useTailwind } from '.';
import NoteCommands from './NoteCommands';

const NoteListTopBarBulkEdit = () => {

  const selectedNoteIdsLength = useSelector(getSelectedNoteIdsLength);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onBulkEditCancelBtnClick = () => {
    dispatch(updateBulkEdit(false));
  };

  return (
    <View style={tailwind('h-16 w-full flex-shrink-0 flex-grow-0 border-b border-gray-200 blk:border-gray-700')}>
      <View style={tailwind('h-full w-full flex-row justify-between sm:pl-3 sm:pr-6')}>
        <TouchableOpacity onPress={onBulkEditCancelBtnClick} style={tailwind('h-full justify-center px-4')}>
          <Svg width={24} height={24} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 24 24" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M5.15164 5.15162C5.37667 4.92666 5.68184 4.80028 6.00004 4.80028C6.31823 4.80028 6.6234 4.92666 6.84844 5.15162L12 10.3032L17.1516 5.15162C17.2623 5.03701 17.3947 4.94559 17.5412 4.8827C17.6876 4.81981 17.845 4.78671 18.0044 4.78532C18.1637 4.78394 18.3217 4.8143 18.4692 4.87464C18.6167 4.93497 18.7506 5.02408 18.8633 5.13675C18.976 5.24942 19.0651 5.3834 19.1254 5.53088C19.1858 5.67836 19.2161 5.83637 19.2147 5.99571C19.2134 6.15504 19.1802 6.3125 19.1174 6.45891C19.0545 6.60531 18.963 6.73773 18.8484 6.84842L13.6968 12L18.8484 17.1516C19.067 17.3779 19.188 17.6811 19.1852 17.9957C19.1825 18.3103 19.0563 18.6113 18.8338 18.8338C18.6113 19.0563 18.3104 19.1825 17.9957 19.1852C17.6811 19.188 17.378 19.067 17.1516 18.8484L12 13.6968L6.84844 18.8484C6.62211 19.067 6.31899 19.188 6.00435 19.1852C5.68972 19.1825 5.38874 19.0563 5.16625 18.8338C4.94376 18.6113 4.81756 18.3103 4.81483 17.9957C4.81209 17.6811 4.93305 17.3779 5.15164 17.1516L10.3032 12L5.15164 6.84842C4.92667 6.62339 4.80029 6.31822 4.80029 6.00002C4.80029 5.68183 4.92667 5.37666 5.15164 5.15162Z" />
          </Svg>
        </TouchableOpacity>
        <View style={tailwind('h-full flex-1 flex-row items-center justify-between sm:pl-2')}>
          <View style={tailwind('flex-shrink flex-grow')}>
            <Text style={tailwind('text-lg font-medium leading-6 text-gray-900 blk:text-gray-100')} numberOfLines={1} ellipsizeMode="tail">{selectedNoteIdsLength} Selected</Text>
          </View>
          <View style={tailwind('h-full flex-shrink-0 flex-grow-0 flex-row pl-4')}>
            <NoteCommands mode={NOTE_COMMANDS_MODE_NLTBBE} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default React.memo(NoteListTopBarBulkEdit);
