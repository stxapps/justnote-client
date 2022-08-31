import { RESET_STATE } from '../types/actionTypes';
import { isObject, copyFPaths } from '../utils';
import { cachedFPaths } from '../vars';

const initialState = {
  fpaths: null,
};

let fpathsRef = null;
const cachedFPathsReducer = (state = initialState, action) => {

  // Only RESET_STATE, no need to reset state for DELETE_ALL_DATA
  if (action.type === RESET_STATE) {
    cachedFPaths.fpaths = null;
    fpathsRef = cachedFPaths.fpaths;
    return { ...initialState };
  }

  if (fpathsRef !== cachedFPaths.fpaths) {
    // No new object for fpaths for reference comparison
    fpathsRef = cachedFPaths.fpaths;

    const newState = { ...state, fpaths: cachedFPaths.fpaths };
    if (isObject(cachedFPaths.fpaths)) newState.fpaths = copyFPaths(cachedFPaths.fpaths);
    return newState;
  }

  return state;
};

export default cachedFPathsReducer;
