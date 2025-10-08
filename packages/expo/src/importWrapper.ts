import * as actionChunk from './actions/chunk';

export const updateHubAddr = () => async (dispatch, getState) => {
  dispatch(actionChunk.updateHubAddr());
};

export const tryUpdateFetched = (payload) => async (dispatch, getState) => {
  dispatch(actionChunk.tryUpdateFetched(payload));
};

export const tryUpdateFetchedMore = (payload) => async (dispatch, getState) => {
  dispatch(actionChunk.tryUpdateFetchedMore(payload));
};

export const cleanUpSslts = () => async (dispatch, getState) => {
  dispatch(actionChunk.cleanUpSslts());
};

export const runAfterFetchTask = () => async (dispatch, getState) => {
  dispatch(actionChunk.runAfterFetchTask());
};

export const updateStgsAndInfo = () => async (dispatch, getState) => {
  dispatch(actionChunk.updateStgsAndInfo());
};

export const tryUpdateInfo = () => async (dispatch, getState) => {
  dispatch(actionChunk.tryUpdateInfo());
};

export const sync = (doForceListFPaths = false, updateAction = 0) => async (
  dispatch, getState
) => {
  dispatch(actionChunk.sync(doForceListFPaths, updateAction));
};

export const tryUpdateSynced = (updateAction, haveUpdate) => async (
  dispatch, getState
) => {
  dispatch(actionChunk.tryUpdateSynced(updateAction, haveUpdate));
};

export const unpinNotes = (ids, doSync = false) => async (dispatch, getState) => {
  dispatch(actionChunk.unpinNotes(ids, doSync));
};

export const cleanUpPins = () => async (dispatch, getState) => {
  dispatch(actionChunk.cleanUpPins());
};

export const updateTagDataTStep = (ids, valuesPerId) => async (dispatch, getState) => {
  dispatch(actionChunk.updateTagDataTStep(ids, valuesPerId));
};

export const cleanUpTags = () => async (dispatch, getState) => {
  dispatch(actionChunk.cleanUpTags());
};
