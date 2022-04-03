import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, Keyboard, Platform, Linking } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';
import { Dirs } from 'react-native-file-access';

import fileApi from '../apis/file';
import {
  updateEditorFocused, updateEditorBusy, saveNote, discardNote, onUpdateNoteId,
  onChangeListName, addSavingFPaths, updateEditorIsUploading, updateEditingNote,
  updateEditorUnmount,
} from '../actions';
import { NEW_NOTE, ADDED, IMAGES, CD_ROOT, UTF8 } from '../types/const';
import {
  replaceObjectUrls, splitOnFirst, escapeDoubleQuotes, getFileExt,
} from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';

const ckeditor = require('../../ckeditor');

const GET_DATA_SAVE_NOTE = 'GET_DATA_SAVE_NOTE';
const GET_DATA_DISCARD_NOTE = 'GET_DATA_DISCARD_NOTE';
const GET_DATA_UPDATE_NOTE_ID = 'GET_DATA_UPDATE_NOTE_ID';
const GET_DATA_CHANGE_LIST_NAME = 'GET_DATA_CHANGE_LIST_NAME';

const SEP = '_jUSTnOTE-sEpArAtOr_';
const HTML_FNAME = 'ckeditor.html';

const NoteEditorEditor = (props) => {

  const { note } = props;
  const isFocused = useSelector(state => state.display.isEditorFocused);
  const isEditorBusy = useSelector(state => state.display.isEditorBusy);
  const saveNoteCount = useSelector(state => state.editor.saveNoteCount);
  const discardNoteCount = useSelector(state => state.editor.discardNoteCount);
  const updateNoteIdCount = useSelector(state => state.editor.updateNoteIdCount);
  const changeListNameCount = useSelector(state => state.editor.changeListNameCount);
  const focusTitleCount = useSelector(state => state.editor.focusTitleCount);
  const setInitDataCount = useSelector(state => state.editor.setInitDataCount);
  const blurCount = useSelector(state => state.editor.blurCount);
  const isScrollEnabled = useSelector(state => state.editor.isScrollEnabled);
  const [isHtmlReady, setHtmlReady] = useState(Platform.OS === 'ios' ? false : true);
  const [isEditorReady, setEditorReady] = useState(false);
  const webView = useRef(null);
  const hackInput = useRef(null);
  const prevIsFocused = useRef(isFocused);
  const prevSaveNoteCount = useRef(saveNoteCount);
  const prevDiscardNoteCount = useRef(discardNoteCount);
  const prevUpdateNoteIdCount = useRef(updateNoteIdCount);
  const prevChangeListNameCount = useRef(changeListNameCount);
  const prevFocusTitleCount = useRef(focusTitleCount);
  const prevSetInitDataCount = useRef(setInitDataCount);
  const prevBlurCount = useRef(blurCount);
  const prevIsScrollEnabled = useRef(isScrollEnabled);
  const objectUrlContents = useRef({});
  const objectUrlFiles = useRef({});
  const objectUrlNames = useRef({});
  const imagesDir = useRef(null);
  const getDataAction = useRef(null);
  const doResetEditorBusy = useRef(false);
  const keyboardHeight = useRef(0);
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);
  const dispatch = useDispatch();

  const editingNoteId = useSelector(state => state.editor.editingNoteId);
  const editingNoteTitle = useSelector(state => state.editor.editingNoteTitle);
  const editingNoteBody = useSelector(state => state.editor.editingNoteBody);
  const editingNoteMedia = useSelector(state => state.editor.editingNoteMedia);
  const didEditorUnmount = useSelector(state => state.editor.didEditorUnmount);
  const didDiscardEditing = useSelector(state => state.editor.didDiscardEditing);
  const editingObjectUrlContents = useRef({});
  const editingObjectUrlNames = useRef({});
  const refToIsFocused = useRef(isFocused);
  const refToIsEditorBusy = useRef(isEditorBusy);
  const refToIsEditorReady = useRef(isEditorReady);
  const didUpdateEditingNote = useRef(false);

  const focusTitleInput = useCallback(() => {
    setTimeout(() => {
      if (!hackInput.current || !webView.current) return;
      if (Platform.OS === 'ios') {
        webView.current.injectJavaScript('document.querySelector("#titleInput").blur(); true;');
      }
      if (Platform.OS === 'android') {
        hackInput.current.focus();
        webView.current.requestFocus();
      }
      webView.current.injectJavaScript('document.querySelector("#titleInput").focus(); true;');
    }, 300);
  }, []);

  const _setInitData = useCallback((id, title, body, media) => {
    webView.current.injectJavaScript('window.justnote.scrollTo(0, 0); true;');

    const escapedTitle = escapeDoubleQuotes(title);
    webView.current.injectJavaScript('window.justnote.setTitle("' + escapedTitle + '"); true;');

    const dir = Dirs.DocumentDir;
    const escapedDir = escapeDoubleQuotes(dir);
    webView.current.injectJavaScript('window.justnote.setDir("' + escapedDir + '"); true;');

    for (const objectUrl of Object.keys(objectUrlFiles.current)) {
      if (!objectUrl.startsWith('blob:')) continue;

      const escapedObjectUrl = escapeDoubleQuotes(objectUrl);
      webView.current.injectJavaScript('window.justnote.revokeObjectUrl("' + escapedObjectUrl + '"); true;');
    }
    objectUrlFiles.current = {};

    webView.current.injectJavaScript('window.justnote.clearNoteMedia(); true;');
    for (const { name, content } of media) {
      const escapedName = escapeDoubleQuotes(name);
      const escapedContent = escapeDoubleQuotes(content);
      webView.current.injectJavaScript('window.justnote.addNoteMedia("' + escapedName + '", "' + escapedContent + '"); true;');
    }

    const escapedBody = escapeDoubleQuotes(body);
    webView.current.injectJavaScript('window.justnote.setBody("' + escapedBody + '"); true;');

    if (id === NEW_NOTE) focusTitleInput();
  }, [focusTitleInput]);

  const setInitData = useCallback(() => {
    _setInitData(note.id, note.title, note.body, note.media);
  }, [note.id, note.title, note.body, note.media, _setInitData]);

  const setEditable = (editable) => {
    // Currently there is a bug!
    //   Set isReadOnly to true then to false and change:isFocused is not fired.
    //const titleDisabled = editable ? 'false' : 'true';
    //const isBodyReadOnly = editable ? 'false' : 'true';
    //webView.current.injectJavaScript('document.querySelector("#titleInput").disabled = ' + titleDisabled + '; window.editor.isReadOnly = ' + isBodyReadOnly + '; true;');
    webView.current.injectJavaScript('window.justnote.setEditable(' + editable + '); true;');
  };

  const blur = () => {
    hackInput.current.focus();
    hackInput.current.blur();
  };

  const onFocus = useCallback(() => {
    dispatch(updateEditorFocused(true));
    if (doResetEditorBusy.current) {
      dispatch(updateEditorBusy(false));
      doResetEditorBusy.current = false;
    }
  }, [dispatch]);

  const onUpdateIsUploading = useCallback((isUploading) => {
    dispatch(updateEditorIsUploading(isUploading));
  }, [dispatch]);

  const onAddObjectUrlFiles = useCallback(async (objectUrl, fname, content) => {
    if (imagesDir.current) {
      let fpart = imagesDir.current + '/' + objectUrl.split('/').pop();
      const ext = getFileExt(fname);
      if (ext) fpart += `.${ext}`;

      try {
        await fileApi.putFile(fpart, content);

        const cfpart = CD_ROOT + '/' + fpart;
        dispatch(addSavingFPaths([cfpart]));
        objectUrlFiles.current[objectUrl] = { fname: cfpart, content: '' };
      } catch (e) {
        console.log(`NoteEditorEditor: onAddObjectUrlFiles with fpart: ${fpart} error: `, e);
        objectUrlFiles.current[objectUrl] = { fname, content };
      }
    } else {
      objectUrlFiles.current[objectUrl] = { fname, content };
    }
    onUpdateIsUploading(false);
  }, [onUpdateIsUploading, dispatch]);

  const onGetData = useCallback((value) => {

    const [title, _body] = splitOnFirst(value, SEP);
    const { body, media } = replaceObjectUrls(
      _body,
      objectUrlContents.current,
      objectUrlFiles.current,
      objectUrlNames.current
    );

    const action = getDataAction.current;
    if (action === GET_DATA_SAVE_NOTE) {
      dispatch(saveNote(title, body, media));
    } else if (action === GET_DATA_DISCARD_NOTE) {
      dispatch(discardNote(true, title, body, keyboardHeight.current));
    } else if (action === GET_DATA_UPDATE_NOTE_ID) {
      dispatch(onUpdateNoteId(title, body, keyboardHeight.current));
    } else if (action === GET_DATA_CHANGE_LIST_NAME) {
      dispatch(onChangeListName(title, body, keyboardHeight.current));
    } else throw new Error(`Invalid getDataAction: ${getDataAction.current}`);
  }, [dispatch]);

  const onGetEditingData = useCallback((value) => {

    const [title, _body] = splitOnFirst(value, SEP);
    const { body, media } = replaceObjectUrls(
      _body,
      editingObjectUrlContents.current,
      objectUrlFiles.current,
      editingObjectUrlNames.current
    );

    dispatch(updateEditingNote(title, body, media));
    didUpdateEditingNote.current = true;
  }, [dispatch]);

  const onMessage = useCallback(async (e) => {
    const data = e.nativeEvent.data;
    const [change, rest1] = splitOnFirst(data, ':');
    const [to, value] = splitOnFirst(rest1, ':');

    if (change === 'focus' && to === 'webView') {
      onFocus();
    } else if (change === 'update' && to === 'isUploading') {
      onUpdateIsUploading(value === 'true');
    } else if (change === 'clear' && to === 'objectUrlContents') {
      objectUrlContents.current = {};
    } else if (change === 'add' && to === 'objectUrlContents') {
      const [objectUrl, rest2] = splitOnFirst(value, SEP);
      const [fname, content] = splitOnFirst(rest2, SEP);
      objectUrlContents.current[objectUrl] = { fname, content };
    } else if (change === 'add' && to === 'objectUrlFiles') {
      const [objectUrl, rest2] = splitOnFirst(value, SEP);
      const [fname, content] = splitOnFirst(rest2, SEP);
      onAddObjectUrlFiles(objectUrl, fname, content);
    } else if (change === 'include' && to === 'objectUrlFiles') {
      const [fileUrl, rest2] = splitOnFirst(value, SEP);
      const [fname, content] = splitOnFirst(rest2, SEP);
      objectUrlFiles.current[fileUrl] = { fname, content };
    } else if (change === 'clear' && to === 'objectUrlNames') {
      objectUrlNames.current = {};
    } else if (change === 'add' && to === 'objectUrlNames') {
      const [objectUrl, name] = splitOnFirst(value, SEP);
      objectUrlNames.current[objectUrl] = name;
    } else if (change === 'data' && to === 'webView') {
      onGetData(value);
    } else if (change === 'editor' && to === 'isReady') {
      setEditorReady(value === 'true');
    } else if (change === 'clear' && to === 'editingObjectUrlContents') {
      editingObjectUrlContents.current = {};
    } else if (change === 'add' && to === 'editingObjectUrlContents') {
      const [objectUrl, rest2] = splitOnFirst(value, SEP);
      const [fname, content] = splitOnFirst(rest2, SEP);
      editingObjectUrlContents.current[objectUrl] = { fname, content };
    } else if (change === 'clear' && to === 'editingObjectUrlNames') {
      editingObjectUrlNames.current = {};
    } else if (change === 'add' && to === 'editingObjectUrlNames') {
      const [objectUrl, name] = splitOnFirst(value, SEP);
      editingObjectUrlNames.current[objectUrl] = name;
    } else if (change === 'editingData' && to === 'webView') {
      onGetEditingData(value);
    } else throw new Error(`Invalid data: ${data}`);
  }, [onFocus, onUpdateIsUploading, onAddObjectUrlFiles, onGetData, onGetEditingData]);

  const onShouldStartLoadWithRequest = useCallback((e) => {
    if (e.url.slice(0, 4) === 'http') Linking.openURL(e.url);
    return false;
  }, []);

  const onContentProcessDidTerminate = useCallback(() => {
    setEditorReady(false);
    webView.current.reload();
  }, []);

  useEffect(() => {
    if (!isEditorReady) return;
    setInitData();
  }, [isEditorReady, setInitData]);

  useEffect(() => {
    if (!isEditorReady) return;
    setEditable((note.id === NEW_NOTE || note.status === ADDED) && !isEditorBusy);
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
    /*
      Why needs focusTitleCount and just can't use isFocused!

      Focus flow:
        1.1 User clicks on titleInput or bodyEditor
        1.2 Or programatically call focusTitleInput
        2. When titleInput or bodyEditor get focused, event listener onFocus is called
        3. onFocus dispatches updateEditorFocused(true)
      Blur flow:
        1.1 User clicks save, cancel, or back buttons
        1.2 An action dispatches updateEditorFocused(false)
        1.3 When isFocused is changed from true to false, blur is called
        2.1 Or programatically call blur i.e. just showing discard confirm
     */
    if (!isEditorReady) return;
    if (focusTitleCount !== prevFocusTitleCount.current) {
      doResetEditorBusy.current = true;
      focusTitleInput();
      prevFocusTitleCount.current = focusTitleCount;
    }
  }, [isEditorReady, focusTitleCount, focusTitleInput]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (setInitDataCount !== prevSetInitDataCount.current) {
      setInitData();
      prevSetInitDataCount.current = setInitDataCount;
    }
  }, [isEditorReady, setInitDataCount, setInitData]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (blurCount !== prevBlurCount.current) {
      blur();
      prevBlurCount.current = blurCount;
    }
  }, [isEditorReady, blurCount]);

  useEffect(() => {
    if (!isEditorReady) {
      prevIsFocused.current = isFocused;
      return;
    }

    if (!isFocused && prevIsFocused.current) blur();
    prevIsFocused.current = isFocused;
  }, [isEditorReady, isFocused]);

  useEffect(() => {
    onUpdateIsUploading(false);
  }, [note.id, onUpdateIsUploading]);

  useEffect(() => {
    if (!isEditorReady) {
      prevIsScrollEnabled.current = isScrollEnabled;
      return;
    }

    webView.current.injectJavaScript('window.justnote.setScrollEnabled(' + isScrollEnabled + '); true;');
    prevIsScrollEnabled.current = isScrollEnabled;
  }, [isEditorReady, isScrollEnabled]);

  useEffect(() => {
    const writeHtml = async () => {
      await fileApi.putFile(HTML_FNAME, ckeditor, Dirs.DocumentDir, UTF8);
      setHtmlReady(true);
    };

    const deleteHtml = () => {
      fileApi.deleteFile(HTML_FNAME);
    };

    if (Platform.OS === 'ios') writeHtml();

    return () => {
      if (Platform.OS === 'ios') deleteHtml();
    };
  }, []);

  useEffect(() => {
    const makeImagesDir = async () => {
      try {
        const doExist = await fileApi.exists(IMAGES);
        if (!doExist) await fileApi.mkdir(IMAGES);
        imagesDir.current = IMAGES;
      } catch (e) {
        console.log('Can\'t make images dir with error: ', e);
      }
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

  useEffect(() => {
    refToIsFocused.current = isFocused;
    refToIsEditorBusy.current = isEditorBusy;
    refToIsEditorReady.current = isEditorReady;
  }, [isFocused, isEditorBusy, isEditorReady]);

  useEffect(() => {
    didUpdateEditingNote.current = false;
  }, [note.id]);

  useEffect(() => {
    return () => {
      if (
        refToIsEditorReady.current && !refToIsEditorBusy.current &&
        refToIsFocused.current && didUpdateEditingNote.current
      ) dispatch(updateEditorUnmount(true));
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isEditorReady) return;

    if (didEditorUnmount) {
      if (
        isFocused && !isEditorBusy && !didDiscardEditing && note.id === editingNoteId
      ) {
        _setInitData(
          editingNoteId, editingNoteTitle, editingNoteBody, editingNoteMedia
        );
        didUpdateEditingNote.current = true;
      }
      dispatch(updateEditorUnmount(false));
    }
  }, [
    isFocused, isEditorBusy, isEditorReady, didDiscardEditing, didEditorUnmount,
    note.id, editingNoteId, editingNoteTitle, editingNoteBody, editingNoteMedia,
    _setInitData, dispatch,
  ]);

  if (Platform.OS === 'ios' && !isHtmlReady) return null;

  return (
    <React.Fragment>
      {Platform.OS === 'ios' ?
        <WebView ref={webView} style={tailwind('flex-1')} source={cache('NEE_webView_source_ios', { uri: Dirs.DocumentDir + '/' + HTML_FNAME })} originWhitelist={cache('NEE_webView_originWhitelist_ios', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} textZoom={100} allowFileAccessFromFileURLs={true} allowUniversalAccessFromFileURLs={true} allowingReadAccessToURL={Dirs.DocumentDir} cacheEnabled={false} onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} onContentProcessDidTerminate={onContentProcessDidTerminate} />
        :
        <WebView ref={webView} style={tailwind('flex-1')} source={cache('NEE_webView_source', { baseUrl: '', html: ckeditor })} originWhitelist={cache('NEE_webView_originWhitelist', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} textZoom={100} androidLayerType="hardware" allowFileAccess={true} cacheEnabled={false} onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} onContentProcessDidTerminate={onContentProcessDidTerminate} />
      }
      <TextInput ref={hackInput} style={tailwind('absolute -top-1 -left-1 w-1 h-1')} />
    </React.Fragment>
  );
};

export default React.memo(NoteEditorEditor);
