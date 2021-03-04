import {
  FETCH_COMMIT, FETCH_MORE_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {};

const hasMoreNotesReducer = (state = initialState, action) => {

  if (action.type === FETCH_COMMIT || action.type === FETCH_MORE_COMMIT) {
    const { listName, hasMore } = action.payload;

    if (hasMore) return { ...state, [listName]: hasMore };

    const newState = {};
    for (const id in state) {
      if (id === listName) continue;
      newState[id] = state[id];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default hasMoreNotesReducer;
