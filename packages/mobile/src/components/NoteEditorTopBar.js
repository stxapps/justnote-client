import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import {
  updateNoteId, increaseSaveNoteCount, increaseDiscardNoteCount,
} from '../actions';
import { NEW_NOTE, ADDED, LG_WIDTH } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import NoteCommands from './NoteCommands';

const NoteEditorTopBar = (props) => {

  const { note, isFullScreen, onToggleFullScreen, width } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isEditorFocused = useSelector(state => state.display.isEditorFocused);
  const isConfirmDiscardPopupShown = useSelector(
    state => state.display.isConfirmDiscardPopupShown
  );
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onRightPanelCloseBtnClick = () => {
    if (didClick.current) return;
    if (note.id !== NEW_NOTE && isEditorFocused) dispatch(increaseDiscardNoteCount());
    else dispatch(updateNoteId(null, false, true));
    didClick.current = true;
  };

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    if (note.id !== NEW_NOTE && isEditorFocused) dispatch(increaseDiscardNoteCount());
    else dispatch(updateNoteId(null, false, true));

    if (note.id === NEW_NOTE && isFullScreen) onToggleFullScreen();
    didClick.current = true;
  };

  const onSaveBtnClick = () => {
    if (didClick.current) return;
    dispatch(increaseSaveNoteCount());
    didClick.current = true;
  };

  const renderFocusedCommands = () => {
    return (
      <React.Fragment>
        <TouchableOpacity onPress={onCancelBtnClick} style={tailwind('hidden border border-white bg-white px-2 py-2 rounded-md lg:flex', safeAreaWidth)}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSaveBtnClick} style={tailwind('flex-row items-center h-full pl-1 pr-1 border border-white bg-white lg:px-2 lg:py-2 lg:border-gray-300 lg:rounded-md lg:shadow-sm lg:ml-3', safeAreaWidth)}>
          <View style={tailwind('p-2 rounded lg:p-0', safeAreaWidth)}>
            <Svg width={20} height={20} style={tailwind('text-green-600 font-normal')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M16.7069 5.29303C16.8944 5.48056 16.9997 5.73487 16.9997 6.00003C16.9997 6.26519 16.8944 6.5195 16.7069 6.70703L8.70692 14.707C8.51939 14.8945 8.26508 14.9998 7.99992 14.9998C7.73475 14.9998 7.48045 14.8945 7.29292 14.707L3.29292 10.707C3.11076 10.5184 3.00997 10.2658 3.01224 10.0036C3.01452 9.74143 3.11969 9.49062 3.3051 9.30521C3.49051 9.1198 3.74132 9.01464 4.00352 9.01236C4.26571 9.01008 4.51832 9.11087 4.70692 9.29303L7.99992 12.586L15.2929 5.29303C15.4804 5.10556 15.7348 5.00024 15.9999 5.00024C16.2651 5.00024 16.5194 5.10556 16.7069 5.29303Z" />
            </Svg>
          </View>
          <Text style={tailwind('hidden text-sm text-gray-500 font-normal ml-1 lg:flex', safeAreaWidth)}>Save</Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  const renderLoading = () => {
    return (
      <View style={tailwind('justify-center px-4 h-full lg:px-1', safeAreaWidth)}>
        <Circle size={20} color="rgb(107, 114, 128)" />
      </View>
    );
  };

  useEffect(() => {
    didClick.current = false;
  }, [note, isEditorFocused, isConfirmDiscardPopupShown]);

  const style = {
    width: safeAreaWidth < LG_WIDTH ? Math.max(180, width) : Math.max(496, width),
  };

  let commands;
  if (note.id === NEW_NOTE) commands = isEditorFocused ? renderFocusedCommands() : null;
  else if (note.status !== ADDED) commands = renderLoading();
  else commands = isEditorFocused ? renderFocusedCommands() : <NoteCommands />;

  return (
    <View style={tailwind('flex-grow-0 flex-shrink-0 border-b border-gray-200 w-full h-16')}>
      <ScrollView horizontal={true}>
        <View style={[tailwind('h-full flex-row justify-between lg:px-3 lg:items-center', safeAreaWidth), style]}>
          <View style={tailwind('flex-row')}>
            <TouchableOpacity onPress={onRightPanelCloseBtnClick} style={tailwind('justify-center px-4 h-full rounded-md bg-white lg:hidden', safeAreaWidth)}>
              {note.id !== NEW_NOTE && isEditorFocused ?
                <Svg width={20} height={20} style={tailwind('text-gray-500 font-normal')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </Svg>
                :
                <Svg width={20} height={20} style={tailwind('text-gray-500 font-normal')} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M7.70703 14.707C7.5195 14.8945 7.26519 14.9998 7.00003 14.9998C6.73487 14.9998 6.48056 14.8945 6.29303 14.707L2.29303 10.707C2.10556 10.5195 2.00024 10.2652 2.00024 10C2.00024 9.73488 2.10556 9.48057 2.29303 9.29304L6.29303 5.29304C6.48163 5.11088 6.73423 5.01009 6.99643 5.01237C7.25863 5.01465 7.50944 5.11981 7.69485 5.30522C7.88026 5.49063 7.98543 5.74144 7.9877 6.00364C7.98998 6.26584 7.88919 6.51844 7.70703 6.70704L5.41403 9.00004H17C17.2652 9.00004 17.5196 9.1054 17.7071 9.29293C17.8947 9.48047 18 9.73482 18 10C18 10.2653 17.8947 10.5196 17.7071 10.7071C17.5196 10.8947 17.2652 11 17 11H5.41403L7.70703 13.293C7.8945 13.4806 7.99982 13.7349 7.99982 14C7.99982 14.2652 7.8945 14.5195 7.70703 14.707Z" />
                </Svg>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleFullScreen} style={tailwind('hidden items-center px-2 py-2 border border-gray-300 shadow-sm rounded-md bg-white lg:flex lg:flex-row', safeAreaWidth)}>
              <Svg width={20} height={20} style={tailwind('text-gray-500 font-normal mr-1')} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" clipRule="evenodd" d="M6.41421 5L8.70711 7.29289C9.09763 7.68342 9.09763 8.31658 8.70711 8.70711C8.31658 9.09763 7.68342 9.09763 7.29289 8.70711L5 6.41421V8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8V4.00017C3 3.74425 3.09763 3.48816 3.29289 3.29289C3.38877 3.19702 3.49927 3.12468 3.61722 3.07588C3.73512 3.02699 3.86441 3 4 3H8C8.55228 3 9 3.44772 9 4C9 4.55228 8.55228 5 8 5H6.41421ZM12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3H15.9998C16.1354 3 16.2649 3.02699 16.3828 3.07588C16.4999 3.12432 16.6096 3.19595 16.705 3.29078L16.7092 3.29502C16.804 3.3904 16.8757 3.50014 16.9241 3.61722C16.9743 3.73854 16.9996 3.86774 17 3.997L17 4V8C17 8.55228 16.5523 9 16 9C15.4477 9 15 8.55228 15 8V6.41421L12.7071 8.70711C12.3166 9.09763 11.6834 9.09763 11.2929 8.70711C10.9024 8.31658 10.9024 7.68342 11.2929 7.29289L13.5858 5H12ZM3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12V13.5858L7.29289 11.2929C7.68342 10.9024 8.31658 10.9024 8.70711 11.2929C9.09763 11.6834 9.09763 12.3166 8.70711 12.7071L6.41421 15H8C8.55228 15 9 15.4477 9 16C9 16.5523 8.55228 17 8 17H4.00069L3.997 17C3.8625 16.9996 3.73425 16.9727 3.61722 16.9241C3.49593 16.8738 3.38669 16.8004 3.29502 16.7092L3.29078 16.705C3.19595 16.6096 3.12432 16.4999 3.07588 16.3828C3.02699 16.2649 3 16.1356 3 16V12Z" />
                <Path d="M12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15H13.5858L11.2929 12.7071C10.9024 12.3166 10.9024 11.6834 11.2929 11.2929C11.6834 10.9024 12.3166 10.9024 12.7071 11.2929L15 13.5858V12C15 11.4477 15.4477 11 16 11C16.5523 11 17 11.4477 17 12V15.9993L17 16.003C16.9996 16.1375 16.9727 16.2657 16.9241 16.3828C16.8738 16.5041 16.8004 16.6133 16.7092 16.705L16.705 16.7092C16.6096 16.804 16.4999 16.8757 16.3828 16.9241C16.2649 16.973 16.1356 17 16 17H12Z" />
              </Svg>
              <Text style={tailwind('text-sm font-normal text-gray-600')}>{isFullScreen ? 'Exit' : 'Expand'}</Text>
            </TouchableOpacity>
          </View>
          <View style={tailwind('flex-row')}>
            {commands}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(NoteEditorTopBar);
