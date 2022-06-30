import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import { PINNED } from '../types/const';
import {
  isStringIn, isObject, isArrayEqual, isEqual,
  getMainId, getValidProduct as _getValidProduct, getValidPurchase as _getValidPurchase,
  listNoteIds, getSortedNotes, sortWithPins, getNoteFPaths, getPinFPaths, getPins,
  doEnableExtraFeatures,
} from '../utils';
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
    return getMainId(note.id);
  });

  if (searchString === '') return sortedNotes;

  const searchNotes = sortedNotes.filter(note => {
    return isStringIn(note, searchString);
  });

  return searchNotes;
};

export const _getConflictedNotes = (state) => {

  const notes = state.conflictedNotes;
  const listName = state.display.listName;
  const sortOn = state.settings.sortOn;
  const doDescendingOrder = state.settings.doDescendingOrder;

  let sortedNotes = getSortedNotes(notes, listName, sortOn, doDescendingOrder);
  if (!sortedNotes) return null;

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

/** @return {function(any, any): initialListNameEditorState} */
export const makeGetListNameEditor = () => {
  return createSelector(
    state => state.listNameEditors,
    (__, key) => key,
    (listNameEditors, key) => {
      return { ...initialListNameEditorState, ...listNameEditors[key] };
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
    state => getPinFPaths(state),
    state => state.pendingPins,
    (__, note) => note ? note.id : null,
    (pinFPaths, pendingPins, noteId) => {

      if (!noteId) return null;

      const pins = getPins(pinFPaths, pendingPins, false);
      const noteMainId = getMainId(noteId);
      if (noteMainId in pins) {
        if ('status' in pins[noteMainId]) return pins[noteMainId].status;
        return PINNED;
      }

      return null;
    }
  );
};
