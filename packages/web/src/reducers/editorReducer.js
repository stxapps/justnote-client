import {
  INCREASE_SAVE_NOTE_COUNT, INCREASE_RESET_NOTE_COUNT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {
  saveNoteCount: 0,
  resetNoteCount: 0,
};

const editorReducer = (state = initialState, action) => {

  if (action.type === INCREASE_SAVE_NOTE_COUNT) {
    return { ...state, saveNoteCount: state.saveNoteCount + 1 };
  }

  if (action.type === INCREASE_RESET_NOTE_COUNT) {
    return { ...state, resetNoteCount: state.resetNoteCount + 1 };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default editorReducer;
