import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_PAGE_Y_OFFSET,
} from '../types/actionTypes';

const initialState = {
  width: null,
  height: null,
  pageYOffset: 0,
};

const windowReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    return {
      ...state,
      width: action.payload.windowWidth,
      height: action.payload.windowHeight,
    };
  }

  if (action.type === UPDATE_WINDOW_SIZE) {
    return {
      ...state,
      width: action.payload.windowWidth,
      height: action.payload.windowHeight,
    };
  }

  if (action.type === UPDATE_PAGE_Y_OFFSET) {
    return { ...state, pageYOffset: action.payload };
  }

  return state;
};

export default windowReducer;
