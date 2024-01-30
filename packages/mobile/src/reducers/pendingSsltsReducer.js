import {
  MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK, CANCEL_DIED_NOTES, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import { MOVING, DIED_MOVING } from '../types/const';

const initialState = {};

const pendingSsltsReducer = (state = initialState, action) => {

  if (action.type === MOVE_NOTES) {
    const { toListNames, toNotes } = action.payload;

    const newState = { ...state };
    for (let i = 0; i < toListNames.length; i++) {
      const [listName, note] = [toListNames[i], toNotes[i]];
      // Need fromNote for toRootIds, can remove in the next version.
      newState[note.fromNote.id] = { listName, status: MOVING };
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
      // Need fromNote for toRootIds, can remove in the next version.
      delete newState[note.fromNote.id];
    }
    for (let i = 0; i < errorListNames.length; i++) {
      const [listName, note] = [errorListNames[i], errorNotes[i]];
      // Need fromNote for toRootIds, can remove in the next version.
      newState[note.fromNote.id] = { listName, status: DIED_MOVING };
    }
    return newState;
  }

  if (action.type === MOVE_NOTES_ROLLBACK) {
    const { toListNames, toNotes } = action.payload;

    const newState = { ...state };
    for (let i = 0; i < toListNames.length; i++) {
      const [listName, note] = [toListNames[i], toNotes[i]];
      // Need fromNote for toRootIds, can remove in the next version.
      newState[note.fromNote.id] = { listName, status: DIED_MOVING };
    }
    return newState;
  }

  if (action.type === CANCEL_DIED_NOTES) {
    const { ids, fromIds } = action.payload;

    const newState = { ...state };
    for (const id of [...ids, ...fromIds]) {
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
