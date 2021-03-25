import { combineReducers } from 'redux-loop';

import windowReducer from './windowReducer';
import notesReducer from './notesReducer';
import hasMoreNotesReducer from './hasMoreNotesReducer';
import isFetchingMoreNotesReducer from './isFetchingMoreNotesReducer';
import conflictedNotesReducer from './conflictedNotesReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import settingsReducer from './settingsReducer';
import settingsFPathReducer from './settingsFPathReducer';
import serverFPathsReducer from './serverFPathsReducer';

const reducers = combineReducers({
  window: windowReducer,
  notes: notesReducer,
  hasMoreNotes: hasMoreNotesReducer,
  isFetchingMoreNotes: isFetchingMoreNotesReducer,
  conflictedNotes: conflictedNotesReducer,
  display: displayReducer,
  user: userReducer,
  settings: settingsReducer,
  settingsFPath: settingsFPathReducer,
  serverFPaths: serverFPathsReducer,
});

export default reducers;
