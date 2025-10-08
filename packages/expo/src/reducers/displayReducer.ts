import {
  UPDATE_LIST_NAME, UPDATE_QUERY_STRING, UPDATE_SEARCH_STRING, UPDATE_NOTE_ID,
  UPDATE_POPUP, FETCH_COMMIT, FETCH_ROLLBACK, UPDATE_FETCHED, FETCH_MORE_ROLLBACK,
  UPDATE_FETCHED_MORE, REFRESH_FETCHED, ADD_FETCHING_INFO, DELETE_FETCHING_INFO,
  SET_SHOWING_NOTE_INFOS, ADD_NOTE, UPDATE_NOTE, MOVE_NOTES, DELETE_NOTES_COMMIT,
  DISCARD_NOTE, MERGE_NOTES_COMMIT, CANCEL_DIED_NOTES, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING, ADD_SELECTED_NOTE_IDS,
  DELETE_SELECTED_NOTE_IDS, UPDATE_SELECTING_NOTE_ID, UPDATE_SELECTING_LIST_NAME,
  DELETE_LIST_NAMES, UPDATE_EDITOR_FOCUSED, UPDATE_EDITOR_BUSY,
  INCREASE_SAVE_NOTE_COUNT, INCREASE_SET_INIT_DATA_COUNT,
  INCREASE_RESET_DID_CLICK_COUNT, UPDATE_MOVE_ACTION, UPDATE_DELETE_ACTION,
  UPDATE_DISCARD_ACTION, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS, MERGE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_VIEW_ID, UPDATE_LIST_NAMES_MODE, UPDATE_SIDEBAR_LIST_NAMES_MODE,
  SYNC, SYNC_COMMIT, SYNC_ROLLBACK, UPDATE_SYNC_PROGRESS, UPDATE_SYNCED,
  UPDATE_PAYWALL_FEATURE, UPDATE_LOCK_ACTION, ADD_LOCK_NOTE, LOCK_NOTE, ADD_LOCK_LIST,
  LOCK_LIST, UPDATE_LOCKS_FOR_ACTIVE_APP, UPDATE_LOCKS_FOR_INACTIVE_APP,
  UPDATE_TAG_DATA_S_STEP_COMMIT, UPDATE_TAG_DATA_T_STEP_COMMIT,
  UPDATE_SELECTING_TAG_NAME, DELETE_TAG_NAMES, INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT,
  UPDATE_EXPORT_NOTE_AS_PDF_PROGRESS, UPDATE_IMPORT_ALL_DATA_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  UPDATE_DELETE_SYNC_DATA_PROGRESS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  SD_HUB_URL, SIGN_UP_POPUP, SIGN_IN_POPUP, NOTE_LIST_MENU_POPUP,
  NOTE_LIST_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, BULK_EDIT_MENU_POPUP,
  TAG_EDITOR_POPUP, PAYWALL_POPUP, SIDEBAR_POPUP, SEARCH_POPUP, SETTINGS_POPUP,
  SETTINGS_LISTS_MENU_POPUP, SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP,
  DATE_FORMAT_MENU_POPUP, LOCK_MENU_POPUP, LOCK_EDITOR_POPUP, CONFIRM_DELETE_POPUP,
  CONFIRM_DISCARD_POPUP, CONFIRM_AS_DUMMY_POPUP, CONFIRM_EXIT_DUMMY_POPUP,
  ACCESS_ERROR_POPUP, STALE_ERROR_POPUP, USE_SYNC_ERROR_POPUP, HUB_ERROR_POPUP,
  SWWU_POPUP, MY_NOTES, TRASH, ARCHIVE, UPDATING, DIED_ADDING, DIED_UPDATING,
  DIED_MOVING, MAX_SELECTED_NOTE_IDS, SD_MAX_SELECTED_NOTE_IDS, SETTINGS_VIEW_ACCOUNT,
} from '../types/const';
import {
  doContainListName, doContainTagName, isObject, isString, isNumber,
  doContainStaleNotes,
} from '../utils';
import vars from '../vars';

const initialState = {
  listName: MY_NOTES,
  queryString: '',
  searchString: '',
  noteId: null,
  isSignUpPopupShown: false,
  isSignInPopupShown: false,
  isNoteListMenuPopupShown: false,
  noteListMenuPopupPosition: null,
  isNoteListItemMenuPopupShown: false,
  noteListItemMenuPopupPosition: null,
  isListNamesPopupShown: false,
  listNamesPopupPosition: null,
  isPinMenuPopupShown: false,
  pinMenuPopupPosition: null,
  isBulkEditMenuPopupShown: false,
  bulkEditMenuPopupPosition: null,
  isTagEditorPopupShown: false,
  isPaywallPopupShown: false,
  isSidebarPopupShown: false,
  isSearchPopupShown: false,
  isSettingsPopupShown: false,
  isSettingsListsMenuPopupShown: false,
  settingsListsMenuPopupPosition: null,
  isSettingsTagsMenuPopupShown: false,
  settingsTagsMenuPopupPosition: null,
  isTimePickPopupShown: false,
  timePickPopupPosition: null,
  isDateFormatMenuPopupShown: false,
  dateFormatPopupPosition: null,
  isLockMenuPopupShown: false,
  lockMenuPopupPosition: null,
  isLockEditorPopupShown: false,
  isConfirmDeletePopupShown: false,
  isConfirmDiscardPopupShown: false,
  isConfirmAsDummyPopupShown: false,
  isConfirmExitDummyPopupShown: false,
  isAccessErrorPopupShown: false,
  isStaleErrorPopupShown: false,
  isUseSyncErrorPopupShown: false,
  isHubErrorPopupShown: false,
  isSWWUPopupShown: false, // isServiceWorkerWaitUpdatePopupShown
  isHandlingSignIn: false,
  isBulkEditing: false,
  selectedNoteIds: [],
  isSelectedNoteIdsMaxErrorShown: false,
  selectingNoteId: null,
  selectingListName: null,
  selectingTagName: null,
  didFetch: false,
  didFetchSettings: false,
  fetchingInfos: [],
  showingNoteInfos: null,
  hasMoreNotes: null,
  listChangedCount: 0,
  isEditorFocused: false,
  isEditorBusy: false,
  moveAction: null,
  deleteAction: null,
  discardAction: null,
  resetDidClickCount: 0,
  settingsStatus: null,
  settingsViewId: SETTINGS_VIEW_ACCOUNT,
  isSettingsSidebarShown: false,
  didSettingsCloseAnimEnd: true,
  didSettingsSidebarAnimEnd: true,
  updateSettingsViewIdCount: 0,
  listNamesMode: null,
  sidebarListNamesMode: null,
  syncProgress: null,
  paywallFeature: null,
  doRightPanelAnimateHidden: false,
  lockAction: null,
  doForceLock: false,
  exitColsPanelFullScreenCount: 0,
  updateStatusBarStyleCount: 0,
  exportNoteAsPdfProgress: null,
  importAllDataProgress: null,
  exportAllDataProgress: null,
  deleteAllDataProgress: null,
  deleteSyncDataProgress: null,
};

const displayReducer = (state = initialState, action) => {

  if (action.type === UPDATE_LIST_NAME) {
    if (state.listName === action.payload && state.queryString === '') return state;

    const newState = {
      ...state,
      listName: action.payload,
      queryString: '',
      noteId: null,
      isEditorFocused: false,
      isEditorBusy: false,
    };
    [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
    [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
    newState.listChangedCount += 1;
    vars.fetch.doShowLoading = true;
    return newState;
  }

  if (action.type === UPDATE_QUERY_STRING) {
    if (state.queryString === action.payload) return state;

    const newState = {
      ...state,
      queryString: action.payload,
      noteId: null,
      isEditorFocused: false,
      isEditorBusy: false,
    };
    [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
    [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
    newState.listChangedCount += 1;
    vars.fetch.doShowLoading = true;
    return newState;
  }

  if (action.type === UPDATE_SEARCH_STRING) {
    return { ...state, searchString: action.payload };
  }

  if (action.type === UPDATE_NOTE_ID) {
    const newState = { ...state, isEditorFocused: false, isEditorBusy: false };
    newState.noteId = state.noteId === action.payload ? null : action.payload;

    newState.doRightPanelAnimateHidden = vars.displayReducer.doRightPanelAnimateHidden;
    vars.displayReducer.doRightPanelAnimateHidden = false;

    return newState;
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown, anchorPosition } = action.payload;

    if (id === SIGN_UP_POPUP) {
      return { ...state, isSignUpPopupShown: isShown };
    }

    if (id === SIGN_IN_POPUP) {
      return { ...state, isSignInPopupShown: isShown };
    }

    if (id === NOTE_LIST_MENU_POPUP) {
      return {
        ...state,
        isNoteListMenuPopupShown: isShown,
        noteListMenuPopupPosition: anchorPosition,
      };
    }

    if (id === NOTE_LIST_ITEM_MENU_POPUP) {
      return {
        ...state,
        isNoteListItemMenuPopupShown: isShown,
        noteListItemMenuPopupPosition: anchorPosition,
      };
    }

    if (id === LIST_NAMES_POPUP) {
      const newState = {
        ...state,
        isListNamesPopupShown: isShown,
        listNamesPopupPosition: anchorPosition,
      };
      return newState;
    }

    if (id === PIN_MENU_POPUP) {
      const newState = {
        ...state,
        isPinMenuPopupShown: isShown,
        pinMenuPopupPosition: anchorPosition,
      };
      return newState;
    }

    if (id === BULK_EDIT_MENU_POPUP) {
      const newState = {
        ...state,
        isBulkEditMenuPopupShown: isShown,
        bulkEditMenuPopupPosition: anchorPosition,
      };
      return newState;
    }

    if (id === TAG_EDITOR_POPUP) {
      return { ...state, isTagEditorPopupShown: isShown };
    }

    if (id === PAYWALL_POPUP) {
      return { ...state, isPaywallPopupShown: isShown };
    }

    if (id === SIDEBAR_POPUP) {
      return {
        ...state, isSidebarPopupShown: isShown,
      };
    }

    if (id === SEARCH_POPUP) {
      const newState = { ...state, isSearchPopupShown: isShown };
      if (!isShown) newState.searchString = '';
      return newState;
    }

    if (id === SETTINGS_POPUP) {
      const newState = { ...state, isSettingsPopupShown: isShown };
      if (isShown) {
        newState.didSettingsCloseAnimEnd = false;
        newState.didSettingsSidebarAnimEnd = true;
      }
      return newState;
    }

    if (id === SETTINGS_LISTS_MENU_POPUP) {
      return {
        ...state,
        isSettingsListsMenuPopupShown: isShown,
        settingsListsMenuPopupPosition: anchorPosition,
      };
    }

    if (id === SETTINGS_TAGS_MENU_POPUP) {
      return {
        ...state,
        isSettingsTagsMenuPopupShown: isShown,
        settingsTagsMenuPopupPosition: anchorPosition,
      };
    }

    if (id === TIME_PICK_POPUP) {
      return {
        ...state,
        isTimePickPopupShown: isShown,
        timePickPopupPosition: anchorPosition,
      };
    }

    if (id === DATE_FORMAT_MENU_POPUP) {
      return {
        ...state,
        isDateFormatMenuPopupShown: isShown,
        dateFormatMenuPopupPosition: anchorPosition,
      };
    }

    if (id === LOCK_MENU_POPUP) {
      return {
        ...state,
        isLockMenuPopupShown: isShown,
        lockMenuPopupPosition: anchorPosition,
      };
    }

    if (id === LOCK_EDITOR_POPUP) {
      const newState = { ...state, isLockEditorPopupShown: isShown };
      return newState;
    }

    if (id === CONFIRM_DELETE_POPUP) {
      const newState = { ...state, isConfirmDeletePopupShown: isShown };
      return newState;
    }

    if (id === CONFIRM_DISCARD_POPUP) {
      const newState = { ...state, isConfirmDiscardPopupShown: isShown };
      return newState;
    }

    if (id === CONFIRM_AS_DUMMY_POPUP) {
      return { ...state, isConfirmAsDummyPopupShown: isShown };
    }

    if (id === CONFIRM_EXIT_DUMMY_POPUP) {
      return { ...state, isConfirmExitDummyPopupShown: isShown };
    }

    if (id === ACCESS_ERROR_POPUP) {
      const newState = { ...state, isAccessErrorPopupShown: isShown };
      return newState;
    }

    if (id === STALE_ERROR_POPUP) {
      const newState = { ...state, isStaleErrorPopupShown: isShown };
      return newState;
    }

    if (id === USE_SYNC_ERROR_POPUP) {
      const newState = { ...state, isUseSyncErrorPopupShown: isShown };
      return newState;
    }

    if (id === HUB_ERROR_POPUP) {
      return { ...state, isHubErrorPopupShown: isShown };
    }

    if (id === SWWU_POPUP) {
      const newState = { ...state, isSWWUPopupShown: isShown };
      return newState;
    }

    return state;
  }

  if (action.type === FETCH_COMMIT) {
    const newState = { ...state, isAccessErrorPopupShown: false, didFetch: true };

    // Make sure listName is in listNameMap, if not, set to My Notes.
    const { listNames, tagNames, doFetchStgsAndInfo, settings } = action.payload;
    if (!doFetchStgsAndInfo) return newState;

    newState.didFetchSettings = true;

    let doCtLn = false;
    if (listNames.includes(newState.listName)) doCtLn = true;
    if (settings) {
      if (doContainListName(newState.listName, settings.listNameMap)) doCtLn = true;
    } else {
      if ([MY_NOTES, TRASH, ARCHIVE].includes(newState.listName)) doCtLn = true;
    }
    if (!doCtLn) newState.listName = MY_NOTES;

    let doCtQt = false;
    const tagName = newState.queryString.trim(); // Only tag name for now
    if (tagNames.includes(tagName)) doCtQt = true;
    if (settings) {
      if (doContainTagName(tagName, settings.tagNameMap)) doCtQt = true;
    }
    if (!doCtQt) newState.queryString = '';

    return newState;
  }

  if (action.type === FETCH_ROLLBACK) {
    const { fthId, error, signInDT } = action.payload;

    const newState = { ...state };
    newState.fetchingInfos = state.fetchingInfos.filter(info => info.fthId !== fthId);
    if (
      (
        isObject(error) &&
        isString(error.message) &&
        (
          error.message.includes('401') ||
          error.message.includes('GaiaError error 7')
        )
      ) ||
      (
        isObject(error) &&
        isObject(error.hubError) &&
        error.hubError.statusCode === 401
      )
    ) {
      if (
        !isNumber(signInDT) ||
        (Date.now() - signInDT > 360 * 24 * 60 * 60 * 1000)
      ) {
        // Bug alert: Exceed usage rate limit also error 401.
        // If signed in less than 360 days, less likely the token expires,
        //   more about rate limit error.
        newState.isAccessErrorPopupShown = true;
      }
    }
    if (
      isObject(error) &&
      isString(error.message) &&
      error.message.includes('Sync mode cannnot be used')
    ) {
      newState.isUseSyncErrorPopupShown = true;
    }
    return newState;
  }

  if (
    action.type === UPDATE_FETCHED ||
    action.type === UPDATE_FETCHED_MORE ||
    action.type === SET_SHOWING_NOTE_INFOS
  ) {
    const newState = { ...state };

    if ('notes' in action.payload) {
      const { notes } = action.payload;
      if (doContainStaleNotes(notes)) newState.isStaleErrorPopupShown = true;
    }
    if ('infos' in action.payload) {
      const { infos } = action.payload;
      if (Array.isArray(infos)) {
        newState.showingNoteInfos = infos.map(info => ({ ...info }));
      } else {
        newState.showingNoteInfos = infos;
      }
    }
    if ('hasMore' in action.payload) {
      newState.hasMoreNotes = action.payload.hasMore;
    }
    if ('doChangeListCount' in action.payload) {
      if (action.payload.doChangeListCount) newState.listChangedCount += 1;
    }
    if ('doClearSelectedNoteIds' in action.payload) {
      if (action.payload.doClearSelectedNoteIds) {
        newState.selectedNoteIds = [];
        newState.isSelectedNoteIdsMaxErrorShown = false;
      }
    }
    return newState;
  }

  if (action.type === FETCH_MORE_ROLLBACK) {
    const { fthId } = action.payload;

    const newState = { ...state };
    newState.fetchingInfos = state.fetchingInfos.filter(info => info.fthId !== fthId);
    return newState;
  }

  if (action.type === REFRESH_FETCHED) {
    const newState = { ...state, isStaleErrorPopupShown: false };
    if (Array.isArray(newState.showingNoteInfos)) {
      newState.noteId = null;
      [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
      [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
      [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
      vars.fetch.doShowLoading = true;
    }
    newState.listChangedCount += 1;
    if (newState.didFetchSettings) {
      newState.didFetchSettings = false;
      newState.fetchingInfos = newState.fetchingInfos.map(info => {
        return { ...info, isInterrupted: true };
      });

      [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedNoteIds] = [[], []];
      vars.fetch.doForce = true;
    }

    return newState;
  }

  if (action.type === ADD_FETCHING_INFO) {
    return { ...state, fetchingInfos: [...state.fetchingInfos, { ...action.payload }] };
  }

  if (action.type === DELETE_FETCHING_INFO) {
    return {
      ...state,
      fetchingInfos: state.fetchingInfos.filter(info => info.fthId !== action.payload),
    };
  }

  if (action.type === ADD_NOTE) {
    const { note, insertIndex } = action.payload;

    const newState = { ...state, noteId: null, isEditorBusy: false };
    if (!isObject(note)) return newState;
    if (!Array.isArray(newState.showingNoteInfos)) return newState;

    if (newState.listName !== TRASH && newState.queryString === '') {
      newState.noteId = note.id;
    }
    if (
      !isNumber(insertIndex) ||
      newState.showingNoteInfos.some(info => info.id === note.id)
    ) {
      return newState;
    }

    newState.showingNoteInfos = [
      ...newState.showingNoteInfos.slice(0, insertIndex),
      { id: note.id },
      ...newState.showingNoteInfos.slice(insertIndex),
    ];
    return newState;
  }

  if (action.type === UPDATE_NOTE) {
    const { fromNote, toNote } = action.payload;

    const newState = { ...state, noteId: null, isEditorBusy: false };
    if (!isObject(fromNote) || !isObject(toNote)) return newState;
    if (!Array.isArray(newState.showingNoteInfos)) return newState;

    newState.noteId = toNote.id;

    newState.showingNoteInfos = [];
    for (const info of state.showingNoteInfos) {
      if (info.id === fromNote.id) {
        newState.showingNoteInfos.push({ ...info, id: toNote.id });
        continue;
      }
      newState.showingNoteInfos.push(info);
    }

    return newState;
  }

  if (action.type === MOVE_NOTES) {
    // Need to remove from showingNoteInfos immediately as new moving uses the same id.
    const { fromNotes, didRetry } = action.payload;
    if (didRetry) return state;

    const fromIds = fromNotes.map(note => note.id);
    return {
      ...state,
      showingNoteInfos: _filterIfNotNull(state.showingNoteInfos, fromIds),
    };
  }

  if (action.type === DELETE_NOTES_COMMIT) {
    const { successNotes } = action.payload;

    const fromIds = successNotes.map(note => note.fromNote.id);
    return {
      ...state,
      showingNoteInfos: _filterIfNotNull(state.showingNoteInfos, fromIds),
    };
  }

  if (action.type === MERGE_NOTES_COMMIT) {
    const { conflictedNote, toListName, toNote } = action.payload;

    // Need to set NoteId here for consistency with notesReducer
    const newState = {
      ...state, noteId: state.listName === toListName ? toNote.id : null,
    };

    newState.showingNoteInfos = [];
    for (const info of state.showingNoteInfos) {
      if (info.id === conflictedNote.id) {
        if (newState.listName !== toListName) continue;
        newState.showingNoteInfos.push({ ...info, id: toNote.id, isConflicted: false });
        continue;
      }
      newState.showingNoteInfos.push(info);
    }

    return newState;
  }

  if (action.type === DISCARD_NOTE) {
    return { ...state, isEditorFocused: false };
  }

  if (action.type === CANCEL_DIED_NOTES) {
    const { ids, statuses, fromIds } = action.payload;

    // Need to reset NoteId here for consistency with notesReducer
    const newState = { ...state, noteId: null };
    if (!Array.isArray(newState.showingNoteInfos)) return newState;

    newState.showingNoteInfos = [];
    for (const info of state.showingNoteInfos) {
      const i = ids.findIndex(id => id === info.id);
      if (i < 0) {
        newState.showingNoteInfos.push(info);
        continue;
      }

      const [status, fromId] = [statuses[i], fromIds[i]];
      if ([DIED_ADDING, DIED_MOVING].includes(status)) continue;
      if ([DIED_UPDATING].includes(status)) {
        newState.showingNoteInfos.push({ ...info, id: fromId });
        continue;
      }

      newState.showingNoteInfos.push(info);
    }

    return newState;
  }

  if (action.type === DELETE_OLD_NOTES_IN_TRASH_COMMIT) {
    const { successNotes } = action.payload;

    const fromIds = successNotes.map(note => note.fromNote.id);

    const newState = { ...state };
    if (fromIds.includes(state.noteId)) {
      newState.noteId = null;
      [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
    }
    newState.showingNoteInfos = _filterIfNotNull(state.showingNoteInfos, fromIds);
    return newState;
  }

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
  }

  if (action.type === UPDATE_BULK_EDITING) {
    const newState = {
      ...state,
      isBulkEditing: action.payload,
      noteId: null,
      isEditorFocused: false,
      isEditorBusy: false,
    };
    if (!action.payload) {
      newState.selectedNoteIds = [];
      newState.isSelectedNoteIdsMaxErrorShown = false;
    }
    return newState;
  }

  if (action.type === ADD_SELECTED_NOTE_IDS) {
    const selectedNoteIds = [...state.selectedNoteIds];
    for (const noteId of action.payload) {
      if (!selectedNoteIds.includes(noteId)) selectedNoteIds.push(noteId);
    }
    if (selectedNoteIds.length > getMaxSelectedNoteIds()) {
      return { ...state, isSelectedNoteIdsMaxErrorShown: true };
    }
    return { ...state, selectedNoteIds };
  }

  if (action.type === DELETE_SELECTED_NOTE_IDS) {
    const selectedNoteIds = [];
    for (const noteId of state.selectedNoteIds) {
      if (!action.payload.includes(noteId)) selectedNoteIds.push(noteId);
    }
    const isShown = selectedNoteIds.length > getMaxSelectedNoteIds();
    return { ...state, selectedNoteIds, isSelectedNoteIdsMaxErrorShown: isShown };
  }

  if (action.type === UPDATE_SELECTING_NOTE_ID) {
    return { ...state, selectingNoteId: action.payload };
  }

  if (action.type === UPDATE_SELECTING_LIST_NAME) {
    return { ...state, selectingListName: action.payload };
  }

  if (action.type === DELETE_LIST_NAMES) {
    const { listNames } = action.payload;
    if (!listNames.includes(state.listName)) return state;
    return { ...state, listName: MY_NOTES };
  }

  if (action.type === UPDATE_EDITOR_FOCUSED) {
    return { ...state, isEditorFocused: action.payload };
  }

  if (action.type === UPDATE_EDITOR_BUSY) {
    return { ...state, isEditorBusy: action.payload };
  }

  if (action.type === INCREASE_SAVE_NOTE_COUNT) {
    return { ...state, isEditorFocused: false, isEditorBusy: true };
  }

  if (action.type === INCREASE_SET_INIT_DATA_COUNT) {
    return { ...state, isEditorFocused: false };
  }

  if (action.type === UPDATE_MOVE_ACTION) {
    return { ...state, moveAction: action.payload };
  }

  if (action.type === UPDATE_DELETE_ACTION) {
    return { ...state, deleteAction: action.payload };
  }

  if (action.type === UPDATE_DISCARD_ACTION) {
    return { ...state, discardAction: action.payload };
  }

  if (action.type === INCREASE_RESET_DID_CLICK_COUNT) {
    return { ...state, resetDidClickCount: state.resetDidClickCount + 1 };
  }

  if (action.type === UPDATE_SETTINGS) {
    const { doFetch } = action.payload;

    const newState = { ...state, settingsStatus: UPDATING };
    if (doFetch) {
      newState.noteId = null;
      [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
    }
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { doFetch } = action.payload;

    const newState = { ...state, settingsStatus: null };
    if (doFetch && Array.isArray(newState.showingNoteInfos)) {
      newState.noteId = null;
      [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
      [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
      [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
      newState.listChangedCount += 1;
      [vars.fetch.fetchedLnOrQts, vars.fetch.doShowLoading] = [[], true];
    }
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    return { ...state, settingsStatus: DIED_UPDATING };
  }

  if (action.type === CANCEL_DIED_SETTINGS || action.type === MERGE_SETTINGS_COMMIT) {
    const { settings, doFetch } = action.payload;

    let doCtLn = false;
    if (doContainListName(state.listName, settings.listNameMap)) doCtLn = true;

    let doCtQt = false;
    const tagName = state.queryString.trim(); // Only tag name for now
    if (doContainTagName(tagName, settings.tagNameMap)) doCtQt = true;

    const newState = {
      ...state,
      listName: doCtLn ? state.listName : MY_NOTES,
      queryString: doCtQt ? state.queryString : '',
      settingsStatus: null,
    };
    if (doFetch && Array.isArray(newState.showingNoteInfos)) {
      newState.noteId = null;
      [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
      [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
      [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
      newState.listChangedCount += 1;
      [vars.fetch.fetchedLnOrQts, vars.fetch.doShowLoading] = [[], true];
    }
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_VIEW_ID) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_LIST_NAMES_MODE) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_SIDEBAR_LIST_NAMES_MODE) {
    return { ...state, ...action.payload };
  }

  if (action.type === SYNC) {
    return { ...state, syncProgress: { status: SYNC } };
  }

  if (action.type === SYNC_COMMIT) {
    return { ...state, isAccessErrorPopupShown: false, syncProgress: null };
  }

  if (action.type === SYNC_ROLLBACK) {
    const { error, signInDT } = action.payload;

    const newState = { ...state, syncProgress: { status: SYNC_ROLLBACK } };
    if (
      (
        isObject(error) &&
        isString(error.message) &&
        (
          error.message.includes('401') ||
          error.message.includes('GaiaError error 7')
        )
      ) ||
      (
        isObject(error) &&
        isObject(error.hubError) &&
        error.hubError.statusCode === 401
      )
    ) {
      if (
        !isNumber(signInDT) ||
        (Date.now() - signInDT > 360 * 24 * 60 * 60 * 1000)
      ) {
        newState.isAccessErrorPopupShown = true;
      }
    }
    return newState;
  }

  if (action.type === UPDATE_SYNC_PROGRESS) {
    return { ...state, syncProgress: action.payload };
  }

  if (action.type === UPDATE_SYNCED) {
    const newState = { ...state, syncProgress: null };

    newState.noteId = null;
    [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
    [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
    newState.didFetchSettings = false;
    [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
    newState.listChangedCount += 1;
    [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedNoteIds] = [[], []];
    [vars.fetch.doShowLoading, vars.fetch.doForce] = [true, true];

    return newState;
  }

  if (action.type === UPDATE_PAYWALL_FEATURE) {
    return { ...state, paywallFeature: action.payload };
  }

  if (action.type === UPDATE_LOCK_ACTION) {
    return { ...state, lockAction: action.payload };
  }

  if ([ADD_LOCK_NOTE, LOCK_NOTE].includes(action.type)) {
    const { noteId } = action.payload;
    if (state.noteId === noteId) {
      return { ...state, noteId: null, isEditorFocused: false, isEditorBusy: false };
    }
    return state;
  }

  if ([ADD_LOCK_LIST, LOCK_LIST].includes(action.type)) {
    return { ...state, noteId: null, isEditorFocused: false, isEditorBusy: false };
  }

  if (action.type === UPDATE_LOCKS_FOR_ACTIVE_APP) {
    const { isLong, doNoChangeMyNotes } = action.payload;
    const { queryString, doForceLock } = state;

    const newState = { ...state, doForceLock: false };
    if (isLong) {
      newState.noteId = null;
      [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
      [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
      newState.exitColsPanelFullScreenCount = newState.exitColsPanelFullScreenCount + 1;
    }
    if (
      (!queryString && isLong && doNoChangeMyNotes && !doForceLock) ||
      (!queryString && isLong && doNoChangeMyNotes && doForceLock) ||
      (queryString && isLong && !doNoChangeMyNotes && doForceLock) ||
      (queryString && isLong && doNoChangeMyNotes && !doForceLock) ||
      (queryString && isLong && doNoChangeMyNotes && doForceLock)
    ) {
      newState.listName = MY_NOTES;
      newState.queryString = '';
      newState.searchString = '';
      newState.isBulkEditing = false;
      newState.listChangedCount = newState.listChangedCount + 1;
      //newState.isTagEditorPopupShown = false;
    }
    return newState;
  }

  if (action.type === UPDATE_LOCKS_FOR_INACTIVE_APP) {
    return {
      ...state,
      doForceLock: true,
      isNoteListItemMenuPopupShown: false,
      noteListItemMenuPopupPosition: null,
      isListNamesPopupShown: false,
      listNamesPopupPosition: null,
      isPinMenuPopupShown: false,
      pinMenuPopupPosition: null,
      isBulkEditMenuPopupShown: false,
      bulkEditMenuPopupPosition: null,
      isTagEditorPopupShown: false,
      isLockMenuPopupShown: false,
      lockMenuPopupPosition: null,
      isLockEditorPopupShown: false,
      isConfirmDeletePopupShown: false,
      isConfirmDiscardPopupShown: false,
    };
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_COMMIT) {
    const { doFetch } = action.payload;
    if (!doFetch || !Array.isArray(state.showingNoteInfos)) return state;

    const newState = { ...state };
    newState.noteId = null;
    [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
    [newState.selectedNoteIds, newState.isSelectedNoteIdsMaxErrorShown] = [[], false];
    [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
    newState.listChangedCount += 1;
    [vars.fetch.fetchedLnOrQts, vars.fetch.doShowLoading] = [[], true];
    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP_COMMIT) {
    const { successIds, valuesPerId } = action.payload;

    if (state.queryString) {
      // Only tag name for now
      const tagName = state.queryString.trim();

      const newState = { ...state };
      for (const id of successIds) {
        const values = valuesPerId[id];
        const found = values.some(value => value.tagName === tagName);
        if (!found) {
          newState.showingNoteInfos = _filterIfNotNull(newState.showingNoteInfos, [id]);
        }
      }
      return newState;
    }

    return state;
  }

  if (action.type === UPDATE_SELECTING_TAG_NAME) {
    return { ...state, selectingTagName: action.payload };
  }

  if (action.type === DELETE_TAG_NAMES) {
    const { tagNames } = action.payload;
    // Only tag name for now
    if (!tagNames.includes(state.queryString)) return state;
    return { ...state, queryString: '' };
  }

  if (action.type === INCREASE_UPDATE_STATUS_BAR_STYLE_COUNT) {
    return {
      ...state,
      updateStatusBarStyleCount: state.updateStatusBarStyleCount + 1,
    };
  }

  if (action.type === UPDATE_EXPORT_NOTE_AS_PDF_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, exportNoteAsPdfProgress: progress };
  }

  if (action.type === UPDATE_IMPORT_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    const newState = { ...state, importAllDataProgress: progress };
    if (isObject(progress) && progress.total && progress.done) {
      if (progress.total === progress.done) {
        newState.noteId = null;
        [newState.isEditorFocused, newState.isEditorBusy] = [false, false];
        newState.selectedNoteIds = [];
        newState.isSelectedNoteIdsMaxErrorShown = false;
        newState.didFetchSettings = false;
        [newState.showingNoteInfos, newState.hasMoreNotes] = [null, null];
        newState.listChangedCount += 1;
        [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedNoteIds] = [[], []];
        [vars.fetch.doShowLoading, vars.fetch.doForce] = [true, true];
      }
    }
    return newState;
  }

  if (action.type === UPDATE_EXPORT_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, exportAllDataProgress: progress };
  }

  if (action.type === UPDATE_DELETE_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, deleteAllDataProgress: progress };
  }

  if (action.type === UPDATE_DELETE_SYNC_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, deleteSyncDataProgress: progress };
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = {
      ...initialState,
      didFetch: true, didFetchSettings: true, showingNoteInfos: [], hasMoreNotes: false,
    };
    [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedNoteIds] = [[MY_NOTES], []];
    return newState;
  }

  if (action.type === RESET_STATE) {
    [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedNoteIds] = [[], []];
    return { ...initialState };
  }

  return state;
};

const _filterIfNotNull = (arr, excludingIds) => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(el => !excludingIds.includes(el.id));
};

const getMaxSelectedNoteIds = () => {
  if (vars.user.hubUrl === SD_HUB_URL) return SD_MAX_SELECTED_NOTE_IDS;
  return MAX_SELECTED_NOTE_IDS;
};

export default displayReducer;
