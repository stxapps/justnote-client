import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import {
  updateNoteId, updateBulkEdit, showNLIMPopup, addSelectedNoteIds,
  deleteSelectedNoteIds,
} from '../actions';
import { makeIsNoteIdSelected, makeGetNoteDate } from '../selectors';
import { isBusyStatus, isPinningStatus, stripHtml } from '../utils';

import { useTailwind } from '.';

const NoteListItemContent = (props) => {

  const { note, pinStatus } = props;
  const [doTitlePb, setDoTitlePb] = useState(false);
  const getIsNoteIdSelected = useMemo(makeIsNoteIdSelected, []);
  const getNoteDate = useMemo(makeGetNoteDate, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsNoteIdSelected(state, note.id));
  const noteDate = useSelector(state => getNoteDate(state, note));
  const body = useMemo(() => stripHtml(note.body), [note.body]);
  const isBusy = useMemo(() => {
    return isBusyStatus(note.status) || isPinningStatus(pinStatus);
  }, [note.status, pinStatus]);
  const menuBtn = useRef(null);
  const pBodyRef = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onContentBtnClick = () => {
    if (isBulkEditing) {
      if (!isBusy) {
        if (isSelected) dispatch(deleteSelectedNoteIds([note.id]));
        else dispatch(addSelectedNoteIds([note.id]));
      }
    } else {
      dispatch(updateNoteId(note.id, false, true));
    }
  };

  const onContentBtnLongClick = () => {
    if (!isBulkEditing) {
      dispatch(updateBulkEdit(true, isBusy ? null : note.id, false, true));
    }
  };

  const onMenuBtnClick = () => {
    menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const newX = x + 12;
      const newY = y + 4;
      const newWidth = width - 12 - 8;
      const newHeight = height - 4 - 4;
      const rect = {
        x: newX, y: newY, width: newWidth, height: newHeight,
        top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
      };
      dispatch(showNLIMPopup(note.id, rect, true));
    });
  };

  useEffect(() => {
    // If no setTimeout, height is 0.
    setTimeout(() => {
      if (!pBodyRef.current) return;
      pBodyRef.current.measure((_fx, _fy, width, height, x, y) => {
        let _doTitlePb = false;
        if (note && note.title && body && height > 20) _doTitlePb = true;

        if (doTitlePb !== _doTitlePb) setDoTitlePb(_doTitlePb);
      });
    }, 1);
  }, [doTitlePb, note, body, setDoTitlePb]);

  const circleClassNames = isSelected ? 'bg-green-600 border-green-700' : 'bg-gray-200 border-gray-300';
  const checkClassNames = isSelected ? 'text-white' : 'text-gray-400';

  const titleClassNames = doTitlePb ? 'pb-1.5' : '';

  return (
    <View style={tailwind('w-full flex-row items-center rounded-sm py-4 pl-3 sm:pl-5')}>
      {(isBulkEditing && !isBusy) && <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={tailwind(`mr-3 h-10 w-10 items-center justify-center rounded-full border ${circleClassNames}`)}>
        <Svg style={tailwind(`h-6 w-6 font-normal ${checkClassNames}`)} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
        </Svg>
      </TouchableOpacity>}
      <View style={tailwind('flex-1')}>
        <View style={tailwind('pr-3')}>
          <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={tailwind(`w-full flex-row items-center justify-between rounded-sm ${titleClassNames}`)}>
            <View style={tailwind('flex-1')}>
              <Text style={tailwind('text-left text-base font-semibold text-gray-800 blk:text-gray-100 lg:text-sm')} numberOfLines={1} ellipsizeMode="tail">{note.title}</Text>
            </View>
            <View style={tailwind('ml-3 flex-shrink-0 flex-grow-0')}>
              <Text style={tailwind('text-left text-xs font-normal text-gray-400 blk:text-gray-500')}>{noteDate}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={tailwind(`flex-row items-center justify-between ${isBulkEditing ? 'pr-3' : ''}`)}>
          <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={[tailwind('w-full flex-1 items-start justify-center rounded-sm'), { minHeight: 42 }]}>
            <View ref={pBodyRef} collapsable={false}>
              <Text style={tailwind('text-left text-sm font-normal text-gray-500 blk:text-gray-400')} numberOfLines={3} ellipsizeMode="tail">{body}</Text>
            </View>
          </TouchableOpacity>
          {!isBulkEditing && <TouchableOpacity ref={menuBtn} activeOpacity={1.0} onPress={onMenuBtnClick} style={tailwind('flex-shrink-0 flex-grow-0 py-3 pl-4 pr-2')} disabled={isBusy}>
            <Svg width={18} height={18} style={tailwind('font-normal text-gray-400 blk:text-gray-500')} viewBox="0 0 20 20" fill="currentColor">
              <Path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
            </Svg>
          </TouchableOpacity>}
        </View>
      </View>
    </View>
  );
};

export default React.memo(NoteListItemContent);
