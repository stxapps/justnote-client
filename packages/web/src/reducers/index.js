import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import notesReducer from './notesReducer';
import fetchedMoreReducer from './fetchedMoreReducer';
import conflictedNotesReducer from './conflictedNotesReducer';
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
import pendingPinsReducer from './pendingPinsReducer';
import pendingTagsReducer from './pendingTagsReducer';
import timePickReducer from './timePickReducer';
import lockSettingsReducer from './lockSettingsReducer';
import lockEditorReducer from './lockEditorReducer';

const reducers = combineReducers({
  window: windowReducer,
  notes: notesReducer,
  fetchedMore: fetchedMoreReducer,
  conflictedNotes: conflictedNotesReducer,
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
  pendingPins: pendingPinsReducer,
  pendingTags: pendingTagsReducer,
  timePick: timePickReducer,
  lockSettings: lockSettingsReducer,
  lockEditor: lockEditorReducer,
});

export default reducers;
