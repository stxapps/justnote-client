import {
  UPDATE_HANDLING_SIGN_IN, UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP,
  UPDATE_SEARCH_STRING, UPDATE_BULK_EDITING, ADD_SELECTED_NOTE_IDS,
  DELETE_SELECTED_NOTE_IDS, UPDATE_SELECTING_NOTE_ID, UPDATE_SELECTING_LIST_NAME,
  UPDATE_DELETING_LIST_NAME, FETCH_COMMIT, ADD_NOTE, UPDATE_NOTE, MERGE_NOTES_COMMIT,
  CANCEL_DIED_NOTES, DELETE_OLD_NOTES_IN_TRASH_COMMIT, DELETE_LIST_NAMES,
  UPDATE_EDITOR_FOCUSED, UPDATE_EDITOR_BUSY, INCREASE_SAVE_NOTE_COUNT,
  INCREASE_RESET_DID_CLICK_COUNT, UPDATE_MOVE_ACTION, UPDATE_DELETE_ACTION,
  UPDATE_DISCARD_ACTION, UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT,
  UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS, UPDATE_SETTINGS_VIEW_ID,
  UPDATE_LIST_NAMES_MODE, SYNC, SYNC_COMMIT, SYNC_ROLLBACK, UPDATE_SYNC_PROGRESS,
  UPDATE_SYNCED, UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  SIGN_UP_POPUP, SIGN_IN_POPUP, PROFILE_POPUP, NOTE_LIST_MENU_POPUP,
  NOTE_LIST_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, PAYWALL_POPUP,
  SIDEBAR_POPUP, SEARCH_POPUP, SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP,
  CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP, CONFIRM_AS_DUMMY_POPUP,
  CONFIRM_EXIT_DUMMY_POPUP, NEW_NOTE, MY_NOTES, TRASH, ARCHIVE,
  UPDATING, DIED_UPDATING, MAX_SELECTED_NOTE_IDS, SETTINGS_VIEW_ACCOUNT,
  DELETE_ACTION_LIST_NAME,
} from '../types/const';
import { doContainListName } from '../utils';

const initialState = {
  isHandlingSignIn: false,
  listName: MY_NOTES,
  noteId: null,
  isSignUpPopupShown: false,
  isSignInPopupShown: false,
  isProfilePopupShown: false,
  profilePopupPosition: null,
  isNoteListMenuPopupShown: false,
  noteListMenuPopupPosition: null,
  isNoteListItemMenuPopupShown: false,
  noteListItemMenuPopupPosition: null,
  isListNamesPopupShown: false,
  listNamesPopupPosition: null,
  isPinMenuPopupShown: false,
  pinMenuPopupPosition: null,
  isPaywallPopupShown: false,
  isSidebarPopupShown: false,
  isSearchPopupShown: false,
  isSettingsPopupShown: false,
  isSettingsListsMenuPopupShown: false,
  settingsListsMenuPopupPosition: null,
  isConfirmDeletePopupShown: false,
  isConfirmDiscardPopupShown: false,
  isConfirmAsDummyPopupShown: false,
  isConfirmExitDummyPopupShown: false,
  searchString: '',
  isBulkEditing: false,
  selectedNoteIds: [],
  isSelectedNoteIdsMaxErrorShown: false,
  selectingNoteId: null,
  selectingListName: null,
  deletingListName: null,
  didFetch: false,
  didFetchSettings: false,
  fetchedListNames: [],
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
  listNamesMode: null,
  syncProgress: null,
  importAllDataProgress: null,
  exportAllDataProgress: null,
  deleteAllDataProgress: null,
};

const displayReducer = (state = initialState, action) => {

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
  }

  if (action.type === UPDATE_LIST_NAME) {
    return {
      ...state,
      listName: action.payload,
      listChangedCount: state.listChangedCount + 1,
      noteId: null,
      isEditorFocused: false,
      isEditorBusy: false,
      selectedNoteIds: [],
      isSelectedNoteIdsMaxErrorShown: false,
    };
  }

  if (action.type === UPDATE_NOTE_ID) {
    const newState = { ...state, isEditorFocused: false, isEditorBusy: false };
    newState.noteId = state.noteId === action.payload ? null : action.payload;
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

    if (id === PROFILE_POPUP) {
      return {
        ...state, isProfilePopupShown: isShown, profilePopupPosition: anchorPosition,
      };
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

    throw new Error(`Invalid type: ${action.type} and payload: ${action.payload}`);
  }

  if (action.type === UPDATE_SEARCH_STRING) {
    return { ...state, searchString: action.payload };
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
    if (selectedNoteIds.length > MAX_SELECTED_NOTE_IDS) {
      return { ...state, isSelectedNoteIdsMaxErrorShown: true };
    }
    return { ...state, selectedNoteIds };
  }

  if (action.type === DELETE_SELECTED_NOTE_IDS) {
    const selectedNoteIds = [];
    for (const noteId of state.selectedNoteIds) {
      if (!action.payload.includes(noteId)) selectedNoteIds.push(noteId);
    }
    const isShown = selectedNoteIds.length > MAX_SELECTED_NOTE_IDS;
    return { ...state, selectedNoteIds, isSelectedNoteIdsMaxErrorShown: isShown };
  }

  if (action.type === UPDATE_SELECTING_NOTE_ID) {
    return { ...state, selectingNoteId: action.payload };
  }

  if (action.type === UPDATE_SELECTING_LIST_NAME) {
    return { ...state, selectingListName: action.payload };
  }

  if (action.type === UPDATE_DELETING_LIST_NAME) {
    return {
      ...state, deletingListName: action.payload, deleteAction: DELETE_ACTION_LIST_NAME,
    };
  }

  if (action.type === FETCH_COMMIT) {
    const { listName } = action.payload;
    const newState = {
      ...state,
      noteId: state.noteId === NEW_NOTE ? NEW_NOTE : null,
      isEditorFocused: state.noteId === NEW_NOTE ? true : false,
      isEditorBusy: false,
      selectedNoteIds: [],
      isSelectedNoteIdsMaxErrorShown: false,
      didFetch: true,
      didFetchSettings: true,
      fetchedListNames: [...state.fetchedListNames, listName],
    };

    // Make sure listName is in listNameMap, if not, set to My Notes.
    const { listNames, doFetchSettings, settings } = action.payload;
    if (!doFetchSettings) return newState;

    newState.settingsStatus = null;

    if (listNames.includes(newState.listName)) return newState;
    if (settings) {
      if (!doContainListName(newState.listName, settings.listNameMap)) {
        newState.listName = MY_NOTES;
      }
    } else {
      if (![MY_NOTES, TRASH, ARCHIVE].includes(newState.listName)) {
        newState.listName = MY_NOTES;
      }
    }

    return newState;
  }

  if (action.type === ADD_NOTE) {
    const { note } = action.payload;
    return { ...state, noteId: note.id, isEditorBusy: false };
  }

  if (action.type === UPDATE_NOTE) {
    const { toNote } = action.payload;
    return { ...state, noteId: toNote.id, isEditorBusy: false };
  }

  if (action.type === MERGE_NOTES_COMMIT) {
    const { toListName, toNote } = action.payload;
    // Need to set NoteId here for consistency with notesReducer
    return { ...state, noteId: state.listName === toListName ? toNote.id : null };
  }

  if (action.type === CANCEL_DIED_NOTES) {
    // Need to reset NoteId here for consistency with notesReducer
    return { ...state, noteId: null };
  }

  if (action.type === DELETE_OLD_NOTES_IN_TRASH_COMMIT) {
    const { ids } = action.payload;
    if (ids.includes(state.noteId)) return { ...state, noteId: null };
    return state;
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
    const { settings, doFetch } = action.payload;
    const doContain = doContainListName(state.listName, settings.listNameMap);

    const newState = {
      ...state,
      listName: doContain ? state.listName : MY_NOTES,
      settingsStatus: UPDATING,
    };
    if (doFetch) newState.noteId = null;
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { doFetch } = action.payload;

    const newState = { ...state, settingsStatus: null };
    if (doFetch) {
      newState.fetchedListNames = [];
      newState.noteId = null;
    }
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    return { ...state, settingsStatus: DIED_UPDATING };
  }

  if (action.type === CANCEL_DIED_SETTINGS) {
    const { settings } = action.payload;
    const doContain = doContainListName(state.listName, settings.listNameMap);

    return {
      ...state,
      listName: doContain ? state.listName : MY_NOTES,
      settingsStatus: null,
    };
  }

  if (action.type === UPDATE_SETTINGS_VIEW_ID) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_LIST_NAMES_MODE) {
    return { ...state, ...action.payload };
  }

  if (action.type === SYNC) {
    return { ...state, syncProgress: { status: SYNC } };
  }

  if (action.type === SYNC_COMMIT) {
    if (action.payload.haveNewSync) return state;
    return { ...state, syncProgress: null };
  }

  if (action.type === SYNC_ROLLBACK) {
    return { ...state, syncProgress: { status: SYNC_ROLLBACK } };
  }

  if (action.type === UPDATE_SYNC_PROGRESS) {
    return { ...state, syncProgress: action.payload };
  }

  if (action.type === UPDATE_SYNCED) {
    return {
      ...state, syncProgress: null, didFetchSettings: false, fetchedListNames: [],
    };
  }

  if (action.type === UPDATE_IMPORT_ALL_DATA_PROGRESS) {
    const newState = { ...state, importAllDataProgress: action.payload };
    if (action.payload && action.payload.total && action.payload.done) {
      if (action.payload.total === action.payload.done) {
        newState.didFetchSettings = false;
        newState.fetchedListNames = [];
        newState.noteId = null;
      }
    }
    return newState;
  }

  if (action.type === UPDATE_EXPORT_ALL_DATA_PROGRESS) {
    return { ...state, exportAllDataProgress: action.payload };
  }

  if (action.type === UPDATE_DELETE_ALL_DATA_PROGRESS) {
    return { ...state, deleteAllDataProgress: action.payload };
  }

  if (action.type === DELETE_ALL_DATA) {
    return {
      ...initialState,
      didFetch: true, didFetchSettings: true, fetchedListNames: [MY_NOTES],
    };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default displayReducer;
