import { UPDATE_HANDLING_SIGN_IN, RESET_STATE } from '../types/actionTypes';

import {
  UPDATE_POPUP,
} from '../types/actionTypes';
import {
  PROFILE_POPUP,
} from '../types/const';

const initialState = {
  isHandlingSignIn: false,
  isProfilePopupShown: false,
  profilePopupPosition: null,
};

const displayReducer = (state = initialState, action) => {

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
  }

  if (action.type === UPDATE_POPUP) {

    const { id, isShown, anchorPosition } = action.payload;

    if (id === PROFILE_POPUP) {
      return {
        ...state, isProfilePopupShown: isShown, profilePopupPosition: anchorPosition,
      };
    }

    throw new Error(`Invalid type: ${action.type} and payload: ${action.payload}`);
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default displayReducer;
