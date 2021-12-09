import { MY_NOTES, TRASH, ARCHIVE, ADDED_DT, MODE_VIEW } from '../types/const';

export const initialSettingsState = {
  doDeleteOldNotesInTrash: true,
  sortOn: ADDED_DT,
  doDescendingOrder: true,
  doAlertScreenRotation: true,
  listNameMap: [
    { listName: MY_NOTES, displayName: MY_NOTES },
    { listName: TRASH, displayName: TRASH },
    { listName: ARCHIVE, displayName: ARCHIVE },
  ],
};

export const initialListNameEditorState = {
  mode: MODE_VIEW,
  value: '',
  msg: '',
  isCheckingCanDelete: false,
  doExpand: false,
  focusCount: 0,
};
