import { RESET_STATE } from '../types/actionTypes';
import { isObject, copyFPaths } from '../utils';
import { getCachedFPaths } from '../vars';

const initialState = {
  fpaths: null,
};

let fpathsRef = null;
const cachedFPathsReducer = (state = initialState, action) => {

  // Only RESET_STATE, no need to reset state for DELETE_ALL_DATA
  if (action.type === RESET_STATE) {
    fpathsRef = getCachedFPaths().fpaths;
    return { ...initialState };
  }

  if (fpathsRef !== getCachedFPaths().fpaths) {
    // No new object for fpaths for reference comparison
    fpathsRef = getCachedFPaths().fpaths;

    const newState = { ...state, fpaths: getCachedFPaths().fpaths };
    if (isObject(getCachedFPaths().fpaths)) {
      newState.fpaths = copyFPaths(getCachedFPaths().fpaths);
    }
    return newState;
  }

  return state;
};

export default cachedFPathsReducer;
