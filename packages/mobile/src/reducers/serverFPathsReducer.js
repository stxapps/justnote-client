import { loop, Cmd } from 'redux-loop';

import { tryUpdateSynced } from '../actions';
import { SYNC_COMMIT, DELETE_ALL_DATA, RESET_STATE } from '../types/actionTypes';

export const initialState = {
  noteFPaths: null,
  staticFPaths: null,
  settingsFPath: null,
};

const serverFPathsReducer = (state = initialState, action) => {

  if (action.type === SYNC_COMMIT) {
    const { serverFPaths } = action.payload;
    const newState = {
      ...state,
      noteFPaths: serverFPaths.noteFPaths,
      staticFPaths: serverFPaths.staticFPaths,
      settingsFPath: serverFPaths.settingsFPath,
    };

    const { updateAction, haveUpdate } = action.payload;

    return loop(
      newState,
      Cmd.run(
        tryUpdateSynced(updateAction, haveUpdate), { args: [Cmd.dispatch, Cmd.getState] }
      )
    );
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default serverFPathsReducer;
