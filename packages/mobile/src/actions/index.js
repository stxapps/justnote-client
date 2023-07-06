import {
  Linking, AppState, Platform, Appearance, Alert, PermissionsAndroid,
} from 'react-native';
import * as iapApi from 'react-native-iap';
import { LexoRank } from '@wewatch/lexorank';
import { is24HourFormat } from 'react-native-device-time-format';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { FileSystem } from 'react-native-file-access';
import Share from 'react-native-share';

import userSession from '../userSession';
import axios from '../axiosWrapper';
import dataApi from '../apis/data';
import serverApi from '../apis/server';
import ldbApi from '../apis/localDb';
import fileApi from '../apis/localFile';
import {
  INIT, UPDATE_USER,
  UPDATE_HANDLING_SIGN_IN, UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP,
  UPDATE_SEARCH_STRING, UPDATE_BULK_EDITING, UPDATE_EDITOR_FOCUSED, UPDATE_EDITOR_BUSY,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, UPDATE_SELECTING_NOTE_ID,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, FETCH_MORE, FETCH_MORE_COMMIT,
  FETCH_MORE_ROLLBACK, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE,
  REFRESH_FETCHED, ADD_NOTE, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK, UPDATE_NOTE,
  UPDATE_NOTE_COMMIT, UPDATE_NOTE_ROLLBACK, DISCARD_NOTE, MOVE_NOTES, MOVE_NOTES_COMMIT,
  MOVE_NOTES_ROLLBACK, DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK,
  CANCEL_DIED_NOTES, DELETE_OLD_NOTES_IN_TRASH, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_ROLLBACK, MERGE_NOTES, MERGE_NOTES_COMMIT,
  MERGE_NOTES_ROLLBACK, UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES, UPDATE_LIST_NAMES,
  MOVE_LIST_NAME, MOVE_TO_LIST_NAME, DELETE_LIST_NAMES, UPDATE_SELECTING_LIST_NAME,
  UPDATE_DELETING_LIST_NAME, UPDATE_DO_SYNC_MODE, UPDATE_DO_SYNC_MODE_INPUT,
  UPDATE_DO_DELETE_OLD_NOTES_IN_TRASH, UPDATE_SORT_ON, UPDATE_DO_DESCENDING_ORDER,
  UPDATE_NOTE_DATE_SHOWING_MODE, UPDATE_NOTE_DATE_FORMAT,
  UPDATE_DO_SECTION_NOTES_BY_MONTH, UPDATE_DO_MORE_EDITOR_FONT_SIZES, UPDATE_SETTINGS,
  UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS,
  MERGE_SETTINGS, MERGE_SETTINGS_COMMIT, MERGE_SETTINGS_ROLLBACK,
  UPDATE_SETTINGS_VIEW_ID, UPDATE_INFO, UPDATE_INFO_COMMIT, UPDATE_INFO_ROLLBACK,
  UPDATE_MOVE_ACTION, UPDATE_DELETE_ACTION, UPDATE_DISCARD_ACTION,
  UPDATE_LIST_NAMES_MODE, UPDATE_SYNCED, INCREASE_SAVE_NOTE_COUNT,
  CANCEL_CHANGED_SYNC_MODE, SYNC, SYNC_COMMIT, SYNC_ROLLBACK, UPDATE_SYNC_PROGRESS,
  INCREASE_DISCARD_NOTE_COUNT, INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT,
  INCREASE_UPDATE_NOTE_ID_COUNT, INCREASE_CHANGE_LIST_NAME_COUNT,
  INCREASE_FOCUS_TITLE_COUNT, INCREASE_SET_INIT_DATA_COUNT, INCREASE_BLUR_COUNT,
  INCREASE_UPDATE_EDITOR_WIDTH_COUNT, INCREASE_RESET_DID_CLICK_COUNT,
  INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT, INCREASE_UPDATE_BULK_EDIT_COUNT,
  INCREASE_SHOW_NOTE_LIST_MENU_POPUP_COUNT, INCREASE_SHOW_NLIM_POPUP_COUNT,
  UPDATE_EDITOR_IS_UPLOADING, UPDATE_EDITOR_SCROLL_ENABLED, UPDATE_EDITING_NOTE,
  UPDATE_UNSAVED_NOTE, DELETE_UNSAVED_NOTES, CLEAN_UP_STATIC_FILES,
  CLEAN_UP_STATIC_FILES_COMMIT, CLEAN_UP_STATIC_FILES_ROLLBACK, UPDATE_STACKS_ACCESS,
  GET_PRODUCTS, GET_PRODUCTS_COMMIT, GET_PRODUCTS_ROLLBACK, REQUEST_PURCHASE,
  REQUEST_PURCHASE_COMMIT, REQUEST_PURCHASE_ROLLBACK, RESTORE_PURCHASES,
  RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK, REFRESH_PURCHASES,
  REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK, UPDATE_IAP_PUBLIC_KEY,
  UPDATE_IAP_PRODUCT_STATUS, UPDATE_IAP_PURCHASE_STATUS, UPDATE_IAP_RESTORE_STATUS,
  UPDATE_IAP_REFRESH_STATUS, PIN_NOTE, PIN_NOTE_COMMIT, PIN_NOTE_ROLLBACK, UNPIN_NOTE,
  UNPIN_NOTE_COMMIT, UNPIN_NOTE_ROLLBACK, MOVE_PINNED_NOTE, MOVE_PINNED_NOTE_COMMIT,
  MOVE_PINNED_NOTE_ROLLBACK, CANCEL_DIED_PINS, UPDATE_SYSTEM_THEME_MODE,
  UPDATE_DO_USE_LOCAL_THEME, UPDATE_DEFAULT_THEME, UPDATE_LOCAL_THEME,
  UPDATE_UPDATING_THEME_MODE, UPDATE_TIME_PICK, UPDATE_IS_24H_FORMAT,
  UPDATE_PAYWALL_FEATURE, UPDATE_EXPORT_NOTE_AS_PDF_PROGRESS, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH, PAYWALL_POPUP,
  SETTINGS_POPUP, CONFIRM_DISCARD_POPUP, NOTE_LIST_MENU_POPUP,
  NOTE_LIST_ITEM_MENU_POPUP, MOVE_ACTION_NOTE_COMMANDS, MOVE_ACTION_NOTE_ITEM_MENU,
  DELETE_ACTION_NOTE_COMMANDS, DELETE_ACTION_NOTE_ITEM_MENU, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_LIST_NAME, MY_NOTES, TRASH, ID, NEW_NOTE, NEW_NOTE_OBJ,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING, N_NOTES, N_DAYS, CD_ROOT,
  INFO, INDEX, DOT_JSON, SHOW_SYNCED, LG_WIDTH, IAP_VERIFY_URL, IAP_STATUS_URL,
  APPSTORE, PLAYSTORE, COM_JUSTNOTECC, COM_JUSTNOTECC_SUPPORTER, SIGNED_TEST_STRING,
  VALID, INVALID, UNKNOWN, ERROR, ACTIVE, SWAP_LEFT, SWAP_RIGHT, SETTINGS_VIEW_ACCOUNT,
  SETTINGS_VIEW_LISTS, WHT_MODE, BLK_MODE, CUSTOM_MODE, FEATURE_PIN, FEATURE_APPEARANCE,
  FEATURE_DATE_FORMAT, FEATURE_SECTION_NOTES_BY_MONTH, FEATURE_MORE_EDITOR_FONT_SIZES,
  NOTE_DATE_FORMATS, NO_PERMISSION_GRANTED,
} from '../types/const';
import {
  isEqual, isObject, isString, isNumber, sleep, separateUrlAndParam, getUserImageUrl,
  randomString, stripHtml, isTitleEqual, isBodyEqual, clearNoteData, getStaticFPath,
  deriveFPaths, getListNameObj, getAllListNames, getMainId, createDataFName,
  listNoteIds, getNoteFPaths, getStaticFPaths, createSettingsFPath, getSettingsFPaths,
  getLastSettingsFPaths, getInfoFPath, getLatestPurchase, getValidPurchase,
  doEnableExtraFeatures, extractPinFPath, getPinFPaths, getPins, getSortedNotes,
  separatePinnedValues, getRawPins, getFormattedTime, get24HFormattedTime,
  getFormattedTimeStamp, getMineSubType, getNote, getEditingListNameEditors,
  getListNamesFromNoteIds, applySubscriptionOfferDetails,
} from '../utils';
import { _ } from '../utils/obj';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

const jhfp = require('../../jhfp');

let _getDispatch;
export const init = () => async (dispatch, getState) => {

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

  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    await handlePendingSignIn(initialUrl)(dispatch, getState);
  }

  Linking.addEventListener('url', async (e) => {
    await handlePendingSignIn(e.url)(dispatch, getState);
  });

  AppState.addEventListener('change', async (nextAppState) => {
    if (nextAppState === 'active') {
      const isUserSignedIn = await userSession.isUserSignedIn();
      if (isUserSignedIn) {
        const { purchaseStatus } = getState().iap;
        if (purchaseStatus === REQUEST_PURCHASE) return;
      }

      const is24HFormat = await is24HourFormat();
      dispatch(updateIs24HFormat(is24HFormat));

      if (isUserSignedIn) {
        const interval = (Date.now() - vars.sync.lastSyncDT) / 1000 / 60 / 60;
        dispatch(sync(interval > 1, 0));
      }
    }
  });

  const isUserSignedIn = await userSession.isUserSignedIn();
  const isUserDummy = await ldbApi.isUserDummy();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }

  const darkMatches = Appearance.getColorScheme() === 'dark';
  const is24HFormat = await is24HourFormat();
  const localSettings = await dataApi.getLocalSettings();
  if (!localSettings.doSyncMode || !localSettings.doSyncModeInput) {
    [localSettings.doSyncMode, localSettings.doSyncModeInput] = [true, true];
    await dataApi.putLocalSettings(localSettings);
  }
  vars.syncMode.doSyncMode = localSettings.doSyncMode;

  // Need to fetch all here as some note ids might change.
  const unsavedNotes = await dataApi.getUnsavedNotes();

  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      isUserDummy,
      username,
      userImage,
      href: null,
      windowWidth: null,
      windowHeight: null,
      visualWidth: null,
      visualHeight: null,
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
      localSettings,
      unsavedNotes,
    },
  });

  Appearance.addChangeListener((e) => {
    const systemThemeMode = e.colorScheme === 'dark' ? BLK_MODE : WHT_MODE;
    dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });

  _getDispatch = () => dispatch;
};

const handlePendingSignIn = (url) => async (dispatch, getState) => {

  if (!url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH) &&
    !url.startsWith(APP_DOMAIN_NAME + BLOCKSTACK_AUTH)) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true,
  });

  const { param: { authResponse } } = separateUrlAndParam(url, 'authResponse');
  try {
    await userSession.handlePendingSignIn(authResponse);
  } catch (error) {
    console.log('Catched an error thrown by handlePendingSignIn', error);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) dispatch(updateUserSignedIn());

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
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
  await dataApi.deleteAllLocalFiles();

  // clear cached fpaths
  //vars.cachedFPaths.fpaths = null; // Done in localDb
  vars.cachedServerFPaths.fpaths = null;

  // clear vars
  vars.runAfterFetchTask.didRun = false;
  vars.randomHouseworkTasks.dt = 0;

  // clear all user data!
  dispatch({ type: RESET_STATE });
};

export const updateNoteIdUrlHash = (id) => {
  _getDispatch()(updateNoteId(id));
};

export const updatePopupUrlHash = (id, isShown, rect) => {
  _getDispatch()(updatePopup(id, isShown, rect));
};

export const updateBulkEditUrlHash = (isBulkEditing) => {
  _getDispatch()(updateBulkEdit(isBulkEditing));
};

export const changeListName = (listName, doCheckEditing) => async (
  dispatch, getState
) => {

  const _listName = getState().display.listName;

  if (!listName) listName = vars.changeListName.changingListName;
  if (!listName) throw new Error(`Invalid listName: ${listName}`);

  if (doCheckEditing) {
    if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;

    const isEditorUploading = getState().editor.isUploading;
    if (isEditorUploading) return;

    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) {
      vars.changeListName.changingListName = listName;
      dispatch(increaseChangeListNameCount());
      return;
    }
  }

  const syncProgress = getState().display.syncProgress;
  if (syncProgress && syncProgress.status === SHOW_SYNCED) {
    dispatch({ type: UPDATE_SYNCED });
  }

  dispatch({ type: UPDATE_LIST_NAME, payload: listName });

  if (!(syncProgress && syncProgress.status === SHOW_SYNCED)) {
    await updateFetchedMore(null, _listName)(dispatch, getState);
  }
};

export const onChangeListName = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(changeListName(null, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

const _updateNoteId = (id) => {
  return {
    type: UPDATE_NOTE_ID,
    payload: id,
  };
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

export const updatePopup = (id, isShown, anchorPosition) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

export const updateSearchString = (searchString) => {
  return {
    type: UPDATE_SEARCH_STRING,
    payload: searchString,
  };
};

const _updateBulkEdit = (isBulkEditing) => {
  return {
    type: UPDATE_BULK_EDITING,
    payload: isBulkEditing,
  };
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
  return {
    type: ADD_SELECTED_NOTE_IDS,
    payload: ids,
  };
};

export const deleteSelectedNoteIds = (ids) => {
  return {
    type: DELETE_SELECTED_NOTE_IDS,
    payload: ids,
  };
};

export const updateSelectingNoteId = (id) => {
  return {
    type: UPDATE_SELECTING_NOTE_ID,
    payload: id,
  };
};

export const fetch = () => async (dispatch, getState) => {

  const listName = getState().display.listName;
  const didFetchSettings = getState().display.didFetchSettings;
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pendingPins = getState().pendingPins;

  const doFetchStgsAndInfo = !didFetchSettings;

  const payload = {
    listName, sortOn, doDescendingOrder, doFetchStgsAndInfo, pendingPins,
  };
  dispatch({ type: FETCH, payload });

  try {
    const fetched = await dataApi.fetch(payload);
    dispatch({ type: FETCH_COMMIT, payload: { ...payload, ...fetched } });
  } catch (error) {
    console.log('fetch error: ', error);
    dispatch({ type: FETCH_ROLLBACK, payload: { ...payload, error } });
  }
};

export const fetchMore = () => async (dispatch, getState) => {

  const addedDT = Date.now();

  const fetchMoreId = `${addedDT}-${randomString(4)}`;
  const listName = getState().display.listName;
  const ids = Object.keys(getState().notes[listName]);
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pendingPins = getState().pendingPins;

  // If there is already cached fetchedMore with the same list name, just return.
  const fetchedMore = getState().fetchedMore[listName];
  if (fetchedMore) return;

  const payload = {
    fetchMoreId, listName, ids, sortOn, doDescendingOrder, pendingPins,
  };
  dispatch({ type: FETCH_MORE, payload });

  try {
    const fetched = await dataApi.fetchMore(payload);
    dispatch({ type: FETCH_MORE_COMMIT, payload: { ...payload, ...fetched } });
  } catch (error) {
    console.log('fetchMore error: ', error);
    dispatch({ type: FETCH_MORE_ROLLBACK, payload: { ...payload, error } });
  }
};

export const tryUpdateFetchedMore = (payload) => async (dispatch, getState) => {

  const { fetchMoreId, listName, hasDisorder } = payload;

  let isInterrupted = false;
  for (const id in getState().isFetchMoreInterrupted[listName]) {
    if (id === fetchMoreId) {
      isInterrupted = getState().isFetchMoreInterrupted[listName][id];
      break;
    }
  }

  if (isInterrupted) {
    dispatch({ type: CANCEL_FETCHED_MORE, payload });
    return;
  }

  if (listName !== getState().display.listName || !hasDisorder) {
    dispatch(updateFetchedMore(payload));
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const scrollHeight = vars.scrollPanel.contentHeight;
    const windowHeight = vars.scrollPanel.layoutHeight;
    const windowBottom = windowHeight + vars.scrollPanel.pageYOffset;

    const isPopupShown = (
      getState().display.isNoteListItemMenuPopupShown ||
      getState().display.isListNamesPopupShown ||
      getState().display.isPinMenuPopupShown
    );

    if (windowBottom > (scrollHeight * 0.96) && !isPopupShown) {
      dispatch(updateFetchedMore(payload));
      return;
    }
  }

  dispatch({ type: CACHE_FETCHED_MORE, payload });
};

export const updateFetchedMore = (payload, listName = null) => async (
  dispatch, getState
) => {

  if (!payload) {
    if (!listName) listName = getState().display.listName;

    const fetchedMore = getState().fetchedMore[listName];
    if (fetchedMore) ({ payload } = fetchedMore);
  }
  if (!payload) return;

  dispatch({ type: UPDATE_FETCHED_MORE, payload });
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

export const addNote = (title, body, media, listName = null) => async (
  dispatch, getState
) => {

  const addedDT = Date.now();
  if (listName === null) listName = getState().display.listName;
  if (listName === TRASH) listName = MY_NOTES;

  const note = {
    parentIds: null,
    id: `${addedDT}${randomString(4)}`,
    title, body, media, addedDT,
    updatedDT: addedDT,
  };

  const { usedFPaths, localUnusedFPaths } = deriveFPaths(media, null);

  const payload = { listName, note };
  dispatch({ type: ADD_NOTE, payload });

  try {
    await dataApi.putNotes({ listName, notes: [note], staticFPaths: usedFPaths });
  } catch (error) {
    console.log('addNote error: ', error);
    dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: ADD_NOTE_COMMIT, payload });

  try {
    await fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('addNote clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

export const updateNote = (title, body, media, id) => async (dispatch, getState) => {

  const addedDT = Date.now();
  const listName = getState().display.listName;

  const note = getState().notes[listName][id];
  const toNote = {
    ...note,
    parentIds: [note.id],
    id: `${addedDT}${randomString(4)}`,
    title, body, media,
    updatedDT: addedDT,
  };
  const fromNote = clearNoteData(note);

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(media, note.media);

  const payload = { listName, fromNote: note, toNote };
  dispatch({ type: UPDATE_NOTE, payload });

  try {
    await dataApi.putNotes({ listName, notes: [toNote], staticFPaths: usedFPaths });
  } catch (error) {
    console.log('updateNote error: ', error);
    dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: UPDATE_NOTE_COMMIT, payload });

  try {
    await dataApi.putNotes({ listName, notes: [fromNote] });
    await dataApi.deleteServerFiles(serverUnusedFPaths);
    await fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('updateNote clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

export const saveNote = (title, body, media) => async (dispatch, getState) => {

  if (title === '' && body === '') {
    dispatch(increaseFocusTitleCount());
    return;
  }

  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  dispatch(increaseBlurCount());

  if (note && (isTitleEqual(note.title, title) && isBodyEqual(note.body, body))) {
    dispatch(updateEditorBusy(false));
    dispatch(deleteUnsavedNotes([noteId]));
    return;
  }

  if (noteId === NEW_NOTE) dispatch(addNote(title, body, media));
  else dispatch(updateNote(title, body, media, noteId));
};

export const discardNote = (doCheckEditing, title = null, body = null) => async (
  dispatch, getState
) => {

  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  dispatch(increaseBlurCount());

  if (doCheckEditing) {
    if (note && (!isTitleEqual(note.title, title) || !isBodyEqual(note.body, body))) {
      dispatch(updateDiscardAction(DISCARD_ACTION_CANCEL_EDIT));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
      return;
    }
  }

  if (noteId === NEW_NOTE) {
    const safeAreaWidth = getState().window.width;
    if (isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) updateNoteIdUrlHash(null);
    else dispatch(updateNoteId(null));
    // Let transition done before causing rerender.
    setTimeout(() => dispatch(deleteUnsavedNotes([noteId])), 100);
  } else {
    dispatch({ type: DISCARD_NOTE, payload: noteId });
  }
};

const _getFromNotes = (notes, toNotes) => {
  const fromNotes = [];
  for (const toNote of toNotes) {
    const note = notes.find(n => n.id === toNote.parentIds[0]);
    if (!isObject(note)) {
      console.log('In _getFromNotes, found invalid note', notes, toNotes);
      continue;
    }
    fromNotes.push(clearNoteData(note));
  }
  return fromNotes;
};

const _moveNotes = (toListName, ids, fromListName = null) => async (
  dispatch, getState
) => {

  let addedDT = Date.now();
  if (!fromListName) fromListName = getState().display.listName;

  const notes = Object.values(_.select(getState().notes[fromListName], ID, ids));
  const toNotes = notes.map(note => {
    const toNote = {
      ...note,
      parentIds: [note.id],
      id: `${addedDT}${randomString(4)}`,
      updatedDT: addedDT,
    };
    addedDT += 1;
    return toNote;
  });
  let fromNotes = notes.map(note => clearNoteData(note));

  let payload = { fromListName, fromNotes: notes, toListName, toNotes };
  dispatch({ type: MOVE_NOTES, payload });

  try {
    const result = await dataApi.putNotes({
      listName: toListName, notes: toNotes, manuallyManageError: true,
    });
    if (result.errorNotes.length > 0) {
      fromNotes = _getFromNotes(notes, result.successNotes);
      payload = { ...payload, fromNotes, toNotes: result.successNotes };

      const errorFromNotes = _getFromNotes(notes, result.errorNotes);

      const error = result.errorNotes[0].error;
      console.log('moveNotes error: ', error);
      dispatch({
        type: MOVE_NOTES_ROLLBACK,
        payload: {
          ...payload, fromNotes: errorFromNotes, toNotes: result.errorNotes, error,
        },
      });
    }
  } catch (error) {
    console.log('moveNotes error: ', error);
    dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: MOVE_NOTES_COMMIT, payload });

  try {
    await dataApi.putNotes({ listName: fromListName, notes: fromNotes });
  } catch (error) {
    console.log('moveNotes clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

export const moveNotesWithAction = (toListName, moveAction) => async (
  dispatch, getState
) => {

  const {
    noteId, selectingNoteId, isBulkEditing, selectedNoteIds,
  } = getState().display;

  if (
    moveAction === MOVE_ACTION_NOTE_COMMANDS ||
    (
      moveAction === MOVE_ACTION_NOTE_ITEM_MENU &&
      selectingNoteId === noteId
    )
  ) {
    const safeAreaWidth = getState().window.width;
    if (!isBulkEditing && isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
      updateNoteIdUrlHash(null);
    } else dispatch(updateNoteId(null));
  }

  if (moveAction === MOVE_ACTION_NOTE_COMMANDS) {
    if (isBulkEditing) {
      if (selectedNoteIds.length === 0) {
        dispatch(increaseResetDidClickCount());
        return;
      }
      dispatch(_moveNotes(toListName, selectedNoteIds));
      updateBulkEditUrlHash(false);
    } else {
      dispatch(_moveNotes(toListName, [noteId]));
    }
  } else if (moveAction === MOVE_ACTION_NOTE_ITEM_MENU) {
    dispatch(_moveNotes(toListName, [selectingNoteId]));
  } else {
    console.log('In moveNotes, invalid moveAction: ', moveAction);
  }
};

export const moveNotes = (toListName) => async (dispatch, getState) => {
  const { moveAction } = getState().display;
  dispatch(moveNotesWithAction(toListName, moveAction));
};

const _getUnusedFPaths = (notes, toNotes) => {
  const unusedFPaths = [];
  for (const toNote of toNotes) {
    const note = notes.find(n => n.id === toNote.parentIds[0]);
    if (!isObject(note)) {
      console.log('In _getUnusedFPaths, found invalid note', notes, toNotes);
      continue;
    }

    for (const { name } of note.media) {
      if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
    }
  }
  return unusedFPaths;
};

const _deleteNotes = (ids) => async (dispatch, getState) => {
  let addedDT = Date.now();
  const listName = getState().display.listName;

  const notes = Object.values(_.select(getState().notes[listName], ID, ids));
  const toNotes = notes.map(note => {
    const toNote = {
      ...note,
      parentIds: [note.id],
      id: `deleted${addedDT}${randomString(4)}`,
      title: '', body: '', media: [],
      updatedDT: addedDT,
    };
    addedDT += 1;
    return toNote;
  });
  let fromNotes = notes.map(note => clearNoteData(note));

  let unusedFPaths = [];
  for (const note of notes) {
    for (const { name } of note.media) {
      if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
    }
  }

  let payload = { listName, ids };
  dispatch({ type: DELETE_NOTES, payload });

  try {
    const result = await dataApi.putNotes({
      listName, notes: toNotes, manuallyManageError: true,
    });
    if (result.errorNotes.length > 0) {
      fromNotes = _getFromNotes(notes, result.successNotes);
      unusedFPaths = _getUnusedFPaths(notes, result.successNotes);
      payload = { ...payload, ids: fromNotes.map(note => note.id) };

      const errorFromNotes = _getFromNotes(notes, result.errorNotes);

      const error = result.errorNotes[0].error;
      console.log('deleteNotes error: ', error);
      dispatch({
        type: DELETE_NOTES_ROLLBACK,
        payload: { ...payload, ids: errorFromNotes.map(note => note.id), error },
      });
    }
  } catch (error) {
    console.log('deleteNotes error: ', error);
    dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: DELETE_NOTES_COMMIT, payload });

  try {
    await dataApi.putNotes({ listName, notes: fromNotes });
    await dataApi.deleteServerFiles(unusedFPaths);
    await fileApi.deleteFiles(unusedFPaths);
  } catch (error) {
    console.log('deleteNotes clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

export const deleteNotes = () => async (dispatch, getState) => {

  const {
    deleteAction, noteId, selectingNoteId, isBulkEditing, selectedNoteIds,
  } = getState().display;

  if (
    deleteAction === DELETE_ACTION_NOTE_COMMANDS ||
    (
      deleteAction === DELETE_ACTION_NOTE_ITEM_MENU &&
      selectingNoteId === noteId
    )
  ) {
    const safeAreaWidth = getState().window.width;
    if (!isBulkEditing && isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
      updateNoteIdUrlHash(null);
    } else dispatch(updateNoteId(null));
  }

  if (deleteAction === DELETE_ACTION_NOTE_COMMANDS) {
    if (isBulkEditing) {
      if (selectedNoteIds.length === 0) return;
      dispatch(_deleteNotes(selectedNoteIds));
      updateBulkEditUrlHash(false);
    } else {
      dispatch(_deleteNotes([noteId]));
    }
  } else if (deleteAction === DELETE_ACTION_NOTE_ITEM_MENU) {
    dispatch(_deleteNotes([selectingNoteId]));
    updatePopupUrlHash(NOTE_LIST_ITEM_MENU_POPUP, false);
  } else {
    console.log('In deleteNotes, invalid deleteAction: ', deleteAction);
  }
};

export const retryDiedNotes = (ids) => async (dispatch, getState) => {

  let addedDT = Date.now();
  const listName = getState().display.listName;

  for (const id of ids) {
    // DIED_ADDING -> try add this note again
    // DIED_UPDATING -> try update this note again
    // DIED_MOVING -> try move this note again
    // DIED_DELETING  -> try delete this note again
    const note = getState().notes[listName][id];
    const { status } = note;
    if (status === DIED_ADDING) {
      const { usedFPaths } = deriveFPaths(note.media, null);

      const payload = { listName, note };
      dispatch({ type: ADD_NOTE, payload });

      try {
        await dataApi.putNotes({ listName, notes: [note], staticFPaths: usedFPaths });
      } catch (error) {
        console.log('retryDiedNotes add error: ', error);
        dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: ADD_NOTE_COMMIT, payload });
      await sync()(dispatch, getState);
    } else if (status === DIED_UPDATING) {
      const toNote = note;
      const fromNote = clearNoteData(note.fromNote);

      const {
        usedFPaths, serverUnusedFPaths, localUnusedFPaths,
      } = deriveFPaths(toNote.media, note.fromNote.media);

      const payload = { listName, fromNote: note.fromNote, toNote };
      dispatch({ type: UPDATE_NOTE, payload });

      try {
        await dataApi.putNotes({ listName, notes: [toNote], staticFPaths: usedFPaths });
      } catch (error) {
        console.log('retryDiedNotes update error: ', error);
        dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: UPDATE_NOTE_COMMIT, payload });

      try {
        await dataApi.putNotes({ listName, notes: [fromNote] });
        await dataApi.deleteServerFiles(serverUnusedFPaths);
        await fileApi.deleteFiles(localUnusedFPaths);
      } catch (error) {
        console.log('retryDiedNotes update clean up error: ', error);
        // error in this step should be fine
      }

      await sync()(dispatch, getState);
    } else if (status === DIED_MOVING) {
      const [toListName, toNote, fromListName] = [listName, note, note.fromListName];
      const fromNote = clearNoteData(note.fromNote);

      const payload = {
        fromListName, fromNotes: [note.fromNote], toListName, toNotes: [toNote],
      };
      dispatch({ type: MOVE_NOTES, payload });

      try {
        await dataApi.putNotes({ listName: toListName, notes: [toNote] });
      } catch (error) {
        console.log('retryDiedNotes move error: ', error);
        dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      vars.editorReducer.didRetryMovingNote = true;
      dispatch({ type: MOVE_NOTES_COMMIT, payload });

      try {
        await dataApi.putNotes({ listName: fromListName, notes: [fromNote] });
      } catch (error) {
        console.log('retryDiedNotes move clean up error: ', error);
        // error in this step should be fine
      }

      await sync()(dispatch, getState);
    } else if (status === DIED_DELETING) {
      const toNote = {
        ...note,
        parentIds: [note.id],
        id: `deleted${addedDT}${randomString(4)}`,
        title: '', body: '', media: [],
        updatedDT: addedDT,
      };
      addedDT += 1;

      const fromNote = clearNoteData(note);

      const unusedFPaths = [];
      for (const { name } of note.media) {
        if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
      }

      const safeAreaWidth = getState().window.width;
      if (isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
        updateNoteIdUrlHash(null);
      } else dispatch(updateNoteId(null));

      const payload = { listName, ids: [id] };
      dispatch({ type: DELETE_NOTES, payload });

      try {
        await dataApi.putNotes({ listName, notes: [toNote] });
      } catch (error) {
        console.log('retryDiedNotes delete error: ', error);
        dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: DELETE_NOTES_COMMIT, payload });

      try {
        await dataApi.putNotes({ listName, notes: [fromNote] });
        await dataApi.deleteServerFiles(unusedFPaths);
        await fileApi.deleteFiles(unusedFPaths);
      } catch (error) {
        console.log('retryDiedNotes delete clean up error: ', error);
        // error in this step should be fine
      }

      await sync()(dispatch, getState);
    } else {
      throw new Error(`Invalid status: ${status} of id: ${id}`);
    }
  }
};

export const cancelDiedNotes = (ids, listName = null) => async (dispatch, getState) => {

  if (!listName) listName = getState().display.listName;

  const safeAreaWidth = getState().window.width;
  if (isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
    updateNoteIdUrlHash(null);
    // Need this to make sure noteId is null before deleting notes in notesReducer.
    // moveNotes and deleteNotes don't need this because of awaiting dataApi.
    await sleep(100);
  }

  const deleteUnsavedNoteIds = [];
  for (const id of ids) {
    const { status, fromNote } = getState().notes[listName][id];
    if (status === DIED_UPDATING) deleteUnsavedNoteIds.push(fromNote.id);
  }

  const payload = { listName, ids, deleteUnsavedNoteIds };
  dispatch({ type: CANCEL_DIED_NOTES, payload });
};

export const runAfterFetchTask = () => async (dispatch, getState) => {
  // After fetch, need to sync first before doing housework tasks!
  // If not, settings might be overwritten i.e. by checkPurchases.
  if (vars.syncMode.doSyncMode && !vars.runAfterFetchTask.didRun) {
    dispatch(sync());
    vars.runAfterFetchTask.didRun = true;
    return;
  }

  dispatch(randomHouseworkTasks());
};

export const randomHouseworkTasks = () => async (dispatch, getState) => {
  const now = Date.now();
  if (now - vars.randomHouseworkTasks.dt < 24 * 60 * 60 * 1000) return;

  const rand = Math.random();
  if (rand < 0.33) dispatch(deleteOldNotesInTrash());
  else if (rand < 0.66) dispatch(checkPurchases());
  else dispatch(cleanUpStaticFiles());

  vars.randomHouseworkTasks.dt = now;
};

export const deleteOldNotesInTrash = () => async (dispatch, getState) => {

  const doDeleteOldNotesInTrash = getState().settings.doDeleteOldNotesInTrash;
  if (!doDeleteOldNotesInTrash) return;

  const oldNotes = await dataApi.getOldNotesInTrash();
  if (oldNotes.length === 0) return;

  const oldNoteIds = oldNotes.map(note => note.id);
  if (oldNoteIds.includes(getState().display.noteId)) return;

  let addedDT = Date.now();
  const toNotes = oldNotes.map(note => {
    const toNote = {
      ...note,
      parentIds: [note.id],
      id: `deleted${addedDT}${randomString(4)}`,
      title: '', body: '', media: [],
      updatedDT: addedDT,
    };
    addedDT += 1;
    return toNote;
  });
  const fromNotes = oldNotes.map(note => clearNoteData(note));

  const unusedFPaths = [];
  for (const note of oldNotes) {
    for (const { name } of note.media) {
      if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
    }
  }

  const listName = TRASH;
  const payload = { listName, ids: oldNoteIds };

  vars.deleteOldNotes.ids = oldNoteIds;
  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH, payload });

  try {
    await dataApi.putNotes({ listName, notes: toNotes });
  } catch (error) {
    console.log('deleteOldNotesInTrash error: ', error);
    dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_ROLLBACK });
    vars.deleteOldNotes.ids = null;
    return;
  }

  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_COMMIT, payload });
  vars.deleteOldNotes.ids = null;

  try {
    await dataApi.putNotes({ listName, notes: fromNotes });
    await dataApi.deleteServerFiles(unusedFPaths);
    await fileApi.deleteFiles(unusedFPaths);
  } catch (error) {
    console.log('deleteOldNotesInTrash clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

export const mergeNotes = (selectedId) => async (dispatch, getState) => {
  const addedDT = Date.now();
  const { listName, noteId } = getState().display;
  const conflictedNote = getState().conflictedNotes[listName][noteId];

  let toListName, toNote;
  const fromNotes = {}, noteMedia = [];
  for (let i = 0; i < conflictedNote.notes.length; i++) {

    const _listName = conflictedNote.listNames[i];
    const note = conflictedNote.notes[i];

    if (note.id === selectedId) {
      toListName = _listName;
      toNote = {
        parentIds: conflictedNote.notes.map(n => n.id),
        id: `${addedDT}${randomString(4)}`,
        title: note.title, body: note.body, media: note.media,
        updatedDT: addedDT,
      };
    }

    if (!fromNotes[_listName]) fromNotes[_listName] = [];
    fromNotes[_listName].push(clearNoteData(note));

    noteMedia.push(...note.media);
  }

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(toNote.media, noteMedia);

  const payload = { conflictedNote, toListName, toNote };
  dispatch({ type: MERGE_NOTES, payload });

  try {
    await dataApi.putNotes({
      listName: toListName, notes: [toNote], staticFPaths: usedFPaths,
    });
  } catch (error) {
    console.log('mergeNote error: ', error);
    dispatch({ type: MERGE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  toNote['addedDT'] = Math.min(...conflictedNote.notes.map(note => {
    return note.addedDT ? note.addedDT : addedDT;
  }));

  const safeAreaWidth = getState().window.width;
  if (
    getState().display.listName !== toListName &&
    isNumber(safeAreaWidth) &&
    safeAreaWidth < LG_WIDTH
  ) {
    updateNoteIdUrlHash(null);
    // Need this to make sure noteId is null before deleting notes in conflictedNotes.
    await sleep(100);
  }

  dispatch({ type: MERGE_NOTES_COMMIT, payload: { ...payload, toNote } });

  try {
    for (const [_listName, _notes] of Object.entries(fromNotes)) {
      await dataApi.putNotes({ listName: _listName, notes: _notes });
    }
    await dataApi.deleteServerFiles(serverUnusedFPaths);
    await fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('mergeNote clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

export const showNoteListMenuPopup = (rect, doCheckEditing) => async (
  dispatch, getState
) => {

  if (!rect) rect = vars.showNoteListMenuPopup.selectedRect;

  if (doCheckEditing) {
    if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;

    const isEditorUploading = getState().editor.isUploading;
    if (isEditorUploading) return;

    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) {
      vars.showNoteListMenuPopup.selectedRect = rect;
      dispatch(increaseShowNoteListMenuPopupCount());
      return;
    }
  }

  updatePopupUrlHash(NOTE_LIST_MENU_POPUP, true, rect);
};

export const onShowNoteListMenuPopup = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(showNoteListMenuPopup(null, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

export const showNLIMPopup = (noteId, rect, doCheckEditing) => async (
  dispatch, getState
) => {

  const _noteId = getState().display.noteId;

  if (!noteId) noteId = vars.showNLIMPopup.selectedNoteId;
  if (!rect) rect = vars.showNLIMPopup.selectedRect;

  if (doCheckEditing) {
    if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;

    if (noteId === _noteId) {
      const isEditorUploading = getState().editor.isUploading;
      if (isEditorUploading) return;

      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        vars.showNLIMPopup.selectedNoteId = noteId;
        vars.showNLIMPopup.selectedRect = rect;
        dispatch(increaseShowNLIMPopupCount());
        return;
      }
    }
  }

  dispatch(updateSelectingNoteId(noteId));
  updatePopupUrlHash(NOTE_LIST_ITEM_MENU_POPUP, true, rect);
};

export const onShowNLIMPopup = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(showNLIMPopup(null, null, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

const _cleanUpStaticFiles = async (dispatch, getState) => {
  const noteFPaths = getNoteFPaths(getState());
  const unsavedNotes = getState().unsavedNotes;

  const usedFPaths = [];
  const { noteIds, conflictedIds } = listNoteIds(noteFPaths);
  for (const noteId of [...noteIds, ...conflictedIds]) {
    for (const fpath of noteId.fpaths) {
      if (fpath.includes(CD_ROOT + '/')) usedFPaths.push(getStaticFPath(fpath));
    }
  }

  for (const k in unsavedNotes) {
    const { media } = unsavedNotes[k];
    for (const { name: fpath } of media) {
      if (fpath.includes(CD_ROOT + '/')) usedFPaths.push(getStaticFPath(fpath));
    }
  }

  // Delete unused static files in server
  let staticFPaths = getStaticFPaths(getState());
  // if syncMode, staticFPaths is always empty.

  let unusedFPaths = [];
  for (const fpath of staticFPaths) {
    if (usedFPaths.includes(fpath)) continue;
    unusedFPaths.push(fpath);
  }
  unusedFPaths = unusedFPaths.slice(0, N_NOTES);

  if (unusedFPaths.length > 0) {
    console.log('In cleanUpStaticFiles, found unused fpaths on server:', unusedFPaths);
    // Too risky. Clean up locally for now. If do, need to sync!
    //await dataApi.batchDeleteFileWithRetry(unusedFPaths, 0);
    await fileApi.deleteFiles(unusedFPaths);
  }

  if (
    getState().display.isEditorFocused ||
    getState().display.isEditorBusy ||
    getState().editor.isUploading
  ) return;

  // Delete unused static files in local
  staticFPaths = await fileApi.getStaticFPaths();

  unusedFPaths = [];
  for (const fpath of staticFPaths) {
    if (usedFPaths.includes(fpath)) continue;
    unusedFPaths.push(fpath);
  }
  unusedFPaths = unusedFPaths.slice(0, N_NOTES);

  if (unusedFPaths.length > 0) {
    await fileApi.deleteFiles(unusedFPaths);
  }

  // Delete unused unsaved notes
  let unusedIds = [];
  for (const k in unsavedNotes) {
    const { id, title, body, savedTitle, savedBody } = unsavedNotes[k];
    if (id === getState().display.noteId) continue;
    if (isTitleEqual(title, savedTitle) && isBodyEqual(body, savedBody)) {
      unusedIds.push(id);
    }
  }
  unusedIds = unusedIds.slice(0, N_NOTES);

  if (unusedIds.length > 0) dispatch(deleteUnsavedNotes(unusedIds));
};

export const cleanUpStaticFiles = () => async (dispatch, getState) => {
  const { cleanUpStaticFilesDT } = getState().localSettings;
  if (!cleanUpStaticFilesDT) return;

  const now = Date.now();
  let p = 1.0 / (N_DAYS * 24 * 60 * 60 * 1000) * Math.abs(now - cleanUpStaticFilesDT);
  p = Math.max(0.01, Math.min(p, 0.99));
  const doCheck = p > Math.random();

  if (!doCheck) return;

  dispatch({ type: CLEAN_UP_STATIC_FILES });
  try {
    await _cleanUpStaticFiles(dispatch, getState);
    dispatch({ type: CLEAN_UP_STATIC_FILES_COMMIT });
  } catch (error) {
    console.log('Error when clean up static files: ', error);
    dispatch({ type: CLEAN_UP_STATIC_FILES_ROLLBACK });
  }
};

export const updateSettingsPopup = (isShown, doCheckEditing = false) => async (
  dispatch, getState
) => {
  /*
    A settings snapshot is made when FETCH_COMMIT and UPDATE_SETTINGS_COMMIT
    For FETCH_COMMIT and UPDATE_SETTINGS_COMMIT, check action type in snapshotReducer
      as need settings that used to upload to the server, not the current in the state

    Can't make a snapshot when open the popup because
      1. FETCH_COMMIT might be after the popup is open
      2. user might open the popup while settings is being updated or rolled back
  */
  if (!isShown) {
    if (doCheckEditing) {
      const listNameEditors = getState().listNameEditors;
      const listNameMap = getState().settings.listNameMap;
      const editingLNEs = getEditingListNameEditors(listNameEditors, listNameMap);
      if (isObject(editingLNEs)) {
        for (const k in editingLNEs) {
          if (!isNumber(editingLNEs[k].blurCount)) editingLNEs[k].blurCount = 0;
          editingLNEs[k].blurCount += 1;
        }
        dispatch(updateListNameEditors(editingLNEs));

        dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_LIST_NAME));
        updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
        return;
      }
    }
    dispatch(updateStgsAndInfo());
  }

  vars.updateSettingsPopup.didCall = true;
  updatePopupUrlHash(SETTINGS_POPUP, isShown);
};

export const updateSettingsViewId = (
  viewId, isSidebarShown, didCloseAnimEnd, didSidebarAnimEnd
) => async (dispatch, getState) => {

  const isUserSignedIn = getState().user.isUserSignedIn;
  if (!isUserSignedIn && viewId === SETTINGS_VIEW_ACCOUNT) {
    viewId = SETTINGS_VIEW_LISTS;
  }

  const payload = {};
  if (viewId) payload.settingsViewId = viewId;
  if ([true, false].includes(isSidebarShown)) {
    payload.isSettingsSidebarShown = isSidebarShown;
  }
  if ([true, false].includes(didCloseAnimEnd)) {
    payload.didSettingsCloseAnimEnd = didCloseAnimEnd;
  }
  if ([true, false].includes(didSidebarAnimEnd)) {
    payload.didSettingsSidebarAnimEnd = didSidebarAnimEnd;
    if (!didSidebarAnimEnd) {
      const { updateSettingsViewIdCount } = getState().display;
      payload.updateSettingsViewIdCount = updateSettingsViewIdCount + 1;
    }
  }

  dispatch({ type: UPDATE_SETTINGS_VIEW_ID, payload });
};

export const updateListNameEditors = (listNameEditors) => {
  return { type: UPDATE_LIST_NAME_EDITORS, payload: listNameEditors };
};

export const addListNames = (newNames) => {

  let i = 0;
  const addedDT = Date.now();

  const listNameObjs = [];
  for (const newName of newNames) {
    // If cpu is fast enough, addedDT will be the same for all new names!
    //    so use a predefined one with added loop index.
    const id = `${addedDT + i}-${randomString(4)}`;
    const listNameObj = { listName: id, displayName: newName };
    listNameObjs.push(listNameObj);

    i += 1;
  }

  return { type: ADD_LIST_NAMES, payload: listNameObjs };
};

export const updateListNames = (listNames, newNames) => {
  return { type: UPDATE_LIST_NAMES, payload: { listNames, newNames } };
};

export const moveListName = (listName, direction) => {
  return { type: MOVE_LIST_NAME, payload: { listName, direction } };
};

export const moveToListName = (listName, parent) => {
  return { type: MOVE_TO_LIST_NAME, payload: { listName, parent } };
};

export const deleteListNames = (listNames) => async (dispatch, getState) => {
  const { listNameMap } = getState().settings;

  const allListNames = [];
  for (const listName of listNames) {
    const { listNameObj } = getListNameObj(listName, listNameMap);
    allListNames.push(listNameObj.listName);
    allListNames.push(...getAllListNames(listNameObj.children));
  }

  dispatch({ type: DELETE_LIST_NAMES, payload: { listNames: allListNames } });
};

export const updateDoSyncMode = (doSyncMode) => {
  return { type: UPDATE_DO_SYNC_MODE, payload: doSyncMode };
};

export const updateDoSyncModeInput = (doSyncMode) => {
  return { type: UPDATE_DO_SYNC_MODE_INPUT, payload: doSyncMode };
};

export const updateDoDeleteOldNotesInTrash = (doDeleteOldNotesInTrash) => {
  return {
    type: UPDATE_DO_DELETE_OLD_NOTES_IN_TRASH, payload: doDeleteOldNotesInTrash,
  };
};

export const updateSortOn = (sortOn) => {
  return { type: UPDATE_SORT_ON, payload: sortOn };
};

export const updateDoDescendingOrder = (doDescendingOrder) => {
  return { type: UPDATE_DO_DESCENDING_ORDER, payload: doDescendingOrder };
};

export const updateNoteDateShowingMode = (mode) => {
  return { type: UPDATE_NOTE_DATE_SHOWING_MODE, payload: mode };
};

export const updateNoteDateFormat = (
  dateFormat, isTwoDigit, isCurrentYearShown
) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_DATE_FORMAT));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const payload = {};
  if (NOTE_DATE_FORMATS.includes(dateFormat)) {
    payload.noteDateFormat = dateFormat;
  }
  if ([true, false].includes(isTwoDigit)) {
    payload.noteDateIsTwoDigit = isTwoDigit;
  }
  if ([true, false].includes(isCurrentYearShown)) {
    payload.noteDateIsCurrentYearShown = isCurrentYearShown;
  }

  dispatch({ type: UPDATE_NOTE_DATE_FORMAT, payload });
};

export const updateDoSectionNotesByMonth = (doSection) => async (
  dispatch, getState
) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_SECTION_NOTES_BY_MONTH));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  dispatch({ type: UPDATE_DO_SECTION_NOTES_BY_MONTH, payload: doSection });
};

export const updateDoMoreEditorFontSizes = (doMore) => async (
  dispatch, getState
) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_MORE_EDITOR_FONT_SIZES));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  dispatch({ type: UPDATE_DO_MORE_EDITOR_FONT_SIZES, payload: doMore });
};

export const updateSelectingListName = (listName) => {
  return {
    type: UPDATE_SELECTING_LIST_NAME,
    payload: listName,
  };
};

export const updateDeletingListName = (listName) => {
  return {
    type: UPDATE_DELETING_LIST_NAME,
    payload: listName,
  };
};

const updateSettings = async (dispatch, getState) => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  const { doSyncMode, doSyncModeInput } = getState().localSettings;
  if (doSyncMode !== doSyncModeInput) vars.syncMode.didChange = true;

  // It's ok if MERGE_SETTINGS, IMPORT, DELETE_ALL in progress. Let it be conflict.
  if (isEqual(settings, snapshotSettings)) {
    dispatch(cancelDiedSettings());
    return;
  }

  const addedDT = Date.now();
  const {
    fpaths: _settingsFPaths, ids: _settingsIds,
  } = getLastSettingsFPaths(getSettingsFPaths(getState()));

  const settingsFName = createDataFName(`${addedDT}${randomString(4)}`, _settingsIds);
  const settingsFPath = createSettingsFPath(settingsFName);

  let doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  if (vars.syncMode.didChange) doFetch = false;
  const payload = { settings, doFetch };

  vars.updateSettings.doFetch = doFetch;
  dispatch({ type: UPDATE_SETTINGS, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (error) {
    console.log('updateSettings error: ', error);
    dispatch({ type: UPDATE_SETTINGS_ROLLBACK, payload: { ...payload, error } });
    vars.updateSettings.doFetch = false;
    vars.syncMode.didChange = false;
    return;
  }

  dispatch({ type: UPDATE_SETTINGS_COMMIT, payload });
  vars.updateSettings.doFetch = false;

  try {
    await dataApi.putFiles(_settingsFPaths, _settingsFPaths.map(() => ({})));
  } catch (error) {
    console.log('updateSettings clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

const updateInfo = async (dispatch, getState) => {
  const info = getState().info;
  const snapshotInfo = getState().snapshot.info;

  // It's ok if IAP in progess as when complete, it'll update again.
  if (isEqual(info, snapshotInfo)) return;

  const addedDT = Date.now();
  const infoFPath = `${INFO}${addedDT}${DOT_JSON}`;
  const _infoFPath = getInfoFPath(getState());

  const payload = { infoFPath, info };
  dispatch({ type: UPDATE_INFO, payload });

  try {
    await dataApi.putFiles([infoFPath], [info]);
  } catch (error) {
    console.log('updateInfo error: ', error);
    dispatch({ type: UPDATE_INFO_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: UPDATE_INFO_COMMIT, payload });

  try {
    if (_infoFPath) await dataApi.deleteFiles([_infoFPath]);
  } catch (error) {
    console.log('updateInfo clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

const applySyncMode = async (dispatch, getState) => {
  // Do nothing on mobile. This is for web.
};

export const updateStgsAndInfo = () => async (dispatch, getState) => {
  await updateSettings(dispatch, getState);
  await updateInfo(dispatch, getState);
  await applySyncMode(dispatch, getState);
};

export const retryDiedSettings = () => async (dispatch, getState) => {
  await updateSettings(dispatch, getState);
  await applySyncMode(dispatch, getState);
};

export const cancelDiedSettings = () => async (dispatch, getState) => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  const noteFPaths = getNoteFPaths(getState());
  const { noteIds, conflictedIds } = listNoteIds(noteFPaths);

  const listNames = getListNamesFromNoteIds(noteIds, conflictedIds);
  let doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  if (vars.syncMode.didChange) doFetch = false;
  const payload = { listNames, settings: snapshotSettings, doFetch };

  vars.updateSettings.doFetch = doFetch;
  dispatch({ type: CANCEL_DIED_SETTINGS, payload });

  vars.updateSettings.doFetch = false;
};

export const disableSyncMode = () => async (dispatch, getState) => {
  // Do nothing on mobile. This is for web.
};

export const cancelChangedSyncMode = () => {
  return { type: CANCEL_CHANGED_SYNC_MODE };
};

export const tryUpdateInfo = () => async (dispatch, getState) => {
  const isSettingsPopupShown = getState().display.isSettingsPopupShown;
  if (isSettingsPopupShown) return;

  await updateInfo(dispatch, getState);
};

export const mergeSettings = (selectedId) => async (dispatch, getState) => {
  const currentSettings = getState().settings;
  const contents = getState().conflictedSettings.contents;

  const addedDT = Date.now();
  const _settingsFPaths = contents.map(content => content.fpath);
  const _settingsIds = contents.map(content => content.id);
  const _settings = contents.find(content => content.id === selectedId);

  const settingsFName = createDataFName(`${addedDT}${randomString(4)}`, _settingsIds);
  const settingsFPath = createSettingsFPath(settingsFName);

  const settings = { ...initialSettingsState };
  for (const k in settings) {
    // Conflicted settings content has extra attrs i.e. id and fpath.
    if (k in _settings) settings[k] = _settings[k];
  }

  const noteFPaths = getNoteFPaths(getState());
  const { noteIds, conflictedIds } = listNoteIds(noteFPaths);

  const listNames = getListNamesFromNoteIds(noteIds, conflictedIds);
  const doFetch = (
    settings.sortOn !== currentSettings.sortOn ||
    settings.doDescendingOrder !== currentSettings.doDescendingOrder
  );
  const payload = { listNames, settings, doFetch };

  vars.updateSettings.doFetch = doFetch;
  dispatch({ type: MERGE_SETTINGS, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (error) {
    console.log('mergeSettings error: ', error);
    dispatch({ type: MERGE_SETTINGS_ROLLBACK, payload: { ...payload, error } });
    vars.updateSettings.doFetch = false;
    return;
  }

  dispatch({ type: MERGE_SETTINGS_COMMIT, payload });
  vars.updateSettings.doFetch = false;

  try {
    await dataApi.putFiles(_settingsFPaths, _settingsFPaths.map(() => ({})));
  } catch (error) {
    console.log('mergeSettings clean up error: ', error);
    // error in this step should be fine
  }

  await sync()(dispatch, getState);
};

/*
 * _isSyncing: one sync at a time
 * _newSyncObj: there is a new update and need to sync again
 *
 * updateAction: 0 - normal, update immediately or show notification
 *               1 - force, update immediately no matter what
 *               2 - no update even there is a change
 */
export const sync = (
  doForceListFPaths = false, updateAction = 0, haveUpdate = false
) => async (dispatch, getState) => {

  if (!getState().user.isUserSignedIn) return;
  if (!vars.syncMode.doSyncMode) return;
  if (vars.deleteSyncData.isDeleting) return;

  if (vars.sync.isSyncing) {
    vars.sync.newSyncObj = { doForceListFPaths, updateAction };
    return;
  }
  [vars.sync.isSyncing, vars.sync.newSyncObj] = [true, null];

  // Set haveUpdate to true if there is already pending update
  //   Need to check before dispatching SYNC
  const syncProgress = getState().display.syncProgress;
  if (syncProgress && syncProgress.status === SHOW_SYNCED) haveUpdate = true;

  dispatch({ type: SYNC });
  await sleep(16); // Make sure rerender first.

  try {
    const {
      noteFPaths, staticFPaths, settingsFPaths, infoFPath, pinFPaths,
    } = await dataApi.listServerFPaths(doForceListFPaths);
    const { noteIds, conflictedIds } = listNoteIds(noteFPaths);

    const leafFPaths = [];
    for (const noteId of noteIds) leafFPaths.push(...noteId.fpaths);
    for (const noteId of conflictedIds) leafFPaths.push(...noteId.fpaths);

    const {
      noteFPaths: _noteFPaths,
      settingsFPaths: _settingsFPaths,
      infoFPath: _infoFPath,
      pinFPaths: _pinFPaths,
    } = await dataApi.listFPaths(doForceListFPaths);
    const _staticFPaths = await fileApi.getStaticFPaths();
    const {
      noteIds: _noteIds, conflictedIds: _conflictedIds,
    } = listNoteIds(_noteFPaths);

    const _leafFPaths = [];
    for (const noteId of _noteIds) _leafFPaths.push(...noteId.fpaths);
    for (const noteId of _conflictedIds) _leafFPaths.push(...noteId.fpaths);

    const allNoteFPaths = [...new Set([...noteFPaths, ..._noteFPaths])];
    const {
      noteIds: allNoteIds, conflictedIds: allConflictedIds, toRootIds: allToRootIds,
    } = listNoteIds(allNoteFPaths);

    const allLeafFPaths = [];
    for (const noteId of allNoteIds) allLeafFPaths.push(...noteId.fpaths);
    for (const noteId of allConflictedIds) allLeafFPaths.push(...noteId.fpaths);

    const allLeafStaticFPaths = [];
    for (const fpath of allLeafFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        allLeafStaticFPaths.push(getStaticFPath(fpath));
      }
    }

    // 1. Server side: upload all fpaths
    let fpaths = [], contents = [];
    for (const fpath of _noteFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          allLeafStaticFPaths.includes(staticFPath) &&
          !staticFPaths.includes(staticFPath)
        ) {
          if (vars.platform.isReactNative) {
            // if no file locally, will just ignore by Blockstack mobile libraries.
            const fileFPath = 'file://' + staticFPath;
            if (!fpaths.includes(fileFPath)) {
              fpaths.push(fileFPath);
              contents.push('');
            }
          } else {
            if (!fpaths.includes(staticFPath)) {
              const content = await fileApi.getFile(staticFPath);
              if (content !== undefined) {
                fpaths.push(staticFPath);
                contents.push(content);
              }
            }
          }
        }
      }

      if (noteFPaths.includes(fpath)) continue;

      let content;
      if (allLeafFPaths.includes(fpath)) {
        // No order guarantee but this is just one file
        content = (await dataApi.getFiles([fpath])).contents[0];
      } else {
        if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
        else content = '';
      }
      fpaths.push(fpath);
      contents.push(content);
    }
    await serverApi.putFiles(fpaths, contents);

    // 2. Server side: loop used to be leaves in server and set to empty
    fpaths = []; contents = [];
    let deletedFPaths = [];
    for (const fpath of leafFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          !allLeafStaticFPaths.includes(staticFPath) &&
          staticFPaths.includes(staticFPath)
        ) {
          if (!deletedFPaths.includes(staticFPath)) deletedFPaths.push(staticFPath);
        }
      }

      if (allLeafFPaths.includes(fpath)) continue;

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);
    }
    await serverApi.putFiles(fpaths, contents);
    await serverApi.deleteFiles(deletedFPaths);

    // 3. Local side: download all fpaths
    fpaths = []; contents = [];
    let _gFPaths = [], gStaticFPaths = [];
    for (const fpath of noteFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          allLeafStaticFPaths.includes(staticFPath) &&
          !_staticFPaths.includes(staticFPath)
        ) {
          if (vars.platform.isReactNative) {
            // if no directories, will create by Blockstack mobile libraries.
            const fileFPath = 'file://' + staticFPath;
            if (!gStaticFPaths.includes(fileFPath)) {
              gStaticFPaths.push(fileFPath);
              haveUpdate = true;
            }
          } else {
            if (!gStaticFPaths.includes(staticFPath)) {
              gStaticFPaths.push(staticFPath);
              haveUpdate = true;
            }
          }
        }
      }

      if (_noteFPaths.includes(fpath)) continue;
      haveUpdate = true;

      if (allLeafFPaths.includes(fpath)) {
        _gFPaths.push(fpath);
        continue;
      }

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);
    }
    // No order guarantee btw _gFPaths and gContents
    let { fpaths: gFPaths, contents: gContents } = await serverApi.getFiles(_gFPaths);
    if (vars.platform.isReactNative) {
      await serverApi.getFiles(gStaticFPaths, true);
    } else {
      const gStaticFiles = await serverApi.getFiles(gStaticFPaths, true);
      for (let i = 0; i < gStaticFiles.fpaths.length; i++) {
        if (gStaticFiles.contents[i] === null) continue;
        await fileApi.putFile(gStaticFiles.fpaths[i], gStaticFiles.contents[i]);
      }
    }
    await dataApi.putFiles([...fpaths, ...gFPaths], [...contents, ...gContents]);

    // 4. Local side: loop used to be leaves in local and set to empty
    fpaths = []; contents = []; deletedFPaths = [];
    for (const fpath of _leafFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          !allLeafStaticFPaths.includes(staticFPath) &&
          _staticFPaths.includes(staticFPath)
        ) {
          if (!deletedFPaths.includes(staticFPath)) deletedFPaths.push(staticFPath);
        }
      }

      if (allLeafFPaths.includes(fpath)) continue;

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);
    }
    await dataApi.putFiles(fpaths, contents);
    await fileApi.deleteFiles(deletedFPaths);

    // Settings
    const { fpaths: settingsLeafFPaths } = getLastSettingsFPaths(settingsFPaths);
    const { fpaths: _settingsLeafFPaths } = getLastSettingsFPaths(_settingsFPaths);

    const settingsAllFPaths = [...new Set([...settingsFPaths, ..._settingsFPaths])];
    const { fpaths: settingsAllLeafFPaths } = getLastSettingsFPaths(settingsAllFPaths);

    // 1. Server side: upload all settingsFPaths
    fpaths = []; contents = [];
    for (const fpath of _settingsFPaths) {
      if (settingsFPaths.includes(fpath)) continue;

      let content;
      if (settingsAllLeafFPaths.includes(fpath)) {
        // No order guarantee but this is just one file
        content = (await dataApi.getFiles([fpath])).contents[0];
      } else {
        content = {};
      }
      fpaths.push(fpath);
      contents.push(content);
    }
    await serverApi.putFiles(fpaths, contents);

    // 2. Server side: loop used to be leaves in server and set to empty
    fpaths = []; contents = [];
    for (const fpath of settingsLeafFPaths) {
      if (settingsAllLeafFPaths.includes(fpath)) continue;
      fpaths.push(fpath);
      contents.push({});
    }
    await serverApi.putFiles(fpaths, contents);

    // 3. Local side: download all settingsFPaths
    fpaths = []; contents = [];
    _gFPaths = [];
    for (const fpath of settingsFPaths) {
      if (_settingsFPaths.includes(fpath)) continue;
      haveUpdate = true;

      if (settingsAllLeafFPaths.includes(fpath)) {
        _gFPaths.push(fpath);
        continue;
      }

      fpaths.push(fpath);
      contents.push({});
    }
    // No order guarantee btw _gFPaths and gContents
    ({ fpaths: gFPaths, contents: gContents } = await serverApi.getFiles(_gFPaths));
    await dataApi.putFiles([...fpaths, ...gFPaths], [...contents, ...gContents]);

    // 4. Local side: loop used to be leaves in local and set to empty
    fpaths = []; contents = [];
    for (const fpath of _settingsLeafFPaths) {
      if (settingsAllLeafFPaths.includes(fpath)) continue;
      fpaths.push(fpath);
      contents.push({});
    }
    await dataApi.putFiles(fpaths, contents);

    // Info
    //   action: 0 - no info or already the same,
    //           1 - download from server to device,
    //           2 - upload from device to server
    let syncInfoAction;
    if (infoFPath && _infoFPath) {
      const dt = parseInt(
        infoFPath.slice(INFO.length, -1 * DOT_JSON.length), 10
      );
      const _dt = parseInt(
        _infoFPath.slice(INFO.length, -1 * DOT_JSON.length), 10
      );

      if (dt > _dt) syncInfoAction = 1;
      else if (dt < _dt) syncInfoAction = 2;
      else syncInfoAction = 0;
    } else if (infoFPath) syncInfoAction = 1;
    else if (_infoFPath) syncInfoAction = 2;
    else syncInfoAction = 0;

    if (syncInfoAction === 0) { /* Do nothing */ }
    else if (syncInfoAction === 1) {
      // Download from server to device

      // No order guarantee but this is just one file
      const content = (await serverApi.getFiles([infoFPath])).contents[0];
      await dataApi.putFiles([infoFPath], [content]);

      // Delete obsolete version in device
      if (_infoFPath) await dataApi.deleteFiles([_infoFPath]);

      haveUpdate = true;
    } else if (syncInfoAction === 2) {
      // Upload from device to server

      // No order guarantee but this is just one file
      const content = (await dataApi.getFiles([_infoFPath])).contents[0];
      await serverApi.putFiles([_infoFPath], [content]);

      // Delete obsolete version in server
      if (infoFPath) await serverApi.deleteFiles([infoFPath]);
    } else throw new Error(`Invalid syncInfoAction: ${syncInfoAction}`);

    // Pins
    const allPinFPaths = [...new Set([...pinFPaths, ..._pinFPaths])];
    const leafPins = {};
    for (const fpath of allPinFPaths) {
      const { updatedDT, id } = extractPinFPath(fpath);

      const _id = id.startsWith('deleted') ? id.slice(7) : id;
      const pinMainId = getMainId(_id, allToRootIds);

      if (pinMainId in leafPins && leafPins[pinMainId].updatedDT > updatedDT) continue;
      leafPins[pinMainId] = { updatedDT, fpath };
    }
    const leafPinFPaths = Object.values(leafPins).map(el => el.fpath);

    // 1. Server side: upload leaf pinFPaths
    fpaths = []; contents = [];
    for (const fpath of leafPinFPaths) {
      if (pinFPaths.includes(fpath)) continue;
      fpaths.push(fpath);
      contents.push({});
    }
    await serverApi.putFiles(fpaths, contents);

    // 2. Server side: delete obsolete pinFPaths
    fpaths = []; contents = [];
    for (const fpath of pinFPaths) {
      if (leafPinFPaths.includes(fpath)) continue;
      fpaths.push(fpath);
    }
    await serverApi.deleteFiles(fpaths);

    // 3. Local side: download leaf pinFPaths
    fpaths = []; contents = [];
    for (const fpath of leafPinFPaths) {
      if (_pinFPaths.includes(fpath)) continue;
      haveUpdate = true;

      fpaths.push(fpath);
      contents.push({});
    }
    await dataApi.putFiles(fpaths, contents);

    // 4. Local side: delete obsolete pinFPaths
    fpaths = []; contents = [];
    for (const fpath of _pinFPaths) {
      if (leafPinFPaths.includes(fpath)) continue;
      fpaths.push(fpath);
    }
    await dataApi.deleteFiles(fpaths);

    dispatch({
      type: SYNC_COMMIT,
      payload: {
        updateAction,
        haveUpdate,
        haveNewSync: vars.sync.newSyncObj !== null,
      },
    });

    if (vars.sync.newSyncObj) {
      let _doForce = vars.sync.newSyncObj.doForceListFPaths;
      if (doForceListFPaths) _doForce = false;

      const _updateAction = Math.min(updateAction, vars.sync.newSyncObj.updateAction);

      [vars.sync.isSyncing, vars.sync.newSyncObj] = [false, null];
      dispatch(sync(_doForce, _updateAction, haveUpdate));
      return;
    }

    [vars.sync.isSyncing, vars.sync.newSyncObj] = [false, null];
    vars.sync.lastSyncDT = Date.now();
  } catch (error) {
    console.log('Sync error: ', error);
    [vars.sync.isSyncing, vars.sync.newSyncObj] = [false, null];
    dispatch({ type: SYNC_ROLLBACK, payload: error });
  }
};

export const tryUpdateSynced = (updateAction, haveUpdate) => async (
  dispatch, getState
) => {
  if (updateAction === 2) return;
  if (updateAction === 1) {
    dispatch(updateSynced());
    return;
  }

  if (!haveUpdate) {
    dispatch(randomHouseworkTasks());
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const pageYOffset = vars.scrollPanel.pageYOffset;
    const noteId = getState().display.noteId;
    const isPopupShown = (
      getState().display.isNoteListItemMenuPopupShown ||
      getState().display.isListNamesPopupShown ||
      getState().display.isPinMenuPopupShown
    );

    const isEditorFocused = getState().display.isEditorFocused;
    const isEditorBusy = getState().display.isEditorBusy;
    if (
      pageYOffset === 0 && noteId === null && !isPopupShown &&
      !isEditorFocused && !isEditorBusy
    ) {
      dispatch(updateSynced());
      return;
    }
  }

  dispatch({ type: UPDATE_SYNC_PROGRESS, payload: { status: SHOW_SYNCED } });
};

export const updateSynced = () => {
  return { type: UPDATE_SYNCED };
};

export const updateEditorFocused = (isFocused) => {
  return {
    type: UPDATE_EDITOR_FOCUSED,
    payload: isFocused,
  };
};

export const updateEditorBusy = (isBusy) => {
  return {
    type: UPDATE_EDITOR_BUSY,
    payload: isBusy,
  };
};

export const updateMoveAction = (moveAction) => {
  return {
    type: UPDATE_MOVE_ACTION,
    payload: moveAction,
  };
};

export const updateDeleteAction = (deleteAction) => {
  return {
    type: UPDATE_DELETE_ACTION,
    payload: deleteAction,
  };
};

export const updateDiscardAction = (discardAction) => {
  return {
    type: UPDATE_DISCARD_ACTION,
    payload: discardAction,
  };
};

export const updateListNamesMode = (mode) => {
  return { type: UPDATE_LIST_NAMES_MODE, payload: { listNamesMode: mode } };
};

export const increaseSaveNoteCount = () => {
  return { type: INCREASE_SAVE_NOTE_COUNT };
};

export const increaseDiscardNoteCount = () => {
  return { type: INCREASE_DISCARD_NOTE_COUNT };
};

export const increaseUpdateNoteIdUrlHashCount = (id) => {
  return {
    type: INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT,
    payload: id,
  };
};

export const increaseUpdateNoteIdCount = (id) => {
  return {
    type: INCREASE_UPDATE_NOTE_ID_COUNT,
    payload: id,
  };
};

export const increaseChangeListNameCount = (listName) => {
  return {
    type: INCREASE_CHANGE_LIST_NAME_COUNT,
    payload: listName,
  };
};

export const increaseFocusTitleCount = () => {
  return { type: INCREASE_FOCUS_TITLE_COUNT };
};

export const increaseSetInitDataCount = () => {
  return { type: INCREASE_SET_INIT_DATA_COUNT };
};

export const increaseBlurCount = () => {
  return { type: INCREASE_BLUR_COUNT };
};

export const increaseUpdateEditorWidthCount = () => {
  return { type: INCREASE_UPDATE_EDITOR_WIDTH_COUNT };
};

export const increaseResetDidClickCount = () => {
  return { type: INCREASE_RESET_DID_CLICK_COUNT };
};

export const increaseUpdateBulkEditUrlHashCount = () => {
  return { type: INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT };
};

export const increaseUpdateBulkEditCount = () => {
  return { type: INCREASE_UPDATE_BULK_EDIT_COUNT };
};

export const increaseShowNoteListMenuPopupCount = () => {
  return { type: INCREASE_SHOW_NOTE_LIST_MENU_POPUP_COUNT };
};

export const increaseShowNLIMPopupCount = () => {
  return { type: INCREASE_SHOW_NLIM_POPUP_COUNT };
};

export const updateEditorIsUploading = (isUploading) => {
  return { type: UPDATE_EDITOR_IS_UPLOADING, payload: isUploading };
};

export const updateEditorScrollEnabled = (enabled) => {
  return { type: UPDATE_EDITOR_SCROLL_ENABLED, payload: enabled };
};

export const updateEditingNote = (id, title, body, media) => async (
  dispatch, getState
) => {
  const note = id === NEW_NOTE ? NEW_NOTE_OBJ : getNote(id, getState().notes);
  if (!isObject(note)) return;

  dispatch({
    type: UPDATE_EDITING_NOTE,
    payload: {
      id, title, body, media,
      savedTitle: note.title, savedBody: note.body, savedMedia: note.media,
    },
  });
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
  await dataApi.putUnsavedNote(
    id, title, body, media, savedTitle, savedBody, savedMedia,
  );
};

export const deleteDbUnsavedNotes = (ids) => async (dispatch, getState) => {
  await dataApi.deleteUnsavedNotes(ids);
};

export const deleteAllDbUnsavedNotes = () => async (dispatch, getState) => {
  await dataApi.deleteAllUnsavedNotes();
};

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

export const updatePaywallFeature = (feature) => {
  return { type: UPDATE_PAYWALL_FEATURE, payload: feature };
};

const verifyPurchase = async (rawPurchase) => {
  if (!rawPurchase) return { status: INVALID };
  if (Platform.OS === 'android' && rawPurchase.purchaseStateAndroid === 0) {
    return { status: INVALID };
  }

  let source;
  if (Platform.OS === 'ios') source = APPSTORE;
  else if (Platform.OS === 'android') source = PLAYSTORE;

  if (!source) {
    console.log(`Invalid Platform.OS: ${Platform.OS}`);
    return { status: ERROR };
  }

  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const userId = sigObj.publicKey;

  const productId = rawPurchase.productId;

  let token;
  if (Platform.OS === 'ios') token = rawPurchase.transactionReceipt;
  else if (Platform.OS === 'android') token = rawPurchase.purchaseToken;

  if (!token) {
    console.log('No purchaseToken in rawPurchase');
    return { status: INVALID };
  }

  const reqBody = { source, userId, productId, token };

  let verifyResult;
  try {
    const res = await axios.post(IAP_VERIFY_URL, reqBody);
    verifyResult = res.data;
  } catch (error) {
    console.log(`Error when contact IAP server to verify with reqBody: ${JSON.stringify(reqBody)}, Error: `, error);
    return { status: UNKNOWN };
  }

  try {
    if (Platform.OS !== 'android') {
      await iapApi.finishTransaction({ purchase: rawPurchase, isConsumable: false });
    }
  } catch (error) {
    console.log('Error when finishTransaction: ', error);
  }

  return verifyResult;
};

const getIapStatus = async (doForce) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const reqBody = {
    userId: sigObj.publicKey,
    signature: sigObj.signature,
    appId: COM_JUSTNOTECC,
    doForce: doForce,
  };

  const res = await axios.post(IAP_STATUS_URL, reqBody);
  return res;
};

const getPurchases = (
  action, commitAction, rollbackAction, doForce, serverOnly
) => async (dispatch, getState) => {

  const { purchaseState, restoreStatus, refreshStatus } = getState().iap;
  if (
    purchaseState === REQUEST_PURCHASE ||
    restoreStatus === RESTORE_PURCHASES ||
    refreshStatus === REFRESH_PURCHASES
  ) return;

  dispatch({ type: action });

  let statusResult;
  try {
    const res = await getIapStatus(doForce);
    statusResult = res.data;

    if (serverOnly) {
      dispatch({ type: commitAction, payload: statusResult });
      return;
    }

    if (statusResult.status === VALID) {
      const purchase = getLatestPurchase(statusResult.purchases);
      if (purchase && purchase.status === ACTIVE) {
        dispatch({ type: commitAction, payload: statusResult });
        return;
      }
    }
  } catch (error) {
    console.log('Error when contact IAP server to get purchases: ', error);
    dispatch({ type: rollbackAction });
    return;
  }

  let isIap = false;
  let waits = [200, 500, 1000, 1500, 2000, 2500, 3000];
  for (const wait of waits) {
    if (getState().iap.productStatus === GET_PRODUCTS_COMMIT) {
      isIap = true;
      break;
    }
    await sleep(wait);
  }
  if (!isIap) {
    dispatch({ type: commitAction, payload: statusResult });
    return;
  }

  try {
    // As iapUpdatedListener can be missed, need to getAvailablePurchases
    const validPurchases = [], originalOrderIds = [];

    const rawPurchases = await iapApi.getAvailablePurchases();
    for (const rawPurchase of rawPurchases) {
      let originalOrderId;
      if (Platform.OS === 'ios') {
        originalOrderId = rawPurchase.originalTransactionIdentifierIOS;
      } else if (Platform.OS === 'android') {
        originalOrderId = rawPurchase.purchaseToken;
      }

      if (originalOrderIds.includes(originalOrderId)) continue;
      originalOrderIds.push(originalOrderId);

      const verifyResult = await verifyPurchase(rawPurchase);
      if (verifyResult.status === VALID) {
        validPurchases.push(verifyResult.purchase);
      }
    }

    if (validPurchases.length > 0) {
      statusResult.status = VALID;
      for (const purchase of statusResult.purchases) {
        const found = validPurchases.find(p => {
          return p.orderId === purchase.orderId;
        });
        if (!found) validPurchases.push(purchase);
      }
      statusResult.purchases = validPurchases;
    }

    dispatch({ type: commitAction, payload: statusResult });
  } catch (error) {
    console.log('Error when getAvailablePurchases to restore purchases: ', error);
    dispatch({ type: commitAction, payload: statusResult });
  }
};

const iapUpdatedListener = (dispatch, getState) => async (rawPurchase) => {
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

const iapErrorListener = (dispatch, getState) => async (error) => {
  console.log('Error in iapErrorListener: ', error);
  if (error.code === 'E_USER_CANCELLED') {
    dispatch(updateIapPurchaseStatus(null, null));
  } else {
    dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
  }
};

const registerIapListeners = (doRegister, dispatch, getState) => {
  if (doRegister) {
    if (!vars.iap.updatedEventEmitter) {
      vars.iap.updatedEventEmitter = iapApi.purchaseUpdatedListener(
        iapUpdatedListener(dispatch, getState)
      );
    }
    if (!vars.iap.errorEventEmitter) {
      vars.iap.errorEventEmitter = iapApi.purchaseErrorListener(
        iapErrorListener(dispatch, getState)
      );
    }
  } else {
    if (vars.iap.updatedEventEmitter) {
      vars.iap.updatedEventEmitter.remove();
      vars.iap.updatedEventEmitter = null;
    }
    if (vars.iap.errorEventEmitter) {
      vars.iap.errorEventEmitter.remove();
      vars.iap.errorEventEmitter = null;
    }
  }
};

export const endIapConnection = (isInit = false) => async (dispatch, getState) => {
  registerIapListeners(false, dispatch, getState);
  try {
    await iapApi.endConnection();
  } catch (error) {
    console.log('Error when end IAP connection: ', error);
  }

  if (!isInit) {
    vars.iap.didGetProducts = false;
    dispatch(updateIapProductStatus(null, null, null));
  }
};

export const initIapConnectionAndGetProducts = (doForce) => async (
  dispatch, getState
) => {
  if (vars.iap.didGetProducts && !doForce) return;
  vars.iap.didGetProducts = true;
  dispatch({ type: GET_PRODUCTS });

  if (doForce) await endIapConnection(true)(dispatch, getState);

  try {
    const canMakePayments = await iapApi.initConnection();
    try {
      await iapApi.flushFailedPurchasesCachedAsPendingAndroid();
    } catch (flushError) {
      console.log('Flush failed purchases error: ', flushError);
      // error in this step should be fine
    }
    registerIapListeners(true, dispatch, getState);

    let products = null;
    if (canMakePayments) {
      products = await iapApi.getSubscriptions({ skus: [COM_JUSTNOTECC_SUPPORTER] });
      for (let product of products) applySubscriptionOfferDetails(product);
    }

    dispatch({
      type: GET_PRODUCTS_COMMIT,
      payload: { canMakePayments, products },
    });
  } catch (error) {
    console.log('Error when init iap and get products: ', error);
    dispatch({ type: GET_PRODUCTS_ROLLBACK });
  }
};

export const requestPurchase = (product) => async (dispatch, getState) => {
  dispatch({ type: REQUEST_PURCHASE });
  try {
    const { productId, offerToken } = product;
    await iapApi.requestSubscription({
      sku: product.productId,
      // github.com/dooboolab-community/react-native-iap/issues/2247
      subscriptionOffers: [{ sku: productId, offerToken }],
    });
  } catch (error) {
    console.log('Error when request purchase: ', error);
    if (error.code === 'E_USER_CANCELLED') {
      dispatch(updateIapPurchaseStatus(null, null));
    } else {
      dispatch({ type: REQUEST_PURCHASE_ROLLBACK });
    }
  }
};

export const restorePurchases = () => async (dispatch, getState) => {
  await getPurchases(
    RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
    false, false
  )(dispatch, getState);
};

export const refreshPurchases = () => async (dispatch, getState) => {
  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    true, false
  )(dispatch, getState);
};

export const checkPurchases = () => async (dispatch, getState) => {
  const { purchases, checkPurchasesDT } = getState().info;

  const purchase = getValidPurchase(purchases);
  if (!purchase) return;

  const now = Date.now();
  const expiryDT = (new Date(purchase.expiryDate)).getTime();

  let doCheck = false;
  if (now >= expiryDT || !checkPurchasesDT) doCheck = true;
  else {
    let p = 1.0 / (N_DAYS * 24 * 60 * 60 * 1000) * Math.abs(now - checkPurchasesDT);
    p = Math.max(0.01, Math.min(p, 0.99));
    doCheck = p > Math.random();
  }
  if (!doCheck) return;

  await getPurchases(
    REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT, REFRESH_PURCHASES_ROLLBACK,
    false, true
  )(dispatch, getState);
};

export const retryVerifyPurchase = () => async (dispatch, getState) => {
  const rawPurchase = getState().iap.rawPurchase;

  dispatch({ type: REQUEST_PURCHASE });
  const verifyResult = await verifyPurchase(rawPurchase);
  dispatch({
    type: REQUEST_PURCHASE_COMMIT,
    payload: { ...verifyResult, rawPurchase },
  });
};

export const updateIapPublicKey = () => async (dispatch, getState) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  dispatch({ type: UPDATE_IAP_PUBLIC_KEY, payload: sigObj.publicKey });
};

export const updateIapProductStatus = (status, canMakePayments, products) => {
  return {
    type: UPDATE_IAP_PRODUCT_STATUS,
    payload: { status, canMakePayments, products },
  };
};

export const updateIapPurchaseStatus = (status, rawPurchase) => {
  return {
    type: UPDATE_IAP_PURCHASE_STATUS,
    payload: { status, rawPurchase },
  };
};

export const updateIapRestoreStatus = (status) => {
  return {
    type: UPDATE_IAP_RESTORE_STATUS,
    payload: status,
  };
};

export const updateIapRefreshStatus = (status) => {
  return {
    type: UPDATE_IAP_REFRESH_STATUS,
    payload: status,
  };
};

export const pinNotes = (ids) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_PIN));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const noteFPaths = getNoteFPaths(getState());
  const pinFPaths = getPinFPaths(getState());
  const pendingPins = getState().pendingPins;

  const { toRootIds } = listNoteIds(noteFPaths);
  const currentPins = getPins(pinFPaths, pendingPins, true, toRootIds);
  const currentRanks = Object.values(currentPins).map(pin => pin.rank).sort();

  let lexoRank;
  if (currentRanks.length > 0) {
    const rank = currentRanks[currentRanks.length - 1];
    lexoRank = LexoRank.parse(`0|${rank.replace('_', ':')}`).genNext();
  } else {
    lexoRank = LexoRank.middle();
  }

  let now = Date.now();
  const pins = [];
  for (const id of ids) {
    const nextRank = lexoRank.toString().slice(2).replace(':', '_');
    pins.push({ rank: nextRank, updatedDT: now, addedDT: now, id });

    lexoRank = lexoRank.genNext();
    now += 1;
  }

  const payload = { pins };
  dispatch({ type: PIN_NOTE, payload });

  try {
    await dataApi.putPins(payload);
  } catch (error) {
    console.log('pinNotes error: ', error);
    dispatch({ type: PIN_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: PIN_NOTE_COMMIT, payload });
};

export const unpinNotes = (ids) => async (dispatch, getState) => {
  const noteFPaths = getNoteFPaths(getState());
  const pinFPaths = getPinFPaths(getState());
  const pendingPins = getState().pendingPins;

  const { toRootIds } = listNoteIds(noteFPaths);
  let currentPins = getPins(pinFPaths, pendingPins, true, toRootIds);

  let now = Date.now();
  const pins = [];
  for (const noteId of ids) {
    const noteMainId = getMainId(noteId, toRootIds);
    if (currentPins[noteMainId]) {
      const { rank, addedDT, id } = currentPins[noteMainId];
      pins.push({ rank, updatedDT: now, addedDT, id });

      now += 1;
    }
  }

  if (pins.length === 0) {
    // As for every move note to ARCHIVE and TRASH, will try to unpin the note too,
    //  if no pin to unpin, just return.
    console.log('In unpinNotes, no pin found for ids: ', ids);
    // No need to dispatch(cleanUpPins()); here as no pins change, reduce call sync.
    return;
  }

  const payload = { pins };
  dispatch({ type: UNPIN_NOTE, payload });

  try {
    const params = { pins: pins.map(pin => ({ ...pin, id: `deleted${pin.id}` })) };
    await dataApi.putPins(params);
  } catch (error) {
    console.log('unpinNotes error: ', error);
    dispatch({ type: UNPIN_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: UNPIN_NOTE_COMMIT, payload });
};

export const movePinnedNote = (id, direction) => async (dispatch, getState) => {
  const notes = getState().notes;
  const listName = getState().display.listName;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const noteFPaths = getNoteFPaths(getState());
  const pinFPaths = getPinFPaths(getState());
  const pendingPins = getState().pendingPins;

  const sortedNotes = getSortedNotes(notes, listName, doDescendingOrder);
  if (!sortedNotes) {
    console.log('No notes found for note id: ', id);
    return;
  }

  const { toRootIds } = listNoteIds(noteFPaths);
  let [pinnedValues] = separatePinnedValues(
    sortedNotes,
    pinFPaths,
    pendingPins,
    toRootIds,
    (note) => {
      return getMainId(note.id, toRootIds);
    }
  );

  const i = pinnedValues.findIndex(pinnedValue => pinnedValue.value.id === id);
  if (i < 0) {
    console.log('In movePinnedNote, no pin found for note id: ', id);
    return;
  }

  let nextRank;
  if (direction === SWAP_LEFT) {
    if (i === 0) return;
    if (i === 1) {
      const pRank = pinnedValues[i - 1].pin.rank;

      const lexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`);

      nextRank = lexoRank.genPrev().toString();
    } else {
      const pRank = pinnedValues[i - 1].pin.rank;
      const ppRank = pinnedValues[i - 2].pin.rank;

      const pLexoRank = LexoRank.parse(`0|${pRank.replace('_', ':')}`);
      const ppLexoRank = LexoRank.parse(`0|${ppRank.replace('_', ':')}`);

      nextRank = ppLexoRank.between(pLexoRank).toString();
    }
  } else if (direction === SWAP_RIGHT) {
    if (i === pinnedValues.length - 1) return;
    if (i === pinnedValues.length - 2) {
      const nRank = pinnedValues[i + 1].pin.rank;

      const lexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`);

      nextRank = lexoRank.genNext().toString();
    } else {
      const nRank = pinnedValues[i + 1].pin.rank;
      const nnRank = pinnedValues[i + 2].pin.rank;

      const nLexoRank = LexoRank.parse(`0|${nRank.replace('_', ':')}`);
      const nnLexoRank = LexoRank.parse(`0|${nnRank.replace('_', ':')}`);

      nextRank = nLexoRank.between(nnLexoRank).toString();
    }
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }
  nextRank = nextRank.slice(2).replace(':', '_');

  const now = Date.now();
  const { addedDT } = pinnedValues[i].pin;

  const payload = { rank: nextRank, updatedDT: now, addedDT, id };
  dispatch({ type: MOVE_PINNED_NOTE, payload });

  try {
    await dataApi.putPins({ pins: [payload] });
  } catch (error) {
    console.log('movePinnedNote error: ', error);
    dispatch({ type: MOVE_PINNED_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: MOVE_PINNED_NOTE_COMMIT, payload });
};

export const cancelDiedPins = () => {
  return { type: CANCEL_DIED_PINS };
};

export const cleanUpPins = () => async (dispatch, getState) => {
  const noteFPaths = getNoteFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  const { toRootIds } = listNoteIds(noteFPaths);
  const pins = getRawPins(pinFPaths, toRootIds);

  let unusedPins = [];
  for (const fpath of pinFPaths) {
    const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);

    const _id = id.startsWith('deleted') ? id.slice(7) : id;
    const pinMainId = getMainId(_id, toRootIds);

    if (
      !isString(pinMainId) ||
      !isObject(pins[pinMainId]) ||
      (
        rank !== pins[pinMainId].rank ||
        updatedDT !== pins[pinMainId].updatedDT ||
        addedDT !== pins[pinMainId].addedDT ||
        id !== pins[pinMainId].id
      )
    ) {
      unusedPins.push({ rank, updatedDT, addedDT, id });
    }
  }
  unusedPins = unusedPins.slice(0, N_NOTES);

  if (unusedPins.length > 0) {
    try {
      await dataApi.deletePins({ pins: unusedPins });
    } catch (error) {
      console.log('cleanUpPins error: ', error);
      // error in this step should be fine
    }
  }

  // If add a new pin, no unused pins but need to sync anyway.
  await sync()(dispatch, getState);
};

export const updateLocalSettings = () => async (dispatch, getState) => {
  const localSettings = getState().localSettings;
  await dataApi.putLocalSettings(localSettings);
};

export const updateDoUseLocalTheme = (doUse) => {
  return { type: UPDATE_DO_USE_LOCAL_THEME, payload: doUse };
};

export const updateTheme = (mode, customOptions) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_APPEARANCE));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const doUseLocalTheme = getState().localSettings.doUseLocalTheme;
  const type = doUseLocalTheme ? UPDATE_LOCAL_THEME : UPDATE_DEFAULT_THEME;
  dispatch({ type, payload: { mode, customOptions } });
};

export const updateUpdatingThemeMode = (updatingThemeMode) => async (
  dispatch, getState
) => {
  const doUseLocalTheme = getState().localSettings.doUseLocalTheme;
  const customOptions = doUseLocalTheme ?
    getState().localSettings.themeCustomOptions :
    getState().settings.themeCustomOptions;
  const is24HFormat = getState().window.is24HFormat;

  let option;
  for (const opt of customOptions) {
    if (opt.mode === updatingThemeMode) {
      option = opt;
      break;
    }
  }
  if (!option) return;

  const { hour, minute, period } = getFormattedTime(option.startTime, is24HFormat);
  dispatch({
    type: UPDATE_UPDATING_THEME_MODE,
    payload: { updatingThemeMode, hour, minute, period },
  });
};

export const updateTimePick = (hour, minute, period) => {
  const timeObj = {};
  if (isString(hour) && hour.length > 0) timeObj.hour = hour;
  if (isString(minute) && minute.length > 0) timeObj.minute = minute;
  if (['AM', 'PM'].includes(period)) timeObj.period = period;

  return { type: UPDATE_TIME_PICK, payload: timeObj };
};

export const updateThemeCustomOptions = () => async (dispatch, getState) => {
  const doUseLocalTheme = getState().localSettings.doUseLocalTheme;
  const customOptions = doUseLocalTheme ?
    getState().localSettings.themeCustomOptions :
    getState().settings.themeCustomOptions;

  const { updatingThemeMode, hour, minute, period } = getState().timePick;

  const _themeMode = CUSTOM_MODE, _customOptions = [];

  let updatingOption;
  for (const opt of customOptions) {
    if (opt.mode === updatingThemeMode) updatingOption = opt;
    else _customOptions.push({ ...opt });
  }
  if (!updatingOption) return;

  const newStartTime = get24HFormattedTime(hour, minute, period);
  _customOptions.push({ ...updatingOption, startTime: newStartTime });

  dispatch(updateTheme(_themeMode, _customOptions));
};

export const updateIs24HFormat = (is24HFormat) => {
  return { type: UPDATE_IS_24H_FORMAT, payload: is24HFormat };
};

export const shareNote = () => async (dispatch, getState) => {
  const { listName, selectingNoteId } = getState().display;
  const note = getState().notes[listName][selectingNoteId];

  try {
    await Share.open({
      message: note.title + '\n\n' + stripHtml(note.body, true),
    });
  } catch (error) {
    if (isObject(error)) {
      if (
        isObject(error.error) &&
        isString(error.error.message) &&
        error.error.message.includes('The operation was cancelled')
      ) return;
      if (
        isString(error.message) &&
        error.message.includes('User did not share')
      ) return;
    }

    Alert.alert('Sharing Note Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
  }
};

const replaceImageUrls = async (body) => {
  const sources = [];
  for (const match of body.matchAll(/<img[^>]+?src="([^"]+)"[^>]*>/gi)) {
    const src = match[1];
    if (src.startsWith(CD_ROOT + '/')) sources.push(src);
  }

  for (const src of sources) {
    const content = await fileApi.getFile(src);
    if (isString(content)) {
      const subtype = getMineSubType(src);
      body = body.replace(src, `data:image/${subtype};base64,${content}`);
    }
  }

  return body;
};

export const exportNoteAsPdf = () => async (dispatch, getState) => {
  dispatch(updateExportNoteAsPdfProgress({ total: 1, done: 0 }));
  await sleep(16);

  let name, file;
  try {
    const { listName, selectingNoteId } = getState().display;
    const note = getState().notes[listName][selectingNoteId];
    const body = await replaceImageUrls(note.body);

    let html = `${jhfp}`;
    html = html.replace(/__-title-__/g, note.title);
    html = html.replace(/__-body-__/g, body);
    if (Platform.OS === 'ios') html = html.replace(' mx-12 my-16"', '"');

    name = note.title ? `${note.title}` : 'Justnote\'s note';
    if (name.length > 56) name = name.slice(0, 56);
    name += ` ${getFormattedTimeStamp(new Date())}`;

    const options = { html, fileName: name };
    if (Platform.OS === 'ios') {
      options.paddingLeft = 48;
      options.paddingRight = 48;
      options.paddingTop = 64;
      options.paddingBottom = 64;
      options.bgColor = '#FFFFFF';
    }

    file = await RNHTMLtoPDF.convert(options);
  } catch (error) {
    dispatch(updateExportNoteAsPdfProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  if (Platform.OS === 'ios') {
    try {
      await Share.open({ url: 'file://' + file.filePath });
    } catch (error) {
      let doCancel = false;
      if (isObject(error)) {
        if (
          isObject(error.error) &&
          isString(error.error.message) &&
          error.error.message.includes('The operation was cancelled')
        ) doCancel = true;
        if (
          isString(error.message) &&
          error.message.includes('User did not share')
        ) doCancel = true;
      }
      if (doCancel) {
        dispatch(updateExportNoteAsPdfProgress(null));
        return;
      }

      dispatch(updateExportNoteAsPdfProgress({
        total: -1, done: -1, error: `${error}`,
      }));
      return;
    }

    dispatch(updateExportNoteAsPdfProgress(null));
    return;
  }

  if (Platform.OS === 'android') {
    if (Platform.Version < 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        dispatch(updateExportNoteAsPdfProgress({
          total: -1, done: -1, error: NO_PERMISSION_GRANTED,
        }));
        return;
      }
    }

    const fname = name + '.pdf';
    try {
      await FileSystem.cpExternal(file.filePath, fname, 'downloads');
    } catch (error) {
      dispatch(updateExportNoteAsPdfProgress({
        total: -1, done: -1, error: `${error}`,
      }));
      return;
    }

    dispatch(updateExportNoteAsPdfProgress({ total: 1, done: 1, fname }));
    return;
  }

  console.log('Invalid platform: ', Platform.OS);
  dispatch(updateExportNoteAsPdfProgress(null));
};

export const updateExportNoteAsPdfProgress = (progress) => {
  return { type: UPDATE_EXPORT_NOTE_AS_PDF_PROGRESS, payload: progress };
};
