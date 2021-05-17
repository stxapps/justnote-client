import { MY_NOTES, TRASH, ARCHIVE, ADDED, ADDED_DT } from '../types/const';

export const initialSettingsState = {
  doDeleteOldNotesInTrash: true,
  sortOn: ADDED_DT,
  doDescendingOrder: true,
  doAlertScreenRotation: true,
  listNameMap: [
    { listName: MY_NOTES, displayName: MY_NOTES, status: ADDED },
    { listName: TRASH, displayName: TRASH, status: ADDED },
    { listName: ARCHIVE, displayName: ARCHIVE, status: ADDED },
  ],
};
