import { Linking, AppState } from 'react-native';

import userSession from '../userSession';
import mmkvStorage from '../mmkvStorage';
import dataApi from '../apis/data';
import serverApi from '../apis/server';
import fileApi from '../apis/file';
import {
  INIT, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  UPDATE_BULK_EDITING, UPDATE_EDITOR_FOCUSED, UPDATE_EDITOR_BUSY,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, UPDATE_PAGE_Y_OFFSET,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  ADD_NOTE, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK,
  UPDATE_NOTE, UPDATE_NOTE_COMMIT, UPDATE_NOTE_ROLLBACK,
  MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK,
  DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK, CANCEL_DIED_NOTES,
  DELETE_OLD_NOTES_IN_TRASH, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_ROLLBACK,
  MERGE_NOTES, MERGE_NOTES_COMMIT, MERGE_NOTES_ROLLBACK, UPDATE_FETCHED_SETTINGS,
  UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES, UPDATE_LIST_NAMES, MOVE_LIST_NAME,
  MOVE_TO_LIST_NAME, DELETE_LIST_NAMES, UPDATE_SELECTING_LIST_NAME,
  UPDATE_DELETING_LIST_NAME, UPDATE_DO_DELETE_OLD_NOTES_IN_TRASH, UPDATE_SORT_ON,
  UPDATE_DO_DESCENDING_ORDER,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  CANCEL_DIED_SETTINGS, UPDATE_DISCARD_ACTION, SYNC, SYNC_COMMIT, SYNC_ROLLBACK,
  UPDATE_SYNC_PROGRESS, UPDATE_SYNCED, INCREASE_SAVE_NOTE_COUNT,
  INCREASE_DISCARD_NOTE_COUNT, INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT,
  INCREASE_UPDATE_NOTE_ID_COUNT, INCREASE_CHANGE_LIST_NAME_COUNT,
  INCREASE_FOCUS_TITLE_COUNT, INCREASE_SET_INIT_DATA_COUNT, INCREASE_BLUR_COUNT,
  INCREASE_UPDATE_EDITOR_WIDTH_COUNT, INCREASE_RESET_DID_CLICK_COUNT,
  CLEAR_SAVING_FPATHS, ADD_SAVING_FPATHS, UPDATE_EDITOR_IS_UPLOADING,
  UPDATE_EDITOR_SCROLL_ENABLED, UPDATE_EDITING_NOTE, UPDATE_EDITOR_UNMOUNT,
  UPDATE_DID_DISCARD_EDITING, UPDATE_STACKS_ACCESS, UPDATE_IMPORT_ALL_DATA_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_URL_SCHEME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH,
  SETTINGS_POPUP, CONFIRM_DISCARD_POPUP,
  DISCARD_ACTION_CANCEL_EDIT, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, DISCARD_ACTION_UPDATE_SYNCED,
  MY_NOTES, TRASH, ID, NEW_NOTE, NEW_NOTE_OBJ,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  N_NOTES, CD_ROOT, IMAGES, SETTINGS, INDEX, DOT_JSON, SHOW_SYNCED,
} from '../types/const';
import {
  isEqual, separateUrlAndParam, getUserImageUrl, randomString,
  isNoteBodyEqual, clearNoteData, getStaticFPath, deriveFPaths,
  getListNameObj, getAllListNames,
} from '../utils';
import { _ } from '../utils/obj';
import { initialSettingsState } from '../types/initialStates';

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
  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      isUserDummy,
      username,
      userImage,
      windowWidth: null,
      windowHeight: null,
    },
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
  } catch (e) {
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

  if (!listName) listName = getState().display.changingListName;
  if (!listName) throw new Error(`Invalid listName: ${listName}`);

  if (doCheckEditing) {
    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) {
      dispatch(increaseChangeListNameCount(listName));
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
};

export const onChangeListName = (title, body, keyboardHeight = 0) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
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
    if (doGetIdFromState) id = getState().display.updatingNoteId;
    if (doCheckEditing) {
      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        dispatch(increaseUpdateNoteIdCount(id));
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

  if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
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

export const updateBulkEdit = (isBulkEditing) => {
  return {
    type: UPDATE_BULK_EDITING,
    payload: isBulkEditing,
  };
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

export const updatePageYOffset = (pageYOffset) => {
  return { type: UPDATE_PAGE_Y_OFFSET, payload: pageYOffset };
};

export const fetch = (
  doDeleteOldNotesInTrash, doFetchSettings = false
) => async (dispatch, getState) => {

  const listName = getState().display.listName;
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  dispatch({ type: FETCH });

  try {
    const params = {
      listName, sortOn, doDescendingOrder, doDeleteOldNotesInTrash, doFetchSettings,
    };
    const fetched = await dataApi.fetch(params);

    dispatch({ type: FETCH_COMMIT, payload: { ...params, ...fetched } });
  } catch (e) {
    dispatch({ type: FETCH_ROLLBACK, payload: e });
  }
};

export const fetchMore = () => async (dispatch, getState) => {

  const listName = getState().display.listName;
  const ids = Object.keys(getState().notes[listName]);
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const payload = { listName };
  dispatch({ type: FETCH_MORE, payload });

  try {
    const params = { listName, ids, sortOn, doDescendingOrder };
    const fetched = await dataApi.fetchMore(params);

    dispatch({ type: FETCH_MORE_COMMIT, payload: { ...params, ...fetched } });
  } catch (e) {
    dispatch({ type: FETCH_MORE_ROLLBACK, payload: { ...payload, error: e } });
  }
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
  } catch (e) {
    dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  dispatch({ type: ADD_NOTE_COMMIT, payload });

  try {
    fileApi.deleteFiles(localUnusedFPaths);
  } catch (e) {
    console.log('addNote error: ', e);
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
  } catch (e) {
    dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  dispatch({ type: UPDATE_NOTE_COMMIT, payload });

  try {
    dataApi.putNotes({ listName, notes: [fromNote] });
    fileApi.deleteFiles(localUnusedFPaths);
  } catch (e) {
    console.log('updateNote error: ', e);
    // error in this step should be fine
  }
};

export const saveNote = (title, body, media) => async (dispatch, getState) => {

  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];
  const isUploading = getState().editor.isUploading;

  if ((title === '' && body === '') || isUploading) {
    dispatch(updateEditorBusy(false));
    setTimeout(() => {
      dispatch(increaseFocusTitleCount());
    }, 1);
    return;
  }

  if (note.title === title && isNoteBodyEqual(note.body, body)) {
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
    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
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
  } catch (e) {
    dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  dispatch({ type: MOVE_NOTES_COMMIT, payload });

  try {
    dataApi.putNotes({ listName: fromListName, notes: fromNotes });
  } catch (e) {
    console.log('moveNotes error: ', e);
    // error in this step should be fine
  }
};

export const moveNotes = (toListName) => async (dispatch, getState) => {

  const { noteId, isBulkEditing, selectedNoteIds } = getState().display;

  dispatch(updateNoteId(null));

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
  } catch (e) {
    dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  dispatch({ type: DELETE_NOTES_COMMIT, payload });

  try {
    dataApi.putNotes({ listName, notes: fromNotes });
    fileApi.deleteFiles(unusedFPaths);
  } catch (e) {
    console.log('deleteNotes error: ', e);
    // error in this step should be fine
  }
};

export const deleteNotes = () => async (dispatch, getState) => {

  const { noteId, isBulkEditing, selectedNoteIds } = getState().display;

  dispatch(updateNoteId(null));

  if (isBulkEditing) {
    if (selectedNoteIds.length === 0) return;
    dispatch(_deleteNotes(selectedNoteIds));
    dispatch(updateBulkEdit(false));
  } else {
    dispatch(_deleteNotes([noteId]));
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
      } catch (e) {
        dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error: e } });
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
      } catch (e) {
        dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }

      dispatch({ type: UPDATE_NOTE_COMMIT, payload });

      try {
        dataApi.putNotes({ listName, notes: [fromNote] });
        fileApi.deleteFiles(localUnusedFPaths);
      } catch (e) {
        console.log('updateNote error: ', e);
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
      } catch (e) {
        dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }

      dispatch({ type: MOVE_NOTES_COMMIT, payload });

      try {
        dataApi.putNotes({ listName: fromListName, notes: [fromNote] });
      } catch (e) {
        console.log('moveNotes error: ', e);
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
      } catch (e) {
        dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }

      dispatch({ type: DELETE_NOTES_COMMIT, payload });

      try {
        dataApi.putNotes({ listName, notes: [fromNote] });
        fileApi.deleteFiles(unusedFPaths);
      } catch (e) {
        console.log('deleteNotes error: ', e);
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

export const deleteOldNotesInTrash = (doDeleteOldNotesInTrash, noteIds) => async (
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

  let addedDT = Date.now();
  const listName = TRASH;

  const oldNotes = dataApi.getOldNotesInTrash(noteIds);
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

  const payload = { listName, ids: _.extract(fromNotes, ID) };
  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH, payload });

  try {
    await dataApi.putNotes({ listName, notes: toNotes });
  } catch (e) {
    dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_ROLLBACK, payload });
    return;
  }

  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_COMMIT, payload });

  try {
    dataApi.putNotes({ listName, notes: fromNotes });
    fileApi.deleteFiles(unusedFPaths);
  } catch (e) {
    console.log('deleteOldNotesInTrash error: ', e);
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
  } catch (e) {
    dispatch({ type: MERGE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
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
  } catch (e) {
    console.log('mergeNote error: ', e);
    // error in this step should be fine
  }
};

export const updateFetchedSettings = () => async (dispatch, getState) => {
  const settings = getState().settings;
  dispatch({ type: UPDATE_FETCHED_SETTINGS, payload: settings });
};

export const updateListNameEditors = (listNameEditors) => {
  return { type: UPDATE_LIST_NAME_EDITORS, payload: listNameEditors };
};

export const updateSettingsPopup = (isShown) => async (dispatch, getState) => {
  /*
    A settings snapshot is made when FETCH_COMMIT and UPDATE_SETTINGS_COMMIT
    For FETCH_COMMIT, use Redux Loop
    For UPDATE_SETTINGS_COMMIT, check action type in snapshotReducer
      as need settings that used to upload to the server, not the current in the state

    Can't make a snapshot when open the popup because
      1. FETCH_COMMIT might be after the popup is open
      2. user might open the popup while settings is being updated or rolled back
  */
  if (!isShown) dispatch(updateSettings());

  dispatch(updatePopup(SETTINGS_POPUP, isShown, null));
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

export const updateSettings = () => async (dispatch, getState) => {

  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;
  if (isEqual(settings, snapshotSettings)) {
    dispatch(cancelDiedSettings());
    return;
  }

  const addedDT = Date.now();
  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;
  const _settingsFPath = getState().settingsFPath.fpath;

  const doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  const payload = { settingsFPath, settings, doFetch };
  dispatch({ type: UPDATE_SETTINGS, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (e) {
    dispatch({ type: UPDATE_SETTINGS_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  dispatch({ type: UPDATE_SETTINGS_COMMIT, payload });

  try {
    if (_settingsFPath) dataApi.deleteFiles([_settingsFPath]);
  } catch (e) {
    console.log('updateSettings error: ', e);
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
  doForceServerListFPaths = false, updateAction = 0, haveUpdate = false
) => async (dispatch, getState) => {

  if (!getState().user.isUserSignedIn) return;

  if (_isSyncing) {
    _newSyncObj = { doForceServerListFPaths, updateAction };
    return;
  }
  [_isSyncing, _newSyncObj] = [true, null];

  // Set haveUpdate to true if there is already pending update
  //   Need to check before dispatching SYNC
  const syncProgress = getState().display.syncProgress;
  if (syncProgress && syncProgress.status === SHOW_SYNCED) haveUpdate = true;

  dispatch({ type: SYNC });

  try {
    let { noteFPaths, staticFPaths, settingsFPath } = getState().serverFPaths;
    if (doForceServerListFPaths || !noteFPaths) {
      ({ noteFPaths, staticFPaths, settingsFPath } = await serverApi.listFPaths());
    }
    const { noteIds, conflictedIds } = dataApi.listNoteIds(noteFPaths);

    const leafFPaths = [];
    for (const noteId of noteIds) leafFPaths.push(...noteId.fpaths);
    for (const noteId of conflictedIds) leafFPaths.push(...noteId.fpaths);

    const {
      noteFPaths: _noteFPaths,
      staticFPaths: _staticFPaths,
      settingsFPath: _settingsFPath,
    } = await dataApi.listFPaths();
    const {
      noteIds: _noteIds, conflictedIds: _conflictedIds,
    } = dataApi.listNoteIds(_noteFPaths);

    const _leafFPaths = [];
    for (const noteId of _noteIds) _leafFPaths.push(...noteId.fpaths);
    for (const noteId of _conflictedIds) _leafFPaths.push(...noteId.fpaths);

    const allNoteFPaths = [...new Set([...noteFPaths, ..._noteFPaths])];
    const {
      noteIds: allNoteIds, conflictedIds: allConflictedIds,
    } = dataApi.listNoteIds(allNoteFPaths);

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

    let syncSettingsFPath;
    if (syncSettingsAction === 0) syncSettingsFPath = _settingsFPath;
    else if (syncSettingsAction === 1) {
      // Download from server to device

      // No order guarantee but this is just one file
      const content = (await serverApi.getFiles([settingsFPath])).contents[0];
      await dataApi.putFiles([settingsFPath], [content]);

      // Delete obsolete version in device
      if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);

      syncSettingsFPath = settingsFPath;
      haveUpdate = true;
    } else if (syncSettingsAction === 2) {
      // Upload from device to server

      // No order guarantee but this is just one file
      const content = (await dataApi.getFiles([_settingsFPath])).contents[0];
      await serverApi.putFiles([_settingsFPath], [content]);

      // Delete obsolete version in server
      if (settingsFPath) await serverApi.deleteFiles([settingsFPath]);

      syncSettingsFPath = _settingsFPath;
    } else throw new Error(`Invalid syncSettingsAction: ${syncSettingsAction}`);

    dispatch({
      type: SYNC_COMMIT,
      payload: {
        serverFPaths: {
          noteFPaths: allNoteFPaths,
          staticFPaths: allLeafStaticFPaths,
          settingsFPath: syncSettingsFPath,
        },
        updateAction,
        haveUpdate,
        haveNewSync: _newSyncObj !== null,
      },
    });

    if (_newSyncObj) {
      let _doForce = /** @type boolean */(_newSyncObj.doForceServerListFPaths);
      if (doForceServerListFPaths) _doForce = false;

      /** @ts-ignore */
      const _updateAction = Math.min(updateAction, _newSyncObj.updateAction);

      [_isSyncing, _newSyncObj] = [false, null];
      dispatch(sync(_doForce, _updateAction, haveUpdate));
      return;
    }

    [_isSyncing, _newSyncObj, _lastSyncDT] = [false, null, Date.now()];
  } catch (e) {
    console.log('Sync error: ', e);
    [_isSyncing, _newSyncObj] = [false, null];
    dispatch({ type: SYNC_ROLLBACK });
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

  const pageYOffset = getState().window.pageYOffset;
  const noteId = getState().display.noteId;
  const isPopupShown = (
    getState().display.isProfilePopupShown ||
    getState().display.isNoteListMenuPopupShown ||
    getState().display.isMoveToPopupShown ||
    getState().display.isSidebarPopupShown ||
    getState().display.isSearchPopupShown ||
    getState().display.isSettingsPopupShown ||
    getState().display.isConfirmDeletePopupShown ||
    getState().display.isConfirmDiscardPopupShown
  );
  const isBulkEditing = getState().display.isBulkEditing;
  const isEditorFocused = getState().display.isEditorFocused;
  const isEditorBusy = getState().display.isEditorBusy;
  if (
    pageYOffset === 0 && noteId === null && !isPopupShown &&
    !isBulkEditing && !isEditorFocused && !isEditorBusy
  ) {
    dispatch(updateSynced());
    return;
  }

  dispatch({ type: UPDATE_SYNC_PROGRESS, payload: { status: SHOW_SYNCED } });
};

export const updateSynced = (doCheckEditing = false) => async (dispatch, getState) => {
  const isEditorFocused = getState().display.isEditorFocused;
  if (doCheckEditing && isEditorFocused) {
    dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_SYNCED));
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true));
    return;
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

export const updateDiscardAction = (discardAction) => {
  return {
    type: UPDATE_DISCARD_ACTION,
    payload: discardAction,
  };
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

export const clearSavingFPaths = () => async (dispatch, getState) => {
  const savingFPaths = getState().editor.savingFPaths;
  try {
    await fileApi.deleteFiles(savingFPaths);
  } catch (e) {
    console.log('clearSavingFiles error: ', e);
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

const deleteAllDataLoop = async (dispatch, noteIds, total, doneCount) => {

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
  } catch (e) {
    console.log('deleteAllDataLoop error: ', e);
    // error in this step should be fine
  }

  doneCount = doneCount + selectedCount;
  if (doneCount > noteIds.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${noteIds.length}`);
  }

  dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));

  if (doneCount < noteIds.length) {
    await deleteAllDataLoop(dispatch, noteIds, total, doneCount);
  }
};

export const deleteAllData = () => async (dispatch, getState) => {

  dispatch(updateDeleteAllDataProgress({ total: 'calculating...', done: 0 }));

  // Need to manually call it to wait for it properly!
  await sync(true, 2)(dispatch, getState);

  const addedDT = Date.now();
  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;

  let allNoteIds, _staticFPaths, _settingsFPath;
  try {
    const {
      noteFPaths, staticFPaths, settingsFPath: sFPath,
    } = await dataApi.listFPaths();
    const { noteIds, conflictedIds } = dataApi.listNoteIds(noteFPaths);

    allNoteIds = [...noteIds, ...conflictedIds];
    _staticFPaths = staticFPaths;
    _settingsFPath = sFPath;
  } catch (e) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }

  const total = allNoteIds.length + (_settingsFPath ? 1 : 0);
  dispatch(updateDeleteAllDataProgress({ total, done: 0 }));

  if (total === 0) return;

  try {
    if (allNoteIds.length > 0) await deleteAllDataLoop(dispatch, allNoteIds, total, 0);
    if (_settingsFPath) {
      await dataApi.putFiles([settingsFPath], [{ ...initialSettingsState }]);
      try {
        await dataApi.deleteFiles([_settingsFPath]);
      } catch (e) {
        console.log('deleteAllData error: ', e);
        // error in this step should be fine
      }
    }
    await fileApi.deleteFiles(_staticFPaths);

    dispatch({ type: DELETE_ALL_DATA, payload: { settingsFPath } });
  } catch (e) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
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
