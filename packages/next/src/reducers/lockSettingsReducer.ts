import { addNextAction } from '../store-next';
import { updateLockSettings } from '../actions';
import {
  INIT, ADD_LOCK_NOTE, REMOVE_LOCK_NOTE, LOCK_NOTE, UNLOCK_NOTE, ADD_LOCK_LIST,
  REMOVE_LOCK_LIST, LOCK_LIST, UNLOCK_LIST, CLEAN_UP_LOCKS, UPDATE_LOCKS_FOR_ACTIVE_APP,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import { initialLockSettingsState as initialState } from '../types/initialStates';

/* {
  lockedNotes: {
    noteMainId: { password, doShowTitle, canExport, unlockedDT },
  },
  lockedLists: {
    listName: { password, canChangeListNames, canExport, unlockedDT },
  },
} */

const lockSettingsReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    const { lockSettings } = action.payload;
    return { ...state, ...lockSettings };
  }

  if (action.type === ADD_LOCK_NOTE) {
    const { noteMainId, password, doShowTitle, canExport } = action.payload;

    const newState = { ...state };
    newState.lockedNotes = {
      ...newState.lockedNotes, [noteMainId]: { password, doShowTitle, canExport },
    };

    addNextAction(updateLockSettings());
    return newState;
  }

  if (action.type === REMOVE_LOCK_NOTE) {
    const { noteMainId } = action.payload;

    const newState = { ...state, lockedNotes: {} };
    for (const k in state.lockedNotes) {
      if (k === noteMainId) continue;
      newState.lockedNotes[k] = state.lockedNotes[k];
    }

    addNextAction(updateLockSettings());
    return newState;
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

    addNextAction(updateLockSettings());
    return newState;
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

    addNextAction(updateLockSettings());
    return newState;
  }

  if (action.type === ADD_LOCK_LIST) {
    const { listName, password, canChangeListNames, canExport } = action.payload;

    const newState = { ...state };
    newState.lockedLists = {
      ...newState.lockedLists, [listName]: { password, canChangeListNames, canExport },
    };

    addNextAction(updateLockSettings());
    return newState;
  }

  if (action.type === REMOVE_LOCK_LIST) {
    const { listName } = action.payload;

    const newState = { ...state, lockedLists: {} };
    for (const k in state.lockedLists) {
      if (k === listName) continue;
      newState.lockedLists[k] = state.lockedLists[k];
    }

    addNextAction(updateLockSettings());
    return newState;
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

    addNextAction(updateLockSettings());
    return newState;
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

    addNextAction(updateLockSettings());
    return newState;
  }

  if (action.type === CLEAN_UP_LOCKS) {
    const { noteMainIds, listNames } = action.payload;

    const newState = { ...state, lockedNotes: {}, lockedLists: {} };
    for (const k in state.lockedNotes) {
      if (noteMainIds.includes(k)) continue;
      newState.lockedNotes[k] = state.lockedNotes[k];
    }
    for (const k in state.lockedLists) {
      if (listNames.includes(k)) continue;
      newState.lockedLists[k] = state.lockedLists[k];
    }

    addNextAction(updateLockSettings());
    return newState;
  }

  if (action.type === UPDATE_LOCKS_FOR_ACTIVE_APP) {
    const { isLong } = action.payload;
    if (!isLong) return state;

    const newState = { ...state, lockedNotes: {}, lockedLists: {} };
    for (const k in state.lockedNotes) {
      const value = {};
      for (const kk in state.lockedNotes[k]) {
        if (kk === 'unlockedDT') continue;
        value[kk] = state.lockedNotes[k][kk];
      }
      newState.lockedNotes[k] = value;
    }
    for (const k in state.lockedLists) {
      const value = {};
      for (const kk in state.lockedLists[k]) {
        if (kk === 'unlockedDT') continue;
        value[kk] = state.lockedLists[k][kk];
      }
      newState.lockedLists[k] = value;
    }

    addNextAction(updateLockSettings());
    return newState;
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = { ...initialState };
    addNextAction(updateLockSettings());
    return newState;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default lockSettingsReducer;
