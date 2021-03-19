import { Linking, Dimensions, Platform } from 'react-native';

import userSession from '../userSession';
import dataApi from '../apis/data';
import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  UPDATE_BULK_EDITING, UPDATE_EDITOR_FOCUSED,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, CLEAR_SELECTED_NOTE_IDS,
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK,
  ADD_NOTE, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK,
  UPDATE_NOTE, UPDATE_NOTE_COMMIT, UPDATE_NOTE_ROLLBACK,
  MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK,
  DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK,
  CANCEL_DIED_NOTES,
  DELETE_OLD_NOTES_IN_TRASH, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_ROLLBACK,
  MERGE_NOTES, MERGE_NOTES_COMMIT, MERGE_NOTES_ROLLBACK,
  ADD_LIST_NAMES, ADD_LIST_NAMES_COMMIT, ADD_LIST_NAMES_ROLLBACK,
  UPDATE_LIST_NAMES, UPDATE_LIST_NAMES_COMMIT, UPDATE_LIST_NAMES_ROLLBACK,
  MOVE_LIST_NAME, MOVE_LIST_NAME_COMMIT, MOVE_LIST_NAME_ROLLBACK,
  DELETE_LIST_NAMES, DELETE_LIST_NAMES_COMMIT, DELETE_LIST_NAMES_ROLLBACK,
  UPDATE_DELETING_LIST_NAME,
  RETRY_ADD_LIST_NAMES, RETRY_UPDATE_LIST_NAMES, RETRY_MOVE_LIST_NAME,
  RETRY_DELETE_LIST_NAMES, CANCEL_DIED_LIST_NAMES,
  UPDATE_EDITOR_CONTENT,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  UPDATE_UPDATE_SETTINGS_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH,
  MY_NOTES, TRASH, ID, NEW_NOTE,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  SWAP_LEFT, SWAP_RIGHT, N_NOTES, LG_WIDTH,
} from '../types/const';
import {
  separateUrlAndParam, getUserImageUrl, randomString, swapArrayElements,
} from '../utils';
import { _ } from '../utils/obj';
import { initialState as initialSettings } from '../reducers/settingsReducer';

export const init = () => async (dispatch, getState) => {

  const hasSession = await userSession.hasSession();
  if (!hasSession) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH
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

  Dimensions.addEventListener("change", ({ window }) => {
    dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.width,
        windowHeight: window.height,
      }
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
    }
  });
};

const handlePendingSignIn = (url) => async (dispatch, getState) => {

  if (!url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH) &&
    !url.startsWith(APP_DOMAIN_NAME + BLOCKSTACK_AUTH)) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true
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
      }
    });
  }

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false
  });
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
      payload: true
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
        }
      });
    }

    // Stop show loading
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: false
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
      payload: true
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
        }
      });
    }

    // Stop show loading
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: false
    });
  } else {
    throw new Error(`Invalid Platform.OS: ${Platform.OS}`);
  }
};

export const signOut = () => async (dispatch, getState) => {

  await userSession.signUserOut();

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const changeListName = (listName) => async (dispatch, getState) => {

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  })

  dispatch(clearSelectedNoteIds());
};

export const updateNoteId = (id) => {
  return {
    type: UPDATE_NOTE_ID,
    payload: id,
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
    type: CLEAR_SELECTED_NOTE_IDS
  };
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

export const addNote = (title, body, media, listName = null) => async (dispatch, getState) => {

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

export const saveNote = () => async (dispatch, getState) => {

  const { noteId, noteTitle, noteBody, noteMedia } = getState().display;
  if (noteId === NEW_NOTE) {
    dispatch(addNote(noteTitle, noteBody, noteMedia));
  } else {
    dispatch(updateNote(noteTitle, noteBody, noteMedia, noteId));
  }
};

const _moveNotes = (toListName, ids, fromListName = null) => async (dispatch, getState) => {

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

export const deleteOldNotesInTrash = (doDeleteOldNotesInTrash) => async (dispatch, getState) => {

  if (doDeleteOldNotesInTrash === null) {
    doDeleteOldNotesInTrash = getState().settings.doDeleteOldNotesInTrash;
  }
  if (!doDeleteOldNotesInTrash) return;

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
  const listName = getState().display.listName;
  const noteId = getState().display.noteId;
  const conflictedNote = getState().conflictedNotes[listName][noteId];

  let toListName, toNote;
  const fromNotes = {};
  for (let i = 0; i < conflictedNote.notes.length; i++) {

    const listName = conflictedNote.listNames[i];
    const note = conflictedNote.notes[i];

    if (note.id === selectedId) {
      toListName = listName;
      toNote = {
        parentIds: conflictedNote.notes.map(note => note.id),
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

  const settings = { ...getState().settings };
  settings.listNameMap = [
    ...settings.listNameMap.map(listNameObj => {
      return { listName: listNameObj.listName, displayName: listNameObj.displayName };
    }),
    ...listNameObjs
  ];

  const payload = { listNameObjs };
  dispatch({ type: ADD_LIST_NAMES, payload });

  try {
    await dataApi.updateSettings(settings);
    dispatch({ type: ADD_LIST_NAMES_COMMIT, payload });
  } catch (e) {
    dispatch({ type: ADD_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
  }
};

export const updateListNames = (listNames, newNames) => async (dispatch, getState) => {

  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.map(listNameObj => {

    const i = listNames.indexOf(listNameObj.listName);
    if (i >= 0) {
      return { listName: listNameObj.listName, displayName: newNames[i] };
    }

    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const payload = { listNames, newNames };
  dispatch({ type: UPDATE_LIST_NAMES, payload });

  try {
    await dataApi.updateSettings(settings);
    dispatch({ type: UPDATE_LIST_NAMES_COMMIT, payload });
  } catch (e) {
    dispatch({ type: UPDATE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
  }
};

export const moveListName = (listName, direction) => async (dispatch, getState) => {

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

  const payload = { listName, direction };
  dispatch({ type: MOVE_LIST_NAME, payload });

  try {
    await dataApi.updateSettings(settings);
    dispatch({ type: MOVE_LIST_NAME_COMMIT, payload });
  } catch (e) {
    dispatch({ type: MOVE_LIST_NAME_ROLLBACK, payload: { ...payload, error: e } });
  }
};

export const deleteListNames = (listNames) => async (dispatch, getState) => {

  const settings = { ...getState().settings };
  settings.listNameMap = settings.listNameMap.filter(listNameObj => {
    return !listNames.includes(listNameObj.listName);
  });
  settings.listNameMap = settings.listNameMap.map(listNameObj => {
    return { listName: listNameObj.listName, displayName: listNameObj.displayName };
  });

  const payload = { listNames };
  dispatch({ type: DELETE_LIST_NAMES, payload });

  try {
    await dataApi.updateSettings(settings);
    dispatch({ type: DELETE_LIST_NAMES_COMMIT, payload });
  } catch (e) {
    dispatch({ type: DELETE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
  }
};

export const updateDeletingListName = (listName) => {
  return {
    type: UPDATE_DELETING_LIST_NAME,
    payload: listName,
  }
};

export const retryDiedListNames = (listNames) => async (dispatch, getState) => {

  const settings = { ...getState().settings };

  const listNameObjs = settings.listNameMap.filter(obj => {
    return listNames.includes(obj.listName)
  });

  settings.listNameMap = [
    ...settings.listNameMap.map(listNameObj => {
      return { listName: listNameObj.listName, displayName: listNameObj.displayName };
    })
  ];

  const diedAddingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_ADDING;
  });
  if (diedAddingListNameObjs.length > 0) {
    const payload = { listNameObjs: diedAddingListNameObjs };
    dispatch({ type: RETRY_ADD_LIST_NAMES, payload });

    try {
      await dataApi.updateSettings(settings);
      dispatch({ type: ADD_LIST_NAMES_COMMIT, payload });
    } catch (e) {
      dispatch({
        type: ADD_LIST_NAMES_ROLLBACK,
        payload: { ...payload, error: e },
      });
    }
  }

  const diedUpdatingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_UPDATING;
  });
  if (diedUpdatingListNameObjs.length > 0) {
    const diedUpdatingListNames = diedUpdatingListNameObjs.map(obj => obj.listName);
    const payload = { listNames: diedUpdatingListNames };
    dispatch({ type: RETRY_UPDATE_LIST_NAMES, payload });

    try {
      await dataApi.updateSettings(settings);
      dispatch({ type: UPDATE_LIST_NAMES_COMMIT, payload });
    } catch (e) {
      dispatch({ type: UPDATE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
    }
  }

  const diedMovingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_MOVING;
  });
  for (const diedMovingListNameObj of diedMovingListNameObjs) {
    const payload = { listName: diedMovingListNameObj.listName };
    dispatch({ type: RETRY_MOVE_LIST_NAME, payload });

    try {
      await dataApi.updateSettings(settings);
      dispatch({ type: MOVE_LIST_NAME_COMMIT, payload });
    } catch (e) {
      dispatch({ type: MOVE_LIST_NAME_ROLLBACK, payload: { ...payload, error: e } });
    }
  }

  const diedDeletingListNameObjs = listNameObjs.filter(obj => {
    return obj.status === DIED_DELETING;
  });
  if (diedDeletingListNameObjs.length > 0) {
    const diedDeletingListNames = diedDeletingListNameObjs.map(obj => obj.listName);
    const payload = { listNames: diedDeletingListNames };
    dispatch({ type: RETRY_DELETE_LIST_NAMES, payload });

    try {
      await dataApi.updateSettings(settings);
      dispatch({ type: DELETE_LIST_NAMES_COMMIT, payload });
    } catch (e) {
      dispatch({ type: DELETE_LIST_NAMES_ROLLBACK, payload: { ...payload, error: e } });
    }
  }
};

export const cancelDiedListNames = (listNames) => {
  return {
    type: CANCEL_DIED_LIST_NAMES,
    payload: { listNames }
  };
};

export const updateEditorContent = (content) => {
  return {
    type: UPDATE_EDITOR_CONTENT,
    payload: content,
  };
};

export const updateSettings = (updatedValues) => async (dispatch, getState) => {

  const rollbackValues = {};
  for (const k of Object.keys(updatedValues)) {
    rollbackValues[k] = getState().settings[k];
  }

  const settings = { ...getState().settings, ...updatedValues };

  const payload = { settings, rollbackValues };
  dispatch({ type: UPDATE_SETTINGS, payload });

  try {
    await dataApi.updateSettings(settings);
    dispatch({ type: UPDATE_SETTINGS_COMMIT, payload });
  } catch (e) {
    dispatch({ type: UPDATE_SETTINGS_ROLLBACK, payload: { ...payload, error: e } });
  }
};

export const updateUpdateSettingsProgress = (progress) => {
  return {
    type: UPDATE_UPDATE_SETTINGS_PROGRESS,
    payload: progress
  };
};

const exportAllDataLoop = async (dispatch, fpaths, doneCount) => {

  if (fpaths.length === 0) throw new Error(`Invalid fpaths: ${fpaths}`);

  const selectedCount = Math.min(fpaths.length - doneCount, N_NOTES);
  const selectedFPaths = fpaths.slice(doneCount, doneCount + selectedCount);
  const responses = await dataApi.batchGetFileWithRetry(selectedFPaths, 0);
  const data = responses.map((response, i) => {
    return { path: selectedFPaths[i], data: JSON.parse(response.content) };
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
        if (fpath.endsWith('index.json')) fpaths.push(fpath);
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
    payload: progress
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
    if (fpaths[i].endsWith('index.json')) contents.push({ title: '', body: '' })
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

  let allNoteIds, settingsFPath;
  try {
    const { noteFPaths, settingsFPath: sFPath } = await dataApi.listFPaths();
    const { noteIds, conflictedIds } = dataApi.listNoteIds(noteFPaths);

    allNoteIds = [...noteIds, ...conflictedIds];
    settingsFPath = sFPath;
  } catch (e) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));
    return;
  }

  const total = allNoteIds.length + (settingsFPath ? 1 : 0);
  dispatch(updateDeleteAllDataProgress({ total, done: 0 }));

  if (total === 0) return;

  try {
    if (allNoteIds.length > 0) await deleteAllDataLoop(dispatch, allNoteIds, total, 0);
    if (settingsFPath) await dataApi.updateSettings(initialSettings);

    dispatch({ type: DELETE_ALL_DATA });
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
    payload: progress
  };
};
