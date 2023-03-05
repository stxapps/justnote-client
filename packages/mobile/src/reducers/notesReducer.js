import { loop, Cmd } from 'redux-loop';

import {
  tryUpdateFetchedMore, runAfterFetchTask, unpinNotes, tryUpdateSynced,
} from '../actions';
import {
  FETCH_COMMIT, FETCH_MORE_COMMIT, UPDATE_FETCHED_MORE, ADD_NOTE, ADD_NOTE_COMMIT,
  ADD_NOTE_ROLLBACK, UPDATE_NOTE, UPDATE_NOTE_COMMIT, UPDATE_NOTE_ROLLBACK,
  MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK, DELETE_NOTES, DELETE_NOTES_COMMIT,
  DELETE_NOTES_ROLLBACK, CANCEL_DIED_NOTES, DELETE_OLD_NOTES_IN_TRASH_COMMIT,
  MERGE_NOTES_COMMIT, UPDATE_SETTINGS, CANCEL_DIED_SETTINGS, MERGE_SETTINGS_COMMIT,
  SYNC_COMMIT, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import {
  MY_NOTES, TRASH, ARCHIVE, ID, STATUS, ADDED, ADDING, DIED_ADDING,
  UPDATING, DIED_UPDATING, MOVING, DIED_MOVING, DELETING, DIED_DELETING,
} from '../types/const';
import { isEqual, getAllListNames } from '../utils';
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
    const { listNames, doFetchStgsAndInfo, settings } = action.payload;

    const newState = {};
    if (doFetchStgsAndInfo) {
      if (settings) {
        for (const k of getAllListNames(settings.listNameMap)) {
          newState[k] = state[k] || null;
        }
      } else {
        for (const k of [MY_NOTES, TRASH, ARCHIVE]) newState[k] = state[k];
      }
    } else {
      for (const k in state) newState[k] = state[k];
    }

    for (const name of listNames) {
      if (!(name in newState)) newState[name] = null;
    }
    for (const name of [MY_NOTES, TRASH, ARCHIVE]) { // In case of invalid settings.
      if (!(name in newState)) newState[name] = null;
    }

    const { listName, notes } = action.payload;
    if (listName in newState) {
      const processingNotes = _.exclude(state[listName], STATUS, ADDED);
      const fetchedNotes = toObjAndAddAttrs(notes, ADDED);
      newState[listName] = { ...processingNotes, ...fetchedNotes };
    }

    return loop(
      newState,
      Cmd.run(runAfterFetchTask(), { args: [Cmd.dispatch, Cmd.getState] }),
    );
  }

  if (action.type === FETCH_MORE_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateFetchedMore(action.payload),
        { args: [Cmd.dispatch, Cmd.getState] })
    );
  }

  if (action.type === UPDATE_FETCHED_MORE) {
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
      ...newState[listName], ...toObjAndAddAttrs([{ ...toNote, fromNote }], UPDATING),
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

    if ([ARCHIVE, TRASH].includes(toListName)) {
      const { fromNotes } = action.payload;
      const ids = fromNotes.map(note => note.id);
      return loop(
        newState, Cmd.run(unpinNotes(ids), { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
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
      if (status === DIED_ADDING) {
        continue;
      } else if (status === DIED_UPDATING) {
        const fromNote = state[listName][id].fromNote;
        newState[listName][fromNote.id] = { ...fromNote, status: ADDED };
      } else if (status === DIED_MOVING) {
        const fromListName = state[listName][id].fromListName;
        const fromNote = state[listName][id].fromNote;
        newState[fromListName][fromNote.id] = { ...fromNote, status: ADDED };
      } else if (status === DIED_DELETING) {
        newState[listName][id] = { ...state[listName][id], status: ADDED };
      } else {
        throw new Error(`Invalid status: ${status} of note id: ${id}`);
      }
    }

    return newState;
  }

  if (action.type === DELETE_OLD_NOTES_IN_TRASH_COMMIT) {
    const { listName, ids } = action.payload;

    let newState = state;
    if (state[listName]) {
      newState = { ...state };
      newState[listName] = _.exclude(state[listName], ID, ids);
    }

    return newState;
  }

  if (action.type === MERGE_NOTES_COMMIT) {
    const { toListName, toNote } = action.payload;

    const newState = { ...state };
    newState[toListName] = {
      ...newState[toListName], ...toObjAndAddAttrs([toNote], ADDED),
    };

    return newState;
  }

  if (
    action.type === UPDATE_SETTINGS ||
    action.type === CANCEL_DIED_SETTINGS ||
    action.type === MERGE_SETTINGS_COMMIT
  ) {
    const { settings } = action.payload;

    const listNames = getAllListNames(settings.listNameMap);
    if (action.type === CANCEL_DIED_SETTINGS || action.type === MERGE_SETTINGS_COMMIT) {
      listNames.push(...action.payload.listNames);
    }

    const newState = {};
    for (const listName in state) {
      if (!listNames.includes(listName)) {
        if (
          state[listName] === undefined ||
          state[listName] === null ||
          isEqual(state[listName], {})
        ) continue;

        console.log(`notes: ${listName} should be undefined, null, or an empty object.`);
      }
      newState[listName] = state[listName];
    }

    for (const name of listNames) {
      if (!(name in newState)) newState[name] = null;
    }
    for (const name of [MY_NOTES, TRASH, ARCHIVE]) { // Just to be safe.
      if (!(name in newState)) newState[name] = null;
    }

    return newState;
  }

  if (action.type === SYNC_COMMIT) {
    const { updateAction, haveUpdate, haveNewSync } = action.payload;

    if (haveNewSync) return state;
    return loop(
      state,
      Cmd.run(
        tryUpdateSynced(updateAction, haveUpdate), { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
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
