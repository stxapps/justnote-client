import { loop, Cmd } from 'redux-loop';

import {
  tryUpdateFetched, tryUpdateFetchedMore, runAfterFetchTask, unpinNotes, tryUpdateSynced,
} from '../actions';
import {
  FETCH, FETCH_COMMIT, UPDATE_FETCHED, FETCH_MORE_COMMIT, UPDATE_FETCHED_MORE, ADD_NOTE,
  ADD_NOTE_COMMIT, ADD_NOTE_ROLLBACK, UPDATE_NOTE, UPDATE_NOTE_COMMIT,
  UPDATE_NOTE_ROLLBACK, MOVE_NOTES, MOVE_NOTES_COMMIT, MOVE_NOTES_ROLLBACK,
  DELETE_NOTES, DELETE_NOTES_COMMIT, DELETE_NOTES_ROLLBACK, CANCEL_DIED_NOTES,
  DELETE_OLD_NOTES_IN_TRASH_COMMIT, MERGE_NOTES_COMMIT, SYNC_COMMIT, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import {
  TRASH, ARCHIVE, ID, STATUS, ADDED, ADDING, DIED_ADDING, UPDATING, DIED_UPDATING,
  MOVING, DIED_MOVING, DELETING, DIED_DELETING,
} from '../types/const';
import { isObject, getArraysPerKey } from '../utils';
import { _ } from '../utils/obj';
import vars from '../vars';

const initialState = {};

const toObjAndAddAttrs = (notes, status) => {
  let obj = _.mapKeys(notes, ID);
  obj = _.update(obj, null, null, STATUS, status);
  return obj;
};

const notesReducer = (state = initialState, action) => {

  if (action.type === FETCH) {
    const { lnOrQt } = action.payload;
    vars.notesReducer.interveningNoteIds[lnOrQt] = [];
    return state;
  }

  if (action.type === FETCH_COMMIT) {
    return loop(
      state,
      Cmd.run(
        tryUpdateFetched(action.payload),
        { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === UPDATE_FETCHED) {
    const { lnOrQt, notes, keepIds } = action.payload;

    const newState = { ...state };
    if (isObject(notes)) {
      for (const listName in notes) {
        // Adding/moving fpaths are not there when start fetching.
        //   F FC A AC, A AC F FC -> Fine
        //   F A FC AC, A F FC AC -> Processing
        //   F A AC FC, A F AC FC -> Intervening
        const processingNotes = _.exclude(state[listName], STATUS, ADDED);
        const interveningNotes = _.select(
          state[listName], ID, vars.notesReducer.interveningNoteIds[listName]
        );
        const fetchedNotes = _.update(notes[listName], null, null, STATUS, ADDED);

        if (lnOrQt === listName) {
          newState[listName] = {
            ...fetchedNotes, ...interveningNotes, ...processingNotes,
          };
        } else {
          newState[listName] = {
            ...state[listName], ...fetchedNotes, ...interveningNotes, ...processingNotes,
          };
        }
      }
    }
    if (Array.isArray(keepIds)) {
      for (const listName in state) {
        if (lnOrQt !== listName) continue;

        newState[listName] = {};
        for (const id in state[listName]) {
          if (!keepIds.includes(id)) continue;
          newState[listName][id] = { ...state[listName][id] };
        }

        const processingNotes = _.exclude(state[listName], STATUS, ADDED);
        const interveningNotes = _.select(
          state[listName], ID, vars.notesReducer.interveningNoteIds[listName]
        );
        newState[listName] = {
          ...newState[listName], ...interveningNotes, ...processingNotes,
        };
      }
    }

    vars.notesReducer.interveningNoteIds[lnOrQt] = null;

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
    const { lnOrQt, notes, keepIds } = action.payload;

    const newState = { ...state };
    if (isObject(notes)) {
      for (const listName in notes) {
        const processingNotes = _.exclude(state[listName], STATUS, ADDED);
        const fetchedNotes = _.update(notes[listName], null, null, STATUS, ADDED);

        newState[listName] = { ...state[listName], ...fetchedNotes, ...processingNotes };
      }
    }
    if (Array.isArray(keepIds)) {
      for (const listName in state) {
        if (lnOrQt !== listName) continue;

        newState[listName] = {};
        for (const id in state[listName]) {
          if (!keepIds.includes(id)) continue;
          newState[listName][id] = { ...state[listName][id] };
        }

        const processingNotes = _.exclude(state[listName], STATUS, ADDED);
        newState[listName] = { ...newState[listName], ...processingNotes };
      }
    }

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

    if (Array.isArray(vars.notesReducer.interveningNoteIds[listName])) {
      vars.notesReducer.interveningNoteIds[listName].push(note.id);
    }

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
      ...newState[listName], ...toObjAndAddAttrs([toNote], UPDATING),
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
    const { fromListNames, fromNotes, toListNames, toNotes } = action.payload;

    const fromNotesPerLn = getArraysPerKey(fromListNames, fromNotes);
    const toNotesPerLn = getArraysPerKey(toListNames, toNotes);

    const newState = { ...state };
    for (const [listName, lnNotes] of Object.entries(fromNotesPerLn)) {
      newState[listName] = _.exclude(
        newState[listName], ID, _.extract(lnNotes, ID)
      );
    }
    for (const [listName, lnNotes] of Object.entries(toNotesPerLn)) {
      newState[listName] = {
        ...newState[listName], ...toObjAndAddAttrs(lnNotes, MOVING),
      };
    }

    return newState;
  }

  if (action.type === MOVE_NOTES_COMMIT) {
    const {
      successListNames, successNotes, errorListNames, errorNotes,
    } = action.payload;

    const successNotesPerLn = getArraysPerKey(successListNames, successNotes);
    const errorNotesPerLn = getArraysPerKey(errorListNames, errorNotes);

    const toUnpinIds = [];

    const newState = { ...state };
    for (const [listName, lnNotes] of Object.entries(successNotesPerLn)) {
      const lnIds = _.extract(lnNotes, ID);
      newState[listName] = _.update(newState[listName], ID, lnIds, STATUS, ADDED);

      if (Array.isArray(vars.notesReducer.interveningNoteIds[listName])) {
        vars.notesReducer.interveningNoteIds[listName].push(...lnIds);
      }

      if ([ARCHIVE, TRASH].includes(listName)) {
        const ids = lnNotes.map(note => note.fromNote.id);
        toUnpinIds.push(...ids);
      }
    }
    for (const [listName, lnNotes] of Object.entries(errorNotesPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, _.extract(lnNotes, ID), STATUS, DIED_MOVING
      );
    }

    if (toUnpinIds.length > 0) {
      return loop(
        newState,
        Cmd.run(unpinNotes(toUnpinIds), { args: [Cmd.dispatch, Cmd.getState] })
      );
    }
    return newState;
  }

  if (action.type === MOVE_NOTES_ROLLBACK) {
    const { toListNames, toNotes } = action.payload;

    const toNotesPerLn = getArraysPerKey(toListNames, toNotes);

    const newState = { ...state };
    for (const [listName, lnNotes] of Object.entries(toNotesPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, _.extract(lnNotes, ID), STATUS, DIED_MOVING
      );
    }

    return newState;
  }

  if (action.type === DELETE_NOTES) {
    const { fromListNames, fromNotes } = action.payload;

    const fromNotesPerLn = getArraysPerKey(fromListNames, fromNotes);

    const newState = { ...state };
    for (const [listName, lnNotes] of Object.entries(fromNotesPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, _.extract(lnNotes, ID), STATUS, DELETING
      );
    }

    return newState;
  }

  if (action.type === DELETE_NOTES_COMMIT) {
    const {
      successListNames, successNotes, errorListNames, errorNotes,
    } = action.payload;

    const successNotesPerLn = getArraysPerKey(successListNames, successNotes);
    const errorNotesPerLn = getArraysPerKey(errorListNames, errorNotes);

    const newState = { ...state };
    for (const [listName, lnNotes] of Object.entries(successNotesPerLn)) {
      const fromIds = lnNotes.map(note => note.fromNote.id);
      newState[listName] = _.exclude(newState[listName], ID, fromIds);
    }
    for (const [listName, lnNotes] of Object.entries(errorNotesPerLn)) {
      const fromIds = lnNotes.map(note => note.fromNote.id);
      newState[listName] = _.update(
        newState[listName], ID, fromIds, STATUS, DIED_DELETING
      );
    }

    return newState;
  }

  if (action.type === DELETE_NOTES_ROLLBACK) {
    const { fromListNames, fromNotes } = action.payload;

    const fromNotesPerLn = getArraysPerKey(fromListNames, fromNotes);

    const newState = { ...state };
    for (const [listName, lnNotes] of Object.entries(fromNotesPerLn)) {
      newState[listName] = _.update(
        newState[listName], ID, _.extract(lnNotes, ID), STATUS, DIED_DELETING
      );
    }

    return newState;
  }

  if (action.type === CANCEL_DIED_NOTES) {
    const { listNames, ids } = action.payload;

    const idsPerLn = getArraysPerKey(listNames, ids);

    const newState = { ...state };
    for (const [listName, lnIds] of Object.entries(idsPerLn)) {
      newState[listName] = _.exclude(state[listName], ID, lnIds);
    }

    for (let i = 0; i < listNames.length; i++) {
      const [listName, id] = [listNames[i], ids[i]];

      // DIED_ADDING -> remove this note
      // DIED_UPDATING -> remove this note and add back fromNote
      // DIED_MOVING -> remove this note and add back fromNote
      // DIED_DELETING -> just set status to ADDED
      if (!isObject(state[listName][id])) continue;

      const { status } = state[listName][id];
      if (status === DIED_ADDING) {
        continue;
      } else if (status === DIED_UPDATING) {
        const { fromNote } = state[listName][id];
        newState[listName][fromNote.id] = { ...fromNote, status: ADDED };
      } else if (status === DIED_MOVING) {
        const { fromListName, fromNote } = state[listName][id];
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
    const { successListNames, successNotes } = action.payload;

    const successNotesPerLn = getArraysPerKey(successListNames, successNotes);

    const newState = { ...state };
    for (const [listName, lnNotes] of Object.entries(successNotesPerLn)) {
      const fromIds = lnNotes.map(note => note.fromNote.id);
      newState[listName] = _.exclude(newState[listName], ID, fromIds);
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

  if (action.type === SYNC_COMMIT) {
    const { updateAction, haveUpdate } = action.payload;
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
