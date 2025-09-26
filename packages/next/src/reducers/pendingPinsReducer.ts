import { addNextAction } from '../store-next';
import { cleanUpPins } from '../importWrapper';
import {
  PIN_NOTE, PIN_NOTE_COMMIT, PIN_NOTE_ROLLBACK, UNPIN_NOTE, UNPIN_NOTE_COMMIT,
  UNPIN_NOTE_ROLLBACK, MOVE_PINNED_NOTE, MOVE_PINNED_NOTE_COMMIT,
  MOVE_PINNED_NOTE_ROLLBACK, CANCEL_DIED_PINS, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

/* {
  [note-id-1]: { status, rank, addedDT, id },
  [note-id-2]: { status, rank, addedDT, id },
  ...
} */
const initialState = {};

const pendingPinsReducer = (state = initialState, action) => {

  if (action.type === PIN_NOTE || action.type === UNPIN_NOTE) {
    const { pins } = action.payload;

    const newState = { ...state };
    for (const pin of pins) newState[pin.id] = { ...pin, status: action.type };

    return newState;
  }

  if (action.type === PIN_NOTE_COMMIT || action.type === UNPIN_NOTE_COMMIT) {
    const { successPins, errorPins } = action.payload;

    let errorStatus = PIN_NOTE_ROLLBACK;
    if (action.type === UNPIN_NOTE_COMMIT) errorStatus = UNPIN_NOTE_ROLLBACK;

    const newState = { ...state };
    for (const pin of successPins) delete newState[pin.id];
    for (const pin of errorPins) newState[pin.id] = { ...pin, status: errorStatus };

    if (errorPins.length === 0) {
      addNextAction(cleanUpPins());
      return newState;
    }
    return newState;
  }

  if (action.type === PIN_NOTE_ROLLBACK || action.type === UNPIN_NOTE_ROLLBACK) {
    const { pins } = action.payload;

    const newState = { ...state };
    for (const pin of pins) newState[pin.id] = { ...pin, status: action.type };

    return newState;
  }

  if (action.type === MOVE_PINNED_NOTE) {
    const pin = action.payload;
    return { ...state, [pin.id]: { ...pin, status: action.type } };
  }

  if (action.type === MOVE_PINNED_NOTE_COMMIT) {
    const { successPins, errorPins } = action.payload;

    const newState = { ...state };
    for (const pin of successPins) delete newState[pin.id];
    for (const pin of errorPins) {
      newState[pin.id] = { ...pin, status: MOVE_PINNED_NOTE_ROLLBACK };
    }

    if (errorPins.length === 0) {
      addNextAction(cleanUpPins());
      return newState;
    }
    return newState;
  }

  if (action.type === MOVE_PINNED_NOTE_ROLLBACK) {
    const { rank, updatedDT, addedDT, id } = action.payload;
    return { ...state, [id]: { rank, updatedDT, addedDT, id, status: action.type } };
  }

  if (action.type === CANCEL_DIED_PINS) {
    const newState = {};
    for (const id in state) {
      if ([
        PIN_NOTE_ROLLBACK, UNPIN_NOTE_ROLLBACK, MOVE_PINNED_NOTE_ROLLBACK,
      ].includes(state[id].status)) continue;

      newState[id] = { ...state[id] };
    }
    return newState;
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default pendingPinsReducer;
