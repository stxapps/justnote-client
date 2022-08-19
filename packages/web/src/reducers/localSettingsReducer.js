import { loop, Cmd } from 'redux-loop';

import { updateLocalSettings } from '../actions';
import { INIT, UPDATE_THEME, DELETE_ALL_DATA, RESET_STATE } from '../types/actionTypes';
import { initialLocalSettingsState as initialState } from '../types/initialStates';

const localSettingsReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    const { localSettings } = action.payload;
    return { ...state, ...localSettings };
  }

  if (action.type === UPDATE_THEME) {
    const { mode, customOptions } = action.payload;
    const newState = { ...state, themeMode: mode, themeCustomOptions: customOptions };
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    const newState = { ...initialState };
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  return state;
};

export default localSettingsReducer;
