import { UPDATE_POPUP, UPDATE_STACKS_ACCESS } from '../types/actionTypes';
import { SIGN_UP_POPUP, SIGN_IN_POPUP } from '../types/const';

const initialState = {
  // As transfer btw RN and Webview, all values are string
  viewId: '1',
  walletData: '',
};

const stacksAccessReducer = (state = initialState, action) => {

  if (action.type === UPDATE_STACKS_ACCESS) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if ([SIGN_UP_POPUP, SIGN_IN_POPUP].includes(id) && isShown) {
      return { ...initialState };
    }
    return state;
  }

  return state;
};

export default stacksAccessReducer;
