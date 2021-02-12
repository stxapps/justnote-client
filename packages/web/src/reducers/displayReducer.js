import { UPDATE_HANDLING_SIGN_IN, RESET_STATE } from '../types/actionTypes';

import {
  UPDATE_POPUP,
  UPDATE_BULK_EDITING,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, CLEAR_SELECTED_NOTE_IDS,
} from '../types/actionTypes';
import {
  PROFILE_POPUP, NOTE_LIST_MENU_POPUP, BULK_EDIT_MOVE_TO_POPUP,
  MY_NOTES,
} from '../types/const';

const initialState = {
  isHandlingSignIn: false,
  listName: MY_NOTES,
  noteId: null,
  isProfilePopupShown: false,
  profilePopupPosition: null,
  isNoteListMenuPopupShown: false,
  noteListMenuPopupPosition: null,
  isEditorFocused: false,
  searchString: '',
  isBulkEditing: false,
  selectedNoteIds: [],
  isBulkEditMoveToPopupShown: false,
};

const displayReducer = (state = initialState, action) => {

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
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

    if (action.payload.id === BULK_EDIT_MOVE_TO_POPUP) {
      return { ...state, isBulkEditMoveToPopupShown: action.payload.isShown }
    }

    throw new Error(`Invalid type: ${action.type} and payload: ${action.payload}`);
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

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default displayReducer;
