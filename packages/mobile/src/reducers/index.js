import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import notesReducer from './notesReducer';
import hasMoreNotesReducer from './hasMoreNotesReducer';
import isFetchingMoreNotesReducer from './isFetchingMoreNotesReducer';
import fetchedMoreReducer from './fetchedMoreReducer';
import conflictedNotesReducer from './conflictedNotesReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';
import serverFPathsReducer from './serverFPathsReducer';
import editorReducer from './editorReducer';
import stacksAccessReducer from './stacksAccessReducer';
import snapshotReducer from './snapshotReducer';
import listNameEditorsReducer from './listNameEditorsReducer';
import iapReducer from './iapReducer';
import cachedFPathsReducer from './cachedFPathsReducer';
import pendingPinsReducer from './pendingPinsReducer';

const reducers = combineReducers({
  window: windowReducer,
  notes: notesReducer,
  hasMoreNotes: hasMoreNotesReducer,
  isFetchingMoreNotes: isFetchingMoreNotesReducer,
  fetchedMore: fetchedMoreReducer,
  conflictedNotes: conflictedNotesReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
  serverFPaths: serverFPathsReducer,
  editor: editorReducer,
  stacksAccess: stacksAccessReducer,
  snapshot: snapshotReducer,
  listNameEditors: listNameEditorsReducer,
  iap: iapReducer,
  cachedFPaths: cachedFPathsReducer,
  pendingPins: pendingPinsReducer,
});

export default reducers;
