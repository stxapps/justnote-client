import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import notesReducer from './notesReducer';
import hasMoreNotesReducer from './hasMoreNotesReducer';
import isFetchMoreInterrupted from './isFetchMoreInterrupted';
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
import stacksAccessReducer from './stacksAccessReducer';
import snapshotReducer from './snapshotReducer';
import listNameEditorsReducer from './listNameEditorsReducer';
import iapReducer from './iapReducer';
import cachedFPathsReducer from './cachedFPathsReducer';
import pendingPinsReducer from './pendingPinsReducer';
import timePickReducer from './timePickReducer';

const reducers = combineReducers({
  window: windowReducer,
  notes: notesReducer,
  hasMoreNotes: hasMoreNotesReducer,
  isFetchMoreInterrupted: isFetchMoreInterrupted,
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
  stacksAccess: stacksAccessReducer,
  snapshot: snapshotReducer,
  listNameEditors: listNameEditorsReducer,
  iap: iapReducer,
  cachedFPaths: cachedFPathsReducer,
  pendingPins: pendingPinsReducer,
  timePick: timePickReducer,
});

export default reducers;
