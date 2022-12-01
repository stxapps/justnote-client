export const didChange = {
  doDeleteOldNotesInTrash: false,
  sortOn: false,
  doDescendingOrder: false,
  noteDateShowingMode: false,
  doSectionNotesByMonth: false,
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

export const paywallFeature = {
  feature: null,
};

const vars = {
  cachedFPaths, cachedServerFPaths, scrollPanel, updateNoteId, changeListName,
  updateBulkEdit, showNoteListMenuPopup, showNLIMPopup, deleteOldNotes, updateSettings,
  paywallFeature,
};
export default vars;
