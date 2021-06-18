import { showConnect, authenticate } from '@stacks/connect';
import Url from 'url-parse';
import { saveAs } from 'file-saver';

import userSession from '../userSession';
import dataApi from '../apis/data';
import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  UPDATE_BULK_EDITING, UPDATE_EDITOR_FOCUSED,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, UPDATE_PAGE_Y_OFFSET,
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
  UPDATE_UPDATE_SETTINGS_PROGRESS, INCREASE_SAVE_NOTE_COUNT,
  INCREASE_DISCARD_NOTE_COUNT, INCREASE_CONFIRM_DISCARD_NOTE_COUNT,
  INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT, INCREASE_UPDATE_NOTE_ID_COUNT,
  INCREASE_CHANGE_LIST_NAME_COUNT, INCREASE_UPDATE_EDITOR_WIDTH_COUNT,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  APP_NAME, APP_ICON_NAME, SEARCH_POPUP, SETTINGS_POPUP,
  CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP, ALERT_SCREEN_ROTATION_POPUP,
  MY_NOTES, TRASH, ID, NEW_NOTE,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  SWAP_LEFT, SWAP_RIGHT, N_NOTES, SETTINGS, INDEX, DOT_JSON, LG_WIDTH,
} from '../types/const';
import {
  throttle, getUserImageUrl,
  extractUrl, separateUrlAndParam, getUrlPathQueryHash, urlHashToObj, objToUrlHash,
  randomString, swapArrayElements, isIPadIPhoneIPod, isBusyStatus,
} from '../utils';
import { _ } from '../utils/obj';
import { initialSettingsState } from '../types/initialStates';

export const init = () => async (dispatch, getState) => {

  await handlePendingSignIn()(dispatch, getState);

  const isUserSignedIn = userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }

  handleUrlHash();

  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    },
  });

  // Let hash get updated first before add an listener
  setTimeout(() => {
    window.addEventListener('hashchange', function (e) {
      onUrlHashChange(e.oldURL, e.newURL, dispatch, getState);
    });
  }, 1);

  let prevWidth = window.innerWidth;
  if (isIPadIPhoneIPod()) {
    // @ts-ignore
    window.visualViewport.addEventListener('resize', throttle(() => {
      handleScreenRotation(prevWidth)(dispatch, getState);
      prevWidth = window.innerWidth;

      dispatch({
        type: UPDATE_WINDOW_SIZE,
        payload: {
          windowWidth: window.innerWidth,
          // @ts-ignore
          windowHeight: window.visualViewport.height,
        },
      });
    }, 16));
  } else {
    window.addEventListener('resize', throttle(() => {
      handleScreenRotation(prevWidth)(dispatch, getState);
      prevWidth = window.innerWidth;

      dispatch({
        type: UPDATE_WINDOW_SIZE,
        payload: {
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        },
      });
    }, 16));
  }

  window.addEventListener('beforeunload', (e) => {
    const notes = getState().notes;
    for (const listName in notes) {
      for (const noteId in notes[listName]) {
        if (isBusyStatus(notes[listName][noteId].status)) {
          e.preventDefault();
          return e.returnValue = 'It looks like your note hasn\'t been saved. Do you want to leave this site and discard your changes?';
        }
      }
    }

    const conflictedNotes = getState().conflictedNotes;
    for (const listName in conflictedNotes) {
      for (const noteId in conflictedNotes[listName]) {
        if (isBusyStatus(conflictedNotes[listName][noteId].status)) {
          e.preventDefault();
          return e.returnValue = 'It looks like your selection on conflicted notes hasn\'t been saved. Do you want to leave this site and discard your changes?';
        }
      }
    }

    const updateSettingsProgress = getState().display.updateSettingsProgress;
    if (updateSettingsProgress && isBusyStatus(updateSettingsProgress.status)) {
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the settings hasn\'t been saved. Do you want to leave this site and discard your changes?';
    }
  }, { capture: true });
};

const handlePendingSignIn = () => async (dispatch, getState) => {

  const { pathname } = extractUrl(window.location.href);
  if (!(pathname === '/' && userSession.isSignInPending())) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true,
  });

  try {
    await userSession.handlePendingSignIn();
  } catch (e) {
    console.log(`Catched an error thrown by handlePendingSignIn: ${e.message}`);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const { separatedUrl } = separateUrlAndParam(window.location.href, 'authResponse');
  window.history.replaceState(window.history.state, '', separatedUrl);

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false,
  });
};

const handleScreenRotation = (prevWidth) => (dispatch, getState) => {
  if (!getState().user.isUserSignedIn) return;
  if (!getState().settings.doAlertScreenRotation) return;

  const toLg = prevWidth < LG_WIDTH && window.innerWidth >= LG_WIDTH;
  const fromLg = prevWidth >= LG_WIDTH && window.innerWidth < LG_WIDTH;
  if (!toLg && !fromLg) return;

  dispatch(updatePopup(ALERT_SCREEN_ROTATION_POPUP, true, null));
  if (fromLg) {
    const noteId = getState().display.noteId;
    if (noteId) {
      dispatch(updateNoteId(null));
      setTimeout(() => updateNoteIdUrlHash(noteId), 100);
    }
  }
};

export const signUp = () => async (dispatch, getState) => {

  const authOptions = {
    redirectTo: '/' + getUrlPathQueryHash(window.location.href),
    appDetails: {
      name: APP_NAME,
      icon: extractUrl(window.location.href).origin + '/' + APP_ICON_NAME,
    },
    onFinish: ({ userSession }) => {

      const userData = userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        },
      });
    },
    sendToSignIn: false,
    userSession: /** @type any */(userSession),
  };

  showConnect(authOptions);
};

export const signIn = () => async (dispatch, getState) => {

  const authOptions = {
    redirectTo: '/' + getUrlPathQueryHash(window.location.href),
    appDetails: {
      name: APP_NAME,
      icon: extractUrl(window.location.href).origin + '/' + APP_ICON_NAME,
    },
    finished: ({ userSession }) => {

      const userData = userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        },
      });
    },
    sendToSignIn: true,
    userSession: /** @type any */(userSession),
  };

  authenticate(authOptions);
};

export const signOut = () => async (dispatch, getState) => {

  userSession.signUserOut();

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const handleUrlHash = () => {
  const urlObj = new Url(window.location.href, {});
  if (urlObj.hash !== '') {
    urlObj.set('hash', '');
    window.location.replace(urlObj.toString());
  }
};

export const onUrlHashChange = (oldUrl, newUrl, dispatch, getState) => {

  const oldUrlObj = new Url(oldUrl, {});
  const oldHashObj = urlHashToObj(oldUrlObj.hash);

  const newUrlObj = new Url(newUrl, {});
  const newHashObj = urlHashToObj(newUrlObj.hash);

  // Note id
  if ('n' in oldHashObj && 'n' in newHashObj) {
    if (oldHashObj['n'] === newHashObj['n']) {
      // something else changed, do nothing here.
    } else {
      // maybe user fast clicks
    }
  } else if ('n' in oldHashObj && !('n' in newHashObj)) {
    // Unselect note id
    dispatch(updateNoteId(null));
  } else if (!('n' in oldHashObj) && 'n' in newHashObj) {
    // Select note id
    dispatch(updateNoteId(newHashObj['n']));
  }

  // Popup
  if ('p' in oldHashObj && 'p' in newHashObj) {
    if (oldHashObj['p'] === newHashObj['p']) {
      // something else changed, do nothing here.
    } else {
      // i.e. from profilePopup to settingsPopup
      dispatch(updatePopup(oldHashObj['p'], false, null));

      let anchorPosition = null;
      if (newHashObj['ppt']) anchorPosition = {
        x: parseInt(newHashObj['ppx']),
        y: parseInt(newHashObj['ppy']),
        width: parseInt(newHashObj['ppw']),
        height: parseInt(newHashObj['pph']),
        top: parseInt(newHashObj['ppt']),
        right: parseInt(newHashObj['ppr']),
        bottom: parseInt(newHashObj['ppb']),
        left: parseInt(newHashObj['ppl']),
      }
      dispatch(updatePopup(newHashObj['p'], true, anchorPosition));
    }
  } else if ('p' in oldHashObj && !('p' in newHashObj)) {
    // Close popup
    dispatch(updatePopup(oldHashObj['p'], false, null));
  } else if (!('p' in oldHashObj) && 'p' in newHashObj) {
    // Open popup
    let anchorPosition = null;
    if (newHashObj['ppt']) anchorPosition = {
      x: parseInt(newHashObj['ppx']),
      y: parseInt(newHashObj['ppy']),
      width: parseInt(newHashObj['ppw']),
      height: parseInt(newHashObj['pph']),
      top: parseInt(newHashObj['ppt']),
      right: parseInt(newHashObj['ppr']),
      bottom: parseInt(newHashObj['ppb']),
      left: parseInt(newHashObj['ppl']),
    }
    dispatch(updatePopup(newHashObj['p'], true, anchorPosition));
  }

  // search popup
  if ('sp' in oldHashObj && 'sp' in newHashObj) {
    if (oldHashObj['sp'] === newHashObj['sp']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('sp' in oldHashObj && !('sp' in newHashObj)) {
    // Close search popup
    dispatch(updatePopup(SEARCH_POPUP, false, null));
  } else if (!('sp' in oldHashObj) && 'sp' in newHashObj) {
    // Open search popup
    dispatch(updatePopup(SEARCH_POPUP, true, null));
  }

  // confirm delete popup
  if ('cdp' in oldHashObj && 'cdp' in newHashObj) {
    if (oldHashObj['cdp'] === newHashObj['cdp']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('cdp' in oldHashObj && !('cdp' in newHashObj)) {
    // Close confirm delete popup
    dispatch(updatePopup(CONFIRM_DELETE_POPUP, false, null));
  } else if (!('cdp' in oldHashObj) && 'cdp' in newHashObj) {
    // Open confirm delete popup
    dispatch(updatePopup(CONFIRM_DELETE_POPUP, true, null));
  }

  // confirm discard popup
  if ('cdip' in oldHashObj && 'cdip' in newHashObj) {
    if (oldHashObj['cdip'] === newHashObj['cdip']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('cdip' in oldHashObj && !('cdip' in newHashObj)) {
    // Close confirm discard popup
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, false, null));
  } else if (!('cdip' in oldHashObj) && 'cdip' in newHashObj) {
    // Open confirm discard popup
    dispatch(updatePopup(CONFIRM_DISCARD_POPUP, true, null));
  }

  // is bulk editing?
  if ('ibe' in oldHashObj && 'ibe' in newHashObj) {
    if (oldHashObj['ibe'] === newHashObj['ibe']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('ibe' in oldHashObj && !('ibe' in newHashObj)) {
    // Exit bulk editing
    dispatch(updateBulkEdit(false));
  } else if (!('ibe' in oldHashObj) && 'ibe' in newHashObj) {
    // Enter bulk editing
    dispatch(updateBulkEdit(true));
  }
};

export const updateUrlHash = (q, doReplace = false) => {
  const hashObj = { ...urlHashToObj(window.location.hash), ...q };
  const updatedHash = objToUrlHash(hashObj);

  if (doReplace) {
    const urlObj = new Url(window.location.href, {});
    urlObj.set('hash', updatedHash);
    window.location.replace(urlObj.toString());
  } else window.location.hash = updatedHash;
};

const _updateNoteIdUrlHash = (id) => {
  if (!id) {
    window.history.back();
    return;
  }

  const obj = { n: id };
  updateUrlHash(obj);
};

export const updateNoteIdUrlHash = (
  id, doGetIdFromState = false, doCheckEditing = false
) => {
  if (!doGetIdFromState && !doCheckEditing) {
    _updateNoteIdUrlHash(id);
    return;
  }

  return async (dispatch, getState) => {
    // id can be both null and non-null so need doGetIdFromState, can't just check if.
    if (doGetIdFromState) id = getState().display.updatingNoteId;
    if (doCheckEditing) {
      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        dispatch(increaseUpdateNoteIdUrlHashCount(id));
        return;
      }
    }

    _updateNoteIdUrlHash(id);
  };
};

export const updatePopupUrlHash = (id, isShown, anchorPosition, doReplace = false) => {
  if (!isShown) {
    window.history.back();
    return;
  }

  // searchPopup and confirmDeletePopup uses diff key because can display together with others
  let obj;
  if (id === SEARCH_POPUP) obj = { sp: true };
  else if (id === CONFIRM_DELETE_POPUP) obj = { cdp: true };
  else if (id === CONFIRM_DISCARD_POPUP) obj = { cdip: true };
  else {
    obj = {
      p: id,
      ppx: anchorPosition ? Math.round(anchorPosition.x) : null,
      ppy: anchorPosition ? Math.round(anchorPosition.y) : null,
      ppw: anchorPosition ? Math.round(anchorPosition.width) : null,
      pph: anchorPosition ? Math.round(anchorPosition.height) : null,
      ppt: anchorPosition ? Math.round(anchorPosition.top) : null,
      ppr: anchorPosition ? Math.round(anchorPosition.right) : null,
      ppb: anchorPosition ? Math.round(anchorPosition.bottom) : null,
      ppl: anchorPosition ? Math.round(anchorPosition.left) : null,
    };
  }
  updateUrlHash(obj, doReplace);
};

export const updateBulkEditUrlHash = (isBulkEditing, doReplace = false) => {
  if (!isBulkEditing) {
    window.history.back();
    return;
  }

  const obj = {
    ibe: true,
    p: null,
    ppx: null, ppy: null, ppw: null, pph: null,
    ppt: null, ppr: null, ppb: null, ppl: null,
  };
  updateUrlHash(obj, doReplace);
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

export const moveNotes = (toListName, safeAreaWidth) => async (dispatch, getState) => {

  const { noteId, isBulkEditing, selectedNoteIds } = getState().display;

  if (safeAreaWidth < LG_WIDTH && !isBulkEditing) updateNoteIdUrlHash(null);
  else dispatch(updateNoteId(null));

  if (isBulkEditing) {
    if (selectedNoteIds.length === 0) return;
    dispatch(_moveNotes(toListName, selectedNoteIds));
    updateBulkEditUrlHash(false);
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

export const deleteNotes = (safeAreaWidth) => async (dispatch, getState) => {

  const { noteId, isBulkEditing, selectedNoteIds } = getState().display;

  if (safeAreaWidth < LG_WIDTH && !isBulkEditing) updateNoteIdUrlHash(null);
  else dispatch(updateNoteId(null));

  if (isBulkEditing) {
    if (selectedNoteIds.length === 0) return;
    dispatch(_deleteNotes(selectedNoteIds));
    updateBulkEditUrlHash(false);
  } else {
    dispatch(_deleteNotes([noteId]));
  }
};

export const retryDiedNotes = (ids, safeAreaWidth) => async (dispatch, getState) => {

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

      if (safeAreaWidth < LG_WIDTH) updateNoteIdUrlHash(null);
      else dispatch(updateNoteId(null));

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

  toNote['addedDT'] = Math.min(...conflictedNote.notes.map(note => {
    return note.addedDT ? note.addedDT : addedDT;
  }));
  dispatch({ type: MERGE_NOTES_COMMIT, payload: { ...payload, toNote } });
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
 * _isSyncing: one sync at a time
 * _newSyncObj: there is a new update and need to sync again
 *
 * updateAction: 0 - normal, update immediately or show notification
 *               1 - force, update immediately no matter what
 *               2 - no update even there is a change
 */
export const sync = (
  doForceServerListFPaths = false, updateAction = 0, haveUpdate = false
) => async (dispatch, getState) => {
  // Do nothing on web. This is for mobile.
};

export const tryUpdateSynced = (updateAction, haveUpdate) => async (
  dispatch, getState
) => {
  // Do nothing on web. This is for mobile.
};

export const updateSynced = (doCheckEditing = false) => async (dispatch, getState) => {
  // Do nothing on web. This is for mobile.
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
    // Export only index.json and settings.json so safe to JSON.parse all responses.
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

    var blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "justnote-data.txt");
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

    updatePopupUrlHash(SETTINGS_POPUP, false, null);
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
