import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, Keyboard, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Dirs, FileSystem } from 'react-native-file-access';

import {
  updatePopup, updateEditorFocused, updateEditorBusy, saveNote, updateDiscardAction,
  updateNoteId, changeListName,
} from '../actions';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, NEW_NOTE, ADDED, LG_WIDTH,
} from '../types/const';
import { isNoteBodyEqual, replaceObjectUrls, splitOnFirst, getFileExt } from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';

const ckeditor = require('../ckeditor');

const GET_DATA_SAVE_NOTE = 'GET_DATA_SAVE_NOTE';
const GET_DATA_DISCARD_NOTE = 'GET_DATA_DISCARD_NOTE';
const GET_DATA_UPDATE_NOTE_ID = 'GET_DATA_UPDATE_NOTE_ID';
const GET_DATA_CHANGE_LIST_NAME = 'GET_DATA_CHANGE_LIST_NAME';

const SEP = '_jUSTnOTE-sEpArAtOr_';

const NoteEditorEditor = (props) => {

  const { note } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isFocused = useSelector(state => state.display.isEditorFocused);
  const isEditorBusy = useSelector(state => state.editor.isEditorBusy);
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
  const objectUrlContents = useRef({});
  const objectUrlFiles = useRef({});
  const objectUrlNames = useRef({});
  const imagesDir = useRef(null);
  const getDataAction = useRef(null);
  const keyboardHeight = useRef(0);
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);
  const dispatch = useDispatch();

  const focusTitleInput = useCallback(() => {
    setTimeout(() => {
      if (Platform.OS === 'ios') {
        webView.current.injectJavaScript('document.querySelector("#titleInput").blur(); true;');
      }
      if (Platform.OS === 'android') {
        hackInput.current.focus();
        webView.current.requestFocus();
      }
      webView.current.injectJavaScript('document.querySelector("#titleInput").focus(); true;');
    }, safeAreaWidth < LG_WIDTH ? 300 : 1);
  }, [safeAreaWidth]);

  const setInitData = useCallback(() => {
    const dir = Dirs.DocumentDir;
    const escapedDir = dir.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    webView.current.injectJavaScript('window.justnote.setDir("' + escapedDir + '"); true;');

    const escapedTitle = note.title.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    webView.current.injectJavaScript('window.justnote.setTitle("' + escapedTitle + '"); true;');

    webView.current.injectJavaScript('window.justnote.clearNoteMedia(); true;');
    for (const { name, content } of note.media) {
      const escapedName = name.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const escapedContent = content.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      webView.current.injectJavaScript('window.justnote.addNoteMedia("' + escapedName + '", "' + escapedContent + '"); true;');
    }

    const escapedBody = note.body.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    webView.current.injectJavaScript('window.justnote.setBody("' + escapedBody + '"); true;');

    if (note.id === NEW_NOTE) focusTitleInput();
  }, [note.id, note.title, note.body, note.media, focusTitleInput]);

  const setEditable = (editable) => {
    const titleDisabled = editable ? 'false' : 'true';
    const isBodyReadOnly = editable ? 'false' : 'true';
    webView.current.injectJavaScript('document.querySelector("#titleInput").disabled = ' + titleDisabled + '; window.editor.isReadOnly = ' + isBodyReadOnly + '; true;');
  };

  const blur = () => {
    hackInput.current.focus();
    hackInput.current.blur();
  };

  const onFocus = useCallback(() => {
    dispatch(updateEditorFocused(true));
  }, [dispatch]);

  const onSaveNote = useCallback((title, body, media) => {
    if (title === '' && body === '') {
      dispatch(updateEditorBusy(false));
      setTimeout(() => {
        dispatch(updateEditorFocused(true));
        focusTitleInput();
      }, 1);
      return;
    }

    if (note.title === title && isNoteBodyEqual(note.body, body)) {
      dispatch(updateEditorBusy(false));
      return;
    }

    dispatch(saveNote(title, body, media));
  }, [note.title, note.body, focusTitleInput, dispatch]);

  const onDiscardNote = useCallback((doCheckEditing, title = null, body = null) => {
    if (doCheckEditing) {
      if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
        if (keyboardHeight.current > 0) blur();
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
      if (keyboardHeight.current > 0) blur();
      dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID));
      dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
      return;
    }

    dispatch(updateNoteId(null, true, false));
  }, [note.title, note.body, dispatch]);

  const onChangeListName = useCallback((title, body) => {
    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
      if (keyboardHeight.current > 0) blur();
      dispatch(updateDiscardAction(DISCARD_ACTION_CHANGE_LIST_NAME));
      dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
      return;
    }

    dispatch(changeListName(null, false));
  }, [note.title, note.body, dispatch]);

  const onGetData = useCallback((value) => {

    const [title, _body] = splitOnFirst(value, SEP);
    const { body, media } = replaceObjectUrls(
      _body,
      objectUrlContents.current,
      objectUrlFiles.current,
      objectUrlNames.current
    );

    const action = getDataAction.current;
    if (action === GET_DATA_SAVE_NOTE) onSaveNote(title, body, media);
    else if (action === GET_DATA_DISCARD_NOTE) onDiscardNote(true, title, body);
    else if (action === GET_DATA_UPDATE_NOTE_ID) onUpdateNoteId(title, body);
    else if (action === GET_DATA_CHANGE_LIST_NAME) onChangeListName(title, body);
    else throw new Error(`Invalid getDataAction: ${getDataAction.current}`);
  }, [onSaveNote, onDiscardNote, onUpdateNoteId, onChangeListName]);

  const onMessage = useCallback(async (e) => {
    const data = e.nativeEvent.data;
    const [change, rest1] = splitOnFirst(data, ':');
    const [to, value] = splitOnFirst(rest1, ':');

    if (change === 'focus' && to === 'webView') onFocus();
    else if (change === 'clear' && to === 'objectUrlContents') {
      objectUrlContents.current = {};
    } else if (change === 'add' && to === 'objectUrlContents') {
      const [objectUrl, rest2] = splitOnFirst(value, SEP);
      const [fname, content] = splitOnFirst(rest2, SEP);
      objectUrlContents.current[objectUrl] = { fname, content };
    } else if (change === 'clear' && to === 'objectUrlFiles') {
      objectUrlFiles.current = {};
    } else if (change === 'add' && to === 'objectUrlFiles') {
      const [objectUrl, rest2] = splitOnFirst(value, SEP);
      const [fname, content] = splitOnFirst(rest2, SEP);

      if (imagesDir.current) {
        let fpart = imagesDir.current + objectUrl.split('/').pop();
        const ext = getFileExt(fname);
        if (ext) fpart += `.${ext}`;

        await FileSystem.writeFile(Dirs.DocumentDir + '/' + fpart, content, 'base64');

        objectUrlFiles.current[objectUrl] = { fname, content: 'file://' + fpart };
      } else {
        objectUrlFiles.current[objectUrl] = { fname, content };
      }
    } else if (change === 'include' && to === 'objectUrlFiles') {
      const [fileUrl, rest2] = splitOnFirst(value, SEP);
      const [fname, content] = splitOnFirst(rest2, SEP);
      objectUrlFiles.current[fileUrl] = { fname, content };
    } else if (change === 'clear' && to === 'objectUrlNames') {
      objectUrlNames.current = {};
    } else if (change === 'add' && to === 'objectUrlNames') {
      const [objectUrl, name] = splitOnFirst(value, SEP);
      objectUrlNames.current[objectUrl] = name;
    } else if (change === 'data' && to === 'webView') onGetData(value);
    else if (change === 'editor' && to === 'isReady') setEditorReady(value === 'true');
    else throw new Error(`Invalid data: ${data}`);
  }, [onFocus, onGetData]);

  useEffect(() => {
    if (!isEditorReady) return;
    setInitData();
  }, [isEditorReady, setInitData]);

  useEffect(() => {
    if (!isEditorReady) return;
    setEditable((note.id === NEW_NOTE || note.status === ADDED) || isEditorBusy);
  }, [isEditorReady, note.id, note.status, isEditorBusy]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (saveNoteCount !== prevSaveNoteCount.current) {
      getDataAction.current = GET_DATA_SAVE_NOTE;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevSaveNoteCount.current = saveNoteCount;
    }
  }, [isEditorReady, saveNoteCount]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (discardNoteCount !== prevDiscardNoteCount.current) {
      getDataAction.current = GET_DATA_DISCARD_NOTE;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
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
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevUpdateNoteIdCount.current = updateNoteIdCount;
    }
  }, [isEditorReady, updateNoteIdCount]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (changeListNameCount !== prevChangeListNameCount.current) {
      getDataAction.current = GET_DATA_CHANGE_LIST_NAME;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
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

  useEffect(() => {
    const makeImagesDir = async () => {
      try {
        const _imagesDir = 'images/';
        const doExist = await FileSystem.exists(Dirs.DocumentDir + '/' + _imagesDir);
        if (!doExist) await FileSystem.mkdir(Dirs.DocumentDir + '/' + _imagesDir);
        imagesDir.current = _imagesDir;
      } catch (e) {
        console.log('Can\'t make images dir with error: ', e);
      };
    };

    makeImagesDir();
  }, []);

  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardHeight.current = e.endCoordinates.height;
    });
    keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeight.current = 0;
    });

    return () => {
      keyboardDidShowListener.current.remove();
      keyboardDidHideListener.current.remove();
    };
  }, []);

  return (
    <React.Fragment>
      <WebView ref={webView} style={tailwind('flex-1')} source={cache('NEE_webView_source', { baseUrl: Platform.OS === 'android' ? '' : undefined, html: ckeditor })} originWhiteList={cache('NEE_webView_originWhiteList', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} textZoom={100} androidLayerType="hardware" allowFileAccess={true} />
      <TextInput ref={hackInput} style={tailwind('absolute -top-1 -left-1 w-1 h-1')} />
    </React.Fragment>
  );
};

export default React.memo(NoteEditorEditor);
