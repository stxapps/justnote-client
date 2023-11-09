import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import {
  SHOWING_STATUSES, PINNED, ADDED_DT, UPDATED_DT, NOTE_DATE_SHOWING_MODE_HIDE,
  NOTE_DATE_FORMAT_SYSTEM, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE, NEW_NOTE,
  VALID, INVALID, LOCKED, UNLOCKED, MY_NOTES, TAGGED,
} from '../types/const';
import {
  isStringIn, isObject, isString, isEqual, isTitleEqual, isBodyEqual, getListNameObj,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  listNoteMetas, getNoteFPaths, getPinFPaths, getPins, doEnableExtraFeatures,
  getFormattedNoteDate, isNumber, isMobile as _isMobile, getDataParentIds, getNote,
  doesIncludeFetchingMore, getLockListStatus, getTagFPaths, getTags, getTagNameObj,
} from '../utils';
import { tailwind } from '../stylesheets/tailwind';
import {
  initialListNameEditorState, initialTagNameEditorState,
} from '../types/initialStates';

export const getListNameMap = createSelector(
  state => state.settings.listNameMap,
  (listNameMap) => {
    return listNameMap;
  }
);

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

export const getIsShowingNoteInfosNull = createSelector(
  state => state.display.showingNoteInfos,
  (showingNoteInfos) => {
    return showingNoteInfos === null;
  }
);

const createSelectorNotes = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {
    if (getNoteFPaths(prevVal) !== getNoteFPaths(val)) return false;
    if (prevVal.conflictedNotes !== val.conflictedNotes) return false;
    if (prevVal.notes !== val.notes) return false;
    if (prevVal.display.queryString !== val.display.queryString) return false;
    if (prevVal.pendingTags !== val.pendingTags) return false;
    if (prevVal.lockSettings.lockedNotes !== val.lockSettings.lockedNotes) return false;
    if (prevVal.display.searchString !== val.display.searchString) return false;

    const prevInfos = prevVal.display.showingNoteInfos;
    const infos = val.display.showingNoteInfos;
    if (Array.isArray(prevInfos) && Array.isArray(infos)) {
      if (prevInfos.length !== infos.length) return false;
      for (let i = 0; i < prevInfos.length; i++) {
        const [prevInfo, info] = [prevInfos[i], infos[i]];
        if (!isEqual(prevInfo, info)) return false;
      }
    } else {
      if (prevInfos !== infos) return false;
    }

    return true;
  }
);

export const getNotes = createSelectorNotes(
  state => state,
  (state) => {
    const noteFPaths = getNoteFPaths(state);
    const conflictedNotes = state.conflictedNotes;
    const notes = state.notes;
    const queryString = state.display.queryString;
    const pendingTags = state.pendingTags;
    const lockedNotes = state.lockSettings.lockedNotes;
    const searchString = state.display.searchString;
    const showingNoteInfos = state.display.showingNoteInfos;

    if (!Array.isArray(showingNoteInfos)) return null;

    const cNotes = [], pNotes = [], sNotes = [];
    for (const info of showingNoteInfos) {
      if (info.id.startsWith('conflict')) {
        const note = conflictedNotes[info.id];
        if (!isObject(note)) continue;

        cNotes.push(note);
        continue;
      }

      if (queryString && isObject(pendingTags[info.id])) {
        // Only tag name for now
        const tagName = queryString.trim();
        const values = pendingTags[info.id].values;
        const found = values.some(value => value.tagName === tagName);
        if (!found) continue;
      }

      const note = getNote(info.id, notes);
      if (!isObject(note)) continue;
      if (!SHOWING_STATUSES.includes(note.status)) continue;

      if (info.isPinned) pNotes.push(note);
      else sNotes.push(note);
    }

    if (searchString === '') {
      return { sortedCfNts: cNotes, pinnedNotes: pNotes, noPinnedNotes: sNotes };
    }

    const { toRootIds } = listNoteMetas(noteFPaths);

    const spNotes = pNotes.filter(note => {
      return isStringIn(note, searchString, lockedNotes, toRootIds);
    });
    const ssNotes = sNotes.filter(note => {
      return isStringIn(note, searchString, lockedNotes, toRootIds);
    });

    return { sortedCfNts: cNotes, pinnedNotes: spNotes, noPinnedNotes: ssNotes };
  }
);

export const getHasMoreNotes = createSelector(
  state => state.display.hasMoreNotes,
  (hasMoreNotes) => {
    return hasMoreNotes;
  },
);

export const getIsFetchingMore = createSelector(
  state => state.display.listName,
  state => state.display.queryString,
  state => state.display.fetchingInfos,
  (listName, queryString, fetchingInfos) => {
    const lnOrQt = queryString ? queryString : listName;
    if (doesIncludeFetchingMore(lnOrQt, fetchingInfos)) return true;
    return false;
  }
);

export const getHasFetchedMore = createSelector(
  state => state.display.listName,
  state => state.display.queryString,
  state => state.fetchedMore,
  (listName, queryString, fetchedMore) => {
    let obj;
    if (queryString) {
      obj = fetchedMore[queryString];
      if (isObject(obj) && !isEqual(obj, {})) return true;
    }

    obj = fetchedMore[listName];
    if (isObject(obj) && !isEqual(obj, {})) return true;

    return false;
  }
);

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

export const makeGetPinStatus = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => getPinFPaths(state),
    state => state.pendingPins,
    (state, noteIdOrObj) => {
      if (isString(noteIdOrObj)) return getNote(noteIdOrObj, state.notes);
      return noteIdOrObj;
    },
    (noteFPaths, pinFPaths, pendingPins, note) => {
      if (!isObject(note)) return null;

      const { toRootIds } = listNoteMetas(noteFPaths);
      const pins = getPins(pinFPaths, pendingPins, false, toRootIds);
      const noteMainId = getMainId(note, toRootIds);

      if (noteMainId in pins) {
        if ('status' in pins[noteMainId]) return pins[noteMainId].status;
        return PINNED;
      }

      return null;
    }
  );
};

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

export const getTailwind = createSelector(
  safeAreaWidth => safeAreaWidth,
  (__, themeMode) => themeMode,
  (safeAreaWidth, themeMode) => {
    return (classStr) => {
      return tailwind(classStr, safeAreaWidth, themeMode);
    };
  },
);

export const makeIsTimePickHourItemSelected = () => {
  return createSelector(
    state => state.timePick.hour,
    (__, item) => item,
    (hour, item) => {
      return hour === item;
    }
  );
};

export const makeIsTimePickMinuteItemSelected = () => {
  return createSelector(
    state => state.timePick.minute,
    (__, item) => item,
    (minute, item) => {
      return minute === item;
    }
  );
};

export const makeGetUnsavedNote = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => state.unsavedNotes,
    (__, note) => note,
    (noteFPaths, unsavedNotes, note) => {
      // Valid - found an unsaved note
      // Invalid - found a confliced unsaved note
      // null - Not found or not different
      const result = { status: null, note: null };
      if (!isObject(note)) return result;
      if (note.id.startsWith('conflict')) return result;

      if (note.id in unsavedNotes) {
        const { title, body } = unsavedNotes[note.id];
        if (!isTitleEqual(note.title, title) || !isBodyEqual(note.body, body)) {
          [result.status, result.note] = [VALID, unsavedNotes[note.id]];
          return result;
        }
      }

      if (note.id === NEW_NOTE) return result;

      const { toParents } = listNoteMetas(noteFPaths);
      const parentIds = getDataParentIds(note.id, toParents);

      for (const parentId of parentIds) {
        if (!(parentId in unsavedNotes)) continue;

        const { title, body, savedTitle, savedBody } = unsavedNotes[parentId];
        // Is the unsaved note and current note different?
        const isUcDiff = (
          !isTitleEqual(note.title, title) || !isBodyEqual(note.body, body)
        );
        // Is the unsaved note and original note different?
        const isUoDiff = (
          !isTitleEqual(savedTitle, title) || !isBodyEqual(savedBody, body)
        );
        // Is the current note and original note different?
        const isCoDiff = (
          !isTitleEqual(note.title, savedTitle) || !isBodyEqual(note.body, savedBody)
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

export const makeGetIsExportingNoteAsPdf = () => {
  return createSelector(
    state => state.display.selectingNoteId,
    state => state.display.exportNoteAsPdfProgress,
    (__, note) => {
      if (isObject(note)) return note.id;
      return null;
    },
    (selectingNoteId, exportNoteAsPdfProgress, noteId) => {
      if (selectingNoteId !== noteId) return false;
      if (
        !isObject(exportNoteAsPdfProgress) ||
        exportNoteAsPdfProgress.total !== 1 ||
        exportNoteAsPdfProgress.done !== 0
      ) return false;

      return true;
    }
  );
};

export const makeGetLockNoteStatus = () => {
  return createSelector(
    state => state.display.doForceLock,
    state => getNoteFPaths(state),
    state => state.lockSettings.lockedNotes,
    (state, noteIdOrObj) => {
      if (isString(noteIdOrObj)) return getNote(noteIdOrObj, state.notes);
      return noteIdOrObj;
    },
    (doForceLock, noteFPaths, lockedNotes, note) => {
      if (!isObject(note)) return null;

      const { toRootIds } = listNoteMetas(noteFPaths);
      const noteMainId = getMainId(note, toRootIds);

      if (isObject(lockedNotes[noteMainId])) {
        if (isString(lockedNotes[noteMainId].password)) {
          if (doForceLock) return LOCKED;
          if (isNumber(lockedNotes[noteMainId].unlockedDT)) return UNLOCKED;
          return LOCKED;
        }
      }
      return null;
    },
  );
};

export const makeGetDoShowTitle = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => state.lockSettings.lockedNotes,
    (state, noteIdOrObj) => {
      if (isString(noteIdOrObj)) return getNote(noteIdOrObj, state.notes);
      return noteIdOrObj;
    },
    (noteFPaths, lockedNotes, note) => {
      if (!isObject(note)) return false;

      const { toRootIds } = listNoteMetas(noteFPaths);
      const noteMainId = getMainId(note, toRootIds);

      if (isObject(lockedNotes[noteMainId])) {
        if ([true, false].includes(lockedNotes[noteMainId].doShowTitle)) {
          return lockedNotes[noteMainId].doShowTitle;
        }
      }
      return false;
    },
  );
};

export const makeGetLockListStatus = () => {
  return createSelector(
    state => state.display.doForceLock,
    state => state.lockSettings.lockedLists,
    (__, listName) => listName,
    (doForceLock, lockedLists, listName) => {
      return getLockListStatus(doForceLock, lockedLists, listName);
    },
  );
};

export const getCurrentLockListStatus = createSelector(
  state => state.display.doForceLock,
  state => state.lockSettings.lockedLists,
  state => state.display.listName,
  state => state.display.queryString,
  (doForceLock, lockedLists, listName, queryString) => {
    if (queryString) {
      if (doForceLock) return LOCKED;
      return null;
    }
    return getLockListStatus(doForceLock, lockedLists, listName);
  },
);

export const getCanChangeListNames = createSelector(
  state => state.display.doForceLock,
  state => state.lockSettings.lockedLists,
  state => state.display.listName,
  state => state.display.queryString,
  (doForceLock, lockedLists, listName, queryString) => {
    if (queryString) return true;
    if (listName !== MY_NOTES) return true;

    if (isObject(lockedLists[listName])) {
      if (!doForceLock && isNumber(lockedLists[listName].unlockedDT)) return true;
      if ([true, false].includes(lockedLists[listName].canChangeListNames)) {
        return lockedLists[listName].canChangeListNames;
      }
    }
    return true;
  },
);

export const makeGetTagStatus = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => getTagFPaths(state),
    state => state.pendingTags,
    (state, noteIdOrObj) => {
      if (isString(noteIdOrObj)) return getNote(noteIdOrObj, state.notes);
      return noteIdOrObj;
    },
    (noteFPaths, tagFPaths, pendingTags, note) => {
      if (!isObject(note)) return null;

      const { toRootIds } = listNoteMetas(noteFPaths);
      const tags = getTags(tagFPaths, pendingTags, toRootIds);
      const noteMainId = getMainId(note, toRootIds);

      if (noteMainId in tags) {
        if ('status' in tags[noteMainId]) return tags[noteMainId].status;
        return TAGGED;
      }

      return null;
    }
  );
};

export const makeGetTnAndDns = () => {
  return createSelector(
    state => getNoteFPaths(state),
    state => getTagFPaths(state),
    state => state.pendingTags,
    state => state.settings.tagNameMap,
    (state, noteIdOrObj) => {
      if (isString(noteIdOrObj)) return getNote(noteIdOrObj, state.notes);
      return noteIdOrObj;
    },
    (noteFPaths, tagFPaths, pendingTags, tagNameMap, note) => {
      if (!isObject(note)) return [];

      const { toRootIds } = listNoteMetas(noteFPaths);
      const tags = getTags(tagFPaths, pendingTags, toRootIds);
      const noteMainId = getMainId(note, toRootIds);

      if (!isObject(tags[noteMainId])) return [];

      const tnAndDns = [];
      for (const { tagName } of tags[noteMainId].values) {
        const { tagNameObj } = getTagNameObj(tagName, tagNameMap);
        if (!isObject(tagNameObj)) continue;
        tnAndDns.push({
          tagName, displayName: tagNameObj.displayName, color: tagNameObj.color,
        });
      }
      return tnAndDns;
    },
    {
      memoizeOptions: {
        resultEqualityCheck: (x, y) => {
          if (x.length !== y.length) return false;
          for (let i = 0; i < x.length; i++) {
            if (!isEqual(x[i], y[i])) return false;
          }
          return true;
        },
      },
    },
  );
};

export const getTagEditor = createSelector(
  state => getNoteFPaths(state),
  state => getTagFPaths(state),
  state => state.pendingTags,
  state => state.settings.tagNameMap,
  state => getNote(state.display.selectingNoteId, state.notes),
  state => state.tagEditor,
  (noteFPaths, tagFPaths, pendingTags, tagNameMap, note, tagEditor) => {

    const editor = { ...tagEditor };
    if (!editor.didValuesEdit && isObject(note)) {
      const { toRootIds } = listNoteMetas(noteFPaths);
      const tags = getTags(tagFPaths, pendingTags, toRootIds);
      const noteMainId = getMainId(note, toRootIds);

      if (noteMainId in tags) {
        const { values } = tags[noteMainId];

        editor.values = [];
        for (const { tagName } of values) {
          const { tagNameObj } = getTagNameObj(tagName, tagNameMap);
          if (!isObject(tagNameObj)) continue;
          editor.values.push({
            tagName, displayName: tagNameObj.displayName, color: tagNameObj.color,
          });
        }
      }
    }
    if (!editor.didHintsEdit) {
      editor.hints = [];
      for (const tagNameObj of tagNameMap) {
        const { tagName, displayName, color } = tagNameObj;

        const found = editor.values.some(value => value.tagName === tagName);
        editor.hints.push({ tagName, displayName, color, isBlur: found });
      }
    }
    return editor;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: (x, y) => {
        const [xKeys, yKeys] = [Object.keys(x), Object.keys(y)];
        const keys = [...new Set([...xKeys, ...yKeys])];

        for (const key of keys) {
          if (!(key in x) || !(key in y)) return false;
          if (key === 'values') {
            const [xValues, yValues] = [x[key], y[key]];
            if (!Array.isArray(xValues) || !Array.isArray(yValues)) return false;
            if (xValues.length !== yValues.length) return false;
            for (let i = 0; i < xValues.length; i++) {
              if (!isEqual(xValues[i], yValues[i])) return false;
            }
            continue;
          }
          if (x[key] !== y[key]) return false;
        }
        return true;
      },
    },
  },
);

export const makeGetTagNameEditor = () => {
  return createSelector(
    state => state.settings.tagNameMap,
    state => state.tagNameEditors,
    (__, key) => key,
    (tagNameMap, tagNameEditors, key) => {
      const state = { ...initialTagNameEditorState };

      const { tagNameObj } = getTagNameObj(key, tagNameMap);
      if (tagNameObj) state.value = tagNameObj.displayName;

      return { ...state, ...tagNameEditors[key] };
    },
    { memoizeOptions: { resultEqualityCheck: isEqual } },
  );
};
