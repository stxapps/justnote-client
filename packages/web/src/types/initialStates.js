import { MY_NOTES, TRASH, ARCHIVE, ADDED_DT, MODE_VIEW } from '../types/const';

export const myNotesListNameObj = { listName: MY_NOTES, displayName: MY_NOTES };
export const trashListNameObj = { listName: TRASH, displayName: TRASH };
export const archiveListNameObj = { listName: ARCHIVE, displayName: ARCHIVE };

export const initialSettingsState = {
  doDeleteOldNotesInTrash: true,
  sortOn: ADDED_DT,
  doDescendingOrder: true,
  doAlertScreenRotation: true, // No need anymore but keep it for comparing
  listNameMap: [
    { ...myNotesListNameObj }, { ...trashListNameObj }, { ...archiveListNameObj },
  ],
  purchases: null, // an array with elements as purchase objs
  checkPurchasesDT: null,
};

export const initialListNameEditorState = {
  mode: MODE_VIEW,
  value: '',
  msg: '',
  isCheckingCanDelete: false,
  doExpand: false,
  focusCount: 0,
};
