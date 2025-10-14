import TaskQueue from 'queue';

import userSession from '../userSession';
import idxApi from '../apis';
import lsgApi from '../apis/localSg';
import { updateStgsAndInfo } from '../importWrapper';
import {
  INIT, UPDATE_HREF, UPDATE_WINDOW, UPDATE_USER, INCREASE_REDIRECT_TO_MAIN_COUNT,
  UPDATE_SEARCH_STRING, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_BULK_EDITING,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, REFRESH_FETCHED,
  INCREASE_UPDATE_NOTE_ID_COUNT, INCREASE_BLUR_COUNT, INCREASE_UPDATE_BULK_EDIT_COUNT,
  INCREASE_WEBVIEW_KEY_COUNT, UPDATE_UNSAVED_NOTE, DELETE_UNSAVED_NOTES,
  UPDATE_STACKS_ACCESS, UPDATE_SYSTEM_THEME_MODE, UPDATE_IS_24H_FORMAT,
  INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  SIGN_UP_POPUP, SIGN_IN_POPUP, NOTE_LIST_MENU_POPUP, NOTE_LIST_ITEM_MENU_POPUP,
  LIST_NAMES_POPUP, PIN_MENU_POPUP, BULK_EDIT_MENU_POPUP, TAG_EDITOR_POPUP,
  SIDEBAR_POPUP, SEARCH_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP,
  SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP, DATE_FORMAT_MENU_POPUP,
  CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP, CONFIRM_AS_DUMMY_POPUP,
  CONFIRM_EXIT_DUMMY_POPUP, PAYWALL_POPUP, LOCK_MENU_POPUP, LOCK_EDITOR_POPUP,
  SWWU_POPUP, TRASH, NEW_NOTE, NEW_NOTE_OBJ, LG_WIDTH, WHT_MODE, BLK_MODE,
  PADDLE_RANDOM_ID,
} from '../types/const';
import {
  throttle, isBusyStatus, getUserUsername, getUserImageUrl, isEqual, isObject,
  isString, isNumber, isFldStr, isTitleEqual, isBodyEqual, getWindowInsets, getNote,
  getEditingListNameEditors, getEditingTagNameEditors, randomString,
  getPopupHistoryStateIndex, reorderPopupHistoryStates, toPx,
} from '../utils';
import vars from '../vars';

const navQueue = new TaskQueue({ concurrency: 1, autostart: true, timeout: 1200 });
navQueue.addEventListener('timeout', (e) => {
  console.log('navQueue timed out:', e);
});

export const syncQueue = new TaskQueue({ concurrency: 1, autostart: true });
export const taskQueue = new TaskQueue({ concurrency: 1, autostart: true });

let popStateListener, _didInit;
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

  popStateListener = () => {
    onPopStateChange(dispatch, getState);
  };
  window.addEventListener('popstate', popStateListener);

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

  const toLg = prevWidth < toPx(LG_WIDTH) && window.innerWidth >= toPx(LG_WIDTH);
  const fromLg = prevWidth >= toPx(LG_WIDTH) && window.innerWidth < toPx(LG_WIDTH);
  if (!toLg && !fromLg) return;

  const noteId = getState().display.noteId;
  if (noteId) {
    if (fromLg) {
      // Must insert UPDATE_NOTE_ID in vars.popupHistory.states
      //   at the current index or before it if some popups are shown.
      // The popups can be ListNamesPopup, SettingsPopup, etc.
      // Do nothing for now.
    } else if (toLg) {
      // Move UPDATE_NOTE_ID to the current index in vars.popupHistory.states
      // Call window.history.back()
      // Prevent browser forward button by check, if yes, back()
      // Do nothing for now
    }
  }
};

const getCanBckPopups = (getState) => {
  const state = getState();
  const canBckPopups = {
    [SIGN_UP_POPUP]: {
      canFwd: true, isShown: state.display.isSignUpPopupShown,
    },
    [SIGN_IN_POPUP]: {
      canFwd: true, isShown: state.display.isSignInPopupShown,
    },
    [NOTE_LIST_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isNoteListMenuPopupShown,
    },
    [NOTE_LIST_ITEM_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isNoteListItemMenuPopupShown,
    },
    [LIST_NAMES_POPUP]: {
      canFwd: false, isShown: state.display.isListNamesPopupShown,
    },
    [PIN_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isPinMenuPopupShown,
    },
    [BULK_EDIT_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isBulkEditMenuPopupShown,
    },
    [TAG_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isTagEditorPopupShown,
    },
    [SIDEBAR_POPUP]: {
      canFwd: true, isShown: state.display.isSidebarPopupShown,
    },
    [SEARCH_POPUP]: {
      canFwd: true, isShown: state.display.isSearchPopupShown,
    },
    [SETTINGS_POPUP]: {
      canFwd: true, isShown: state.display.isSettingsPopupShown,
    },
    [SETTINGS_LISTS_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isSettingsListsMenuPopupShown,
    },
    [SETTINGS_TAGS_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isSettingsTagsMenuPopupShown,
    },
    [TIME_PICK_POPUP]: {
      canFwd: false, isShown: state.display.isTimePickPopupShown,
    },
    [DATE_FORMAT_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isDateFormatMenuPopupShown,
    },
    [CONFIRM_DELETE_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmDeletePopupShown,
    },
    [CONFIRM_DISCARD_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmDiscardPopupShown,
    },
    [CONFIRM_AS_DUMMY_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmAsDummyPopupShown,
    },
    [CONFIRM_EXIT_DUMMY_POPUP]: {
      canFwd: false, isShown: state.display.isConfirmExitDummyPopupShown,
    },
    [PAYWALL_POPUP]: {
      canFwd: false, isShown: state.display.isPaywallPopupShown,
    },
    [LOCK_MENU_POPUP]: {
      canFwd: false, isShown: state.display.isLockMenuPopupShown,
    },
    [LOCK_EDITOR_POPUP]: {
      canFwd: false, isShown: state.display.isLockEditorPopupShown,
    },
  };
  return canBckPopups;
};

const canPopupBckBtn = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return true;
  return false;
};

const canPopupFwdBtn = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return canBckPopups[id].canFwd;
  return false;
};

const isPopupShownWthId = (canBckPopups, id) => {
  if (isObject(canBckPopups[id])) return canBckPopups[id].isShown;
  console.log('Called isPopupShownWthId with unsupported id:', id);
  return false;
};

const onPopStateChange = (dispatch, getState) => {
  const safeAreaWidth = getState().window.width;
  const ltLg = isNumber(safeAreaWidth) && safeAreaWidth < toPx(LG_WIDTH);
  const chs = window.history.state;
  const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);

  // Note id & Bulk edit
  let noteId = null, isBulkEditing = false;
  if (idx >= 0) {
    for (let i = idx; i >= 0; i--) {
      const phs = vars.popupHistory.states[i];
      if (phs.type === UPDATE_NOTE_ID && noteId === null) noteId = phs.id;
      if (phs.type === UPDATE_BULK_EDITING) isBulkEditing = true;
    }
  }

  const curNoteId = getState().display.noteId;
  const curIsBulkEditing = getState().display.isBulkEditing;

  /* ltLg   noteId    curNoteId
     true    null        null                do nothing
     true    null        not null            unsaved & update id null
     true    not null    null                update id
     true    not null    not null    same    do nothing
                                     diff    do nothing (e.g., new -> id)
     bulkEdit  curBulkEdit
      false      false               do nothing
      false      true                set false
      true       false               unsaved & set true
      true       true                do nothing
  */
  if (
    (ltLg && !isFldStr(noteId) && isFldStr(curNoteId)) ||
    (isBulkEditing && !curIsBulkEditing)
  ) {
    // press back button, need to move editingNote to unsavedNote here.
    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) dispatch(handleUnsavedNote(curNoteId));
  }

  if (
    (ltLg && !isFldStr(noteId) && isFldStr(curNoteId)) ||
    (ltLg && isFldStr(noteId) && !isFldStr(curNoteId))
  ) {
    dispatch({ type: UPDATE_NOTE_ID, payload: noteId });
  }
  if (
    (!isBulkEditing && curIsBulkEditing) ||
    (isBulkEditing && !curIsBulkEditing)
  ) {
    dispatch({ type: UPDATE_BULK_EDITING, payload: isBulkEditing });
  }

  // Popups
  const canBckPopups = getCanBckPopups(getState);

  const hss = vars.popupHistory.states.slice(idx + 1);
  const cPopupIds = hss.filter(s => s.type === UPDATE_POPUP).map(s => s.id);
  const uPopupIds = [...new Set(cPopupIds)];
  for (const id of uPopupIds) {
    if (isPopupShownWthId(canBckPopups, id)) {
      if (id === SETTINGS_POPUP) {
        // Must keep align with updateSettingsPopup(false, false)
        //   and if forward, must keep align with updateSettingsPopup(true).
        dispatch(updateStgsAndInfo());
      }
      dispatch({
        type: UPDATE_POPUP, payload: { id, isShown: false },
      });

      if (id === SEARCH_POPUP) {
        // Clear search string
        //   and need to defocus too to prevent keyboard appears on mobile
        dispatch(updateSearchString(''));

        if (window.document.activeElement instanceof HTMLInputElement) {
          window.document.activeElement.blur();
        }
      }
    }
  }

  /* action    canPopupFwdBtn    isShown
     forward       true           true       do nothing
     forward       true           false      set show
     forward       false          true       Impossible (do nothing)
     forward       false          false      go back
     back          true           true       do nothing
     back          true           false      Impossible (set show)
     back          false          true       do nothing
     back          false          false      Impossible (set show)
  */
  if (idx >= 0) { // Support forward by open the current one if can.
    const phs = vars.popupHistory.states[idx];
    if (phs.type === UPDATE_POPUP) {
      if (canPopupFwdBtn(canBckPopups, phs.id)) {
        if (!isPopupShownWthId(canBckPopups, phs.id)) {
          dispatch({
            type: UPDATE_POPUP, payload: { id: phs.id, isShown: true },
          });
        }
      } else {
        if (!isPopupShownWthId(canBckPopups, phs.id)) {
          window.history.back();
        }
      }
    }
  }
};

export const signOut = () => async (dispatch, getState) => {
  // Wait for menuPopup to close first so the popup does not get already unmount.
  const task = async () => {
    userSession.signUserOut();
    await resetState(dispatch);
  };
  navQueue.push(task);
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

  dispatch({ type: INCREASE_REDIRECT_TO_MAIN_COUNT });
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

export const updateStacksAccess = (data) => {
  return { type: UPDATE_STACKS_ACCESS, payload: data };
};

const updateNoteIdInQueue = (id, dispatch, getState) => () => {
  return new Promise<void>((resolve) => {
    const curValue = getState().display.noteId;

    vars.displayReducer.doRightPanelAnimateHidden = true;
    dispatch({ type: UPDATE_NOTE_ID, payload: id });

    /* id       curValue
       null       null       phs valid       back
       null       null       phs invalid     do nothing
       null       not-null   phs valid       back
       null       not-null   phs invalid     do nothing (width >= LG)
       not-null   null       width < LG      history.push
       not-null   null       width >= LG     do nothing
       not-null   not-null   width < LG      Impossible (do nothing)
       not-null   not-null   width >= LG     do nothing
    */
    const safeAreaWidth = getState().window.width;
    const ltLg = isNumber(safeAreaWidth) && safeAreaWidth < toPx(LG_WIDTH);
    const chs = window.history.state;
    const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);
    const type = UPDATE_NOTE_ID;
    if (ltLg && isFldStr(id) && !isFldStr(curValue)) {
      const phs = { phsId: `${Date.now()}-${randomString(4)}`, type, id };

      if (idx >= 0) {
        vars.popupHistory.states = [
          ...vars.popupHistory.states.slice(0, idx + 1), phs,
        ];
      } else {
        vars.popupHistory.states = [phs];
      }
      window.history.pushState({ phsId: phs.phsId }, '', window.location.href);

      resolve();
      return;
    }

    let backId = null;
    if (!isFldStr(id) && idx >= 0) {
      for (let i = idx; i >= 0; i--) {
        const phs = vars.popupHistory.states[i];
        if (phs.type === type) {
          backId = phs.id;
          break;
        }
      }
    }
    if (isFldStr(backId)) {
      vars.popupHistory.states = reorderPopupHistoryStates(
        vars.popupHistory.states, idx, type, backId
      );

      const onPopState = () => {
        window.removeEventListener('popstate', onPopState);
        resolve();
      };
      window.addEventListener('popstate', onPopState);
      window.history.back();
      return;
    }

    resolve();
  });
};

export const updateNoteId = (
  id, doGetIdFromState = false, doCheckEditing = false
) => async (dispatch, getState) => {

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

  const task = updateNoteIdInQueue(id, dispatch, getState);
  navQueue.push(task);
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
  return new Promise<void>((resolve) => {
    const canBckPopups = getCanBckPopups(getState);

    dispatch({
      type: UPDATE_POPUP, payload: { id, isShown, anchorPosition },
    });
    if (isShown && isFldStr(replaceId)) {
      dispatch({
        type: UPDATE_POPUP, payload: { id: replaceId, isShown: false },
      });
    }

    if (!canPopupBckBtn(canBckPopups, id)) {
      resolve();
      return;
    }

    /* isShown   currShown   replaceId
         true       true       null       do nothing
         true       true       str        back (Paywall to already open SettingsPopup)
         true       false      null       history.push
         true       false      str        history.replace
         false      true       null       back
         false      true       str        invalid (back)
         false      false      null       do nothing
         false      false      str        invalid (do nothing)
    */
    const chs = window.history.state;
    const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);
    const type = UPDATE_POPUP;
    if (isShown && !isPopupShownWthId(canBckPopups, id)) {
      const phs = { phsId: `${Date.now()}-${randomString(4)}`, type, id };

      if (isFldStr(replaceId)) {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx),
            phs,
            ...vars.popupHistory.states.slice(idx + 1)
          ];
        } else {
          console.log('In updatePopupInQueue, invalid replaceId:', replaceId);
          vars.popupHistory.states = [phs];
        }
        window.history.replaceState({ phsId: phs.phsId }, '', window.location.href);
      } else {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx + 1), phs,
          ];
        } else {
          vars.popupHistory.states = [phs];
        }
        window.history.pushState({ phsId: phs.phsId }, '', window.location.href);
      }

      resolve();
      return;
    }
    if (
      (isShown && isPopupShownWthId(canBckPopups, id) && isFldStr(replaceId)) ||
      (!isShown && isPopupShownWthId(canBckPopups, id))
    ) {
      const backId = !isShown ? id : replaceId;
      vars.popupHistory.states = reorderPopupHistoryStates(
        vars.popupHistory.states, idx, type, backId
      );

      const onPopState = () => {
        window.removeEventListener('popstate', onPopState);
        resolve();
      };
      window.addEventListener('popstate', onPopState);
      window.history.back();
      return;
    }

    resolve();
  });
};

export const updatePopup = (
  id, isShown, anchorPosition = null, replaceId = null
) => async (dispatch, getState) => {
  const task = updatePopupInQueue(
    id, isShown, anchorPosition, replaceId, dispatch, getState
  );
  navQueue.push(task);
};

export const updateSearchString = (searchString) => {
  return { type: UPDATE_SEARCH_STRING, payload: searchString };
};

export const updateHref = (href) => {
  return { type: UPDATE_HREF, payload: href };
};

const updateBulkEditInQueue = (
  isBulkEditing, selectedNoteId, popupToReplace, dispatch, getState
) => () => {
  return new Promise<void>((resolve) => {
    const curValue = getState().display.isBulkEditing;

    dispatch({ type: UPDATE_BULK_EDITING, payload: isBulkEditing });
    if (isBulkEditing && isFldStr(selectedNoteId)) {
      dispatch(addSelectedNoteIds([selectedNoteId]));
    }
    if (isBulkEditing && isFldStr(popupToReplace)) {
      dispatch({
        type: UPDATE_POPUP, payload: { id: popupToReplace, isShown: false },
      });
    }

    /* isBulkEditing   curValue   popupToReplace
        true             true         null          do nothing
        true             true         str           back
        true             false        null          history.push
        true             false        str           history.replace
        false            true         null          back
        false            true         str           not support
        false            false        null          do nothing
        false            false        str           not support
    */
    const chs = window.history.state;
    const idx = getPopupHistoryStateIndex(vars.popupHistory.states, chs);
    const type = UPDATE_BULK_EDITING, id = 'true';
    if (isBulkEditing && !curValue) {
      const phs = { phsId: `${Date.now()}-${randomString(4)}`, type, id };

      if (isFldStr(popupToReplace)) {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx),
            phs,
            ...vars.popupHistory.states.slice(idx + 1)
          ];
        } else {
          console.log('In updateBulkEditInQueue, invalid replaceId:', popupToReplace);
          vars.popupHistory.states = [phs];
        }
        window.history.replaceState({ phsId: phs.phsId }, '', window.location.href);
      } else {
        if (idx >= 0) {
          vars.popupHistory.states = [
            ...vars.popupHistory.states.slice(0, idx + 1), phs,
          ];
        } else {
          vars.popupHistory.states = [phs];
        }
        window.history.pushState({ phsId: phs.phsId }, '', window.location.href);
      }

      resolve();
      return;
    }
    if (
      (isBulkEditing && curValue && isFldStr(popupToReplace)) ||
      (!isBulkEditing && curValue)
    ) {
      vars.popupHistory.states = reorderPopupHistoryStates(
        vars.popupHistory.states, idx, type, id
      );

      const onPopState = () => {
        window.removeEventListener('popstate', onPopState);
        resolve();
      };
      window.addEventListener('popstate', onPopState);
      window.history.back();
      return;
    }

    resolve();
  });
};

export const updateBulkEdit = (
  isBulkEditing, selectedNoteId = null, popupToReplace = null,
  doGetIdFromState = false, doCheckEditing = false
) => async (dispatch, getState) => {

  if (doGetIdFromState) {
    selectedNoteId = vars.updateBulkEdit.selectedNoteId;
    popupToReplace = vars.updateBulkEdit.popupToReplace;
  }
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
      vars.updateBulkEdit.popupToReplace = popupToReplace;
      dispatch(increaseUpdateBulkEditCount());
      return;
    }
  }

  const task = updateBulkEditInQueue(
    isBulkEditing, selectedNoteId, popupToReplace, dispatch, getState
  );
  navQueue.push(task);
};

export const onUpdateBulkEdit = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(updateBulkEdit(true, null, null, true, false));
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
  if (noteId !== null && isNumber(safeAreaWidth) && safeAreaWidth < toPx(LG_WIDTH)) {
    dispatch(updateNoteId(null));
  }

  dispatch({ type: REFRESH_FETCHED });
};

export const increaseWebViewKeyCount = () => {
  return { type: INCREASE_WEBVIEW_KEY_COUNT };
};

export const increaseUpdateNoteIdCount = () => {
  return { type: INCREASE_UPDATE_NOTE_ID_COUNT };
};

export const increaseBlurCount = () => {
  return { type: INCREASE_BLUR_COUNT };
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
  const task = linkToInQueue(router, href);
  navQueue.push(task);
};

export const queueDeleteAllData = () => async (dispatch, getState) => {
  // Wait for SettingsPopup to close first so history.back() works correctly.
  const task = async () => {
    dispatch({ type: DELETE_ALL_DATA });
  };
  navQueue.push(task);
};
