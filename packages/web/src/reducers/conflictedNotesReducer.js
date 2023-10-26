import {
  FETCH_COMMIT, UPDATE_FETCHED, UPDATE_FETCHED_MORE, MERGE_NOTES, MERGE_NOTES_COMMIT,
  MERGE_NOTES_ROLLBACK, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { ID, MERGING, DIED_MERGING } from '../types/const';
import { _ } from '../utils/obj';

const initialState = {};

const conflictedNotesReducer = (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { doFetchStgsAndInfo } = action.payload;
    if (doFetchStgsAndInfo) return { ...initialState };

    // Need to also clear when refresh
    return state;
  }

  if (action.type === UPDATE_FETCHED || action.type === UPDATE_FETCHED_MORE) {
    const { conflictedNotes } = action.payload;
    if (!Array.isArray(conflictedNotes) || conflictedNotes.length === 0) return state;

    return { ...state, ..._.mapKeys(conflictedNotes, ID) };
  }

  if (action.type === MERGE_NOTES) {
    const { conflictedNote } = action.payload;

    const newState = {};
    for (const id in state) {
      if (id === conflictedNote.id) {
        newState[id] = { ...state[id], status: MERGING };
      } else {
        newState[id] = state[id];
      }
    }

    return newState;
  }

  if (action.type === MERGE_NOTES_COMMIT) {
    const { conflictedNote } = action.payload;

    const newState = {};
    for (const id in state) {
      if (id === conflictedNote.id) continue;
      newState[id] = state[id];
    }

    return newState;
  }

  if (action.type === MERGE_NOTES_ROLLBACK) {
    const { conflictedNote } = action.payload;

    const newState = {};
    for (const id in state) {
      if (id === conflictedNote.id) {
        newState[id] = { ...state[id], status: DIED_MERGING };
      } else {
        newState[id] = state[id];
      }
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default conflictedNotesReducer;
