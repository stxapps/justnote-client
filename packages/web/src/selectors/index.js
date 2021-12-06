import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import {
  ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING,
  DIED_DELETING, STATUS,
} from '../types/const';
import { isObject, isArrayEqual, isEqual, isStringIn } from '../utils';
import { _ } from '../utils/obj';
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

  if (!notes || !notes[listName]) return null;

  const selectedNotes = _.select(notes[listName], STATUS, [ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING]);
  const sortedNotes = Object.values(selectedNotes).sort((a, b) => {
    return a[sortOn] - b[sortOn];
  });
  if (doDescendingOrder) sortedNotes.reverse();

  if (searchString === '') {
    return sortedNotes;
  }

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
    if (!notes) return null;

    const conflictedNotes = _getConflictedNotes(state);
    if (conflictedNotes) return [...conflictedNotes, ...notes];

    return notes;
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
