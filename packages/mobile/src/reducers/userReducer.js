import { INIT, UPDATE_USER, RESET_STATE } from '../types/actionTypes';
import vars from '../vars';

const initialState = {
  isUserSignedIn: null,
  isUserDummy: false,
  username: null,
  image: null,
  hubUrl: null,
};

const userReducer = (state = initialState, action) => {

  if (action.type === INIT) {
    vars.user.hubUrl = action.payload.userHubUrl;
    return {
      ...state,
      isUserSignedIn: action.payload.isUserSignedIn,
      isUserDummy: action.payload.isUserDummy,
      username: action.payload.username,
      image: action.payload.userImage,
      hubUrl: action.payload.userHubUrl,
    };
  }

  if (action.type === UPDATE_USER) {
    if ('hubUrl' in action.payload) vars.user.hubUrl = action.payload.hubUrl;
    return { ...state, ...action.payload };
  }

  if (action.type === RESET_STATE) {
    vars.user.hubUrl = initialState.hubUrl;
    return { ...initialState, isUserSignedIn: false };
  }

  return state;
};

export default userReducer;
