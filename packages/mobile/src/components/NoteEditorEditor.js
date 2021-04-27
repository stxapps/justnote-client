import React, { useState, useEffect, useRef } from 'react';
import { TextInput, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';

import { updateEditorFocused, updateEditorContent } from '../actions';
import { NEW_NOTE, ADDED } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

const ckeditor = require('../ckeditor');

const NoteEditorEditor = (props) => {

  const { note } = props;
  const isFocused = useSelector(state => state.display.isEditorFocused);
  //const title = useSelector(state => state.display.noteTitle);
  //const body = useSelector(state => state.display.noteBody);
  //const media = useSelector(state => state.display.noteMedia);
  const [isEditorReady, setEditorReady] = useState(false);
  const webView = useRef(null);
  const hackInput = useRef(null);
  const dispatch = useDispatch();

  const onTitleInputChange = (value) => {
    dispatch(updateEditorContent({ title: value }));
  };

  const onBodyInputChange = (value) => {
    dispatch(updateEditorContent({ body: value }));
  };

  const onFocusChange = (isFocused) => {
    dispatch(updateEditorFocused(isFocused));
  };

  const setData = (title, body) => {
    const escapedTitle = title.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const escapedBody = body.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    webView.current.injectJavaScript("document.querySelector('#titleInput').value = '" + escapedTitle + "'; window.editor.setData('" + escapedBody + "');");
  };

  const setEditable = (editable) => {
    const titleDisabled = editable ? 'false' : 'true';
    const isBodyReadOnly = editable ? 'false' : 'true';
    webView.current.injectJavaScript("document.querySelector('#titleInput').disabled = " + titleDisabled + "; window.editor.isReadOnly = " + isBodyReadOnly + ";");
  };

  const focusTitleInput = () => {
    if (Platform.OS === 'android') {
      hackInput.current.focus();
      webView.current.requestFocus();
    }
    webView.current.injectJavaScript("document.querySelector('#titleInput').focus();");
  };

  const blurBodyInput = () => {
    hackInput.current.focus();
    hackInput.current.blur();
  };

  const onMessage = e => {
    const data = e.nativeEvent.data;
    const [change, to, value] = data.split(':');

    if (change === 'data' && to === 'isEditorReady') setEditorReady(value === 'true');
    else if (change === 'data' && to === 'title') onTitleInputChange(value);
    else if (change === 'data' && to === 'body') onBodyInputChange(value);
    else if (change === 'focus' && to === 'webView') onFocusChange(value === 'true');
    else throw new Error(`Invalid data: ${data}`);
  };

  useEffect(() => {
    if (!isEditorReady) return;
    if (note.id === NEW_NOTE) {
      dispatch(updateEditorContent({ title: '', body: '', media: [] }));
      setData('', '');
      focusTitleInput();
    } else {
      dispatch(updateEditorContent(
        { title: note.title, body: note.body, media: note.media }
      ));
      setData(note.title, note.body);
    }
  }, [isEditorReady, note, dispatch]);

  useEffect(() => {
    if (!isEditorReady) return;
    setEditable(note.id === NEW_NOTE || note.status === ADDED);
  }, [isEditorReady, note.id, note.status]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (!isFocused) blurBodyInput();
  }, [isEditorReady, isFocused]);

  return (
    <React.Fragment>
      <WebView ref={webView} style={tailwind('flex-1')} source={{ baseUrl: Platform.OS === 'android' ? '' : undefined, html: ckeditor }} originWhiteList={['*']} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} />
      <TextInput ref={hackInput} style={tailwind('absolute -top-1 -left-1 w-1 h-1')} />
    </React.Fragment>
  );
};

export default React.memo(NoteEditorEditor);
