import { loop, Cmd } from 'redux-loop';

import {
  putDbUnsavedNote, deleteDbUnsavedNotes, deleteAllDbUnsavedNotes,
} from '../actions';
import {
  INIT, UPDATE_UNSAVED_NOTE, DELETE_UNSAVED_NOTES, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK,
  UPDATE_NOTE_COMMIT, DISCARD_NOTE, DELETE_NOTES_COMMIT, CANCEL_DIED_NOTES,
  MERGE_NOTES_COMMIT, DELETE_OLD_NOTES_IN_TRASH_COMMIT, DELETE_ALL_DATA, RESET_STATE,
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
      id, title, body, media, savedTitle, savedBody, savedMedia, hasContent,
    } = action.payload;

    const newState = { ...state };
    newState[id] = { id, title, body, media, savedTitle, savedBody, savedMedia };

    if (hasContent) {
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

  // Need to delete unsaved notes at commit or rollback to rerender in one go.
  const deleteTypes = [
    DELETE_UNSAVED_NOTES, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK, UPDATE_NOTE_COMMIT,
    DISCARD_NOTE, DELETE_NOTES_COMMIT, CANCEL_DIED_NOTES, MERGE_NOTES_COMMIT,
    DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  ];
  if (deleteTypes.includes(action.type)) {
    const { type, payload } = action;

    let ids; // Bug alert: if not succeed, toNote not in fpaths yet.
    if (type === DELETE_UNSAVED_NOTES) ids = payload;
    else if (type === ADD_NOTE_COMMIT || type === ADD_NOTE_ROLLBACK) {
      // Need to delete unsaved note here
      //   as delete when cancel died notes might be too late.
      // The unsaved note with NEW_NOTE might be for other note.

      // Only delete if first add. If retry, already delete in rollback.
      // So if commit or rollback again, don't delete.
      if ('status' in payload.note) ids = [];
      else ids = [NEW_NOTE];
    } else if (type === UPDATE_NOTE_COMMIT) ids = [payload.toNote.id];
    else if (type === DISCARD_NOTE) ids = [payload];
    else if (type === DELETE_NOTES_COMMIT) {
      ids = payload.successNotes.map(note => note.fromNote.id);
    } else if (type === CANCEL_DIED_NOTES) {
      // For update note, can delete unsaved note here instead of UPDATE_NOTE_ROLLBACK
      //   so if reload, died note is gone but unsaved still there.
      ids = payload.deleteUnsavedNoteIds;
    } else if (type === MERGE_NOTES_COMMIT) ids = [payload.toNote.id];
    else if (type === DELETE_OLD_NOTES_IN_TRASH_COMMIT) {
      ids = payload.successNotes.map(note => note.fromNote.id);
    } else {
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
