import {
  CACHE_FETCHED_MORE, UPDATE_FETCHED_MORE, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {};

const fetchedMoreReducer = (state = initialState, action) => {

  if (action.type === CACHE_FETCHED_MORE) {
    const { payload } = action;
    return { ...state, [payload.listName]: { payload } };
  }

  if (action.type === UPDATE_FETCHED_MORE) {
    const { listName } = action.payload;

    const newState = {};
    for (const k in state) {
      if (k !== listName) newState[k] = state[k];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default fetchedMoreReducer;
