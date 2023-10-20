import {
  UPDATE_FETCHED, CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, REFRESH_FETCHED,
  UPDATE_NOTE_COMMIT, MOVE_NOTES_COMMIT, DELETE_NOTES_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { getArraysPerKey } from '../utils';

const initialState = {};

const fetchedMoreReducer = (state = initialState, action) => {

  if (action.type === UPDATE_FETCHED) {
    const { lnOrQt } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== lnOrQt) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === CACHE_FETCHED_MORE) {
    const { payload } = action;
    return { ...state, [payload.lnOrQt]: { payload } };
  }

  if (action.type === UPDATE_FETCHED_MORE || action.type === REFRESH_FETCHED) {
    const { lnOrQt } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== lnOrQt) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === UPDATE_NOTE_COMMIT) {

  }

  // Died notes are always shown, so need to apply to cached notes here too.
  if (
    action.type === MOVE_NOTES_COMMIT ||
    action.type === DELETE_NOTES_COMMIT ||
    action.type === DELETE_OLD_NOTES_IN_TRASH_COMMIT
  ) {
    const { successFromListNames, successFromNotes } = action.payload;

    const successIds = successFromNotes.map(note => note.id);
    const idsPerLn = getArraysPerKey(successFromListNames, successIds);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      if (!newState[listName]) continue;

      const { payload } = newState[listName];


    }
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default fetchedMoreReducer;
