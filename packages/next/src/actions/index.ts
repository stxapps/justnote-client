import Url from 'url-parse';
import TaskQueue from 'queue';

import userSession from '../userSession';
import idxApi from '../apis';
import lsgApi from '../apis/localSg';
import { updateStgsAndInfo } from '../importWrapper';
import {
  INIT, UPDATE_HREF, UPDATE_WINDOW, UPDATE_USER,
  UPDATE_SEARCH_STRING, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_BULK_EDITING,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, REFRESH_FETCHED,
  INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT, INCREASE_UPDATE_NOTE_ID_COUNT,
  INCREASE_BLUR_COUNT, INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT,
  INCREASE_UPDATE_BULK_EDIT_COUNT, INCREASE_WEBVIEW_KEY_COUNT, UPDATE_UNSAVED_NOTE,
  DELETE_UNSAVED_NOTES, UPDATE_STACKS_ACCESS, UPDATE_SYSTEM_THEME_MODE,
  UPDATE_IS_24H_FORMAT, INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT, RESET_STATE,
} from '../types/actionTypes';
import {
  HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY, HASH_PRICING,
  HASH_SUPPORT, SEARCH_POPUP, SETTINGS_POPUP, CONFIRM_DELETE_POPUP,
  CONFIRM_DISCARD_POPUP, SWWU_POPUP, TRASH, NEW_NOTE, NEW_NOTE_OBJ, LG_WIDTH, WHT_MODE,
  BLK_MODE, PADDLE_RANDOM_ID,
} from '../types/const';
import {
  throttle, urlHashToObj, objToUrlHash, isBusyStatus, isEqual,
  getUserUsername, getUserImageUrl, sleep, isObject, isString,
  isNumber, isTitleEqual, isBodyEqual, getWindowInsets, getNote,
  getEditingListNameEditors, getEditingTagNameEditors,
} from '../utils';
import vars from '../vars';

const navQueue = new TaskQueue({ concurrency: 1, autostart: true, timeout: 1200 });
navQueue.addEventListener('timeout', (e) => {
  console.log('navQueue timed out:', e.detail.job.toString().replace(/\n/g, ''));
});

export const syncQueue = new TaskQueue({ concurrency: 1, autostart: true });
export const taskQueue = new TaskQueue({ concurrency: 1, autostart: true });

let popStateListener, hashChangeListener, _didInit;
export const init = () => async (dispatch, getState) => {
  if (_didInit) return;
  _didInit = true;

  const isUserSignedIn = userSession.isUserSignedIn();
  const isUserDummy = false;
  let username = null, userImage = null, userHubUrl = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = getUserUsername(userData);
    userImage = getUserImageUrl(userData);
    userHubUrl = userData.hubUrl;
  }

  handleUrlHash();

  const darkMatches = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const is24HFormat = null;
  const localSettings = await idxApi.getLocalSettings();
  if (localSettings.doSyncMode !== localSettings.doSyncModeInput) {
    localSettings.doSyncModeInput = localSettings.doSyncMode;
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
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
      localSettings,
      unsavedNotes,
      lockSettings,
    },
  });

  // Let hash get updated first before add an listener by using setTimeout.
  // popStateListener can be a local variable,
  //   but make it the same as hashChangeListener.
  popStateListener = () => {
    onPopStateChange(dispatch, getState);
  };
  setTimeout(() => {
    window.addEventListener('popstate', popStateListener);
  }, 1);

  // hashChangeListener can't be a local variable
  //   as need to be removed and added when rotating.
  hashChangeListener = (e) => {
    onUrlHashChange(e.oldURL, e.newURL, dispatch, getState);
  };
  setTimeout(() => {
    window.addEventListener('hashchange', hashChangeListener);
  }, 1);

  let prevWidth = window.innerWidth;
  window.addEventListener('resize', throttle(() => {
    handleScreenRotation(prevWidth)(dispatch, getState);
    prevWidth = window.innerWidth;

    const insets = getWindowInsets();
    dispatch({
      type: UPDATE_WINDOW,
      payload: {
        width: window.innerWidth,
        height: window.innerHeight,
        insetTop: insets.top,
        insetRight: insets.right,
        insetBottom: insets.bottom,
        insetLeft: insets.left,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      const insets = getWindowInsets();
      dispatch({
        type: UPDATE_WINDOW,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
          visualScale: window.visualViewport.scale,
          insetTop: insets.top,
          insetRight: insets.right,
          insetBottom: insets.bottom,
          insetLeft: insets.left,
        },
      });
    }, 16));
  }

  window.addEventListener('beforeunload', (e) => {
    const isUserSignedIn = userSession.isUserSignedIn();
    if (!isUserSignedIn) return;

    const notes = getState().notes;
    for (const listName in notes) {
      for (const noteId in notes[listName]) {
        if (isBusyStatus(notes[listName][noteId].status)) {
          vars.syncMode.didReload = false;
          e.preventDefault();
          return e.returnValue = 'It looks like your note hasn\'t been saved. Do you want to leave this site and discard your changes?';
        }
      }
    }

    const conflictedNotes = getState().conflictedNotes;
    for (const noteId in conflictedNotes) {
      if (isBusyStatus(conflictedNotes[noteId].status)) {
        vars.syncMode.didReload = false;
        e.preventDefault();
        return e.returnValue = 'It looks like your selection on conflicted notes hasn\'t been saved. Do you want to leave this site and discard your changes?';
      }
    }

    if (
      Object.keys(getState().pendingPins).length > 0 ||
      Object.keys(getState().pendingTags).length > 0 ||
      syncQueue.length > 0 ||
      taskQueue.length > 1 ||
      (taskQueue.length === 1 && !vars.syncMode.didReload)
    ) {
      vars.syncMode.didReload = false;
      e.preventDefault();
      return e.returnValue = 'It looks like your changes are being saved to the server. Do you want to leave this site and discard your changes?';
    }

    if (!getState().display.isSettingsPopupShown) return;

    const settings = getState().settings;
    const snapshotSettings = getState().snapshot.settings;
    if (!isEqual(settings, snapshotSettings)) {
      vars.syncMode.didReload = false;
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the settings haven\'t been saved. Do you want to leave this site and discard your changes?';
    }

    const listNameEditors = getState().listNameEditors;
    const listNameMap = getState().settings.listNameMap;
    const editingLNEs = getEditingListNameEditors(listNameEditors, listNameMap);
    if (isObject(editingLNEs)) {
      vars.syncMode.didReload = false;
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the list names haven\'t been saved. Do you want to leave this site and discard your changes?';
    }

    const tagNameEditors = getState().tagNameEditors;
    const tagNameMap = getState().settings.tagNameMap;
    const editingTNEs = getEditingTagNameEditors(tagNameEditors, tagNameMap);
    if (isObject(editingTNEs)) {
      vars.syncMode.didReload = false;
      e.preventDefault();
      return e.returnValue = 'It looks like your changes to the tag names haven\'t been saved. Do you want to leave this site and discard your changes?';
    }
  }, { capture: true });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const systemThemeMode = e.matches ? BLK_MODE : WHT_MODE;
    dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
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
  await resetState(dispatch);
};

export const updateUserData = (data) => async (dispatch, getState) => {
  try {
    userSession.updateUserData(data);
  } catch (error) {
    window.alert(`Update user data failed! Please refresh the page and try again. If the problem persists, please contact us.\n\n${error}`);
    return;
  }

  const isUserSignedIn = userSession.isUserSignedIn();
  if (isUserSignedIn) dispatch(updateUserSignedIn());
};

export const updateUserSignedIn = () => async (dispatch, getState) => {
  await resetState(dispatch);

  const userData = userSession.loadUserData();
  dispatch({
    type: UPDATE_USER,
    payload: {
      isUserSignedIn: true,
      username: getUserUsername(userData),
      image: getUserImageUrl(userData),
      hubUrl: userData.hubUrl,
    },
  });

  redirectToMain();
};

const resetState = async (dispatch) => {
  lsgApi.removeItemSync(PADDLE_RANDOM_ID);

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

export const handleUrlHash = () => {
  const allowedHashes = [
    HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY,
    HASH_PRICING, HASH_SUPPORT,
  ];

  const urlObj = new Url(window.location.href, {});
  if (urlObj.hash === '' || allowedHashes.includes(urlObj.hash)) return;

  let newHash = '';
  for (const allowedHash of allowedHashes) {
    if (urlObj.hash.startsWith(allowedHash)) {
      newHash = allowedHash;
      break;
    }
  }

  urlObj.set('hash', newHash);
  window.location.replace(urlObj.toString());
};

const redirectToMain = () => {
  // Need timeout for window.history.back() to update the href first.
  setTimeout(() => {
    const urlObj = new Url(window.location.href, {});
    if (urlObj.pathname === '/' && urlObj.hash === '') return;

    window.location.href = '/';
  }, 1);
};

export const onPopStateChange = (dispatch, getState) => {
  dispatch({
    type: UPDATE_HREF,
    payload: window.location.href,
  });
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
    // press back button, need to move editingNote to unsavedNote here.
    if (!vars.updateNoteIdUrlHash.didCall) {
      // Can't use oldHashObj['n'] as new saved/updated noteId not apply to the hash.
      const { noteId, isEditorFocused } = getState().display;
      if (isEditorFocused) dispatch(handleUnsavedNote(noteId));
    }

    // Unselect note id
    dispatch(updateNoteId(null));
  } else if (!('n' in oldHashObj) && 'n' in newHashObj) {
    // Select note id
    dispatch(updateNoteId(newHashObj['n']));
  }
  vars.updateNoteIdUrlHash.didCall = false;

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
      };
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
    };
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
    // press back button, need to call save settings and info here.
    if (!vars.updateSettingsPopup.didCall) dispatch(updateStgsAndInfo());

    // Close settings popup
    dispatch(updatePopup(SETTINGS_POPUP, false, null));
  } else if (!('stp' in oldHashObj) && 'stp' in newHashObj) {
    // Open settings popup
    dispatch(updatePopup(SETTINGS_POPUP, true, null));
  }
  vars.updateSettingsPopup.didCall = false;

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
  vars.updateNoteIdUrlHash.didCall = true;
  vars.displayReducer.doRightPanelAnimateHidden = true;

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
        dispatch(increaseUpdateNoteIdUrlHashCount());
        return;
      }
    }

    _updateNoteIdUrlHash(id);
  };
};

export const onUpdateNoteIdUrlHash = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  dispatch(updateNoteIdUrlHash(null, true, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

export const updatePopupUrlHash = (
  id, isShown, anchorPosition = null, doReplace = false
) => {
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

export const _updateBulkEditUrlHash = (isBulkEditing) => {
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
  updateUrlHash(obj);
};

export const updateBulkEditUrlHash = (
  isBulkEditing, selectedNoteId = null, doGetIdFromState = false, doCheckEditing = false
) => {
  if (!isBulkEditing && !doCheckEditing) {
    _updateBulkEditUrlHash(isBulkEditing);
    return;
  }

  return async (dispatch, getState) => {
    if (doGetIdFromState) selectedNoteId = vars.updateBulkEdit.selectedNoteId;
    if (doCheckEditing) {
      if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;

      const listName = getState().display.listName;
      const queryString = getState().display.queryString;
      if (listName === TRASH && queryString === '' && vars.deleteOldNotes.ids) return;

      const isEditorUploading = getState().editor.isUploading;
      if (isEditorUploading) return;

      const isEditorFocused = getState().display.isEditorFocused;
      if (isEditorFocused) {
        vars.updateBulkEdit.selectedNoteId = selectedNoteId;
        dispatch(increaseUpdateBulkEditUrlHashCount());
        return;
      }
    }

    _updateBulkEditUrlHash(isBulkEditing);
    if (isBulkEditing && selectedNoteId) {
      dispatch(addSelectedNoteIds([selectedNoteId]));
    }
  };
};

export const onUpdateBulkEditUrlHash = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  dispatch(updateBulkEditUrlHash(true, null, true, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
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

const updatePopupInQueue = (
  id, isShown, anchorPosition, replaceId, dispatch, getState
) => () => {

};

export const updatePopup = (
  id, isShown, anchorPosition = null, replaceId = null
) => async (dispatch, getState) => {
  dispatch({
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  });
};

export const updateHref = (href) => {
  return { type: UPDATE_HREF, payload: href };
};

export const updateBulkEdit = (isBulkEditing) => {
  return { type: UPDATE_BULK_EDITING, payload: isBulkEditing };
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

export const handleUnsavedNote = (
  id, title = null, body = null, media = null
) => async (dispatch, getState) => {
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

const linkToInQueue = (router, href) => () => {
  return new Promise<void>((resolve) => {
    const wUrl = window.location;
    const tUrl = new URL(href, window.location.origin);

    if (wUrl.pathname === tUrl.pathname && wUrl.search === tUrl.search) {
      const wHash = wUrl.hash === '#' ? '' : wUrl.hash;
      const tHash = tUrl.hash === '#' ? '' : tUrl.hash;

      if (wHash === tHash) {
        resolve();
        return;
      }

      const onHashchange = () => {
        window.removeEventListener('hashchange', onHashchange);
        resolve();
      };
      window.addEventListener('hashchange', onHashchange);
      window.location.hash = tUrl.hash; // if '', the url still has '#'. Fine for now.
      return;
    }

    const onRouteChangeComplete = () => {
      window.removeEventListener('routeChangeComplete', onRouteChangeComplete);
      resolve();
    };
    window.addEventListener('routeChangeComplete', onRouteChangeComplete);
    router.push(href);
  });
};

export const linkTo = (router, href) => async () => {

};

export const queueDeleteAllData = () => async (dispatch, getState) => {
  // Wait for SettingsPopup to close first so history.back() works correctly.

};
