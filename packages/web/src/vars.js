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

const updateNoteIdUrlHash = {
  didCall: false,
};

const updateNoteId = {
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

const displayReducer = {
  doRightPanelAnimateHidden: false,
};

const editorReducer = {
  didRetryMovingNote: false,
  didClickEditUnsaved: false,
};

export const syncMode = {
  doSyncMode: false,
};

export const getCachedFPaths = () => {
  return syncMode.doSyncMode ? cachedFPaths : cachedServerFPaths;
};

const vars = {
  cachedFPaths, cachedServerFPaths, scrollPanel, keyboard, updateNoteIdUrlHash,
  updateNoteId, changeListName, updateBulkEdit, showNoteListMenuPopup, showNLIMPopup,
  deleteOldNotes, updateSettings, updateSettingsPopup, displayReducer, editorReducer,
  syncMode,
};
export default vars;
