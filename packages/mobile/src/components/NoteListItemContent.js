import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateNoteId, updateBulkEdit, addSelectedNoteIds, deleteSelectedNoteIds,
} from '../actions';
import { makeIsNoteIdSelected } from '../selectors';
import { tailwind } from '../stylesheets/tailwind';

const NoteListItemContent = (props) => {

  const { id, title, text } = props.note;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  const getIsNoteIdSelected = useMemo(makeIsNoteIdSelected, []);
  const isNoteIdSelected = useSelector(state => getIsNoteIdSelected(state, id));

  const dispatch = useDispatch();

  const onContentBtnClick = () => {
    if (isBulkEditing) {
      if (isNoteIdSelected) dispatch(deleteSelectedNoteIds([id]));
      else dispatch(addSelectedNoteIds([id]))
    } else {
      dispatch(updateNoteId(id))
    }
  };

  const onContentBtnLongClick = () => {
    dispatch(updateBulkEdit(true));
    dispatch(addSelectedNoteIds([id]));
  };

  return (
    <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={tailwind('w-full rounded-sm flex-row items-center')}>
      {isBulkEditing && <View style={tailwind('w-10 h-10 bg-gray-200 border border-gray-300 mr-3 rounded-full')}></View>}
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('text-sm font-semibold text-gray-800')} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        <Text style={tailwind('text-sm text-gray-600 font-normal mt-1')} numberOfLines={3} ellipsizeMode="tail">{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(NoteListItemContent);
