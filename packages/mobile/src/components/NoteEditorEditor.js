import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';

import { updateEditorFocused, saveNote } from '../actions';
import { NEW_NOTE, ADDED } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';

const ckeditor = require('../ckeditor');

const NoteEditorEditor = (props) => {

  const { note } = props;
  const isFocused = useSelector(state => state.display.isEditorFocused);
  const saveNoteCount = useSelector(state => state.editor.saveNoteCount);
  const resetNoteCount = useSelector(state => state.editor.resetNoteCount);
  const [isEditorReady, setEditorReady] = useState(false);
  const webView = useRef(null);
  const hackInput = useRef(null);
  const prevIsFocused = useRef(isFocused);
  const prevSaveNoteCount = useRef(saveNoteCount);
  const prevResetNoteCount = useRef(resetNoteCount);
  const dispatch = useDispatch();

  const setData = (title, body) => {
    const escapedTitle = title.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const escapedBody = body.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    webView.current.injectJavaScript('document.querySelector("#titleInput").value = "' + escapedTitle + '"; window.editor.setData("' + escapedBody + '");');
  };

  const setInitData = useCallback(() => {
    if (note.id === NEW_NOTE) {
      setData('', '');
      focusTitleInput();
    } else setData(note.title, note.body);
  }, [note.id, note.title, note.body]);

  const setEditable = (editable) => {
    const titleDisabled = editable ? 'false' : 'true';
    const isBodyReadOnly = editable ? 'false' : 'true';
    webView.current.injectJavaScript('document.querySelector("#titleInput").disabled = ' + titleDisabled + '; window.editor.isReadOnly = ' + isBodyReadOnly + ';');
  };

  const focusTitleInput = () => {
    if (Platform.OS === 'android') {
      hackInput.current.focus();
      webView.current.requestFocus();
    }
    webView.current.injectJavaScript('document.querySelector("#titleInput").focus();');
  };

  const blur = () => {
    hackInput.current.focus();
    hackInput.current.blur();
  };

  const onFocus = useCallback(() => {
    dispatch(updateEditorFocused(true));
  }, [dispatch]);

  const onGetData = useCallback((value) => {
    const SEP = '_jUSTnOTE-sEpArAtOr_';
    const [title, body] = value.split(SEP);

    dispatch(saveNote(title, body, []));
  }, [dispatch]);

  const onMessage = useCallback((e) => {
    const data = e.nativeEvent.data;
    const arr = data.split(':');
    const [change, to, value] = [arr[0], arr[1], arr.slice(2).join(':')];

    if (change === 'focus' && to === 'webView') onFocus();
    else if (change === 'data' && to === 'webView') onGetData(value);
    else if (change === 'editor' && to === 'isReady') setEditorReady(value === 'true');
    else throw new Error(`Invalid data: ${data}`);
  }, [onFocus, onGetData]);

  useEffect(() => {
    if (!isEditorReady) return;
    setInitData();
  }, [isEditorReady, setInitData]);

  useEffect(() => {
    if (!isEditorReady) return;
    setEditable(note.id === NEW_NOTE || note.status === ADDED);
  }, [isEditorReady, note.id, note.status]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (saveNoteCount !== prevSaveNoteCount.current) {
      webView.current.injectJavaScript('window.justnote.getData();');
      prevSaveNoteCount.current = saveNoteCount;
    }
  }, [isEditorReady, saveNoteCount]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (resetNoteCount !== prevResetNoteCount.current) {
      setInitData();
      prevResetNoteCount.current = resetNoteCount;
    }
  }, [isEditorReady, resetNoteCount, setInitData]);

  useEffect(() => {
    if (!isEditorReady) {
      prevIsFocused.current = isFocused;
      return;
    }

    if (!isFocused && prevIsFocused.current) blur();
    prevIsFocused.current = isFocused;
  }, [isEditorReady, isFocused]);

  return (
    <React.Fragment>
      <WebView ref={webView} style={tailwind('flex-1')} source={cache('NEE_webView_source', { baseUrl: Platform.OS === 'android' ? '' : undefined, html: ckeditor })} originWhiteList={cache('NEE_webView_originWhiteList', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} textZoom={100} />
      <TextInput ref={hackInput} style={tailwind('absolute -top-1 -left-1 w-1 h-1')} />
    </React.Fragment>
  );
};

export default React.memo(NoteEditorEditor);
