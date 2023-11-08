import {
  MY_NOTES, TRASH, ARCHIVE, ADDED_DT, MODE_VIEW, NOTE_DATE_SHOWING_MODE_HIDE,
  NOTE_DATE_FORMAT_SYSTEM, WHT_MODE, BLK_MODE,
} from '../types/const';
import vars from '../vars';

export const myNotesListNameObj = { listName: MY_NOTES, displayName: MY_NOTES };
export const trashListNameObj = { listName: TRASH, displayName: TRASH };
export const archiveListNameObj = { listName: ARCHIVE, displayName: ARCHIVE };

export const whtModeThemeCustomOptions = { mode: WHT_MODE, startTime: '06:00' };
export const blkModeThemeCustomOptions = { mode: BLK_MODE, startTime: '18:00' };

export const initialSettingsState = {
  doDeleteOldNotesInTrash: true,
  sortOn: ADDED_DT,
  doDescendingOrder: true,
  doAlertScreenRotation: true, // No need anymore but keep it for comparing
  noteDateShowingMode: NOTE_DATE_SHOWING_MODE_HIDE,
  noteDateFormat: NOTE_DATE_FORMAT_SYSTEM,
  noteDateIsTwoDigit: false,
  noteDateIsCurrentYearShown: false,
  doSectionNotesByMonth: false,
  doMoreEditorFontSizes: false,
  listNameMap: [
    { ...myNotesListNameObj }, { ...trashListNameObj }, { ...archiveListNameObj },
  ],
  tagNameMap: [],
  purchases: null, // No need anymore but keep it for comparing
  checkPurchasesDT: null, // No need anymore but keep it for comparing
  themeMode: WHT_MODE,
  themeCustomOptions: [
    { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
  ],
};

export const initialLocalSettingsState = {
  doSyncMode: vars.platform.isReactNative ? true : false,
  doSyncModeInput: vars.platform.isReactNative ? true : false,
  doUseLocalTheme: false,
  themeMode: WHT_MODE,
  themeCustomOptions: [
    { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
  ],
  cleanUpStaticFilesDT: null,
  // Below is duplicate from Info for Loading to support Dark appearance.
  purchases: null,
  // Below is duplicate from Settings for Loading to support Dark appearance.
  defaultThemeMode: WHT_MODE,
  defaultThemeCustomOptions: [
    { ...whtModeThemeCustomOptions }, { ...blkModeThemeCustomOptions },
  ],
  signInDT: null,
};

export const initialInfoState = {
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
  blurCount: 0,
};

export const initialLockSettingsState = {
  lockedNotes: {},
  lockedLists: {},
};

export const initialTagNameEditorState = {
  mode: MODE_VIEW,
  value: '',
  color: '',
  msg: '',
  isCheckingCanDelete: false,
  focusCount: 0,
  blurCount: 0,
};
