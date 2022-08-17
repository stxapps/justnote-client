import { INIT, UPDATE_HREF, UPDATE_WINDOW_SIZE } from '../types/actionTypes';
import { isNumber } from '../utils';

const initialState = {
  href: null,
  width: (window && isNumber(window.innerWidth)) ? window.innerWidth : null,
  height: (window && isNumber(window.innerHeight)) ? window.innerHeight : null,
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
