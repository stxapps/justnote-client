import { Linking, Dimensions, Platform } from 'react-native';

import userSession from '../userSession';
import dataApi from '../apis/data';
import serverApi from '../apis/server';
import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  UPDATE_BULK_EDITING, UPDATE_EDITOR_FOCUSED,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, CLEAR_SELECTED_NOTE_IDS,
  UPDATE_PAGE_Y_OFFSET,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  ADD_NOTE, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK,
  UPDATE_NOTE, UPDATE_NOTE_COMMIT, UPDATE_NOTE_ROLLBACK,
  MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK,
  DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK, CANCEL_DIED_NOTES,
  DELETE_OLD_NOTES_IN_TRASH, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_ROLLBACK,
  MERGE_NOTES, MERGE_NOTES_COMMIT, MERGE_NOTES_ROLLBACK,
  ADD_LIST_NAMES, ADD_LIST_NAMES_COMMIT, ADD_LIST_NAMES_ROLLBACK,
  UPDATE_LIST_NAMES, UPDATE_LIST_NAMES_COMMIT, UPDATE_LIST_NAMES_ROLLBACK,
  MOVE_LIST_NAME, MOVE_LIST_NAME_COMMIT, MOVE_LIST_NAME_ROLLBACK,
  DELETE_LIST_NAMES, DELETE_LIST_NAMES_COMMIT, DELETE_LIST_NAMES_ROLLBACK,
  UPDATE_DELETING_LIST_NAME,
  RETRY_ADD_LIST_NAMES, RETRY_UPDATE_LIST_NAMES, RETRY_MOVE_LIST_NAME,
  RETRY_DELETE_LIST_NAMES, CANCEL_DIED_LIST_NAMES, UPDATE_DISCARD_ACTION,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  UPDATE_UPDATE_SETTINGS_PROGRESS, SYNC, SYNC_COMMIT, SYNC_ROLLBACK,
  UPDATE_SYNC_PROGRESS, UPDATE_SYNCED, INCREASE_SAVE_NOTE_COUNT,
  INCREASE_DISCARD_NOTE_COUNT, INCREASE_CONFIRM_DISCARD_NOTE_COUNT,
  INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT, INCREASE_UPDATE_NOTE_ID_COUNT,
  INCREASE_CHANGE_LIST_NAME_COUNT, INCREASE_UPDATE_EDITOR_WIDTH_COUNT,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH, ALERT_SCREEN_ROTATION_POPUP,
  MY_NOTES, TRASH, ID, NEW_NOTE,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  SWAP_LEFT, SWAP_RIGHT, N_NOTES, SETTINGS, INDEX, DOT_JSON, LG_WIDTH, SHOW_SYNCED,
} from '../types/const';
import {
  separateUrlAndParam, getUserImageUrl, randomString, swapArrayElements,
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

  let prevWidth = window.innerWidth;
  Dimensions.addEventListener('change', ({ window }) => {
    handleScreenRotation(prevWidth, window.width)(dispatch, getState);
    prevWidth = window.width;

    dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.width,
        windowHeight: window.height,
      },
    });
  });

  const isUserSignedIn = await userSession.isUserSignedIn();
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
      username,
      userImage,
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
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

const handleScreenRotation = (prevWidth, width) => (dispatch, getState) => {
  if (!getState().settings.doAlertScreenRotation) return;

  const toLg = prevWidth < LG_WIDTH && width >= LG_WIDTH;
  const fromLg = prevWidth >= LG_WIDTH && width < LG_WIDTH;
  if (!toLg && !fromLg) return;

  dispatch(updatePopup(ALERT_SCREEN_ROTATION_POPUP, true, null));
};

export const signUp = () => async (dispatch, getState) => {
  // On Android, signUp and signIn will always lead to handlePendingSignIn.
  // On iOS, signUp and signIn will always return a promise.
  if (Platform.OS === 'android') {
    await userSession.signUp();
  } else if (Platform.OS === 'ios') {

    // As handle pending sign in takes time, show loading first.
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: true,
    });

    try {
      await userSession.signUp();
    } catch (e) {
      // All errors thrown by signIn have the same next steps
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
  } else {
    throw new Error(`Invalid Platform.OS: ${Platform.OS}`);
  }
};

export const signIn = () => async (dispatch, getState) => {

  if (Platform.OS === 'android') {
    await userSession.signIn();
  } else if (Platform.OS === 'ios') {

    // As handle pending sign in takes time, show loading first.
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: true,
    });

    try {
      await userSession.signIn();
    } catch (e) {
      // All errors thrown by signIn have the same next steps
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
  } else {
    throw new Error(`Invalid Platform.OS: ${Platform.OS}`);
  }
};

export const signOut = () => async (dispatch, getState) => {

  await userSession.signUserOut();

  // clear mmkv storage
  await dataApi.deleteAllFiles();

  // clear all user data!
  dispatch({
    type: RESET_STATE,
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

export const updateEditorFocused = (isFocused) => {
  return {
    type: UPDATE_EDITOR_FOCUSED,
    payload: isFocused,
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

export const clearSelectedNoteIds = () => {
  return {
    type: CLEAR_SELECTED_NOTE_IDS,
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

  const payload = { listName, note };
  dispatch({ type: ADD_NOTE, payload });

  try {
    await dataApi.putNotes({ listName, notes: [note] });
    dispatch({ type: ADD_NOTE_COMMIT, payload });
  } catch (e) {
    dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error: e } });
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
  const fromNote = {
    ...note,
    title: '', body: '',
    media: note.media ? note.media.map(m => ({ name: m.name, content: '' })) : null,
  };

  const payload = { listName, fromNote, toNote };
  dispatch({ type: UPDATE_NOTE, payload });

  try {
    await dataApi.putNotes({ listName, notes: [toNote] });
  } catch (e) {
    dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    await dataApi.putNotes({ listName, notes: [fromNote] });
  } catch (e) {
    console.log('updateNote: putNotes with fromNote error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: UPDATE_NOTE_COMMIT, payload });
};

export const saveNote = (title, body, media) => async (dispatch, getState) => {

  const { noteId } = getState().display;
  if (noteId === NEW_NOTE) {
    dispatch(addNote(title, body, media));
  } else {
    dispatch(updateNote(title, body, media, noteId));
  }
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
  const fromNotes = notes.map(note => {
    const fromNote = {
      ...note,
      title: '', body: '',
      media: note.media ? note.media.map(m => ({ name: m.name, content: '' })) : null,
    };
    return fromNote;
  });

  const payload = { fromListName, fromNotes, toListName, toNotes };
  dispatch({ type: MOVE_NOTES, payload });

  try {
    await dataApi.putNotes({ listName: toListName, notes: toNotes });
  } catch (e) {
    dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    await dataApi.putNotes({ listName: fromListName, notes: fromNotes });
  } catch (e) {
    console.log('moveNotes: putNotes with fromNotes error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: MOVE_NOTES_COMMIT, payload });
};

export const moveNotes = (toListName) => async (dispatch, getState) => {

  const { noteId, isBulkEditing, selectedNoteIds } = getState().display;

  dispatch(updateNoteId(null));

  if (isBulkEditing) {
    if (selectedNoteIds.length === 0) return;
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
  const fromNotes = notes.map(note => {
    const fromNote = {
      ...note,
      title: '', body: '',
      media: note.media ? note.media.map(m => ({ name: m.name, content: '' })) : null,
    };
    return fromNote;
  });

  const payload = { listName, ids };
  dispatch({ type: DELETE_NOTES, payload });

  try {
    await dataApi.putNotes({ listName, notes: toNotes });
  } catch (e) {
    dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    await dataApi.putNotes({ listName, notes: fromNotes });
  } catch (e) {
    console.log('deleteNotes: putNotes with fromNotes error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: DELETE_NOTES_COMMIT, payload });
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

  const listName = getState().display.listName;
  for (const id of ids) {
    // DIED_ADDING -> try add this note again
    // DIED_UPDATING -> try update this note again
    // DIED_MOVING -> try move this note again
    // DIED_DELETING  -> try delete this note again
    const note = getState().notes[listName][id];
    const { status } = note;
    if (status === DIED_ADDING) {
      const payload = { listName, note };
      dispatch({ type: ADD_NOTE, payload });

      try {
        await dataApi.putNotes({ listName, notes: [note] });
        dispatch({ type: ADD_NOTE_COMMIT, payload });
      } catch (e) {
        dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }
    } else if (status === DIED_UPDATING) {
      const fromNote = note.fromNote;
      const toNote = note;

      const payload = { listName, fromNote, toNote };
      dispatch({ type: UPDATE_NOTE, payload });

      try {
        await dataApi.putNotes({ listName, notes: [toNote] });
      } catch (e) {
        dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }

      try {
        await dataApi.putNotes({ listName, notes: [fromNote] });
      } catch (e) {
        console.log('updateNote: putNotes with fromNote error: ', e);
        // error in this step should be fine
      }

      dispatch({ type: UPDATE_NOTE_COMMIT, payload });
    } else if (status === DIED_MOVING) {
      const { fromListName, fromNote } = note;
      const [toListName, toNote] = [listName, note];

      const payload = {
        fromListName, fromNotes: [fromNote], toListName, toNotes: [toNote],
      };
      dispatch({ type: MOVE_NOTES, payload });

      try {
        await dataApi.putNotes({ listName: toListName, notes: [toNote] });
      } catch (e) {
        dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }

      try {
        await dataApi.putNotes({ listName: fromListName, notes: [fromNote] });
      } catch (e) {
        console.log('moveNotes: putNotes with fromNote error: ', e);
        // error in this step should be fine
      }

      dispatch({ type: MOVE_NOTES_COMMIT, payload });
    } else if (status === DIED_DELETING) {
      const { fromNote } = note;
      const toNote = note;

      dispatch(updateNoteId(null));

      const payload = { listName, ids: [id] };
      dispatch({ type: DELETE_NOTES, payload });

      try {
        await dataApi.putNotes({ listName, notes: [toNote] });
      } catch (e) {
        dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }

      try {
        await dataApi.putNotes({ listName, notes: [fromNote] });
      } catch (e) {
        console.log('deleteNotes: putNotes with fromNotes error: ', e);
        // error in this step should be fine
      }

      dispatch({ type: DELETE_NOTES_COMMIT, payload });
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

  let addedDT = Date.now();
  const listName = TRASH;

  let oldNotes;
  try {
    ({ notes: oldNotes } = await dataApi.fetchOldNotesInTrash());
  } catch (e) {
    console.log('deleteOldNotesInTrash: fetchOldNotesInTrash error: ', e);
    return;
  }

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
  const fromNotes = oldNotes.map(note => {
    const fromNote = {
      ...note,
      title: '', body: '',
      media: note.media ? note.media.map(m => ({ name: m.name, content: '' })) : null,
    };
    return fromNote;
  });

  const payload = { listName, ids: _.extract(fromNotes, ID) };
  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH, payload });

  try {
    await dataApi.putNotes({ listName, notes: toNotes });
  } catch (e) {
    dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_ROLLBACK, payload });
    return;
  }

  try {
    await dataApi.putNotes({ listName, notes: fromNotes });
  } catch (e) {
    console.log('deleteOldNotesInTrash: putNotes with fromNotes error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_COMMIT, payload });
};

export const mergeNotes = (selectedId) => async (dispatch, getState) => {

  const addedDT = Date.now();
  const noteId = getState().display.noteId;
  const conflictedNote = getState().conflictedNotes[getState().display.listName][noteId];

  let toListName, toNote;
  const fromNotes = {};
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
    fromNotes[listName].push({
      ...note,
      title: '', body: '',
      media: note.media ? note.media.map(m => ({ name: m.name, content: '' })) : null,
    });
  }

  const payload = { conflictedNote, toListName, toNote };
  dispatch({ type: MERGE_NOTES, payload });

  try {
    await dataApi.putNotes({ listName: toListName, notes: [toNote] });
  } catch (e) {
    dispatch({ type: MERGE_NOTES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    for (const [_listName, _notes] of Object.entries(fromNotes)) {
      await dataApi.putNotes({ listName: _listName, notes: _notes });
    }
  } catch (e) {
    console.log('mergeNote: putNotes with fromNotes error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: MERGE_NOTES_COMMIT, payload });
};

export const addListNames = (newNames) => async (dispatch, getState) => {

  let i = 0;
  const addedDT = Date.now();

  const listNameObjs = [];
  for (const newName of newNames) {
    const id = `${addedDT + i}-${randomString(4)}`;
    const listNameObj = { listName: id, displayName: newName };
    listNameObjs.push(listNameObj);

    i += 1;
  }

  const settingsFPath = `${SETTINGS}${addedDT + i}${DOT_JSON}`;
  const settings = { ...getState().settings };
  settings.listNameMap = [
    ...settings.listNameMap.map(listNameObj => {
      return { listName: listNameObj.listName, displayName: listNameObj.displayName };
    }),
    ...listNameObjs,
  ];

  const payload = { settingsFPath, listNameObjs };
  dispatch({ type: ADD_LIST_NAMES, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (e) {
    dispatch({ type: ADD_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    const _settingsFPath = getState().settingsFPath.fpath;
    if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
  } catch (e) {
    console.log('addListNames: deleteFiles with _settingsFPath error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: ADD_LIST_NAMES_COMMIT, payload });
};

export const updateListNames = (listNames, newNames) => async (dispatch, getState) => {

  const addedDT = Date.now();

  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;
  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.map(listNameObj => {
    const i = listNames.indexOf(listNameObj.listName);
    if (i >= 0) {
      return { listName: listNameObj.listName, displayName: newNames[i] };
    }

    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const payload = { settingsFPath, listNames, newNames };
  dispatch({ type: UPDATE_LIST_NAMES, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (e) {
    dispatch({ type: UPDATE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    const _settingsFPath = getState().settingsFPath.fpath;
    if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
  } catch (e) {
    console.log('updateListNames: deleteFiles with _settingsFPath error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: UPDATE_LIST_NAMES_COMMIT, payload });
};

export const moveListName = (listName, direction) => async (dispatch, getState) => {

  const addedDT = Date.now();

  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;
  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.map(listNameObj => {
    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const i = settings.listNameMap.findIndex(listNameObj => {
    return listNameObj.listName === listName;
  });
  if (i < 0) throw new Error(`Invalid listName: ${listName} and listNameMap: ${settings.listNameMap}`);

  if (direction === SWAP_LEFT) {
    settings.listNameMap = swapArrayElements(settings.listNameMap, i - 1, i);
  } else if (direction === SWAP_RIGHT) {
    settings.listNameMap = swapArrayElements(settings.listNameMap, i, i + 1);
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }

  const payload = { settingsFPath, listName, direction };
  dispatch({ type: MOVE_LIST_NAME, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (e) {
    dispatch({ type: MOVE_LIST_NAME_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    const _settingsFPath = getState().settingsFPath.fpath;
    if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
  } catch (e) {
    console.log('moveListName: deleteFiles with _settingsFPath error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: MOVE_LIST_NAME_COMMIT, payload });
};

export const deleteListNames = (listNames) => async (dispatch, getState) => {

  const addedDT = Date.now();

  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;
  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.filter(listNameObj => {
    return !listNames.includes(listNameObj.listName);
  });
  settings.listNameMap = settings.listNameMap.map(listNameObj => {
    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const payload = { settingsFPath, listNames };
  dispatch({ type: DELETE_LIST_NAMES, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (e) {
    dispatch({ type: DELETE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    const _settingsFPath = getState().settingsFPath.fpath;
    if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
  } catch (e) {
    console.log('deleteListNames: deleteFiles with _settingsFPath error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: DELETE_LIST_NAMES_COMMIT, payload });
};

export const updateDeletingListName = (listName) => {
  return {
    type: UPDATE_DELETING_LIST_NAME,
    payload: listName,
  };
};

export const retryDiedListNames = (listNames) => async (dispatch, getState) => {

  const addedDT = Date.now();

  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;
  const settings = { ...getState().settings };

  const listNameObjs = settings.listNameMap.filter(obj => {
    return listNames.includes(obj.listName);
  });

  settings.listNameMap = [
    ...settings.listNameMap.map(listNameObj => {
      return { listName: listNameObj.listName, displayName: listNameObj.displayName };
    }),
  ];

  const diedAddingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_ADDING;
  });
  if (diedAddingListNameObjs.length > 0) {
    const payload = { settingsFPath, listNameObjs: diedAddingListNameObjs };
    dispatch({ type: RETRY_ADD_LIST_NAMES, payload });

    try {
      await dataApi.putFiles([settingsFPath], [settings]);
    } catch (e) {
      dispatch({ type: ADD_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
      return;
    }

    try {
      const _settingsFPath = getState().settingsFPath.fpath;
      if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
    } catch (e) {
      console.log('retryAddListNames: deleteFiles error: ', e);
      // error in this step should be fine
    }

    dispatch({ type: ADD_LIST_NAMES_COMMIT, payload });
  }

  const diedUpdatingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_UPDATING;
  });
  if (diedUpdatingListNameObjs.length > 0) {
    const diedUpdatingListNames = diedUpdatingListNameObjs.map(obj => obj.listName);
    const payload = { settingsFPath, listNames: diedUpdatingListNames };
    dispatch({ type: RETRY_UPDATE_LIST_NAMES, payload });

    try {
      await dataApi.putFiles([settingsFPath], [settings]);
    } catch (e) {
      dispatch({ type: UPDATE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
      return;
    }

    try {
      const _settingsFPath = getState().settingsFPath.fpath;
      if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
    } catch (e) {
      console.log('retryUpdateListNames: deleteFiles error: ', e);
      // error in this step should be fine
    }

    dispatch({ type: UPDATE_LIST_NAMES_COMMIT, payload });
  }

  const diedMovingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_MOVING;
  });
  for (const diedMovingListNameObj of diedMovingListNameObjs) {
    const payload = { settingsFPath, listName: diedMovingListNameObj.listName };
    dispatch({ type: RETRY_MOVE_LIST_NAME, payload });

    try {
      await dataApi.putFiles([settingsFPath], [settings]);
    } catch (e) {
      dispatch({ type: MOVE_LIST_NAME_ROLLBACK, payload: { ...payload, error: e } });
      return;
    }

    try {
      const _settingsFPath = getState().settingsFPath.fpath;
      if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
    } catch (e) {
      console.log('retryMoveListNames: deleteFiles error: ', e);
      // error in this step should be fine
    }

    dispatch({ type: MOVE_LIST_NAME_COMMIT, payload });
  }

  const diedDeletingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_DELETING;
  });
  if (diedDeletingListNameObjs.length > 0) {
    const diedDeletingListNames = diedDeletingListNameObjs.map(obj => obj.listName);
    const payload = { settingsFPath, listNames: diedDeletingListNames };
    dispatch({ type: RETRY_DELETE_LIST_NAMES, payload });

    try {
      await dataApi.putFiles([settingsFPath], [settings]);
    } catch (e) {
      dispatch({ type: DELETE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
      return;
    }

    try {
      const _settingsFPath = getState().settingsFPath.fpath;
      if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
    } catch (e) {
      console.log('retryDeleteListNames: deleteFiles error: ', e);
      // error in this step should be fine
    }

    dispatch({ type: DELETE_LIST_NAMES_COMMIT, payload });
  }
};

export const cancelDiedListNames = (listNames) => {
  return {
    type: CANCEL_DIED_LIST_NAMES,
    payload: { listNames },
  };
};

export const updateDiscardAction = (discardAction) => {
  return {
    type: UPDATE_DISCARD_ACTION,
    payload: discardAction,
  };
};

export const updateSettings = (updatedValues) => async (dispatch, getState) => {

  const addedDT = Date.now();

  const rollbackValues = {};
  for (const k of Object.keys(updatedValues)) {
    rollbackValues[k] = getState().settings[k];
  }

  const settingsFPath = `${SETTINGS}${addedDT}${DOT_JSON}`;
  const settings = { ...getState().settings, ...updatedValues };

  const payload = { settingsFPath, settings, rollbackValues };
  dispatch({ type: UPDATE_SETTINGS, payload });

  try {
    await dataApi.putFiles([settingsFPath], [settings]);
  } catch (e) {
    dispatch({ type: UPDATE_SETTINGS_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  try {
    const _settingsFPath = getState().settingsFPath.fpath;
    if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);
  } catch (e) {
    console.log('updateListNames: deleteFiles with _settingsFPath error: ', e);
    // error in this step should be fine
  }

  dispatch({ type: UPDATE_SETTINGS_COMMIT, payload });
};

export const updateUpdateSettingsProgress = (progress) => {
  return {
    type: UPDATE_UPDATE_SETTINGS_PROGRESS,
    payload: progress,
  };
};

/*
 * updateAction: 0 - normal, update immediately or show notification
 *               1 - force, update immediately no matter what
 *               2 - no update even there is a change
 */
export const sync = (doForceServerListFPaths = false, updateAction = 0) => async (
  dispatch, getState
) => {

  dispatch({ type: SYNC });

  try {
    let haveUpdate = false;

    let { noteFPaths, settingsFPath } = getState().serverFPaths;
    if (doForceServerListFPaths || !noteFPaths) {
      ({ noteFPaths, settingsFPath } = await serverApi.listFPaths());
    }
    const { noteIds, conflictedIds } = dataApi.listNoteIds(noteFPaths);

    const leafFPaths = [];
    for (const noteId of noteIds) leafFPaths.push(...noteId.fpaths);
    for (const conflictedId of conflictedIds) {
      for (const noteId of conflictedId.notes) leafFPaths.push(...noteId.fpaths);
    }

    const {
      noteFPaths: _noteFPaths, settingsFPath: _settingsFPath,
    } = await dataApi.listFPaths();
    const {
      noteIds: _noteIds, conflictedIds: _conflictedIds,
    } = dataApi.listNoteIds(_noteFPaths);

    const _leafFPaths = [];
    for (const noteId of _noteIds) _leafFPaths.push(...noteId.fpaths);
    for (const conflictedId of _conflictedIds) {
      for (const noteId of conflictedId.notes) _leafFPaths.push(...noteId.fpaths);
    }

    const allNoteFPaths = [...new Set([...noteFPaths, ..._noteFPaths])];
    const {
      noteIds: allNoteIds, conflictedIds: allConflictedIds,
    } = dataApi.listNoteIds(allNoteFPaths);

    const allLeafFPaths = [];
    for (const noteId of allNoteIds) allLeafFPaths.push(...noteId.fpaths);
    for (const conflictedId of allConflictedIds) {
      for (const noteId of conflictedId.notes) allLeafFPaths.push(...noteId.fpaths);
    }

    // 1. Server side: upload all fpaths
    let fpaths = [], contents = [];
    for (const fpath of _noteFPaths) {
      if (noteFPaths.includes(fpath)) continue;

      let content;
      if (allLeafFPaths.includes(fpath)) content = (await dataApi.getFiles([fpath]))[0];
      else {
        if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
        else content = '';
      }

      fpaths.push(fpath);
      contents.push(content);
    }
    await serverApi.putFiles(fpaths, contents);

    // 2. Server side: loop used to be leaves in server and set to empty
    fpaths = []; contents = [];
    for (const fpath of leafFPaths) {
      if (allLeafFPaths.includes(fpath)) continue;

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);
    }
    await serverApi.putFiles(fpaths, contents);

    // 3. Local side: download all fpaths
    fpaths = []; contents = [];
    const gFPaths = [];
    for (const fpath of noteFPaths) {
      if (_noteFPaths.includes(fpath)) continue;
      haveUpdate = true;

      if (allLeafFPaths.includes(fpath)) {
        gFPaths.push(fpath);
        continue;
      }

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);
    }
    const gContents = await serverApi.getFiles(gFPaths);
    await dataApi.putFiles([...fpaths, ...gFPaths], [...contents, ...gContents]);

    // 4. Local side: loop used to be leaves in local and set to empty
    fpaths = []; contents = [];
    for (const fpath of _leafFPaths) {
      if (allLeafFPaths.includes(fpath)) continue;

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
      else content = '';

      fpaths.push(fpath);
      contents.push(content);
    }
    await dataApi.putFiles(fpaths, contents);

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
      const content = (await serverApi.getFiles([settingsFPath]))[0];
      await dataApi.putFiles([settingsFPath], [content]);

      // Delete obsolete version in device
      if (_settingsFPath) await dataApi.deleteFiles([_settingsFPath]);

      syncSettingsFPath = settingsFPath;
    } else if (syncSettingsAction === 2) {
      // Upload from device to server
      const content = (await dataApi.getFiles([_settingsFPath]))[0];
      await serverApi.putFiles([_settingsFPath], [content]);

      // Delete obsolete version in server
      if (settingsFPath) await serverApi.deleteFiles([settingsFPath]);

      syncSettingsFPath = _settingsFPath;
    } else throw new Error(`Invalid syncSettingsAction: ${syncSettingsAction}`);

    dispatch({
      type: SYNC_COMMIT,
      payload: {
        serverFPaths: { noteFPaths: allNoteFPaths, settingsFPath: syncSettingsFPath },
        updateAction,
        haveUpdate,
      },
    });
  } catch (e) {
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
  const isPopupShown = (
    getState().display.isProfilePopupShown ||
    getState().display.isNoteListMenuPopupShown ||
    getState().display.isMoveToPopupShown ||
    getState().display.isSidebarPopupShown ||
    getState().display.isSearchPopupShown
  );
  if (pageYOffset === 0 && !isPopupShown) {
    dispatch(updateSynced());
    return;
  }

  dispatch({ type: UPDATE_SYNC_PROGRESS, payload: { status: SHOW_SYNCED } });
};

export const updateSynced = () => async (dispatch, getState) => {
  dispatch({ type: UPDATE_SYNCED });
  dispatch(fetch(false));
};

export const increaseSaveNoteCount = () => {
  return { type: INCREASE_SAVE_NOTE_COUNT };
};

export const increaseDiscardNoteCount = () => {
  return { type: INCREASE_DISCARD_NOTE_COUNT };
};

export const increaseConfirmDiscardNoteCount = () => {
  return { type: INCREASE_CONFIRM_DISCARD_NOTE_COUNT };
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

export const increaseUpdateEditorWidthCount = () => {
  return { type: INCREASE_UPDATE_EDITOR_WIDTH_COUNT };
};

const exportAllDataLoop = async (dispatch, fpaths, doneCount) => {

  if (fpaths.length === 0) throw new Error(`Invalid fpaths: ${fpaths}`);

  const selectedCount = Math.min(fpaths.length - doneCount, N_NOTES);
  const selectedFPaths = fpaths.slice(doneCount, doneCount + selectedCount);
  const responses = await dataApi.batchGetFileWithRetry(selectedFPaths, 0);
  const data = responses.map((response, i) => {
    // Export only index.json and settings.json so safe to not JSON.parse all responses.
    return { path: selectedFPaths[i], data: response.content };
  });

  doneCount = doneCount + selectedCount;
  if (doneCount > fpaths.length) {
    throw new Error(`Invalid doneCount: ${doneCount}, total: ${fpaths.length}`);
  }

  dispatch(updateExportAllDataProgress({ total: fpaths.length, done: doneCount }));

  if (doneCount < fpaths.length) {
    const remainingData = await exportAllDataLoop(dispatch, fpaths, doneCount);
    data.push(...remainingData);
  }

  return data;
};

export const exportAllData = () => async (dispatch, getState) => {

  dispatch(updateExportAllDataProgress({ total: 'calculating...', done: 0 }));

  let fpaths = [];
  try {
    const { noteFPaths, settingsFPath } = await dataApi.listFPaths();
    const { noteIds, conflictedIds } = dataApi.listNoteIds(noteFPaths);

    for (const noteId of [...noteIds, ...conflictedIds]) {
      for (const fpath of noteId.fpaths) {
        if (fpath.endsWith(INDEX + DOT_JSON)) fpaths.push(fpath);
      }
    }
    if (settingsFPath) fpaths.push(settingsFPath);
  } catch (e) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }

  dispatch(updateExportAllDataProgress({ total: fpaths.length, done: 0 }));

  if (fpaths.length === 0) return;

  try {
    const data = await exportAllDataLoop(dispatch, fpaths, 0);

    //var blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
    //saveAs(blob, "justnote-data.txt");
  } catch (e) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }
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
    fromNotes[noteId.listName].push({ ...note });
  }

  for (const [_listName, _notes] of Object.entries(toNotes)) {
    await dataApi.putNotes({ listName: _listName, notes: _notes });
  }

  try {
    for (const [_listName, _notes] of Object.entries(fromNotes)) {
      await dataApi.putNotes({ listName: _listName, notes: _notes });
    }
  } catch (e) {
    console.log('deleteAllDataLoop: putNotes with fromNotes error: ', e);
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

  let allNoteIds, _settingsFPath;
  try {
    const { noteFPaths, settingsFPath: sFPath } = await dataApi.listFPaths();
    const { noteIds, conflictedIds } = dataApi.listNoteIds(noteFPaths);

    allNoteIds = [...noteIds, ...conflictedIds];
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
        console.log('deleteAllData: deleteFiles with _settingsFPath error: ', e);
        // error in this step should be fine
      }
    }

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
