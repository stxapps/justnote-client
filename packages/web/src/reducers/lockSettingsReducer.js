import { loop, Cmd } from 'redux-loop';

import { updateLockSettings } from '../actions';
import {
  INIT, ADD_LOCK_NOTE, REMOVE_LOCK_NOTE, LOCK_NOTE, UNLOCK_NOTE, DELETE_ALL_DATA,
  ADD_LOCK_LIST, REMOVE_LOCK_LIST, LOCK_LIST, UNLOCK_LIST, RESET_STATE,
} from '../types/actionTypes';
import { initialLockSettingsState as initialState } from '../types/initialStates';

/* {
  lockedNotes: {
    noteMainId: { password, doShowTitle, unlockedDT },
  },
  lockedLists: {
    listName: { password, doAllowChangeListName, unlockedDT },
  },
} */

const lockSettingsReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    const { lockSettings } = action.payload;
    return { ...state, ...lockSettings };
  }

  if (action.type === ADD_LOCK_NOTE) {
    const { noteMainId, password, doShowTitle } = action.payload;

    const newState = { ...state };
    newState.lockedNotes = {
      ...newState.lockedNotes, [noteMainId]: { password, doShowTitle },
    };

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === REMOVE_LOCK_NOTE) {
    const { noteMainId } = action.payload;

    const newState = { ...state, lockedNotes: {} };
    for (const k in state.lockedNotes) {
      if (k === noteMainId) continue;
      newState.lockedNotes[k] = state.lockedNotes[k];
    }

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === LOCK_NOTE) {
    const { noteMainId } = action.payload;

    const newState = { ...state, lockedNotes: {} };
    for (const k in state.lockedNotes) {
      if (k === noteMainId) {
        newState.lockedNotes[k] = { ...state.lockedNotes[k], unlockedDT: null };
        continue;
      }
      newState.lockedNotes[k] = state.lockedNotes[k];
    }

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UNLOCK_NOTE) {
    const { noteMainId, unlockedDT } = action.payload;

    const newState = { ...state, lockedNotes: {} };
    for (const k in state.lockedNotes) {
      if (k === noteMainId) {
        newState.lockedNotes[k] = { ...state.lockedNotes[k], unlockedDT };
        continue;
      }
      newState.lockedNotes[k] = state.lockedNotes[k];
    }

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === ADD_LOCK_LIST) {

  }

  if (action.type === REMOVE_LOCK_LIST) {

  }

  if (action.type === LOCK_LIST) {

  }

  if (action.type === UNLOCK_LIST) {

  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = { ...initialState };
    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default lockSettingsReducer;
