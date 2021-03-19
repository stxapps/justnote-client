import {
  FETCH_MORE, FETCH_MORE_COMMIT, FETCH_MORE_ROLLBACK, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {};

const isFetchingMoreNotesReducer = (state = initialState, action) => {

  if (action.type === FETCH_MORE) {
    const { listName } = action.payload;
    return { ...state, [listName]: true };
  }

  if (action.type === FETCH_MORE_COMMIT || action.type === FETCH_MORE_ROLLBACK) {
    const { listName } = action.payload;

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

export default isFetchingMoreNotesReducer;
