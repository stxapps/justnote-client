import { loop, Cmd } from 'redux-loop';

import { updateLocalSettings } from '../actions';
import {
  INIT, FETCH_COMMIT, UPDATE_SETTINGS_COMMIT, UPDATE_DO_USE_LOCAL_THEME,
  UPDATE_LOCAL_THEME, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { WHT_MODE } from '../types/const';
import {
  initialLocalSettingsState as initialState, whtModeThemeCustomOptions,
  blkModeThemeCustomOptions,
} from '../types/initialStates';
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
    if (isObject(settings)) {
      newState.purchases = settings.purchases;
      newState.defaultThemeMode = settings.themeMode;
      newState.defaultThemeCustomOptions = settings.themeCustomOptions;
    } else {
      newState.purchases = null;
      newState.defaultThemeMode = WHT_MODE;
      newState.defaultThemeCustomOptions = [
        { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
      ];
    }

    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { settings } = action.payload;

    const newState = { ...state };
    if (isObject(settings)) {
      newState.purchases = settings.purchases;
      newState.defaultThemeMode = settings.themeMode;
      newState.defaultThemeCustomOptions = settings.themeCustomOptions;
    } else {
      newState.purchases = null;
      newState.defaultThemeMode = WHT_MODE;
      newState.defaultThemeCustomOptions = [
        { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
      ];
    }

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

  if (action.type === DELETE_ALL_DATA) {
    const newState = { ...initialState };
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === RESET_STATE) {
    // Delete in localStorage by dataApi.deleteAllLocalFiles.
    return { ...initialState }
  }

  return state;
};

export default localSettingsReducer;
