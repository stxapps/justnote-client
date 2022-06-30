import { RESET_STATE } from '../types/actionTypes';
import { copyFPaths } from '../utils';
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
    return { ...state, fpaths: copyFPaths(cachedFPaths.fpaths) };
  }

  return state;
};

export default cachedFPathsReducer;
