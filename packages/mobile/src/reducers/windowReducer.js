import { INIT, UPDATE_HREF, UPDATE_WINDOW_SIZE } from '../types/actionTypes';

const initialState = {
  href: null,
  width: null,
  height: null,
};

const windowReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    return {
      ...state,
      href: action.payload.href,
      width: action.payload.windowWidth,
      height: action.payload.windowHeight,
    };
  }

  if (action.type === UPDATE_HREF) {
    return { ...state, href: action.payload };
  }

  if (action.type === UPDATE_WINDOW_SIZE) {
    return {
      ...state,
      width: action.payload.windowWidth,
      height: action.payload.windowHeight,
    };
  }

  return state;
};

export default windowReducer;
