import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { DUMMY_NOTE_OBJ, INVALID } from '../types/const';
import { isDiedStatus } from '../utils';

import { useTailwind } from '.';
import NoteEditorTopBar from './NoteEditorTopBar';
import NoteEditorEditor from './NoteEditorEditor';
import NoteEditorBulkEdit from './NoteEditorBulkEdit';
import { NoteEditorSavedConflict, NoteEditorUnsavedConflict } from './NoteEditorConflict';
import NoteEditorRetry from './NoteEditorRetry';

const NoteEditor = (props) => {

  const { note, unsavedNote, isFullScreen, onToggleFullScreen, width } = props;
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isContentEditor = useRef(false);
  const tailwind = useTailwind();

  const isUnsavedInvalid = unsavedNote.status === INVALID;

  const _render = () => {
    isContentEditor.current = false;

    if (isBulkEditing) return <NoteEditorBulkEdit width={width} />;
    if (!note) {
      return (
        <View style={tailwind('h-full w-full bg-white blk:bg-gray-900')}>
          <View style={[tailwind('items-center'), { paddingTop: 172 }]}>
            <View style={tailwind('h-32 w-32 items-center justify-center rounded-full bg-gray-200 blk:bg-gray-700')}>
              <Svg width={64} height={64} style={tailwind('font-normal text-gray-500 blk:text-gray-400')} viewBox="0 0 60 60" fill="currentColor">
                <Path d="M40.758 10.758C41.3115 10.1849 41.9736 9.72784 42.7056 9.41339C43.4376 9.09894 44.2249 8.93342 45.0216 8.9265C45.8183 8.91957 46.6083 9.07138 47.3457 9.37307C48.0831 9.67475 48.753 10.1203 49.3164 10.6836C49.8797 11.247 50.3252 11.9169 50.6269 12.6543C50.9286 13.3917 51.0804 14.1817 51.0735 14.9784C51.0666 15.7751 50.9011 16.5624 50.5866 17.2944C50.2722 18.0265 49.8151 18.6885 49.242 19.242L46.863 21.621L38.379 13.137L40.758 10.758V10.758ZM34.137 17.379L9 42.516V51H17.484L42.624 25.863L34.134 17.379H34.137Z" />
              </Svg>
            </View>
          </View>
          <View style={tailwind('absolute inset-x-0 bottom-8')}>
            <Text style={tailwind('text-center text-sm font-normal text-gray-500 blk:text-gray-400')}>Click "+ New Note" button or select your note</Text>
          </View>
        </View>
      );
    }
    if (note.id.startsWith('conflict')) {
      return <NoteEditorSavedConflict note={note} width={width} />;
    }
    if (isDiedStatus(note.status)) return <NoteEditorRetry note={note} width={width} />;
    if (isUnsavedInvalid) {
      return <NoteEditorUnsavedConflict note={note} unsavedNote={unsavedNote} width={width} />;
    }

    isContentEditor.current = true;
    return (
      <View style={tailwind('h-full w-full bg-white blk:bg-gray-900')}>
        <View style={tailwind('h-full w-full bg-white blk:bg-gray-900')}>
          <NoteEditorTopBar note={note} isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} width={width} />
          <NoteEditorEditor key="NoteEditorEditor" note={note} unsavedNote={unsavedNote} />
        </View>
      </View>
    );
  };

  // As on Android, WebView is slow, try to preload WebView with CKEditor here.
  const content = _render();
  if (!isContentEditor.current) {
    return (
      <React.Fragment>
        <View style={tailwind('absolute -top-1 -left-1 h-1 w-1 overflow-hidden')}>
          <View style={tailwind('h-full w-full bg-white blk:bg-gray-900')}>
            <NoteEditorEditor key="NoteEditorEditor" note={DUMMY_NOTE_OBJ} unsavedNote={unsavedNote} />
          </View>
        </View>
        {content}
      </React.Fragment>
    );
  }

  return content;
};

export default React.memo(NoteEditor);
