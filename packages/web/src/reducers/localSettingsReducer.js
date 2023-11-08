import { loop, Cmd } from 'redux-loop';

import { updateLocalSettings } from '../actions';
import {
  INIT, UPDATE_USER, FETCH_COMMIT, UPDATE_SETTINGS_COMMIT, UPDATE_INFO_COMMIT,
  MERGE_SETTINGS_COMMIT, UPDATE_DO_SYNC_MODE, UPDATE_DO_SYNC_MODE_INPUT,
  CANCEL_CHANGED_SYNC_MODE, UPDATE_DO_USE_LOCAL_THEME, UPDATE_LOCAL_THEME,
  UPDATE_EDITOR_IS_UPLOADING, CLEAN_UP_STATIC_FILES_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { WHT_MODE } from '../types/const';
import {
  initialLocalSettingsState as initialState, whtModeThemeCustomOptions,
  blkModeThemeCustomOptions,
} from '../types/initialStates';
import { isObject, getNormalizedPurchases } from '../utils';
import vars from '../vars';

const localSettingsReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    const { localSettings } = action.payload;
    return { ...state, ...localSettings };
  }

  if (action.type === UPDATE_USER) {
    const { isUserSignedIn } = action.payload;
    if (!isUserSignedIn) return state;

    const newState = { ...state, signInDT: Date.now() };
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
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
      newState.purchases = getNormalizedPurchases(info.purchases);
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

  if (action.type === CANCEL_CHANGED_SYNC_MODE) {
    const { doSyncMode, doSyncModeInput } = state;
    if (doSyncMode === doSyncModeInput) return state;

    const newState = { ...state, doSyncModeInput: doSyncMode };
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_DO_SYNC_MODE) {
    const newState = { ...state, doSyncMode: action.payload };
    vars.syncMode.doSyncMode = newState.doSyncMode;
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_DO_SYNC_MODE_INPUT) {
    const newState = { ...state, doSyncModeInput: action.payload };
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

  if (action.type === UPDATE_EDITOR_IS_UPLOADING) {
    const isUploading = action.payload;
    if (state.cleanUpStaticFilesDT === null && isUploading) {
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
    const { doSyncMode, doSyncModeInput } = state;
    const newState = { ...initialState, doSyncMode, doSyncModeInput };
    return loop(
      newState, Cmd.run(updateLocalSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === RESET_STATE) {
    const newState = { ...initialState };
    vars.syncMode.doSyncMode = newState.doSyncMode;
    // Delete in localStorage by dataApi.deleteAllLocalFiles.
    return newState;
  }

  return state;
};

export default localSettingsReducer;
