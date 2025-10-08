import { INCREASE_REDIRECT_TO_MAIN_COUNT } from '../types/actionTypes';

const initialState = {
  redirectToMainCount: 0,
};

const appStateReducer = (state = initialState, action) => {
  if (action.type === INCREASE_REDIRECT_TO_MAIN_COUNT) {
    return { ...state, redirectToMainCount: state.redirectToMainCount + 1 };
  }

  return state;
};

export default appStateReducer;
