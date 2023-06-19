import platformWrapper from './platformWrapper';

export const didChange = {
  doDeleteOldNotesInTrash: false,
  sortOn: false,
  doDescendingOrder: false,
  noteDateShowingMode: false,
  noteDateFormat: false,
  doSectionNotesByMonth: false,
  doMoreEditorFontSizes: false,
  listNameMap: false,
  purchases: false,
};

export const cachedFPaths = {
  fpaths: null,
};

export const cachedServerFPaths = {
  fpaths: null,
};

const scrollPanel = {
  contentHeight: 0,
  layoutHeight: 0,
  pageYOffset: 0,
};

const keyboard = {
  height: 0,
};

const runAfterFetchTask = {
  didRun: false,
};

const randomHouseworkTasks = {
  dt: 0,
};

const updateNoteIdUrlHash = {
  didCall: false,
};

const updateNoteId = {
  dt: 0,
  updatingNoteId: null,
};

const changeListName = {
  changingListName: null,
};

const updateBulkEdit = {
  selectedNoteId: null,
};

const showNoteListMenuPopup = {
  selectedRect: null,
};

const showNLIMPopup = {
  selectedNoteId: null,
  selectedRect: null,
};

const deleteOldNotes = {
  ids: null,
};

const updateSettings = {
  doFetch: false,
};

const updateSettingsPopup = {
  didCall: false,
};

const notesReducer = {
  interveningNoteIds: {},
};

const displayReducer = {
  doRightPanelAnimateHidden: false,
};

const editorReducer = {
  didRetryMovingNote: false,
  didClickEditUnsaved: false,
  didIncreaseBlurCount: false,
};

const iap = {
  didGetProducts: false,
  updatedEventEmitter: null,
  errorEventEmitter: null,
};

const platform = {
  isReactNative: platformWrapper.isReactNative,
};

export const syncMode = {
  doSyncMode: platform.isReactNative ? true : false,
  didChange: false,
};

const sync = {
  isSyncing: false,
  newSyncObj: null,
  lastSyncDT: 0,
};

export const getCachedFPaths = () => {
  return syncMode.doSyncMode ? cachedFPaths : cachedServerFPaths;
};

const importAllData = {
  didPick: false,
};

const deleteSyncData = {
  isDeleting: false,
};

const vars = {
  cachedFPaths, cachedServerFPaths, scrollPanel, keyboard, runAfterFetchTask,
  randomHouseworkTasks, updateNoteIdUrlHash, updateNoteId, changeListName,
  updateBulkEdit, showNoteListMenuPopup, showNLIMPopup, deleteOldNotes, updateSettings,
  updateSettingsPopup, notesReducer, displayReducer, editorReducer, iap, platform,
  syncMode, sync, importAllData, deleteSyncData,
};
export default vars;
