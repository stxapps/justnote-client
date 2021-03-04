import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';

import {
  ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING,
  STATUS,
} from '../types/const';
import { isObject, isArrayEqual, isEqual, doContainListName, isStringIn } from '../utils';
import { _ } from '../utils/obj';

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

    const listNames = Object.keys(state.notes);
    const listNameMap = [...state.settings.listNameMap.filter(listNameObj => {
      return [ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING].includes(listNameObj.status);
    })];

    let i = 1;
    for (const listName of listNames) {
      // Not in listNameMap and also deleting list name in state.settings.listNameMap.
      if (!doContainListName(listName, state.settings.listNameMap)) {
        listNameMap.push({ listName: listName, displayName: `<missing-name-${i}>` });
        i += 1;
      }
    }

    return listNameMap;
  }
);

/** @return {function(any, any): any} */
export const makeIsNoteIdSelected = () => {
  return createSelector(
    state => state.display.selectedNoteIds,
    (_, noteId) => noteId,
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
  const doDescendingOrder = state.settings.doDescendingOrder;

  if (!notes || !notes[listName]) return null;

  const selectedNotes = _.select(notes[listName], STATUS, [ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING]);
  const sortedNotes = Object.values(selectedNotes).sort((a, b) => {
    return a.addedDT - b.addedDT;
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
  const doDescendingOrder = state.settings.doDescendingOrder;

  if (!conflictedNotes || !conflictedNotes[listName]) return null;

  const sortedNotes = Object.values(conflictedNotes[listName]).sort((a, b) => {
    return a.addedDT - b.addedDT;
  });
  if (doDescendingOrder) sortedNotes.reverse();

  return conflictedNotes[listName];
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
