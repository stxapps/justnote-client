import {
  UPDATE_LIST_NAME_EDITORS, UPDATE_POPUP, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { SETTINGS_POPUP } from '../types/const';

const initialState = {};

const listNameEditorsReducer = (state = initialState, action) => {

  if (action.type === UPDATE_LIST_NAME_EDITORS) {
    const newState = { ...state };
    for (const k in action.payload) {
      newState[k] = { ...newState[k], ...action.payload[k] };
    }

    return newState;
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if ([SETTINGS_POPUP].includes(id) && isShown) return { ...initialState };
    return state;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default listNameEditorsReducer;
