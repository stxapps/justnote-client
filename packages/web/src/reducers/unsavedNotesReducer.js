import { loop, Cmd } from 'redux-loop';

import {
  putDbUnsavedNote, deleteDbUnsavedNotes, deleteAllDbUnsavedNotes,
} from '../actions';
import {
  INIT, UPDATE_UNSAVED_NOTE, DELETE_UNSAVED_NOTES, ADD_NOTE_COMMIT, UPDATE_NOTE_COMMIT,
  CANCEL_DIED_NOTES, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { NEW_NOTE } from '../types/const';

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

  if (action.type === DELETE_UNSAVED_NOTES) {
    const ids = action.payload;

    const newState = {};
    for (const id in state) {
      if (ids.includes(id)) continue;
      newState[id] = { ...state[id] };
    }

    return loop(
      newState,
      Cmd.run(deleteDbUnsavedNotes(ids), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === ADD_NOTE_COMMIT) {
    const newState = {};
    for (const id in state) {
      if (id === NEW_NOTE) continue;
      newState[id] = { ...state[id] };
    }

    return loop(
      newState,
      Cmd.run(deleteDbUnsavedNotes([NEW_NOTE]), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === UPDATE_NOTE_COMMIT) {
    const { fromNote } = action.payload;

    const newState = {};
    for (const id in state) {
      if (id === fromNote.id) continue;
      newState[id] = { ...state[id] };
    }

    return loop(
      newState,
      Cmd.run(
        deleteDbUnsavedNotes([fromNote.id]), { args: [Cmd.dispatch, Cmd.getState] },
      ),
    );
  }

  if (action.type === CANCEL_DIED_NOTES) {
    const { ids } = action.payload;

    const newState = {};
    for (const id in state) {
      if (ids.includes(id)) continue;
      newState[id] = { ...state[id] };
    }

    return loop(
      newState,
      Cmd.run(deleteDbUnsavedNotes(ids), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = { ...initialState };
    return loop(
      newState,
      Cmd.run(deleteAllDbUnsavedNotes(), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === RESET_STATE) {
    // Delete in IndexedDB by dataApi.deleteAllLocalFiles.
    return { ...initialState };
  }

  return state;
};

export default unsavedNotesReducer;
