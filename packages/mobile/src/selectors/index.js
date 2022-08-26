import { Platform } from 'react-native';
import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import {
  PINNED, ADDED_DT, UPDATED_DT, NOTE_DATE_SHOWING_MODE_HIDE,
  UPDATING, MOVING, DIED_UPDATING, DIED_MOVING, WHT_MODE, BLK_MODE, SYSTEM_MODE,
  CUSTOM_MODE,
} from '../types/const';
import {
  isStringIn, isObject, isArrayEqual, isEqual, getListNameObj, getFormattedShortDate,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  listNoteIds, getSortedNotes, sortWithPins, getNoteFPaths, getPinFPaths, getPins,
  doEnableExtraFeatures,
} from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import { initialListNameEditorState } from '../types/initialStates';

const createSelectorListNameMap = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {
    if (!isObject(prevVal['notes']) || !isObject(val['notes'])) {
      if (prevVal['notes'] !== val['notes']) return false;
    }

    if (!isArrayEqual(
      Object.keys(prevVal['notes']).sort(),
      Object.keys(val['notes']).sort()
    )) return false;

    return isEqual(prevVal['settings']['listNameMap'], val['settings']['listNameMap']);
  }
);

export const getListNameMap = createSelectorListNameMap(
  state => state,
  (state) => {
    return [...state.settings.listNameMap];
  }
);

/** @return {function(any, any): any} */
export const makeIsNoteIdSelected = () => {
  return createSelector(
    state => state.display.selectedNoteIds,
    (__, noteId) => noteId,
    (selectedNoteIds, noteId) => {
      return selectedNoteIds.includes(noteId);
    }
  );
};

export const getSelectedNoteIdsLength = createSelector(
  state => state.display.selectedNoteIds,
  selectedNoteIds => {
    return selectedNoteIds.length;
  }
);

const createSelectorNotes = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {

    if (prevVal['settings'].sortOn !== val['settings'].sortOn) {
      return false;
    }
    if (prevVal['settings'].doDescendingOrder !== val['settings'].doDescendingOrder) {
      return false;
    }

    if (prevVal['display'].listName !== val['display'].listName) return false;
    if (prevVal['display'].searchString !== val['display'].searchString) return false;

    if (prevVal['cachedFPaths'].fpaths !== val['cachedFPaths'].fpaths) {
      if (!prevVal['cachedFPaths'].fpaths || !val['cachedFPaths'].fpaths) return false;
      if (!isArrayEqual(
        prevVal['cachedFPaths'].fpaths.pinFPaths,
        val['cachedFPaths'].fpaths.pinFPaths
      )) return false;
    }

    if (prevVal['pendingPins'] !== val['pendingPins']) return false;

    if (
      prevVal['notes'] === val['notes'] &&
      prevVal['conflictedNotes'] === val['conflictedNotes']
    ) {
      return true;
    }
    if (!isArrayEqual(
      Object.keys(prevVal['notes']).sort(), Object.keys(val['notes']).sort())
    ) {
      return false;
    }
    if (!isArrayEqual(
      Object.keys(prevVal['conflictedNotes']).sort(),
      Object.keys(val['conflictedNotes']).sort())
    ) {
      return false;
    }

    for (const key in val['notes']) {
      if (prevVal['notes'][key] !== val['notes'][key]) return false;
    }
    for (const key in val['conflictedNotes']) {
      if (prevVal['conflictedNotes'][key] !== val['conflictedNotes'][key]) return false;
    }

    return true;
  }
);

export const _getNotes = (state) => {

  const notes = state.notes;
  const listName = state.display.listName;
  const searchString = state.display.searchString;
  const sortOn = state.settings.sortOn;
  const doDescendingOrder = state.settings.doDescendingOrder;
  const noteFPaths = getNoteFPaths(state);
  const pinFPaths = getPinFPaths(state);
  const pendingPins = state.pendingPins;

  let sortedNotes = getSortedNotes(notes, listName, sortOn, doDescendingOrder);
  if (!sortedNotes) return null;

  const { toRootIds } = listNoteIds(noteFPaths);
  sortedNotes = sortWithPins(sortedNotes, pinFPaths, pendingPins, toRootIds, (note) => {
    let noteId = note.id;
    if ([UPDATING, MOVING, DIED_UPDATING, DIED_MOVING].includes(note.status)) {
      if (Array.isArray(note.parentIds) && note.parentIds.length > 0) {
        noteId = note.parentIds[0];
      }
    }
    return getMainId(noteId, toRootIds);
  });

  if (searchString === '') return sortedNotes;

  const searchNotes = sortedNotes.filter(note => {
    return isStringIn(note, searchString);
  });

  return searchNotes;
};

export const _getConflictedNotes = (state) => {

  const conflictedNotes = state.conflictedNotes;
  const listName = state.display.listName;
  const sortOn = state.settings.sortOn;
  const doDescendingOrder = state.settings.doDescendingOrder;

  if (!conflictedNotes || !conflictedNotes[listName]) return null;

  const sortedNotes = Object.values(conflictedNotes[listName]).sort((a, b) => {
    return a[sortOn] - b[sortOn];
  });
  if (doDescendingOrder) sortedNotes.reverse();

  return sortedNotes;
};

export const getNotes = createSelectorNotes(
  state => state,
  (state) => {

    const notes = _getNotes(state);
    const conflictedNotes = _getConflictedNotes(state);

    if (!notes && !conflictedNotes) return null;
    if (!conflictedNotes) return notes;
    if (!notes) return conflictedNotes;
    return [...conflictedNotes, ...notes];
  }
);

export const getIsFetchingMore = createSelector(
  state => state.display.listName,
  state => state.isFetchMoreInterrupted,
  (listName, isFetchMoreInterrupted) => {
    const obj = isFetchMoreInterrupted[listName];
    if (isObject(obj) && !isEqual(obj, {})) return true;
    return false;
  }
);

/** @return {function(any, any): initialListNameEditorState} */
export const makeGetListNameEditor = () => {
  return createSelector(
    state => state.settings.listNameMap,
    state => state.listNameEditors,
    (__, key) => key,
    (listNameMap, listNameEditors, key) => {
      const state = { ...initialListNameEditorState };

      const { listNameObj } = getListNameObj(key, listNameMap);
      if (listNameObj) state.value = listNameObj.displayName;

      return { ...state, ...listNameEditors[key] };
    },
    { memoizeOptions: { resultEqualityCheck: isEqual } },
  );
};

export const getValidProduct = createSelector(
  state => state.iap.products,
  products => _getValidProduct(products),
);

export const getValidPurchase = createSelector(
  state => state.settings.purchases,
  purchases => _getValidPurchase(purchases),
);

export const getDoEnableExtraFeatures = createSelector(
  state => state.settings.purchases,
  purchases => doEnableExtraFeatures(purchases),
);

/** @return {function(any, any): any} */
export const makeGetPinStatus = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => getPinFPaths(state),
    state => state.pendingPins,
    (state, noteId) => {
      for (const listName in state.notes) {
        if (isObject(state.notes[listName]) && noteId in state.notes[listName]) {
          return state.notes[listName][noteId];
        }
      }
      return null;
    },
    (noteFPaths, pinFPaths, pendingPins, note) => {

      if (!note) return null;

      const { toRootIds } = listNoteIds(noteFPaths);
      const pins = getPins(pinFPaths, pendingPins, false, toRootIds);

      let noteId = note.id;
      if ([UPDATING, MOVING, DIED_UPDATING, DIED_MOVING].includes(note.status)) {
        if (Array.isArray(note.parentIds) && note.parentIds.length > 0) {
          noteId = note.parentIds[0];
        }
      }
      const noteMainId = getMainId(noteId, toRootIds);

      if (noteMainId in pins) {
        if ('status' in pins[noteMainId]) return pins[noteMainId].status;
        return PINNED;
      }

      return null;
    }
  );
};

/** @return {function(any, any): any} */
export const makeGetNoteDate = () => {
  return createSelector(
    state => state.settings.sortOn,
    state => state.settings.noteDateShowingMode,
    (__, note) => note.addedDT,
    (__, note) => note.updatedDT,
    (sortOn, noteDateShowingMode, addedDT, updatedDT) => {
      if (noteDateShowingMode === NOTE_DATE_SHOWING_MODE_HIDE) return '';

      let dt;
      if (sortOn === ADDED_DT) dt = addedDT;
      else if (sortOn === UPDATED_DT) dt = updatedDT;
      else throw new Error(`Invalid sortOn: ${sortOn}`);

      const currentDate = new Date();
      const d = new Date(dt);

      if (Platform.OS === 'ios') {
        return getFormattedShortDate(d, d.getFullYear() === currentDate.getFullYear());
      }

      let text;
      if (d.getFullYear() === currentDate.getFullYear()) {
        text = d.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' });
      } else {
        text = d.toLocaleDateString(
          undefined, { day: 'numeric', month: 'numeric', year: '2-digit' }
        );
      }

      return text;
    },
  );
};

let lastCustomOptions, lastCurHH, lastCurMM, lastCurMode;
export const getThemeMode = createSelector(
  state => state.user.isUserSignedIn,
  state => getDoEnableExtraFeatures(state),
  state => state.window.themeMode,
  state => {
    const mode = state.localSettings.themeMode;
    if (mode !== CUSTOM_MODE) return WHT_MODE;

    const customOptions = state.localSettings.themeCustomOptions;

    const d = new Date();
    const curHH = d.getHours();
    const curMM = d.getMinutes();

    if (
      customOptions === lastCustomOptions &&
      curHH === lastCurHH && curMM < lastCurMM + 12 && lastCurMode
    ) {
      return lastCurMode;
    }

    [lastCustomOptions, lastCurHH, lastCurMM] = [customOptions, curHH, curMM];
    for (let i = 0; i < customOptions.length; i++) {
      const startOption = customOptions[i];

      const j = i + 1 < customOptions.length ? i + 1 : 0;
      const endOption = customOptions[j];

      const [startHHStr, startMMStr] = startOption.startTime.trim().split(':');
      const [endHHStr, endMMStr] = endOption.startTime.trim().split(':');

      const startHH = parseInt(startHHStr, 10);
      const startMM = parseInt(startMMStr, 10);
      const endHH = parseInt(endHHStr, 10);
      const endMM = parseInt(endMMStr, 10);

      if (startHH < endHH || (startHH === endHH && startMM < endMM)) {
        if (curHH > startHH || (curHH === startHH && curMM >= startMM)) {
          if (curHH < endHH || (curHH === endHH && curMM < endMM)) {
            lastCurMode = startOption.mode;
            return lastCurMode;
          }
        }
      } else {
        if (curHH > startHH || (curHH === startHH && curMM >= startMM)) {
          lastCurMode = startOption.mode;
          return lastCurMode;
        }
        if (curHH < endHH || (curHH === endHH && curMM < endMM)) {
          lastCurMode = startOption.mode;
          return lastCurMode;
        }
      }
    }

    console.log('Could not find startTime and endTime in themeCustomOptions!');
    [lastCustomOptions, lastCurHH, lastCurMM, lastCurMode] = [null, null, null, null];
    return WHT_MODE;
  },
  state => state.localSettings.themeMode,
  (isSignedIn, doEnable, systemMode, customMode, mode) => {
    if (!isSignedIn) return systemMode;
    if (!doEnable) return WHT_MODE;

    if (mode === SYSTEM_MODE) return systemMode;
    if (mode === CUSTOM_MODE) return customMode;
    if ([WHT_MODE, BLK_MODE].includes(mode)) return mode;

    return WHT_MODE;
  },
);

/** @type {function(any, any): any} */
export const getTailwind = createSelector(
  safeAreaWidth => safeAreaWidth,
  (__, themeMode) => themeMode,
  (safeAreaWidth, themeMode) => {
    return (classStr) => {
      return tailwind(classStr, safeAreaWidth, themeMode);
    };
  },
);

/** @return {function(any, any): any} */
export const makeIsTimePickHourItemSelected = () => {
  return createSelector(
    state => state.timePick.hour,
    (__, item) => item,
    (hour, item) => {
      return hour === item;
    }
  );
};

/** @return {function(any, any): any} */
export const makeIsTimePickMinuteItemSelected = () => {
  return createSelector(
    state => state.timePick.minute,
    (__, item) => item,
    (minute, item) => {
      return minute === item;
    }
  );
};
