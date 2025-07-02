import React, { useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { showLockMenuPopup, showUNEPopup } from '../actions/chunk';
import { makeGetDoShowTitle } from '../selectors';
import { getRect, adjustRect } from '../utils';

import { useTailwind } from '.';

const NoteListItemLock = (props) => {

  const { note } = props;
  const getDoShowTitle = useMemo(makeGetDoShowTitle, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const doShowTitle = useSelector(state => getDoShowTitle(state, note));
  const menuBtn = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onContentBtnClick = () => {
    if (isBulkEditing) return;
    dispatch(showUNEPopup(note.id, true));
  };

  const onMenuBtnClick = (e) => {
    if (isBulkEditing) return;

    menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(rect, 12, 4, -20, -8);
      dispatch(showLockMenuPopup(note.id, nRect));
    });
  };

  let title = '';
  if (doShowTitle) {
    if (note.id.startsWith('conflict')) {
      for (const _note of note.notes) {
        if (_note.title) {
          title = _note.title;
          break;
        }
      }
    } else {
      title = note.title;
    }
  }
  const body = 'This note is locked.';

  return (
    <View style={tailwind('w-full flex-row items-center rounded-sm py-4 pl-3 sm:pl-5')}>
      <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} style={tailwind('mr-3 h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white pb-0.5 blk:border-gray-600 blk:bg-gray-900')}>
        <Svg width={24} height={24} style={tailwind('font-normal text-gray-400 blk:text-gray-500')} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M5 9V7C5 5.67392 5.52678 4.40215 6.46447 3.46447C7.40215 2.52678 8.67392 2 10 2C11.3261 2 12.5979 2.52678 13.5355 3.46447C14.4732 4.40215 15 5.67392 15 7V9C15.5304 9 16.0391 9.21071 16.4142 9.58579C16.7893 9.96086 17 10.4696 17 11V16C17 16.5304 16.7893 17.0391 16.4142 17.4142C16.0391 17.7893 15.5304 18 15 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V11C3 10.4696 3.21071 9.96086 3.58579 9.58579C3.96086 9.21071 4.46957 9 5 9ZM13 7V9H7V7C7 6.20435 7.31607 5.44129 7.87868 4.87868C8.44129 4.31607 9.20435 4 10 4C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7Z" />
        </Svg>
      </TouchableOpacity>
      <View style={tailwind('flex-1')}>
        {title && <View style={tailwind('pr-3')}>
          <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} style={tailwind('w-full flex-row items-center justify-between rounded-sm')}>
            <View style={tailwind('flex-1')}>
              <Text style={tailwind('text-left text-base font-semibold text-gray-800 blk:text-gray-100 lg:text-sm')} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
            </View>
          </TouchableOpacity>
        </View>}
        <View style={tailwind('flex-row items-center justify-between')}>
          <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} style={[tailwind('w-full flex-1 items-start justify-center rounded-sm'), { minHeight: 42 }]}>
            <Text style={tailwind('text-left text-sm font-normal text-gray-500 blk:text-gray-400')} numberOfLines={3} ellipsizeMode="tail">{body}</Text>
          </TouchableOpacity>
          <TouchableOpacity ref={menuBtn} activeOpacity={1.0} onPress={onMenuBtnClick} style={tailwind('flex-shrink-0 flex-grow-0 py-3 pl-4 pr-2')}>
            <Svg width={18} height={18} style={tailwind('font-normal text-gray-400 blk:text-gray-500')} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(NoteListItemLock);
