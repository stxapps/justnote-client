import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updatePopup, updateSelectingListName, updateLockAction } from '../actions';
import { LOCK_EDITOR_POPUP, LOCK_ACTION_UNLOCK_LIST } from '../types/const';

import { useTailwind } from '.';

const NoteListLock = () => {

  const listName = useSelector(state => state.display.listName);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onLockBtnClick = () => {
    dispatch(updateSelectingListName(listName));
    dispatch(updateLockAction(LOCK_ACTION_UNLOCK_LIST));
    dispatch(updatePopup(LOCK_EDITOR_POPUP, true));
  };

  return (
    <View style={tailwind('flex-shrink flex-grow')}>
      <ScrollView>
        <View style={tailwind('pb-20 lg:pb-0')}>
          <View style={tailwind('mt-32 mb-24 w-full items-center px-4 sm:px-6')}>
            <TouchableOpacity onPress={onLockBtnClick} style={tailwind('items-center w-full')}>
              <View style={tailwind('h-20 w-20 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
                <Svg width={40} height={40} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
                </Svg>
              </View>
              <Text style={tailwind('mt-6 text-center text-base font-semibold tracking-wide text-gray-800 blk:text-gray-200 lg:text-sm')}>This list is locked</Text>
              <View style={tailwind('mt-4 items-center justify-center')}>
                <View style={tailwind('rounded-md border border-gray-300 bg-white px-2.5 py-1.5 shadow-sm blk:border-gray-400 blk:bg-gray-900')}>
                  <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Unlock</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(NoteListLock);
