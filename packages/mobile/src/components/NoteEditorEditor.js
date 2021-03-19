import React, { useEffect, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { updateEditorFocused, updateEditorContent } from '../actions';
import { NEW_NOTE, ADDED } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

const NoteEditorEditor = (props) => {

  const { note } = props;
  const isFocused = useSelector(state => state.display.isEditorFocused);
  const title = useSelector(state => state.display.noteTitle);
  const body = useSelector(state => state.display.noteBody);
  //const media = useSelector(state => state.display.noteMedia);
  const titleInput = useRef(null);
  const dispatch = useDispatch();

  const onTitleInputChange = (e) => {
    if (!isFocused) dispatch(updateEditorFocused(true));
    dispatch(updateEditorContent({ title: e.nativeEvent.text }));
  };

  const onBodyInputChange = (e) => {
    if (!isFocused) dispatch(updateEditorFocused(true));
    dispatch(updateEditorContent({ body: e.nativeEvent.text }));
  };

  useEffect(() => {
    if (note.id === NEW_NOTE) {
      dispatch(updateEditorContent({ title: '', body: '', media: [] }));
    } else {
      dispatch(updateEditorContent(
        { title: note.title, body: note.body, media: note.media }
      ));
    }
  }, [note, dispatch]);

  useEffect(() => {
    if (note.id === NEW_NOTE) setTimeout(() => titleInput.current.focus(), 1);
  }, [note]);

  return (
    <View style={tailwind('px-3 py-3 flex-1')}>
      <TextInput ref={titleInput} onChange={onTitleInputChange} style={tailwind('w-full flex-grow-0 flex-shrink-0 text-sm text-gray-600 font-normal py-2 px-3 border-gray-300 rounded-md')} placeholder="Note Title" placeholderTextColor="rgba(107, 114, 128, 1)" value={title} editable={note.id === NEW_NOTE || note.status === ADDED} />
      <View style={tailwind('h-10 border-b border-gray-200 py-3 flex-grow-0 flex-shrink-0 flex items-center justify-between')}></View>
      <TextInput onChange={onBodyInputChange} style={tailwind('w-full flex-1 text-sm text-gray-600 font-normal bg-white shadow-sm mt-3 py-2 px-3 border-gray-300 rounded-md')} placeholder="Start writing..." placeholderTextColor="rgba(107, 114, 128, 1)" value={body} editable={note.id === NEW_NOTE || note.status === ADDED} />
    </View>
  );
};

export default React.memo(NoteEditorEditor);
