import { loop, Cmd } from 'redux-loop';

import { updateLocalSettings } from '../actions';
import {
  INIT, FETCH_COMMIT, UPDATE_SETTINGS_COMMIT, UPDATE_INFO_COMMIT, MERGE_SETTINGS_COMMIT,
  UPDATE_DO_USE_LOCAL_THEME, UPDATE_LOCAL_THEME, ADD_SAVING_FPATHS,
  CLEAN_UP_STATIC_FILES_COMMIT, DELETE_ALL_DATA, RESET_STATE,
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
    const { doFetchStgsAndInfo, settings, info } = action.payload;
    if (!doFetchStgsAndInfo) return state;

    const newState = { ...state };
    if (isObject(settings)) {
      newState.defaultThemeMode = settings.themeMode;
      newState.defaultThemeCustomOptions = settings.themeCustomOptions;
    } else {
      newState.defaultThemeMode = WHT_MODE;
      newState.defaultThemeCustomOptions = [
        { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
      ];
    }

    if (isObject(info)) {
      newState.purchases = info.purchases;
    } else {
      newState.purchases = null;
    }

    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_SETTINGS_COMMIT || action.type === MERGE_SETTINGS_COMMIT) {
    const { settings } = action.payload;

    const newState = { ...state };
    if (isObject(settings)) {
      newState.defaultThemeMode = settings.themeMode;
      newState.defaultThemeCustomOptions = settings.themeCustomOptions;
    } else {
      newState.defaultThemeMode = WHT_MODE;
      newState.defaultThemeCustomOptions = [
        { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
      ];
    }

    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_INFO_COMMIT) {
    const { info } = action.payload;

    const newState = { ...state };
    if (isObject(info)) {
      newState.purchases = info.purchases;
    } else {
      newState.purchases = null;
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

  if (action.type === ADD_SAVING_FPATHS) {
    if (state.cleanUpStaticFilesDT === null) {
      const newState = { ...state, cleanUpStaticFilesDT: Date.now() };
      return loop(
        newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
    return state;
  }

  if (action.type === CLEAN_UP_STATIC_FILES_COMMIT) {
    const newState = { ...state, cleanUpStaticFilesDT: Date.now() };
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
    return { ...initialState };
  }

  return state;
};

export default localSettingsReducer;
