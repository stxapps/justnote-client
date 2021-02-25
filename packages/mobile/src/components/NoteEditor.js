import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { tailwind } from '../stylesheets/tailwind';

import NoteEditorTopBar from './NoteEditorTopBar';
import NoteEditorEditor from './NoteEditorEditor';
import NoteEditorBulkEdit from './NoteEditorBulkEdit';

const NoteEditor = (props) => {

  // TODO: On mobile, just noteId is not enough:
  //   - slide in with loading, then update with content
  //   - silde out first before reset to ready state

  const { isFullScreen, onToggleFullScreen, onRightPanelCloseBtnClick, width } = props;
  const noteId = useSelector(state => state.display.noteId);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);

  if (isBulkEditing) return <NoteEditorBulkEdit width={width} />;
  if (!noteId) return (
    <View style={tailwind('w-full h-full bg-white')}>
      <View style={[tailwind('items-center'), { paddingTop: 172 }]}>
        <View style={tailwind('bg-gray-200 w-32 h-32 rounded-full flex items-center justify-center')}>
          <Svg width={64} height={64} style={tailwind('text-gray-500 font-normal')} viewBox="0 0 60 60" fill="currentColor">
            <Path d="M40.758 10.758C41.3115 10.1849 41.9736 9.72784 42.7056 9.41339C43.4376 9.09894 44.2249 8.93342 45.0216 8.9265C45.8183 8.91957 46.6083 9.07138 47.3457 9.37307C48.0831 9.67475 48.753 10.1203 49.3164 10.6836C49.8797 11.247 50.3252 11.9169 50.6269 12.6543C50.9286 13.3917 51.0804 14.1817 51.0735 14.9784C51.0666 15.7751 50.9011 16.5624 50.5866 17.2944C50.2722 18.0265 49.8151 18.6885 49.242 19.242L46.863 21.621L38.379 13.137L40.758 10.758V10.758ZM34.137 17.379L9 42.516V51H17.484L42.624 25.863L34.134 17.379H34.137Z" />
          </Svg>
        </View>
      </View>
      <View style={tailwind('absolute inset-x-0 bottom-8')}>
        <Text style={tailwind('text-sm font-normal text-gray-600 text-center')}>Click "+ New Note" button or select your note</Text>
      </View>
    </View>
  );

  return (
    <View style={tailwind('w-full h-full bg-white')}>
      <NoteEditorTopBar isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} onRightPanelCloseBtnClick={onRightPanelCloseBtnClick} width={width} />
      <NoteEditorEditor />
    </View>
  );
};

export default React.memo(NoteEditor);
