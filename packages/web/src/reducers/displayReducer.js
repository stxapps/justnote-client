import { UPDATE_HANDLING_SIGN_IN, RESET_STATE } from '../types/actionTypes';

const initialState = {
  isHandlingSignIn: false,
};

const displayReducer = (state = initialState, action) => {

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default displayReducer;
