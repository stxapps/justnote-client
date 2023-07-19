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
    listName: { password, canChangeListNames, unlockedDT },
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
        const value = {};
        for (const kk in state.lockedNotes[k]) {
          if (kk === 'unlockedDT') continue;
          value[kk] = state.lockedNotes[k][kk];
        }
        newState.lockedNotes[k] = value;
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
    const { listName, password, canChangeListNames } = action.payload;

    const newState = { ...state };
    newState.lockedLists = {
      ...newState.lockedLists, [listName]: { password, canChangeListNames },
    };

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === REMOVE_LOCK_LIST) {
    const { listName } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (k === listName) continue;
      newState.lockedLists[k] = state.lockedLists[k];
    }

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === LOCK_LIST) {
    const { listName } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (k === listName) {
        const value = {};
        for (const kk in state.lockedLists[k]) {
          if (kk === 'unlockedDT') continue;
          value[kk] = state.lockedLists[k][kk];
        }
        newState.lockedLists[k] = value;
        continue;
      }
      newState.lockedLists[k] = state.lockedLists[k];
    }

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UNLOCK_LIST) {
    const { listName, unlockedDT } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (k === listName) {
        newState.lockedLists[k] = { ...state.lockedLists[k], unlockedDT };
        continue;
      }
      newState.lockedLists[k] = state.lockedLists[k];
    }

    return loop(
      newState, Cmd.run(updateLockSettings(), { args: [Cmd.dispatch, Cmd.getState] })
    );
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
