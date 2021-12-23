import { INIT, UPDATE_USER, RESET_STATE } from '../types/actionTypes';

const initialState = {
  isUserSignedIn: null,
  isUserDummy: false,
  username: null,
  image: null,
};

const userReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    return {
      ...state,
      isUserSignedIn: action.payload.isUserSignedIn,
      isUserDummy: action.payload.isUserDummy,
      username: action.payload.username,
      image: action.payload.userImage,
    };
  }

  if (action.type === UPDATE_USER) {
    return { ...state, ...action.payload };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState, isUserSignedIn: false };
  }

  return state;
};

export default userReducer;
