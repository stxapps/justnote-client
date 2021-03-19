import { loop, Cmd } from 'redux-loop';

import { deleteOldNotesInTrash } from '../actions';
import {
  FETCH_COMMIT, FETCH_MORE_COMMIT, ADD_NOTE, ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK,
  UPDATE_NOTE, UPDATE_NOTE_COMMIT, UPDATE_NOTE_ROLLBACK,
  MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK,
  DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK,
  CANCEL_DIED_NOTES, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  MERGE_NOTES_COMMIT,
  ADD_LIST_NAMES_COMMIT, DELETE_LIST_NAMES_COMMIT,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  MY_NOTES, TRASH, ARCHIVE, ID, STATUS, ADDED, ADDING, DIED_ADDING,
  UPDATING, DIED_UPDATING, MOVING, DIED_MOVING, DELETING, DIED_DELETING,
} from '../types/const';
import { isEqual } from '../utils';
import { _ } from '../utils/obj';

const initialState = {
  [MY_NOTES]: null,
  [TRASH]: null,
  [ARCHIVE]: null,
};

const toObjAndAddAttrs = (notes, status) => {
  let obj = _.mapKeys(notes, ID);
  obj = _.update(obj, null, null, [STATUS], [status]);
  return obj;
};

const notesReducer = (state = initialState, action) => {

  if (action.type === FETCH_COMMIT) {
    const { listNames, doFetchSettings, settings } = action.payload;

    const newState = {};
    if (doFetchSettings) {
      if (settings) {
        for (const k of settings.listNameMap.map(obj => obj.listName)) {
          newState[k] = state[k] || null;
        }
      } else {
        for (const k of [MY_NOTES, TRASH, ARCHIVE]) newState[k] = state[k];
      }
    } else {
      for (const k in state) newState[k] = state[k];
    }

    for (const name of listNames) {
      if (!(name in newState)) {
        newState[name] = null;
      }
    }

    const { listName, notes, doDeleteOldNotesInTrash } = action.payload;
    if (listName in newState) newState[listName] = toObjAndAddAttrs(notes, ADDED);

    return loop(
      newState,
      Cmd.run(
        deleteOldNotesInTrash(doDeleteOldNotesInTrash),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === FETCH_MORE_COMMIT) {
    const { listName, notes } = action.payload;

    const newState = { ...state };
    newState[listName] = { ...newState[listName], ...toObjAndAddAttrs(notes, ADDED) };

    return newState;
  }

  if (action.type === ADD_NOTE) {
    const { listName, note } = action.payload;

    const newState = { ...state };
    newState[listName] = { ...newState[listName], ...toObjAndAddAttrs([note], ADDING) };

    return newState;
  }

  if (action.type === ADD_NOTE_COMMIT) {
    const { listName, note } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(newState[listName], ID, note.id, STATUS, ADDED);

    return newState;
  }

  if (action.type === ADD_NOTE_ROLLBACK) {
    const { listName, note } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(newState[listName], ID, note.id, STATUS, DIED_ADDING);

    return newState;
  }

  if (action.type === UPDATE_NOTE) {
    const { listName, fromNote, toNote } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(newState[listName], ID, fromNote.id);
    newState[listName] = {
      ...newState[listName], ...toObjAndAddAttrs([{ ...toNote, fromNote }], UPDATING)
    };

    return newState;
  }

  if (action.type === UPDATE_NOTE_COMMIT) {
    const { listName, toNote } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(newState[listName], ID, toNote.id, STATUS, ADDED);

    return newState;
  }

  if (action.type === UPDATE_NOTE_ROLLBACK) {
    const { listName, toNote } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(
      newState[listName], ID, toNote.id, STATUS, DIED_UPDATING
    );

    return newState;
  }

  if (action.type === MOVE_NOTES) {
    const { fromListName, fromNotes, toListName, toNotes } = action.payload;

    for (let i = 0; i < fromNotes.length; i++) {
      toNotes[i] = { ...toNotes[i], fromListName, fromNote: fromNotes[i] };
    }

    const newState = { ...state };
    newState[fromListName] = _.exclude(
      newState[fromListName], ID, _.extract(fromNotes, ID)
    );
    newState[toListName] = {
      ...newState[toListName], ...toObjAndAddAttrs(toNotes, MOVING),
    };

    return newState;
  }

  if (action.type === MOVE_NOTES_COMMIT) {
    const { toListName, toNotes } = action.payload;

    const newState = { ...state };
    newState[toListName] = _.update(
      newState[toListName], ID, _.extract(toNotes, ID), STATUS, ADDED
    );

    return newState;
  }

  if (action.type === MOVE_NOTES_ROLLBACK) {
    const { toListName, toNotes } = action.payload;

    const newState = { ...state };
    newState[toListName] = _.update(
      newState[toListName], ID, _.extract(toNotes, ID), STATUS, DIED_MOVING
    );

    return newState;
  }

  if (action.type === DELETE_NOTES) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(newState[listName], ID, ids, STATUS, DELETING);

    return newState;
  }

  if (action.type === DELETE_NOTES_COMMIT) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(newState[listName], ID, ids);

    return newState;
  }

  if (action.type === DELETE_NOTES_ROLLBACK) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.update(newState[listName], ID, ids, STATUS, DIED_DELETING);

    return newState;
  }

  if (action.type === CANCEL_DIED_NOTES) {
    const { listName, ids } = action.payload;

    const newState = { ...state };
    newState[listName] = _.exclude(state[listName], ID, ids);

    for (const id of ids) {
      // DIED_ADDING -> remove this note
      // DIED_UPDATING -> remove this note and add back fromNote
      // DIED_MOVING -> remove this note and add back fromNote
      // DIED_DELETING -> just set status to ADDED
      const status = state[listName][id].status;
      if ([DIED_ADDING].includes(status)) {
        continue;
      } else if ([DIED_UPDATING, DIED_MOVING].includes(status)) {
        const fromNote = state[listName][id].fromNote;
        newState[listName][fromNote.id] = { ...fromNote, status: ADDED };
      } else if ([DIED_DELETING].includes(status)) {
        newState[listName][id] = { ...state[listName][id], status: ADDED };
      } else {
        throw new Error(`Invalid status: ${status} of note id: ${id}`);
      }
    }

    return newState;
  }

  if (action.type === DELETE_OLD_NOTES_IN_TRASH_COMMIT) {
    const { listName, ids } = action.payload;

    if (!state[listName]) return state;

    const newState = { ...state };
    newState[listName] = _.exclude(state[listName], ID, ids);

    return newState;
  }

  if (action.type === MERGE_NOTES_COMMIT) {
    const { toListName, toNote } = action.payload;

    const newState = { ...state };
    newState[toListName] = {
      ...newState[toListName], ...toObjAndAddAttrs([toNote], ADDED)
    };

    return newState;
  }

  if (action.type === ADD_LIST_NAMES_COMMIT) {
    const { listNameObjs } = action.payload;

    const newState = { ...state };
    for (const k of listNameObjs.map(obj => obj.listName)) {
      newState[k] = state[k] || null;
    }

    return newState;
  }

  if (action.type === DELETE_LIST_NAMES_COMMIT) {
    const { listNames } = action.payload;

    const newState = {};
    for (const listName in state) {
      if (listNames.includes(listName)) {
        if (
          state[listName] !== undefined &&
          state[listName] !== null &&
          !isEqual(state[listName], {})
        ) {
          throw new Error(`notes: ${listName} should be undefined, null, or an empty object.`);
        }
        continue;
      }
      newState[listName] = state[listName];
    }

    return newState;
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = {};
    for (const k in initialState) {
      if (initialState.hasOwnProperty(k)) {
        newState[k] = {};
      }
    }
    return newState;
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default notesReducer;
