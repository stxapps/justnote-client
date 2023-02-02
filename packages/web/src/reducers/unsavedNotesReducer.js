import { loop, Cmd } from 'redux-loop';

import {
  putDbUnsavedNote, deleteDbUnsavedNotes, deleteAllDbUnsavedNotes,
} from '../actions';
import {
  INIT, UPDATE_UNSAVED_NOTE, DELETE_UNSAVED_NOTES, ADD_NOTE_COMMIT, UPDATE_NOTE_COMMIT,
  DISCARD_NOTE, DELETE_NOTES_COMMIT, CANCEL_DIED_NOTES, MERGE_NOTES_COMMIT,
  DELETE_OLD_NOTES_IN_TRASH_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { NEW_NOTE } from '../types/const';
import { getIdsAndParentIds } from '../utils';
import { getCachedFPaths } from '../vars';

const initialState = {};

const unsavedNotesReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    const { unsavedNotes } = action.payload;
    return { ...state, ...unsavedNotes };
  }

  if (action.type === UPDATE_UNSAVED_NOTE) {
    let {
      id, title, body, media, savedTitle, savedBody, savedMedia, hasContent, didUpdate,
    } = action.payload;

    const newState = { ...state };
    newState[id] = { id, title, body, media, savedTitle, savedBody, savedMedia };

    if (hasContent) {
      if (didUpdate) [savedTitle, savedBody, savedMedia] = [null, null, null];
      return loop(
        newState,
        Cmd.run(
          putDbUnsavedNote(id, title, body, media, savedTitle, savedBody, savedMedia),
          { args: [Cmd.dispatch, Cmd.getState] },
        ),
      );
    }
    return newState;
  }

  const deleteTypes = [
    DELETE_UNSAVED_NOTES, ADD_NOTE_COMMIT, UPDATE_NOTE_COMMIT, DISCARD_NOTE,
    DELETE_NOTES_COMMIT, CANCEL_DIED_NOTES, MERGE_NOTES_COMMIT,
    DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  ];
  if (deleteTypes.includes(action.type)) {
    const { type, payload } = action;

    let ids;
    if (type === deleteTypes[0]) ids = payload;
    else if (type === deleteTypes[1]) ids = [NEW_NOTE];
    else if (type === deleteTypes[2]) ids = [payload.toNote.id];
    else if (type === deleteTypes[3]) ids = [payload];
    else if (type === deleteTypes[4]) ids = payload.ids;
    else if (type === deleteTypes[5]) ids = payload.ids;
    else if (type === deleteTypes[6]) ids = [payload.toNote.id];
    else if (type === deleteTypes[7]) ids = payload.ids;
    else {
      console.log('In unsavedNotesReducer, invalid delete action:', action);
      return state;
    }

    const idsAndParentIds = getIdsAndParentIds(ids, getCachedFPaths());

    const newState = {};
    for (const id in state) {
      if (idsAndParentIds.includes(id)) continue;
      newState[id] = { ...state[id] };
    }

    return loop(
      newState,
      Cmd.run(
        deleteDbUnsavedNotes(idsAndParentIds), { args: [Cmd.dispatch, Cmd.getState] }
      ),
    );
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = { ...initialState };
    return loop(
      newState,
      Cmd.run(deleteAllDbUnsavedNotes(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === RESET_STATE) {
    // Delete in IndexedDB by dataApi.deleteAllLocalFiles.
    return { ...initialState };
  }

  return state;
};

export default unsavedNotesReducer;
