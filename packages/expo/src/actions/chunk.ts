import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { LexoRank } from '@wewatch/lexorank';
import * as Print from 'expo-print';
import { FileSystem } from 'react-native-file-access';
import Share from 'react-native-share';
import { diffLinesRaw, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT } from 'jest-diff';

import userSession from '../userSession';
import dataApi from '../apis/data';
import serverApi from '../apis/server';
import fileApi from '../apis/localFile';
import ecApi from '../apis/encryption';
import {
  UPDATE_LIST_NAME, UPDATE_QUERY_STRING, UPDATE_EDITOR_FOCUSED, UPDATE_EDITOR_BUSY,
  UPDATE_SELECTING_NOTE_ID, FETCH, FETCH_COMMIT, FETCH_ROLLBACK, UPDATE_FETCHED,
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK, CACHE_FETCHED_MORE,
  UPDATE_FETCHED_MORE, ADD_FETCHING_INFO, DELETE_FETCHING_INFO, SET_SHOWING_NOTE_INFOS,
  ADD_NOTE, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK, UPDATE_NOTE, UPDATE_NOTE_COMMIT,
  UPDATE_NOTE_ROLLBACK, DISCARD_NOTE, MOVE_NOTES, MOVE_NOTES_COMMIT,
  MOVE_NOTES_ROLLBACK, DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK,
  CANCEL_DIED_NOTES, DELETE_OLD_NOTES_IN_TRASH, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_ROLLBACK, MERGE_NOTES, MERGE_NOTES_COMMIT,
  MERGE_NOTES_ROLLBACK, UPDATE_LIST_NAME_EDITORS, ADD_LIST_NAMES, UPDATE_LIST_NAMES,
  MOVE_LIST_NAME, MOVE_TO_LIST_NAME, DELETE_LIST_NAMES, UPDATE_SELECTING_LIST_NAME,
  UPDATE_DO_SYNC_MODE, UPDATE_DO_SYNC_MODE_INPUT, UPDATE_DO_DELETE_OLD_NOTES_IN_TRASH,
  UPDATE_SORT_ON, UPDATE_DO_DESCENDING_ORDER, UPDATE_NOTE_DATE_SHOWING_MODE,
  UPDATE_NOTE_DATE_FORMAT, UPDATE_DO_SECTION_NOTES_BY_MONTH,
  UPDATE_DO_MORE_EDITOR_FONT_SIZES, TRY_UPDATE_SETTINGS, TRY_UPDATE_SETTINGS_COMMIT,
  TRY_UPDATE_SETTINGS_ROLLBACK, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, UPDATE_UNCHANGED_SETTINGS, CANCEL_DIED_SETTINGS,
  MERGE_SETTINGS, MERGE_SETTINGS_COMMIT, MERGE_SETTINGS_ROLLBACK,
  UPDATE_SETTINGS_VIEW_ID, TRY_UPDATE_INFO, TRY_UPDATE_INFO_COMMIT,
  TRY_UPDATE_INFO_ROLLBACK, UPDATE_INFO, UPDATE_INFO_COMMIT, UPDATE_INFO_ROLLBACK,
  UPDATE_UNCHANGED_INFO, UPDATE_MOVE_ACTION, UPDATE_DELETE_ACTION,
  UPDATE_DISCARD_ACTION, UPDATE_LIST_NAMES_MODE, UPDATE_SIDEBAR_LIST_NAMES_MODE,
  UPDATE_SYNCED, CANCEL_CHANGED_SYNC_MODE, SYNC, SYNC_COMMIT, SYNC_ROLLBACK,
  UPDATE_SYNC_PROGRESS, INCREASE_DISCARD_NOTE_COUNT, INCREASE_SAVE_NOTE_COUNT,
  INCREASE_CHANGE_LIST_NAME_COUNT, INCREASE_UPDATE_QUERY_STRING_COUNT,
  INCREASE_FOCUS_TITLE_COUNT, INCREASE_SET_INIT_DATA_COUNT,
  INCREASE_UPDATE_EDITOR_WIDTH_COUNT, INCREASE_RESET_DID_CLICK_COUNT,
  INCREASE_SHOW_NOTE_LIST_MENU_POPUP_COUNT, INCREASE_SHOW_NLIM_POPUP_COUNT,
  INCREASE_SHOW_UNE_POPUP_COUNT, UPDATE_EDITOR_IS_UPLOADING,
  UPDATE_EDITOR_SCROLL_ENABLED, UPDATE_EDITING_NOTE, CLEAN_UP_STATIC_FILES,
  CLEAN_UP_STATIC_FILES_COMMIT, CLEAN_UP_STATIC_FILES_ROLLBACK, PIN_NOTE,
  PIN_NOTE_COMMIT, PIN_NOTE_ROLLBACK, UNPIN_NOTE, UNPIN_NOTE_COMMIT,
  UNPIN_NOTE_ROLLBACK, MOVE_PINNED_NOTE, MOVE_PINNED_NOTE_COMMIT,
  MOVE_PINNED_NOTE_ROLLBACK, CANCEL_DIED_PINS, UPDATE_DO_USE_LOCAL_THEME,
  UPDATE_DEFAULT_THEME, UPDATE_LOCAL_THEME, UPDATE_UPDATING_THEME_MODE,
  UPDATE_TIME_PICK, UPDATE_PAYWALL_FEATURE, UPDATE_EXPORT_NOTE_AS_PDF_PROGRESS,
  UPDATE_LOCK_ACTION, UPDATE_LOCK_EDITOR, ADD_LOCK_NOTE, REMOVE_LOCK_NOTE, LOCK_NOTE,
  UNLOCK_NOTE, ADD_LOCK_LIST, REMOVE_LOCK_LIST, LOCK_LIST, UNLOCK_LIST, CLEAN_UP_LOCKS,
  UPDATE_TAG_EDITOR, UPDATE_TAG_DATA_S_STEP, UPDATE_TAG_DATA_S_STEP_COMMIT,
  UPDATE_TAG_DATA_S_STEP_ROLLBACK, UPDATE_TAG_DATA_T_STEP,
  UPDATE_TAG_DATA_T_STEP_COMMIT, UPDATE_TAG_DATA_T_STEP_ROLLBACK, CANCEL_DIED_TAGS,
  UPDATE_TAG_NAME_EDITORS, ADD_TAG_NAMES, UPDATE_TAG_NAMES, MOVE_TAG_NAME,
  DELETE_TAG_NAMES, UPDATE_SELECTING_TAG_NAME, UPDATE_HUB_ADDR,
} from '../types/actionTypes';
import {
  HR_HUB_URL, SD_HUB_URL, BULK_EDIT_MENU_POPUP, PAYWALL_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP,
  NOTE_LIST_MENU_POPUP, NOTE_LIST_ITEM_MENU_POPUP, LOCK_EDITOR_POPUP, LOCK_MENU_POPUP,
  TAG_EDITOR_POPUP, HUB_ERROR_POPUP, MOVE_ACTION_NOTE_COMMANDS,
  MOVE_ACTION_NOTE_ITEM_MENU, DELETE_ACTION_NOTE_COMMANDS, DELETE_ACTION_NOTE_ITEM_MENU,
  DISCARD_ACTION_CANCEL_EDIT, DISCARD_ACTION_UPDATE_LIST_NAME,
  DISCARD_ACTION_UPDATE_TAG_NAME, MY_NOTES, TRASH, ID, NEW_NOTE, NEW_NOTE_OBJ,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING, N_NOTES, N_DAYS, CD_ROOT,
  INFO, INDEX, DOT_JSON, SHOW_SYNCED, LG_WIDTH, INVALID, SWAP_LEFT, SWAP_RIGHT,
  SETTINGS_VIEW_ACCOUNT, SETTINGS_VIEW_LISTS, CUSTOM_MODE, FEATURE_PIN,
  FEATURE_APPEARANCE, FEATURE_DATE_FORMAT, FEATURE_SECTION_NOTES_BY_MONTH,
  FEATURE_MORE_EDITOR_FONT_SIZES, FEATURE_LOCK, FEATURE_TAG, NOTE_DATE_FORMATS,
  NO_PERMISSION_GRANTED, VALID_PASSWORD, PASSWORD_MSGS, LOCK_ACTION_ADD_LOCK_NOTE,
  LOCK_ACTION_UNLOCK_NOTE, LOCK_ACTION_ADD_LOCK_LIST, LOCAL_NOTE_ATTRS, TASK_TYPE,
  TASK_DO_FORCE_LIST_FPATHS, TASK_UPDATE_ACTION, ADDED, SHOWING_STATUSES,
  IN_USE_LIST_NAME, LIST_NAME_MSGS, VALID_TAG_NAME, DUPLICATE_TAG_NAME,
  IN_USE_TAG_NAME, TAG_NAME_MSGS, UPDATED_DT, DELETE_ACTION_LIST_NAME,
  DELETE_ACTION_TAG_NAME, PUT_FILE, DELETE_FILE, TAGGED, NOT_SUPPORTED, STATUS,
} from '../types/const';
import {
  isEqual, isArrayEqual, isObject, isString, isNumber, sleep, randomString, stripHtml,
  isTitleEqual, isBodyEqual, getStaticFPath, deriveFPaths, getListNameObj,
  getAllListNames, getMainId, createDataFName, listNoteMetas, getNoteFPaths,
  getSsltFPaths, getStaticFPaths, createSettingsFPath, getSettingsFPaths,
  getLastSettingsFPaths, getInfoFPath, doEnableExtraFeatures, extractPinFPath,
  getPinFPaths, getPins, separatePinnedValues, getRawPins, getFormattedTime,
  get24HFormattedTime, getFormattedTimeStamp, getMineSubType, getNote,
  getEditingListNameEditors, validatePassword, doContainListName, getListNameAndNote,
  newObject, getNNoteMetas, addFetchedToVars, isFetchedNoteMeta, doesIncludeFetching,
  sortNotes, sortWithPins, doesIncludeFetchingMore, isFetchingInterrupted,
  getTagFPaths, getInUseTagNames, getEditingTagNameEditors, getNNoteMetasByQt,
  extractNoteFPath, extractSsltFPath, validateTagNameDisplayName,
  getTagNameObjFromDisplayName, getTagNameObj, getTags, getRawTags, extractTagFPath,
  createTagFPath, getNoteMainIds, getPerformFilesResultsPerId,
  batchPerformFilesIfEnough, getUserHubAddr,
} from '../utils';
import { _ } from '../utils/obj';
import { initialSettingsState, initialTagEditorState } from '../types/initialStates';
import vars from '../vars';

import {
  syncQueue, taskQueue, updateNoteIdUrlHash, updatePopupUrlHash, updateBulkEditUrlHash,
  updateNoteId, updatePopup, increaseBlurCount, handleUnsavedNote, deleteUnsavedNotes,
  increaseUpdateStatusBarStyleCount,
} from '.';
import { checkPurchases } from './iap';

const jhfp = require('../../jhfp');

const DIFF_UPDATE = 'DIFF_UPDATE';

export const updateHubAddr = () => async (dispatch, getState) => {
  try {
    if (!getState().user.isUserSignedIn) return;
    if (getState().user.hubUrl === HR_HUB_URL) {
      dispatch(updatePopup(HUB_ERROR_POPUP, true));
    }

    const userData = await userSession.loadUserData();
    const hubAddr = getUserHubAddr(userData);
    dispatch({ type: UPDATE_HUB_ADDR, payload: { hubAddr } });
  } catch (error) {
    console.log('updateHubAddr error:', error);
  }
};

export const changeListName = (listName, doCheckEditing) => async (
  dispatch, getState
) => {
  if (!listName) listName = vars.changeListName.changingListName;
  if (!listName) {
    console.log('In changeListName, invalid listName:', listName);
    return;
  }

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

  dispatch(updateFetched(null, false, true));
  dispatch(updateFetchedMore(null, true));

  dispatch({ type: UPDATE_LIST_NAME, payload: listName });
};

export const onChangeListName = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(changeListName(null, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

export const updateQueryString = (queryString, doCheckEditing) => async (
  dispatch, getState
) => {
  if (!isString(queryString)) {
    queryString = vars.updateQueryString.updatingQueryString;
  }
  if (!isString(queryString)) {
    console.log('In updateQueryString, invalid queryString:', queryString);
    return;
  }

  if (doCheckEditing) {
    if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;

    const isEditorUploading = getState().editor.isUploading;
    if (isEditorUploading) return;

    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) {
      vars.updateQueryString.updatingQueryString = queryString;
      dispatch(increaseUpdateQueryStringCount());
      return;
    }
  }

  const syncProgress = getState().display.syncProgress;
  if (syncProgress && syncProgress.status === SHOW_SYNCED) {
    dispatch({ type: UPDATE_SYNCED });
  }

  dispatch(updateFetched(null, false, true));
  dispatch(updateFetchedMore(null, true));

  dispatch({ type: UPDATE_QUERY_STRING, payload: queryString });
};

export const onUpdateQueryString = (title, body, media) => async (
  dispatch, getState
) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(updateQueryString(null, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

export const updateSelectingNoteId = (id) => {
  return { type: UPDATE_SELECTING_NOTE_ID, payload: id };
};

const _getInfosFromMetas = (metas) => {
  const infos = [];
  for (const { id, isConflicted, isPinned } of metas) {
    infos.push({ id, isConflicted: !!isConflicted, isPinned: !!isPinned });
  }
  return infos;
};

export const fetch = () => async (dispatch, getState) => {
  const doForce = vars.fetch.doForce;
  vars.fetch.doForce = false;

  const conflictedNotes = getState().conflictedNotes;
  const notes = getState().notes;
  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const didFetch = getState().display.didFetch;
  const didFetchSettings = getState().display.didFetchSettings;
  const fetchingInfos = getState().display.fetchingInfos;
  const doForceLock = getState().display.doForceLock;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;
  const pendingTags = getState().pendingTags;
  const lockedNotes = getState().lockSettings.lockedNotes;
  const lockedLists = getState().lockSettings.lockedLists;

  let sortOn = getState().settings.sortOn;
  let doDescendingOrder = getState().settings.doDescendingOrder;

  let noteFPaths = getNoteFPaths(getState());
  let ssltFPaths = getSsltFPaths(getState());
  let pinFPaths = getPinFPaths(getState());
  let tagFPaths = getTagFPaths(getState());

  const lnOrQt = queryString ? queryString : listName;
  if (doesIncludeFetching(lnOrQt, doForce, fetchingInfos)) {
    vars.fetch.doShowLoading = false;
    return;
  }

  const fthId = `${Date.now()}${randomString(4)}`;
  dispatch(addFetchingInfo({ type: FETCH, doForce, lnOrQt, fthId }));

  const bin = { fetchedNoteMetas: [], unfetchedNoteMetas: [], hasMore: false };
  if (didFetch && didFetchSettings) {
    let metas, metasWithPcEc;
    if (queryString) {
      const _result = getNNoteMetasByQt({
        noteFPaths, ssltFPaths, pendingSslts, notes, sortOn, doDescendingOrder,
        pinFPaths, pendingPins, tagFPaths, pendingTags, doForceLock, lockedNotes,
        lockedLists, queryString,
      });
      [metas, metasWithPcEc] = [_result.metas, _result.metasWithPcEc];
      bin.hasMore = _result.hasMore;
    } else {
      const _result = getNNoteMetas({
        noteFPaths, ssltFPaths, pendingSslts, notes, listName, sortOn,
        doDescendingOrder, pinFPaths, pendingPins,
      });
      [metas, metasWithPcEc] = [_result.metas, _result.metasWithPcEc];
      bin.hasMore = _result.hasMore;
    }
    for (const meta of metas) {
      if (isFetchedNoteMeta(vars.fetch.fetchedNoteIds, conflictedNotes, notes, meta)) {
        bin.fetchedNoteMetas.push(meta);
      } else {
        bin.unfetchedNoteMetas.push(meta);
      }
    }
    if (bin.unfetchedNoteMetas.length === 0) {
      const infos = _getInfosFromMetas(metasWithPcEc);
      const payload: any = {
        infos, hasMore: bin.hasMore, doClearSelectedNoteIds: true,
      };
      if (lnOrQt === listName && bin.fetchedNoteMetas.length === 0) {
        payload.listNameToClearNotes = lnOrQt;
      }
      dispatch({ type: SET_SHOWING_NOTE_INFOS, payload });
      // E.g., in settings commit, reset fetchedLnOrQts but not fetchedNoteIds,
      //   need to add lnOrQt for correctness.
      addFetchedToVars(lnOrQt, null, null, vars);
      dispatch(deleteFetchingInfo(fthId));
      vars.fetch.doShowLoading = false;
      return;
    }
  }
  vars.fetch.doShowLoading = false;

  const payload = { listName, queryString, lnOrQt, fthId };
  dispatch({ type: FETCH, payload });

  const result: any = {};
  try {
    if (!didFetch || !didFetchSettings) {
      const fResult = await dataApi.listFPaths(true);
      [noteFPaths, ssltFPaths] = [fResult.noteFPaths, fResult.ssltFPaths];
      [pinFPaths, tagFPaths] = [fResult.pinFPaths, fResult.tagFPaths];
      const [settingsFPaths, infoFPath] = [fResult.settingsFPaths, fResult.infoFPath];

      const {
        noteMetas, conflictedMetas, toRootIds, inUseListNames,
      } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

      const sResult = await dataApi.fetchStgsAndInfo(settingsFPaths, infoFPath);
      result.doFetchStgsAndInfo = true;
      result.settings = sResult.settings;
      result.conflictedSettings = sResult.conflictedSettings;
      result.info = sResult.info;
      // List names should be retrieve from settings
      //   but also retrive from file paths in case the settings is gone.
      result.listNames = inUseListNames;
      result.tagNames = getInUseTagNames(
        noteMetas, conflictedMetas, toRootIds, tagFPaths, pendingTags
      );

      if (result.settings) {
        sortOn = result.settings.sortOn;
        doDescendingOrder = result.settings.doDescendingOrder;
      }

      let metas;
      if (queryString) {
        const _result = getNNoteMetasByQt({
          noteFPaths, ssltFPaths, pendingSslts, notes, sortOn, doDescendingOrder,
          pinFPaths, pendingPins, tagFPaths, pendingTags, doForceLock, lockedNotes,
          lockedLists, queryString,
        });
        [metas, bin.hasMore] = [_result.metas, _result.hasMore];
      } else {
        const _result = getNNoteMetas({
          noteFPaths, ssltFPaths, pendingSslts, notes, listName, sortOn,
          doDescendingOrder, pinFPaths, pendingPins,
        });
        [metas, bin.hasMore] = [_result.metas, _result.hasMore];
      }
      for (const meta of metas) bin.unfetchedNoteMetas.push(meta);
    }

    const lResult = await dataApi.fetchNotes(bin.unfetchedNoteMetas);
    result.fetchedNoteMetas = bin.fetchedNoteMetas;
    result.unfetchedNoteMetas = bin.unfetchedNoteMetas;
    result.hasMore = bin.hasMore;
    result.conflictedNotes = lResult.conflictedNotes;
    result.notes = lResult.notes;
  } catch (error) {
    console.log('fetch error: ', error);
    const signInDT = getState().localSettings.signInDT;
    dispatch({ type: FETCH_ROLLBACK, payload: { ...payload, error, signInDT } });
    dispatch(deleteFetchingInfo(fthId));
    return;
  }

  dispatch({ type: FETCH_COMMIT, payload: { ...payload, ...result } });
};

const _poolConflictedNotes = (
  conflictedMetas, payloadConflictedNotes, stateConflictedNotes
) => {
  return conflictedMetas.map(meta => {
    const { id } = meta;

    let notes = payloadConflictedNotes;
    if (isObject(notes[id])) return notes[id];

    notes = stateConflictedNotes;
    if (isObject(notes[id])) return notes[id];

    return null;
  });
};

const _poolListNameAndNotes = (noteMetas, payloadNotes, stateNotes) => {
  return noteMetas.map(meta => {
    const { listName, id } = meta;

    let notes = payloadNotes;
    if (isObject(notes[listName]) && isObject(notes[listName][id])) {
      return { listName, note: notes[listName][id] };
    }

    notes = stateNotes;
    if (isObject(notes[listName]) && isObject(notes[listName][id])) {
      return { listName, note: notes[listName][id] };
    }

    return { listName: null, note: null };
  });
};

const _getInfosFromNotes = (sortedCfNts, pinnedNotes, noPinnedNotes) => {
  const infos = [];
  for (const note of sortedCfNts) {
    infos.push({ id: note.id, isConflicted: true, isPinned: false });
  }
  for (const note of pinnedNotes) {
    infos.push({ id: note.id, isConflicted: false, isPinned: true });
  }
  for (const note of noPinnedNotes) {
    infos.push({ id: note.id, isConflicted: false, isPinned: false });
  }
  return infos;
};

export const tryUpdateFetched = (payload) => async (dispatch, getState) => {
  if (!vars.syncMode.doSyncMode) dispatch(updateHubAddr());
  dispatch(updateFetched(payload));
  dispatch(deleteFetchingInfo(payload.fthId));
};

export const updateFetched = (
  payload, doChangeListCount = false, noDisplay = false
) => async (dispatch, getState) => {

  if (!payload) return;

  const conflictedNotes = getState().conflictedNotes;
  const notes = getState().notes;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const conflictedMetas = [], updatingNoteMetas = [];
  const { fetchedNoteMetas, unfetchedNoteMetas } = payload;
  for (const meta of [...fetchedNoteMetas, ...unfetchedNoteMetas]) {
    if (meta.isConflicted) conflictedMetas.push(meta);
    else updatingNoteMetas.push(meta);
  }

  const cfNtsPerId = {};
  const cfNts = _poolConflictedNotes(
    conflictedMetas, payload.conflictedNotes, conflictedNotes
  );
  for (const cfNt of cfNts) {
    if (!isObject(cfNt)) continue;
    cfNtsPerId[cfNt.id] = cfNt;
  }

  const ntsPerLn = {}, updatingNotes = [];
  const updatingLnAndNts = _poolListNameAndNotes(
    updatingNoteMetas, payload.notes, notes
  );
  for (const { listName, note } of updatingLnAndNts) {
    if (!isString(listName) || !isObject(note)) continue;

    if (!isObject(ntsPerLn[listName])) ntsPerLn[listName] = {};
    ntsPerLn[listName][note.id] = note;

    updatingNotes.push(note);
  }

  if (noDisplay) {
    dispatch({
      type: UPDATE_FETCHED,
      payload: { lnOrQt: payload.lnOrQt, conflictedNotes: cfNtsPerId, notes: ntsPerLn },
    });
    addFetchedToVars(payload.lnOrQt, payload.conflictedNotes, payload.notes, vars);
    return;
  }

  const processingNotes = [], interveningNotes = [];
  if (isObject(notes[payload.lnOrQt])) {
    for (const note of Object.values<any>(notes[payload.lnOrQt])) {
      if (note.status !== ADDED) processingNotes.push(note);

      if (Array.isArray(vars.notesReducer.interveningNoteIds[payload.lnOrQt])) {
        if (vars.notesReducer.interveningNoteIds[payload.lnOrQt].includes(note.id)) {
          interveningNotes.push(note);
        }
      }
    }
  }

  const sortedCfNts = sortNotes(cfNts, sortOn, doDescendingOrder);

  let sortedNotes = [...updatingNotes, ...interveningNotes, ...processingNotes];
  sortedNotes = Object.values(_.mapKeys(sortedNotes, ID));
  sortedNotes = sortNotes(sortedNotes, sortOn, doDescendingOrder);

  const {
    pinnedValues: pinnedNotes, values: noPinnedNotes,
  } = sortWithPins(sortedNotes, pinFPaths, pendingPins, toRootIds, (note) => {
    return getMainId(note, toRootIds);
  });

  const infos = _getInfosFromNotes(sortedCfNts, pinnedNotes, noPinnedNotes);

  // Need to update in one render, if not jumpy!
  //   - update notes
  //   - update showingNoteInfos, hasMore, and scrollTop or not
  //   - clear payload in fetched
  dispatch({
    type: UPDATE_FETCHED,
    payload: {
      lnOrQt: payload.lnOrQt, conflictedNotes: cfNtsPerId, notes: ntsPerLn,
      infos, hasMore: payload.hasMore, doChangeListCount,
      doClearSelectedNoteIds: true,
    },
  });
  addFetchedToVars(payload.lnOrQt, payload.conflictedNotes, payload.notes, vars);
};

export const fetchMore = () => async (dispatch, getState) => {
  const conflictedNotes = getState().conflictedNotes;
  const notes = getState().notes;
  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const fetchingInfos = getState().display.fetchingInfos;
  const showingNoteInfos = getState().display.showingNoteInfos;
  const doForceLock = getState().display.doForceLock;
  const cachedFetchedMore = getState().fetchedMore;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;
  const pendingTags = getState().pendingTags;
  const lockedNotes = getState().lockSettings.lockedNotes;
  const lockedLists = getState().lockSettings.lockedLists;

  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  if (!Array.isArray(showingNoteInfos)) {
    console.log('In fetchMore, showingNoteInfos is not an array!');
    return;
  }

  const lnOrQt = queryString ? queryString : listName;
  if (
    doesIncludeFetchingMore(lnOrQt, fetchingInfos) || lnOrQt in cachedFetchedMore
  ) {
    return;
  }

  const fthId = `${Date.now()}${randomString(4)}`;
  dispatch(addFetchingInfo({ type: FETCH_MORE, lnOrQt, fthId }));

  const safNoteIds = []; // Showing and fetched note ids.
  const showingNotes = showingNoteInfos.map(info => {
    if (info.id.startsWith('conflict')) return conflictedNotes[info.id];
    return getNote(info.id, notes);
  });
  for (const note of showingNotes) {
    if (!isObject(note)) continue;
    if (note.isConflicted) {
      const isAllFetched = note.notes.every(cNote => {
        return vars.fetch.fetchedNoteIds.includes(cNote.id);
      });
      if (isAllFetched) safNoteIds.push(note.id);
      continue;
    }
    // In fetchedNoteIds but might not in notes
    //   e.g. delete by UPDATE_FETCHED or UPDATE_FETCHED_MORE.
    // Though, here should be fine as note is from notes.
    if (vars.fetch.fetchedNoteIds.includes(note.id)) safNoteIds.push(note.id);
  }

  const bin = {
    fetchedNoteMetas: [], unfetchedNoteMetas: [], hasMore: false, hasDisorder: false,
  };

  let metas, metasWithPcEc;
  if (queryString) {
    const _result = getNNoteMetasByQt({
      noteFPaths, ssltFPaths, pendingSslts, notes, sortOn, doDescendingOrder,
      pinFPaths, pendingPins, tagFPaths, pendingTags, doForceLock, lockedNotes,
      lockedLists, queryString, excludingIds: safNoteIds,
    });
    [metas, metasWithPcEc] = [_result.metas, _result.metasWithPcEc];
    [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
  } else {
    const _result = getNNoteMetas({
      noteFPaths, ssltFPaths, pendingSslts, notes, listName, sortOn, doDescendingOrder,
      pinFPaths, pendingPins, excludingIds: safNoteIds,
    });
    [metas, metasWithPcEc] = [_result.metas, _result.metasWithPcEc];
    [bin.hasMore, bin.hasDisorder] = [_result.hasMore, _result.hasDisorder];
  }
  for (const meta of metas) {
    if (isFetchedNoteMeta(vars.fetch.fetchedNoteIds, conflictedNotes, notes, meta)) {
      bin.fetchedNoteMetas.push(meta);
    } else {
      bin.unfetchedNoteMetas.push(meta);
    }
  }
  if (bin.unfetchedNoteMetas.length === 0) {
    if (bin.hasDisorder) {
      console.log('No cache for now. Maybe fast enough to not jumpy.');
    }
    const infos = _getInfosFromMetas(metasWithPcEc);
    dispatch({
      type: SET_SHOWING_NOTE_INFOS, payload: { infos, hasMore: bin.hasMore },
    });
    dispatch(deleteFetchingInfo(fthId));
    return;
  }

  const payload = { listName, queryString, lnOrQt, fthId, safNoteIds };
  dispatch({ type: FETCH_MORE, payload });

  const result: any = {};
  try {
    const lResult = await dataApi.fetchNotes(bin.unfetchedNoteMetas);
    result.fetchedNoteMetas = bin.fetchedNoteMetas;
    result.unfetchedNoteMetas = bin.unfetchedNoteMetas;
    result.hasMore = bin.hasMore;
    result.hasDisorder = bin.hasDisorder;
    result.conflictedNotes = lResult.conflictedNotes;
    result.notes = lResult.notes;
  } catch (error) {
    console.log('fetchMore error: ', error);
    dispatch({ type: FETCH_MORE_ROLLBACK, payload: { ...payload, error } });
    dispatch(deleteFetchingInfo(fthId));
    return;
  }

  dispatch({ type: FETCH_MORE_COMMIT, payload: { ...payload, ...result } });
};

export const tryUpdateFetchedMore = (payload) => async (dispatch, getState) => {
  const listName = getState().display.listName;
  const queryString = getState().display.queryString;
  const fetchingInfos = getState().display.fetchingInfos;
  const showingNoteInfos = getState().display.showingNoteInfos;

  // If interrupted e.g. by refreshFetched,
  //   don't updateFetchedMore so don't override any variables.
  if (
    isFetchingInterrupted(payload.fthId, fetchingInfos) ||
    !Array.isArray(showingNoteInfos)
  ) {
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  const lnOrQt = queryString ? queryString : listName;
  if (payload.lnOrQt !== lnOrQt) {
    dispatch(updateFetchedMore(payload, true));
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  if (!payload.hasDisorder) {
    dispatch(updateFetchedMore(payload));
    dispatch(deleteFetchingInfo(payload.fthId));
    return;
  }

  const isBulkEditing = getState().display.isBulkEditing;
  if (!isBulkEditing) {
    const scrollHeight = vars.scrollPanel.contentHeight;
    const windowHeight = vars.scrollPanel.layoutHeight;
    const windowBottom = windowHeight + vars.scrollPanel.scrollY;

    const isPopupShown = (
      getState().display.isNoteListItemMenuPopupShown ||
      getState().display.isListNamesPopupShown ||
      getState().display.isPinMenuPopupShown ||
      getState().display.isLockMenuPopupShown
    );

    if (windowBottom > (scrollHeight * 0.96) && !isPopupShown) {
      dispatch(updateFetchedMore(payload));
      dispatch(deleteFetchingInfo(payload.fthId));
      return;
    }
  }

  dispatch({ type: CACHE_FETCHED_MORE, payload });
  dispatch(deleteFetchingInfo(payload.fthId));
};

export const updateFetchedMore = (
  payload = null, noDisplay = false
) => async (dispatch, getState) => {

  if (!payload) {
    const listName = getState().display.listName;
    const queryString = getState().display.queryString;
    const lnOrQt = queryString ? queryString : listName;

    const fetchedMore = getState().fetchedMore[lnOrQt];
    if (fetchedMore) ({ payload } = fetchedMore);
  }
  if (!payload) return;

  const conflictedNotes = getState().conflictedNotes;
  const notes = getState().notes;
  const showingNoteInfos = getState().display.showingNoteInfos;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  if (!Array.isArray(showingNoteInfos)) {
    // Need to dispatch UPDATE_FETCHED_MORE to make sure clear fetchedMoreReducer.
    dispatch({
      type: UPDATE_FETCHED_MORE, payload: { lnOrQt: payload.lnOrQt },
    });
    return;
  }

  if (noDisplay) {
    dispatch({
      type: UPDATE_FETCHED_MORE,
      payload: {
        lnOrQt: payload.lnOrQt, conflictedNotes: payload.conflictedNotes,
        notes: payload.notes,
      },
    });
    addFetchedToVars(payload.lnOrQt, payload.conflictedNotes, payload.notes, vars);
    return;
  }

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const processingNotes = [];
  if (isObject(notes[payload.lnOrQt])) {
    for (const note of Object.values<any>(notes[payload.lnOrQt])) {
      if (note.status === ADDED) continue;
      processingNotes.push(note);
    }
  }

  const fsCfNts = [], fsNts = [];
  for (const info of showingNoteInfos) {
    if (info.id.startsWith('conflict')) {
      const note = conflictedNotes[info.id];
      if (isObject(note)) fsCfNts.push(note);
      continue;
    }

    const note = getNote(info.id, notes);
    if (isObject(note)) fsNts.push(note);
  }

  const conflictedMetas = [], updatingNoteMetas = [];
  const { fetchedNoteMetas, unfetchedNoteMetas } = payload;
  for (const meta of [...fetchedNoteMetas, ...unfetchedNoteMetas]) {
    if (meta.isConflicted) conflictedMetas.push(meta);
    else updatingNoteMetas.push(meta);
  }

  let cfNts = _poolConflictedNotes(
    conflictedMetas, payload.conflictedNotes, conflictedNotes
  );
  cfNts = cfNts.filter(cfNt => isObject(cfNt));

  const updatingNotes = [];
  const updatingLnAndNts = _poolListNameAndNotes(
    updatingNoteMetas, payload.notes, notes
  );
  for (const { listName, note } of updatingLnAndNts) {
    if (!isString(listName) || !isObject(note)) continue;
    updatingNotes.push(note);
  }

  let sortedCfNts = [...fsCfNts, ...cfNts];
  sortedCfNts = Object.values(_.mapKeys(sortedCfNts, ID));
  sortedCfNts = sortNotes(sortedCfNts, sortOn, doDescendingOrder);

  let sortedNotes = [...fsNts, ...updatingNotes, ...processingNotes];
  sortedNotes = Object.values(_.mapKeys(sortedNotes, ID));
  sortedNotes = sortNotes(sortedNotes, sortOn, doDescendingOrder);

  const {
    pinnedValues: pinnedNotes, values: noPinnedNotes,
  } = sortWithPins(sortedNotes, pinFPaths, pendingPins, toRootIds, (note) => {
    return getMainId(note, toRootIds);
  });

  const infos = _getInfosFromNotes(sortedCfNts, pinnedNotes, noPinnedNotes);

  // Need to update in one render, if not jumpy!
  //   - update notes
  //   - update showingNoteInfos, hasMore
  //   - clear payload in fetchedMore
  dispatch({
    type: UPDATE_FETCHED_MORE,
    payload: {
      lnOrQt: payload.lnOrQt, conflictedNotes: payload.conflictedNotes,
      notes: payload.notes, infos, hasMore: payload.hasMore,
    },
  });
  addFetchedToVars(payload.lnOrQt, payload.conflictedNotes, payload.notes, vars);
};

const sortShowingNoteInfos = async (dispatch, getState) => {
  const conflictedNotes = getState().conflictedNotes;
  const notes = getState().notes;
  const showingNoteInfos = getState().display.showingNoteInfos;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;
  const sortOn = getState().settings.sortOn;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  if (!Array.isArray(showingNoteInfos)) return;

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const fsCfNts = [], fsNts = [];
  for (const info of showingNoteInfos) {
    // Updating a new id in displayReducer might not update other attrs.
    // To be safe, get isConflicted with info.id.
    if (info.id.startsWith('conflict')) {
      const note = conflictedNotes[info.id];
      if (isObject(note)) fsCfNts.push(note);
      continue;
    }

    const note = getNote(info.id, notes);
    if (isObject(note)) fsNts.push(note);
  }

  let sortedCfNts = [...fsCfNts];
  sortedCfNts = Object.values(_.mapKeys(sortedCfNts, ID));
  sortedCfNts = sortNotes(sortedCfNts, sortOn, doDescendingOrder);

  let sortedNotes = [...fsNts];
  sortedNotes = Object.values(_.mapKeys(sortedNotes, ID));
  sortedNotes = sortNotes(sortedNotes, sortOn, doDescendingOrder);

  const {
    pinnedValues: pinnedNotes, values: noPinnedNotes,
  } = sortWithPins(sortedNotes, pinFPaths, pendingPins, toRootIds, (note) => {
    return getMainId(note, toRootIds);
  });

  const infos = _getInfosFromNotes(sortedCfNts, pinnedNotes, noPinnedNotes);
  dispatch({ type: SET_SHOWING_NOTE_INFOS, payload: { infos } });
};

const addFetchingInfo = (payload) => {
  return { type: ADD_FETCHING_INFO, payload };
};

const deleteFetchingInfo = (fthId) => {
  return { type: DELETE_FETCHING_INFO, payload: fthId };
};

const _getAddNoteInsertIndex = (getState) => {
  const showingNoteInfos = getState().display.showingNoteInfos;
  const doDescendingOrder = getState().settings.doDescendingOrder;

  if (!Array.isArray(showingNoteInfos)) return null;
  if (!doDescendingOrder) return showingNoteInfos.length;

  for (let i = 0; i < showingNoteInfos.length; i++) {
    if (showingNoteInfos[i].isPinned) continue;
    return i;
  }

  return showingNoteInfos.length;
};

export const addNote = (title, body, media, listName) => async (
  dispatch, getState
) => {
  if (!isString(listName)) listName = getState().display.listName;
  if (listName === TRASH) listName = MY_NOTES;

  const queryString = getState().display.queryString;
  if (queryString) listName = MY_NOTES;

  const addedDT = Date.now();
  const note = {
    parentIds: null,
    id: `${addedDT}${randomString(4)}`,
    title, body, media, addedDT,
    updatedDT: addedDT,
  };

  const { usedFPaths, localUnusedFPaths } = deriveFPaths(media, null);

  let insertIndex;
  if (!queryString && listName === getState().display.listName) {
    insertIndex = _getAddNoteInsertIndex(getState);
  }

  if (!isNumber(insertIndex)) {
    const safeAreaWidth = getState().window.width;
    if (isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) updateNoteIdUrlHash(null);
    else dispatch(updateNoteId(null));
    // Let transition done before causing rerender.
    await sleep(100);
  }

  const payload = { listName, note, insertIndex };
  dispatch({ type: ADD_NOTE, payload });
  addFetchedToVars(null, null, [note], vars);

  try {
    await dataApi.putNotes({
      listNames: [listName], notes: [note], staticFPaths: usedFPaths,
    });
  } catch (error) {
    console.log('addNote error: ', error);
    dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: ADD_NOTE_COMMIT, payload });

  await cleanUpNotes(null, null, localUnusedFPaths, getState);
  dispatch(sync());
};

export const updateNote = (title, body, media, id) => async (dispatch, getState) => {
  const notes = getState().notes;
  const sortOn = getState().settings.sortOn;
  const addedDT = Date.now();

  const { listName, note } = getListNameAndNote(id, notes);
  if (!isString(listName) || !isObject(note)) {
    console.log('In updateNote, no found list name or note for id:', id);
    return;
  }

  const fromNote = newObject(note, LOCAL_NOTE_ATTRS);
  const toNote = {
    ...fromNote,
    parentIds: [fromNote.id], id: `${addedDT}${randomString(4)}`,
    title, body, media,
    updatedDT: addedDT,
    fromNote,
  };

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(media, fromNote.media);

  const payload = { listName, fromNote, toNote };
  dispatch({ type: UPDATE_NOTE, payload });
  if (sortOn === UPDATED_DT) await sortShowingNoteInfos(dispatch, getState);
  addFetchedToVars(null, null, [toNote], vars);

  try {
    await dataApi.putNotes({
      listNames: [listName], notes: [toNote], staticFPaths: usedFPaths,
    });
  } catch (error) {
    console.log('updateNote error: ', error);
    dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: UPDATE_NOTE_COMMIT, payload });

  await cleanUpNotes([fromNote.id], serverUnusedFPaths, localUnusedFPaths, getState);
  dispatch(sync());
};

export const saveNote = (title, body, media) => async (dispatch, getState) => {
  if (title === '' && body === '') {
    dispatch(increaseFocusTitleCount());
    return;
  }

  const { noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getNote(noteId, getState().notes);

  dispatch(increaseBlurCount());

  if (note && (isTitleEqual(note.title, title) && isBodyEqual(note.body, body))) {
    dispatch(updateEditorBusy(false));
    dispatch(deleteUnsavedNotes([noteId]));
    return;
  }

  if (noteId === NEW_NOTE) dispatch(addNote(title, body, media, null));
  else dispatch(updateNote(title, body, media, noteId));
};

export const discardNote = (doCheckEditing, title = null, body = null) => async (
  dispatch, getState
) => {

  const { noteId } = getState().display;
  const note = noteId === NEW_NOTE ? NEW_NOTE_OBJ : getNote(noteId, getState().notes);

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

const _moveNotes = (toListName, ids) => async (dispatch, getState) => {
  if (ids.length === 0) return;

  const notes = getState().notes;

  const fromListNames = [], fromNotes = [];
  const toListNames = [], toNotes = [];
  for (const id of ids) {
    const { listName, note } = getListNameAndNote(id, notes);
    if (!isString(listName) || !isObject(note)) {
      console.log('In moveNotes, no found list name or note for id:', id);
      continue;
    }

    const [fromListName, fromNote] = [listName, newObject(note, LOCAL_NOTE_ATTRS)];
    if (fromListName === toListName) {
      console.log('In moveNotes, same fromListName and toListName:', fromListName);
      continue;
    }

    const toNote = { ...fromNote, fromListName, fromNote };

    fromListNames.push(fromListName);
    fromNotes.push(fromNote);
    toListNames.push(toListName);
    toNotes.push(toNote);
  }

  let payload = { fromListNames, fromNotes, toListNames, toNotes };
  dispatch({ type: MOVE_NOTES, payload });
  addFetchedToVars(null, null, toNotes, vars);

  try {
    const result = await dataApi.moveNotes({ listNames: toListNames, notes: toNotes });
    payload = { ...payload, ...result };
  } catch (error) {
    console.log('moveNotes error: ', error);
    dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: MOVE_NOTES_COMMIT, payload });
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

export const cleanUpSslts = () => async (dispatch, getState) => {
  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const {
    noteMetas, conflictedMetas, toRootIds, ssltInfos,
  } = listNoteMetas(noteFPaths, ssltFPaths, {});
  const noteMainIds = getNoteMainIds(noteMetas, conflictedMetas, toRootIds);

  let nNotes = N_NOTES;
  if (getState().user.hubUrl === SD_HUB_URL) nNotes = 60;

  const unusedValues = [];
  for (const fpath of ssltFPaths) {
    const { id } = extractSsltFPath(fpath);
    const ssltMainId = getMainId(id, toRootIds);

    if (
      !isString(ssltMainId) ||
      !noteMainIds.includes(ssltMainId) ||
      !isObject(ssltInfos[ssltMainId]) ||
      ssltInfos[ssltMainId].fpath !== fpath
    ) {
      unusedValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
      if (unusedValues.length >= nNotes) break;
    }
  }

  if (unusedValues.length > 0) {
    try {
      const data = { values: unusedValues, isSequential: false, nItemsForNs: N_NOTES };
      await dataApi.performFiles(data);
    } catch (error) {
      console.log('cleanUpSslts error: ', error);
      // error in this step should be fine
    }
  }

  dispatch(sync());
};

const _deleteNotes = (ids) => async (dispatch, getState) => {
  if (ids.length === 0) return;

  const notes = getState().notes;
  let addedDT = Date.now();

  const fromListNames = [], fromNotes = [];
  const toListNames = [], toNotes = [];
  for (const id of ids) {
    const { listName, note } = getListNameAndNote(id, notes);
    if (!isString(listName) || !isObject(note)) {
      console.log('In deleteNotes, no found list name or note for id:', id);
      continue;
    }

    const [fromListName, fromNote] = [listName, newObject(note, LOCAL_NOTE_ATTRS)];

    const toId = `deleted${addedDT}${randomString(4)}`;
    const toNote = {
      ...fromNote,
      parentIds: [fromNote.id], id: toId,
      title: '', body: '', media: [],
      updatedDT: addedDT,
      fromListName, fromNote,
    };
    addedDT += 1;

    fromListNames.push(fromListName);
    fromNotes.push(fromNote);
    toListNames.push(fromListName);
    toNotes.push(toNote);
  }

  let payload: any = { fromListNames, fromNotes, toListNames, toNotes };
  dispatch({ type: DELETE_NOTES, payload });
  addFetchedToVars(null, null, toNotes, vars);

  try {
    const result = await dataApi.putNotes({
      listNames: toListNames, notes: toNotes, manuallyManageError: true,
    });
    payload = { ...payload, ...result };
  } catch (error) {
    console.log('deleteNotes error: ', error);
    dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: DELETE_NOTES_COMMIT, payload });

  const unusedIds = [], unusedFPaths = [];
  for (const sNote of payload.successNotes) {
    unusedIds.push(sNote.fromNote.id);
    for (const { name } of sNote.fromNote.media) {
      if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
    }
  }

  await cleanUpNotes(unusedIds, unusedFPaths, unusedFPaths, getState);
  await cleanUpLocks(dispatch, getState);
  dispatch(sync());
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
  const notes = getState().notes;
  const sortOn = getState().settings.sortOn;
  let addedDT = Date.now();

  for (const id of ids) {
    // DIED_ADDING -> try add this note again
    // DIED_UPDATING -> try update this note again
    // DIED_MOVING -> try move this note again
    // DIED_DELETING  -> try delete this note again
    const { listName, note } = getListNameAndNote(id, notes);
    if (!isString(listName) || !isObject(note)) {
      console.log('In retryDiedNotes, no found listName or note for id:', id);
      continue;
    }

    const { status } = note;
    if (status === DIED_ADDING) {
      const { usedFPaths } = deriveFPaths(note.media, null);

      const payload = { listName, note };
      dispatch({ type: ADD_NOTE, payload });

      try {
        await dataApi.putNotes({
          listNames: [listName], notes: [note], staticFPaths: usedFPaths,
        });
      } catch (error) {
        console.log('retryDiedNotes add error: ', error);
        dispatch({ type: ADD_NOTE_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: ADD_NOTE_COMMIT, payload });
      dispatch(sync());
    } else if (status === DIED_UPDATING) {
      const [fromNote, toNote] = [note.fromNote, note];

      const {
        usedFPaths, serverUnusedFPaths, localUnusedFPaths,
      } = deriveFPaths(toNote.media, fromNote.media);

      const payload = { listName, fromNote, toNote };
      dispatch({ type: UPDATE_NOTE, payload });
      if (sortOn === UPDATED_DT) await sortShowingNoteInfos(dispatch, getState);

      try {
        await dataApi.putNotes({
          listNames: [listName], notes: [toNote], staticFPaths: usedFPaths,
        });
      } catch (error) {
        console.log('retryDiedNotes update error: ', error);
        dispatch({ type: UPDATE_NOTE_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: UPDATE_NOTE_COMMIT, payload });

      await cleanUpNotes(
        [fromNote.id], serverUnusedFPaths, localUnusedFPaths, getState
      );
      dispatch(sync());
    } else if (status === DIED_MOVING) {
      const [fromListNames, fromNotes] = [[note.fromListName], [note.fromNote]];
      const [toListNames, toNotes] = [[listName], [note]];

      let payload = { fromListNames, fromNotes, toListNames, toNotes, didRetry: true };
      dispatch({ type: MOVE_NOTES, payload });

      try {
        const result = await dataApi.moveNotes({
          listNames: toListNames, notes: toNotes,
        });
        payload = { ...payload, ...result };
      } catch (error) {
        console.log('retryDiedNotes move error: ', error);
        dispatch({ type: MOVE_NOTES_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: MOVE_NOTES_COMMIT, payload });
    } else if (status === DIED_DELETING) {
      const [fromListNames, fromNotes] = [[listName], [note]];
      const toListNames = [listName];
      const toNotes = [{
        ...note,
        parentIds: [note.id], id: `deleted${addedDT}${randomString(4)}`,
        title: '', body: '', media: [],
        updatedDT: addedDT,
        fromListName: listName, fromNote: note,
      }];
      addedDT += 1;

      const safeAreaWidth = getState().window.width;
      if (isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
        updateNoteIdUrlHash(null);
      } else dispatch(updateNoteId(null));

      let payload: any = { fromListNames, fromNotes, toListNames, toNotes };
      dispatch({ type: DELETE_NOTES, payload });

      try {
        const result = await dataApi.putNotes({
          listNames: toListNames, notes: toNotes, manuallyManageError: true,
        });
        payload = { ...payload, ...result };
      } catch (error) {
        console.log('retryDiedNotes delete error: ', error);
        dispatch({ type: DELETE_NOTES_ROLLBACK, payload: { ...payload, error } });
        return;
      }

      dispatch({ type: DELETE_NOTES_COMMIT, payload });

      const unusedIds = [], unusedFPaths = [];
      for (const sNote of payload.successNotes) {
        unusedIds.push(sNote.fromNote.id);
        for (const { name } of sNote.fromNote.media) {
          if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
        }
      }

      await cleanUpNotes(unusedIds, unusedFPaths, unusedFPaths, getState);
      await cleanUpLocks(dispatch, getState);
      dispatch(sync());
    } else {
      throw new Error(`Invalid status: ${status} of id: ${id}`);
    }
  }
};

export const cancelDiedNotes = (canceledIds) => async (dispatch, getState) => {
  const safeAreaWidth = getState().window.width;
  if (isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
    updateNoteIdUrlHash(null);
    // Need this to make sure noteId is null before deleting notes in notesReducer.
    // moveNotes and deleteNotes don't need this because of awaiting dataApi.
    await sleep(100);
  }

  const notes = getState().notes;
  const sortOn = getState().settings.sortOn;

  const listNames = [], ids = [], statuses = [], fromIds = [];
  const deleteUnsavedNoteIds = [];
  for (const id of canceledIds) {
    const { listName, note } = getListNameAndNote(id, notes);
    if (!isString(listName) || !isObject(note)) {
      console.log('In cancelDiedNotes, no found listName or note for id:', id);
      continue;
    }

    const { status, fromNote } = note;
    listNames.push(listName);
    ids.push(id);
    statuses.push(status);
    fromIds.push(isObject(fromNote) ? fromNote.id : null);
    if (status === DIED_UPDATING && isObject(fromNote)) {
      deleteUnsavedNoteIds.push(fromNote.id);
    }
  }

  const payload = { listNames, ids, statuses, fromIds, deleteUnsavedNoteIds };
  dispatch({ type: CANCEL_DIED_NOTES, payload });
  if (sortOn === UPDATED_DT && statuses.includes(DIED_UPDATING)) {
    await sortShowingNoteInfos(dispatch, getState);
  }
};

export const mergeNotes = (selectedId) => async (dispatch, getState) => {
  const { noteId } = getState().display;
  const conflictedNote = getState().conflictedNotes[noteId];
  const addedDT = Date.now();

  const fromListNames = [], fromNotes = [], noteMedia = [];
  let toListName, toNote;
  for (let i = 0; i < conflictedNote.notes.length; i++) {
    const [listName, note] = [conflictedNote.listNames[i], conflictedNote.notes[i]];

    if (note.id === selectedId) {
      toListName = listName;
      toNote = {
        parentIds: conflictedNote.notes.map(n => n.id),
        id: `${addedDT}${randomString(4)}`,
        title: note.title, body: note.body, media: note.media,
        addedDT: Math.min(...conflictedNote.notes.map(n => n.addedDT)),
        updatedDT: addedDT,
      };
    }

    fromListNames.push(listName);
    fromNotes.push(note);
    noteMedia.push(...note.media);
  }

  const {
    usedFPaths, serverUnusedFPaths, localUnusedFPaths,
  } = deriveFPaths(toNote.media, noteMedia);

  const payload = { conflictedNote, toListName, toNote };
  dispatch({ type: MERGE_NOTES, payload });
  addFetchedToVars(null, null, [toNote], vars);

  try {
    await dataApi.putNotes({
      listNames: [toListName], notes: [toNote], staticFPaths: usedFPaths,
    });
  } catch (error) {
    console.log('mergeNote error: ', error);
    dispatch({ type: MERGE_NOTES_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  const safeAreaWidth = getState().window.width;
  if (
    getState().display.listName !== toListName &&
    getState().display.queryString === '' &&
    isNumber(safeAreaWidth) &&
    safeAreaWidth < LG_WIDTH
  ) {
    updateNoteIdUrlHash(null);
    // Need this to make sure noteId is null before deleting notes in conflictedNotes.
    await sleep(100);
  }

  dispatch({ type: MERGE_NOTES_COMMIT, payload });
  await sortShowingNoteInfos(dispatch, getState);

  await cleanUpNotes(
    fromNotes.map(note => note.id), serverUnusedFPaths, localUnusedFPaths, getState
  );
  dispatch(sync());
};

const cleanUpNotes = async (
  fromNoteIds, serverUnusedFPaths, localUnusedFPaths, getState
) => {
  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const { toFPaths } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const values = [];
  if (Array.isArray(fromNoteIds)) {
    for (const id of fromNoteIds) {
      if (!Array.isArray(toFPaths[id])) continue;
      for (const fpath of toFPaths[id]) {
        if (fpath.includes(CD_ROOT + '/')) continue; // Already empty string

        let content;
        if (fpath.endsWith(INDEX + DOT_JSON)) content = { title: '', body: '' };
        else content = '';

        values.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      }
    }
  }
  if (!vars.syncMode.doSyncMode && Array.isArray(serverUnusedFPaths)) {
    for (const fpath of serverUnusedFPaths) {
      values.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
  }

  if (values.length > 0) {
    try {
      const data = { values, isSequential: false, nItemsForNs: N_NOTES };
      await dataApi.performFiles(data);
    } catch (error) {
      console.log('cleanUpNotes error: ', error);
      // error in this step should be fine
    }
  }

  if (Array.isArray(localUnusedFPaths)) {
    await fileApi.deleteFiles(localUnusedFPaths);
  }
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

  let addedDT = Date.now();

  const fromListName = TRASH;
  if (getState().display.listName === fromListName) return;

  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  // Include pendingSslts so not delete restoring notes,
  // For moving to Trash, need to > N_DAYS, should be fine.
  const {
    noteMetas, toRootIds, ssltInfos,
  } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const trashNoteMetas = noteMetas.filter(meta => meta.listName === fromListName);

  const fromListNames = [], fromNotes = [];
  const toListNames = [], toNotes = [];
  for (const meta of trashNoteMetas) {
    const mainId = getMainId(meta.id, toRootIds);

    let updatedDT = meta.updatedDT;
    if (isObject(ssltInfos[mainId]) && ssltInfos[mainId].updatedDT > updatedDT) {
      updatedDT = ssltInfos[mainId].updatedDT;
    }

    const interval = Date.now() - updatedDT;
    const days = interval / 1000 / 60 / 60 / 24;

    if (days <= N_DAYS) continue;

    // Dummy contents are enough and good for performance
    const media = [];
    for (const fpath of meta.fpaths) {
      const { subName } = extractNoteFPath(fpath);
      if (subName !== INDEX + DOT_JSON) {
        media.push({ name: subName, content: '' });
      }
    }

    const fromNote = {
      parentIds: meta.parentIds,
      id: meta.id,
      title: '', body: '', media,
      addedDT: meta.addedDT,
      updatedDT: meta.updatedDT,
    };
    const toNote = {
      ...fromNote,
      parentIds: [fromNote.id], id: `deleted${addedDT}${randomString(4)}`,
      title: '', body: '', media: [],
      updatedDT: addedDT,
      fromListName, fromNote,
    };
    addedDT += 1;

    fromListNames.push(fromListName);
    fromNotes.push(fromNote);
    toListNames.push(fromListName);
    toNotes.push(toNote);
    if (fromListNames.length >= N_NOTES) break;
  }
  if (fromListNames.length === 0) return;

  const fromNoteIds = fromNotes.map(note => note.id);
  if (fromNoteIds.includes(getState().display.noteId)) return;

  vars.deleteOldNotes.ids = fromNoteIds;
  let payload: any = { fromListNames, fromNotes, toListNames, toNotes };
  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH, payload });
  addFetchedToVars(null, null, toNotes, vars);

  try {
    const result = await dataApi.putNotes({
      listNames: toListNames, notes: toNotes, manuallyManageError: true,
    });
    payload = { ...payload, ...result };
  } catch (error) {
    console.log('deleteOldNotesInTrash error: ', error);
    dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_ROLLBACK });
    vars.deleteOldNotes.ids = null;
    return;
  }

  dispatch({ type: DELETE_OLD_NOTES_IN_TRASH_COMMIT, payload });
  vars.deleteOldNotes.ids = null;

  const unusedIds = [], unusedFPaths = [];
  for (const sNote of payload.successNotes) {
    unusedIds.push(sNote.fromNote.id);
    for (const { name } of sNote.fromNote.media) {
      if (name.startsWith(CD_ROOT + '/')) unusedFPaths.push(getStaticFPath(name));
    }
  }

  await cleanUpNotes(unusedIds, unusedFPaths, unusedFPaths, getState);
  await cleanUpLocks(dispatch, getState);
  dispatch(sync());
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
  const unsavedNotes = getState().unsavedNotes;
  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const {
    noteMetas, conflictedMetas, toRootIds,
  } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const noteMainIds = getNoteMainIds(noteMetas, conflictedMetas, toRootIds);

  let nNotes = N_NOTES;
  if (getState().user.hubUrl === SD_HUB_URL) nNotes = 60;

  const usedFPaths = [];
  for (const meta of [...noteMetas, ...conflictedMetas]) {
    for (const fpath of meta.fpaths) {
      if (fpath.includes(CD_ROOT + '/')) usedFPaths.push(getStaticFPath(fpath));
    }
  }

  for (const k in unsavedNotes) {
    const { media } = unsavedNotes[k];
    for (const { name: fpath } of media) {
      if (fpath.includes(CD_ROOT + '/')) usedFPaths.push(getStaticFPath(fpath));
    }
  }

  if (!vars.syncMode.doSyncMode) {
    // Delete unused static files in server
    const staticFPaths = getStaticFPaths(getState());

    const unusedValues = [];
    for (const fpath of staticFPaths) {
      if (usedFPaths.includes(fpath)) continue;
      unusedValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
      if (unusedValues.length >= nNotes) break;
    }
    if (unusedValues.length > 0) {
      // Too risky, don't do it for now!
      //const data = {
      //  values: unusedValues, isSequential: false, nItemsForNs: N_NOTES,
      //};
      //await dataApi.performFiles(data);
    }
  }

  // Delete unused static files in local
  const staticFPaths = await fileApi.getStaticFPaths();

  const unusedFPaths = [];
  for (const fpath of staticFPaths) {
    if (usedFPaths.includes(fpath)) continue;
    unusedFPaths.push(fpath);
    if (unusedFPaths.length >= nNotes) break;
  }
  if (unusedFPaths.length > 0) {
    await fileApi.deleteFiles(unusedFPaths);
  }

  // Delete unused unsaved notes
  const unusedIds = [];
  for (const k in unsavedNotes) {
    const { id, title, body, savedTitle, savedBody } = unsavedNotes[k];
    if (id === NEW_NOTE || id === getState().display.noteId) continue;

    const mainId = getMainId(id, toRootIds);
    if (!isString(mainId) || !noteMainIds.includes(mainId)) {
      // Too risky, don't it for now!
      console.log('Found unsavedNote with no noteMainId', unsavedNotes[k]);
    }

    if (isTitleEqual(title, savedTitle) && isBodyEqual(body, savedBody)) {
      unusedIds.push(id);
      if (unusedIds.length >= nNotes) break;
    }
  }

  if (unusedIds.length > 0) dispatch(deleteUnsavedNotes(unusedIds));
};

export const cleanUpStaticFiles = () => async (dispatch, getState) => {
  const { cleanUpStaticFilesDT } = getState().localSettings;
  if (!cleanUpStaticFilesDT) return;

  if (
    getState().display.isEditorFocused ||
    getState().display.isEditorBusy ||
    getState().editor.isUploading
  ) return;

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

      const tagNameEditors = getState().tagNameEditors;
      const tagNameMap = getState().settings.tagNameMap;
      const editingTNEs = getEditingTagNameEditors(tagNameEditors, tagNameMap);
      if (isObject(editingTNEs)) {
        for (const k in editingTNEs) {
          if (!isNumber(editingTNEs[k].blurCount)) editingTNEs[k].blurCount = 0;
          editingTNEs[k].blurCount += 1;
        }
        dispatch(updateTagNameEditors(editingTNEs));

        dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_TAG_NAME));
        updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
        return;
      }
    }
    dispatch(updateStgsAndInfo());
  }

  vars.updateSettingsPopup.didCall = true;
  updatePopupUrlHash(SETTINGS_POPUP, isShown);

  if (isShown) {
    dispatch(updateFetched(null, false, false));
    dispatch(updateFetchedMore(null, false));
  }
};

export const updateSettingsViewId = (
  viewId, isSidebarShown = null, didCloseAnimEnd = null, didSidebarAnimEnd = null,
) => async (dispatch, getState) => {

  const isUserSignedIn = getState().user.isUserSignedIn;
  if (!isUserSignedIn && viewId === SETTINGS_VIEW_ACCOUNT) {
    viewId = SETTINGS_VIEW_LISTS;
  }

  const payload: any = {};
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

export const checkDeleteListName = (listNameEditorKey, listNameObj) => async (
  dispatch, getState
) => {
  const listNames = [listNameObj.listName];
  listNames.push(...getAllListNames(listNameObj.children));

  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const { inUseListNames } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const canDeletes = [];
  for (const listName of listNames) {
    canDeletes.push(!inUseListNames.includes(listName));
  }

  if (!canDeletes.every(canDelete => canDelete === true)) {
    dispatch(updateListNameEditors({
      [listNameEditorKey]: {
        msg: LIST_NAME_MSGS[IN_USE_LIST_NAME], isCheckingCanDelete: false,
      },
    }));
    return;
  }

  dispatch(updateSelectingListName(listNameObj.listName));
  dispatch(updateDeleteAction(DELETE_ACTION_LIST_NAME));
  updatePopupUrlHash(CONFIRM_DELETE_POPUP, true);
  dispatch(updateListNameEditors({
    [listNameEditorKey]: { msg: '', isCheckingCanDelete: false },
  }));
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
  dateFormat, isTwoDigit = null, isCurrentYearShown = null,
) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_DATE_FORMAT));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const payload: any = {};
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
  return { type: UPDATE_SELECTING_LIST_NAME, payload: listName };
};

const updateSettingsInQueue = (dispatch, getState) => async () => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  const { doSyncMode, doSyncModeInput } = getState().localSettings;
  if (doSyncMode !== doSyncModeInput) vars.syncMode.didChange = true;

  // It's ok if MERGE_SETTINGS, IMPORT, DELETE_ALL in progress. Let it be conflict.
  if (isEqual(settings, snapshotSettings)) {
    dispatch({ type: UPDATE_UNCHANGED_SETTINGS });
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
    await dataApi.putSettings({
      settingsFPaths: [settingsFPath], settingsContents: [settings],
    });
  } catch (error) {
    console.log('updateSettings error: ', error);
    dispatch({ type: UPDATE_SETTINGS_ROLLBACK, payload: { ...payload, error } });
    dispatch({ type: TRY_UPDATE_SETTINGS_ROLLBACK });
    vars.updateSettings.doFetch = false;
    vars.syncMode.didChange = false;
    return;
  }

  dispatch({ type: UPDATE_SETTINGS_COMMIT, payload });
  dispatch({ type: TRY_UPDATE_SETTINGS_COMMIT });
  vars.updateSettings.doFetch = false;

  await cleanUpSettings(_settingsFPaths);
  await cleanUpLocks(dispatch, getState);
  // Subsequent updateSettings or updateInfo might be the same and just return.
  await syncAndWait()(dispatch, getState);
};

const updateSettings = async (dispatch, getState) => {
  const settings = getState().settings;
  dispatch({ type: TRY_UPDATE_SETTINGS, payload: { settings } });

  const task = updateSettingsInQueue(dispatch, getState);
  task[TASK_TYPE] = UPDATE_SETTINGS;
  taskQueue.push(task);
};

const cleanUpSettings = async (settingsFPaths) => {
  if (settingsFPaths.length === 0) return;

  try {
    await dataApi.putSettings({
      settingsFPaths: settingsFPaths,
      settingsContents: settingsFPaths.map(() => ({})),
    });
  } catch (error) {
    console.log('cleanUpSettings error: ', error);
    // error in this step should be fine
  }
};

const updateInfoInQueue = (dispatch, getState) => async () => {
  const info = getState().info;
  const snapshotInfo = getState().snapshot.info;

  // It's ok if IAP in progess as when complete, it'll update again.
  if (isEqual(info, snapshotInfo)) {
    dispatch({ type: UPDATE_UNCHANGED_INFO });
    return;
  }

  const addedDT = Date.now();
  const infoFPath = `${INFO}${addedDT}${DOT_JSON}`;
  const _infoFPath = getInfoFPath(getState());

  const payload = { infoFPath, info };
  dispatch({ type: UPDATE_INFO, payload });

  try {
    await dataApi.putInfos({ infoFPaths: [infoFPath], infos: [info] });
  } catch (error) {
    console.log('updateInfo error: ', error);
    dispatch({ type: UPDATE_INFO_ROLLBACK, payload: { ...payload, error } });
    dispatch({ type: TRY_UPDATE_INFO_ROLLBACK });
    return;
  }

  dispatch({ type: UPDATE_INFO_COMMIT, payload });
  dispatch({ type: TRY_UPDATE_INFO_COMMIT });

  if (isString(_infoFPath)) await cleanUpInfos([_infoFPath]);
  await syncAndWait()(dispatch, getState);
};

const updateInfo = async (dispatch, getState) => {
  dispatch({ type: TRY_UPDATE_INFO });

  const task = updateInfoInQueue(dispatch, getState);
  task[TASK_TYPE] = UPDATE_INFO;
  taskQueue.push(task);
};

const cleanUpInfos = async (infoFPaths) => {
  if (infoFPaths.length === 0) return;

  try {
    await dataApi.deleteInfos({ infoFPaths });
  } catch (error) {
    console.log('updateInfo clean up error: ', error);
    // error in this step should be fine
  }
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

  const pendingSslts = getState().pendingSslts;
  const pendingTags = getState().pendingTags;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const {
    noteMetas, conflictedMetas, toRootIds, inUseListNames,
  } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const listNames = inUseListNames;
  const tagNames = getInUseTagNames(
    noteMetas, conflictedMetas, toRootIds, tagFPaths, pendingTags
  );
  let doFetch = (
    settings.sortOn !== snapshotSettings.sortOn ||
    settings.doDescendingOrder !== snapshotSettings.doDescendingOrder
  );
  if (vars.syncMode.didChange) doFetch = false;
  const payload = { listNames, tagNames, settings: snapshotSettings, doFetch };

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

const mergeSettingsInQueue = (
  settingsFPath, settings, _settingsFPaths, payload, dispatch, getState
) => async () => {

  try {
    await dataApi.putSettings(
      { settingsFPaths: [settingsFPath], settingsContents: [settings] }
    );
  } catch (error) {
    console.log('mergeSettings error: ', error);
    dispatch({ type: MERGE_SETTINGS_ROLLBACK, payload: { ...payload, error } });
    vars.updateSettings.doFetch = false;
    return;
  }

  dispatch({ type: MERGE_SETTINGS_COMMIT, payload });
  vars.updateSettings.doFetch = false;

  await cleanUpSettings(_settingsFPaths);
  await syncAndWait()(dispatch, getState);
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

  const pendingSslts = getState().pendingSslts;
  const pendingTags = getState().pendingTags;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const {
    noteMetas, conflictedMetas, toRootIds, inUseListNames,
  } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const listNames = inUseListNames;
  const tagNames = getInUseTagNames(
    noteMetas, conflictedMetas, toRootIds, tagFPaths, pendingTags
  );
  const doFetch = (
    settings.sortOn !== currentSettings.sortOn ||
    settings.doDescendingOrder !== currentSettings.doDescendingOrder
  );
  const payload = { listNames, tagNames, settings, doFetch };

  vars.updateSettings.doFetch = doFetch;
  dispatch({ type: MERGE_SETTINGS, payload });

  const task = mergeSettingsInQueue(
    settingsFPath, settings, _settingsFPaths, payload, dispatch, getState
  );
  task[TASK_TYPE] = MERGE_SETTINGS;
  taskQueue.push(task);
};

/*
 * updateAction: 0 - normal, update immediately or show notification
 *               1 - force, update immediately no matter what
 *               2 - no update even there is a change
 */
const syncInQueue = (
  waitResolve, doForceListFPaths, updateAction, dispatch, getState
) => async () => {
  if (
    !getState().user.isUserSignedIn ||
    !vars.syncMode.doSyncMode ||
    vars.deleteSyncData.isDeleting
  ) {
    if (waitResolve) waitResolve(true);
    return;
  }

  // Set haveUpdate to true if there is already pending update
  //   Need to check before dispatching SYNC
  let haveUpdate = false;
  const syncProgress = getState().display.syncProgress;
  if (syncProgress && syncProgress.status === SHOW_SYNCED) haveUpdate = true;

  dispatch({ type: SYNC });
  await sleep(16); // Make sure rerender first.

  try {
    const {
      noteFPaths, ssltFPaths, staticFPaths, settingsFPaths, infoFPath, pinFPaths,
      tagFPaths,
    } = await dataApi.listServerFPaths(doForceListFPaths);
    const {
      noteMetas, conflictedMetas,
    } = listNoteMetas(noteFPaths, ssltFPaths, {});

    const leafFPaths = [];
    for (const meta of noteMetas) leafFPaths.push(...meta.fpaths);
    for (const meta of conflictedMetas) leafFPaths.push(...meta.fpaths);

    const {
      noteFPaths: _noteFPaths,
      ssltFPaths: _ssltFPaths,
      settingsFPaths: _settingsFPaths,
      infoFPath: _infoFPath,
      pinFPaths: _pinFPaths,
      tagFPaths: _tagFPaths,
    } = await dataApi.listFPaths(doForceListFPaths);
    const _staticFPaths = await fileApi.getStaticFPaths();
    const {
      noteMetas: _noteMetas, conflictedMetas: _conflictedMetas,
    } = listNoteMetas(_noteFPaths, _ssltFPaths, {});

    const _leafFPaths = [];
    for (const meta of _noteMetas) _leafFPaths.push(...meta.fpaths);
    for (const meta of _conflictedMetas) _leafFPaths.push(...meta.fpaths);

    const allNoteFPaths = [...new Set([...noteFPaths, ..._noteFPaths])];
    const allSsltFPaths = [...new Set([...ssltFPaths, ..._ssltFPaths])];
    const {
      noteMetas: allNoteMetas, conflictedMetas: allConflictedMetas,
      toRootIds: allToRootIds, ssltInfos: allSsltInfos,
    } = listNoteMetas(allNoteFPaths, allSsltFPaths, {});

    const allLeafFPaths = [];
    for (const meta of allNoteMetas) allLeafFPaths.push(...meta.fpaths);
    for (const meta of allConflictedMetas) allLeafFPaths.push(...meta.fpaths);

    const allLeafStaticFPaths = [];
    for (const fpath of allLeafFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        allLeafStaticFPaths.push(getStaticFPath(fpath));
      }
    }

    const allNoteMainIds = getNoteMainIds(
      allNoteMetas, allConflictedMetas, allToRootIds
    );

    // 1. Server side: upload all fpaths
    let fpaths = [], sValues = [], eValues = [], cValues = [], dValues = [];
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
              sValues.push(
                { id: fileFPath, type: PUT_FILE, path: fileFPath, content: '' }
              );
            }
          } else {
            if (!fpaths.includes(staticFPath)) {
              fpaths.push(staticFPath);
              const content = await fileApi.getFile(staticFPath);
              if (content !== undefined) {
                sValues.push(
                  { id: staticFPath, type: PUT_FILE, path: staticFPath, content }
                );
              }
            }
          }
        }
      }

      if (noteFPaths.includes(fpath)) continue;

      fpaths.push(fpath);
      if (allLeafFPaths.includes(fpath)) {
        if (fpath.includes(CD_ROOT + '/')) {
          eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: '' });
        } else {
          // No order guarantee but this is just one file
          const content = (await dataApi.getFiles([fpath])).contents[0];
          cValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
        }
      } else {
        if (fpath.endsWith(INDEX + DOT_JSON)) {
          const content = { title: '', body: '' };
          eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
        } else {
          eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: '' });
        }
      }

      [sValues, eValues, cValues, dValues] = await batchPerformFilesIfEnough(
        serverApi.performFiles, sValues, eValues, cValues, dValues
      );
    }

    // 2. Server side: loop used to be leaves in server and set to empty
    fpaths = [];
    for (const fpath of leafFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          !allLeafStaticFPaths.includes(staticFPath) &&
          staticFPaths.includes(staticFPath)
        ) {
          if (!fpaths.includes(staticFPath)) {
            fpaths.push(staticFPath);

            const value = {
              id: staticFPath, type: DELETE_FILE, path: staticFPath,
              doIgnoreDoesNotExistError: true,
            };
            dValues.push(value);
          }
        }
      }

      if (allLeafFPaths.includes(fpath)) continue;
      if (fpath.includes(CD_ROOT + '/')) continue; // Already empty string

      if (fpath.endsWith(INDEX + DOT_JSON)) {
        const content = { title: '', body: '' };
        eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      } else {
        eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: '' });
      }

      [sValues, eValues, cValues, dValues] = await batchPerformFilesIfEnough(
        serverApi.performFiles, sValues, eValues, cValues, dValues
      );
    }
    // Too risky, don't do it for now!
    /*for (const staticFPath of staticFPaths) {
      if (allLeafStaticFPaths.includes(staticFPath)) continue;
      if (!deletedFPaths.includes(staticFPath)) deletedFPaths.push(staticFPath);
    }*/

    // 3. Local side: download all fpaths
    let gFPaths = [], gStaticFPaths = [];
    let lsValues = [], leValues = [], lcValues = [], ldValues = [];
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
        if (fpath.includes(CD_ROOT + '/')) {
          leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: '' });
        } else {
          gFPaths.push(fpath);
        }
        continue;
      }

      if (fpath.endsWith(INDEX + DOT_JSON)) {
        const content = { title: '', body: '' };
        leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      } else {
        leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: '' });
      }

      [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
        dataApi.performFiles, lsValues, leValues, lcValues, ldValues
      );
    }
    if (vars.platform.isReactNative) {
      await serverApi.getFiles(gStaticFPaths, true);
    } else {
      for (let i = 0; i < gStaticFPaths.length; i += N_NOTES) {
        const sldFPaths = gStaticFPaths.slice(i, i + N_NOTES);
        const files = await serverApi.getFiles(sldFPaths, true);
        for (const { fpath, content } of files.responses) {
          if (content === null) continue;
          await fileApi.putFile(fpath, content);
        }
      }
    }
    for (let i = 0; i < gFPaths.length; i += N_NOTES) {
      const sldFPaths = gFPaths.slice(i, i + N_NOTES);
      // No order guarantee btw gFPaths and gContents
      const files = await serverApi.getFiles(sldFPaths);
      for (const { fpath, content } of files.responses) {
        lcValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      }

      [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
        dataApi.performFiles, lsValues, leValues, lcValues, ldValues
      );
    }

    // 4. Local side: loop used to be leaves in local and set to empty
    fpaths = [];
    for (const fpath of _leafFPaths) {
      if (fpath.includes(CD_ROOT + '/')) {
        const staticFPath = getStaticFPath(fpath);
        if (
          !allLeafStaticFPaths.includes(staticFPath) &&
          _staticFPaths.includes(staticFPath)
        ) {
          if (!fpaths.includes(staticFPath)) fpaths.push(staticFPath);
        }
      }

      if (allLeafFPaths.includes(fpath)) continue;
      if (fpath.includes(CD_ROOT + '/')) continue; // Already empty string

      if (fpath.endsWith(INDEX + DOT_JSON)) {
        const content = { title: '', body: '' };
        leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      } else {
        leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: '' });
      }

      [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
        dataApi.performFiles, lsValues, leValues, lcValues, ldValues
      );
    }
    // Can't just delete, maybe unsavedNotes!
    /*for (const staticFPath of _staticFPaths) {
      if (allLeafStaticFPaths.includes(staticFPath)) continue;
      if (!deletedFPaths.includes(staticFPath)) deletedFPaths.push(staticFPath);
    }*/
    await fileApi.deleteFiles(fpaths);

    // Sslts
    const leafSsltFPaths = [];
    for (const ssltMainId in allSsltInfos) {
      if (!allNoteMainIds.includes(ssltMainId)) continue;
      leafSsltFPaths.push(allSsltInfos[ssltMainId].fpath);
    }

    // 1. Server side: upload leaf ssltFPaths
    for (const fpath of leafSsltFPaths) {
      if (ssltFPaths.includes(fpath)) continue;
      eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }

    // 2. Server side: delete obsolete ssltFPaths
    for (const fpath of ssltFPaths) {
      if (leafSsltFPaths.includes(fpath)) continue;
      dValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
    [sValues, eValues, cValues, dValues] = await batchPerformFilesIfEnough(
      serverApi.performFiles, sValues, eValues, cValues, dValues
    );

    // 3. Local side: download leaf ssltFPaths
    for (const fpath of leafSsltFPaths) {
      if (_ssltFPaths.includes(fpath)) continue;
      haveUpdate = true;
      leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }

    // 4. Local side: delete obsolete ssltFPaths
    for (const fpath of _ssltFPaths) {
      if (leafSsltFPaths.includes(fpath)) continue;
      ldValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
    [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, lsValues, leValues, lcValues, ldValues
    );

    // Settings
    const { fpaths: settingsLeafFPaths } = getLastSettingsFPaths(settingsFPaths);
    const { fpaths: _settingsLeafFPaths } = getLastSettingsFPaths(_settingsFPaths);

    const settingsAllFPaths = [...new Set([...settingsFPaths, ..._settingsFPaths])];
    const { fpaths: settingsAllLeafFPaths } = getLastSettingsFPaths(settingsAllFPaths);

    // 1. Server side: upload all settingsFPaths
    for (const fpath of _settingsFPaths) {
      if (settingsFPaths.includes(fpath)) continue;

      let content;
      if (settingsAllLeafFPaths.includes(fpath)) {
        // No order guarantee but this is just one file
        content = (await dataApi.getFiles([fpath])).contents[0];
        cValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      } else {
        content = {};
        eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      }
    }

    // 2. Server side: loop used to be leaves in server and set to empty
    for (const fpath of settingsLeafFPaths) {
      if (settingsAllLeafFPaths.includes(fpath)) continue;
      eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }
    [sValues, eValues, cValues, dValues] = await batchPerformFilesIfEnough(
      serverApi.performFiles, sValues, eValues, cValues, dValues
    );

    // 3. Local side: download all settingsFPaths
    gFPaths = [];
    for (const fpath of settingsFPaths) {
      if (_settingsFPaths.includes(fpath)) continue;
      haveUpdate = true;

      if (settingsAllLeafFPaths.includes(fpath)) {
        gFPaths.push(fpath);
        continue;
      }

      leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }
    for (let i = 0; i < gFPaths.length; i += N_NOTES) {
      const sldFPaths = gFPaths.slice(i, i + N_NOTES);
      // No order guarantee btw gFPaths and gContents
      const files = await serverApi.getFiles(sldFPaths);
      for (const { fpath, content } of files.responses) {
        lcValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      }
    }

    // 4. Local side: loop used to be leaves in local and set to empty
    for (const fpath of _settingsLeafFPaths) {
      if (settingsAllLeafFPaths.includes(fpath)) continue;
      leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }
    [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, lsValues, leValues, lcValues, ldValues
    );

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
      lcValues.push({ id: infoFPath, type: PUT_FILE, path: infoFPath, content });

      // Delete obsolete version in device
      if (_infoFPath) {
        const value = {
          id: _infoFPath, type: DELETE_FILE, path: _infoFPath,
          doIgnoreDoesNotExistError: false,
        };
        ldValues.push(value);
      }

      haveUpdate = true;
      [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
        dataApi.performFiles, lsValues, leValues, lcValues, ldValues
      );
    } else if (syncInfoAction === 2) {
      // Upload from device to server

      // No order guarantee but this is just one file
      const content = (await dataApi.getFiles([_infoFPath])).contents[0];
      cValues.push({ id: _infoFPath, type: PUT_FILE, path: _infoFPath, content });

      // Delete obsolete version in server
      if (infoFPath) {
        const value = {
          id: infoFPath, type: DELETE_FILE, path: infoFPath,
          doIgnoreDoesNotExistError: true,
        };
        dValues.push(value);
      }

      [sValues, eValues, cValues, dValues] = await batchPerformFilesIfEnough(
        serverApi.performFiles, sValues, eValues, cValues, dValues
      );
    } else throw new Error(`Invalid syncInfoAction: ${syncInfoAction}`);

    // Pins
    const allPinFPaths = [...new Set([...pinFPaths, ..._pinFPaths])];
    const allPins = getRawPins(allPinFPaths, allToRootIds);

    const leafPinFPaths = [];
    for (const pinMainId in allPins) {
      if (!allNoteMainIds.includes(pinMainId)) continue;
      leafPinFPaths.push(allPins[pinMainId].fpath);
    }

    // 1. Server side: upload leaf pinFPaths
    for (const fpath of leafPinFPaths) {
      if (pinFPaths.includes(fpath)) continue;
      eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }

    // 2. Server side: delete obsolete pinFPaths
    for (const fpath of pinFPaths) {
      if (leafPinFPaths.includes(fpath)) continue;
      dValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
    [sValues, eValues, cValues, dValues] = await batchPerformFilesIfEnough(
      serverApi.performFiles, sValues, eValues, cValues, dValues
    );

    // 3. Local side: download leaf pinFPaths
    for (const fpath of leafPinFPaths) {
      if (_pinFPaths.includes(fpath)) continue;
      haveUpdate = true;
      leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }

    // 4. Local side: delete obsolete pinFPaths
    for (const fpath of _pinFPaths) {
      if (leafPinFPaths.includes(fpath)) continue;
      ldValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
    [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, lsValues, leValues, lcValues, ldValues
    );

    // Tags
    const allTagFPaths = [...new Set([...tagFPaths, ..._tagFPaths])];
    const allTags = getRawTags(allTagFPaths, allToRootIds);

    const leafTagFPaths = [];
    for (const tagMainId in allTags) {
      if (!allNoteMainIds.includes(tagMainId)) continue;
      for (const value of allTags[tagMainId].values) {
        leafTagFPaths.push(value.fpath);
      }
    }

    // 1. Server side: upload leaf tagFPaths
    for (const fpath of leafTagFPaths) {
      if (tagFPaths.includes(fpath)) continue;
      eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }

    // 2. Server side: delete obsolete tagFPaths
    for (const fpath of tagFPaths) {
      if (leafTagFPaths.includes(fpath)) continue;
      dValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
    [sValues, eValues, cValues, dValues] = await batchPerformFilesIfEnough(
      serverApi.performFiles, sValues, eValues, cValues, dValues, N_NOTES, true
    );

    // 3. Local side: download leaf tagFPaths
    for (const fpath of leafTagFPaths) {
      if (_tagFPaths.includes(fpath)) continue;
      haveUpdate = true;
      leValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    }

    // 4. Local side: delete obsolete tagFPaths
    for (const fpath of _tagFPaths) {
      if (leafTagFPaths.includes(fpath)) continue;
      ldValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
    [lsValues, leValues, lcValues, ldValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, lsValues, leValues, lcValues, ldValues, N_NOTES, true
    );

    if (syncQueue.length <= 1) {
      dispatch({
        type: SYNC_COMMIT, payload: { updateAction, haveUpdate },
      });
    } else {
      if (updateAction < vars.sync.updateAction) vars.sync.updateAction = updateAction;
      if (haveUpdate) vars.sync.haveUpdate = haveUpdate;
    }

    if (waitResolve) waitResolve(true);
    vars.sync.lastSyncDT = Date.now();
  } catch (error) {
    console.log('Sync error: ', error);
    if (updateAction < vars.sync.updateAction) vars.sync.updateAction = updateAction;
    if (haveUpdate) vars.sync.haveUpdate = haveUpdate;

    const signInDT = getState().localSettings.signInDT;
    dispatch({ type: SYNC_ROLLBACK, payload: { error, signInDT } });
    if (waitResolve) waitResolve(false);
  }
};

export const sync = (doForceListFPaths = false, updateAction = 0) => async (
  dispatch, getState
) => {
  if (syncQueue.length >= 7) {
    console.log('Sync queue length is too high:', syncQueue.length);
    return;
  }
  if (syncQueue.length >= 2) {
    let foundDoForce = false, foundUpdateAction = false;
    if (!doForceListFPaths) foundDoForce = true;
    if (updateAction === 0) foundUpdateAction = true;

    // @ts-expect-error
    for (const task of syncQueue.jobs) {
      if (task[TASK_DO_FORCE_LIST_FPATHS]) foundDoForce = true;
      if (task[TASK_UPDATE_ACTION] <= updateAction) foundUpdateAction = true;
    }

    if (foundDoForce && foundUpdateAction) return;
  }

  const task = syncInQueue(null, doForceListFPaths, updateAction, dispatch, getState);
  task[TASK_DO_FORCE_LIST_FPATHS] = doForceListFPaths;
  task[TASK_UPDATE_ACTION] = updateAction;
  syncQueue.push(task);
};

export const syncAndWait = (doForceListFPaths = false, updateAction = 0) => async (
  dispatch, getState
) => {
  if (syncQueue.length >= 7) {
    console.log('Sync queue length is too high:', syncQueue.length);
    return false;
  }

  const waitPromise = new Promise(resolve => {
    const task = syncInQueue(
      resolve, doForceListFPaths, updateAction, dispatch, getState
    );
    task[TASK_DO_FORCE_LIST_FPATHS] = doForceListFPaths;
    task[TASK_UPDATE_ACTION] = updateAction;
    syncQueue.push(task);
  });
  const waitResult = await waitPromise;

  return waitResult;
};

export const tryUpdateSynced = (updateAction, haveUpdate) => async (
  dispatch, getState
) => {
  dispatch(updateHubAddr());

  if (vars.sync.updateAction < updateAction) updateAction = vars.sync.updateAction;
  if (!haveUpdate) haveUpdate = vars.sync.haveUpdate;
  [vars.sync.updateAction, vars.sync.haveUpdate] = [Infinity, false];

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
    const scrollY = vars.scrollPanel.scrollY;
    const noteId = getState().display.noteId;
    const isPopupShown = (
      getState().display.isNoteListItemMenuPopupShown ||
      getState().display.isListNamesPopupShown ||
      getState().display.isPinMenuPopupShown ||
      getState().display.isLockMenuPopupShown
    );

    const isEditorFocused = getState().display.isEditorFocused;
    const isEditorBusy = getState().display.isEditorBusy;
    if (
      scrollY === 0 && noteId === null && !isPopupShown &&
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
  return { type: UPDATE_EDITOR_FOCUSED, payload: isFocused };
};

export const updateEditorBusy = (isBusy) => {
  return { type: UPDATE_EDITOR_BUSY, payload: isBusy };
};

export const updateMoveAction = (moveAction) => {
  return { type: UPDATE_MOVE_ACTION, payload: moveAction };
};

export const updateDeleteAction = (deleteAction) => {
  return { type: UPDATE_DELETE_ACTION, payload: deleteAction };
};

export const updateDiscardAction = (discardAction) => {
  return { type: UPDATE_DISCARD_ACTION, payload: discardAction };
};

export const updateListNamesMode = (mode) => {
  return { type: UPDATE_LIST_NAMES_MODE, payload: { listNamesMode: mode } };
};

export const updateSidebarListNamesMode = (mode) => {
  return {
    type: UPDATE_SIDEBAR_LIST_NAMES_MODE, payload: { sidebarListNamesMode: mode },
  };
};

export const increaseSaveNoteCount = () => {
  return { type: INCREASE_SAVE_NOTE_COUNT };
};

export const increaseDiscardNoteCount = () => {
  return { type: INCREASE_DISCARD_NOTE_COUNT };
};

export const increaseChangeListNameCount = () => {
  return { type: INCREASE_CHANGE_LIST_NAME_COUNT };
};

export const increaseUpdateQueryStringCount = () => {
  return { type: INCREASE_UPDATE_QUERY_STRING_COUNT };
};

export const increaseFocusTitleCount = () => {
  return { type: INCREASE_FOCUS_TITLE_COUNT };
};

export const increaseSetInitDataCount = () => {
  return { type: INCREASE_SET_INIT_DATA_COUNT };
};

export const increaseUpdateEditorWidthCount = () => {
  return { type: INCREASE_UPDATE_EDITOR_WIDTH_COUNT };
};

export const increaseResetDidClickCount = () => {
  return { type: INCREASE_RESET_DID_CLICK_COUNT };
};

export const increaseShowNoteListMenuPopupCount = () => {
  return { type: INCREASE_SHOW_NOTE_LIST_MENU_POPUP_COUNT };
};

export const increaseShowNLIMPopupCount = () => {
  return { type: INCREASE_SHOW_NLIM_POPUP_COUNT };
};

export const increaseShowUNEPopupCount = () => {
  return { type: INCREASE_SHOW_UNE_POPUP_COUNT };
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

export const updatePaywallFeature = (feature) => {
  return { type: UPDATE_PAYWALL_FEATURE, payload: feature };
};

export const pinNotes = (ids) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    dispatch(updatePaywallFeature(FEATURE_PIN));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const currentPins = getPins(pinFPaths, pendingPins, true, toRootIds);
  const currentRanks = Object.values<any>(currentPins).map(pin => pin.rank).sort();

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
    const mainId = getMainId(id, toRootIds);
    if (isObject(currentPins[mainId])) continue;

    const nextRank = lexoRank.toString().slice(2).replace(':', '_');
    pins.push({ rank: nextRank, updatedDT: now, addedDT: now, id });

    lexoRank = lexoRank.genNext();
    now += 1;
  }

  if (pins.length === 0) return;

  await _pinNotes(pins, dispatch, getState);
};

const _pinNotes = async (pins, dispatch, getState) => {
  let payload = { pins };
  dispatch({ type: PIN_NOTE, payload });
  await sortShowingNoteInfos(dispatch, getState);

  try {
    const result = await dataApi.putPins(payload);
    payload = { ...payload, ...result };
  } catch (error) {
    console.log('pinNotes error: ', error);
    dispatch({ type: PIN_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: PIN_NOTE_COMMIT, payload });
};

export const unpinNotes = (ids, doSync = false) => async (dispatch, getState) => {
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const currentPins = getPins(pinFPaths, pendingPins, true, toRootIds);

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
    if (doSync) dispatch(sync());
    return;
  }

  await _unpinNotes(pins, dispatch, getState);
};

const _unpinNotes = async (pins, dispatch, getState) => {
  let payload = { pins };
  dispatch({ type: UNPIN_NOTE, payload });
  await sortShowingNoteInfos(dispatch, getState);

  try {
    const result = await dataApi.deletePins(payload);
    payload = { ...payload, ...result };
  } catch (error) {
    console.log('unpinNotes error: ', error);
    dispatch({ type: UNPIN_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: UNPIN_NOTE_COMMIT, payload });
};

export const movePinnedNote = (id, direction) => async (dispatch, getState) => {
  const notes = getState().notes;
  const showingNoteInfos = getState().display.showingNoteInfos;
  const pendingSslts = getState().pendingSslts;
  const pendingPins = getState().pendingPins;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  if (!Array.isArray(showingNoteInfos)) {
    console.log('In movePinnedNote, no showingNoteInfos found for note id: ', id);
    return;
  }

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const fsNts = [];
  for (const info of showingNoteInfos) {
    if (info.id.startsWith('conflict')) continue;
    const note = getNote(info.id, notes);
    if (isObject(note) && SHOWING_STATUSES.includes(note.status)) fsNts.push(note);
  }

  const [pinnedValues] = separatePinnedValues(
    fsNts, pinFPaths, pendingPins, toRootIds, (note) => {
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

      if (pRank === ppRank) nextRank = ppLexoRank.toString();
      else nextRank = ppLexoRank.between(pLexoRank).toString();
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

      if (nRank === nnRank) nextRank = nLexoRank.toString();
      else nextRank = nLexoRank.between(nnLexoRank).toString();
    }
  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }
  nextRank = nextRank.slice(2).replace(':', '_');

  const now = Date.now();
  const { addedDT } = pinnedValues[i].pin;
  const pin = { rank: nextRank, updatedDT: now, addedDT, id };
  await _movePinnedNote(pin, dispatch, getState);
};

const _movePinnedNote = async (pin, dispatch, getState) => {
  let payload = { ...pin };
  dispatch({ type: MOVE_PINNED_NOTE, payload });
  await sortShowingNoteInfos(dispatch, getState);

  try {
    const result = await dataApi.putPins({ pins: [payload] });
    payload = { ...payload, ...result };
  } catch (error) {
    console.log('movePinnedNote error: ', error);
    dispatch({ type: MOVE_PINNED_NOTE_ROLLBACK, payload: { ...payload, error } });
    return;
  }

  dispatch({ type: MOVE_PINNED_NOTE_COMMIT, payload });
};

export const retryDiedPins = () => async (dispatch, getState) => {
  const pendingPins = getState().pendingPins;

  const pPins = [], uPins = [], mPins = [];
  for (const id in pendingPins) {
    const pendingPin = pendingPins[id];
    const [status, pin] = [pendingPin.status, newObject(pendingPin, [STATUS])];
    if (status === PIN_NOTE_ROLLBACK) {
      pPins.push(pin);
    } else if (status === UNPIN_NOTE_ROLLBACK) {
      uPins.push(pin);
    } else if (status === MOVE_PINNED_NOTE_ROLLBACK) {
      mPins.push(pin);
    }
  }

  if (pPins.length > 0) {
    await _pinNotes(pPins, dispatch, getState);
  }
  if (uPins.length > 0) {
    await _unpinNotes(uPins, dispatch, getState);
  }
  if (mPins.length > 0) {
    for (const pin of mPins) {
      await _movePinnedNote(pin, dispatch, getState);
    }
  }
};

export const cancelDiedPins = () => async (dispatch, getState) => {
  dispatch({ type: CANCEL_DIED_PINS });
  await sortShowingNoteInfos(dispatch, getState);
};

export const cleanUpPins = () => async (dispatch, getState) => {
  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const pinFPaths = getPinFPaths(getState());

  const {
    noteMetas, conflictedMetas, toRootIds,
  } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const noteMainIds = getNoteMainIds(noteMetas, conflictedMetas, toRootIds);
  const pins = getRawPins(pinFPaths, toRootIds);

  let nNotes = N_NOTES;
  if (getState().user.hubUrl === SD_HUB_URL) nNotes = 60;

  const unusedValues = [];
  for (const fpath of pinFPaths) {
    const { id } = extractPinFPath(fpath);

    const _id = id.startsWith('deleted') ? id.slice(7) : id;
    const pinMainId = getMainId(_id, toRootIds);

    if (
      !isString(pinMainId) ||
      !noteMainIds.includes(pinMainId) ||
      !isObject(pins[pinMainId]) ||
      pins[pinMainId].fpath !== fpath
    ) {
      unusedValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
      if (unusedValues.length >= nNotes) break;
    }
  }

  if (unusedValues.length > 0) {
    try {
      const data = { values: unusedValues, isSequential: false, nItemsForNs: N_NOTES };
      await dataApi.performFiles(data);
    } catch (error) {
      console.log('cleanUpPins error: ', error);
      // error in this step should be fine
    }
  }

  // If add a new pin, no unused pins but need to sync anyway.
  dispatch(sync());
};

// Need to separate bulk edit here, not in the actions like moveNotes,
//   because unpinNotes can be called in reducers and might intervene the isBulkEditing.
export const bulkPinNotes = (ids) => async (dispatch, getState) => {
  if (ids.length === 0) return;

  const isBulkEditing = getState().display.isBulkEditing;
  if (isBulkEditing) updateBulkEditUrlHash(false);

  await pinNotes(ids)(dispatch, getState);
};

export const bulkUnpinNotes = (ids, doSync = false) => async (dispatch, getState) => {
  if (ids.length === 0) return;

  const isBulkEditing = getState().display.isBulkEditing;
  if (isBulkEditing) updateBulkEditUrlHash(false);

  await unpinNotes(ids, doSync)(dispatch, getState);
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

export const updateTimePick = (hour, minute = null, period = null) => {
  const timeObj: any = {};
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

export const shareNote = () => async (dispatch, getState) => {
  const notes = getState().notes;
  const selectingNoteId = getState().display.selectingNoteId;

  const note = getNote(selectingNoteId, notes);
  if (!isObject(note)) {
    console.log('In shareNote, invalid selectingNoteId:', selectingNoteId);
    return;
  }

  try {
    await Share.open({
      message: note.title + '\n\n' + stripHtml(note.body, true),
    });
    dispatch(increaseUpdateStatusBarStyleCount());
  } catch (error) {
    dispatch(increaseUpdateStatusBarStyleCount());

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

  const notes = getState().notes;
  const selectingNoteId = getState().display.selectingNoteId;

  const note = getNote(selectingNoteId, notes);
  if (!isObject(note)) {
    console.log('In exportNoteAsPdf, invalid selectingNoteId:', selectingNoteId);
    return;
  }

  let name, file;
  try {
    const body = await replaceImageUrls(note.body);

    let html = `${jhfp}`;
    html = html.replace(/__-title-__/g, note.title);
    html = html.replace(/__-body-__/g, body);
    if (Platform.OS === 'ios') html = html.replace(' mx-12 my-16"', '"');

    name = note.title ? `${note.title}` : '';
    for (const ch of ['\\', '/', ':', '*', '?', '"', '<', '>', '|']) {
      name = name.replaceAll(ch, ' ');
    }
    name = name.replace(/\s+/g, ' ').trim();
    if (!name) name = 'Justnote\'s note';
    if (name.length > 56) name = name.slice(0, 56);
    name += ` ${getFormattedTimeStamp(new Date())}`;

    const options: any = { html };
    if (Platform.OS === 'ios') {
      options.margins = { left: 48, top: 64, right: 48, bottom: 64 };
    }

    file = await Print.printToFileAsync(options);
  } catch (error) {
    dispatch(updateExportNoteAsPdfProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  if (Platform.OS === 'ios') {
    dispatch(updateExportNoteAsPdfProgress(null));
    try {
      await Share.open({ url: file.uri });
      dispatch(increaseUpdateStatusBarStyleCount());
    } catch (error) {
      dispatch(increaseUpdateStatusBarStyleCount());

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

      dispatch(updateExportNoteAsPdfProgress({
        total: -1, done: -1, error: `${error}`,
      }));
      return;
    }

    return;
  }

  if (Platform.OS === 'android') {
    if (Platform.Version <= 28) {
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
      await FileSystem.cpExternal(file.uri, fname, 'downloads');
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

export const updateLockAction = (lockAction) => {
  return { type: UPDATE_LOCK_ACTION, payload: lockAction };
};

export const updateLockEditor = (payload) => {
  return { type: UPDATE_LOCK_EDITOR, payload };
};

export const showAddLockEditorPopup = (actionType) => async (dispatch, getState) => {
  const purchases = getState().info.purchases;

  if (!doEnableExtraFeatures(purchases)) {
    if (actionType === LOCK_ACTION_ADD_LOCK_NOTE) {
      updatePopupUrlHash(NOTE_LIST_ITEM_MENU_POPUP, false, null);
    } else if (actionType === LOCK_ACTION_ADD_LOCK_LIST) {
      updatePopupUrlHash(SETTINGS_LISTS_MENU_POPUP, false, null);
    }

    dispatch(updatePaywallFeature(FEATURE_LOCK));
    dispatch(updatePopup(PAYWALL_POPUP, true));
    return;
  }

  dispatch(updateLockAction(actionType));
  updatePopupUrlHash(LOCK_EDITOR_POPUP, true, null, true);
};

export const addLockNote = (
  noteId, password, doShowTitle, canExport
) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const noteMainId = getMainId(noteId, toRootIds);
  password = await ecApi.encrypt(password);

  dispatch({
    type: ADD_LOCK_NOTE,
    payload: { noteId, noteMainId, password, doShowTitle, canExport },
  });
  updatePopupUrlHash(LOCK_EDITOR_POPUP, false, null);
};

export const showLockMenuPopup = (noteId, rect) => async (dispatch, getState) => {
  // While editing another note, show lock menu popup is fine,
  //   as not updating the displayReducer noteId to this note.
  if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;

  dispatch(updateSelectingNoteId(noteId));
  updatePopupUrlHash(LOCK_MENU_POPUP, true, rect);
};

export const removeLockNote = (noteId, password) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const noteMainId = getMainId(noteId, toRootIds);
  const lockedNote = getState().lockSettings.lockedNotes[noteMainId];

  let isValid = false;
  if (isObject(lockedNote)) {
    if (isString(lockedNote.password)) {
      const lockedPassword = await ecApi.decrypt(lockedNote.password);
      if (lockedPassword === password) isValid = true;
    }
  }
  if (!isValid) {
    dispatch(updateLockEditor({
      isLoadingShown: false, errMsg: 'Password is not correct. Please try again.',
    }));
    return;
  }

  dispatch({ type: REMOVE_LOCK_NOTE, payload: { noteMainId } });
  updatePopupUrlHash(LOCK_EDITOR_POPUP, false, null);
};

export const lockNote = (noteId) => async (dispatch, getState) => {
  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const noteMainId = getMainId(noteId, toRootIds);

  dispatch({ type: LOCK_NOTE, payload: { noteId, noteMainId } });
};

export const showUNEPopup = (noteId, doCheckEditing) => async (dispatch, getState) => {
  // While editing another note, before showing unlockNoteEditorPopup,
  //   need to handle the unsaved note first,
  //   as the displayReducer noteId will be updated to this note.
  if (!noteId) noteId = vars.showUNEPopup.selectedNoteId;

  if (doCheckEditing) {
    if (vars.updateSettings.doFetch || vars.syncMode.didChange) return;
    if (vars.deleteOldNotes.ids && vars.deleteOldNotes.ids.includes(noteId)) return;

    const isEditorUploading = getState().editor.isUploading;
    if (isEditorUploading) return;

    const isEditorFocused = getState().display.isEditorFocused;
    if (isEditorFocused) {
      vars.showUNEPopup.selectedNoteId = noteId;
      dispatch(increaseShowUNEPopupCount());
      return;
    }
  }

  dispatch(updateSelectingNoteId(noteId));
  dispatch(updateLockAction(LOCK_ACTION_UNLOCK_NOTE));
  updatePopupUrlHash(LOCK_EDITOR_POPUP, true);
};

export const onShowUNEPopup = (title, body, media) => async (dispatch, getState) => {
  const { noteId } = getState().display;
  if (vars.keyboard.height > 0) dispatch(increaseBlurCount());
  dispatch(showUNEPopup(null, false));
  dispatch(handleUnsavedNote(noteId, title, body, media));
};

export const unlockNote = (noteId, password) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const noteMainId = getMainId(noteId, toRootIds);
  const lockedNote = getState().lockSettings.lockedNotes[noteMainId];

  let isValid = false;
  if (isObject(lockedNote)) {
    if (isString(lockedNote.password)) {
      const lockedPassword = await ecApi.decrypt(lockedNote.password);
      if (lockedPassword === password) isValid = true;
    }
  }
  if (!isValid) {
    dispatch(updateLockEditor({
      isLoadingShown: false, errMsg: 'Password is not correct. Please try again.',
    }));
    return;
  }

  dispatch({ type: UNLOCK_NOTE, payload: { noteMainId, unlockedDT: Date.now() } });
  updatePopupUrlHash(LOCK_EDITOR_POPUP, false, null);

  const safeAreaWidth = getState().window.width;
  if (isNumber(safeAreaWidth) && safeAreaWidth < LG_WIDTH) {
    // As this and hiding lock editor popup both change url hash,
    //   need to be in different js clock cycle.
    setTimeout(() => {
      updateNoteIdUrlHash(noteId);
    }, 100);
  } else dispatch(updateNoteId(noteId));
};

export const addLockList = (
  listName, password, canChangeListNames, canExport
) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  password = await ecApi.encrypt(password);

  dispatch({
    type: ADD_LOCK_LIST,
    payload: { listName, password, canChangeListNames, canExport },
  });
  updatePopupUrlHash(LOCK_EDITOR_POPUP, false, null);
};

export const removeLockList = (listName, password) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  const lockedList = getState().lockSettings.lockedLists[listName];

  let isValid = false;
  if (isObject(lockedList)) {
    if (isString(lockedList.password)) {
      const lockedPassword = await ecApi.decrypt(lockedList.password);
      if (lockedPassword === password) isValid = true;
    }
  }
  if (!isValid) {
    dispatch(updateLockEditor({
      isLoadingShown: false, errMsg: 'Password is not correct. Please try again.',
    }));
    return;
  }

  dispatch({ type: REMOVE_LOCK_LIST, payload: { listName } });
  updatePopupUrlHash(LOCK_EDITOR_POPUP, false, null);
};

export const lockCurrentList = () => async (dispatch, getState) => {
  const listName = getState().display.listName;
  dispatch({ type: LOCK_LIST, payload: { listName } });
};

export const unlockList = (listName, password) => async (dispatch, getState) => {
  const vResult = validatePassword(password);
  if (vResult !== VALID_PASSWORD) {
    dispatch(updateLockEditor({ errMsg: PASSWORD_MSGS[vResult] }));
    return;
  }

  dispatch(updateLockEditor({ isLoadingShown: true, errMsg: '' }));
  await sleep(16);

  const lockedList = getState().lockSettings.lockedLists[listName];

  let isValid = false;
  if (isObject(lockedList)) {
    if (isString(lockedList.password)) {
      const lockedPassword = await ecApi.decrypt(lockedList.password);
      if (lockedPassword === password) isValid = true;
    }
  }
  if (!isValid) {
    dispatch(updateLockEditor({
      isLoadingShown: false, errMsg: 'Password is not correct. Please try again.',
    }));
    return;
  }

  dispatch({ type: UNLOCK_LIST, payload: { listName, unlockedDT: Date.now() } });
  updatePopupUrlHash(LOCK_EDITOR_POPUP, false, null);
};

const cleanUpLocks = async (dispatch, getState) => {
  const { listNameMap } = getState().settings;
  const lockSettings = getState().lockSettings;
  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());

  const { toLeafIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const noteMainIds = [];
  for (const noteMainId in lockSettings.lockedNotes) {
    if (!Array.isArray(toLeafIds[noteMainId])) noteMainIds.push(noteMainId);
  }

  const listNames = [];
  for (const listName in lockSettings.lockedLists) {
    if (!doContainListName(listName, listNameMap)) listNames.push(listName);
  }

  if (noteMainIds.length === 0 && listNames.length === 0) return;

  dispatch({ type: CLEAN_UP_LOCKS, payload: { noteMainIds, listNames } });
};

const _isTagValuesDiff = (selectedValues, values) => {
  const [isSvArr, isVArr] = [Array.isArray(selectedValues), Array.isArray(values)];
  if (!isSvArr && !isVArr) return false;
  if (!isSvArr || !isVArr) return true;
  if (selectedValues.length !== values.length) return true;

  for (let i = 0; i < selectedValues.length; i++) {
    const [selectedValue, value] = [selectedValues[i], values[i]];
    if (selectedValue.tagName !== value.tagName) return true;
  }

  return false;
};

const _initTagEditorState = (getState) => {
  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());
  const pendingSslts = getState().pendingSslts;
  const pendingTags = getState().pendingTags;
  const tagNameMap = getState().settings.tagNameMap;
  const selectingNoteId = getState().display.selectingNoteId;
  const isBulkEditing = getState().display.isBulkEditing;
  const selectedNoteIds = getState().display.selectedNoteIds;

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const editor = { ...initialTagEditorState };

  let ids;
  if (isBulkEditing) {
    if (selectedNoteIds.length === 0) {
      editor.mode = INVALID;
      return editor;
    }
    ids = selectedNoteIds;
  } else {
    if (!isString(selectingNoteId)) {
      editor.mode = INVALID;
      return editor;
    }
    ids = [selectingNoteId];
  }
  editor.ids = ids;

  const tags = getTags(tagFPaths, pendingTags, toRootIds);
  const mainIds = ids.map(id => getMainId(id, toRootIds));

  let selectedValues = null;
  if (isObject(tags[mainIds[0]]) && tags[mainIds[0]].values.length > 0) {
    selectedValues = tags[mainIds[0]].values;
  }

  for (const mainId of mainIds.slice(1)) {
    let values = null;
    if (isObject(tags[mainId]) && tags[mainId].values.length > 0) {
      values = tags[mainId].values;
    }

    const isDiff = _isTagValuesDiff(selectedValues, values);
    if (isDiff) {
      editor.mode = NOT_SUPPORTED;
      return editor;
    }
  }

  if (Array.isArray(selectedValues) && selectedValues.length > 0) {
    [editor.mode, editor.values] = [TAGGED, []];
    for (const { tagName } of selectedValues) {
      const { tagNameObj } = getTagNameObj(tagName, tagNameMap);
      if (!isObject(tagNameObj)) continue;
      editor.values.push({
        tagName, displayName: tagNameObj.displayName, color: tagNameObj.color,
      });
    }
  }

  editor.hints = [];
  for (const tagNameObj of tagNameMap) {
    const { tagName, displayName, color } = tagNameObj;

    const found = editor.values.some(value => value.tagName === tagName);
    editor.hints.push({ tagName, displayName, color, isBlur: found });
  }

  return editor;
};

export const updateTagEditorPopup = (isShown, doCheckEnableExtraFeatures) => async (
  dispatch, getState
) => {
  if (isShown) {
    if (doCheckEnableExtraFeatures) {
      const purchases = getState().info.purchases;
      if (!doEnableExtraFeatures(purchases)) {
        if (getState().display.isNoteListItemMenuPopupShown) {
          updatePopupUrlHash(NOTE_LIST_ITEM_MENU_POPUP, false, null);
        }
        if (getState().display.isBulkEditMenuPopupShown) {
          updatePopupUrlHash(BULK_EDIT_MENU_POPUP, false, null);
        }

        dispatch(updatePaywallFeature(FEATURE_TAG));
        dispatch(updatePopup(PAYWALL_POPUP, true));
        return;
      }
    }

    const payload = _initTagEditorState(getState);
    if (payload.mode === INVALID) {
      if (getState().display.isNoteListItemMenuPopupShown) {
        updatePopupUrlHash(NOTE_LIST_ITEM_MENU_POPUP, false, null);
      }
      if (getState().display.isBulkEditMenuPopupShown) {
        updatePopupUrlHash(BULK_EDIT_MENU_POPUP, false, null);
      }
      return;
    }

    dispatch({ type: UPDATE_TAG_EDITOR, payload });
    updatePopupUrlHash(TAG_EDITOR_POPUP, true, null, true);
    return;
  }

  updatePopupUrlHash(TAG_EDITOR_POPUP, false);
};

export const updateTagEditor = (values, hints, displayName, color, msg) => {
  const payload: any = {};
  if (Array.isArray(values)) payload.values = values;
  if (Array.isArray(hints)) payload.hints = hints;

  if (isString(displayName)) payload.displayName = displayName;
  if (isString(color)) payload.color = color;

  if (isString(msg)) payload.msg = msg;
  else payload.msg = '';

  return { type: UPDATE_TAG_EDITOR, payload };
};

export const addTagEditorTagName = (values, hints, displayName, color) => async (
  dispatch, getState
) => {

  displayName = displayName.trim();

  const result = validateTagNameDisplayName(null, displayName, []);
  if (result !== VALID_TAG_NAME) {
    dispatch(updateTagEditor(null, null, null, null, TAG_NAME_MSGS[result]));
    return;
  }

  const found = values.some(value => value.displayName === displayName);
  if (found) {
    dispatch(
      updateTagEditor(null, null, null, null, TAG_NAME_MSGS[DUPLICATE_TAG_NAME])
    );
    return;
  }

  const tagNameMap = getState().settings.tagNameMap;
  const { tagNameObj } = getTagNameObjFromDisplayName(displayName, tagNameMap);

  let tagName;
  if (isObject(tagNameObj)) tagName = tagNameObj.tagName;
  if (!isString(tagName)) tagName = `${Date.now()}-${randomString(4)}`;

  const newValues = [...values, { tagName, displayName, color }];
  const newHints = hints.map(hint => {
    if (hint.tagName !== tagName) return hint;
    return { ...hint, isBlur: true };
  });

  dispatch(updateTagEditor(newValues, newHints, '', null, ''));
};

export const updateTagData = (ids, values) => async (dispatch, getState) => {
  const { queryString, noteId, isBulkEditing } = getState().display;

  if (!isBulkEditing && ids.includes(noteId) && queryString) {
    // Only tag name for now
    const tagName = queryString.trim();
    const found = values.some(value => value.tagName === tagName);
    if (!found) {
      const safeAreaWidth = getState().window.width;
      if (isNumber(safeAreaWidth) && safeAreaWidth >= LG_WIDTH) {
        dispatch(updateNoteId(null));
      }
    }
  }

  if (isBulkEditing) updateBulkEditUrlHash(false);

  if (!Array.isArray(ids) || ids.length === 0) {
    console.log('In updateTagData, invalid ids: ', ids);
    return;
  }

  const valuesPerId = {};
  for (const id of ids) {
    valuesPerId[id] = values;
  }

  await updateTagDataSStep(ids, valuesPerId)(dispatch, getState);
};

const updateTagDataSStepInQueue = (payload, dispatch, getState) => async () => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;

  if (!isEqual(settings, snapshotSettings)) {
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
    payload = { ...payload, doUpdateSettings: true, settings, doFetch };

    vars.updateSettings.doFetch = doFetch;

    try {
      await dataApi.putSettings(
        { settingsFPaths: [settingsFPath], settingsContents: [settings] }
      );
    } catch (error) {
      console.log('updateTagDataSStep error: ', error);
      dispatch({
        type: UPDATE_TAG_DATA_S_STEP_ROLLBACK, payload: { ...payload, error },
      });
      vars.updateSettings.doFetch = false;
      return;
    }

    await cleanUpSettings(_settingsFPaths);
  }

  dispatch({ type: UPDATE_TAG_DATA_S_STEP_COMMIT, payload });
  vars.updateSettings.doFetch = false;
};

const updateTagDataSStep = (rawIds, rawValuesPerId) => async (
  dispatch, getState
) => {
  const pendingSslts = getState().pendingSslts;
  const tagNameMap = getState().settings.tagNameMap;
  const ssTagNameMap = getState().snapshot.settings.tagNameMap;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const solvedTags = getTags(tagFPaths, {}, toRootIds);

  const ids = [], valuesPerId = {};
  for (const id of rawIds) {
    const [values, mainId] = [rawValuesPerId[id], getMainId(id, toRootIds)];

    const aTns = [], bTns = [];
    if (isObject(solvedTags[mainId])) {
      for (const value of solvedTags[mainId].values) aTns.push(value.tagName);
    }
    for (const value of values) bTns.push(value.tagName);

    if (isArrayEqual(aTns, bTns)) continue;

    ids.push(id);
    valuesPerId[id] = values;
  }

  if (ids.length === 0) return;

  const newTagNameObjsPerId = {}, newTagNameObjs = [], chkdTagNames = [];
  for (const id of ids) {
    const values = valuesPerId[id];
    for (const value of values) {
      const { tagNameObj } = getTagNameObj(value.tagName, tagNameMap);
      const { tagNameObj: ssTagNameObj } = getTagNameObj(value.tagName, ssTagNameMap);

      if (isObject(tagNameObj) && isObject(ssTagNameObj)) continue;

      if (!Array.isArray(newTagNameObjsPerId[id])) newTagNameObjsPerId[id] = [];
      newTagNameObjsPerId[id].push(value);

      if (!chkdTagNames.includes(value.tagName)) {
        newTagNameObjs.push(value);
        chkdTagNames.push(value.tagName);
      }
    }
  }

  const payload = { ids, valuesPerId, newTagNameObjsPerId, newTagNameObjs };
  dispatch({ type: UPDATE_TAG_DATA_S_STEP, payload });

  const task = updateTagDataSStepInQueue(payload, dispatch, getState);
  task[TASK_TYPE] = UPDATE_TAG_DATA_S_STEP;
  taskQueue.push(task);
};

const _getTpfValues = (id, mainId, values, solvedTags) => {
  const combinedValues = {}, aTns = [], bTns = [];
  if (isObject(solvedTags[mainId])) {
    for (const value of solvedTags[mainId].values) {
      combinedValues[value.tagName] = { ...value, diffs: [] };
      aTns.push(value.tagName);
    }
  }
  for (const value of values) {
    combinedValues[value.tagName] = { ...combinedValues[value.tagName], diffs: [] };
    bTns.push(value.tagName);
  }

  const diffs = diffLinesRaw(aTns, bTns);
  for (const diff of diffs) {
    const [diffType, tn] = [diff[0], diff[1]];
    combinedValues[tn].diffs.push(diffType);
  }
  for (const tn in combinedValues) {
    const tDiffs = combinedValues[tn].diffs;
    if (tDiffs.length === 1 && tDiffs.includes(DIFF_EQUAL)) {
      combinedValues[tn].diffType = DIFF_EQUAL;
    } else if (tDiffs.length === 1 && tDiffs.includes(DIFF_DELETE)) {
      combinedValues[tn].diffType = DIFF_DELETE;
    } else if (tDiffs.length === 1 && tDiffs.includes(DIFF_INSERT)) {
      combinedValues[tn].diffType = DIFF_INSERT;
    } else if (
      tDiffs.length === 2 &&
      tDiffs.includes(DIFF_INSERT) &&
      tDiffs.includes(DIFF_DELETE)
    ) {
      combinedValues[tn].diffType = DIFF_UPDATE;
    } else {
      console.log('Found invalid diffs for tn:', tn, tDiffs);
    }
  }

  const bRanks = [];
  for (const tn of bTns) {
    const diffType = combinedValues[tn].diffType;
    if (diffType === DIFF_EQUAL) {
      bRanks.push(combinedValues[tn].rank);
      continue;
    }
    bRanks.push(null);
  }
  for (let i = 0; i < bRanks.length; i++) {
    if (isString(bRanks[i])) continue;

    let prevRank, nextRank;
    for (let j = i - 1; j >= 0; j--) {
      if (isString(bRanks[j])) {
        prevRank = bRanks[j];
        break;
      }
    }
    for (let j = i + 1; j < bRanks.length; j++) {
      if (isString(bRanks[j])) {
        nextRank = bRanks[j];
        break;
      }
    }

    let lexoRank;
    if (isString(prevRank) && isString(nextRank)) {
      const pLexoRank = LexoRank.parse(`0|${prevRank.replace('_', ':')}`);
      const nLexoRank = LexoRank.parse(`0|${nextRank.replace('_', ':')}`);

      if (prevRank === nextRank) lexoRank = pLexoRank;
      else lexoRank = pLexoRank.between(nLexoRank);
    } else if (isString(prevRank)) {
      lexoRank = LexoRank.parse(`0|${prevRank.replace('_', ':')}`).genNext();
    } else if (isString(nextRank)) {
      lexoRank = LexoRank.parse(`0|${nextRank.replace('_', ':')}`).genPrev();
    } else {
      lexoRank = LexoRank.middle();
    }
    bRanks[i] = lexoRank.toString().slice(2).replace(':', '_');
  }
  for (let i = 0; i < bTns.length; i++) {
    combinedValues[bTns[i]].rank = bRanks[i];
  }

  let now = Date.now();

  const pfValues = [];
  for (const tagName in combinedValues) {
    const value = combinedValues[tagName];
    if (value.diffType === DIFF_EQUAL) continue;

    let _id = id;
    if (value.diffType === DIFF_DELETE) _id = `deleted${id}`;

    const addedDT = isNumber(value.addedDT) ? value.addedDT : now;
    const fpath = createTagFPath(tagName, value.rank, now, addedDT, _id);
    pfValues.push(
      { id: fpath, type: PUT_FILE, path: fpath, content: {} }
    );
    now += 1;
  }

  return { pfValues };
};

export const updateTagDataTStep = (ids, valuesPerId) => async (dispatch, getState) => {
  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const { toRootIds } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const solvedTags = getTags(tagFPaths, {}, toRootIds);

  const pfValues = [], pfValuesPerMid = {};
  for (const id of ids) {
    const [mainId, values] = [getMainId(id, toRootIds), valuesPerId[id]];
    const result = _getTpfValues(id, mainId, values, solvedTags);

    pfValues.push(...result.pfValues);
    pfValuesPerMid[mainId] = result.pfValues;
  }

  const payload = { ids, valuesPerId };
  dispatch({ type: UPDATE_TAG_DATA_T_STEP, payload });

  const results = [], nItems = 800;
  for (let i = 0; i < pfValues.length; i += nItems) {
    const selectedPfValues = pfValues.slice(i, i + nItems);
    const data = {
      values: selectedPfValues, isSequential: false, nItemsForNs: N_NOTES,
    };

    try {
      const selectedResults = await dataApi.performFiles(data);
      results.push(...selectedResults);
    } catch (error) {
      console.log('updateTagDataTStep error: ', error);
      dispatch({
        type: UPDATE_TAG_DATA_T_STEP_ROLLBACK, payload: { ...payload, error },
      });
      return;
    }
  }
  const resultsPerId = getPerformFilesResultsPerId(results);

  const successIds = [], errorIds = [], errors = [];
  for (const id of ids) {
    const mainId = getMainId(id, toRootIds);

    let error;
    for (const pfValue of pfValuesPerMid[mainId]) {
      const result = resultsPerId[pfValue.id];
      if (isObject(result) && result.success) continue;

      error = new Error('Error on previous dependent item');
      if (isObject(result)) error = new Error(result.error);
      break;
    }
    if (error) {
      errorIds.push(id);
      errors.push(error);
    } else {
      successIds.push(id);
    }
  }

  dispatch({
    type: UPDATE_TAG_DATA_T_STEP_COMMIT,
    payload: { ...payload, successIds, errorIds, errors },
  });
};

export const retryDiedTags = () => async (dispatch, getState) => {
  const pendingTags = getState().pendingTags;

  const sIds = [], sValuesPerId = {}, tIds = [], tValuesPerId = {};
  for (const id in pendingTags) {
    const { status, values } = pendingTags[id];
    if (status === UPDATE_TAG_DATA_S_STEP_ROLLBACK) {
      sIds.push(id);
      sValuesPerId[id] = values;
    } else if (status === UPDATE_TAG_DATA_T_STEP_ROLLBACK) {
      tIds.push(id);
      tValuesPerId[id] = values;
    }
  }

  if (sIds.length > 0) {
    await updateTagDataSStep(sIds, sValuesPerId)(dispatch, getState);
  }
  if (tIds.length > 0) {
    await updateTagDataTStep(tIds, tValuesPerId)(dispatch, getState);
  }
};

export const cancelDiedTags = () => async (dispatch, getState) => {
  const settings = getState().settings;
  const snapshotSettings = getState().snapshot.settings;
  const pendingSslts = getState().pendingSslts;
  const pendingTags = getState().pendingTags;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const isTamEqual = isEqual(settings.tagNameMap, snapshotSettings.tagNameMap);

  const ids = [], newTagNames = [], usedTagNames = [], unusedTagNames = [];
  for (const id in pendingTags) {
    const { status, newTagNameObjs } = pendingTags[id];

    if ([
      UPDATE_TAG_DATA_S_STEP_ROLLBACK, UPDATE_TAG_DATA_T_STEP_ROLLBACK,
    ].includes(status)) {
      ids.push(id);
    }

    if (status === UPDATE_TAG_DATA_S_STEP_ROLLBACK) {
      for (const obj of newTagNameObjs) {
        if (!newTagNames.includes(obj.tagName)) newTagNames.push(obj.tagName);
      }
      continue;
    }
    for (const obj of newTagNameObjs) {
      if (!usedTagNames.includes(obj.tagName)) usedTagNames.push(obj.tagName);
    }
  }

  if (!isTamEqual && newTagNames.length > 0) {
    for (const obj of snapshotSettings.tagNameMap) {
      if (!usedTagNames.includes(obj.tagName)) usedTagNames.push(obj.tagName);
    }

    const {
      noteMetas, conflictedMetas, toRootIds,
    } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
    const inUseTagNames = getInUseTagNames(
      noteMetas, conflictedMetas, toRootIds, tagFPaths, {}
    );
    for (const tagName of inUseTagNames) {
      if (!usedTagNames.includes(tagName)) usedTagNames.push(tagName);
    }

    for (const tagName of newTagNames) {
      if (usedTagNames.includes(tagName)) continue;
      unusedTagNames.push(tagName);
    }
  }

  dispatch({ type: CANCEL_DIED_TAGS, payload: { ids, unusedTagNames } });
};

export const cleanUpTags = () => async (dispatch, getState) => {
  const pendingSslts = getState().pendingSslts;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const {
    noteMetas, conflictedMetas, toRootIds,
  } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);
  const noteMainIds = getNoteMainIds(noteMetas, conflictedMetas, toRootIds);
  const tags = getRawTags(tagFPaths, toRootIds);

  let nNotes = N_NOTES;
  if (getState().user.hubUrl === SD_HUB_URL) nNotes = 60;

  const unusedValues = [];
  for (const fpath of tagFPaths) {
    if (unusedValues.length >= nNotes) break;

    const { id } = extractTagFPath(fpath);

    const _id = id.startsWith('deleted') ? id.slice(7) : id;
    const tagMainId = getMainId(_id, toRootIds);

    if (
      !isString(tagMainId) ||
      !noteMainIds.includes(tagMainId) ||
      !isObject(tags[tagMainId])
    ) {
      unusedValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
      continue;
    }

    const found = tags[tagMainId].values.some(value => value.fpath === fpath);
    if (!found) {
      unusedValues.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
  }

  if (unusedValues.length > 0) {
    try {
      const data = { values: unusedValues, isSequential: false, nItemsForNs: N_NOTES };
      await dataApi.performFiles(data);
    } catch (error) {
      console.log('cleanUpTags error: ', error);
      // error in this step should be fine
    }
  }

  dispatch(sync());
};

export const updateTagNameEditors = (tagNameEditors) => {
  return { type: UPDATE_TAG_NAME_EDITORS, payload: tagNameEditors };
};

export const addTagNames = (newNames, newColors) => {
  let addedDT = Date.now();

  const tagNameObjs = [];
  for (let i = 0; i < newNames.length; i++) {
    const [newName, newColor] = [newNames[i], newColors[i]];

    const tagName = `${addedDT}-${randomString(4)}`;
    const tagNameObj = { tagName, displayName: newName, color: newColor };
    tagNameObjs.push(tagNameObj);

    addedDT += 1;
  }

  return { type: ADD_TAG_NAMES, payload: tagNameObjs };
};

export const updateTagNames = (tagNames, newNames) => {
  return { type: UPDATE_TAG_NAMES, payload: { tagNames, newNames } };
};

export const moveTagName = (tagName, direction) => {
  return { type: MOVE_TAG_NAME, payload: { tagName, direction } };
};

export const updateTagNameColor = (tagName, newColor) => {

};

export const checkDeleteTagName = (tagNameEditorKey, tagNameObj) => async (
  dispatch, getState
) => {
  const pendingSslts = getState().pendingSslts;
  const pendingTags = getState().pendingTags;

  const noteFPaths = getNoteFPaths(getState());
  const ssltFPaths = getSsltFPaths(getState());
  const tagFPaths = getTagFPaths(getState());

  const {
    noteMetas, conflictedMetas, toRootIds,
  } = listNoteMetas(noteFPaths, ssltFPaths, pendingSslts);

  const inUseTagNames = getInUseTagNames(
    noteMetas, conflictedMetas, toRootIds, tagFPaths, pendingTags
  );
  if (inUseTagNames.includes(tagNameObj.tagName)) {
    dispatch(updateTagNameEditors({
      [tagNameEditorKey]: {
        msg: TAG_NAME_MSGS[IN_USE_TAG_NAME], isCheckingCanDelete: false,
      },
    }));
    return;
  }

  dispatch(updateSelectingTagName(tagNameObj.tagName));
  dispatch(updateDeleteAction(DELETE_ACTION_TAG_NAME));
  updatePopupUrlHash(CONFIRM_DELETE_POPUP, true);
  dispatch(updateTagNameEditors({
    [tagNameEditorKey]: { msg: '', isCheckingCanDelete: false },
  }));
};

export const deleteTagNames = (tagNames) => {
  return { type: DELETE_TAG_NAMES, payload: { tagNames } };
};

export const updateSelectingTagName = (tagName) => {
  return { type: UPDATE_SELECTING_TAG_NAME, payload: tagName };
};
