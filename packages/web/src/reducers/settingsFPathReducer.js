import {
  FETCH_COMMIT, UPDATE_SETTINGS_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

export const initialState = {
  fpath: null,
};

const settingsFPathReducer = (state = initialState, action) => {

  if ([FETCH_COMMIT, UPDATE_SETTINGS_COMMIT].includes(action.type)) {
    const { settingsFPath } = action.payload;
    return { ...state, fpath: settingsFPath };
  }

  if (action.type === DELETE_ALL_DATA) {
    const { settingsFPath } = action.payload;
    return { ...initialState, fpath: settingsFPath };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default settingsFPathReducer;
