let walletApi;
const importWalletApi = async () => {
  if (walletApi) return;
  walletApi = await import('./apis/wallet');
};

export const walletCreateAccount = async (appData) => {
  await importWalletApi();
  return walletApi.createAccount(appData);
};

export const walletRestoreAccount = async (appData, secretKey) => {
  await importWalletApi();
  return walletApi.restoreAccount(appData, secretKey);
};

export const walletChooseAccount = async (walletData, accountIndex) => {
  await importWalletApi();
  return walletApi.chooseAccount(walletData, accountIndex);
};

let actionChunk;
const importActionChunk = async () => {
  if (actionChunk) return;
  actionChunk = await import('./actions/chunk');
};

export const updateHubAddr = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateHubAddr());
};

export const tryUpdateFetched = (payload) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateFetched(payload));
};

export const tryUpdateFetchedMore = (payload) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateFetchedMore(payload));
};

export const cleanUpSslts = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.cleanUpSslts());
};

export const runAfterFetchTask = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.runAfterFetchTask());
};

export const updateStgsAndInfo = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateStgsAndInfo());
};

export const tryUpdateInfo = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateInfo());
};

export const tryUpdateSynced = (updateAction, haveUpdate) => async (
  dispatch, getState
) => {
  await importActionChunk();
  dispatch(actionChunk.tryUpdateSynced(updateAction, haveUpdate));
};

export const unpinNotes = (ids, doSync = false) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.unpinNotes(ids, doSync));
};

export const cleanUpPins = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.cleanUpPins());
};

export const updateTagDataTStep = (ids, valuesPerId) => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.updateTagDataTStep(ids, valuesPerId));
};

export const cleanUpTags = () => async (dispatch, getState) => {
  await importActionChunk();
  dispatch(actionChunk.cleanUpTags());
};

let zip;
export const importZip = async () => {
  if (zip) return zip;
  zip = await import('@zip.js/zip.js');
  return zip;
};
