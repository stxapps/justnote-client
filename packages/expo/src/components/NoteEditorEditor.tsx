import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Dirs } from 'react-native-file-access';

import { useSelector, useDispatch } from '../store';
import fileApi from '../apis/localFile';
import {
  onUpdateNoteId, onUpdateBulkEdit, handleUnsavedNote, increaseWebViewKeyCount,
} from '../actions';
import {
  updateEditorFocused, updateEditorBusy, saveNote, discardNote, onChangeListName,
  onUpdateQueryString, onShowNoteListMenuPopup, onShowNLIMPopup, onShowUNEPopup,
  updateEditorIsUploading, updateEditingNote,
} from '../actions/chunk';

import { NEW_NOTE, ADDED, IMAGES, CD_ROOT, UTF8, VALID } from '../types/const';
import { getThemeMode, getDoMoreEditorFontSizes } from '../selectors';
import {
  replaceObjectUrls, splitOnFirst, escapeDoubleQuotes, getFileExt, containUppercase,
  isStringTitleIn, isString,
} from '../utils';
import cache from '../utils/cache';
import vars from '../vars';

const ckeditor = require('../../ckeditor');

import { useTailwind } from '.';

const GET_DATA_SAVE_NOTE = 'GET_DATA_SAVE_NOTE';
const GET_DATA_DISCARD_NOTE = 'GET_DATA_DISCARD_NOTE';
const GET_DATA_UPDATE_NOTE_ID = 'GET_DATA_UPDATE_NOTE_ID';
const GET_DATA_CHANGE_LIST_NAME = 'GET_DATA_CHANGE_LIST_NAME';
const GET_DATA_UPDATE_QUERY_STRING = 'GET_DATA_UPDATE_QUERY_STRING';
const GET_DATA_UPDATE_BULK_EDIT = 'GET_DATA_UPDATE_BULK_EDIT';
const GET_DATA_SHOW_NOTE_LIST_MENU_POPUP = 'GET_DATA_SHOW_NOTE_LIST_MENU_POPUP';
const GET_DATA_SHOW_NLIM_POPUP = 'GET_DATA_SHOW_NLIM_POPUP';
const GET_DATA_SHOW_UNE_POPUP = 'GET_DATA_SHOW_UNE_POPUP';

const SEP = '_jUSTnOTE-sEpArAtOr_';
const HTML_FNAME = 'ckeditor.html';

const NoteEditorEditor = (props) => {

  const { note, unsavedNote } = props;
  const isFocused = useSelector(state => state.display.isEditorFocused);
  const isEditorBusy = useSelector(state => state.display.isEditorBusy);
  const searchString = useSelector(state => state.display.searchString);
  const doMoreEditorFontSizes = useSelector(state => getDoMoreEditorFontSizes(state));
  const webViewKeyCount = useSelector(state => state.editor.webViewKeyCount);
  const checkToFocusCount = useSelector(state => state.editor.checkToFocusCount);
  const saveNoteCount = useSelector(state => state.editor.saveNoteCount);
  const discardNoteCount = useSelector(state => state.editor.discardNoteCount);
  const updateNoteIdCount = useSelector(state => state.editor.updateNoteIdCount);
  const changeListNameCount = useSelector(state => state.editor.changeListNameCount);
  const updateQueryStringCount = useSelector(
    state => state.editor.updateQueryStringCount
  );
  const focusTitleCount = useSelector(state => state.editor.focusTitleCount);
  const setInitDataCount = useSelector(state => state.editor.setInitDataCount);
  const blurCount = useSelector(state => state.editor.blurCount);
  const updateBulkEditCount = useSelector(state => state.editor.updateBulkEditCount);
  const showNoteListMenuPopupCount = useSelector(
    state => state.editor.showNoteListMenuPopupCount
  );
  const showNLIMPopupCount = useSelector(state => state.editor.showNLIMPopupCount);
  const showUNEPopupCount = useSelector(state => state.editor.showUNEPopupCount);
  const isScrollEnabled = useSelector(state => state.editor.isScrollEnabled);
  const themeMode = useSelector(state => getThemeMode(state));
  const [isHtmlReady, setHtmlReady] = useState(Platform.OS === 'ios' ? false : true);
  const [editorReadyCount, setEditorReadyCount] = useState(0);
  const [terminateCount, setTerminateCount] = useState(0);
  const webView = useRef(null);
  const hackInput = useRef(null);
  const prevSearchString = useRef(searchString);
  const prevWebViewKeyCount = useRef(webViewKeyCount);
  const prevCheckToFocusCount = useRef(0); // First mount always checks.
  const prevSaveNoteCount = useRef(saveNoteCount);
  const prevDiscardNoteCount = useRef(discardNoteCount);
  const prevUpdateNoteIdCount = useRef(updateNoteIdCount);
  const prevChangeListNameCount = useRef(changeListNameCount);
  const prevUpdateQueryStringCount = useRef(updateQueryStringCount);
  const prevFocusTitleCount = useRef(focusTitleCount);
  const prevSetInitDataCount = useRef(setInitDataCount);
  const prevBlurCount = useRef(blurCount);
  const prevUpdateBulkEditCount = useRef(updateBulkEditCount);
  const prevShowNoteListMenuPopupCount = useRef(showNoteListMenuPopupCount);
  const prevShowNLIMPopupCount = useRef(showNLIMPopupCount);
  const prevShowUNEPopupCount = useRef(showUNEPopupCount);
  const prevIsScrollEnabled = useRef(isScrollEnabled);
  const objectUrlContents = useRef({});
  const objectUrlFiles = useRef({});
  const objectUrlNames = useRef({});
  const imagesDir = useRef(null);
  const getDataAction = useRef(null);
  const doResetEditorBusy = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const editingObjectUrlContents = useRef({});
  const editingObjectUrlNames = useRef({});

  const noteIdRef = useRef(note.id);
  const isFocusedRef = useRef(isFocused);

  const setThemeMode = (mode) => {
    if (webView.current) webView.current.injectJavaScript('window.justnote.setThemeMode(' + mode + '); true;');
  };

  const setEditorFontSizes = (doMore) => {
    if (webView.current) webView.current.injectJavaScript('window.justnote.setEditorFontSizes(' + doMore + '); true;');
  };

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

  const blurTitleInput = () => {
    if (vars.keyboard.height > 0) {
      if (hackInput.current) {
        hackInput.current.focus();
        hackInput.current.blur();
      }
      return;
    }

    if (webView.current) {
      webView.current.injectJavaScript('document.querySelector("#titleInput").blur(); true;');
      webView.current.injectJavaScript('window.editor.ui.view.editable.element.blur(); true;');
    }
  };

  const setInitData = useCallback(() => {
    if (!webView.current) return;

    let [title, body, media] = [note.title, note.body, note.media];
    if (unsavedNote.status === VALID) {
      const unnote = unsavedNote.note;
      [title, body, media] = [unnote.title, unnote.body, unnote.media];
    }

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

    if (noteIdRef.current === NEW_NOTE && unsavedNote.status === null) {
      webView.current.injectJavaScript('window.justnote.addRemoveVisiblePoweredByListener(); true;');
    }
  }, [note.title, note.body, note.media, unsavedNote.status, unsavedNote.note]);

  const setEditable = (editable) => {
    // Currently there is a bug!
    //   Set isReadOnly to true then to false and change:isFocused is not fired.
    //const titleDisabled = editable ? 'false' : 'true';
    //const isBodyReadOnly = editable ? 'false' : 'true';
    //webView.current.injectJavaScript('document.querySelector("#titleInput").disabled = ' + titleDisabled + '; window.editor.isReadOnly = ' + isBodyReadOnly + '; true;');
    if (webView.current) webView.current.injectJavaScript('window.justnote.setEditable(' + editable + '); true;');
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
        objectUrlFiles.current[objectUrl] = { fname: cfpart, content: '' };
      } catch (error) {
        console.log(`NoteEditorEditor: onAddObjectUrlFiles with fpart: ${fpart} error: `, error);
        objectUrlFiles.current[objectUrl] = { fname, content };
      }
    } else {
      objectUrlFiles.current[objectUrl] = { fname, content };
    }
    onUpdateIsUploading(false);
  }, [onUpdateIsUploading]);

  const onGetData = useCallback((value) => {
    if (!isString(value)) return;

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
      dispatch(discardNote(true, title, body));
    } else if (action === GET_DATA_UPDATE_NOTE_ID) {
      dispatch(onUpdateNoteId(title, body, media));
    } else if (action === GET_DATA_CHANGE_LIST_NAME) {
      dispatch(onChangeListName(title, body, media));
    } else if (action === GET_DATA_UPDATE_QUERY_STRING) {
      dispatch(onUpdateQueryString(title, body, media));
    } else if (action === GET_DATA_UPDATE_BULK_EDIT) {
      dispatch(onUpdateBulkEdit(title, body, media));
    } else if (action === GET_DATA_SHOW_NOTE_LIST_MENU_POPUP) {
      dispatch(onShowNoteListMenuPopup(title, body, media));
    } else if (action === GET_DATA_SHOW_NLIM_POPUP) {
      dispatch(onShowNLIMPopup(title, body, media));
    } else if (action === GET_DATA_SHOW_UNE_POPUP) {
      dispatch(onShowUNEPopup(title, body, media));
    } else throw new Error(`Invalid getDataAction: ${getDataAction.current}`);
  }, [dispatch]);

  const onGetEditingData = useCallback((value) => {
    if (!isString(value) || !isFocusedRef.current) return;

    const [title, _body] = splitOnFirst(value, SEP);
    const { body, media } = replaceObjectUrls(
      _body,
      editingObjectUrlContents.current,
      objectUrlFiles.current,
      editingObjectUrlNames.current
    );

    dispatch(updateEditingNote(noteIdRef.current, title, body, media));
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
      setEditorReadyCount(c => c + 1);
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
    if (e.url.slice(0, 4) === 'http') {
      Linking.openURL(e.url);
      return false;
    }
    return true;
  }, []);

  const onContentProcessDidTerminate = useCallback(() => {
    dispatch(increaseWebViewKeyCount());
  }, [dispatch]);

  useEffect(() => {
    noteIdRef.current = note.id;
    isFocusedRef.current = isFocused;
  }, [note.id, isFocused]);

  useEffect(() => {
    if (editorReadyCount === 0) return;
    setThemeMode(themeMode);
  }, [editorReadyCount, themeMode]);

  useEffect(() => {
    if (editorReadyCount === 0) return;
    setEditorFontSizes(doMoreEditorFontSizes);
  }, [editorReadyCount, doMoreEditorFontSizes]);

  useEffect(() => {
    if (editorReadyCount === 0) return;
    setInitData();
  }, [editorReadyCount, setInitData]);

  useEffect(() => {
    if (editorReadyCount === 0) return;
    setEditable((note.id === NEW_NOTE || note.status === ADDED) && !isEditorBusy);
  }, [editorReadyCount, note.id, note.status, isEditorBusy]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;

    let visible = 'false';
    if (note.id === NEW_NOTE && unsavedNote.status === null) visible = 'true';
    webView.current.injectJavaScript('window.justnote.setVisiblePoweredBy(' + visible + '); true;');
  }, [editorReadyCount, note.id, unsavedNote.status]);

  useEffect(() => {
    if (webViewKeyCount !== prevWebViewKeyCount.current) {
      setEditorReadyCount(0);
      setTerminateCount(c => c + 1);

      prevWebViewKeyCount.current = webViewKeyCount;
    }
  }, [webViewKeyCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (checkToFocusCount !== prevCheckToFocusCount.current) {
      if (note.id === NEW_NOTE || unsavedNote.status === VALID) focusTitleInput();
      else blurTitleInput();

      webView.current.injectJavaScript('window.justnote.scrollTo(0, 0); true;');
      prevCheckToFocusCount.current = checkToFocusCount;
    }
  }, [editorReadyCount, checkToFocusCount, note.id, unsavedNote.status, focusTitleInput]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (saveNoteCount !== prevSaveNoteCount.current) {
      getDataAction.current = GET_DATA_SAVE_NOTE;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevSaveNoteCount.current = saveNoteCount;
    }
  }, [editorReadyCount, saveNoteCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (discardNoteCount !== prevDiscardNoteCount.current) {
      getDataAction.current = GET_DATA_DISCARD_NOTE;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevDiscardNoteCount.current = discardNoteCount;
    }
  }, [editorReadyCount, discardNoteCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (updateNoteIdCount !== prevUpdateNoteIdCount.current) {
      getDataAction.current = GET_DATA_UPDATE_NOTE_ID;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevUpdateNoteIdCount.current = updateNoteIdCount;
    }
  }, [editorReadyCount, updateNoteIdCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (changeListNameCount !== prevChangeListNameCount.current) {
      getDataAction.current = GET_DATA_CHANGE_LIST_NAME;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevChangeListNameCount.current = changeListNameCount;
    }
  }, [editorReadyCount, changeListNameCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (updateQueryStringCount !== prevUpdateQueryStringCount.current) {
      getDataAction.current = GET_DATA_UPDATE_QUERY_STRING;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevUpdateQueryStringCount.current = updateQueryStringCount;
    }
  }, [editorReadyCount, updateQueryStringCount]);

  useEffect(() => {
    /*
      Why needs focusTitleCount and just can't use isFocused!

      Focus flow:
        1.1 User clicks on titleInput or bodyEditor
        1.2 Or programatically call focusTitleCount
        2. When titleInput or bodyEditor get focused, event listener onFocus is called
        3. onFocus dispatches updateEditorFocused(true)
      Blur flow:
        1.1 User clicks save, cancel, or back buttons
        1.2 An action dispatches updateEditorFocused(false)
        1.3 When isFocused is changed from true to false, blur is called
        2.1 Or programatically call blur i.e. just showing discard confirm
     */
    if (editorReadyCount === 0) return;
    if (focusTitleCount !== prevFocusTitleCount.current) {
      doResetEditorBusy.current = true;
      focusTitleInput();
      prevFocusTitleCount.current = focusTitleCount;
    }
  }, [editorReadyCount, focusTitleCount, focusTitleInput]);

  useEffect(() => {
    if (editorReadyCount === 0) return;
    if (setInitDataCount !== prevSetInitDataCount.current) {
      setInitData();
      prevSetInitDataCount.current = setInitDataCount;
    }
  }, [editorReadyCount, setInitDataCount, setInitData]);

  useEffect(() => {
    if (editorReadyCount === 0) return;
    if (blurCount !== prevBlurCount.current) {
      blurTitleInput();
      prevBlurCount.current = blurCount;
    }
  }, [editorReadyCount, blurCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (updateBulkEditCount !== prevUpdateBulkEditCount.current) {
      getDataAction.current = GET_DATA_UPDATE_BULK_EDIT;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevUpdateBulkEditCount.current = updateBulkEditCount;
    }
  }, [editorReadyCount, updateBulkEditCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (showNoteListMenuPopupCount !== prevShowNoteListMenuPopupCount.current) {
      getDataAction.current = GET_DATA_SHOW_NOTE_LIST_MENU_POPUP;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevShowNoteListMenuPopupCount.current = showNoteListMenuPopupCount;
    }
  }, [editorReadyCount, showNoteListMenuPopupCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (showNLIMPopupCount !== prevShowNLIMPopupCount.current) {
      getDataAction.current = GET_DATA_SHOW_NLIM_POPUP;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevShowNLIMPopupCount.current = showNLIMPopupCount;
    }
  }, [editorReadyCount, showNLIMPopupCount]);

  useEffect(() => {
    if (editorReadyCount === 0 || !webView.current) return;
    if (showUNEPopupCount !== prevShowUNEPopupCount.current) {
      getDataAction.current = GET_DATA_SHOW_UNE_POPUP;
      webView.current.injectJavaScript('window.justnote.getData(); true;');
      prevShowUNEPopupCount.current = showUNEPopupCount;
    }
  }, [editorReadyCount, showUNEPopupCount]);

  useEffect(() => {
    onUpdateIsUploading(false);
  }, [note.id, onUpdateIsUploading]);

  useEffect(() => {
    if (editorReadyCount === 0) {
      prevIsScrollEnabled.current = isScrollEnabled;
      return;
    }

    if (webView.current) webView.current.injectJavaScript('window.justnote.setScrollEnabled(' + isScrollEnabled + '); true;');
    prevIsScrollEnabled.current = isScrollEnabled;
  }, [editorReadyCount, isScrollEnabled]);

  useEffect(() => {
    setTimeout(() => {
      let doHighlightTitle = false;
      if (note.title && searchString && isStringTitleIn(note.title, searchString)) {
        doHighlightTitle = true;
      }

      if (editorReadyCount && webView.current) {
        if (searchString !== prevSearchString.current) {
          if (searchString) {
            const escapedSearchString = escapeDoubleQuotes(searchString);
            const matchCase = containUppercase(searchString);
            webView.current.injectJavaScript('window.justnote.setFind(' + doHighlightTitle + ', "' + escapedSearchString + '", ' + matchCase + '); true;');
          } else {
            webView.current.injectJavaScript('window.justnote.clearFind(); true;');
          }
        } else {
          if (searchString) {
            const escapedSearchString = escapeDoubleQuotes(searchString);
            const matchCase = containUppercase(searchString);
            webView.current.injectJavaScript('window.justnote.setFind(' + doHighlightTitle + ', "' + escapedSearchString + '", ' + matchCase + '); true;');
          }
        }
      }

      prevSearchString.current = searchString;
    }, 100);
  }, [editorReadyCount, searchString, note.id, note.title, isFocused]);

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
      } catch (error) {
        console.log('Can\'t make images dir with error: ', error);
      }
    };

    makeImagesDir();
  }, []);

  useEffect(() => {
    return () => {
      if (isFocusedRef.current) {
        dispatch(handleUnsavedNote(noteIdRef.current, null, null, null));
      }
    };
  }, [dispatch]);

  if (Platform.OS === 'ios' && !isHtmlReady) return null;

  return (
    <React.Fragment>
      {Platform.OS === 'ios' ?
        <WebView key={`NEE_webView_key_ios_${terminateCount}`} ref={webView} style={tailwind('flex-1 bg-white blk:bg-gray-900')} source={cache('NEE_webView_source_ios', { uri: Dirs.DocumentDir + '/' + HTML_FNAME })} originWhitelist={cache('NEE_webView_originWhitelist_ios', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} hideKeyboardAccessoryView={true} textZoom={100} allowFileAccessFromFileURLs={true} allowUniversalAccessFromFileURLs={true} allowingReadAccessToURL={Dirs.DocumentDir} cacheEnabled={false} onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} onContentProcessDidTerminate={onContentProcessDidTerminate} onRenderProcessGone={onContentProcessDidTerminate} scrollEnabled={false} />
        :
        <WebView key={`NEE_webView_key_${terminateCount}`} ref={webView} style={tailwind('flex-1 bg-white blk:bg-gray-900')} source={cache('NEE_webView_source', { baseUrl: '', html: ckeditor })} originWhitelist={cache('NEE_webView_originWhitelist', ['*'])} onMessage={onMessage} keyboardDisplayRequiresUserAction={false} hideKeyboardAccessoryView={true} textZoom={100} androidLayerType="hardware" allowFileAccess={true} cacheEnabled={false} onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} onContentProcessDidTerminate={onContentProcessDidTerminate} onRenderProcessGone={onContentProcessDidTerminate} />
      }
      <TextInput ref={hackInput} style={tailwind('absolute -top-1 -left-1 h-1 w-1')} />
    </React.Fragment>
  );
};

export default React.memo(NoteEditorEditor);
