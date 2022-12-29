import { loop, Cmd } from 'redux-loop';

import { updateLocalSettings } from '../actions';
import {
  INIT, FETCH_COMMIT, UPDATE_SETTINGS_COMMIT, UPDATE_DO_USE_LOCAL_THEME,
  UPDATE_LOCAL_THEME, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { initialLocalSettingsState as initialState } from '../types/initialStates';
import { isObject } from '../utils';

const localSettingsReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    const { localSettings } = action.payload;
    return { ...state, ...localSettings };
  }

  if (action.type === FETCH_COMMIT) {
    const { doFetchSettings, settings } = action.payload;
    if (!doFetchSettings) return state;

    const newState = { ...state };
    if (isObject(settings)) newState.purchases = settings.purchases;
    else newState.purchases = null;

    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { settings } = action.payload;

    const newState = { ...state };
    if (isObject(settings)) newState.purchases = settings.purchases;
    else newState.purchases = null;

    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_DO_USE_LOCAL_THEME) {
    const newState = { ...state, doUseLocalTheme: action.payload };
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_LOCAL_THEME) {
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
