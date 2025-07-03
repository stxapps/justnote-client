import { Platform } from 'react-native';
import FlagSecure from 'react-native-flag-secure';

import {
  REQUEST_PURCHASE, UPDATE_LOCKS_FOR_ACTIVE_APP, UPDATE_LOCKS_FOR_INACTIVE_APP,
} from '../types/actionTypes';
import {
  MY_NOTES, APP_STATE_ACTIVE, APP_STATE_INACTIVE, APP_STATE_BACKGROUND,
} from '../types/const';
import { isObject, doListContainUnlocks } from '../utils';
import vars from '../vars';

import {
  handleUnsavedNote, increaseBlurCount, increaseWebViewKeyCount, is24HourFormat,
  updateIs24HFormat,
} from '.';
import { sync } from '../importWrapper';

export const handleAppStateChange = (appState, pathname) => async (
  dispatch, getState
) => {
  // Debounce on active and '/' for performance.
  // In case, when switch to app, active as '/' then to share.
  clearTimeout(vars.appState.timeoutId);

  if (appState === APP_STATE_ACTIVE && pathname === '/') {
    vars.appState.timeoutId = setTimeout(async () => {
      await _handleAppStateChange(appState, pathname, dispatch, getState);
    }, 400);
  } else {
    await _handleAppStateChange(appState, pathname, dispatch, getState);
  }
};

const _handleAppStateChange = async (appState, pathname, dispatch, getState) => {
  // 1. active       app       check
  // 2. active       share     no check
  // 3. background   app       check
  // 4. background   share     check
  // 5. app -> any (like 2.)   no check
  // 6. any -> app (like 1.)   check
  const isUserSignedIn = getState().user.isUserSignedIn;

  if (appState === APP_STATE_ACTIVE && pathname === '/') {
    const doForceLock = getState().display.doForceLock;

    const isLong = (Date.now() - vars.appState.lastChangeDT) > 21 * 60 * 1000;
    vars.appState.lastChangeDT = Date.now();

    const lockedLists = getState().lockSettings.lockedLists;
    const doNoChangeMyNotes = (
      isObject(lockedLists[MY_NOTES]) &&
      lockedLists[MY_NOTES].canChangeListNames === false
    );
    if (doForceLock || (isUserSignedIn && isLong)) {
      const isEditorFocused = getState().display.isEditorFocused;
      if (isLong && isEditorFocused) {
        dispatch(increaseBlurCount());
        dispatch(handleUnsavedNote(getState().display.noteId, null, null, null));
      }

      if (Platform.OS === 'android') FlagSecure.deactivate();
      // If on web and isLong is true, need to update url hash if noteId !== null
      //   like in refreshFetched.
      dispatch({
        type: UPDATE_LOCKS_FOR_ACTIVE_APP,
        payload: { isLong, doNoChangeMyNotes },
      });
    }

    // 3 cases: landing, dummy, signed in. The latter two need to, the first is fine.
    if (vars.translucentAdding.didExit) dispatch(increaseWebViewKeyCount());

    if (isUserSignedIn) {
      const { purchaseStatus } = getState().iap;
      if (purchaseStatus === REQUEST_PURCHASE) return;
    }

    const is24HFormat = await is24HourFormat();
    dispatch(updateIs24HFormat(is24HFormat));

    if (!isUserSignedIn) return;

    let didShare = vars.translucentAdding.didShare;
    const interval = (Date.now() - vars.sync.lastSyncDT) / 1000 / 60 / 60;
    if (!didShare && interval < 0.3) return;

    dispatch(sync(didShare || interval > 1, 0));
  }

  let isInactive = appState === APP_STATE_INACTIVE;
  if (Platform.OS === 'android') isInactive = appState === APP_STATE_BACKGROUND;
  if (isInactive) {
    vars.translucentAdding.didExit = false;
    vars.translucentAdding.didShare = false;

    if (!isUserSignedIn) return;

    const { purchaseStatus } = getState().iap;
    if (purchaseStatus === REQUEST_PURCHASE) return;

    const doLCU = doListContainUnlocks(getState());
    if (doLCU) {
      if (Platform.OS === 'android') FlagSecure.activate();
      dispatch({ type: UPDATE_LOCKS_FOR_INACTIVE_APP });
    }
  }
};
