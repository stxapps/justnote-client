import Url from 'url-parse';
import { saveAs } from 'file-saver';
import { LexoRank } from '@wewatch/lexorank';

import userSession from '../userSession';
import axios from '../axiosWrapper';
import iapApi from '../paddleWrapper';
import dataApi from '../apis/data';
import fileApi from '../apis/localFile';
import lsgApi from '../apis/localSg';
import {
  INIT, UPDATE_HREF, UPDATE_WINDOW_SIZE, UPDATE_VISUAL_SIZE, UPDATE_USER,
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
  UPDATE_DELETING_LIST_NAME, UPDATE_DO_DELETE_OLD_NOTES_IN_TRASH, UPDATE_SORT_ON,
  UPDATE_DO_DESCENDING_ORDER, UPDATE_NOTE_DATE_SHOWING_MODE, UPDATE_NOTE_DATE_FORMAT,
  UPDATE_DO_SECTION_NOTES_BY_MONTH, UPDATE_DO_MORE_EDITOR_FONT_SIZES, UPDATE_SETTINGS,
  UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS,
  MERGE_SETTINGS, MERGE_SETTINGS_COMMIT, MERGE_SETTINGS_ROLLBACK,
  UPDATE_SETTINGS_VIEW_ID, UPDATE_INFO, UPDATE_INFO_COMMIT, UPDATE_INFO_ROLLBACK,
  UPDATE_MOVE_ACTION, UPDATE_DELETE_ACTION, UPDATE_DISCARD_ACTION,
  UPDATE_LIST_NAMES_MODE, UPDATE_SYNCED, INCREASE_SAVE_NOTE_COUNT,
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
  UPDATE_PAYWALL_FEATURE, UPDATE_IMPORT_ALL_DATA_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import {
  HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY, HASH_SUPPORT,
  SEARCH_POPUP, PAYWALL_POPUP, SETTINGS_POPUP, CONFIRM_DELETE_POPUP,
  CONFIRM_DISCARD_POPUP, NOTE_LIST_MENU_POPUP, NOTE_LIST_ITEM_MENU_POPUP,
  MOVE_ACTION_NOTE_COMMANDS, MOVE_ACTION_NOTE_ITEM_MENU, DELETE_ACTION_NOTE_COMMANDS,
  DELETE_ACTION_NOTE_ITEM_MENU, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_LIST_NAME, MY_NOTES, TRASH, ARCHIVE, ID, NEW_NOTE, NEW_NOTE_OBJ,
  ADDED_DT, UPDATED_DT, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING, N_NOTES,
  N_DAYS, CD_ROOT, NOTES, IMAGES, SETTINGS, INFO, INDEX, DOT_JSON, SHOW_SYNCED, PINS,
  LG_WIDTH, IMAGE_FILE_EXTS, IAP_VERIFY_URL, IAP_STATUS_URL, PADDLE, COM_JUSTNOTECC,
  COM_JUSTNOTECC_SUPPORTER, SIGNED_TEST_STRING, VALID, INVALID, ACTIVE, UNKNOWN,
  SWAP_LEFT, SWAP_RIGHT, SETTINGS_VIEW_ACCOUNT, SETTINGS_VIEW_LISTS, WHT_MODE,
  BLK_MODE, CUSTOM_MODE, FEATURE_PIN, FEATURE_APPEARANCE, FEATURE_DATE_FORMAT,
  FEATURE_SECTION_NOTES_BY_MONTH, FEATURE_MORE_EDITOR_FONT_SIZES,
  NOTE_DATE_SHOWING_MODE_HIDE, NOTE_DATE_SHOWING_MODE_SHOW, NOTE_DATE_FORMATS,
  PADDLE_RANDOM_ID,
} from '../types/const';
import {
  throttle, extractUrl, urlHashToObj, objToUrlHash, isBusyStatus, isEqual,
  separateUrlAndParam, getUserImageUrl, randomString, sleep, isObject, isString,
  isNumber, isListNameObjsValid, indexOfClosingTag, isTitleEqual, isBodyEqual,
  clearNoteData, getStaticFPath, deriveFPaths, getListNameObj, getAllListNames,
  getMainId, createNoteFPath, createDataFName, extractNoteFPath, extractDataFName,
  extractDataId, listNoteIds, getNoteFPaths, getStaticFPaths, createSettingsFPath,
  getSettingsFPaths, getLastSettingsFPaths, getInfoFPath, getLatestPurchase,
  getValidPurchase, doEnableExtraFeatures, extractPinFPath, getPinFPaths, getPins,
  getSortedNotes, separatePinnedValues, getRawPins, getFormattedTime,
  get24HFormattedTime, getWindowSize, getNote, getEditingListNameEditors,
  batchGetFileWithRetry, getListNamesFromNoteIds,
} from '../utils';
import { isUint8Array, isBlob, convertBlobToDataUrl } from '../utils/index-web';
import { _ } from '../utils/obj';
import { initialSettingsState, initialInfoState } from '../types/initialStates';
import vars from '../vars';

const jhfp = require('../jhfp');

let popStateListener, hashChangeListener;
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

  const { windowWidth, windowHeight, visualWidth, visualHeight } = getWindowSize();

  const darkMatches = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const is24HFormat = null;
  const localSettings = await dataApi.getLocalSettings();

  // Need to fetch all here as some note ids might change.
  const unsavedNotes = await dataApi.getUnsavedNotes();

  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      isUserDummy,
      username,
      userImage,
      href: window.location.href,
      windowWidth,
      windowHeight,
      visualWidth,
      visualHeight,
      systemThemeMode: darkMatches ? BLK_MODE : WHT_MODE,
      is24HFormat,
      localSettings,
      unsavedNotes,
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

    dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      dispatch({
        type: UPDATE_VISUAL_SIZE,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
        },
      });
    }, 16));
  }

  window.addEventListener('beforeunload', (e) => {
    const isUserSignedIn = userSession.isUserSignedIn();
    if (isUserSignedIn) {
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
        return e.returnValue = 'It looks like your changes to the settings haven\'t been saved. Do you want to leave this site and discard your changes?';
      }

      const listNameEditors = getState().listNameEditors;
      const listNameMap = getState().settings.listNameMap;
      const editingLNEs = getEditingListNameEditors(listNameEditors, listNameMap);
      if (isObject(editingLNEs)) {
        e.preventDefault();
        return e.returnValue = 'It looks like your changes to the list names haven\'t been saved. Do you want to leave this site and discard your changes?';
      }
    }
  }, { capture: true });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const systemThemeMode = e.matches ? BLK_MODE : WHT_MODE;
    dispatch({ type: UPDATE_SYSTEM_THEME_MODE, payload: systemThemeMode });
  });
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
  } catch (error) {
    console.log('Catched an error thrown by handlePendingSignIn', error);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const { separatedUrl } = separateUrlAndParam(window.location.href, 'authResponse');
  window.history.replaceState(window.history.state, '', separatedUrl);

  const isUserSignedIn = userSession.isUserSignedIn();
  if (isUserSignedIn) await resetState(dispatch);

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
  await resetState(dispatch);
};

export const updateUserData = (data) => async (dispatch, getState) => {
  userSession.updateUserData(data);

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
      username: userData.username,
      image: getUserImageUrl(userData),
    },
  });

  redirectToMain();
};

const resetState = async (dispatch) => {
  lsgApi.removeItemSync(PADDLE_RANDOM_ID);

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

export const handleUrlHash = () => {
  const allowedHashes = [
    HASH_LANDING, HASH_LANDING_MOBILE, HASH_ABOUT, HASH_TERMS, HASH_PRIVACY,
    HASH_SUPPORT,
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

export const redirectToMain = () => {
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

      if (vars.updateSettings.doFetch) return;
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
      if (vars.updateSettings.doFetch) return;

      const listName = getState().display.listName;
      if (listName === TRASH && vars.deleteOldNotes.ids) return;

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
  const staticFPaths = getStaticFPaths(getState());
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
  const keys = await fileApi.listKeys();
  const imgKeys = keys.filter(key => key.includes(IMAGES + '/'));
  const imgFPaths = imgKeys.map(key => key.slice(key.indexOf(IMAGES + '/')));

  unusedFPaths = [];
  for (const fpath of imgFPaths) {
    if (usedFPaths.includes(fpath)) continue;
    unusedFPaths.push(fpath);
  }
  unusedFPaths = unusedFPaths.slice(0, N_NOTES);

  await fileApi.deleteFiles(unusedFPaths);

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

  // Paddle with Master card causes closing the settings popup not working.
  // Like there are several same items in history stack and need to back serveral times.
  if (!isShown) {
    await sleep(250);
    if (window.location.hash.includes('stp=true')) {
      console.log('Seem settings popup is still showing, force reset.');
      window.location.hash = ''; // Need to reset i.e. close search popup too.
    }
  }
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

  const doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  const payload = { settings, doFetch };

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

export const updateStgsAndInfo = () => async (dispatch, getState) => {
  await updateSettings(dispatch, getState);
  await updateInfo(dispatch, getState);
};

export const retryDiedSettings = () => async (dispatch, getState) => {
  await updateSettings(dispatch, getState);
};

export const cancelDiedSettings = () => async (dispatch, getState) => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  const noteFPaths = getNoteFPaths(getState());
  const { noteIds, conflictedIds } = listNoteIds(noteFPaths);

  const listNames = getListNamesFromNoteIds(noteIds, conflictedIds);
  const doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  const payload = { listNames, settings: snapshotSettings, doFetch };

  vars.updateSettings.doFetch = doFetch;
  dispatch({ type: CANCEL_DIED_SETTINGS, payload });

  vars.updateSettings.doFetch = false;
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
 * 1 - force, update immediately no matter what
 * 2 - no update even there is a change
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

const importAllDataLoop = async (dispatch, fpaths, contents) => {
  let total = fpaths.length, doneCount = 0;
  dispatch(updateImportAllDataProgress({ total, done: doneCount }));

  try {
    for (let i = 0; i < fpaths.length; i += N_NOTES) {
      const _fpaths = fpaths.slice(i, i + N_NOTES);
      const _contents = contents.slice(i, i + N_NOTES);
      await dataApi.putFiles(_fpaths, _contents);

      doneCount += _fpaths.length;
      dispatch(updateImportAllDataProgress({ total, done: doneCount }));

      await sleep(1000); // Make it slow to not overwhelm the server
    }
  } catch (error) {
    dispatch(updateImportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
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

const parseImportedFile = async (dispatch, settingsParentIds, fileContent) => {

  dispatch(updateImportAllDataProgress({ total: 'calculating...', done: 0 }));

  let zip;
  try {
    // @ts-ignore
    zip = await import('@zip.js/zip.js');
  } catch (error) {
    dispatch(updateImportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  // 1 format: zip file
  let fpaths = [], contents = [], addedDT = Date.now(), idMap = {}, settingsParts = [];
  let pinFPathParts = [], pinIds = [], pinContents = [];
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
      fpath.startsWith(PINS) ||
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

      const { id, parentIds } = extractDataFName(fpathParts[2]);
      if (!(/^\d+[A-Za-z]+$/.test(id))) continue;
      if (parentIds) {
        if (!parentIds.every(id => (/^\d+[A-Za-z]+$/.test(id)))) continue;
      }

      if (fpathParts[3] === INDEX + DOT_JSON) {
        try {
          // @ts-ignore
          content = JSON.parse(content);
          if (
            !('title' in content && 'body' in content)
          ) continue;
          if (!(isString(content.title) && isString(content.body))) continue;
        } catch (error) {
          console.log('parseImportedFile: JSON.parse note content error: ', error);
          continue;
        }
      } else if (fpathParts[3] === CD_ROOT) {
        if (fpathParts[4] !== IMAGES) continue;
      } else continue;

      // Treat import notes as adding new notes, replace note id with a new one.
      if (!idMap[fpathParts[2]]) {
        // If there's a parent, add a parent id with empty note content.
        let rootId = null;
        if (parentIds && parentIds.length > 0) {
          rootId = parentIds[0];
          const { dt } = extractDataId(rootId);
          while (rootId === parentIds[0]) rootId = `${dt}${randomString(4)}`;

          const rootFPathParts = [...fpathParts.slice(0, 4)];
          rootFPathParts[2] = rootId;
          rootFPathParts[3] = INDEX + DOT_JSON;
          fpaths.push(rootFPathParts.join('/'));
          contents.push({ title: '', body: '' });
        }

        let newId = id;
        const { dt } = extractDataId(newId);
        while (newId === id) newId = `${dt}${randomString(4)}`;

        let newFName = rootId ? `${newId}_${rootId}` : newId;
        idMap[fpathParts[2]] = newFName;
        idMap[id] = newId;
      }
      fpathParts[2] = idMap[fpathParts[2]];
      fpath = fpathParts.join('/');
    } else if (fpath.startsWith(IMAGES)) {
      if (fpathParts.length !== 2 || fpathParts[0] !== IMAGES) continue;
      if (fnameParts.length !== 2) continue;
    } else if (fpath.startsWith(PINS)) {
      if (fpathParts.length !== 5 || fpathParts[0] !== PINS) continue;
      if (fnameParts.length !== 2) continue;

      const updatedDT = fpathParts[2], addedDT = fpathParts[3], fname = fpathParts[4];
      if (!(/^\d+$/.test(updatedDT))) continue;
      if (!(/^\d+$/.test(addedDT))) continue;
      if (!fname.endsWith('.json')) continue;

      try {
        // @ts-ignore
        content = JSON.parse(content);
        if (!isEqual(content, {})) continue;
      } catch (error) {
        console.log('parseImportedFile: JSON.parse pin content error: ', error);
        continue;
      }

      pinFPathParts.push(fpathParts);
      pinIds.push(fnameParts[0]);
      pinContents.push(content);
      continue;
    } else if (fpath.startsWith(SETTINGS)) {
      if (!fpath.endsWith(DOT_JSON)) continue;

      let dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
      if (!isNumber(dt)) continue;

      try {
        // @ts-ignore
        content = JSON.parse(content);

        const settings = { ...initialSettingsState };
        if ([true, false].includes(content.doDeleteOldNotesInTrash)) {
          settings.doDeleteOldNotesInTrash = content.doDeleteOldNotesInTrash;
        }
        if ([ADDED_DT, UPDATED_DT].includes(content.sortOn)) {
          settings.sortOn = content.sortOn;
        }
        if ([true, false].includes(content.doDescendingOrder)) {
          settings.doDescendingOrder = content.doDescendingOrder;
        }
        if ([true, false].includes(content.doAlertScreenRotation)) {
          settings.doAlertScreenRotation = content.doAlertScreenRotation;
        }
        if ([
          NOTE_DATE_SHOWING_MODE_HIDE, NOTE_DATE_SHOWING_MODE_SHOW,
        ].includes(content.noteDateShowingMode)) {
          settings.noteDateShowingMode = content.noteDateShowingMode;
        }
        if (NOTE_DATE_FORMATS.includes(content.noteDateFormat)) {
          settings.noteDateFormat = content.noteDateFormat;
        }
        if ([true, false].includes(content.noteDateIsTwoDigit)) {
          settings.noteDateIsTwoDigit = content.noteDateIsTwoDigit;
        }
        if ([true, false].includes(content.noteDateIsCurrentYearShown)) {
          settings.noteDateIsCurrentYearShown = content.noteDateIsCurrentYearShown;
        }
        if ([true, false].includes(content.doSectionNotesByMonth)) {
          settings.doSectionNotesByMonth = content.doSectionNotesByMonth;
        }
        if ([true, false].includes(content.doMoreEditorFontSizes)) {
          settings.doMoreEditorFontSizes = content.doMoreEditorFontSizes;
        }
        if ('listNameMap' in content && isListNameObjsValid(content.listNameMap)) {
          settings.listNameMap = content.listNameMap;
        }
        content = settings;
      } catch (error) {
        console.log('parseImportedFile: JSON.parse settings content error: ', error);
        continue;
      }

      // Choose the latest one.
      settingsParts.push({ dt, content });
      continue;
    } else if (fpath.startsWith('Takeout/Keep/')) {
      if (fpathParts.length < 3) continue;
      if (fnameParts.length < 2) continue;

      if (fname === 'Labels.txt') {
        if (!isString(content)) continue;

        const settings = { ...initialSettingsState };
        // @ts-ignore
        for (const label of content.split('\n')) {
          if (!label) continue;

          const id = `${addedDT}-${randomString(4)}`;
          settings.listNameMap.push({ listName: id, displayName: label });
          idMap[label] = id;
          addedDT += 1;
        }
        content = settings;

        settingsParts.push({ dt: addedDT, content });
        addedDT += 1;
        continue;
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
          // @ts-ignore
          content = JSON.parse(content);
        } catch (error) {
          console.log('parseImportedFile: JSON.parse Keep content error: ', error);
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

  // Need idMap to be all populated before mapping pinId to a new id.
  for (let i = 0; i < pinFPathParts.length; i++) {
    const fpathParts = pinFPathParts[i];
    const id = pinIds[i];
    const content = pinContents[i];

    if (idMap[id]) {
      fpathParts[fpathParts.length - 1] = idMap[id] + '.json';

      fpaths.push(fpathParts.join('/'));
      contents.push(content);
    }
  }

  let latestSettingsPart;
  for (const settingsPart of settingsParts) {
    if (!isObject(latestSettingsPart)) {
      latestSettingsPart = settingsPart;
      continue;
    }
    if (latestSettingsPart.dt < settingsPart.dt) latestSettingsPart = settingsPart;
  }
  if (isObject(latestSettingsPart)) {
    const fname = createDataFName(`${addedDT}${randomString(4)}`, settingsParentIds);
    fpaths.push(createSettingsFPath(fname));
    contents.push(latestSettingsPart.content);
    addedDT += 1;
  }

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
        } catch (error) {
          console.log('parseImportedFile: Evernote task tag error', error);
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
        } catch (error) {
          console.log('parseImportedFile: Evernote todo tag error', error);
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
        } catch (error) {
          console.log('parseImportedFile: Evernote code block tag error', error);
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
  const settingsFPaths = getSettingsFPaths(getState());
  const { ids: settingsParentIds } = getLastSettingsFPaths(settingsFPaths);

  const onError = () => {
    window.alert('Read failed: could not read content in the file. Please recheck your file.');
  };

  const onReaderLoad = (e) => {
    parseImportedFile(dispatch, settingsParentIds, e.target.result);
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
  let doneCount = 0;
  dispatch(updateExportAllDataProgress({ total: 'calculating...', done: doneCount }));

  // Need to manually call it to wait for it properly!
  await sync(true, 2)(dispatch, getState);

  let fpaths = [], rootIds = {}, toRootIds;
  try {
    const { noteFPaths, settingsFPaths, pinFPaths } = await dataApi.listFPaths(true);
    const { noteIds, conflictedIds, toRootIds: _toRootIds } = listNoteIds(noteFPaths);

    for (const noteId of [...noteIds, ...conflictedIds]) {
      for (const fpath of noteId.fpaths) {
        fpaths.push(fpath);
        if (fpath.includes(CD_ROOT + '/')) fpaths.push(getStaticFPath(fpath));
      }
      rootIds[noteId.id] = `${noteId.addedDT}${randomString(4)}`;
    }

    const { fpaths: lastSettingsFPaths } = getLastSettingsFPaths(settingsFPaths);
    if (lastSettingsFPaths.length > 0) fpaths.push(lastSettingsFPaths[0]);

    const pins = {};
    for (const fpath of pinFPaths) {
      const { id, updatedDT } = extractPinFPath(fpath);

      const _id = id.startsWith('deleted') ? id.slice(7) : id;
      const pinMainId = getMainId(_id, _toRootIds);

      // duplicate id, choose the latest updatedDT
      if (pinMainId in pins && pins[pinMainId].updatedDT > updatedDT) continue;
      pins[pinMainId] = { updatedDT, id, fpath };
    }
    for (const pinMainId in pins) {
      if (pins[pinMainId].id.startsWith('deleted')) continue;
      fpaths.push(pins[pinMainId].fpath);
    }

    fpaths = [...new Set(fpaths)];
    toRootIds = _toRootIds;
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  const total = fpaths.length;
  dispatch(updateExportAllDataProgress({ total, done: doneCount }));

  if (total === 0) return;

  try {
    // @ts-ignore
    const zip = await import('@zip.js/zip.js');
    const zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'));

    const errorResponses = [], pinFPaths = [], pinContents = [], idMap = {};
    for (let i = 0; i < fpaths.length; i += N_NOTES) {
      const successResponses = [];
      const selectedFPaths = fpaths.slice(i, i + N_NOTES);
      const responses = await batchGetFileWithRetry(
        dataApi.getApi().getFile, selectedFPaths, 0, true
      );
      for (const response of responses) {
        if (response.success) successResponses.push(response);
        else errorResponses.push(response);
      }

      const filteredResponses = [];
      for (let { fpath, content } of successResponses) {
        if (fpath.startsWith(PINS)) {
          pinFPaths.push(fpath);
          pinContents.push(content);
          continue;
        }

        if (fpath.startsWith(NOTES)) {
          const { listName, fname, subName } = extractNoteFPath(fpath);
          const { id, parentIds } = extractDataFName(fname);
          if (parentIds && rootIds[id]) {
            const newFName = createDataFName(id, [rootIds[id]]);
            fpath = createNoteFPath(listName, newFName, subName);
          }
          idMap[toRootIds[id]] = id;
        }

        filteredResponses.push({ fpath, content });
      }

      await Promise.all(filteredResponses.map(({ fpath, content }) => {
        if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

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
      if (doneCount < total || errorResponses.length === 0) {
        dispatch(updateExportAllDataProgress({ total, done: doneCount }));
      }
    }

    // Need idMap to be all populated before mapping pinId to a new id.
    for (let i = 0; i < pinFPaths.length; i++) {
      let fpath = pinFPaths[i];
      let content = pinContents[i];

      const fpathParts = fpath.split('/');
      const id = fpathParts[fpathParts.length - 1].split('.')[0];

      if (idMap[toRootIds[id]]) {
        // If conflicts, only one will get pinned but it should be fine
        //   as conflicted notes are exported separately as not conflicted.
        fpathParts[fpathParts.length - 1] = idMap[toRootIds[id]] + '.json';
        fpath = fpathParts.join('/');
      }
      content = JSON.stringify(content);

      const reader = new zip.TextReader(content);
      await zipWriter.add(fpath, reader);
    }

    const blob = await zipWriter.close();
    saveAs(blob, 'justnote-data.zip');

    if (errorResponses.length > 0) {
      dispatch(updateExportAllDataProgress({
        total: -1,
        done: -1,
        error: 'Some download requests failed. Data might be missing in the exported file.',
      }));
    }
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
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
  let doneCount = 0;
  dispatch(updateDeleteAllDataProgress({ total: 'calculating...', done: doneCount }));

  // Need to manually call it to wait for it properly!
  await sync(true, 2)(dispatch, getState);

  let allNoteIds, staticFPaths, settingsFPaths, settingsIds, infoFPath, pins;
  try {
    const fpaths = await dataApi.listFPaths(true);
    const noteIds = listNoteIds(fpaths.noteFPaths);

    allNoteIds = [...noteIds.noteIds, ...noteIds.conflictedIds];
    staticFPaths = fpaths.staticFPaths;
    settingsFPaths = fpaths.settingsFPaths;
    infoFPath = fpaths.infoFPath;
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

  const lastSettingsFPaths = getLastSettingsFPaths(settingsFPaths);
  [settingsFPaths, settingsIds] = [lastSettingsFPaths.fpaths, lastSettingsFPaths.ids];
  if (settingsFPaths.length === 1) {
    const { contents } = await dataApi.getFiles(settingsFPaths, true);
    if (isEqual(initialSettingsState, contents[0])) {
      [settingsFPaths, settingsIds] = [[], []];
    }
  }

  if (infoFPath) {
    const { contents } = await dataApi.getFiles([infoFPath], true);
    if (isEqual(initialInfoState, contents[0])) infoFPath = null;
  }

  const total = (
    allNoteIds.length + staticFPaths.length + settingsFPaths.length +
    (infoFPath ? 1 : 0) + pins.length
  );
  dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));

  if (total === 0) return;

  try {
    if (allNoteIds.length > 0) {
      await deleteAllNotes(dispatch, allNoteIds, total, doneCount);

      doneCount += allNoteIds.length;
      dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
    }
    if (staticFPaths.length > 0) {
      await dataApi.deleteServerFiles(staticFPaths);

      doneCount += staticFPaths.length;
      dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
    }
    if (settingsFPaths.length > 0) {
      const addedDT = Date.now();
      const fname = createDataFName(`${addedDT}${randomString(4)}`, settingsIds);
      const newSettingsFPath = createSettingsFPath(fname);

      await dataApi.putFiles([newSettingsFPath], [{ ...initialSettingsState }]);
      try {
        await dataApi.putFiles(settingsFPaths, settingsFPaths.map(() => ({})));
      } catch (error) {
        console.log('deleteAllData error: ', error);
        // error in this step should be fine
      }

      doneCount += settingsFPaths.length;
      dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
    }
    if (infoFPath) {
      const addedDT = Date.now();
      const newInfoFPath = `${INFO}${addedDT}${DOT_JSON}`;

      await dataApi.putFiles([newInfoFPath], [{ ...initialInfoState }]);
      try {
        await dataApi.deleteFiles([infoFPath]);
      } catch (error) {
        console.log('deleteAllData error: ', error);
        // error in this step should be fine
      }

      doneCount += 1;
      dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
    }
    if (pins.length > 0) {
      await deleteAllPins(dispatch, pins, total, doneCount);

      doneCount += pins.length;
      dispatch(updateDeleteAllDataProgress({ total, done: doneCount }));
    }
    await fileApi.deleteFiles(staticFPaths);

    // Need to close the settings popup to update the url hash,
    //   as DELETE_ALL_DATA will set isSettingsPopupShown to false.
    if (getState().display.isSettingsPopupShown) {
      vars.updateSettingsPopup.didCall = true;
      updatePopupUrlHash(SETTINGS_POPUP, false);
    }
    dispatch({ type: DELETE_ALL_DATA });

    await sync(false, 1)(dispatch, getState);
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

  const source = PADDLE;

  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const userId = sigObj.publicKey;

  const productId = rawPurchase.productId;
  const token = rawPurchase.purchaseToken;
  const paddleUserId = rawPurchase.paddleUserId;
  const passthrough = rawPurchase.passthrough;

  if (!token) {
    console.log('No purchaseToken in rawPurchase');
    return { status: INVALID };
  }

  const reqBody = { source, userId, productId, token, paddleUserId, passthrough };

  let verifyResult;
  try {
    const res = await axios.post(IAP_VERIFY_URL, reqBody);
    verifyResult = res.data;
  } catch (error) {
    console.log(`Error when contact IAP server to verify with reqBody: ${JSON.stringify(reqBody)}, Error: `, error);
    return { status: UNKNOWN };
  }

  return verifyResult;
};

const getIapStatus = async (doForce) => {
  const sigObj = await userSession.signECDSA(SIGNED_TEST_STRING);
  const randomId = await lsgApi.getItem(PADDLE_RANDOM_ID);
  const reqBody = {
    source: PADDLE,
    userId: sigObj.publicKey,
    signature: sigObj.signature,
    appId: COM_JUSTNOTECC,
    doForce: doForce,
    randomId: randomId,
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

  dispatch({ type: commitAction, payload: statusResult });
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
    registerIapListeners(true, dispatch, getState);

    let products = null;
    if (canMakePayments) {
      products = await iapApi.getSubscriptions([COM_JUSTNOTECC_SUPPORTER]);
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
    await iapApi.requestSubscription(product.productId);
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

    await sync()(dispatch, getState);
  }
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

const replaceImageUrls = async (body) => {
  const sources = [];
  for (const match of body.matchAll(/<img[^>]+?src="([^"]+)"[^>]*>/gi)) {
    const src = match[1];
    if (src.startsWith(CD_ROOT + '/')) sources.push(src);
  }

  for (const src of sources) {
    let content = await fileApi.getFile(src);
    if (isUint8Array(content)) content = new Blob([content]);
    if (isBlob(content)) {
      const dataUrl = await convertBlobToDataUrl(content);
      body = body.replace(src, dataUrl);
    }
  }

  return body;
};

export const viewNoteAsWebpage = () => async (dispatch, getState) => {
  // Safari is blocking window.open() which is made inside an async call.
  // So need to call it before any awaits.
  // https://stackoverflow.com/a/39387533
  const w = window.open();

  const { listName, selectingNoteId } = getState().display;
  const note = getState().notes[listName][selectingNoteId];
  const body = await replaceImageUrls(note.body);

  let html = `${jhfp}`;
  html = html.replace(/__-title-__/g, note.title);
  html = html.replace(/__-body-__/g, body);
  html = html.replace(' mx-12 my-16"', '"');

  w.document.write(html);
  w.document.close();
};
