import {
  Linking, AppState, Platform, Appearance, Share, Alert, PermissionsAndroid,
} from 'react-native';
import * as RNIap from 'react-native-iap';
import { LexoRank } from '@wewatch/lexorank';
import { is24HourFormat } from 'react-native-device-time-format';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { FileSystem } from 'react-native-file-access';

import userSession from '../userSession';
import mmkvStorage from '../mmkvStorage';
import axios from '../axiosWrapper';
import dataApi from '../apis/data';
import serverApi from '../apis/server';
import fileApi from '../apis/file';
import {
  INIT, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  UPDATE_BULK_EDITING, UPDATE_EDITOR_FOCUSED, UPDATE_EDITOR_BUSY,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, UPDATE_SELECTING_NOTE_ID,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, FETCH_MORE, FETCH_MORE_COMMIT,
  FETCH_MORE_ROLLBACK, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, CANCEL_FETCHED_MORE,
  ADD_NOTE, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK, UPDATE_NOTE, UPDATE_NOTE_COMMIT,
  UPDATE_NOTE_ROLLBACK, MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK,
  DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK, CANCEL_DIED_NOTES,
  DELETE_OLD_NOTES_IN_TRASH, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_ROLLBACK, MERGE_NOTES, MERGE_NOTES_COMMIT,
  MERGE_NOTES_ROLLBACK, UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES, UPDATE_LIST_NAMES,
  MOVE_LIST_NAME, MOVE_TO_LIST_NAME, DELETE_LIST_NAMES, UPDATE_SELECTING_LIST_NAME,
  UPDATE_DELETING_LIST_NAME, UPDATE_DO_DELETE_OLD_NOTES_IN_TRASH, UPDATE_SORT_ON,
  UPDATE_DO_DESCENDING_ORDER, UPDATE_NOTE_DATE_SHOWING_MODE, UPDATE_SETTINGS,
  UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS,
  UPDATE_SETTINGS_VIEW_ID, UPDATE_MOVE_ACTION, UPDATE_DELETE_ACTION,
  UPDATE_DISCARD_ACTION, UPDATE_LIST_NAMES_MODE, SYNC, SYNC_COMMIT, SYNC_ROLLBACK,
  UPDATE_SYNC_PROGRESS, UPDATE_SYNCED, INCREASE_SAVE_NOTE_COUNT,
  INCREASE_DISCARD_NOTE_COUNT, INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT,
  INCREASE_UPDATE_NOTE_ID_COUNT, INCREASE_CHANGE_LIST_NAME_COUNT,
  INCREASE_FOCUS_TITLE_COUNT, INCREASE_SET_INIT_DATA_COUNT, INCREASE_BLUR_COUNT,
  INCREASE_UPDATE_EDITOR_WIDTH_COUNT, INCREASE_RESET_DID_CLICK_COUNT,
  INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT, INCREASE_UPDATE_BULK_EDIT_COUNT,
  INCREASE_SHOW_NOTE_LIST_MENU_POPUP_COUNT, INCREASE_SHOW_NLIM_POPUP_COUNT,
  CLEAR_SAVING_FPATHS, ADD_SAVING_FPATHS,
  UPDATE_EDITOR_IS_UPLOADING, UPDATE_EDITOR_SCROLL_ENABLED, UPDATE_EDITING_NOTE,
  UPDATE_EDITOR_UNMOUNT, UPDATE_DID_DISCARD_EDITING, UPDATE_STACKS_ACCESS,
  GET_PRODUCTS, GET_PRODUCTS_COMMIT, GET_PRODUCTS_ROLLBACK,
  REQUEST_PURCHASE, REQUEST_PURCHASE_COMMIT, REQUEST_PURCHASE_ROLLBACK,
  RESTORE_PURCHASES, RESTORE_PURCHASES_COMMIT, RESTORE_PURCHASES_ROLLBACK,
  REFRESH_PURCHASES, REFRESH_PURCHASES_COMMIT,
  REFRESH_PURCHASES_ROLLBACK, UPDATE_IAP_PUBLIC_KEY, UPDATE_IAP_PRODUCT_STATUS,
  UPDATE_IAP_PURCHASE_STATUS, UPDATE_IAP_RESTORE_STATUS, UPDATE_IAP_REFRESH_STATUS,
  PIN_NOTE, PIN_NOTE_COMMIT, PIN_NOTE_ROLLBACK, UNPIN_NOTE, UNPIN_NOTE_COMMIT,
  UNPIN_NOTE_ROLLBACK, MOVE_PINNED_NOTE, MOVE_PINNED_NOTE_COMMIT,
  MOVE_PINNED_NOTE_ROLLBACK, CANCEL_DIED_PINS, UPDATE_SYSTEM_THEME_MODE,
  UPDATE_THEME, UPDATE_UPDATING_THEME_MODE, UPDATE_TIME_PICK, UPDATE_IS_24H_FORMAT,
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH,
  PAYWALL_POPUP, SETTINGS_POPUP,
  CONFIRM_DISCARD_POPUP, NOTE_LIST_MENU_POPUP, NOTE_LIST_ITEM_MENU_POPUP,
  MOVE_ACTION_NOTE_COMMANDS, MOVE_ACTION_NOTE_ITEM_MENU, DELETE_ACTION_NOTE_COMMANDS,
  DELETE_ACTION_NOTE_ITEM_MENU, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_NOTE_ID, DISCARD_ACTION_CHANGE_LIST_NAME,
  DISCARD_ACTION_UPDATE_SYNCED, DISCARD_ACTION_UPDATE_BULK_EDIT,
  DISCARD_ACTION_SHOW_NOTE_LIST_MENU_POPUP, DISCARD_ACTION_SHOW_NLIM_POPUP,
  MY_NOTES, TRASH, ID, NEW_NOTE, NEW_NOTE_OBJ,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING, N_NOTES,
  N_DAYS, CD_ROOT, IMAGES, SETTINGS, INDEX, DOT_JSON, SHOW_SYNCED,
  IAP_VERIFY_URL, IAP_STATUS_URL, APPSTORE, PLAYSTORE, COM_JUSTNOTECC,
  COM_JUSTNOTECC_SUPPORTER, SIGNED_TEST_STRING, VALID, INVALID, UNKNOWN, ERROR, ACTIVE,
  SWAP_LEFT, SWAP_RIGHT, SETTINGS_VIEW_ACCOUNT, SETTINGS_VIEW_LISTS,
  WHT_MODE, BLK_MODE, CUSTOM_MODE, FEATURE_PIN, FEATURE_APPEARANCE,
} from '../types/const';
import {
  isEqual, isObject, isString, sleep, separateUrlAndParam,
  getUserImageUrl, randomString, stripHtml, isNoteBodyEqual,
  clearNoteData, getStaticFPath, deriveFPaths, getListNameObj, getAllListNames,
  getMainId, listNoteIds, getNoteFPaths, getSettingsFPath, getLatestPurchase,
  getValidPurchase, doEnableExtraFeatures, extractPinFPath, getPinFPaths, getPins,
  getSortedNotes, separatePinnedValues, getRawPins, getFormattedTime,
  get24HFormattedTime, getFormattedTimeStamp,
} from '../utils';
import { _ } from '../utils/obj';
import { initialSettingsState } from '../types/initialStates';
import vars from '../vars';

const jhfp = require('../../jhfp');

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
        const interval = (Date.now() - _lastSyncDT) / 1000 / 60 / 60;
        dispatch(sync(interval > 1, 0));
      }
    }
  });

  const isUserSignedIn = await userSession.isUserSignedIn();
  const isUserDummy = await mmkvStorage.isUserDummy();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }

  const darkMatches = Appearance.getColorScheme() === 'dark';
  const is24HFormat = await is24HourFormat();
  const localSettings = await dataApi.getLocalSettings();

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
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
      localSettings,
    },
  });

  Appearance.addChangeListener((e) => {
    const systemThemeMode = e.colorScheme === 'dark' ? BLK_MODE : WHT_MODE;
    dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });
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
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    dispatch({
      type: UPDATE_USER,
      payload: {
        isUserSignedIn: true,
        username: userData.username,
        image: getUserImageUrl(userData),
      },
    });
  }

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
};

export const signOut = () => async (dispatch, getState) => {

  await userSession.signUserOut();

  // clear mmkv storage
  await dataApi.deleteAllFiles();

  // clear file storage
  await fileApi.deleteAllFiles(IMAGES);

  // clear cached fpaths
  vars.cachedFPaths.fpaths = null;
  vars.cachedServerFPaths.fpaths = null;

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const updateUserData = (data) => async (dispatch, getState) => {
  await userSession.updateUserData(data);

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    dispatch({
      type: UPDATE_USER,
      payload: {
        isUserSignedIn: true,
        username: userData.username,
        image: getUserImageUrl(userData),
      },
    });
  }
};

export const updateUserDummy = (isUserDummy) => async (dispatch, getState) => {
  await mmkvStorage.updateUserDummy(isUserDummy);
  dispatch({
    type: UPDATE_USER,
    payload: { isUserDummy: isUserDummy },
  });
};

export const changeListName = (listName, doCheckEditing) => async (
  dispatch, getState
) => {

  const _listName = getState().display.listName;

  if (!listName) listName = vars.changeListName.changingListName;
  if (!listName) throw new Error(`Invalid listName: ${listName}`);

  if (doCheckEditing) {
    if (vars.updateSettings.doFetch) return;

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

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  });

  if (!(syncProgress && syncProgress.status === SHOW_SYNCED)) {
    await updateFetchedMore(null, _listName)(dispatch, getState);
  }
};

export const onChangeListName = (title, body, keyboardHeight = 0) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note && (note.title !== title || !isNoteBodyEqual(note.body, body))) {
    if (keyboardHeight > 0) dispatch(increaseBlurCount());
    dispatch(updateDiscardAction(DISCARD_ACTION_CHANGE_LIST_NAME));
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
    return;
  }

  dispatch(changeListName(null, false));
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
      if (vars.updateSettings.doFetch) return;
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

export const onUpdateNoteId = (title, body, keyboardHeight = 0) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note && (note.title !== title || !isNoteBodyEqual(note.body, body))) {
    if (keyboardHeight > 0) dispatch(increaseBlurCount());
    dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID));
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
    return;
  }

  dispatch(updateNoteId(null, true, false));
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

export const onUpdateBulkEdit = (title, body, keyboardHeight = 0) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note && (note.title !== title || !isNoteBodyEqual(note.body, body))) {
    if (keyboardHeight > 0) dispatch(increaseBlurCount());
    dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_BULK_EDIT));
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
    return;
  }

  dispatch(updateBulkEdit(true, null, true, false));
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

export const fetch = (
  doDeleteOldNotesInTrash, doFetchSettings = false
) => async (dispatch, getState) => {

  const listName = getState().display.listName;
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;
  const pendingPins = getState().pendingPins;

  dispatch({ type: FETCH });

  try {
    const params = {
      listName, sortOn, doDescendingOrder, doDeleteOldNotesInTrash, doFetchSettings,
      pendingPins,
    };
    const fetched = await dataApi.fetch(params);

    dispatch({ type: FETCH_COMMIT, payload: { ...params, ...fetched } });
  } catch (error) {
    console.log('fetch error: ', error);
    dispatch({ type: FETCH_ROLLBACK, payload: error });
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

  const savingFPaths = getState().editor.savingFPaths;
  const { localUnusedFPaths } = deriveFPaths(media, null, savingFPaths);

  const payload = { listName, note };
  dispatch({ type: ADD_NOTE, payload });

  try {
    await dataApi.putNotes({ listName, notes: [note] });
  } catch (error) {
    console.log('addNote error: ', error);
    dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: ADD_NOTE_COMMIT, payload });

  try {
    fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('addNote clean up error: ', error);
    // error in this step should be fine
  }
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

  const savingFPaths = getState().editor.savingFPaths;
  const { localUnusedFPaths } = deriveFPaths(media, note.media, savingFPaths);

  const payload = { listName, fromNote: note, toNote };
  dispatch({ type: UPDATE_NOTE, payload });

  try {
    await dataApi.putNotes({ listName, notes: [toNote] });
  } catch (error) {
    console.log('updateNote error: ', error);
    dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: UPDATE_NOTE_COMMIT, payload });

  try {
    dataApi.putNotes({ listName, notes: [fromNote] });
    fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('updateNote clean up error: ', error);
    // error in this step should be fine
  }
};

export const saveNote = (title, body, media) => async (dispatch, getState) => {

  if (title === '' && body === '') {
    dispatch(increaseFocusTitleCount());
    return;
  }

  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note && (note.title === title && isNoteBodyEqual(note.body, body))) {
    dispatch(updateEditorBusy(false));
    return;
  }

  if (noteId === NEW_NOTE) dispatch(addNote(title, body, media));
  else dispatch(updateNote(title, body, media, noteId));
};

export const discardNote = (
  doCheckEditing, title = null, body = null, keyboardHeight = 0
) => async (dispatch, getState) => {

  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (doCheckEditing) {
    if (note && (note.title !== title || !isNoteBodyEqual(note.body, body))) {
      if (keyboardHeight > 0) dispatch(increaseBlurCount());
      dispatch(updateDiscardAction(DISCARD_ACTION_CANCEL_EDIT));
      dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
      return;
    }
  }

  dispatch(updateEditorFocused(false));
  dispatch(increaseSetInitDataCount());
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
  const fromNotes = notes.map(note => clearNoteData(note));

  const payload = { fromListName, fromNotes: notes, toListName, toNotes };
  dispatch({ type: MOVE_NOTES, payload });

  try {
    await dataApi.putNotes({ listName: toListName, notes: toNotes });
  } catch (error) {
    console.log('moveNotes error: ', error);
    dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: MOVE_NOTES_COMMIT, payload });

  try {
    dataApi.putNotes({ listName: fromListName, notes: fromNotes });
  } catch (error) {
    console.log('moveNotes clean up error: ', error);
    // error in this step should be fine
  }
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
    dispatch(updateNoteId(null));
  }

  if (moveAction === MOVE_ACTION_NOTE_COMMANDS) {
    if (isBulkEditing) {
      if (selectedNoteIds.length === 0) {
        dispatch(increaseResetDidClickCount());
        return;
      }
      dispatch(_moveNotes(toListName, selectedNoteIds));
      dispatch(updateBulkEdit(false));
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
  const fromNotes = notes.map(note => clearNoteData(note));

  const unusedFPaths = [];
  for (const note of notes) {
    for (const { name } of note.media) {
      if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
    }
  }

  const payload = { listName, ids };
  dispatch({ type: DELETE_NOTES, payload });

  try {
    await dataApi.putNotes({ listName, notes: toNotes });
  } catch (error) {
    console.log('deleteNotes error: ', error);
    dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: DELETE_NOTES_COMMIT, payload });

  try {
    dataApi.putNotes({ listName, notes: fromNotes });
    fileApi.deleteFiles(unusedFPaths);
  } catch (error) {
    console.log('deleteNotes clean up error: ', error);
    // error in this step should be fine
  }
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
    dispatch(updateNoteId(null));
  }

  if (deleteAction === DELETE_ACTION_NOTE_COMMANDS) {
    if (isBulkEditing) {
      if (selectedNoteIds.length === 0) return;
      dispatch(_deleteNotes(selectedNoteIds));
      dispatch(updateBulkEdit(false));
    } else {
      dispatch(_deleteNotes([noteId]));
    }
  } else if (deleteAction === DELETE_ACTION_NOTE_ITEM_MENU) {
    dispatch(_deleteNotes([selectingNoteId]));
    dispatch(updatePopup(NOTE_LIST_ITEM_MENU_POPUP, false));
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
      // Don't delete files in savingFPaths as they might not for this note.

      const payload = { listName, note };
      dispatch({ type: ADD_NOTE, payload });

      try {
        await dataApi.putNotes({ listName, notes: [note] });
      } catch (error) {
        console.log('retryDiedNotes add error: ', error);
        dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: ADD_NOTE_COMMIT, payload });
    } else if (status === DIED_UPDATING) {
      const toNote = note;
      const fromNote = clearNoteData(note.fromNote);

      const {
        localUnusedFPaths,
      } = deriveFPaths(toNote.media, note.fromNote.media, null);

      const payload = { listName, fromNote: note.fromNote, toNote };
      dispatch({ type: UPDATE_NOTE, payload });

      try {
        await dataApi.putNotes({ listName, notes: [toNote] });
      } catch (error) {
        console.log('retryDiedNotes update error: ', error);
        dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: UPDATE_NOTE_COMMIT, payload });

      try {
        dataApi.putNotes({ listName, notes: [fromNote] });
        fileApi.deleteFiles(localUnusedFPaths);
      } catch (error) {
        console.log('retryDiedNotes update clean up error: ', error);
        // error in this step should be fine
      }
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

      dispatch({ type: MOVE_NOTES_COMMIT, payload });

      try {
        dataApi.putNotes({ listName: fromListName, notes: [fromNote] });
      } catch (error) {
        console.log('retryDiedNotes move clean up error: ', error);
        // error in this step should be fine
      }
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

      dispatch(updateNoteId(null));

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
        dataApi.putNotes({ listName, notes: [fromNote] });
        fileApi.deleteFiles(unusedFPaths);
      } catch (error) {
        console.log('retryDiedNotes delete clean up error: ', error);
        // error in this step should be fine
      }
    } else {
      throw new Error(`Invalid status: ${status} of id: ${id}`);
    }
  }
};

export const cancelDiedNotes = (ids, listName = null) => async (dispatch, getState) => {

  if (!listName) listName = getState().display.listName;

  const payload = { listName, ids };
  dispatch({
    type: CANCEL_DIED_NOTES,
    payload,
  });
};

export const deleteOldNotesInTrash = (doDeleteOldNotesInTrash) => async (
  dispatch, getState
) => {

  // If null, it's a first call fetch,
  //   deleteOldNotesInTrash based on settings and always call sync.
  // If false, it's a subsequence fetch call, no deleteOldNotesInTrash and no sync.
  if (doDeleteOldNotesInTrash === false) return;
  if (doDeleteOldNotesInTrash === null) {
    doDeleteOldNotesInTrash = getState().settings.doDeleteOldNotesInTrash;
  } else throw new Error(`Invalid doDeleteOldNotesInTrash: ${doDeleteOldNotesInTrash}`);

  if (!doDeleteOldNotesInTrash) {
    dispatch(sync());
    return;
  }

  const oldNotes = await dataApi.getOldNotesInTrash();
  const oldNoteIds = oldNotes.map(note => note.id);
  if (oldNoteIds.includes(getState().display.noteId)) {
    dispatch(sync());
    return;
  }

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
    dataApi.putNotes({ listName, notes: fromNotes });
    fileApi.deleteFiles(unusedFPaths);
  } catch (error) {
    console.log('deleteOldNotesInTrash clean up error: ', error);
    // error in this step should be fine
  }
};

export const mergeNotes = (selectedId) => async (dispatch, getState) => {

  const addedDT = Date.now();
  const noteId = getState().display.noteId;
  const conflictedNote = getState().conflictedNotes[getState().display.listName][noteId];

  let toListName, toNote;
  const fromNotes = {}, noteMedia = [];
  for (let i = 0; i < conflictedNote.notes.length; i++) {

    const listName = conflictedNote.listNames[i];
    const note = conflictedNote.notes[i];

    if (note.id === selectedId) {
      toListName = listName;
      toNote = {
        parentIds: conflictedNote.notes.map(n => n.id),
        id: `${addedDT}${randomString(4)}`,
        title: note.title, body: note.body, media: note.media,
        updatedDT: addedDT,
      };
    }

    if (!fromNotes[listName]) fromNotes[listName] = [];
    fromNotes[listName].push(clearNoteData(note));

    noteMedia.push(...note.media);
  }

  const { localUnusedFPaths } = deriveFPaths(toNote.media, noteMedia, null);

  const payload = { conflictedNote, toListName, toNote };
  dispatch({ type: MERGE_NOTES, payload });

  try {
    await dataApi.putNotes({ listName: toListName, notes: [toNote] });
  } catch (error) {
    console.log('mergeNote error: ', error);
    dispatch({ type: MERGE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  toNote['addedDT'] = Math.min(...conflictedNote.notes.map(note => {
    return note.addedDT ? note.addedDT : addedDT;
  }));

  dispatch({ type: MERGE_NOTES_COMMIT, payload: { ...payload, toNote } });

  try {
    for (const [_listName, _notes] of Object.entries(fromNotes)) {
      dataApi.putNotes({ listName: _listName, notes: _notes });
    }
    fileApi.deleteFiles(localUnusedFPaths);
  } catch (error) {
    console.log('mergeNote clean up error: ', error);
    // error in this step should be fine
  }
};

export const showNoteListMenuPopup = (rect, doCheckEditing, doReinitEditor) => async (
  dispatch, getState
) => {

  const _noteId = getState().display.noteId;

  if (!rect) rect = vars.showNoteListMenuPopup.selectedRect;

  if (doCheckEditing) {
    if (vars.updateSettings.doFetch) return;

    const isEditorUploading = getState().editor.isUploading;
    if (isEditorUploading) return;

    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) {
      vars.showNoteListMenuPopup.selectedRect = rect;
      dispatch(increaseShowNoteListMenuPopupCount());
      return;
    }
  }

  if (doReinitEditor) {
    dispatch(updateEditorFocused(false));

    // No need updateNoteIdUrlHash here as shouldn't be possible
    //   to show the popup while editing in NavPanel.
    if (_noteId === NEW_NOTE) dispatch(updateNoteId(null));
    else dispatch(increaseSetInitDataCount());
  }

  dispatch(updatePopup(NOTE_LIST_MENU_POPUP, true, rect));
};

export const onShowNoteListMenuPopup = (title, body, keyboardHeight = 0) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note && (note.title !== title || !isNoteBodyEqual(note.body, body))) {
    if (keyboardHeight > 0) dispatch(increaseBlurCount());
    dispatch(updateDiscardAction(DISCARD_ACTION_SHOW_NOTE_LIST_MENU_POPUP));
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
    return;
  }

  dispatch(showNoteListMenuPopup(null, false, true));
};

export const showNLIMPopup = (noteId, rect, doCheckEditing, doReinitEditor) => async (
  dispatch, getState
) => {

  const _noteId = getState().display.noteId;

  if (!noteId) noteId = vars.showNLIMPopup.selectedNoteId;
  if (!rect) rect = vars.showNLIMPopup.selectedRect;

  if (doCheckEditing && noteId === _noteId) {
    if (vars.updateSettings.doFetch) return;

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

  if (doReinitEditor) {
    dispatch(updateEditorFocused(false));
    dispatch(increaseSetInitDataCount());
  }

  dispatch(updateSelectingNoteId(noteId));
  dispatch(updatePopup(NOTE_LIST_ITEM_MENU_POPUP, true, rect));
};

export const onShowNLIMPopup = (title, body, keyboardHeight = 0) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note && (note.title !== title || !isNoteBodyEqual(note.body, body))) {
    if (keyboardHeight > 0) dispatch(increaseBlurCount());
    dispatch(updateDiscardAction(DISCARD_ACTION_SHOW_NLIM_POPUP));
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
    return;
  }

  dispatch(showNLIMPopup(null, null, false, true));
};

export const updateSettingsPopup = (isShown) => async (dispatch, getState) => {
  /*
    A settings snapshot is made when FETCH_COMMIT and UPDATE_SETTINGS_COMMIT
    For FETCH_COMMIT and UPDATE_SETTINGS_COMMIT, check action type in snapshotReducer
      as need settings that used to upload to the server, not the current in the state

    Can't make a snapshot when open the popup because
      1. FETCH_COMMIT might be after the popup is open
      2. user might open the popup while settings is being updated or rolled back
  */
  if (!isShown) dispatch(updateSettings());

  dispatch(updatePopup(SETTINGS_POPUP, isShown, null));
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

export const tryUpdateSettings = () => async (dispatch, getState) => {
  const isSettingsPopupShown = getState().display.isSettingsPopupShown;
  if (isSettingsPopupShown) return;

  dispatch(updateSettings());
};

export const updateSettings = () => async (dispatch, getState) => {
  const state = getState();
  const settings = state.settings;
  const snapshotSettings = state.snapshot.settings;
  if (isEqual(settings, snapshotSettings)) {
    dispatch(cancelDiedSettings());
    return;
  }

  const addedDT = Date.now();
  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;
  const _settingsFPath = getSettingsFPath(state);

  const doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  const payload = { settingsFPath, settings, doFetch };

  vars.updateSettings.doFetch = doFetch;
  dispatch({ type: UPDATE_SETTINGS, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (error) {
    console.log('updateSettings error: ', error);
    dispatch({ type: UPDATE_SETTINGS_ROLLBACK, payload: { ...payload, error } });
    vars.updateSettings.doFetch = false;
    return;
  }

  dispatch({ type: UPDATE_SETTINGS_COMMIT, payload });
  vars.updateSettings.doFetch = false;

  try {
    if (_settingsFPath) dataApi.deleteFiles([_settingsFPath]);
  } catch (error) {
    console.log('updateSettings clean up error: ', error);
    // error in this step should be fine
  }
};

export const retryDiedSettings = () => async (dispatch, getState) => {
  dispatch(updateSettings());
};

export const cancelDiedSettings = () => async (dispatch, getState) => {
  const { settings } = getState().snapshot;
  const payload = { settings };
  dispatch({
    type: CANCEL_DIED_SETTINGS,
    payload: payload,
  });
};

/*
 * _isSyncing: one sync at a time
 * _newSyncObj: there is a new update and need to sync again
 *
 * updateAction: 0 - normal, update immediately or show notification
 *               1 - force, update immediately no matter what
 *               2 - no update even there is a change
 */
let _isSyncing = false, _newSyncObj = /** @type Object */(null), _lastSyncDT = 0;
export const sync = (
  doForceListFPaths = false, updateAction = 0, haveUpdate = false
) => async (dispatch, getState) => {

  if (!getState().user.isUserSignedIn) return;

  if (_isSyncing) {
    _newSyncObj = { doForceListFPaths, updateAction };
    return;
  }
  [_isSyncing, _newSyncObj] = [true, null];

  // Set haveUpdate to true if there is already pending update
  //   Need to check before dispatching SYNC
  const syncProgress = getState().display.syncProgress;
  if (syncProgress && syncProgress.status === SHOW_SYNCED) haveUpdate = true;

  dispatch({ type: SYNC });

  try {
    const {
      noteFPaths, staticFPaths, settingsFPath, pinFPaths,
    } = await serverApi.listFPaths(doForceListFPaths);
    const { noteIds, conflictedIds } = listNoteIds(noteFPaths);

    const leafFPaths = [];
    for (const noteId of noteIds) leafFPaths.push(...noteId.fpaths);
    for (const noteId of conflictedIds) leafFPaths.push(...noteId.fpaths);

    const {
      noteFPaths: _noteFPaths,
      staticFPaths: _staticFPaths,
      settingsFPath: _settingsFPath,
      pinFPaths: _pinFPaths,
    } = await dataApi.listFPaths(doForceListFPaths);
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

      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          allLeafStaticFPaths.includes(staticFPath) &&
          !staticFPaths.includes(staticFPath)
        ) {
          fpaths.push('file://' + staticFPath);
          contents.push('');
        }
      }
    }
    await serverApi.putFiles(fpaths, contents);

    // 2. Server side: loop used to be leaves in server and set to empty
    fpaths = []; contents = [];
    let deletedFPaths = [];
    for (const fpath of leafFPaths) {
      if (allLeafFPaths.includes(fpath)) continue;

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);

      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          !allLeafStaticFPaths.includes(staticFPath) &&
          staticFPaths.includes(staticFPath)
        ) {
          deletedFPaths.push(staticFPath);
        }
      }
    }
    await serverApi.putFiles(fpaths, contents);
    await serverApi.deleteFiles(deletedFPaths);

    // 3. Local side: download all fpaths
    fpaths = []; contents = [];
    const _gFPaths = [], gStaticFPaths = [];
    for (const fpath of noteFPaths) {
      if (_noteFPaths.includes(fpath)) continue;
      haveUpdate = true;

      if (allLeafFPaths.includes(fpath)) {
        _gFPaths.push(fpath);

        if (fpath.includes(CD_ROOT + '/')) {
          const staticFPath = getStaticFPath(fpath);
          if (
            allLeafStaticFPaths.includes(staticFPath) &&
            !_staticFPaths.includes(staticFPath)
          ) {
            gStaticFPaths.push('file://' + staticFPath);
          }
        }

        continue;
      }

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);
    }
    // No order guarantee btw _gFPaths and gContents
    const { fpaths: gFPaths, contents: gContents } = await serverApi.getFiles(_gFPaths);
    await serverApi.getFiles(gStaticFPaths, true);
    await dataApi.putFiles([...fpaths, ...gFPaths], [...contents, ...gContents]);

    // 4. Local side: loop used to be leaves in local and set to empty
    fpaths = []; contents = []; deletedFPaths = [];
    for (const fpath of _leafFPaths) {
      if (allLeafFPaths.includes(fpath)) continue;

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);

      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          !allLeafStaticFPaths.includes(staticFPath) &&
          _staticFPaths.includes(staticFPath)
        ) {
          deletedFPaths.push(staticFPath);
        }
      }
    }
    await dataApi.putFiles(fpaths, contents);
    await fileApi.deleteFiles(deletedFPaths);

    // Settings
    //   action: 0 - no settings or already the same,
    //           1 - download from server to device,
    //           2 - upload from device to server
    let syncSettingsAction;
    if (settingsFPath && _settingsFPath) {
      const dt = parseInt(
        settingsFPath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10
      );
      const _dt = parseInt(
        _settingsFPath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10
      );

      if (dt > _dt) syncSettingsAction = 1;
      else if (dt < _dt) syncSettingsAction = 2;
      else syncSettingsAction = 0;
    } else if (settingsFPath) syncSettingsAction = 1;
    else if (_settingsFPath) syncSettingsAction = 2;
    else syncSettingsAction = 0;

    if (syncSettingsAction === 0) { /* Do nothing */ }
    else if (syncSettingsAction === 1) {
      // Download from server to device

      // No order guarantee but this is just one file
      const content = (await serverApi.getFiles([settingsFPath])).contents[0];
      await dataApi.putFiles([settingsFPath], [content]);

      // Delete obsolete version in device
      if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);

      haveUpdate = true;
    } else if (syncSettingsAction === 2) {
      // Upload from device to server

      // No order guarantee but this is just one file
      const content = (await dataApi.getFiles([_settingsFPath])).contents[0];
      await serverApi.putFiles([_settingsFPath], [content]);

      // Delete obsolete version in server
      if (settingsFPath) await serverApi.deleteFiles([settingsFPath]);
    } else throw new Error(`Invalid syncSettingsAction: ${syncSettingsAction}`);

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

    // 4. Local side: delete obsolete pinFpaths
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
        haveNewSync: _newSyncObj !== null,
      },
    });

    if (_newSyncObj) {
      let _doForce = /** @type boolean */(_newSyncObj.doForceListFPaths);
      if (doForceListFPaths) _doForce = false;

      /** @ts-ignore */
      const _updateAction = Math.min(updateAction, _newSyncObj.updateAction);

      [_isSyncing, _newSyncObj] = [false, null];
      dispatch(sync(_doForce, _updateAction, haveUpdate));
      return;
    }

    [_isSyncing, _newSyncObj, _lastSyncDT] = [false, null, Date.now()];
  } catch (error) {
    console.log('Sync error: ', error);
    [_isSyncing, _newSyncObj] = [false, null];
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

  if (!haveUpdate) return;

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

export const updateSynced = (doCheckEditing = false) => async (dispatch, getState) => {
  if (doCheckEditing) {
    const isEditorUploading = getState().editor.isUploading;
    if (isEditorUploading) return;

    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) {
      dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_SYNCED));
      dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
      return;
    }
  }

  dispatch({ type: UPDATE_SYNCED });
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

export const clearSavingFPaths = () => async (dispatch, getState) => {
  const savingFPaths = getState().editor.savingFPaths;
  try {
    await fileApi.deleteFiles(savingFPaths);
  } catch (error) {
    console.log('clearSavingFiles error: ', error);
    // error in this step should be fine
  }
  dispatch({ type: CLEAR_SAVING_FPATHS });
};

export const addSavingFPaths = (fpaths) => {
  return { type: ADD_SAVING_FPATHS, payload: fpaths };
};

export const updateEditorIsUploading = (isUploading) => {
  return { type: UPDATE_EDITOR_IS_UPLOADING, payload: isUploading };
};

export const updateEditorScrollEnabled = (enabled) => {
  return { type: UPDATE_EDITOR_SCROLL_ENABLED, payload: enabled };
};

export const updateEditingNote = (title, body, media) => async (dispatch, getState) => {
  const id = getState().display.noteId;
  dispatch({
    type: UPDATE_EDITING_NOTE,
    payload: { id, title, body, media },
  });
};

export const updateEditorUnmount = (didUnmount) => {
  return { type: UPDATE_EDITOR_UNMOUNT, payload: didUnmount };
};

export const updateDidDiscardEditing = (didDiscardEditing) => {
  return { type: UPDATE_DID_DISCARD_EDITING, payload: didDiscardEditing };
};

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

export const importAllData = () => async (dispatch, getState) => {
  // Do nothing on mobile. This is for web.
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

export const exportAllData = () => async (dispatch, getState) => {
  // Do nothing on mobile. This is for web.
};

export const updateExportAllDataProgress = (progress) => {
  return {
    type: UPDATE_EXPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const deleteAllNotes = async (dispatch, noteIds, total, doneCount) => {

  if (noteIds.length === 0) throw new Error(`Invalid noteIds: ${noteIds}`);

  const selectedCount = Math.min(noteIds.length - doneCount, N_NOTES);
  const selectedNoteIds = noteIds.slice(doneCount, doneCount + selectedCount);

  const fpaths = [];
  for (const id of selectedNoteIds) fpaths.push(...id.fpaths);

  const contents = [];
  for (let i = 0; i < fpaths.length; i++) {
    if (fpaths[i].endsWith(INDEX + DOT_JSON)) contents.push({ title: '', body: '' });
    else contents.push('');
  }

  const selectedNotes = dataApi.toNotes(selectedNoteIds, fpaths, contents);

  let addedDT = Date.now();
  const toNotes = {}, fromNotes = {};
  for (let i = 0; i < selectedNoteIds.length; i++) {
    const noteId = selectedNoteIds[i];
    const note = selectedNotes[i];

    if (!toNotes[noteId.listName]) toNotes[noteId.listName] = [];
    toNotes[noteId.listName].push({
      ...note,
      parentIds: [note.id],
      id: `deleted${addedDT}${randomString(4)}`,
      title: '', body: '', media: [],
      updatedDT: addedDT,
    });
    addedDT += 1;

    if (!fromNotes[noteId.listName]) fromNotes[noteId.listName] = [];
    fromNotes[noteId.listName].push(clearNoteData(note));
  }

  for (const [_listName, _notes] of Object.entries(toNotes)) {
    await dataApi.putNotes({ listName: _listName, notes: _notes });
  }

  try {
    for (const [_listName, _notes] of Object.entries(fromNotes)) {
      await dataApi.putNotes({ listName: _listName, notes: _notes });
    }
  } catch (error) {
    console.log('deleteAllNotes error: ', error);
    // error in this step should be fine
  }

  doneCount = doneCount + selectedCount;
  if (doneCount > noteIds.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${noteIds.length}`);
  }

  dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));

  if (doneCount < noteIds.length) {
    await deleteAllNotes(dispatch, noteIds, total, doneCount);
  }
};

export const deleteAllPins = async (dispatch, pins, total, doneCount) => {

  let now = Date.now();
  for (let i = 0; i < pins.length; i += N_NOTES) {
    const _pins = pins.slice(i, i + N_NOTES);

    const toPins = [], fromPins = [];
    for (const { rank, updatedDT, addedDT, id } of _pins) {
      toPins.push({ rank, updatedDT: now, addedDT, id: `deleted${id}` });
      fromPins.push({ rank, updatedDT, addedDT, id });

      now += 1;
    }

    await dataApi.putPins({ pins: toPins });

    try {
      dataApi.deletePins({ pins: fromPins });
    } catch (error) {
      console.log('deleteAllPins error: ', error);
      // error in this step should be fine
    }

    doneCount = doneCount + toPins.length;
    dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
  }
};

export const deleteAllData = () => async (dispatch, getState) => {

  dispatch(updateDeleteAllDataProgress({ total: 'calculating...', done: 0 }));

  // Need to manually call it to wait for it properly!
  await sync(true, 2)(dispatch, getState);

  let allNoteIds, staticFPaths, settingsFPath, pins;
  try {
    const fpaths = await dataApi.listFPaths(true);
    const noteIds = listNoteIds(fpaths.noteFPaths);

    allNoteIds = [...noteIds.noteIds, ...noteIds.conflictedIds];
    staticFPaths = fpaths.staticFPaths;
    settingsFPath = fpaths.settingsFPath;

    pins = getPins(fpaths.pinFPaths, {}, false, noteIds.toRootIds);
    pins = Object.values(pins);
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  if (settingsFPath) {
    const { contents } = await dataApi.getFiles([settingsFPath], true);
    if (isEqual(initialSettingsState, contents[0])) settingsFPath = null;
  }

  const total = (
    allNoteIds.length + staticFPaths.length + (settingsFPath ? 1 : 0) + pins.length
  );
  dispatch(updateDeleteAllDataProgress({ total, done: 0 }));

  if (total === 0) return;

  try {
    if (allNoteIds.length > 0) {
      await deleteAllNotes(dispatch, allNoteIds, total, 0);
    }
    if (settingsFPath) {
      const addedDT = Date.now();
      const newSettingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;

      await dataApi.putFiles([newSettingsFPath], [{ ...initialSettingsState }]);
      try {
        await dataApi.deleteFiles([settingsFPath]);
      } catch (error) {
        console.log('deleteAllData error: ', error);
        // error in this step should be fine
      }

      dispatch(updateDeleteAllDataProgress({
        total, done: allNoteIds.length + staticFPaths.length + 1,
      }));
    }
    if (pins.length > 0) {
      await deleteAllPins(
        dispatch, pins, total, allNoteIds.length + staticFPaths.length + 1
      );
    }
    await fileApi.deleteFiles(staticFPaths);

    dispatch({ type: DELETE_ALL_DATA });
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }
};

export const updateDeleteAllDataProgress = (progress) => {
  return {
    type: UPDATE_DELETE_ALL_DATA_PROGRESS,
    payload: progress,
  };
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
      await RNIap.finishTransaction(rawPurchase, false);
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

    const rawPurchases = await RNIap.getAvailablePurchases();
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

let iapUpdatedEventEmitter = null, iapErrorEventEmitter = null;
const registerIapListeners = (doRegister, dispatch, getState) => {
  if (doRegister) {
    if (!iapUpdatedEventEmitter) {
      iapUpdatedEventEmitter = RNIap.purchaseUpdatedListener(
        iapUpdatedListener(dispatch, getState)
      );
    }
    if (!iapErrorEventEmitter) {
      iapErrorEventEmitter = RNIap.purchaseErrorListener(
        iapErrorListener(dispatch, getState)
      );
    }
  } else {
    if (iapUpdatedEventEmitter) {
      iapUpdatedEventEmitter.remove();
      iapUpdatedEventEmitter = null;
    }
    if (iapErrorEventEmitter) {
      iapErrorEventEmitter.remove();
      iapErrorEventEmitter = null;
    }
  }
};

let didGetProducts = false;
export const endIapConnection = (isInit = false) => async (dispatch, getState) => {
  registerIapListeners(false, dispatch, getState);
  try {
    await RNIap.endConnection();
  } catch (error) {
    console.log('Error when end IAP connection: ', error);
  }

  if (!isInit) {
    didGetProducts = false;
    dispatch(updateIapProductStatus(null, null, null));
  }
};

export const initIapConnectionAndGetProducts = (doForce) => async (
  dispatch, getState
) => {
  if (didGetProducts && !doForce) return;
  didGetProducts = true;
  dispatch({ type: GET_PRODUCTS });

  if (doForce) await endIapConnection(true)(dispatch, getState);

  try {
    const canMakePayments = await RNIap.initConnection();
    registerIapListeners(true, dispatch, getState);

    let products = null;
    if (canMakePayments) {
      products = await RNIap.getSubscriptions([COM_JUSTNOTECC_SUPPORTER]);
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
    await RNIap.requestSubscription(product.productId);
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
  const { purchases, checkPurchasesDT } = getState().settings;

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
  dispatch({ type: REQUEST_PURCHASE });

  const rawPurchase = getState().iap.rawPurchase;
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
  const state = getState();
  const purchases = state.settings.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    vars.paywallFeature.feature = FEATURE_PIN;
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const noteFPaths = getNoteFPaths(state);
  const pinFPaths = getPinFPaths(state);
  const pendingPins = state.pendingPins;

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
  const state = getState();
  const noteFPaths = getNoteFPaths(state);
  const pinFPaths = getPinFPaths(state);
  const pendingPins = state.pendingPins;

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
    dispatch(cleanUpPins());
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
  const state = getState();
  const notes = state.notes;
  const listName = state.display.listName;
  const doDescendingOrder = state.settings.doDescendingOrder;
  const noteFPaths = getNoteFPaths(state);
  const pinFPaths = getPinFPaths(state);
  const pendingPins = state.pendingPins;

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
  const state = getState();
  const noteFPaths = getNoteFPaths(state);
  const pinFPaths = getPinFPaths(state);

  const { toRootIds } = listNoteIds(noteFPaths);
  const pins = getRawPins(pinFPaths, toRootIds);

  const unusedPins = [];
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

  try {
    dataApi.deletePins({ pins: unusedPins });
  } catch (error) {
    console.log('cleanUpPins error: ', error);
    // error in this step should be fine
  }

  dispatch(sync());
};

export const updateLocalSettings = () => async (dispatch, getState) => {
  const localSettings = getState().localSettings;
  await dataApi.putLocalSettings(localSettings);
};

export const updateTheme = (mode, customOptions) => async (dispatch, getState) => {
  const state = getState();
  const purchases = state.settings.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    vars.paywallFeature.feature = FEATURE_APPEARANCE;
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  dispatch({ type: UPDATE_THEME, payload: { mode, customOptions } });
};

export const updateUpdatingThemeMode = (updatingThemeMode) => async (
  dispatch, getState
) => {
  const state = getState();
  const customOptions = state.localSettings.themeCustomOptions;
  const is24HFormat = state.window.is24HFormat;

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
  const state = getState();
  const customOptions = state.localSettings.themeCustomOptions;
  const { updatingThemeMode, hour, minute, period } = state.timePick;

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
    const result = await Share.share({
      message: note.title + '\n\n' + stripHtml(note.body, true),
    });
    if (result.action === Share.sharedAction) {
      let msg = 'shareNote shared'
      if (result.activityType) msg += ` with activity type: ${result.activityType}`;
      console.log(msg);
    } else if (result.action === Share.dismissedAction) {
      console.log('shareNote dismissed.');
    }
  } catch (error) {
    Alert.alert('Sharing Note Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
  }
};

export const exportNoteAsPdf = () => async (dispatch, getState) => {
  const { listName, selectingNoteId } = getState().display;
  const note = getState().notes[listName][selectingNoteId];

  let html = `${jhfp}`;
  html = html.replace(/__-title-__/g, note.title ? note.title : '');
  html = html.replace(/__-body-__/g, note.body ? note.body : '');

  let name = note.title ? `${note.title}` : 'Justnote\'s note';
  name += ` ${getFormattedTimeStamp(new Date())}`;

  const options = { html, fileName: name };
  const file = await RNHTMLtoPDF.convert(options)

  if (Platform.OS === 'ios') {
    try {
      const result = await Share.share({ url: 'file://' + file.filePath });
      if (result.action === Share.sharedAction) {
        let msg = 'exportNoteAsPdf shared'
        if (result.activityType) msg += ` with activity type: ${result.activityType}`;
        console.log(msg);
      } else if (result.action === Share.dismissedAction) {
        console.log('exportNoteAsPdf dismissed.');
      }
    } catch (error) {
      Alert.alert('Exporting Note Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    }
    return;
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Write external storage permission denied");
      return;
    }

    try {
      const fname = name + '.pdf';
      await FileSystem.cpExternal(file.filePath, fname, 'downloads');
      Alert.alert(
        'Export completed',
        `The exported PDF file - ${fname} - has been saved in Downloads.`,
      );
    } catch (error) {
      Alert.alert('Exporting Note Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    }
    return;
  }

  console.log('Invalid platform: ', Platform.OS);
};
