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
    for (const pin of pins) newState[pin.id] = { status: action.type, ...pin };

    return newState;
  }

  if (action.type === PIN_NOTE_COMMIT || action.type === UNPIN_NOTE_COMMIT) {
    const { pins } = action.payload;

    const newState = { ...state };
    for (const pin of pins) delete newState[pin.id];

    return newState;
  }

  if (action.type === PIN_NOTE_ROLLBACK || action.type === UNPIN_NOTE_ROLLBACK) {
    const { pins } = action.payload;

    const newState = { ...state };
    for (const pin of pins) newState[pin.id] = { status: action.type, ...pin };

    return newState;
  }

  if (action.type === MOVE_PINNED_NOTE) {
    const pin = action.payload;
    return { ...state, [pin.id]: { status: action.type, ...pin } };
  }

  if (action.type === MOVE_PINNED_NOTE_COMMIT) {
    const { id } = action.payload;

    const newState = { ...state }
    delete newState[id];

    return newState;
  }

  if (action.type === MOVE_PINNED_NOTE_ROLLBACK) {
    const pin = action.payload;
    return { ...state, [pin.id]: { status: action.type, ...pin } };
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
