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
  tagNameMap: false,
  purchases: false,
  newTagNameObjs: [],
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
  scrollY: 0,
};

const keyboard = {
  height: 0,
};

const fetch = {
  fetchedLnOrQts: [],
  fetchedNoteIds: [],
  doShowLoading: false,
  doForce: false,
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

const updateQueryString = {
  updatingQueryString: null,
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

const showUNEPopup = {
  selectedNoteId: null,
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
  didReload: false,
};

const sync = {
  updateAction: Infinity,
  haveUpdate: false,
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

const appState = {
  lastChangeDT: Date.now(),
};

const vars = {
  cachedFPaths, cachedServerFPaths, scrollPanel, keyboard, fetch, runAfterFetchTask,
  randomHouseworkTasks, updateNoteIdUrlHash, updateNoteId, changeListName,
  updateQueryString, updateBulkEdit, showNoteListMenuPopup, showNLIMPopup, showUNEPopup,
  deleteOldNotes, updateSettings, updateSettingsPopup, notesReducer, displayReducer,
  editorReducer, iap, platform, syncMode, sync, importAllData, deleteSyncData, appState,
};
export default vars;
