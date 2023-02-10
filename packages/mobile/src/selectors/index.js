import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import {
  PINNED, ADDED_DT, UPDATED_DT, NOTE_DATE_SHOWING_MODE_HIDE, NOTE_DATE_FORMAT_SYSTEM,
  UPDATING, MOVING, DIED_UPDATING, DIED_MOVING, WHT_MODE, BLK_MODE, SYSTEM_MODE,
  CUSTOM_MODE, NEW_NOTE, VALID, INVALID,
} from '../types/const';
import {
  isStringIn, isObject, isString, isArrayEqual, isEqual, isNoteBodyEqual, getListNameObj,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  listNoteIds, getSortedNotes, separatePinnedValues, getNoteFPaths, getPinFPaths,
  getPins, doEnableExtraFeatures, getFormattedNoteDate, isNumber, isMobile as _isMobile,
  getDataParentIds,
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
    if (
      prevVal['settings'].doSectionNotesByMonth !== val['settings'].doSectionNotesByMonth
    ) {
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
  if (!sortedNotes) return { pinnedNotes: null, notes: null };

  const { toRootIds } = listNoteIds(noteFPaths);
  const getValueMainId = (note) => {
    let noteId = note.id;
    if ([UPDATING, MOVING, DIED_UPDATING, DIED_MOVING].includes(note.status)) {
      if (Array.isArray(note.parentIds) && note.parentIds.length > 0) {
        noteId = note.parentIds[0];
      }
    }
    return getMainId(noteId, toRootIds);
  };
  const separatedValues = separatePinnedValues(
    sortedNotes, pinFPaths, pendingPins, toRootIds, getValueMainId,
  );

  const pinnedNotes = separatedValues[0].map(pinnedValue => pinnedValue.value);
  const noPinnedNotes = separatedValues[1];

  if (searchString === '') return { pinnedNotes, notes: noPinnedNotes };

  const searchPinnedNotes = pinnedNotes.filter(note => {
    return isStringIn(note, searchString);
  });
  const searchNotes = noPinnedNotes.filter(note => {
    return isStringIn(note, searchString);
  });

  return { pinnedNotes: searchPinnedNotes, notes: searchNotes };
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
    const { pinnedNotes, notes } = _getNotes(state);
    const conflictedNotes = _getConflictedNotes(state);
    return { conflictedNotes, pinnedNotes, notes };
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

export const getSafeAreaFrame = createSelector(
  state => state.window.width,
  state => state.window.height,
  state => state.window.visualWidth,
  state => state.window.visualHeight,
  (windowWidth, windowHeight, visualWidth, visualHeight) => {
    const isMobile = _isMobile();

    [windowWidth, windowHeight] = [Math.round(windowWidth), Math.round(windowHeight)];
    [visualWidth, visualHeight] = [Math.round(visualWidth), Math.round(visualHeight)];

    const width = isMobile && isNumber(visualWidth) ? visualWidth : windowWidth;
    const height = isMobile && isNumber(visualHeight) ? visualHeight : windowHeight;

    return {
      x: 0, y: 0, width, height, windowWidth, windowHeight, visualWidth, visualHeight,
    };
  }
);

export const getValidProduct = createSelector(
  state => state.iap.products,
  products => _getValidProduct(products),
);

export const getValidPurchase = createSelector(
  state => state.info.purchases,
  purchases => _getValidPurchase(purchases),
);

export const getDoEnableExtraFeatures = createSelector(
  state => state.info.purchases,
  purchases => doEnableExtraFeatures(purchases),
);

/** @return {function(any, any): any} */
export const makeGetPinStatus = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => getPinFPaths(state),
    state => state.pendingPins,
    (state, noteIdOrObj) => {
      if (isObject(noteIdOrObj)) return noteIdOrObj;
      if (isString(noteIdOrObj)) {
        for (const listName in state.notes) {
          if (isObject(state.notes[listName]) && noteIdOrObj in state.notes[listName]) {
            return state.notes[listName][noteIdOrObj];
          }
        }
      }
      return null;
    },
    (noteFPaths, pinFPaths, pendingPins, note) => {
      if (!isObject(note)) return null;

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
    state => getDoEnableExtraFeatures(state),
    state => state.settings.sortOn,
    state => state.settings.noteDateShowingMode,
    state => state.settings.noteDateFormat,
    state => state.settings.noteDateIsTwoDigit,
    state => state.settings.noteDateIsCurrentYearShown,
    (__, note) => note.addedDT,
    (__, note) => note.updatedDT,
    (
      doEnable, sortOn, showingMode, format, isTwoDigit, isCurrentYearShown, addedDT,
      updatedDT,
    ) => {
      if (showingMode === NOTE_DATE_SHOWING_MODE_HIDE) return '';

      let dt = addedDT;
      if (sortOn === ADDED_DT) { /* Do nothing here */ }
      else if (sortOn === UPDATED_DT) dt = updatedDT;
      else console.log(`Invalid sortOn: ${sortOn}`);

      if (!doEnable) format = NOTE_DATE_FORMAT_SYSTEM;

      const text = getFormattedNoteDate(format, isTwoDigit, isCurrentYearShown, dt);
      return text;
    },
  );
};

export const getNoteDateExample = createSelector(
  state => state.settings.noteDateFormat,
  state => state.settings.noteDateIsTwoDigit,
  state => state.settings.noteDateIsCurrentYearShown,
  (format, isTwoDigit, isCurrentYearShown) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const dt = (new Date(`${year}-01-28`)).getTime();
    const text = getFormattedNoteDate(format, isTwoDigit, isCurrentYearShown, dt);

    return text;
  },
);

export const getDoSectionNotesByMonth = createSelector(
  state => getDoEnableExtraFeatures(state),
  state => state.settings.doSectionNotesByMonth,
  (doEnable, doSectionNotesByMonth) => {
    if (!doEnable) return false;
    return doSectionNotesByMonth;
  },
);

export const getDoMoreEditorFontSizes = createSelector(
  state => getDoEnableExtraFeatures(state),
  state => state.settings.doMoreEditorFontSizes,
  (doEnable, doMoreEditorFontSizes) => {
    if (!doEnable) return false;
    return doMoreEditorFontSizes;
  },
);

export const getRawThemeMode = createSelector(
  state => state.settings.themeMode,
  state => state.localSettings.doUseLocalTheme,
  state => state.localSettings.themeMode,
  (themeMode, doUseLocalTheme, localThemeMode) => {
    if (doUseLocalTheme) return localThemeMode;
    return themeMode;
  },
);

export const getRawThemeCustomOptions = createSelector(
  state => state.settings.themeCustomOptions,
  state => state.localSettings.doUseLocalTheme,
  state => state.localSettings.themeCustomOptions,
  (customOptions, doUseLocalTheme, localCustomOptions) => {
    if (doUseLocalTheme) return localCustomOptions;
    return customOptions;
  },
);

let lastCustomOptions = null, lastCurHH = null, lastCurMM = null, lastCurMode = null;
export const getThemeMode = createSelector(
  state => state.user.isUserSignedIn,
  state => getDoEnableExtraFeatures(state),
  state => state.window.themeMode,
  state => {
    const mode = getRawThemeMode(state);
    if (mode !== CUSTOM_MODE) {
      [lastCustomOptions, lastCurHH, lastCurMM, lastCurMode] = [null, null, null, null];
      return WHT_MODE;
    }

    const customOptions = getRawThemeCustomOptions(state);

    const d = new Date();
    const curHH = d.getHours();
    const curMM = d.getMinutes();

    if (
      customOptions === lastCustomOptions &&
      curHH === lastCurHH && curMM < lastCurMM + 12 && lastCurMode !== null
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
  state => getRawThemeMode(state),
  (isSignedIn, doEnable, systemMode, customMode, mode) => {
    if (!isSignedIn || !doEnable) return WHT_MODE;

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

/** @return {function(any, any): any} */
export const makeGetUnsavedNote = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => state.unsavedNotes,
    (state, note) => note,
    (noteFPaths, unsavedNotes, note) => {
      // Valid - found an unsaved note
      // Invalid - found a confliced unsaved note
      // null - Not found or not different
      const result = { status: null, note: null };
      if (!isObject(note)) return result;
      if (note.id.startsWith('conflict')) return result;

      if (note.id in unsavedNotes) {
        const { title, body } = unsavedNotes[note.id];
        if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
          [result.status, result.note] = [VALID, unsavedNotes[note.id]];
          return result;
        }
      }

      if (note.id === NEW_NOTE) return result;

      const { toParents } = listNoteIds(noteFPaths);
      const parentIds = getDataParentIds(note.id, toParents);

      for (const parentId of parentIds) {
        if (!(parentId in unsavedNotes)) continue;

        const { title, body, savedTitle, savedBody } = unsavedNotes[parentId];
        // Is the unsaved note and current note different?
        const isUcDiff = note.title !== title || !isNoteBodyEqual(note.body, body);
        // Is the unsaved note and original note different?
        const isUoDiff = savedTitle !== title || !isNoteBodyEqual(savedBody, body);
        // Is the current note and original note different?
        const isCoDiff = (
          note.title !== savedTitle || !isNoteBodyEqual(note.body, savedBody)
        );

        if (isUcDiff && isUoDiff && isCoDiff) { // Conflict
          [result.status, result.note] = [INVALID, unsavedNotes[parentId]];
          return result;
        }
        if (isUcDiff && isUoDiff && !isCoDiff) { // Moved note
          [result.status, result.note] = [VALID, unsavedNotes[parentId]];
          return result;
        }
      }

      return result;
    },
    { memoizeOptions: { resultEqualityCheck: isEqual } },
  );
};
