import { loop, Cmd } from 'redux-loop';

import { putUnsavedNote, deleteUnsavedNotes, deleteAllUnsavedNotes } from '../actions';
import {
  INIT, UPDATE_EDITING_NOTE, DELETE_EDITING_NOTES, ADD_NOTE_COMMIT, UPDATE_NOTE_COMMIT,
  CANCEL_DIED_NOTES, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { NEW_NOTE } from '../types/const';

const initialState = {};

const unsavedNotesReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    const { unsavedNotes } = action.payload;
    return { ...state, ...unsavedNotes };
  }

  if (action.type === UPDATE_EDITING_NOTE) {
    const { id, title, body, media } = action.payload;

    const newState = { ...state };
    newState[id] = { title, body, media };
    return loop(
      newState,
      Cmd.run(
        putUnsavedNote(id, title, body, media), { args: [Cmd.dispatch, Cmd.getState] },
      ),
    );
  }

  if (action.type === DELETE_EDITING_NOTES) {
    const ids = action.payload;

    const newState = {};
    for (const id in state) {
      if (ids.includes(id)) continue;
      newState[id] = { ...state[id] };
    }

    return loop(
      newState,
      Cmd.run(deleteUnsavedNotes(ids), { args: [Cmd.dispatch, Cmd.getState] }),
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
      Cmd.run(deleteUnsavedNotes([NEW_NOTE]), { args: [Cmd.dispatch, Cmd.getState] }),
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
      Cmd.run(deleteUnsavedNotes([fromNote.id]), { args: [Cmd.dispatch, Cmd.getState] }),
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
      Cmd.run(deleteUnsavedNotes(ids), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = { ...initialState };
    return loop(
      newState, Cmd.run(deleteAllUnsavedNotes(), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === RESET_STATE) {
    // Delete in IndexedDB by dataApi.deleteAllLocalFiles.
    return { ...initialState };
  }

  return state;
};

export default unsavedNotesReducer;
