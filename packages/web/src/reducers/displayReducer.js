import {
  UPDATE_HANDLING_SIGN_IN, UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP,
  UPDATE_SEARCH_STRING, UPDATE_BULK_EDITING,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, CLEAR_SELECTED_NOTE_IDS,
  FETCH_COMMIT, DELETE_LIST_NAMES, UPDATE_DELETING_LIST_NAME,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
  UPDATE_UPDATE_SETTINGS_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  PROFILE_POPUP, NOTE_LIST_MENU_POPUP, MOVE_TO_POPUP, SIDEBAR_POPUP, SEARCH_POPUP,
  CONFIRM_DELETE_POPUP, SETTINGS_POPUP, MY_NOTES, TRASH, ARCHIVE,
  UPDATING, DIED_UPDATING,
} from '../types/const';

const initialState = {
  isHandlingSignIn: false,
  listName: MY_NOTES,
  noteId: null,
  isProfilePopupShown: false,
  profilePopupPosition: null,
  isNoteListMenuPopupShown: false,
  noteListMenuPopupPosition: null,
  isMoveToPopupShown: false,
  moveToPopupPosition: null,
  isSidebarPopupShown: false,
  isSearchPopupShown: false,
  isConfirmDeletePopupShown: false,
  isSettingsPopupShown: false,
  isEditorFocused: false,
  searchString: '',
  isBulkEditing: false,
  selectedNoteIds: [],
  deletingListName: null,
  listChangedCount: 0,
  exportAllDataProgress: null,
  deleteAllDataProgress: null,
  updateSettingsProgress: null,
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
    };
  }

  if (action.type === UPDATE_NOTE_ID) {
    if (state.noteId === action.payload) return { ...state, noteId: null };
    return { ...state, noteId: action.payload };
  }

  if (action.type === UPDATE_POPUP) {

    const { id, isShown, anchorPosition } = action.payload;

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

    if (action.payload.id === MOVE_TO_POPUP) {
      return {
        ...state,
        isMoveToPopupShown: isShown,
        moveToPopupPosition: anchorPosition,
      }
    }

    if (id === SIDEBAR_POPUP) {
      return {
        ...state, isSidebarPopupShown: isShown,
      };
    }

    if (action.payload.id === SEARCH_POPUP) {
      return { ...state, isSearchPopupShown: isShown }
    }

    if (action.payload.id === CONFIRM_DELETE_POPUP) {
      return { ...state, isConfirmDeletePopupShown: isShown }
    }

    if (id === SETTINGS_POPUP) {
      return {
        ...state, isSettingsPopupShown: isShown,
      };
    }

    throw new Error(`Invalid type: ${action.type} and payload: ${action.payload}`);
  }

  if (action.type === UPDATE_SEARCH_STRING) {
    return { ...state, searchString: action.payload };
  }

  if (action.type === UPDATE_BULK_EDITING) {
    return { ...state, isBulkEditing: action.payload };
  }

  if (action.type === ADD_SELECTED_NOTE_IDS) {
    const selectedNoteIds = [...state.selectedNoteIds];
    for (const noteId of action.payload) {
      if (!selectedNoteIds.includes(noteId)) selectedNoteIds.push(noteId);
    }
    return { ...state, selectedNoteIds };
  }

  if (action.type === DELETE_SELECTED_NOTE_IDS) {
    const selectedNoteIds = [];
    for (const noteId of state.selectedNoteIds) {
      if (!action.payload.includes(noteId)) selectedNoteIds.push(noteId);
    }
    return { ...state, selectedNoteIds };
  }

  if (action.type === CLEAR_SELECTED_NOTE_IDS) {
    return { ...state, selectedNoteIds: [] };
  }

  if (action.type === FETCH_COMMIT) {

    const newState = { ...state };

    // Make sure listName is in listNameMap, if not, set to My List.
    const { doFetchSettings, settings } = action.payload;
    if (!doFetchSettings) return newState;

    if (settings) {
      if (!settings.listNameMap.map(obj => obj.listName).includes(newState.listName)) {
        newState.listName = MY_NOTES;
      }
    } else {
      if (![MY_NOTES, TRASH, ARCHIVE].includes(newState.listName)) {
        newState.listName = MY_NOTES;
      }
    }

    return newState;
  }

  if (action.type === DELETE_LIST_NAMES) {
    const { listNames } = action.payload;
    if (listNames.includes(state.listName)) {
      return { ...state, listName: MY_NOTES };
    }
  }

  if (action.type === UPDATE_DELETING_LIST_NAME) {
    return { ...state, deletingListName: action.payload };
  }

  if (action.type === UPDATE_EXPORT_ALL_DATA_PROGRESS) {
    return { ...state, exportAllDataProgress: action.payload };
  }

  if (action.type === UPDATE_DELETE_ALL_DATA_PROGRESS) {
    return { ...state, deleteAllDataProgress: action.payload };
  }

  if (action.type === UPDATE_SETTINGS) {
    return { ...state, updateSettingsProgress: { status: UPDATING } };
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    return { ...state, updateSettingsProgress: null };
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    return { ...state, updateSettingsProgress: { status: DIED_UPDATING } };
  }

  if (action.type === UPDATE_UPDATE_SETTINGS_PROGRESS) {
    return { ...state, updateSettingsProgress: action.payload };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default displayReducer;
