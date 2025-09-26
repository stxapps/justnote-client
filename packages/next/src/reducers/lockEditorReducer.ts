import {
  UPDATE_POPUP, UPDATE_LOCK_EDITOR, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { LOCK_EDITOR_POPUP } from '../types/const';

const initialState = {
  isLoadingShown: false,
  errMsg: '',
};

const lockEditorReducer = (state = initialState, action) => {

  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if ([LOCK_EDITOR_POPUP].includes(id) && isShown) return { ...initialState };
    return state;
  }

  if (action.type === UPDATE_LOCK_EDITOR) {
    return { ...state, ...action.payload };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default lockEditorReducer;
