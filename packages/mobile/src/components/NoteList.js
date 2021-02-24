import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { updateNoteId } from '../actions';
import { NEW_NOTE } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import NoteListTopBar from './NoteListTopBar';
import NoteListItems from './NoteListItems';
//import LoadingNoteListItems from './LoadingNoteListItems';

const NoteList = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const dispatch = useDispatch();

  const onAddBtnClick = () => {
    dispatch(updateNoteId(NEW_NOTE));
  };

  const noteListItems = <NoteListItems />;
  //const noteListItems = <LoadingNoteListItems />;

  return (
    <View style={tailwind('w-full min-w-64 h-full')}>
      {/* TopBar */}
      <NoteListTopBar onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Main */}
      {noteListItems}
      {/* Add button */}
      {!isBulkEditing && <TouchableOpacity onPress={onAddBtnClick} style={tailwind('absolute right-4 bottom-4 rounded-full bg-green-600 w-16 h-16 shadow-md items-center justify-center lg:relative lg:hidden', safeAreaWidth)}>
        <Svg width={40} height={40} style={tailwind('text-white font-normal')} viewBox="0 0 40 40" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M20 10C20.5304 10 21.0391 10.2107 21.4142 10.5858C21.7893 10.9609 22 11.4696 22 12V18H28C28.5304 18 29.0391 18.2107 29.4142 18.5858C29.7893 18.9609 30 19.4696 30 20C30 20.5304 29.7893 21.0391 29.4142 21.4142C29.0391 21.7893 28.5304 22 28 22H22V28C22 28.5304 21.7893 29.0391 21.4142 29.4142C21.0391 29.7893 20.5304 30 20 30C19.4696 30 18.9609 29.7893 18.5858 29.4142C18.2107 29.0391 18 28.5304 18 28V22H12C11.4696 22 10.9609 21.7893 10.5858 21.4142C10.2107 21.0391 10 20.5304 10 20C10 19.4696 10.2107 18.9609 10.5858 18.5858C10.9609 18.2107 11.4696 18 12 18H18V12C18 11.4696 18.2107 10.9609 18.5858 10.5858C18.9609 10.2107 19.4696 10 20 10Z" />
        </Svg>
      </TouchableOpacity>}
    </View>
  );
};

export default React.memo(NoteList);
