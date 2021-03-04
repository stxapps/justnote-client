import {
  FETCH_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { ID } from '../types/const';
import { _ } from '../utils/obj';

const initialState = {};

const conflictedNotesReducer = (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { listName, conflictedNotes } = action.payload;
    return { ...state, [listName]: _.mapKeys(conflictedNotes, ID) };
  }



  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default conflictedNotesReducer;
