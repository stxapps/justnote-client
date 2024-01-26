import {
  MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK, CANCEL_DIED_NOTES, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import { MOVING, DIED_MOVING } from '../types/const';

const initialState = {};

const pendingSsltsReducer = (state = initialState, action) => {

  if (action.type === MOVE_NOTES) {
    const { listNames, notes } = action.payload;

    const newState = { ...state };
    for (let i = 0; i < listNames.length; i++) {
      const [listName, note] = [listNames[i], notes[i]];
      newState[note.id] = { listName, status: MOVING };
    }
    return newState;
  }

  if (action.type === MOVE_NOTES_COMMIT) {
    const {
      successListNames, successNotes, errorListNames, errorNotes,
    } = action.payload;

    const newState = { ...state };
    for (let i = 0; i < successListNames.length; i++) {
      const note = successNotes[i];
      delete newState[note.id];
    }
    for (let i = 0; i < errorListNames.length; i++) {
      const [listName, note] = [errorListNames[i], errorNotes[i]];
      newState[note.id] = { listName, status: DIED_MOVING };
    }
    return newState;
  }

  if (action.type === MOVE_NOTES_ROLLBACK) {
    const { listNames, notes } = action.payload;

    const newState = { ...state };
    for (let i = 0; i < listNames.length; i++) {
      const [listName, note] = [listNames[i], notes[i]];
      newState[note.id] = { listName, status: DIED_MOVING };
    }
    return newState;
  }

  if (action.type === CANCEL_DIED_NOTES) {
    const { ids } = action.payload;

    const newState = { ...state };
    for (const id of ids) {
      delete newState[id];
    }
    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default pendingSsltsReducer;
