import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';

import {
  updatePopup, updateEditorFocused, saveNote, updateDiscardAction,
  updateNoteId, changeListName,
} from '../actions';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, NEW_NOTE, ADDED,
} from '../types/const';
import { isNoteBodyEqual } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';

const ckeditor = require('../ckeditor');

const GET_DATA_SAVE_NOTE = 'GET_DATA_SAVE_NOTE';
const GET_DATA_DISCARD_NOTE = 'GET_DATA_DISCARD_NOTE';
const GET_DATA_UPDATE_NOTE_ID = 'GET_DATA_UPDATE_NOTE_ID';
const GET_DATA_CHANGE_LIST_NAME = 'GET_DATA_CHANGE_LIST_NAME';

const NoteEditorEditor = (props) => {

  const { note } = props;
  const isFocused = useSelector(state => state.display.isEditorFocused);
  const saveNoteCount = useSelector(state => state.editor.saveNoteCount);
  const discardNoteCount = useSelector(state => state.editor.discardNoteCount);
  const confirmDiscardNoteCount = useSelector(
    state => state.editor.confirmDiscardNoteCount
  );
  const updateNoteIdCount = useSelector(state => state.editor.updateNoteIdCount);
  const changeListNameCount = useSelector(state => state.editor.changeListNameCount);
  const [isEditorReady, setEditorReady] = useState(false);
  const webView = useRef(null);
  const hackInput = useRef(null);
  const prevIsFocused = useRef(isFocused);
  const prevSaveNoteCount = useRef(saveNoteCount);
  const prevDiscardNoteCount = useRef(discardNoteCount);
  const prevConfirmDiscardNoteCount = useRef(confirmDiscardNoteCount);
  const prevUpdateNoteIdCount = useRef(updateNoteIdCount);
  const prevChangeListNameCount = useRef(changeListNameCount);
  const getDataAction = useRef(null);
  const dispatch = useDispatch();

  const setData = (title, body) => {
    const escapedTitle = title.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const escapedBody = body.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    webView.current.injectJavaScript('document.querySelector("#titleInput").value = "' + escapedTitle + '"; window.editor.setData("' + escapedBody + '");');
  };

  const setInitData = useCallback(() => {
    setData(note.title, note.body);
    if (note.id === NEW_NOTE) focusTitleInput();
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

  const onSaveNote = useCallback((title, body) => {
    if (title === '' && body === '') {
      dispatch(updateEditorFocused(false));
      setTimeout(() => {
        dispatch(updateEditorFocused(true));
        focusTitleInput();
      }, 1);
      return;
    }

    if (note.title === title && isNoteBodyEqual(note.body, body)) {
      dispatch(updateEditorFocused(false));
      return;
    }

    dispatch(saveNote(title, body, []));
  }, [note.title, note.body, dispatch]);

  const onDiscardNote = useCallback((doCheckEditing, title = null, body = null) => {
    if (doCheckEditing) {
      if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
        dispatch(updateDiscardAction(DISCARD_ACTION_CANCEL_EDIT));
        dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
        return;
      }
    }

    dispatch(updateEditorFocused(false));
    setInitData();
  }, [note.title, note.body, setInitData, dispatch]);

  const onUpdateNoteId = useCallback((title, body) => {
    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
      dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID));
      dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
      return;
    }

    dispatch(updateNoteId(null, true, false));
  }, [note.title, note.body, dispatch]);

  const onChangeListName = useCallback((title, body) => {
    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
      dispatch(updateDiscardAction(DISCARD_ACTION_CHANGE_LIST_NAME));
      dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
      return;
    }

    dispatch(changeListName(null, false));
  }, [note.title, note.body, dispatch]);

  const onGetData = useCallback((value) => {
    const SEP = '_jUSTnOTE-sEpArAtOr_';
    const [title, body] = value.split(SEP);

    const action = getDataAction.current;
    if (action === GET_DATA_SAVE_NOTE) onSaveNote(title, body);
    else if (action === GET_DATA_DISCARD_NOTE) onDiscardNote(true, title, body);
    else if (action === GET_DATA_UPDATE_NOTE_ID) onUpdateNoteId(title, body);
    else if (action === GET_DATA_CHANGE_LIST_NAME) onChangeListName(title, body);
    else throw new Error(`Invalid getDataAction: ${getDataAction.current}`);
  }, [onSaveNote, onDiscardNote, onUpdateNoteId, onChangeListName]);

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
      getDataAction.current = GET_DATA_SAVE_NOTE;
      webView.current.injectJavaScript('window.justnote.getData();');
      prevSaveNoteCount.current = saveNoteCount;
    }
  }, [isEditorReady, saveNoteCount]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (discardNoteCount !== prevDiscardNoteCount.current) {
      getDataAction.current = GET_DATA_DISCARD_NOTE;
      webView.current.injectJavaScript('window.justnote.getData();');
      prevDiscardNoteCount.current = discardNoteCount;
    }
  }, [isEditorReady, discardNoteCount]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (confirmDiscardNoteCount !== prevConfirmDiscardNoteCount.current) {
      onDiscardNote(false);
      prevConfirmDiscardNoteCount.current = confirmDiscardNoteCount;
    }
  }, [isEditorReady, confirmDiscardNoteCount, onDiscardNote]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (updateNoteIdCount !== prevUpdateNoteIdCount.current) {
      getDataAction.current = GET_DATA_UPDATE_NOTE_ID;
      webView.current.injectJavaScript('window.justnote.getData();');
      prevUpdateNoteIdCount.current = updateNoteIdCount;
    }
  }, [isEditorReady, updateNoteIdCount]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (changeListNameCount !== prevChangeListNameCount.current) {
      getDataAction.current = GET_DATA_CHANGE_LIST_NAME;
      webView.current.injectJavaScript('window.justnote.getData();');
      prevChangeListNameCount.current = changeListNameCount;
    }
  }, [isEditorReady, changeListNameCount]);

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
