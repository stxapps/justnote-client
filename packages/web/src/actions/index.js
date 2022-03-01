import Url from 'url-parse';
import * as zip from "@zip.js/zip.js";
import { saveAs } from 'file-saver';

import userSession from '../userSession';
import dataApi from '../apis/data';
import fileApi from '../apis/file';
import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
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
  CANCEL_DIED_SETTINGS, UPDATE_DISCARD_ACTION, INCREASE_SAVE_NOTE_COUNT,
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
  SEARCH_POPUP, SETTINGS_POPUP, CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP,
  DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, MY_NOTES, TRASH, ARCHIVE, ID, NEW_NOTE, NEW_NOTE_OBJ,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  N_NOTES, CD_ROOT, NOTES, IMAGES, SETTINGS, INDEX, DOT_JSON, LG_WIDTH,
  IMAGE_FILE_EXTS,
} from '../types/const';
import {
  throttle, extractUrl, urlHashToObj, objToUrlHash, isIPadIPhoneIPod, isBusyStatus,
  isEqual, separateUrlAndParam, getUserImageUrl, randomString,
  isNoteBodyEqual, clearNoteData, getStaticFPath, deriveFPaths,
  getListNameObj, getAllListNames,
  sleep, isObject, isString, isNumber, isListNameObjsValid, indexOfClosingTag,
} from '../utils';
import { isUint8Array } from '../utils/index-web';
import { _ } from '../utils/obj';
import { initialSettingsState } from '../types/initialStates';

let hashChangeListener;
export const init = () => async (dispatch, getState) => {

  await handlePendingSignIn()(dispatch, getState);

  const isUserSignedIn = userSession.isUserSignedIn();
  const isUserDummy = false;
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
      isUserDummy,
      username,
      userImage,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    },
  });

  // Let hash get updated first before add an listener
  hashChangeListener = function (e) {
    onUrlHashChange(e.oldURL, e.newURL, dispatch, getState);
  };
  setTimeout(() => {
    window.addEventListener('hashchange', hashChangeListener);
  }, 1);

  let prevWidth = window.innerWidth;
  if (isIPadIPhoneIPod()) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      handleScreenRotation(prevWidth)(dispatch, getState);
      prevWidth = window.innerWidth;

      dispatch({
        type: UPDATE_WINDOW_SIZE,
        payload: {
          windowWidth: window.innerWidth,
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

    const settings = getState().settings;
    const snapshotSettings = getState().snapshot.settings;
    if (!isEqual(settings, snapshotSettings)) {
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
  const { isUserSignedIn, isUserDummy } = getState().user;
  if (!isUserSignedIn && !isUserDummy) return;

  const toLg = prevWidth < LG_WIDTH && window.innerWidth >= LG_WIDTH;
  const fromLg = prevWidth >= LG_WIDTH && window.innerWidth < LG_WIDTH;
  if (!toLg && !fromLg) return;

  const noteId = getState().display.noteId;
  if (noteId) {
    if (fromLg) {
      window.removeEventListener('hashchange', hashChangeListener);
      setTimeout(() => {
        updateNoteIdUrlHash(noteId);
        setTimeout(() => {
          window.addEventListener('hashchange', hashChangeListener);
        }, 100);
      }, 100);
    } else if (toLg) {
      window.removeEventListener('hashchange', hashChangeListener);
      setTimeout(() => {
        window.history.back();
        setTimeout(() => {
          window.addEventListener('hashchange', hashChangeListener);
        }, 100);
      }, 100);
    }
  }
};

export const signOut = () => async (dispatch, getState) => {

  userSession.signUserOut();

  // clear file storage
  await fileApi.deleteAllFiles();

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const updateUserData = (data) => async (dispatch, getState) => {
  userSession.updateUserData(data);

  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
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
      // i.e. from settingsListsMenuPopup to listNamesPopup
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

  // settings popup
  if ('stp' in oldHashObj && 'stp' in newHashObj) {
    if (oldHashObj['stp'] === newHashObj['stp']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('stp' in oldHashObj && !('stp' in newHashObj)) {
    // Close settings popup
    dispatch(updatePopup(SETTINGS_POPUP, false, null));
  } else if (!('stp' in oldHashObj) && 'stp' in newHashObj) {
    // Open settings popup
    dispatch(updatePopup(SETTINGS_POPUP, true, null));
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
      const isEditorUploading = getState().editor.isUploading;
      if (isEditorUploading) return;

      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        dispatch(increaseUpdateNoteIdUrlHashCount(id));
        return;
      }
    }

    _updateNoteIdUrlHash(id);
  };
};

export const onUpdateNoteIdUrlHash = (title, body) => async (dispatch, getState) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
    dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH));
    updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
    return;
  }

  dispatch(updateNoteIdUrlHash(null, true, false));
};

export const updatePopupUrlHash = (id, isShown, anchorPosition, doReplace = false) => {
  if (!isShown) {
    window.history.back();
    return;
  }

  // searchPopup and confirmDeletePopup uses diff key because can display together with others
  let obj;
  if (id === SEARCH_POPUP) obj = { sp: true };
  else if (id === SETTINGS_POPUP) obj = { stp: true };
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
    const isEditorUploading = getState().editor.isUploading;
    if (isEditorUploading) return;

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

export const onChangeListName = (title, body) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
    dispatch(updateDiscardAction(DISCARD_ACTION_CHANGE_LIST_NAME));
    updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
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
      const isEditorUploading = getState().editor.isUploading;
      if (isEditorUploading) return;

      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        dispatch(increaseUpdateNoteIdCount(id));
        return;
      }
    }

    dispatch(_updateNoteId(id));
  };
};

export const onUpdateNoteId = (title, body) => async (
  dispatch, getState
) => {
  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
    dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID));
    updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
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

const fetchStaticFiles = async (notes, conflictedNotes) => {
  const _fpaths = [];
  for (const note of notes) {
    if (note.media) {
      for (const { name } of note.media) {
        if (name.startsWith(CD_ROOT + '/')) _fpaths.push(getStaticFPath(name));
      }
    }
  }
  if (conflictedNotes) {
    for (const conflictedNote of conflictedNotes) {
      for (const note of conflictedNote.notes) {
        if (note.media) {
          for (const { name } of note.media) {
            if (name.startsWith(CD_ROOT + '/')) _fpaths.push(getStaticFPath(name));
          }
        }
      }
    }
  }

  const { fpaths, contents } = await dataApi.getFiles(_fpaths, true);
  await fileApi.putFiles(fpaths, contents);
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

    await fetchStaticFiles(fetched.notes, fetched.conflictedNotes);

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

    await fetchStaticFiles(fetched.notes, null);

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
  const { usedFPaths, localUnusedFPaths } = deriveFPaths(media, null, savingFPaths);

  const payload = { listName, note };
  dispatch({ type: ADD_NOTE, payload });

  try {
    const usedFiles = await fileApi.getFiles(usedFPaths);
    await dataApi.putFiles(usedFiles.fpaths, usedFiles.contents);
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
  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths
  } = deriveFPaths(media, note.media, savingFPaths);

  const payload = { listName, fromNote: note, toNote };
  dispatch({ type: UPDATE_NOTE, payload });

  try {
    const usedFiles = await fileApi.getFiles(usedFPaths);
    await dataApi.putFiles(usedFiles.fpaths, usedFiles.contents);
    await dataApi.putNotes({ listName, notes: [toNote] });
  } catch (e) {
    dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error: e } });
    return;
  }

  dispatch({ type: UPDATE_NOTE_COMMIT, payload });

  try {
    dataApi.putNotes({ listName, notes: [fromNote] });
    dataApi.deleteFiles(serverUnusedFPaths);
    fileApi.deleteFiles(localUnusedFPaths);
  } catch (e) {
    console.log('updateNote error: ', e);
    // error in this step should be fine
  }
};

export const saveNote = (title, body, media) => async (dispatch, getState) => {

  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (title === '' && body === '') {
    dispatch(increaseFocusTitleCount());
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
  doCheckEditing, title = null, body = null
) => async (dispatch, getState) => {

  const { listName, noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getState().notes[listName][noteId];

  if (doCheckEditing) {
    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
      dispatch(updateDiscardAction(DISCARD_ACTION_CANCEL_EDIT));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
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

  const safeAreaWidth = getState().window.width;
  if (safeAreaWidth < LG_WIDTH && !isBulkEditing) updateNoteIdUrlHash(null);
  else dispatch(updateNoteId(null));

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
    dataApi.deleteFiles(unusedFPaths);
    fileApi.deleteFiles(unusedFPaths);
  } catch (e) {
    console.log('deleteNotes error: ', e);
    // error in this step should be fine
  }
};

export const deleteNotes = () => async (dispatch, getState) => {

  const { noteId, isBulkEditing, selectedNoteIds } = getState().display;

  const safeAreaWidth = getState().window.width;
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
      const { usedFPaths } = deriveFPaths(note.media, null, null);

      const payload = { listName, note };
      dispatch({ type: ADD_NOTE, payload });

      try {
        const usedFiles = await fileApi.getFiles(usedFPaths);
        await dataApi.putFiles(usedFiles.fpaths, usedFiles.contents);
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
        usedFPaths, serverUnusedFPaths, localUnusedFPaths,
      } = deriveFPaths(toNote.media, note.fromNote.media, null);

      const payload = { listName, fromNote: note.fromNote, toNote };
      dispatch({ type: UPDATE_NOTE, payload });

      try {
        const usedFiles = await fileApi.getFiles(usedFPaths);
        await dataApi.putFiles(usedFiles.fpaths, usedFiles.contents);
        await dataApi.putNotes({ listName, notes: [toNote] });
      } catch (e) {
        dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error: e } });
        return;
      }

      dispatch({ type: UPDATE_NOTE_COMMIT, payload });

      try {
        dataApi.putNotes({ listName, notes: [fromNote] });
        dataApi.deleteFiles(serverUnusedFPaths);
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

      const safeAreaWidth = getState().window.width;
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

      dispatch({ type: DELETE_NOTES_COMMIT, payload });

      try {
        dataApi.putNotes({ listName, notes: [fromNote] });
        dataApi.deleteFiles(unusedFPaths);
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
    dataApi.deleteFiles(unusedFPaths);
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

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(toNote.media, noteMedia, null);

  const payload = { conflictedNote, toListName, toNote };
  dispatch({ type: MERGE_NOTES, payload });

  try {
    const usedFiles = await fileApi.getFiles(usedFPaths);
    await dataApi.putFiles(usedFiles.fpaths, usedFiles.contents);
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
    dataApi.deleteFiles(serverUnusedFPaths);
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

  updatePopupUrlHash(SETTINGS_POPUP, isShown, null);
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

const importAllDataLoop = async (dispatch, fpaths, contents) => {
  let total = fpaths.length, doneCount = 0;
  dispatch(updateImportAllDataProgress({ total, done: doneCount }));

  try {
    for (let i = 0; i < fpaths.length; i += N_NOTES) {
      const _fpaths = fpaths.slice(i, i + N_NOTES);
      const _contents = contents.slice(i, i + N_NOTES).map((content, j) => {
        if (_fpaths[j].endsWith(INDEX + DOT_JSON) || _fpaths[j].startsWith(SETTINGS)) {
          content = JSON.stringify(content);
        }
        return content;
      });
      await dataApi.batchPutFileWithRetry(_fpaths, _contents, 0);

      doneCount += _fpaths.length;
      dispatch(updateImportAllDataProgress({ total, done: doneCount }));

      await sleep(1000); // Make it slow to not overwhelm the server
    }
  } catch (e) {
    dispatch(updateImportAllDataProgress({
      total: -1,
      done: -1,
      error: e.name + ': ' + e.message,
    }));

    if (doneCount < total) {
      let msg = 'There is an error while importing! Below are contents that have not been imported:\n';
      for (let i = doneCount; i < fpaths.length; i++) {
        msg += '    • ' + fpaths[i] + '\n';
      }
      window.alert(msg);
    }
  }
};

const parseImportedFile = async (dispatch, fileContent) => {

  dispatch(updateImportAllDataProgress({
    total: 'calculating...',
    done: 0,
  }));

  // 1 format: zip file
  let fpaths = [], contents = [], addedDT = Date.now(), idMap = {};
  let isEvernote = false, enFPaths = [], enContents = [];
  const reader = new zip.ZipReader(
    new zip.Uint8ArrayReader(new Uint8Array(fileContent))
  );

  const entries = await reader.getEntries();
  for (const entry of entries) {
    if (entry.directory) continue;

    let fpath = entry.filename;
    const fpathParts = fpath.split('/');
    const fname = fpathParts[fpathParts.length - 1];
    const fnameParts = fname.split('.');
    const fext = fnameParts[fnameParts.length - 1];

    let content;
    if (
      fpath.endsWith(INDEX + DOT_JSON) ||
      fpath.startsWith(SETTINGS) ||
      fpath.includes(CD_ROOT + '/') ||
      (
        fpath.startsWith('Takeout/Keep/') &&
        (fpath.endsWith('Labels.txt') || fpath.endsWith(DOT_JSON))
      ) ||
      fpath.endsWith('.html')
    ) {
      content = await entry.getData(new zip.TextWriter());
    } else {
      content = await entry.getData(new zip.BlobWriter());
    }
    if (!fpath.includes(CD_ROOT + '/') && !content) continue;

    if (fpath.startsWith(NOTES)) {
      if (fpath.includes(CD_ROOT + '/')) {
        if (fpathParts.length !== 6) continue;
      } else {
        if (fpathParts.length !== 4) continue;
      }
      if (fpathParts[0] !== NOTES) continue;

      const { id, parentIds } = dataApi.extractNoteFName(fpathParts[2]);
      if (!(/^\d+[A-Za-z]+$/.test(id))) continue;
      if (parentIds) {
        if (!parentIds.every(id => (/^\d+[A-Za-z]+$/.test(id)))) continue;
      }

      if (fpathParts[3] === INDEX + DOT_JSON) {
        try {
          content = JSON.parse(content);
          if (
            !('title' in content && 'body' in content)
          ) continue;
          if (!(isString(content.title) && isString(content.body))) continue;
        } catch (e) {
          console.log('parseImportedFile: JSON.parse note content error: ', e);
          continue;
        }
      } else if (fpathParts[3] === CD_ROOT) {
        if (fpathParts[4] !== IMAGES) continue;
      } else continue;

      // Treat import notes as adding new notes, replace note id with a new one
      if (!idMap[fpathParts[2]]) {
        const { dt } = dataApi.extractNoteId(id);

        let newId = id;
        while (newId === id) newId = `${dt}${randomString(4)}`;
        idMap[fpathParts[2]] = newId;
      }
      fpathParts[2] = idMap[fpathParts[2]];
      fpath = fpathParts.join('/');
    } else if (fpath.startsWith(IMAGES)) {
      if (fpathParts.length !== 2 || fpathParts[0] !== IMAGES) continue;
      if (fnameParts.length !== 2) continue;
    } else if (fpath.startsWith(SETTINGS)) {
      if (!fpath.endsWith(DOT_JSON)) continue;

      let dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
      if (!isNumber(dt)) continue;

      try {
        content = JSON.parse(content);

        const settings = { ...initialSettingsState };
        if ('doDeleteOldNotesInTrash' in content) {
          settings.doDeleteOldNotesInTrash = content.doDeleteOldNotesInTrash;
        }
        if ('sortOn' in content) {
          settings.sortOn = content.sortOn;
        }
        if ('doDescendingOrder' in content) {
          settings.doDescendingOrder = content.doDescendingOrder;
        }
        if ('doAlertScreenRotation' in content) {
          settings.doAlertScreenRotation = content.doAlertScreenRotation;
        }
        if ('listNameMap' in content && isListNameObjsValid(content.listNameMap)) {
          settings.listNameMap = content.listNameMap;
        }
        content = settings;
      } catch (e) {
        console.log('parseImportedFile: JSON.parse settings content error: ', e);
        continue;
      }

      // Make the settings newest version
      fpath = `${SETTINGS}${addedDT}${DOT_JSON}`;
      addedDT += 1;
    } else if (fpath.startsWith('Takeout/Keep/')) {
      if (fpathParts.length < 3) continue;
      if (fnameParts.length < 2) continue;

      if (fname === 'Labels.txt') {
        const settings = { ...initialSettingsState };
        for (const label of content.split('\n')) {
          if (!label) continue;

          const id = `${addedDT}-${randomString(4)}`;
          settings.listNameMap.push({ listName: id, displayName: label });
          idMap[label] = id;
          addedDT += 1;
        }
        content = settings;

        fpath = `${SETTINGS}${addedDT}${DOT_JSON}`;
        addedDT += 1;
      } else if (IMAGE_FILE_EXTS.includes(fext)) {
        const newName = `${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(4)}.${fext}`;
        fpath = `${IMAGES}/${newName}`;

        // As file name can be .jpg but attachment in note.json can be .jpeg
        //   so need to ignore the ext.
        idMap[fnameParts.slice(0, -1).join('.')] = fpath;
      } else if (['json'].includes(fext)) {
        // Need to convert to notes/[listName]/[noteId]/index.json below
        //   after gathering all images and labels.
        try {
          content = JSON.parse(content);
        } catch (e) {
          console.log('parseImportedFile: JSON.parse Keep content error: ', e);
          continue;
        }
      } else continue;
    } else if (fpath.endsWith('Evernote_index.html')) {
      isEvernote = true;
      continue;
    } else if (fpath.endsWith('.html') || IMAGE_FILE_EXTS.includes(fext)) {
      enFPaths.push(fpath);
      enContents.push(content);
      continue;
    } else continue;

    fpaths.push(fpath);
    contents.push(content);
  }

  await reader.close();

  if (isEvernote) {
    fpaths = []; contents = []; addedDT = Date.now(); idMap = {};

    for (let i = 0; i < enFPaths.length; i++) {
      let fpath = enFPaths[i];
      const fpathParts = fpath.split('/');
      const fname = fpathParts[fpathParts.length - 1];
      const fnameParts = fname.split('.');
      const fext = fnameParts[fnameParts.length - 1];

      const content = enContents[i];

      if (IMAGE_FILE_EXTS.includes(fext)) {
        const newName = `${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(4)}.${fext}`;
        fpath = `${IMAGES}/${newName}`;

        // Also includes dir name to be matched with src in the html
        if (fpathParts.length < 2) continue;
        const dir = fpathParts[fpathParts.length - 2] + '/';
        idMap[dir + fnameParts.slice(0, -1).join('.')] = fpath;
      }

      fpaths.push(fpath);
      contents.push(content);
    }
  }

  const selectedFPaths = [], selectedContents = [];
  for (let i = 0; i < fpaths.length; i++) {
    const fpath = fpaths[i];
    const content = contents[i];

    if (fpath.startsWith('Takeout/Keep/') && fpath.endsWith(DOT_JSON)) {
      let listName = MY_NOTES;
      if (content.isTrashed) listName = TRASH;
      else if (content.isArchived) listName = ARCHIVE;
      else if (
        content.labels && Array.isArray(content.labels) && content.labels.length > 0
      ) {
        const label = content.labels[0];
        if (isObject(label) && idMap[label.name]) listName = idMap[label.name];
      }

      let dt;
      if (
        content.userEditedTimestampUsec &&
        isNumber(content.userEditedTimestampUsec)
      ) {
        dt = content.userEditedTimestampUsec;
        if (dt > 1000000000000000) dt = Math.round(dt / 1000);
      } else {
        dt = addedDT;
        addedDT += 1;
      }

      const id = `${dt}${randomString(4)}`;
      const dpath = `${NOTES}/${listName}/${id}`;

      const title = content.title || '';
      let body = '';
      if (content.textContent) {
        body = '<p>' + content.textContent.replace(/\r?\n/g, '<br />') + '</p>';
      }

      if (content.attachments && Array.isArray(content.attachments)) {
        for (const attachment of content.attachments) {
          if (
            !attachment.mimetype ||
            !isString(attachment.mimetype) ||
            !attachment.mimetype.startsWith('image/') ||
            !attachment.filePath ||
            !isString(attachment.filePath)
          ) continue;

          const fnameParts = attachment.filePath.split('.');
          if (fnameParts.length < 2) continue;

          const imgFPath = idMap[fnameParts.slice(0, -1).join('.')];
          if (imgFPath) {
            let imgHtml = '<figure class="image"><img src="cdroot/';
            imgHtml += imgFPath;
            imgHtml += '" /></figure>';
            body += imgHtml;

            selectedFPaths.push(`${dpath}/cdroot/${imgFPath}`);
            selectedContents.push('');
          }
        }
      }
      if (
        content.listContent &&
        Array.isArray(content.listContent) &&
        content.listContent.length > 0
      ) {
        let listHtml = '<ul class="todo-list">';
        for (const listItem of content.listContent) {
          if (
            !isObject(listItem) || !listItem.text || !isString(listItem.text)
          ) continue;

          listHtml += '<li><label class="todo-list__label"><input type="checkbox" disabled="disabled"';
          if (listItem.isChecked) listHtml += ' checked="checked"';
          listHtml += ' /><span class="todo-list__label__description">';
          listHtml += listItem.text;
          listHtml += '</span></label></li>';
        }
        listHtml += '</ul>'
        body += listHtml;
      }

      if (title || body) {
        selectedFPaths.push(`${dpath}/index.json`);
        selectedContents.push({ title, body });
      }
      continue;
    }

    if (isEvernote && fpath.endsWith('.html')) {
      const listName = MY_NOTES;

      let dt, dtMatch = content.match(/<meta itemprop="created" content="(.+)">/i);
      if (!dtMatch) {
        dtMatch = content.match(/<meta itemprop="updated" content="(.+)">/i);
      }
      if (dtMatch) {
        const s = dtMatch[1];
        if (s.length === 16) {
          const _dt = Date.parse(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 11)}:${s.slice(11, 13)}:${s.slice(13)}`);
          if (_dt && isNumber(_dt)) dt = _dt;
        }
      }
      if (!dt) {
        dt = addedDT;
        addedDT += 1;
      }

      const id = `${dt}${randomString(4)}`;
      const dpath = `${NOTES}/${listName}/${id}`;

      let title = '';
      const tMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (tMatch) title = tMatch[1].trim();
      if (title === 'Untitled') title = '';

      let body = '';
      const bMatch = content.match(/<en-note[^>]*>([\s\S]+?)<\/en-note>/i);
      if (bMatch) body = bMatch[1].trim();

      // img tags
      for (const match of body.matchAll(/<img[^>]+?src="([^"]+)"[^>]*>/gi)) {
        const fpath = match[1];
        const fpathParts = fpath.split('/');
        const fname = fpathParts[fpathParts.length - 1];
        const fnameParts = fname.split('.');

        if (fpathParts.length < 2 || fnameParts.length < 2) continue;

        const dir = fpathParts[fpathParts.length - 2] + '/';
        const imgFPath = idMap[dir + fnameParts.slice(0, -1).join('.')];
        if (imgFPath) {
          body = body.split(fpath).join('cdroot/' + imgFPath);

          selectedFPaths.push(`${dpath}/cdroot/${imgFPath}`);
          selectedContents.push('');
        }
      }

      // task tags
      let i = -1;
      while ((i = body.indexOf('<div class="taskgroup">', i + 1)) !== -1) {
        let html = body.slice(i);

        const endIndex = indexOfClosingTag(html);
        if (endIndex < 0) continue;

        html = html.slice(0, endIndex).trim();

        try {
          const template = document.createElement('template');
          template.innerHTML = html;

          const taskObjs = [];
          const elem = template.content.firstChild;
          for (const node of elem.childNodes) {
            let isCompleted = false;
            if (node instanceof HTMLElement && node.dataset && node.dataset.completed) {
              isCompleted = node.dataset.completed === 'true';
            }

            const text = node.firstChild.firstChild.lastChild.firstChild.textContent;
            taskObjs.push({ text: text.trim(), isCompleted });
          }

          if (taskObjs.length > 0) {
            let todoHtml = '<ul class="todo-list">';
            for (const { text, isCompleted } of taskObjs) {
              todoHtml += '<li><label class="todo-list__label"><input type="checkbox" disabled="disabled"';
              if (isCompleted) todoHtml += ' checked="checked"';
              todoHtml += ' /><span class="todo-list__label__description">';
              todoHtml += text;
              todoHtml += '</span></label></li>';
            }
            todoHtml += '</ul>';
            body = body.slice(0, i) + todoHtml + body.slice(i + endIndex);
          }
        } catch (e) {
          console.log('parseImportedFile: Evernote task tag error', e);
          continue;
        }
      }

      // todo tags
      for (const match of body.matchAll(/<ul[^>]+?class="en-todolist"[\s\S]+?<\/ul>/gi)) {
        const html = match[0];
        try {
          const template = document.createElement('template');
          template.innerHTML = html;

          const todoObjs = [];
          const elem = template.content.firstChild;
          for (const node of elem.childNodes) {
            let isCompleted = false;
            if (node instanceof HTMLElement && node.dataset && node.dataset.checked) {
              isCompleted = node.dataset.checked === 'true';
            }

            const text = node.lastChild.firstChild.textContent;
            todoObjs.push({ text: text.trim(), isCompleted });
          }

          if (todoObjs.length > 0) {
            let todoHtml = '<ul class="todo-list">';
            for (const { text, isCompleted } of todoObjs) {
              todoHtml += '<li><label class="todo-list__label"><input type="checkbox" disabled="disabled"';
              if (isCompleted) todoHtml += ' checked="checked"';
              todoHtml += ' /><span class="todo-list__label__description">';
              todoHtml += text;
              todoHtml += '</span></label></li>';
            }
            todoHtml += '</ul>';
            body = body.split(html).join(todoHtml);
          }
        } catch (e) {
          console.log('parseImportedFile: Evernote todo tag error', e);
          continue;
        }
      }

      // code block tags
      for (const match of body.matchAll(/<en-codeblock[^>]*?>[\s\S]+?<\/en-codeblock>/gi)) {
        const html = match[0];
        try {
          const template = document.createElement('template');
          template.innerHTML = html;

          const lines = [];
          const elem = template.content.firstChild;
          for (const node of elem.childNodes) {
            lines.push(node.textContent);
          }

          if (lines.length > 0) {
            let codeHtml = '<pre><code>';
            codeHtml += lines.join('<br />');
            codeHtml += '</code></pre>';
            body = body.split(html).join(codeHtml);
          }
        } catch (e) {
          console.log('parseImportedFile: Evernote code block tag error', e);
          continue;
        }
      }

      if (title || body) {
        selectedFPaths.push(`${dpath}/index.json`);
        selectedContents.push({ title, body });
      }
      continue;
    }

    selectedFPaths.push(fpath);
    selectedContents.push(content);
  }

  importAllDataLoop(dispatch, selectedFPaths, selectedContents);
};

export const importAllData = () => async (dispatch, getState) => {

  const onError = () => {
    window.alert('Read failed: could not read content in the file. Please recheck your file.');
  };

  const onReaderLoad = (e) => {
    parseImportedFile(dispatch, e.target.result);
  };

  const onInputChange = () => {
    if (input.files) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.onerror = onError;
      reader.readAsArrayBuffer(file);
    }
  };

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip';
  input.addEventListener('change', onInputChange);
  input.click();
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

export const exportAllData = () => async (dispatch, getState) => {
  dispatch(updateExportAllDataProgress({ total: 'calculating...', done: 0 }));

  let fpaths = [];
  try {
    const { noteFPaths, settingsFPath } = await dataApi.listFPaths();
    const { noteIds, conflictedIds } = dataApi.listNoteIds(noteFPaths);

    for (const noteId of [...noteIds, ...conflictedIds]) {
      for (const fpath of noteId.fpaths) {
        fpaths.push(fpath);
        if (fpath.includes(CD_ROOT + '/')) fpaths.push(getStaticFPath(fpath));
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

  let total = fpaths.length, doneCount = 0;
  dispatch(updateExportAllDataProgress({ total, done: doneCount }));
  if (total === 0) return;

  try {
    const zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'));
    for (let i = 0; i < fpaths.length; i += N_NOTES) {
      const selectedFPaths = fpaths.slice(i, i + N_NOTES);
      const responses = await dataApi.batchGetFileWithRetry(selectedFPaths, 0, true);
      await Promise.all(responses.map(({ fpath, content }) => {
        let reader;
        if (
          fpath.endsWith(INDEX + DOT_JSON) ||
          fpath.startsWith(SETTINGS) ||
          fpath.includes(CD_ROOT + '/')
        ) {
          reader = new zip.TextReader(content);
        } else {
          if (isUint8Array(content)) content = new Blob([content]);
          reader = new zip.BlobReader(content);
        }

        return zipWriter.add(fpath, reader);
      }));

      doneCount += selectedFPaths.length;
      dispatch(updateExportAllDataProgress({ total, done: doneCount }));
    }

    const blob = await zipWriter.close();
    saveAs(blob, 'justnote-data.zip');
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
    if (_staticFPaths) await dataApi.deleteFiles(_staticFPaths);
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
