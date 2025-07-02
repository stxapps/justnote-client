import { combineReducers } from 'redux';

import windowReducer from './windowReducer';
import conflictedNotesReducer from './conflictedNotesReducer';
import notesReducer from './notesReducer';
import fetchedMoreReducer from './fetchedMoreReducer';
import unsavedNotesReducer from './unsavedNotesReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';
import conflictedSettingsReducer from './conflictedSettingsReducer';
import localSettingsReducer from './localSettingsReducer';
import infoReducer from './infoReducer';
import editorReducer from './editorReducer';
import tagEditorReducer from './tagEditorReducer';
import stacksAccessReducer from './stacksAccessReducer';
import snapshotReducer from './snapshotReducer';
import listNameEditorsReducer from './listNameEditorsReducer';
import tagNameEditorsReducer from './tagNameEditorsReducer';
import iapReducer from './iapReducer';
import cachedFPathsReducer from './cachedFPathsReducer';
import pendingSsltsReducer from './pendingSsltsReducer';
import pendingPinsReducer from './pendingPinsReducer';
import pendingTagsReducer from './pendingTagsReducer';
import timePickReducer from './timePickReducer';
import lockSettingsReducer from './lockSettingsReducer';
import lockEditorReducer from './lockEditorReducer';

const reducers = combineReducers({
  window: windowReducer,
  conflictedNotes: conflictedNotesReducer,
  notes: notesReducer,
  fetchedMore: fetchedMoreReducer,
  unsavedNotes: unsavedNotesReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
  conflictedSettings: conflictedSettingsReducer,
  localSettings: localSettingsReducer,
  info: infoReducer,
  editor: editorReducer,
  tagEditor: tagEditorReducer,
  stacksAccess: stacksAccessReducer,
  snapshot: snapshotReducer,
  listNameEditors: listNameEditorsReducer,
  tagNameEditors: tagNameEditorsReducer,
  iap: iapReducer,
  cachedFPaths: cachedFPathsReducer,
  pendingSslts: pendingSsltsReducer,
  pendingPins: pendingPinsReducer,
  pendingTags: pendingTagsReducer,
  timePick: timePickReducer,
  lockSettings: lockSettingsReducer,
  lockEditor: lockEditorReducer,
});

export default reducers;
