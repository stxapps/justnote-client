import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import {
  updateNoteId, updateBulkEdit, addSelectedNoteIds, deleteSelectedNoteIds,
} from '../actions';
import { makeIsNoteIdSelected } from '../selectors';
import { isBusyStatus, stripHtml } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

import { useSafeAreaFrame } from '.';

const NoteListItemContent = (props) => {

  const { note } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getIsNoteIdSelected = useMemo(makeIsNoteIdSelected, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsNoteIdSelected(state, note.id));
  const body = useMemo(() => stripHtml(note.body), [note.body]);
  const isBusy = useMemo(() => isBusyStatus(note.status), [note.status]);
  const dispatch = useDispatch();

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
      dispatch(updateBulkEdit(true));
      if (!isBusy) dispatch(addSelectedNoteIds([note.id]));
    }
  };

  const circleClassNames = isSelected ? 'bg-green-600 border-green-700' : 'bg-gray-200 border-gray-300';
  const checkClassNames = isSelected ? 'text-white' : 'text-gray-400';

  return (
    <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={tailwind('w-full rounded-sm flex-row items-center px-3 py-4 sm:px-5', safeAreaWidth)}>
      {(isBulkEditing && !isBusy) && <View style={tailwind(`w-10 h-10 border mr-3 rounded-full justify-center items-center ${circleClassNames}`)}>
        <Svg style={tailwind(`w-6 h-6 ${checkClassNames} font-normal`)} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
        </Svg>
      </View>}
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('text-base font-semibold text-gray-800 lg:text-sm', safeAreaWidth)} numberOfLines={1} ellipsizeMode="tail">{note.title}</Text>
        <Text style={tailwind('text-sm text-gray-500 font-normal mt-1')} numberOfLines={3} ellipsizeMode="tail">{body}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(NoteListItemContent);
