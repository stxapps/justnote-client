import {
  INCREASE_SAVE_NOTE_COUNT, INCREASE_DISCARD_NOTE_COUNT,
  INCREASE_CONFIRM_DISCARD_NOTE_COUNT, INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT,
  INCREASE_UPDATE_NOTE_ID_COUNT, INCREASE_CHANGE_LIST_NAME_COUNT,
  INCREASE_UPDATE_EDITOR_WIDTH_COUNT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {
  saveNoteCount: 0,
  discardNoteCount: 0,
  confirmDiscardNoteCount: 0,
  updateNoteIdUrlHashCount: 0,
  updateNoteIdCount: 0,
  changeListNameCount: 0,
  updateEditorWidthCount: 0,
};

const editorReducer = (state = initialState, action) => {

  if (action.type === INCREASE_SAVE_NOTE_COUNT) {
    return { ...state, saveNoteCount: state.saveNoteCount + 1 };
  }

  if (action.type === INCREASE_DISCARD_NOTE_COUNT) {
    return { ...state, discardNoteCount: state.discardNoteCount + 1 };
  }

  if (action.type === INCREASE_CONFIRM_DISCARD_NOTE_COUNT) {
    return { ...state, confirmDiscardNoteCount: state.confirmDiscardNoteCount + 1 };
  }

  if (action.type === INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT) {
    return { ...state, updateNoteIdUrlHashCount: state.updateNoteIdUrlHashCount + 1 };
  }

  if (action.type === INCREASE_UPDATE_NOTE_ID_COUNT) {
    return { ...state, updateNoteIdCount: state.updateNoteIdCount + 1 };
  }

  if (action.type === INCREASE_CHANGE_LIST_NAME_COUNT) {
    return { ...state, changeListNameCount: state.changeListNameCount + 1 };
  }

  if (action.type === INCREASE_UPDATE_EDITOR_WIDTH_COUNT) {
    return { ...state, updateEditorWidthCount: state.updateEditorWidthCount + 1 };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default editorReducer;
