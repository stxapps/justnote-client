import { Keyboard, Appearance, AppState, Alert } from 'react-native';
import { getCalendars } from 'expo-localization';
import 'event-target-fallback'; // Polyfill Event and EventTarget for queue.
import TaskQueue from 'queue';

import userSession from '../userSession';
import idxApi from '../apis';
import ldbApi from '../apis/localDb';
import {
  INIT, UPDATE_USER, UPDATE_SEARCH_STRING, UPDATE_NOTE_ID, UPDATE_POPUP,
  UPDATE_BULK_EDITING, ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS,
  REFRESH_FETCHED, INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT,
  INCREASE_UPDATE_NOTE_ID_COUNT, INCREASE_BLUR_COUNT,
  INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT, INCREASE_UPDATE_BULK_EDIT_COUNT,
  INCREASE_WEBVIEW_KEY_COUNT, UPDATE_UNSAVED_NOTE, DELETE_UNSAVED_NOTES,
  UPDATE_STACKS_ACCESS, UPDATE_SYSTEM_THEME_MODE, UPDATE_IS_24H_FORMAT,
  INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, BLOCKSTACK_AUTH, SWWU_POPUP, TRASH, NEW_NOTE,
  NEW_NOTE_OBJ, LG_WIDTH, WHT_MODE, BLK_MODE,
} from '../types/const';
import {
  isObject, isString, isNumber, sleep, getUserImageUrl, isTitleEqual, isBodyEqual,
  getNote,
} from '../utils';
import vars from '../vars';

export const syncQueue = new TaskQueue({ concurrency: 1, autostart: true });
export const taskQueue = new TaskQueue({ concurrency: 1, autostart: true });

let _getDispatch, _didInit;
export const init = () => async (dispatch, getState) => {
  if (_didInit) return;
  _didInit = true;

  const hasSession = await userSession.hasSession();
  if (!hasSession) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH,
      callbackUrlScheme: APP_URL_SCHEME,
    };
    await userSession.createSession(config);
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  const isUserDummy = await ldbApi.isUserDummy();
  let username = null, userImage = null, userHubUrl = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
    userHubUrl = userData.hubUrl;
  }

  const darkMatches = Appearance.getColorScheme() === 'dark';
  const is24HFormat = await is24HourFormat();
  const localSettings = await idxApi.getLocalSettings();
  if (!localSettings.doSyncMode || !localSettings.doSyncModeInput) {
    [localSettings.doSyncMode, localSettings.doSyncModeInput] = [true, true];
    await idxApi.putLocalSettings(localSettings);
  }
  vars.syncMode.doSyncMode = localSettings.doSyncMode;

  // Need to fetch all here as some note ids might change.
  const unsavedNotes = await idxApi.getUnsavedNotes();

  const lockSettings = await idxApi.getLockSettings();

  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      isUserDummy,
      username,
      userImage,
      userHubUrl,
      href: null,
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
      localSettings,
      unsavedNotes,
      lockSettings,
    },
  });

  const kbMtx = Keyboard.metrics();
  if (isObject(kbMtx) && isNumber(kbMtx.height)) vars.keyboard.height = kbMtx.height;
  Keyboard.addListener('keyboardDidShow', (e) => {
    vars.keyboard.height = e.endCoordinates.height;
    dispatch(increaseUpdateStatusBarStyleCount());
  });
  Keyboard.addListener('keyboardDidHide', () => {
    vars.keyboard.height = 0;
    dispatch(increaseUpdateStatusBarStyleCount());
  });

  Appearance.addChangeListener((e) => {
    const systemThemeMode = e.colorScheme === 'dark' ? BLK_MODE : WHT_MODE;
    dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });

  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') dispatch(increaseUpdateStatusBarStyleCount());
  });

  _getDispatch = () => dispatch;
};

export const signOut = () => async (dispatch, getState) => {
  await userSession.signUserOut();
  await resetState(dispatch);
};

export const updateUserData = (data) => async (dispatch, getState) => {
  try {
    await userSession.updateUserData(data);
  } catch (error) {
    Alert.alert('Update user data failed!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    return;
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) dispatch(updateUserSignedIn());
};

export const updateUserSignedIn = () => async (dispatch, getState) => {
  const isUserDummy = getState().user.isUserDummy;
  if (!isUserDummy) await resetState(dispatch);

  const userData = await userSession.loadUserData();
  dispatch({
    type: UPDATE_USER,
    payload: {
      isUserSignedIn: true,
      username: userData.username,
      image: getUserImageUrl(userData),
      hubUrl: userData.hubUrl,
    },
  });
};

export const updateUserDummy = (isUserDummy) => async (dispatch, getState) => {
  await resetState(dispatch);

  await ldbApi.updateUserDummy(isUserDummy);
  dispatch({
    type: UPDATE_USER,
    payload: { isUserDummy: isUserDummy },
  });
};

const resetState = async (dispatch) => {
  // clear file storage
  await idxApi.deleteAllLocalFiles();

  // clear cached fpaths
  //vars.cachedFPaths.fpaths = null; // Done in localDb
  vars.cachedServerFPaths.fpaths = null;

  // clear vars
  vars.runAfterFetchTask.didRun = false;
  vars.randomHouseworkTasks.dt = 0;

  // clear all user data!
  dispatch({ type: RESET_STATE });
};

export const updateNoteIdUrlHash = (
  id, doGetIdFromState = false, doCheckEditing = false
) => {
  _getDispatch()(updateNoteId(id));
};

export const updatePopupUrlHash = (
  id, isShown, anchorPosition = null, doReplace = false
) => {
  _getDispatch()(updatePopup(id, isShown, anchorPosition));
};

export const updateBulkEditUrlHash = (
  isBulkEditing, selectedNoteId = null, doGetIdFromState = false, doCheckEditing = false
) => {
  _getDispatch()(updateBulkEdit(isBulkEditing));
};

export const updateSearchString = (searchString) => {
  return { type: UPDATE_SEARCH_STRING, payload: searchString };
};

const _updateNoteId = (id) => {
  return { type: UPDATE_NOTE_ID, payload: id };
};

export const updateNoteId = (id, doGetIdFromState = false, doCheckEditing = false) => {
  if (!doGetIdFromState && !doCheckEditing) return _updateNoteId(id);

  return async (dispatch, getState) => {
    // id can be both null and non-null so need doGetIdFromState, can't just check if.
    if (doGetIdFromState) id = vars.updateNoteId.updatingNoteId;
    if (doCheckEditing) {
      if (Date.now() - vars.updateNoteId.dt < 400) return;
      vars.updateNoteId.dt = Date.now();

      if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;
      if (vars.deleteOldNotes.ids && vars.deleteOldNotes.ids.includes(id)) return;

      const isEditorUploading = getState().editor.isUploading;
      if (isEditorUploading) return;

      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        vars.updateNoteId.updatingNoteId = id;
        dispatch(increaseUpdateNoteIdCount());
        return;
      }
    }

    dispatch(_updateNoteId(id));
  };
};

export const onUpdateNoteId = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (
    vars.updateNoteId.updatingNoteId === null ||
    vars.updateNoteId.updatingNoteId === noteId
  ) {
    // Can hide keyboard here only if updating noteId is null or the same.
    // If diff, need to hide in Editor to prevent blink.
    if (vars.keyboard.height > 0) {
      dispatch(increaseBlurCount());
      vars.editorReducer.didIncreaseBlurCount = true;
    }
  }
  dispatch(updateNoteId(null, true, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

export const updatePopup = (id, isShown, anchorPosition = null) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

const _updateBulkEdit = (isBulkEditing) => {
  return { type: UPDATE_BULK_EDITING, payload: isBulkEditing };
};

export const updateBulkEdit = (
  isBulkEditing, selectedNoteId = null, doGetIdFromState = false, doCheckEditing = false
) => {
  if (!isBulkEditing && !doCheckEditing) return _updateBulkEdit(isBulkEditing);

  return async (dispatch, getState) => {
    if (doGetIdFromState) selectedNoteId = vars.updateBulkEdit.selectedNoteId;
    if (doCheckEditing) {
      if (vars.updateSettings.doFetch) return;

      const listName = getState().display.listName;
      if (listName === TRASH && vars.deleteOldNotes.ids) return;

      const isEditorUploading = getState().editor.isUploading;
      if (isEditorUploading) return;

      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        vars.updateBulkEdit.selectedNoteId = selectedNoteId;
        dispatch(increaseUpdateBulkEditCount());
        return;
      }
    }

    dispatch(_updateBulkEdit(isBulkEditing));
    if (isBulkEditing && selectedNoteId) {
      dispatch(addSelectedNoteIds([selectedNoteId]));
    }
  };
};

export const onUpdateBulkEdit = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(updateBulkEdit(true, null, true, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

export const addSelectedNoteIds = (ids) => {
  return { type: ADD_SELECTED_NOTE_IDS, payload: ids };
};

export const deleteSelectedNoteIds = (ids) => {
  return { type: DELETE_SELECTED_NOTE_IDS, payload: ids };
};

export const refreshFetched = () => async (dispatch, getState) => {
  const noteId = getState().display.noteId;
  const safeAreaWidth = getState().window.width;

  // Check safeAreaWidth is a number to execute on web only
  //   as safeAreaWidth on mobile is always null.
  if (noteId !== null && isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
    updateNoteIdUrlHash(null);
    // Might not need to await but just in case.
    await sleep(100);
  }

  dispatch({ type: REFRESH_FETCHED });
};

export const increaseWebViewKeyCount = () => {
  return { type: INCREASE_WEBVIEW_KEY_COUNT };
};

export const increaseUpdateNoteIdUrlHashCount = () => {
  return { type: INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT };
};

export const increaseUpdateNoteIdCount = () => {
  return { type: INCREASE_UPDATE_NOTE_ID_COUNT };
};

export const increaseBlurCount = () => {
  return { type: INCREASE_BLUR_COUNT };
};

export const increaseUpdateBulkEditUrlHashCount = () => {
  return { type: INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT };
};

export const increaseUpdateBulkEditCount = () => {
  return { type: INCREASE_UPDATE_BULK_EDIT_COUNT };
};

export const handleUnsavedNote = (id, title, body, media) => async (
  dispatch, getState
) => {
  const {
    editingNoteId, editingNoteTitle, editingNoteBody, editingNoteMedia,
  } = getState().editor;

  const hasContent = isString(title);
  if (!hasContent) {
    if (editingNoteId !== id) return;
    [title, body, media] = [editingNoteTitle, editingNoteBody, editingNoteMedia];
  }

  const note = id === NEW_NOTE ? NEW_NOTE_OBJ : getNote(id, getState().notes);
  if (!isObject(note)) return;

  if (!isTitleEqual(note.title, title) || !isBodyEqual(note.body, body)) {
    dispatch({
      type: UPDATE_UNSAVED_NOTE,
      payload: {
        id, title, body, media,
        savedTitle: note.title, savedBody: note.body, savedMedia: note.media,
        hasContent,
      },
    });
  } else {
    dispatch(deleteUnsavedNotes([id]));
  }
};

export const deleteUnsavedNotes = (ids) => async (dispatch, getState) => {
  ids = ids.filter(id => isString(id) && id.length > 0);
  if (ids.length > 0) dispatch({ type: DELETE_UNSAVED_NOTES, payload: ids });
};

export const putDbUnsavedNote = (
  id, title, body, media, savedTitle, savedBody, savedMedia,
) => async (dispatch, getState) => {
  await idxApi.putUnsavedNote(
    id, title, body, media, savedTitle, savedBody, savedMedia,
  );
};

export const deleteDbUnsavedNotes = (ids) => async (dispatch, getState) => {
  await idxApi.deleteUnsavedNotes(ids);
};

export const deleteAllDbUnsavedNotes = () => async (dispatch, getState) => {
  await idxApi.deleteAllUnsavedNotes();
};

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

export const updateLocalSettings = () => async (dispatch, getState) => {
  const localSettings = getState().localSettings;
  await idxApi.putLocalSettings(localSettings);
};

export const is24HourFormat = async () => {
  const cals = getCalendars();
  if (Array.isArray(cals) && cals.length > 0) {
    return cals[0].uses24hourClock === true;
  }
  return false;
};

export const updateIs24HFormat = (is24HFormat) => {
  return { type: UPDATE_IS_24H_FORMAT, payload: is24HFormat };
};

export const updateLockSettings = () => async (dispatch, getState) => {
  const lockSettings = getState().lockSettings;
  await idxApi.putLockSettings(lockSettings);
};

export const showSWWUPopup = () => async (dispatch, getState) => {
  dispatch(updatePopup(SWWU_POPUP, true));
};

export const increaseUpdateStatusBarStyleCount = () => {
  return { type: INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT };
};
