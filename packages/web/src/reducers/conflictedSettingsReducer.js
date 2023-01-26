import {
  FETCH_COMMIT, MERGE_SETTINGS, MERGE_SETTINGS_COMMIT, MERGE_SETTINGS_ROLLBACK,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { MERGING, DIED_MERGING } from '../types/const';
import { _ } from '../utils/obj';

const initialState = {
  contents: [],
  status: null,
};

const conflictedSettingsReducer = (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { conflictedSettings } = action.payload;
    return { ...state, contents: [...conflictedSettings] };
  }

  if (action.type === MERGE_SETTINGS) {
    return { state, status: MERGING };
  }

  if (action.type === MERGE_SETTINGS_COMMIT) {
    return { ...initialState };
  }

  if (action.type === MERGE_SETTINGS_ROLLBACK) {
    return { state, status: DIED_MERGING };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default conflictedSettingsReducer;
